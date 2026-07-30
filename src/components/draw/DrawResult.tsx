"use client";

import { useLang } from "@/lib/i18n";

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
  primaryColor: string;
  onReset: () => void;
  colors: {
    textColor: string;
    textColorMuted: string;
    cardBg: string;
    cardBgHover: string;
    buttonBg: string;
  };
}

/** 추첨 결과 컴포넌트 */
export default function DrawResult({
  summary,
  primaryColor,
  onReset,
  colors,
}: DrawResultProps) {
  const t = useLang();

  return (
    <div className="space-y-6">
      <h2
        className="text-2xl text-center font-bold"
        style={{ color: colors.textColor }}
      >
        {t.result}
      </h2>

      <div
        className="backdrop-blur rounded-2xl p-3 landscape:p-5 overflow-y-auto max-h-[50vh] landscape:max-h-[60vh]"
        style={{ backgroundColor: colors.cardBg }}
      >
        {summary.length > 0 ? (
          <div className="columns-1 landscape:columns-2 gap-2">
            {summary.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl p-2 mb-2 break-inside-avoid"
                style={{ backgroundColor: colors.cardBgHover }}
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
                      style={{ backgroundColor: colors.buttonBg }}
                    >
                      ⭐️
                    </div>
                  )}
                  <span
                    className="font-medium break-all line-clamp-2"
                    style={{ color: colors.textColor }}
                  >
                    {item.product.name}
                  </span>
                </div>
                <span
                  className="text-lg font-bold px-4 py-1 rounded-full whitespace-nowrap shrink-0"
                  style={{
                    backgroundColor: primaryColor,
                    color: colors.textColorMuted,
                  }}
                >
                  x {item.count}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: colors.textColorMuted }}>
            {t.noPrize}
          </p>
        )}
      </div>

      <button
        onClick={onReset}
        className="w-full py-4 rounded-2xl font-bold text-lg transition"
        style={{ backgroundColor: primaryColor, color: colors.textColorMuted }}
      >
        {t.drawAgain}
      </button>
    </div>
  );
}
