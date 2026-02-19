import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "admin_authenticated";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /admin 정확 경로만 보호 (하위 페이지는 자유 접근)
  if (pathname === "/admin") {
    const isAuthenticated = request.cookies.get(COOKIE_NAME)?.value === "true";

    if (!isAuthenticated) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // /admin/login 은 이미 인증되었으면 대시보드로 리다이렉트
  if (pathname === "/admin/login") {
    const isAuthenticated = request.cookies.get(COOKIE_NAME)?.value === "true";

    if (isAuthenticated) {
      const adminUrl = new URL("/admin", request.url);
      return NextResponse.redirect(adminUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/login"],
};
