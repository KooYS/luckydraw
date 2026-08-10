"use client";

import { Suspense, useState } from "react";
import QuantitySelector from "@/components/draw/QuantitySelector";
import DrawButton from "@/components/draw/DrawButton";
import DrawProgress from "@/components/draw/DrawProgress";
import DrawResult from "@/components/draw/DrawResult";
import StockDisplay from "@/components/draw/StockDisplay";
import { resolveThemeTokens, type TokenScreen } from "@/lib/themeTokens";
import type { EventFormState } from "@/hooks/useEventDetail";
import type { Product } from "@/db/schema";

/** 미리보기에 실제로 필요한 폼 필드 (이벤트 생성/수정 폼 양쪽에 공통) */
export type ThemePreviewForm = Pick<
  EventFormState,
  | "name"
  | "titleImageUrl"
  | "titleImageWidth"
  | "primaryColor"
  | "secondaryColor"
  | "backgroundColor"
  | "textColor"
  | "subTextColor"
  | "accentColor"
  | "posterUrl"
  | "posterOverlay"
  | "fontUrl"
  | "themeTokens"
>;

interface ThemePreviewProps {
  form: ThemePreviewForm;
  /** 편집 중인 화면. 지정하면 탭 대신 이 화면만 보여준다 */
  screen?: TokenScreen;
  onScreenChange?: (screen: TokenScreen) => void;
}

const SCREEN_TABS: Array<{ id: TokenScreen; label: string }> = [
  { id: "select", label: "선택" },
  { id: "stock", label: "재고" },
  { id: "drawing", label: "추첨 중" },
  { id: "result", label: "결과" },
];

// ponytail: 미리보기용 더미. 실제 상품을 끌어오면 생성 화면에선 쓸 수가 없다
const SAMPLE_PRODUCTS = [
  { name: "1등 - 레디백", remainingQuantity: 8, totalQuantity: 10, prob: "50.0" },
  { name: "2등 - 키링", remainingQuantity: 3, totalQuantity: 10, prob: "20.0" },
  { name: "3등 - 스티커", remainingQuantity: 0, totalQuantity: 10, prob: "0.0" },
].map((p, i) => ({
  ...({} as Product),
  id: i + 1,
  name: p.name,
  remainingQuantity: p.remainingQuantity,
  totalQuantity: p.totalQuantity,
  realTimeProbability: p.prob,
}));

const SAMPLE_SUMMARY = [
  { count: 2, product: { id: 1, name: "1등 - 레디백", imageUrl: null } },
  { count: 3, product: { id: 2, name: "2등 - 키링", imageUrl: null } },
];

/** 럭키드로우 테마 미리보기 — 실제 화면과 같은 컴포넌트·같은 토큰을 사용 */
export default function ThemePreview({
  form,
  screen,
  onScreenChange,
}: ThemePreviewProps) {
  const [quantity, setQuantity] = useState(5);
  const [localScreen, setLocalScreen] = useState<TokenScreen>("select");

  const activeScreen = screen ?? localScreen;
  const setScreen = onScreenChange ?? setLocalScreen;

  const maxQuantity = 100;
  const colors = resolveThemeTokens(
    { ...form, posterUrl: form.posterUrl || null },
    form.themeTokens,
  );

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-muted-foreground">럭키드로우 화면 미리보기</p>
        <div className="flex gap-1">
          {SCREEN_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setScreen(tab.id)}
              className={`text-xs px-2.5 py-1 rounded border ${
                activeScreen === tab.id
                  ? "bg-foreground text-background"
                  : "hover:bg-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className="p-6 rounded-xl relative overflow-hidden"
        style={{
          backgroundColor: colors.pageBg,
          backgroundImage: form.posterUrl
            ? `url("${form.posterUrl}")`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          fontFamily: form.fontUrl ? "CustomEventFont" : undefined,
        }}
      >
        {form.fontUrl && (
          <style>{`
            @font-face {
              font-family: "CustomEventFont";
              src: url("${form.fontUrl}");
              font-display: swap;
            }
          `}</style>
        )}
        {form.posterUrl && form.posterOverlay && (
          <div className="absolute inset-0 bg-black/50 z-0" />
        )}

        <div className="relative z-10 flex flex-col gap-4 max-w-lg mx-auto">
          {activeScreen === "select" && (
            <>
              <div className="pb-3 text-center">
                {form.titleImageUrl ? (
                  <img
                    src={form.titleImageUrl}
                    alt={form.name}
                    className="mx-auto object-contain"
                    style={{ width: `${form.titleImageWidth ?? 80}%` }}
                  />
                ) : (
                  <h1
                    className="text-2xl font-bold"
                    style={{ color: colors.titleText }}
                  >
                    {form.name || "이벤트 이름"}
                  </h1>
                )}
              </div>

              {/* QuantitySelector가 useSearchParams(다국어)를 쓰므로 프리렌더용 바운더리 필요 */}
              <Suspense fallback={<div className="h-48 rounded-2xl" />}>
                <QuantitySelector
                  quantity={quantity}
                  maxQuantity={maxQuantity}
                  onIncrement={() =>
                    setQuantity((q) => Math.min(maxQuantity, q + 1))
                  }
                  onDecrement={() => setQuantity((q) => Math.max(0, q - 1))}
                  onChange={setQuantity}
                  onQuickIncrement={(n) =>
                    setQuantity((q) => Math.min(maxQuantity, q + n))
                  }
                  colors={colors}
                />
              </Suspense>

              <DrawButton
                onClick={() => {}}
                color={colors.drawButtonBg}
                textColor={colors.drawButtonText}
                label={`${quantity}개 추첨하기`}
              />
            </>
          )}

          {activeScreen === "stock" && (
            <Suspense fallback={<div className="h-48 rounded-2xl" />}>
              <StockDisplay
                products={SAMPLE_PRODUCTS}
                totalStock={11}
                colors={colors}
              />
            </Suspense>
          )}

          {activeScreen === "drawing" && (
            <Suspense fallback={<div className="h-48 rounded-2xl" />}>
              <DrawProgress quantity={quantity} colors={colors} />
            </Suspense>
          )}

          {activeScreen === "result" && (
            <Suspense fallback={<div className="h-48 rounded-2xl" />}>
              <DrawResult
                summary={SAMPLE_SUMMARY}
                onReset={() => {}}
                colors={colors}
              />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
}
