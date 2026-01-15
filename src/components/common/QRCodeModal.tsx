"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface QRCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  title: string;
  description?: string;
}

export default function QRCodeModal({
  open,
  onOpenChange,
  url,
  title,
  description,
}: QRCodeModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  // QR 코드 생성
  useEffect(() => {
    if (open && canvasRef.current && url) {
      QRCode.toCanvas(
        canvasRef.current,
        url,
        {
          width: 280,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        },
        (error) => {
          if (error) console.error("QR Code generation error:", error);
        }
      );
    }
  }, [open, url, mounted]);

  // QR 코드 다운로드
  const handleDownload = () => {
    if (!canvasRef.current) return;

    // 더 큰 캔버스 생성 (고해상도)
    const downloadCanvas = document.createElement("canvas");
    const size = 1024;
    downloadCanvas.width = size;
    downloadCanvas.height = size;

    QRCode.toCanvas(
      downloadCanvas,
      url,
      {
        width: size,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      },
      () => {
        const link = document.createElement("a");
        link.download = `qr-${title.replace(/\s+/g, "-").toLowerCase()}.png`;
        link.href = downloadCanvas.toDataURL("image/png");
        link.click();
      }
    );
  };

  // URL 복사
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 폴백
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4">
          {/* QR 코드 */}
          <div className="bg-white p-4 rounded-xl ">
            <canvas ref={canvasRef} />
          </div>

          {/* URL */}
          <div className="w-full">
            <p className="text-xs text-muted-foreground mb-1">URL</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm bg-muted px-3 py-2 rounded-lg truncate">
                {url}
              </code>
              <Button variant="outline" size="sm" onClick={handleCopyUrl}>
                {copied ? "복사됨!" : "복사"}
              </Button>
            </div>
          </div>

          {description && (
            <p className="text-sm text-muted-foreground text-center">
              {description}
            </p>
          )}

          {/* 버튼 */}
          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => window.open(url, "_blank")}
            >
              페이지 열기
            </Button>
            <Button className="flex-1" onClick={handleDownload}>
              QR 다운로드
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
