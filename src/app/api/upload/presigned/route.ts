import { NextResponse } from "next/server";
import { getPresignedUploadUrl, validateS3Config } from "@/lib/s3";

// ============================================================
// POST /api/upload/presigned - Presigned URL 발급
// ============================================================
//
// 클라이언트에서 직접 S3로 업로드할 때 사용
// 서버 부하 감소 및 대용량 파일 업로드에 유리
//

export async function POST(request: Request) {
  try {
    // S3 설정 검증
    const configValidation = validateS3Config();
    if (!configValidation.valid) {
      return NextResponse.json(
        { error: configValidation.error },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { fileName, folder = "uploads" } = body;

    if (!fileName) {
      return NextResponse.json(
        { error: "파일명이 필요합니다." },
        { status: 400 }
      );
    }

    // Presigned URL 생성
    const result = await getPresignedUploadUrl(folder, fileName);

    return NextResponse.json({
      success: true,
      uploadUrl: result.uploadUrl,
      key: result.key,
      publicUrl: result.publicUrl,
    });
  } catch (error) {
    console.error("Presigned URL generation failed:", error);
    return NextResponse.json(
      { error: "Presigned URL 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
