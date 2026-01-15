import { NextResponse } from "next/server";
import { eventRepository } from "@/repository";

// GET /api/events - 모든 이벤트 목록 조회
export async function GET() {
  try {
    const allEvents = await eventRepository.findAll();
    return NextResponse.json(allEvents);
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return NextResponse.json(
      { error: "이벤트 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// POST /api/events - 새 이벤트 생성
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = await eventRepository.createEvent({
      name: body.name,
      description: body.description,
      primaryColor: body.primaryColor,
      secondaryColor: body.secondaryColor,
      backgroundColor: body.backgroundColor,
      textColor: body.textColor,
      accentColor: body.accentColor,
      posterUrl: body.posterUrl,
      logoUrl: body.logoUrl,
      isActive: body.isActive,
    });

    return NextResponse.json(
      { message: "이벤트가 생성되었습니다.", id: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create event:", error);
    return NextResponse.json(
      { error: "이벤트 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
