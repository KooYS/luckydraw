import { NextResponse } from "next/server";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { drawResults } from "@/db/schema";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export interface DrawBatch {
  /** 배치 식별자 겸 실행 시각 (동일성 비교 전용) */
  drawnAt: string;
  /**
   * DB 시계 기준 경과 초. 반드시 SQL 로 계산한다.
   * drizzle 의 datetime 은 DB 의 벽시계 문자열을 그대로 UTC 로 읽어들이므로
   * (`new Date(str + "Z")`) drawnAt 은 진짜 시각이 아니다. 클라이언트에서
   * Date.now() 와 빼면 서버 타임존 오프셋(KST면 9시간)만큼 통째로 어긋난다.
   */
  ageSec: number;
  total: number;
  items: { productId: number | null; productName: string | null; count: number }[];
}

// GET /api/events/:id/batches?limit=10 - 최근 추첨을 "배치" 단위로 조회 (최신순)
//
// 한 번의 추첨은 단일 INSERT 라 모든 행의 created_at 이 같다 → created_at 이 곧 배치 ID.
// 응답을 못 받은 클라이언트가 "그 추첨이 실제로 실행됐는지"를 확인하는 근거이자,
// 운영자용 추첨 이력 조회로도 쓴다.
//
// ponytail: created_at 이 DATETIME(초 단위)이라 같은 초에 시작된 두 배치는 하나로 합쳐진다.
//           한 이벤트를 여러 기기에서 동시에 돌리는 운영이 생기면 fsp:3 으로 올릴 것.
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const eventId = parseInt(id);
    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "10") || 10, 1),
      50,
    );

    // 1) 최근 N개 배치의 시각
    const recent = await db
      .selectDistinct({
        drawnAt: drawResults.createdAt,
        ageSec: sql<number>`TIMESTAMPDIFF(SECOND, ${drawResults.createdAt}, NOW())`,
      })
      .from(drawResults)
      .where(eq(drawResults.eventId, eventId))
      .orderBy(desc(drawResults.createdAt))
      .limit(limit);

    if (recent.length === 0) {
      return NextResponse.json({ batches: [] });
    }

    // 2) 그 배치들의 상품별 집계
    const rows = await db
      .select({
        drawnAt: drawResults.createdAt,
        productId: drawResults.productId,
        productName: drawResults.productName,
        count: sql<number>`COUNT(*)`,
      })
      .from(drawResults)
      .where(
        and(
          eq(drawResults.eventId, eventId),
          inArray(
            drawResults.createdAt,
            recent.map((r) => r.drawnAt),
          ),
        ),
      )
      .groupBy(
        drawResults.createdAt,
        drawResults.productId,
        drawResults.productName,
      );

    const byBatch = new Map<string, DrawBatch>();
    for (const { drawnAt, ageSec } of recent) {
      byBatch.set(drawnAt.toISOString(), {
        drawnAt: drawnAt.toISOString(),
        ageSec: Number(ageSec),
        total: 0,
        items: [],
      });
    }

    for (const row of rows) {
      const batch = byBatch.get(row.drawnAt.toISOString());
      if (!batch) continue;
      const count = Number(row.count);
      batch.total += count;
      batch.items.push({
        productId: row.productId,
        productName: row.productName,
        count,
      });
    }

    for (const batch of byBatch.values()) {
      batch.items.sort((a, b) => b.count - a.count);
    }

    return NextResponse.json({ batches: [...byBatch.values()] });
  } catch (error) {
    console.error("Failed to fetch draw batches:", error);
    return NextResponse.json(
      { error: "추첨 이력을 불러오는데 실패했습니다." },
      { status: 500 },
    );
  }
}
