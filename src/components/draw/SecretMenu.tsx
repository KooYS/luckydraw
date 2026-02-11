"use client";

import { useState, useRef, useEffect } from "react";
import { Maximize, Minimize, Settings } from "lucide-react";

interface SecretMenuProps {
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onGoAdmin: () => void;
}

/** 우측 상단 시크릿 메뉴 */
export default function SecretMenu({
  isFullscreen,
  onToggleFullscreen,
  onGoAdmin,
}: SecretMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  /** 메뉴 외부 클릭 시 닫기 */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="absolute top-0 left-0 z-50">
      {/* 투명한 터치 영역 */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-16 h-16 opacity-0"
        aria-label="메뉴"
      />

      {open && (
        <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden min-w-[180px] animate-in fade-in slide-in-from-top-2 duration-150">
          <button
            onClick={() => {
              onToggleFullscreen();
              setOpen(false);
            }}
            className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/10 transition flex items-center gap-3"
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            {isFullscreen ? "전체화면 해제" : "전체화면"}
          </button>
          <div className="border-t border-white/10" />
          <button
            onClick={() => {
              onGoAdmin();
              setOpen(false);
            }}
            className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/10 transition flex items-center gap-3"
          >
            <Settings size={16} />
            관리자 화면
          </button>
        </div>
      )}
    </div>
  );
}
