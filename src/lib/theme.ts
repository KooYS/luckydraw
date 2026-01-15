import { EventTheme } from "@/db/schema";

// 기본 테마 (이벤트가 없을 때 사용)
export const defaultTheme: EventTheme = {
  primaryColor: "#c026d3",
  secondaryColor: "#701a75",
  backgroundColor: "#fdf4ff",
  textColor: "#1f2937",
  subTextColor: "#6b7280",
  accentColor: "#e879f9",
  posterUrl: null,
  logoUrl: null,
};

// CSS 변수로 변환
export function themeToCssVariables(theme: EventTheme): Record<string, string> {
  return {
    "--color-primary": theme.primaryColor,
    "--color-secondary": theme.secondaryColor,
    "--color-background": theme.backgroundColor,
    "--color-text": theme.textColor,
    "--color-sub-text": theme.subTextColor,
    "--color-accent": theme.accentColor,
  };
}

// 테마를 DOM에 적용
export function applyTheme(theme: EventTheme): void {
  const variables = themeToCssVariables(theme);
  const root = document.documentElement;

  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

// HEX to RGB 변환 (opacity 지원용)
export function hexToRgb(
  hex: string
): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// 밝기 계산 (텍스트 색상 자동 결정용)
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const { r, g, b } = rgb;
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// 배경색에 따라 텍스트 색상 자동 결정
export function getContrastColor(backgroundColor: string): string {
  const luminance = getLuminance(backgroundColor);
  return luminance > 0.5 ? "#1f2937" : "#ffffff";
}
