"use client";

import { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const ALLOWED_EXTS = ["woff", "woff2", "ttf", "otf"];
const MAX_SIZE = 10 * 1024 * 1024;

interface FontUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}

type ValidationResult = { valid: true } | { valid: false; error: string };

function validateFile(file: File): ValidationResult {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext || !ALLOWED_EXTS.includes(ext)) {
    return { valid: false, error: "허용되지 않는 파일 형식입니다. (woff, woff2, ttf, otf)" };
  }
  if (file.size > MAX_SIZE) {
    return { valid: false, error: "파일 크기는 10MB를 초과할 수 없습니다." };
  }
  return { valid: true };
}

function getFileName(url: string): string {
  try {
    return decodeURIComponent(url.split("/").pop() || url);
  } catch {
    return url.split("/").pop() || url;
  }
}

/** 폰트 파일 업로드 컴포넌트 */
export default function FontUpload({
  label,
  value,
  onChange,
  folder = "luckdraw/events/fonts",
}: FontUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleUpload = useCallback(
    async (file: File) => {
      setError(null);
      setIsUploading(true);

      try {
        const validation = validateFile(file);
        if (!validation.valid) throw new Error(validation.error);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const response = await fetch("/api/upload/font", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "업로드에 실패했습니다.");

        onChange(data.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "업로드에 실패했습니다.");
      } finally {
        setIsUploading(false);
      }
    },
    [folder, onChange]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = "";
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      <div
        className={`
          relative border-2 border-dashed rounded-lg transition-colors cursor-pointer
          ${dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !value && fileInputRef.current?.click()}
      >
        {value ? (
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-2xl">🔤</span>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{getFileName(value)}</p>
                <p className="text-xs text-muted-foreground">폰트 적용됨</p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                변경
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                  setError(null);
                }}
              >
                삭제
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            {isUploading ? (
              <>
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                <p className="text-sm text-muted-foreground">업로드 중...</p>
              </>
            ) : (
              <>
                <div className="text-4xl mb-2">🔤</div>
                <p className="text-sm text-muted-foreground mb-1">
                  클릭하거나 폰트 파일을 드래그하세요
                </p>
                <p className="text-xs text-muted-foreground">
                  woff, woff2, ttf, otf (최대 10MB)
                </p>
              </>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".woff,.woff2,.ttf,.otf"
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
