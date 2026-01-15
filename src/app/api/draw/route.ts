import { NextResponse } from "next/server";
import { db } from "@/db";
import { drawResults } from "@/db/schema";
import { eventRepository, productRepository } from "@/repository";
import { executeDraw } from "@/lib/draw";

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
        { status: 400 }
      );
    }

    if (quantity < 1 || quantity > 100) {
      return NextResponse.json(
        { error: "수량은 1~100 사이여야 합니다." },
        { status: 400 }
      );
    }

    const event = await eventRepository.findById(eventId);

    if (!event) {
      return NextResponse.json(
        { error: "이벤트를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (!event.isActive) {
      return NextResponse.json(
        { error: "비활성화된 이벤트입니다." },
        { status: 400 }
      );
    }

    const results: DrawResultItem[] = [];

    for (let i = 0; i < quantity; i++) {
      const eventProducts = await productRepository.findByEventId(eventId);
      const result = executeDraw(eventProducts);

      if (result.isWin && result.product) {
        await productRepository.decrementStock(result.product.id);
      }

      await db.insert(drawResults).values({
        eventId,
        productId: result.product?.id || null,
        isWin: result.isWin,
        productName: result.product?.name || null,
      });

      results.push({
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
      });
    }

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
      { status: 500 }
    );
  }
}
