import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<Record<string, string>> };

type RouteHandler = (
  request: NextRequest,
  context: RouteContext
) => Promise<NextResponse>;

interface ErrorWithCode extends Error {
  code?: string;
}

const DB_ERROR_CODES = [
  "ECONNREFUSED",
  "ETIMEDOUT",
  "PROTOCOL_CONNECTION_LOST",
] as const;

/** DB 연결 오류 여부 확인 */
function isDbConnectionError(error: unknown): boolean {
  if (error instanceof Error) {
    const code = (error as ErrorWithCode).code;
    return DB_ERROR_CODES.includes(code as (typeof DB_ERROR_CODES)[number]);
  }
  return false;
}

/** API 라우트 에러 핸들러 래퍼 */
export function withErrorHandler(handler: RouteHandler): RouteHandler {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error(error);

      if (isDbConnectionError(error)) {
        return NextResponse.json(
          { error: "DB_CONNECTION_ERROR", message: "DB 연결이 안됐습니다." },
          { status: 503 }
        );
      }

      return NextResponse.json(
        { error: "INTERNAL_ERROR", message: "서버 오류가 발생했습니다." },
        { status: 500 }
      );
    }
  };
}
