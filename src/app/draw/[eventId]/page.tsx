"use client";

import { useParams } from "next/navigation";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useLuckyDraw } from "@/hooks/useLuckyDraw";
import DrawButton from "@/components/draw/DrawButton";
import QuantitySelector from "@/components/draw/QuantitySelector";
import DrawProgress from "@/components/draw/DrawProgress";
import DrawResult from "@/components/draw/DrawResult";
import StockDisplay from "@/components/draw/StockDisplay";

/** 럭키드로우 페이지 */
export default function DrawPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const { setTheme } = useTheme();

  const { state, computed, actions } = useLuckyDraw({
    eventId,
    onThemeChange: setTheme,
  });

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-background">
        <div className="text-xl text-theme-text">로딩 중...</div>
      </div>
    );
  }

  if (!state.event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-background">
        <div className="text-xl text-red-500">이벤트를 찾을 수 없습니다.</div>
      </div>
    );
  }

  const { event } = state;
  const { colors, hasPoster, hasStock, totalStock, productsWithProbability } =
    computed;

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden"
      style={{
        backgroundColor: event.backgroundColor,
        backgroundImage: event.posterUrl
          ? `url(${event.posterUrl})`
          : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {hasPoster && <div className="absolute inset-0 bg-black/50 z-0" />}

      <div className="relative z-10 text-center w-full max-w-lg">
        {event.logoUrl ? (
          <img
            src={event.logoUrl}
            alt={event.name}
            className="h-16 mx-auto mb-6"
          />
        ) : (
          <h1
            className="text-3xl font-bold mb-6"
            style={{ color: hasPoster ? "#fff" : event.primaryColor }}
          >
            {event.name}
          </h1>
        )}

        {state.drawState === "select" && (
          <div className="space-y-6">
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

        <StockDisplay
          products={productsWithProbability}
          totalStock={totalStock}
          primaryColor={event.primaryColor}
          accentColor={event.accentColor}
          secondaryColor={event.secondaryColor}
          colors={colors}
        />
      </div>
    </main>
  );
}
