"use client";

import { useEffect, useCallback, useRef } from "react";
import StockDisplay from "./StockDisplay";
import { Product } from "@/db/schema";
import { useStockDrawerStore } from "@/stores/useStockDrawerStore";

interface ProductWithProbability extends Product {
  realTimeProbability: string;
}

interface StockDrawerProps {
  products: ProductWithProbability[];
  totalStock: number;
  primaryColor: string;
  accentColor: string;
  secondaryColor: string;
  colors: {
    textColor: string;
    textColorMuted: string;
    textColorFaint: string;
    cardBg: string;
    infoBg: string;
  };
}

export default function StockDrawer({
  products,
  totalStock,
  primaryColor,
  accentColor,
  secondaryColor,
  colors,
}: StockDrawerProps) {
  const {
    open, pinned, isLandscape,
    setOpen, setPinned, setIsLandscape, setInset, close,
  } = useStockDrawerStore();

  const panelRef = useRef<HTMLDivElement>(null);

  // orientation 감지
  useEffect(() => {
    const mq = window.matchMedia("(orientation: landscape)");
    setIsLandscape(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsLandscape(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [setIsLandscape]);

  // 핀 고정 시 드로어 크기 측정 → inset 업데이트
  useEffect(() => {
    if (!open || !pinned || !panelRef.current) {
      if (!pinned) setInset({ right: 0, bottom: 0 });
      return;
    }
    const rect = panelRef.current.getBoundingClientRect();
    if (isLandscape) {
      setInset({ right: rect.width, bottom: 0 });
    } else {
      setInset({ right: 0, bottom: rect.height });
    }
  }, [open, pinned, isLandscape, setInset]);

  // ESC 키로 닫기
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pinned) setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [pinned, setOpen]);

  const handleClose = useCallback(() => close(), [close]);

  const header = (
    <div className="flex items-center justify-between px-4 pt-3 pb-2">
      <span className="text-sm font-semibold" style={{ color: colors.textColor }}>
        재고 현황
      </span>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setPinned(!pinned)}
          className="p-1.5 rounded-lg transition-colors"
          style={{
            color: pinned ? primaryColor : colors.textColorMuted,
            backgroundColor: pinned ? `${primaryColor}20` : colors.cardBg,
          }}
        >
          <svg
            width="16" height="16" viewBox="0 0 24 24"
            fill={pinned ? "currentColor" : "none"}
            stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: pinned ? "none" : "rotate(45deg)" }}
          >
            <path d="M12 17v5M9 2h6l-1 7h4l-5 8h-2l-5-8h4z" />
          </svg>
        </button>
        <button
          onClick={handleClose}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: colors.textColorMuted, backgroundColor: colors.cardBg }}
        >
          <svg
            width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );

  const stockContent = (
    <div className="flex-1 overflow-y-auto px-3 pb-4 min-h-0">
      <StockDisplay
        products={products}
        totalStock={totalStock}
        primaryColor={primaryColor}
        accentColor={accentColor}
        secondaryColor={secondaryColor}
        colors={colors}
      />
    </div>
  );

  // ── Landscape: 오른쪽 사이드바 ──
  if (isLandscape) {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-40 transition-all duration-300 active:scale-95"
          style={{
            opacity: open ? 0 : 1,
            pointerEvents: open ? "none" : "auto",
            width: 12, height: 48, padding: 0,
            background: "transparent", border: "none",
          }}
        >
          <svg width="12" height="48" viewBox="0 0 12 48" fill="none">
            <path d="M12 0 L12 48 L5 43 Q0 40 0 35 L0 13 Q0 8 5 5 Z" fill={`${primaryColor}99`} />
            <path d="M7 20 L4 24 L7 28" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </button>

        {!pinned && (
          <div
            className="fixed inset-0 z-40 transition-opacity duration-300"
            style={{
              backgroundColor: "rgba(0,0,0,0.4)",
              opacity: open ? 1 : 0,
              pointerEvents: open ? "auto" : "none",
            }}
            onClick={() => setOpen(false)}
          />
        )}

        <div
          ref={panelRef}
          className="fixed top-0 right-0 h-full z-50 flex flex-col transition-transform duration-300 ease-out w-[85vw] max-w-sm backdrop-blur-xl"
          style={{
            transform: open ? "translateX(0)" : "translateX(100%)",
            backgroundColor: colors.infoBg,
          }}
        >
          {header}
          {stockContent}
        </div>
      </>
    );
  }

  // ── Portrait: 바텀시트 ──
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-0 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 active:scale-95"
        style={{
          opacity: open ? 0 : 1,
          pointerEvents: open ? "none" : "auto",
          width: 48, height: 12, padding: 0,
          background: "transparent", border: "none",
        }}
      >
        <svg width="48" height="12" viewBox="0 0 48 12" fill="none">
          <path d="M0 12 L48 12 L43 5 Q40 0 35 0 L13 0 Q8 0 5 5 Z" fill={`${primaryColor}99`} />
          <path d="M20 7 L24 4 L28 7" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </button>

      {!pinned && (
        <div
          className="fixed inset-0 z-40 transition-opacity duration-300"
          style={{
            backgroundColor: "rgba(0,0,0,0.4)",
            opacity: open ? 1 : 0,
            pointerEvents: open ? "auto" : "none",
          }}
          onClick={() => setOpen(false)}
        />
      )}

      <div
        ref={panelRef}
        className="fixed bottom-0 left-0 right-0 z-50 flex flex-col transition-transform duration-300 ease-out backdrop-blur-xl rounded-t-2xl"
        style={{
          maxHeight: "60vh",
          transform: open ? "translateY(0)" : "translateY(100%)",
          backgroundColor: colors.infoBg,
        }}
      >
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: colors.textColorFaint }} />
        </div>
        {header}
        {stockContent}
      </div>
    </>
  );
}
