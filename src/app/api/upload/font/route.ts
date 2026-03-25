import { NextResponse } from "next/server";
import { uploadRawToS3, validateFontFile, validateS3Config } from "@/lib/s3";

export async function POST(request: Request) {
  try {
    const configValidation = validateS3Config();
    if (!configValidation.valid) {
      return NextResponse.json({ error: configValidation.error }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "luckdraw/events/fonts";

    if (!file) {
      return NextResponse.json({ error: "파일이 필요합니다." }, { status: 400 });
    }

    const validation = validateFontFile(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "woff2";
    const contentTypeMap: Record<string, string> = {
      woff: "font/woff",
      woff2: "font/woff2",
      ttf: "font/ttf",
      otf: "font/otf",
    };

    const result = await uploadRawToS3(file, {
      folder,
      contentType: contentTypeMap[ext] || "application/octet-stream",
    });

    return NextResponse.json({
      success: true,
      url: result.url,
      key: result.key,
      size: result.size,
    });
  } catch (error) {
    console.error("Font upload failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "업로드에 실패했습니다." },
      { status: 500 }
    );
  }
}
