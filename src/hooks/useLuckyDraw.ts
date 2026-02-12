"use client";

import { useState, useCallback, useEffect } from "react";
import { Event, Product, EventTheme } from "@/db/schema";

type DrawState = "select" | "drawing" | "result";

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
  };
  computed: {
    totalStock: number;
    hasStock: boolean;
    productsWithProbability: ProductWithProbability[];
    hasPoster: boolean;
    colors: DrawPageColors;
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

interface DrawPageColors {
  textColor: string;
  textColorMuted: string;
  textColorFaint: string;
  cardBg: string;
  cardBgHover: string;
  buttonBg: string;
  buttonBgHover: string;
  inputBg: string;
  inputText: string;
  infoBg: string;
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

  /** 이벤트 및 상품 데이터 로드 */
  useEffect(() => {
    Promise.all([
      fetch(`/api/events/${eventId}`).then((res) => res.json()),
      fetch(`/api/events/${eventId}/products`).then((res) => res.json()),
    ])
      .then(([eventData, productsData]) => {
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

        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [eventId, onThemeChange]);

  const totalStock = products.reduce((sum, p) => sum + p.remainingQuantity, 0);
  const hasStock = totalStock > 0;
  const productsWithProbability = calculateRealTimeProbabilities();
  const hasPoster = !!event?.posterUrl;

  /** 관리자 설정 색상 + 포스터 유무에 따른 배경 계산 */
  const colors: DrawPageColors = event
    ? {
        textColor: event.textColor,
        textColorMuted: event.subTextColor,
        textColorFaint: `${event.subTextColor}80`,
        cardBg: hasPoster ? "rgba(255,255,255,0.1)" : `${event.accentColor}20`,
        cardBgHover: hasPoster
          ? "rgba(255,255,255,0.2)"
          : `${event.accentColor}30`,
        buttonBg: hasPoster
          ? "rgba(255,255,255,0.2)"
          : `${event.secondaryColor}20`,
        buttonBgHover: hasPoster
          ? "rgba(255,255,255,0.3)"
          : `${event.secondaryColor}30`,
        inputBg: hasPoster ? "#ffffff" : event.backgroundColor,
        inputText: hasPoster ? event.primaryColor : event.textColor,
        infoBg: hasPoster ? "rgba(0,0,0,0.3)" : `${event.secondaryColor}15`,
      }
    : {
        textColor: "#1f2937",
        textColorMuted: "#6b7280",
        textColorFaint: "#9ca3af",
        cardBg: "rgba(0,0,0,0.05)",
        cardBgHover: "rgba(0,0,0,0.1)",
        buttonBg: "rgba(0,0,0,0.1)",
        buttonBgHover: "rgba(0,0,0,0.15)",
        inputBg: "#ffffff",
        inputText: "#1f2937",
        infoBg: "rgba(0,0,0,0.05)",
      };

  /** 럭키드로우 실행 */
  const executeDraw = useCallback(async () => {
    if (quantity === 0) return;

    setDrawState("drawing");
    setSummary([]);

    try {
      const response = await fetch("/api/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: parseInt(eventId), quantity }),
      });

      const data = await response.json();

      setSummary(data.summary || []);
      setProducts(data.updatedProducts || []);
      setDrawState("result");
    } catch (error) {
      console.error("Draw failed:", error);
      setDrawState("select");
    }
  }, [eventId, quantity]);

  /** 다시 시작 */
  const reset = useCallback(() => {
    setDrawState("select");
    setSummary([]);
    setQuantity(0);
  }, []);

  /** 수량 증가 */
  const incrementQuantity = useCallback(() => {
    setQuantity((prev) => Math.min(100, totalStock, prev + 1));
  }, [totalStock]);

  /** 수량 감소 */
  const decrementQuantity = useCallback(() => {
    setQuantity((prev) => Math.max(1, prev - 1));
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
      setQuantity(Math.max(1, Math.min(totalStock, qty)));
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
      summary,
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
