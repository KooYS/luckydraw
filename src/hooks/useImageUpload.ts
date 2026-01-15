"use client";

import { useState, useCallback } from "react";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
] as const;

const MAX_SIZE = 10 * 1024 * 1024;

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

interface UploadResult {
  url: string;
  key: string;
  size: number;
}

interface UseImageUploadOptions {
  folder?: string;
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: string) => void;
}

type ValidationResult = { valid: true } | { valid: false; error: string };

/** 파일 타입과 크기 검증 */
function validateFile(file: File): ValidationResult {
  if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
    return {
      valid: false,
      error: "허용되지 않는 파일 형식입니다. (허용: JPG, PNG, GIF, WebP, SVG)",
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

/** 이미지 업로드 훅 */
export function useImageUpload(options: UseImageUploadOptions = {}) {
  const { folder = "uploads", onSuccess, onError } = options;

  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  });

  /** 파일 업로드 실행 */
  const upload = useCallback(
    async (file: File): Promise<UploadResult | null> => {
      setState({ isUploading: true, progress: 0, error: null });

      try {
        const validation = validateFile(file);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        const progressInterval = setInterval(() => {
          setState((prev) => ({
            ...prev,
            progress: Math.min(prev.progress + 10, 90),
          }));
        }, 100);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        clearInterval(progressInterval);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "업로드에 실패했습니다.");
        }

        const result: UploadResult = {
          url: data.url,
          key: data.key,
          size: data.size,
        };

        setState({ isUploading: false, progress: 100, error: null });
        onSuccess?.(result);

        return result;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "업로드에 실패했습니다.";
        setState({ isUploading: false, progress: 0, error: message });
        onError?.(message);
        return null;
      }
    },
    [folder, onSuccess, onError]
  );

  /** 상태 초기화 */
  const reset = useCallback(() => {
    setState({ isUploading: false, progress: 0, error: null });
  }, []);

  return {
    upload,
    reset,
    isUploading: state.isUploading,
    progress: state.progress,
    error: state.error,
  };
}

/** 이미지 미리보기 훅 */
export function useImagePreview() {
  const [preview, setPreview] = useState<string | null>(null);

  /** 파일로부터 미리보기 URL 생성 */
  const generatePreview = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  /** 미리보기 초기화 */
  const clearPreview = useCallback(() => {
    setPreview(null);
  }, []);

  return { preview, generatePreview, clearPreview };
}
