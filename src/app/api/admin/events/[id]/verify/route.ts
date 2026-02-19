import { NextResponse } from "next/server";
import { eventRepository } from "@/repository";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/admin/events/:id/verify - 이벤트 패스워드 검증
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const eventId = parseInt(id);
    const { password } = await request.json();

    const event = await eventRepository.findById(eventId);

    if (!event) {
      return NextResponse.json(
        { error: "이벤트를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    if (!event.adminPassword) {
      return NextResponse.json(
        { error: "이 이벤트는 패스워드가 설정되지 않았습니다." },
        { status: 400 },
      );
    }

    if (password !== event.adminPassword) {
      return NextResponse.json(
        { error: "비밀번호가 일치하지 않습니다." },
        { status: 401 },
      );
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(`event_auth_${eventId}`, "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7일
    });

    return response;
  } catch (error) {
    console.error("Failed to verify event password:", error);
    return NextResponse.json(
      { error: "인증에 실패했습니다." },
      { status: 500 },
    );
  }
}
