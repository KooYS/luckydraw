"use client";

import { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
] as const;

const MAX_SIZE = 10 * 1024 * 1024;

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  previewMode?: "contain" | "cover";
  placeholder?: string;
}

type ValidationResult = { valid: true } | { valid: false; error: string };

/** 파일 타입과 크기 검증 */
function validateFile(file: File): ValidationResult {
  if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
    return {
      valid: false,
      error: "허용되지 않는 파일 형식입니다. (JPG, PNG, GIF, WebP, SVG)",
    };
  }

  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: "파일 크기는 10MB를 초과할 수 없습니다.",
    };
  }

  return { valid: true };
}

/** 이미지 업로드 컴포넌트 */
export default function ImageUpload({
  label,
  value,
  onChange,
  folder = "uploads",
  previewMode = "cover",
  placeholder = "https://...",
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  /** 파일을 S3에 업로드 */
  const handleUpload = useCallback(
    async (file: File) => {
      setError(null);
      setIsUploading(true);

      try {
        const validation = validateFile(file);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "업로드에 실패했습니다.");
        }

        onChange(data.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "업로드에 실패했습니다.");
      } finally {
        setIsUploading(false);
      }
    },
    [folder, onChange]
  );

  /** input[type=file] 변경 핸들러 */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
    e.target.value = "";
  };

  /** 드래그 이벤트 핸들러 */
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  /** 드롭 이벤트 핸들러 */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  /** 이미지 제거 */
  const handleRemove = () => {
    onChange("");
    setError(null);
  };

  /** 파일 선택 다이얼로그 열기 */
  const openFilePicker = () => fileInputRef.current?.click();

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      <div
        className={`
          relative border-2 border-dashed rounded-lg transition-colors
          ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25"
          }
          ${!value ? "cursor-pointer" : ""}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !value && openFilePicker()}
      >
        {value ? (
          <div
            className={`relative p-2 ${previewMode === "cover" ? "aspect-square" : ""}`}
          >
            <img
              src={value}
              alt="미리보기"
              className={`rounded-md ${
                previewMode === "contain"
                  ? "max-h-48 w-auto mx-auto"
                  : "w-full h-full object-cover"
              }`}
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-4 right-4"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
            >
              삭제
            </Button>
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
                <div className="text-4xl mb-2">📷</div>
                <p className="text-sm text-muted-foreground mb-1">
                  클릭하거나 이미지를 드래그하세요
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, GIF, WebP (최대 10MB)
                </p>
              </>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex gap-2">
        <Input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
        />
        {!value && (
          <Button
            type="button"
            variant="outline"
            onClick={openFilePicker}
            disabled={isUploading}
          >
            {isUploading ? "..." : "업로드"}
          </Button>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
