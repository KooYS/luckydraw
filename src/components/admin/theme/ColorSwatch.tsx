"use client";

interface ColorSwatchProps {
  label: string;
  color: string;
  border?: boolean;
}

/** 색상 스와치 컴포넌트 */
export default function ColorSwatch({ label, color, border }: ColorSwatchProps) {
  return (
    <div className="flex-1 text-center">
      <div
        className={`h-12 rounded-lg mb-1 ${border ? "border" : ""}`}
        style={{ backgroundColor: color }}
      />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

interface ColorSwatchGroupProps {
  swatches: Array<{
    label: string;
    color: string;
    border?: boolean;
  }>;
}

/** 색상 스와치 그룹 컴포넌트 */
export function ColorSwatchGroup({ swatches }: ColorSwatchGroupProps) {
  return (
    <div className="mt-6 flex gap-3">
      {swatches.map((swatch) => (
        <ColorSwatch
          key={swatch.label}
          label={swatch.label}
          color={swatch.color}
          border={swatch.border}
        />
      ))}
    </div>
  );
}
