"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

interface QRPreviewProps {
  url: string;
  size?: number;
  onClick?: () => void;
}

export default function QRPreview({ url, size = 80, onClick }: QRPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !url) return;

    QRCode.toCanvas(
      canvasRef.current,
      url,
      {
        width: size,
        margin: 1,
        color: { dark: "#000000", light: "#FFFFFF" },
      },
      (error) => {
        if (error) console.error("QR Code error:", error);
      }
    );
  }, [url, size]);

  return (
    <div
      className="bg-white p-1 rounded-lg border cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
      title="클릭하여 QR 다운로드"
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
