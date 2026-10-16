"use client";

import { Suspense, useState } from "react";
import QuantitySelector from "@/components/draw/QuantitySelector";
import DrawButton from "@/components/draw/DrawButton";
import DrawProgress from "@/components/draw/DrawProgress";
import DrawResult from "@/components/draw/DrawResult";
import StockDisplay from "@/components/draw/StockDisplay";
import { Input } from "@/components/ui/input";
import {
  THEME_TOKENS,
  TOKEN_PART_LABELS,
  resolveThemeTokens,
  type ThemeTokenOverrides,
  type TokenId,
  type TokenPart,
  type TokenScreen,
} from "@/lib/themeTokens";
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
  /** 넘기면 미리보기 요소를 클릭해 색을 편집할 수 있다 */
  onTokensChange?: (next: ThemeTokenOverrides) => void;
}

const SCREEN_TABS: Array<{ id: TokenScreen; label: string }> = [
  { id: "select", label: "선택" },
  { id: "stock", label: "재고" },
  { id: "drawing", label: "추첨 중" },
  { id: "result", label: "결과" },
];

// ponytail: 미리보기용 더미. 확률이 높음/보통/낮음과 품절에 하나씩 걸리게 맞춰둠
const SAMPLE_PRODUCTS = [
  { name: "1등 - 레디백", remainingQuantity: 8, totalQuantity: 10, prob: "50.0" },
  { name: "2등 - 키링", remainingQuantity: 3, totalQuantity: 10, prob: "20.0" },
  { name: "3등 - 스티커", remainingQuantity: 1, totalQuantity: 10, prob: "5.0" },
  { name: "4등 - 엽서", remainingQuantity: 0, totalQuantity: 10, prob: "0.0" },
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

/** color input은 6자리 hex만 받는다. #RRGGBBAA는 알파를 떼고, rgb()/rgba()는 hex로 바꾼다 */
const toColorInputValue = (value: string) => {
  const hex = value.match(/^#([0-9a-f]{6})/i);
  if (hex) return `#${hex[1]}`;

  const rgb = value.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgb) {
    const toHex = (n: string) => Number(n).toString(16).padStart(2, "0");
    return `#${toHex(rgb[1])}${toHex(rgb[2])}${toHex(rgb[3])}`;
  }

  return "#000000";
};

/** 파트 목록 (드롭다운용). 미리보기에서 클릭이 어려운 요소도 여기로 접근한다 */
const ALL_PARTS = THEME_TOKENS.reduce<Array<{ part: TokenPart; screen: TokenScreen }>>(
  (acc, token) => {
    if (!acc.some((p) => p.part === token.part)) {
      acc.push({ part: token.part, screen: token.screen });
    }
    return acc;
  },
  [],
);

/**
 * 럭키드로우 테마 미리보기 겸 편집기.
 *
 * 실제 화면과 같은 컴포넌트를 렌더하고, 각 요소에 붙은 data-token-part를 클릭 위임으로 읽어
 * 그 요소가 쓰는 색만 아래 패널에 띄운다. 색을 찾아 헤맬 필요 없이 눈에 보이는 걸 누르면 된다.
 */
export default function ThemePreview({
  form,
  onTokensChange,
}: ThemePreviewProps) {
  const [quantity, setQuantity] = useState(5);
  const [screen, setScreen] = useState<TokenScreen>("select");
  const [selected, setSelected] = useState<TokenPart | null>(null);

  const editable = !!onTokensChange;
  const overrides = form.themeTokens;
  const maxQuantity = 100;
  const theme = { ...form, posterUrl: form.posterUrl || null };
  const colors = resolveThemeTokens(theme, overrides);

  const selectedTokens = selected
    ? THEME_TOKENS.filter((t) => t.part === selected)
    : [];

  const setToken = (id: TokenId, value: string | undefined) => {
    if (!onTokensChange) return;
    const next = { ...overrides };
    if (value === undefined) {
      delete next[id];
    } else {
      next[id] = value;
    }
    onTokensChange(next);
  };

  /** 클릭 위임: 눌린 요소에서 가장 가까운 data-token-part를 찾는다 */
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!editable) return;
    const el = (e.target as HTMLElement).closest("[data-token-part]");
    setSelected(
      el ? (el.getAttribute("data-token-part") as TokenPart) : "pageBackground",
    );
  };

  const selectPart = (part: TokenPart) => {
    const target = ALL_PARTS.find((p) => p.part === part);
    if (target) setScreen(target.screen);
    setSelected(part);
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-muted-foreground">
          {editable
            ? "미리보기에서 색을 바꿀 요소를 클릭하세요"
            : "럭키드로우 화면 미리보기"}
        </p>
        <div className="flex gap-1">
          {SCREEN_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setScreen(tab.id)}
              className={`text-xs px-2.5 py-1 rounded border ${
                screen === tab.id ? "bg-foreground text-background" : "hover:bg-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div
        onClick={handleClick}
        data-editable={editable || undefined}
        className="theme-preview p-6 rounded-xl relative overflow-hidden"
        style={{
          backgroundColor: colors.pageBg,
          backgroundImage: form.posterUrl ? `url("${form.posterUrl}")` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          fontFamily: form.fontUrl ? "CustomEventFont" : undefined,
        }}
      >
        {editable && (
          <style>{`
            .theme-preview[data-editable] [data-token-part] {
              cursor: pointer;
              outline-offset: 2px;
            }
            .theme-preview[data-editable] [data-token-part]:hover {
              outline: 2px dashed rgba(59,130,246,0.9);
            }
            .theme-preview[data-editable] [data-token-part="${selected}"] {
              outline: 2px solid rgb(59,130,246);
            }
          `}</style>
        )}
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
          {screen === "select" && (
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
                    data-token-part="title"
                    className="text-2xl font-bold inline-block"
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
                  onIncrement={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
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

          {screen === "stock" && (
            <Suspense fallback={<div className="h-48 rounded-2xl" />}>
              <StockDisplay
                products={SAMPLE_PRODUCTS}
                totalStock={12}
                colors={colors}
              />
            </Suspense>
          )}

          {screen === "drawing" && (
            <Suspense fallback={<div className="h-48 rounded-2xl" />}>
              <DrawProgress quantity={quantity} colors={colors} />
            </Suspense>
          )}

          {screen === "result" && (
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

      {editable && (
        <div className="mt-3 rounded-lg border">
          <div className="flex items-center gap-2 p-3 border-b">
            <span className="text-sm font-medium shrink-0">편집 중</span>
            <select
              value={selected ?? ""}
              onChange={(e) => selectPart(e.target.value as TokenPart)}
              className="flex-1 min-w-0 h-9 rounded-md border bg-transparent px-2 text-sm"
            >
              <option value="" disabled>
                요소를 클릭하거나 여기서 고르세요
              </option>
              {ALL_PARTS.map(({ part }) => (
                <option key={part} value={part}>
                  {TOKEN_PART_LABELS[part]}
                </option>
              ))}
            </select>
          </div>

          {selectedTokens.length === 0 ? (
            <p className="p-3 text-sm text-muted-foreground">
              미리보기에서 바꾸고 싶은 요소를 클릭하세요. 그 요소가 쓰는 색만 여기
              나옵니다.
            </p>
          ) : (
            <div className="p-3 space-y-1">
              {selectedTokens.map((token) => {
                const override = overrides[token.id];
                const derived = token.derive(theme, !!theme.posterUrl);

                return (
                  <div key={token.id} className="flex items-center gap-2 py-1">
                    <input
                      type="color"
                      value={toColorInputValue(override || derived)}
                      onChange={(e) => setToken(token.id, e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border shrink-0"
                    />
                    <span className="text-sm flex-1 min-w-0 truncate">
                      {token.label}
                    </span>
                    {override ? (
                      <>
                        <Input
                          value={override}
                          onChange={(e) => setToken(token.id, e.target.value)}
                          className="w-28 h-8 shrink-0 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setToken(token.id, undefined)}
                          className="text-xs px-2 py-1 rounded border shrink-0 hover:bg-muted"
                          title="기본 색 상속으로 되돌리기"
                        >
                          되돌리기
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="w-28 shrink-0 text-xs text-muted-foreground font-mono truncate">
                          {derived}
                        </span>
                        <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground shrink-0">
                          상속
                        </span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
