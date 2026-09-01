import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { drawResults } from "@/db/schema";
import { eventRepository, productRepository } from "@/repository";
import { executeMultipleDraw } from "@/lib/draw";

const MAX_QUANTITY = 10000;

interface DrawResultItem {
  isWin: boolean;
  product: {
    id: number;
    name: string;
    description?: string | null;
    imageUrl?: string | null;
  } | null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventId } = body;
    const quantity = Number(body.quantity ?? 1);

    if (!eventId) {
      return NextResponse.json(
        { error: "이벤트 ID가 필요합니다." },
        { status: 400 },
      );
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      return NextResponse.json(
        { error: `추첨 수량은 1 이상 ${MAX_QUANTITY} 이하여야 합니다.` },
        { status: 400 },
      );
    }

    const event = await eventRepository.findById(eventId);

    if (!event) {
      return NextResponse.json(
        { error: "이벤트를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    if (!event.isActive) {
      return NextResponse.json(
        { error: "비활성화된 이벤트입니다." },
        { status: 400 },
      );
    }

    // 상품 한 번만 조회
    const eventProducts = await productRepository.findByEventId(eventId);

    // 메모리에서 복수 추첨 실행 (DB 호출 없음)
    const drawResultsData = executeMultipleDraw(eventProducts, quantity);

    // 상품별 당첨 횟수 집계
    const stockDecrements: Record<number, number> = {};
    for (const result of drawResultsData) {
      if (result.isWin && result.product) {
        stockDecrements[result.product.id] =
          (stockDecrements[result.product.id] || 0) + 1;
      }
    }

    const insertValues = drawResultsData.map((result) => ({
      eventId,
      productId: result.product?.id || null,
      isWin: result.isWin,
      productName: result.product?.name || null,
    }));

    // 재고 차감과 결과 기록을 한 트랜잭션으로 묶는다.
    // 이 둘이 갈라지면 "히스토리에 없음"이 "재고 차감 안 됨"을 보장하지 못하고,
    // 응답을 못 받은 클라이언트의 복구 판단(GET .../batches)이 거짓말을 하게 된다.
    const drawnAt = await db.transaction(async (tx) => {
      await productRepository.batchDecrementStock(stockDecrements, tx);

      const [inserted] = await tx.insert(drawResults).values(insertValues);

      // created_at 은 DB 가 채운다(단일 INSERT → 전 행 동일값 = 배치 ID).
      // 앱 시계로 쓰면 DB 와 어긋날 수 있어 넣은 값을 되읽는다.
      const [row] = await tx
        .select({ createdAt: drawResults.createdAt })
        .from(drawResults)
        .where(eq(drawResults.id, inserted.insertId))
        .limit(1);

      return row.createdAt;
    });

    // 응답 형식 변환
    const results: DrawResultItem[] = drawResultsData.map((result) => ({
      isWin: result.isWin,
      product:
        result.isWin && result.product
          ? {
              id: result.product.id,
              name: result.product.name,
              description: result.product.description,
              imageUrl: result.product.imageUrl,
            }
          : null,
    }));

    const updatedProducts = await productRepository.findByEventId(eventId);

    const summary: Record<
      string,
      { count: number; product: DrawResultItem["product"] }
    > = {};

    for (const r of results) {
      if (r.isWin && r.product) {
        const key = String(r.product.id);
        if (!summary[key]) {
          summary[key] = { count: 0, product: r.product };
        }
        summary[key].count++;
      }
    }

    return NextResponse.json({
      success: true,
      quantity,
      // 클라이언트가 "이 배치는 내가 확인했다"고 표시하는 워터마크 값
      drawnAt,
      results,
      summary: Object.values(summary),
      updatedProducts,
    });
  } catch (error) {
    console.error("Draw failed:", error);
    return NextResponse.json(
      { error: "럭키드로우 실행에 실패했습니다." },
      { status: 500 },
    );
  }
}
