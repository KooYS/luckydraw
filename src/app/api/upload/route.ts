import { NextResponse } from "next/server";
import { uploadToS3, validateImageFile, validateS3Config } from "@/lib/s3";

export async function POST(request: Request) {
  try {
    const configValidation = validateS3Config();
    if (!configValidation.valid) {
      return NextResponse.json({ error: configValidation.error }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file) {
      return NextResponse.json({ error: "파일이 필요합니다." }, { status: 400 });
    }

    const validation = validateImageFile(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const result = await uploadToS3(file, { folder });

    return NextResponse.json({
      success: true,
      url: result.url,
      key: result.key,
      size: result.size,
    });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "업로드에 실패했습니다." },
      { status: 500 }
    );
  }
}
