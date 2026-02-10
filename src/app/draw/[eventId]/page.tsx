"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useLuckyDraw } from "@/hooks/useLuckyDraw";
import DrawButton from "@/components/draw/DrawButton";
import QuantitySelector from "@/components/draw/QuantitySelector";
import DrawProgress from "@/components/draw/DrawProgress";
import DrawResult from "@/components/draw/DrawResult";
import StockDisplay from "@/components/draw/StockDisplay";
import SecretMenu from "@/components/draw/SecretMenu";

/** 럭키드로우 페이지 */
export default function DrawPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const { setTheme } = useTheme();
  const mainRef = useRef<HTMLElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { state, computed, actions } = useLuckyDraw({
    eventId,
    onThemeChange: setTheme,
  });

  /** 전체화면 토글 */
  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      mainRef.current?.requestFullscreen?.().catch(() => {});
    }
  }, []);

  /** 전체화면 상태 동기화 */
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  /** 첫 터치 시 전체화면 진입 */
  useEffect(() => {
    const handler = () => {
      if (!document.fullscreenElement) {
        mainRef.current?.requestFullscreen?.().catch(() => {});
      }
    };
    document.addEventListener("touchstart", handler, { once: true });
    return () => document.removeEventListener("touchstart", handler);
  }, []);

  if (state.loading) {
    return (
      <div className="h-dvh flex items-center justify-center bg-theme-background">
        <div className="text-xl text-theme-text">로딩 중...</div>
      </div>
    );
  }

  if (!state.event) {
    return (
      <div className="h-dvh flex items-center justify-center bg-theme-background">
        <div className="text-xl text-red-500">이벤트를 찾을 수 없습니다.</div>
      </div>
    );
  }

  const { event } = state;
  const { colors, hasPoster, hasStock, totalStock, productsWithProbability } =
    computed;

  return (
    <main
      ref={mainRef}
      className="h-dvh flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundColor: event.backgroundColor,
        backgroundImage: event.posterUrl
          ? `url(${event.posterUrl})`
          : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {hasPoster && event.posterOverlay && (
        <div className="absolute inset-0 bg-black/50 z-0" />
      )}

      <SecretMenu
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onGoAdmin={() => router.push(`/admin/events/${eventId}`)}
      />

      <div className="relative z-10 text-center w-full max-w-lg flex flex-col justify-center max-h-full overflow-y-auto">
        {event.titleImageUrl ? (
          <img
            src={event.titleImageUrl}
            alt={event.name}
            className="mx-auto mb-4 object-contain shrink-0"
            style={{
              width: `${event.titleImageWidth ?? 80}%`,
              maxHeight: "20vh",
            }}
          />
        ) : event.logoUrl ? (
          <img
            src={event.logoUrl}
            alt={event.name}
            className="h-12 mx-auto mb-4 shrink-0"
          />
        ) : (
          <h1
            className="text-2xl font-bold mb-4 shrink-0"
            style={{ color: hasPoster ? "#fff" : event.primaryColor }}
          >
            {event.name}
          </h1>
        )}

        {state.drawState === "select" && (
          <div className="space-y-4">
            <QuantitySelector
              quantity={state.quantity}
              maxQuantity={totalStock}
              onIncrement={actions.incrementQuantity}
              onDecrement={actions.decrementQuantity}
              onChange={actions.setQuantity}
              onQuickIncrement={actions.quickIncrement}
              colors={colors}
              primaryColor={event.primaryColor}
            />

            <DrawButton
              onClick={actions.executeDraw}
              disabled={!hasStock}
              color={event.primaryColor}
              label={`${state.quantity}개 추첨하기`}
            />

            {!hasStock && (
              <p style={{ color: "#ef4444" }}>
                모든 상품의 재고가 소진되었습니다.
              </p>
            )}
          </div>
        )}

        {state.drawState === "drawing" && (
          <DrawProgress
            quantity={state.quantity}
            hasPoster={hasPoster}
            primaryColor={event.primaryColor}
            colors={colors}
          />
        )}

        {state.drawState === "result" && (
          <DrawResult
            summary={state.summary}
            hasPoster={hasPoster}
            primaryColor={event.primaryColor}
            onReset={actions.reset}
            colors={colors}
          />
        )}

        {event.showStockPanel && (
          <StockDisplay
            products={productsWithProbability}
            totalStock={totalStock}
            primaryColor={event.primaryColor}
            accentColor={event.accentColor}
            secondaryColor={event.secondaryColor}
            colors={colors}
          />
        )}
      </div>
    </main>
  );
}
