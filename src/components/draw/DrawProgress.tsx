"use client";

interface DrawProgressProps {
  quantity: number;
  progress: number;
  hasPoster: boolean;
  primaryColor: string;
  colors: {
    textColorMuted: string;
    buttonBg: string;
  };
}

/** 추첨 진행 상태 컴포넌트 */
export default function DrawProgress({
  quantity,
  progress,
  hasPoster,
  primaryColor,
  colors,
}: DrawProgressProps) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-32 h-32 rounded-full animate-spin-slow border-4 border-t-transparent"
        style={{ borderColor: `${primaryColor} transparent` }}
      />
      <p
        className="mt-6 text-2xl font-bold animate-pulse"
        style={{ color: hasPoster ? "#fff" : primaryColor }}
      >
        {quantity}개 추첨 중...
      </p>

      <div className="w-full max-w-xs mt-4">
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: colors.buttonBg }}
        >
          <div
            className="h-full transition-all duration-100"
            style={{ width: `${progress}%`, backgroundColor: primaryColor }}
          />
        </div>
        <p className="text-sm mt-2" style={{ color: colors.textColorMuted }}>
          {progress}%
        </p>
      </div>
    </div>
  );
}
