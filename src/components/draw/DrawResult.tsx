"use client";

import { useLang } from "@/lib/i18n";
import type { ResolvedTokens } from "@/lib/themeTokens";

interface DrawSummary {
  count: number;
  product: {
    id: number;
    name: string;
    description?: string | null;
    imageUrl?: string | null;
  };
}

interface DrawResultProps {
  summary: DrawSummary[];
  onReset: () => void;
  colors: ResolvedTokens;
  /** 응답을 못 받아 히스토리에서 되살린 결과면 경고 배너를 띄운다 */
  recovered?: { ageSec: number; total: number } | null;
}

/** 추첨 결과 컴포넌트 */
export default function DrawResult({
  summary,
  onReset,
  colors,
  recovered,
}: DrawResultProps) {
  const t = useLang();

  return (
    <div className="space-y-6">
      {/* 브랜드 색을 안 쓴다 — 경고가 테마에 묻히면 운영자가 그냥 지나친다 */}
      {recovered && (
        <div className="rounded-2xl border-2 border-amber-400 bg-amber-950/85 px-5 py-4 text-center">
          <p className="text-xl landscape:text-2xl font-bold text-amber-300">
            ⚠️ {t.recoveredTitle}
          </p>
          <p className="mt-2 text-sm landscape:text-base leading-relaxed text-amber-100">
            {t.recoveredDesc(
              recovered.ageSec < 60
                ? t.agoSec(recovered.ageSec)
                : t.agoMin(Math.floor(recovered.ageSec / 60)),
              recovered.total,
            )}
          </p>
        </div>
      )}

      <h2
        data-token-part="resultTitle"
        className="text-2xl text-center font-bold"
        style={{ color: colors.resultTitleText }}
      >
        {t.result}
      </h2>

      <div
        data-token-part="resultCard"
        className="backdrop-blur rounded-2xl p-3 landscape:p-5 overflow-y-auto max-h-[50vh] landscape:max-h-[60vh]"
        style={{ backgroundColor: colors.resultCardBg }}
      >
        {summary.length > 0 ? (
          <div className="columns-1 landscape:columns-2 gap-2">
            {summary.map((item, idx) => (
              <div
                key={idx}
                data-token-part="resultRow"
                className="flex items-center justify-between rounded-xl p-2 mb-2 break-inside-avoid"
                style={{ backgroundColor: colors.resultRowBg }}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {item.product.imageUrl ? (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-10 h-10 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-2xl shrink-0"
                      style={{ backgroundColor: colors.resultImageBg }}
                    >
                      ⭐️
                    </div>
                  )}
                  <span
                    className="font-medium break-all line-clamp-2"
                    style={{ color: colors.resultProductNameText }}
                  >
                    {item.product.name}
                  </span>
                </div>
                <span
                  data-token-part="resultBadge"
                  className="text-lg font-bold px-4 py-1 rounded-full whitespace-nowrap shrink-0"
                  style={{
                    backgroundColor: colors.resultBadgeBg,
                    color: colors.resultBadgeText,
                  }}
                >
                  x {item.count}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: colors.resultTitleText }}>
            {t.noPrize}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onReset}
        data-token-part="resultAgainButton"
        className="w-full py-4 rounded-2xl font-bold text-lg transition"
        style={{
          backgroundColor: colors.resultAgainButtonBg,
          color: colors.resultAgainButtonText,
        }}
      >
        {recovered ? t.recoveredAck : t.drawAgain}
      </button>
    </div>
  );
}
