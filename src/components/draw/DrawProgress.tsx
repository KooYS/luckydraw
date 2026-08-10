"use client";

import { useLang } from "@/lib/i18n";
import type { ResolvedTokens } from "@/lib/themeTokens";

interface DrawProgressProps {
  quantity: number;
  colors: ResolvedTokens;
}

/** 추첨 진행 상태 컴포넌트 */
export default function DrawProgress({
  quantity,
  colors,
}: DrawProgressProps) {
  const t = useLang();

  return (
    <div className="flex flex-col items-center">
      <div
        className="w-32 h-32 rounded-full animate-spin-slow border-4 border-t-transparent"
        style={{ borderColor: `${colors.spinnerColor} transparent` }}
      />
      <p
        className="mt-6 text-2xl font-bold animate-pulse"
        style={{ color: colors.progressText }}
      >
        {t.drawingN(quantity)}
      </p>

      <div className="w-full max-w-xs mt-4">
        <div
          className="h-2 rounded-full overflow-hidden relative"
          style={{ backgroundColor: colors.progressTrackBg }}
        >
          <div
            className="absolute h-full w-1/3 rounded-full animate-indeterminate"
            style={{ backgroundColor: colors.progressFillBg }}
          />
        </div>
        <p className="text-sm mt-2" style={{ color: colors.progressSubText }}>
          {t.drawing}
        </p>
      </div>
    </div>
  );
}
