"use client";

interface QuantitySelectorProps {
  quantity: number;
  maxQuantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onChange: (qty: number) => void;
  onQuickSelect: (qty: number) => void;
  colors: {
    textColor: string;
    buttonBg: string;
    inputBg: string;
    inputText: string;
    cardBg: string;
  };
  primaryColor: string;
}

/** 수량 선택 컴포넌트 */
export default function QuantitySelector({
  quantity,
  maxQuantity,
  onIncrement,
  onDecrement,
  onChange,
  onQuickSelect,
  colors,
  primaryColor,
}: QuantitySelectorProps) {
  const quickOptions = [1, 5, 10, 20];

  return (
    <div
      className="backdrop-blur rounded-2xl p-6"
      style={{ backgroundColor: colors.cardBg }}
    >
      <h2
        className="text-lg font-bold mb-4"
        style={{ color: colors.textColor }}
      >
        럭키드로우 수량 선택
      </h2>

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={onDecrement}
          className="w-12 h-12 rounded-full text-2xl font-bold transition"
          style={{ backgroundColor: colors.buttonBg, color: colors.textColor }}
        >
          -
        </button>
        <input
          type="number"
          min="1"
          max={Math.min(100, maxQuantity)}
          value={quantity}
          onChange={(e) => onChange(parseInt(e.target.value) || 1)}
          className="w-20 h-12 text-center text-2xl font-bold rounded-xl border-0"
          style={{ backgroundColor: colors.inputBg, color: colors.inputText }}
        />
        <button
          onClick={onIncrement}
          className="w-12 h-12 rounded-full text-2xl font-bold transition"
          style={{ backgroundColor: colors.buttonBg, color: colors.textColor }}
        >
          +
        </button>
      </div>

      <div className="flex justify-center gap-2 mt-4">
        {quickOptions.map((n) => (
          <button
            key={n}
            onClick={() => onQuickSelect(n)}
            disabled={n > maxQuantity}
            className="px-4 py-2 rounded-lg text-sm font-medium transition"
            style={{
              backgroundColor: quantity === n ? primaryColor : colors.buttonBg,
              color: quantity === n ? "#fff" : colors.textColor,
              opacity: n > maxQuantity ? 0.5 : 1,
              cursor: n > maxQuantity ? "not-allowed" : "pointer",
            }}
          >
            {n}개
          </button>
        ))}
      </div>
    </div>
  );
}
