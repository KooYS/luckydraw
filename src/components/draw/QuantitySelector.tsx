"use client";

import { useLang } from "@/lib/i18n";
import type { ResolvedTokens } from "@/lib/themeTokens";

interface QuantitySelectorProps {
  quantity: number;
  maxQuantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onChange: (qty: number) => void;
  onQuickIncrement: (qty: number) => void;
  colors: ResolvedTokens;
}

/** 수량 선택 컴포넌트 */
export default function QuantitySelector({
  quantity,
  maxQuantity,
  onIncrement,
  onDecrement,
  onChange,
  onQuickIncrement,
  colors,
}: QuantitySelectorProps) {
  const t = useLang();
  const quickOptions = [1, 5, 10, 20];

  return (
    <div
      className="backdrop-blur rounded-2xl p-6"
      data-token-part="quantityCard"
      style={{ backgroundColor: colors.quantityCardBg }}
    >
      <h2
        className="text-lg text-center font-bold mb-4"
        style={{ color: colors.quantityCardTitleText }}
      >
        {t.selectQuantity}
      </h2>

      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={onDecrement}
          data-token-part="stepper"
          className="w-12 h-12 rounded-full text-2xl font-bold transition"
          style={{
            backgroundColor: colors.stepperButtonBg,
            color: colors.stepperButtonText,
          }}
        >
          -
        </button>
        <input
          type="number"
          min="1"
          max={Math.min(100, maxQuantity)}
          value={quantity}
          onChange={(e) => onChange(parseInt(e.target.value) || 1)}
          data-token-part="quantityInput"
          className="w-20 h-12 text-center text-2xl font-bold rounded-xl border-0"
          style={{ backgroundColor: colors.inputBg, color: colors.inputText }}
        />
        <button
          type="button"
          onClick={onIncrement}
          data-token-part="stepper"
          className="w-12 h-12 rounded-full text-2xl font-bold transition"
          style={{
            backgroundColor: colors.stepperButtonBg,
            color: colors.stepperButtonText,
          }}
        >
          +
        </button>
      </div>

      <div className="flex justify-center gap-2 mt-4">
        {quickOptions.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onQuickIncrement(n)}
            data-token-part="quickButton"
            disabled={n > maxQuantity}
            className="px-4 py-2 rounded-lg text-sm font-medium transition"
            style={{
              backgroundColor: colors.quickButtonBg,
              color: colors.quickButtonText,
              opacity: n > maxQuantity ? 0.5 : 1,
              cursor: n > maxQuantity ? "not-allowed" : "pointer",
            }}
          >
            {t.unit(n)}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onChange(0)}
          data-token-part="resetButton"
          className="px-4 py-2 rounded-lg text-sm font-medium transition border"
          style={{
            backgroundColor: colors.resetButtonBg,
            color: colors.resetButtonText,
          }}
        >
          {t.reset}
        </button>
      </div>
    </div>
  );
}
