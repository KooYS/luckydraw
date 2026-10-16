"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { Event, Product, EventTheme } from "@/db/schema";
import { resolveThemeTokens, ResolvedTokens } from "@/lib/themeTokens";
import {
  ack,
  clearPending,
  hasPending,
  markPending,
  readAck,
  shouldRecover,
  type DrawBatch,
} from "@/lib/drawRecovery";

type DrawState = "select" | "drawing" | "result";

/** 추첨 실패 후 히스토리로 판정한 상태 */
type DrawError =
  | "safe" // 히스토리에 없음 = 재고 차감 안 됨. 그냥 재시도하면 된다
  | "unknown"; // 히스토리 조회조차 실패. 사람이 재고를 확인해야 한다

interface DrawSummary {
  count: number;
  product: {
    id: number;
    name: string;
    description?: string | null;
    imageUrl?: string | null;
  };
}

interface ProductWithProbability extends Product {
  realTimeProbability: string;
}

interface UseLuckyDrawOptions {
  eventId: string;
  onThemeChange?: (theme: EventTheme) => void;
}

/** 럭키드로우 훅 반환 타입 */
interface UseLuckyDrawReturn {
  state: {
    event: Event | null;
    products: Product[];
    loading: boolean;
    drawState: DrawState;
    quantity: number;
    summary: DrawSummary[];
    /** 응답을 못 받아 히스토리에서 복구한 배치 (평상시 null) */
    recovered: DrawBatch | null;
    error: DrawError | null;
  };
  computed: {
    totalStock: number;
    hasStock: boolean;
    productsWithProbability: ProductWithProbability[];
    hasPoster: boolean;
    colors: ResolvedTokens;
  };
  actions: {
    setQuantity: (qty: number) => void;
    incrementQuantity: () => void;
    decrementQuantity: () => void;
    quickIncrement: (qty: number) => void;
    executeDraw: () => Promise<void>;
    reset: () => void;
  };
}

const DRAW_TIMEOUT_MS = 30_000;
const LOAD_TIMEOUT_MS = 15_000;

// 응답이 끊긴 시점에 서버는 아직 커밋 중일 수 있다. 한 번 놓쳤다고 바로
// "차감 안 됐다"고 말하면 운영자가 재실행하고, 재고가 두 번 빠진다 — 원래 사고와 같은 결말.
const RECHECK_DELAY_MS = 3_000;

/** 배치 이력 → 결과 화면이 쓰는 summary (이미지는 로드된 상품에서 채운다) */
function toSummary(batch: DrawBatch, products: Product[]): DrawSummary[] {
  return batch.items
    .filter((item) => item.productId !== null)
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        count: item.count,
        product: {
          id: item.productId as number,
          name: product?.name ?? item.productName ?? "",
          description: product?.description,
          imageUrl: product?.imageUrl,
        },
      };
    });
}

/** 럭키드로우 비즈니스 로직 훅 */
export function useLuckyDraw({
  eventId,
  onThemeChange,
}: UseLuckyDrawOptions): UseLuckyDrawReturn {
  const [event, setEvent] = useState<Event | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawState, setDrawState] = useState<DrawState>("select");
  const [quantity, setQuantity] = useState(0);
  const [summary, setSummary] = useState<DrawSummary[]>([]);
  const [recovered, setRecovered] = useState<DrawBatch | null>(null);
  const [error, setError] = useState<DrawError | null>(null);
  const inFlight = useRef(false);

  /** 실시간 확률 계산 */
  const calculateRealTimeProbabilities =
    useCallback((): ProductWithProbability[] => {
      const availableProducts = products.filter((p) => p.remainingQuantity > 0);
      const totalRemainingQuantity = availableProducts.reduce(
        (sum, p) => sum + p.remainingQuantity,
        0,
      );

      return products.map((p) => ({
        ...p,
        realTimeProbability:
          p.remainingQuantity > 0 && totalRemainingQuantity > 0
            ? ((p.remainingQuantity / totalRemainingQuantity) * 100).toFixed(1)
            : "0.0",
      }));
    }, [products]);

  /** 이 화면이 결과를 못 받은 배치 조회. 없으면 null, 조회 실패면 throw */
  const findUnackedBatch = useCallback(async (): Promise<DrawBatch | null> => {
    // 이 화면이 추첨을 쏜 적이 없으면 볼 것도 없다 (병렬로 띄운 다른 화면 보호)
    if (!hasPending(eventId)) return null;

    const res = await fetch(`/api/events/${eventId}/batches?limit=1`, {
      cache: "no-store",
      signal: AbortSignal.timeout(LOAD_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`batches ${res.status}`);

    const latest: DrawBatch | undefined = (await res.json()).batches?.[0];
    const state = { pending: hasPending(eventId), acked: readAck(eventId) };
    return shouldRecover(latest, state) ? latest! : null;
  }, [eventId]);

  const fetchProducts = useCallback(async (): Promise<Product[]> => {
    const res = await fetch(`/api/events/${eventId}/products`, {
      cache: "no-store",
      signal: AbortSignal.timeout(LOAD_TIMEOUT_MS),
    });
    return res.json();
  }, [eventId]);

  /** 이벤트 및 상품 데이터 로드 + 미확인 배치 확인 */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [eventData, productsData] = await Promise.all([
          fetch(`/api/events/${eventId}`, {
            signal: AbortSignal.timeout(LOAD_TIMEOUT_MS),
          }).then((res) => res.json()),
          fetchProducts(),
        ]);
        if (cancelled) return;

        setEvent(eventData);
        setProducts(productsData);

        if (eventData && !eventData.error && onThemeChange) {
          onThemeChange({
            primaryColor: eventData.primaryColor,
            secondaryColor: eventData.secondaryColor,
            backgroundColor: eventData.backgroundColor,
            textColor: eventData.textColor,
            subTextColor: eventData.subTextColor,
            accentColor: eventData.accentColor,
            posterUrl: eventData.posterUrl,
            logoUrl: eventData.logoUrl,
          });
        }

        // 직전에 응답을 못 받고 새로고침한 경우, 여기서 바로 결과를 되살린다.
        // 실패해도 페이지는 정상 진입 — 복구는 부가 기능이라 로딩을 막지 않는다.
        const unacked = await findUnackedBatch().catch(() => null);
        if (cancelled) return;
        if (unacked) {
          setRecovered(unacked);
          setDrawState("result");
        }
      } catch {
        // 이벤트 로드 실패 → 아래에서 eventNotFound 화면
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [eventId, onThemeChange, fetchProducts, findUnackedBatch]);

  const totalStock = products.reduce((sum, p) => sum + p.remainingQuantity, 0);
  const hasStock = totalStock > 0;
  const productsWithProbability = calculateRealTimeProbabilities();
  const hasPoster = !!event?.posterUrl;

  const colors = resolveThemeTokens(event, event?.themeTokens);

  const shownSummary = useMemo(
    () => (recovered ? toSummary(recovered, products) : summary),
    [recovered, products, summary],
  );

  /** 럭키드로우 실행 */
  const executeDraw = useCallback(async () => {
    if (quantity === 0 || inFlight.current) return;

    inFlight.current = true;
    // 요청을 쏘기 전에 표시한다 — 이 줄이 먼저여야 응답을 못 받아도 흔적이 남는다.
    markPending(eventId);
    setDrawState("drawing");
    setSummary([]);
    setRecovered(null);
    setError(null);

    try {
      const response = await fetch("/api/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: parseInt(eventId), quantity }),
        signal: AbortSignal.timeout(DRAW_TIMEOUT_MS),
      });
      if (!response.ok) throw new Error(`draw ${response.status}`);

      const data = await response.json();

      ack(eventId, data.drawnAt);
      clearPending(eventId);
      setSummary(data.summary || []);
      setProducts(data.updatedProducts || []);
      setDrawState("result");
    } catch (err) {
      console.error("Draw failed:", err);

      // 응답을 못 받았을 뿐 서버는 이미 커밋했을 수 있다.
      // 차감과 기록이 한 트랜잭션이므로 히스토리가 곧 차감 여부의 증거다.
      // 여기서 판정하지 않으면 운영자가 그냥 재실행해서 재고가 두 번 빠진다.
      try {
        // 한 번 못 찾으면 서버가 늦게 커밋하는 중일 수 있으니 한 번 더 본다.
        // 확인이 끝날 때까지 화면은 "추첨 중"으로 둔다 — 아직 판정이 안 끝났으니까.
        let unacked = await findUnackedBatch();
        if (!unacked) {
          await new Promise((resolve) => setTimeout(resolve, RECHECK_DELAY_MS));
          unacked = await findUnackedBatch();
        }

        if (unacked) {
          const fresh = await fetchProducts().catch(() => null);
          if (fresh) setProducts(fresh);
          setRecovered(unacked);
          setDrawState("result");
          return;
        }
        // 차감 안 된 게 확인됐으니 이 화면의 미결 상태도 해제한다.
        clearPending(eventId);
        setError("safe");
      } catch {
        // 확인 자체가 실패 — pending 을 남겨둬야 새로고침 때 다시 확인한다.
        setError("unknown");
      }
      setDrawState("select");
    } finally {
      inFlight.current = false;
    }
  }, [eventId, quantity, findUnackedBatch, fetchProducts]);

  /** 다시 시작 */
  const reset = useCallback(() => {
    if (recovered) {
      ack(eventId, recovered.drawnAt);
      clearPending(eventId);
    }
    setRecovered(null);
    setDrawState("select");
    setSummary([]);
    setQuantity(0);
    setError(null);
  }, [eventId, recovered]);

  /** 수량 증가 */
  const incrementQuantity = useCallback(() => {
    setQuantity((prev) => Math.min(10000, totalStock, prev + 1));
  }, [totalStock]);

  /** 수량 감소 */
  const decrementQuantity = useCallback(() => {
    setQuantity((prev) => Math.max(0, prev - 1));
  }, []);

  /** 빠른 수량 선택 */
  const quickIncrement = useCallback(
    (qty: number) => {
      setQuantity((prev) => Math.min(prev + qty, totalStock));
    },
    [totalStock],
  );

  /** 수량 직접 설정 */
  const handleSetQuantity = useCallback(
    (qty: number) => {
      setQuantity(Math.max(0, Math.min(totalStock, qty)));
    },
    [totalStock],
  );

  return {
    state: {
      event,
      products,
      loading,
      drawState,
      quantity,
      summary: shownSummary,
      recovered,
      error,
    },
    computed: {
      totalStock,
      hasStock,
      productsWithProbability,
      hasPoster,
      colors,
    },
    actions: {
      setQuantity: handleSetQuantity,
      incrementQuantity,
      decrementQuantity,
      quickIncrement,
      executeDraw,
      reset,
    },
  };
}
