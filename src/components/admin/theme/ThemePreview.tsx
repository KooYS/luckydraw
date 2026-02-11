"use client";

export interface ThemeFormData {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  subTextColor: string;
  accentColor: string;
}

interface ThemePreviewProps {
  form: ThemeFormData;
}

/** 럭키드로우 테마 미리보기 컴포넌트 */
export default function ThemePreview({ form }: ThemePreviewProps) {
  return (
    <div className="mt-6">
      <p className="text-sm text-muted-foreground mb-2">
        럭키드로우 화면 미리보기
      </p>
      <div
        className="p-6 rounded-xl relative overflow-hidden"
        style={{ backgroundColor: form.backgroundColor }}
      >
        {/* 이벤트 제목 */}
        <h3
          className="text-xl font-bold mb-4 text-center"
          style={{ color: form.primaryColor }}
        >
          {form.name || "이벤트 이름"}
        </h3>

        {/* 수량 선택 카드 */}
        <div
          className="rounded-xl p-4 mb-4"
          style={{ backgroundColor: `${form.accentColor}20` }}
        >
          <p
            className="text-sm text-center font-medium mb-3"
            style={{ color: form.textColor }}
          >
            럭키드로우 수량 선택
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              className="w-8 h-8 rounded-full text-lg font-bold"
              style={{
                backgroundColor: `${form.secondaryColor}20`,
                color: form.textColor,
              }}
            >
              -
            </button>
            <div
              className="w-12 h-8 rounded-lg flex items-center justify-center font-bold"
              style={{
                backgroundColor: form.backgroundColor,
                color: form.textColor,
              }}
            >
              5
            </div>
            <button
              type="button"
              className="w-8 h-8 rounded-full text-lg font-bold"
              style={{
                backgroundColor: `${form.secondaryColor}20`,
                color: form.textColor,
              }}
            >
              +
            </button>
          </div>
          <div className="flex justify-center gap-2 mt-3">
            {[1, 5, 10].map((n) => (
              <span
                key={n}
                className="px-3 py-1 rounded-md text-xs font-medium"
                style={{
                  backgroundColor:
                    n === 5 ? form.primaryColor : `${form.secondaryColor}20`,
                  color: n === 5 ? "#fff" : form.textColor,
                }}
              >
                {n}개
              </span>
            ))}
          </div>
        </div>

        {/* 추첨 버튼 */}
        <button
          type="button"
          className="w-full py-3 rounded-xl text-white font-bold mb-4"
          style={{
            backgroundColor: form.primaryColor,
            boxShadow: `0 4px 15px ${form.primaryColor}40`,
          }}
        >
          5개 추첨하기
        </button>

        {/* 실시간 재고 & 확률 */}
        <div
          className="rounded-xl p-3"
          style={{ backgroundColor: `${form.secondaryColor}15` }}
        >
          <div className="flex justify-between items-center mb-2">
            <span
              className="text-xs font-medium"
              style={{ color: form.subTextColor }}
            >
              실시간 재고 & 확률
            </span>
            <span className="text-xs" style={{ color: form.subTextColor }}>
              총 재고: 100개
            </span>
          </div>
          {/* 상품 목록 */}
          {[
            { name: "상품 A", prob: 50, stock: "50/50" },
            { name: "상품 B", prob: 30, stock: "30/30" },
            { name: "상품 C", prob: 20, stock: "20/20" },
          ].map((item) => (
            <div
              key={item.name}
              className="rounded-lg overflow-hidden mb-1"
              style={{ backgroundColor: `${form.accentColor}20` }}
            >
              <div className="flex items-center justify-between px-2 py-1.5">
                <span
                  className="text-xs font-medium"
                  style={{ color: form.textColor }}
                >
                  {item.name}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-bold"
                    style={{ color: form.accentColor }}
                  >
                    {item.prob}%
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: form.subTextColor }}
                  >
                    {item.stock}
                  </span>
                </div>
              </div>
              <div
                className="h-1.5"
                style={{ backgroundColor: `${form.subTextColor}30` }}
              >
                <div
                  className="h-full"
                  style={{
                    width: `${item.prob}%`,
                    backgroundColor: form.primaryColor,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
