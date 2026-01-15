import { NextResponse } from "next/server";
import { db } from "@/db";
import { drawResults } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/events/:id/results - 이벤트의 당첨 결과 목록 조회
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const eventId = parseInt(id);
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100");

    const results = await db
      .select()
      .from(drawResults)
      .where(eq(drawResults.eventId, eventId))
      .orderBy(desc(drawResults.createdAt))
      .limit(limit);

    // 통계 계산
    const totalDraws = results.length;
    const wins = results.filter((r) => r.isWin).length;
    const winRate = totalDraws > 0 ? ((wins / totalDraws) * 100).toFixed(2) : 0;

    return NextResponse.json({
      results,
      stats: {
        totalDraws,
        wins,
        losses: totalDraws - wins,
        winRate: `${winRate}%`,
      },
    });
  } catch (error) {
    console.error("Failed to fetch results:", error);
    return NextResponse.json(
      { error: "당첨 결과를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
