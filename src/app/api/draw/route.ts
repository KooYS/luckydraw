import { NextResponse } from "next/server";
import { db } from "@/db";
import { drawResults } from "@/db/schema";
import { eventRepository, productRepository } from "@/repository";
import { executeMultipleDraw } from "@/lib/draw";

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
    const { eventId, quantity = 1 } = body;

    if (!eventId) {
      return NextResponse.json(
        { error: "이벤트 ID가 필요합니다." },
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

    // 재고 일괄 감소 (상품 수만큼의 쿼리)
    await productRepository.batchDecrementStock(stockDecrements);

    // 결과 일괄 저장 (단일 쿼리)
    const insertValues = drawResultsData.map((result) => ({
      eventId,
      productId: result.product?.id || null,
      isWin: result.isWin,
      productName: result.product?.name || null,
    }));

    if (insertValues.length > 0) {
      await db.insert(drawResults).values(insertValues);
    }

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
