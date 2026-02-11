"use client";

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
  return (
    <div className="space-y-6">
      <h2
        className="text-2xl font-bold"
        style={{ color: colors.textColor }}
      >
        추첨 결과
      </h2>

      <div
        className="backdrop-blur rounded-2xl p-6 space-y-3"
        style={{ backgroundColor: colors.cardBg }}
      >
        {summary.length > 0 ? (
          summary.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-xl p-4"
              style={{ backgroundColor: colors.cardBgHover }}
            >
              <div className="flex items-center gap-3">
                {item.product.imageUrl ? (
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                    style={{ backgroundColor: colors.buttonBg }}
                  >
                    🎁
                  </div>
                )}
                <span className="font-medium" style={{ color: colors.textColor }}>
                  {item.product.name}
                </span>
              </div>
              <span
                className="text-xl font-bold px-4 py-1 rounded-full"
                style={{ backgroundColor: primaryColor, color: colors.textColorMuted }}
              >
                x {item.count}
              </span>
            </div>
          ))
        ) : (
          <p style={{ color: colors.textColorMuted }}>
            재고가 없어 당첨 상품이 없습니다.
          </p>
        )}
      </div>

      <button
        onClick={onReset}
        className="w-full py-4 rounded-2xl font-bold text-lg transition"
        style={{ backgroundColor: primaryColor, color: colors.textColorMuted }}
      >
        다시 추첨하기
      </button>
    </div>
  );
}
