import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "admin_authenticated";

// 리버스 프록시 뒤에서 request.url/nextUrl 의 host 는 내부 주소(localhost:3000)라
// 그대로 리다이렉트하면 브라우저가 localhost 로 튕긴다. 프록시가 넘겨주는
// x-forwarded-host/proto 로 실제 도메인을 복원해 절대 URL 을 만든다.
const redirectTo = (request: NextRequest, path: string) => {
  const url = request.nextUrl.clone();
  url.pathname = path;
  url.search = "";

  const forwardedHost = request.headers.get("x-forwarded-host");
  if (forwardedHost) {
    url.host = forwardedHost;
    url.protocol = request.headers.get("x-forwarded-proto") ?? url.protocol;
  }

  return NextResponse.redirect(url);
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = request.cookies.get(COOKIE_NAME)?.value === "true";

  // /admin 정확 경로만 보호 (하위 페이지는 자유 접근)
  if (pathname === "/admin" && !isAuthenticated) {
    return redirectTo(request, "/admin/login");
  }

  // /admin/login 은 이미 인증되었으면 대시보드로 리다이렉트
  if (pathname === "/admin/login" && isAuthenticated) {
    return redirectTo(request, "/admin");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/login"],
};
