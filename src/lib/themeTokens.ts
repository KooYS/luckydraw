/**
 * 럭키드로우 화면의 색 슬롯 정의.
 *
 * 관리자는 기본 6색(그룹)만 정해도 되고, 그룹을 펼쳐 개별 슬롯을 덮어쓸 수도 있다.
 * 덮어쓰지 않은 슬롯은 derive()로 그룹 색에서 파생된다 — 즉 기존 이벤트는 그대로 동작한다.
 */

/** 파생에 필요한 기본 6색. db/schema의 EventTheme이 구조적으로 이걸 만족한다 (순환 import 회피) */
export interface BaseThemeColors {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  subTextColor: string;
  accentColor: string;
  posterUrl?: string | null;
}

/** 토큰이 속한 기본 색 그룹 = events 테이블의 기존 6개 컬럼 */
export type TokenGroup =
  | "primaryColor"
  | "secondaryColor"
  | "backgroundColor"
  | "accentColor"
  | "textColor"
  | "subTextColor";

/** 관리자 UI에 노출되는 그룹 순서 */
export const THEME_GROUPS: TokenGroup[] = [
  "primaryColor",
  "secondaryColor",
  "backgroundColor",
  "accentColor",
  "textColor",
  "subTextColor",
];

export const TOKEN_GROUP_LABELS: Record<TokenGroup, string> = {
  primaryColor: "메인 컬러",
  secondaryColor: "보조 컬러",
  backgroundColor: "배경 컬러",
  accentColor: "강조 컬러",
  textColor: "제목 텍스트",
  subTextColor: "본문 텍스트",
};

/** 미리보기에서 클릭 가능한 화면 요소. data-token-part 속성값과 1:1 */
export type TokenPart =
  | "pageBackground"
  | "title"
  | "quantityCard"
  | "stepper"
  | "quantityInput"
  | "quickButton"
  | "resetButton"
  | "drawButton"
  | "stockPanel"
  | "stockRow"
  | "stockGauge"
  | "stockDrawer"
  | "spinner"
  | "progressLabel"
  | "progressBar"
  | "resultTitle"
  | "resultCard"
  | "resultRow"
  | "resultBadge"
  | "resultAgainButton";

export const TOKEN_PART_LABELS: Record<TokenPart, string> = {
  pageBackground: "화면 배경",
  title: "이벤트 제목",
  quantityCard: "수량 선택 카드",
  stepper: "+/- 버튼",
  quantityInput: "수량 입력창",
  quickButton: "빠른선택 버튼",
  resetButton: "초기화 버튼",
  drawButton: "추첨 버튼",
  stockPanel: "재고 패널",
  stockRow: "재고 상품 행",
  stockGauge: "확률 게이지",
  stockDrawer: "재고 패널 아이콘",
  spinner: "로딩 스피너",
  progressLabel: "추첨 중 문구",
  progressBar: "진행바",
  resultTitle: "결과 제목",
  resultCard: "결과 카드",
  resultRow: "결과 상품 행",
  resultBadge: "수량 뱃지",
  resultAgainButton: "다시하기 버튼",
};

/** 미리보기에서 어느 화면을 봐야 이 토큰이 보이는지 */
export type TokenScreen = "select" | "stock" | "drawing" | "result";

interface TokenDef {
  id: string;
  label: string;
  group: TokenGroup;
  screen: TokenScreen;
  /** 미리보기에서 클릭 가능한 화면 요소 */
  part: TokenPart;
  /** 오버라이드가 없을 때의 값. 기존 deriveDrawColors 로직을 그대로 옮긴 것 */
  derive: (t: BaseThemeColors, hasPoster: boolean) => string;
}

const cardBg = (t: BaseThemeColors, hasPoster: boolean) =>
  hasPoster ? "rgba(255,255,255,0.1)" : `${t.accentColor}20`;
const cardBgHover = (t: BaseThemeColors, hasPoster: boolean) =>
  hasPoster ? "rgba(255,255,255,0.2)" : `${t.accentColor}30`;
const buttonBg = (t: BaseThemeColors, hasPoster: boolean) =>
  hasPoster ? "rgba(255,255,255,0.2)" : `${t.secondaryColor}20`;
const infoBg = (t: BaseThemeColors, hasPoster: boolean) =>
  hasPoster ? "rgba(0,0,0,0.3)" : `${t.secondaryColor}15`;
const faint = (t: BaseThemeColors) => `${t.subTextColor}80`;

export const THEME_TOKENS = [
  // ─── 메인 컬러 ───
  {
    id: "quickButtonBg",
    part: "quickButton",
    label: "빠른선택 버튼 배경",
    group: "primaryColor",
    screen: "select",
    derive: (t) => t.primaryColor,
  },
  {
    id: "drawButtonBg",
    part: "drawButton",
    label: "추첨 버튼 배경",
    group: "primaryColor",
    screen: "select",
    derive: (t) => t.primaryColor,
  },
  {
    id: "spinnerColor",
    part: "spinner",
    label: "로딩 스피너",
    group: "primaryColor",
    screen: "drawing",
    derive: (t) => t.primaryColor,
  },
  {
    id: "progressFillBg",
    part: "progressBar",
    label: "진행바 채움",
    group: "primaryColor",
    screen: "drawing",
    derive: (t) => t.primaryColor,
  },
  {
    id: "gaugeHighBg",
    part: "stockGauge",
    label: "확률 게이지 (높음)",
    group: "primaryColor",
    screen: "stock",
    derive: (t) => t.primaryColor,
  },
  {
    id: "stockPinActiveColor",
    part: "stockDrawer",
    label: "재고 패널 핀 활성",
    group: "primaryColor",
    screen: "stock",
    derive: (t) => t.primaryColor,
  },
  {
    id: "resultBadgeBg",
    part: "resultBadge",
    label: "수량 뱃지 배경",
    group: "primaryColor",
    screen: "result",
    derive: (t) => t.primaryColor,
  },
  {
    id: "resultAgainButtonBg",
    part: "resultAgainButton",
    label: "다시하기 버튼 배경",
    group: "primaryColor",
    screen: "result",
    derive: (t) => t.primaryColor,
  },

  // ─── 보조 컬러 ───
  {
    id: "stepperButtonBg",
    part: "stepper",
    label: "+/- 버튼 배경",
    group: "secondaryColor",
    screen: "select",
    derive: buttonBg,
  },
  {
    id: "resetButtonBg",
    part: "resetButton",
    label: "초기화 버튼 배경",
    group: "secondaryColor",
    screen: "select",
    derive: buttonBg,
  },
  {
    id: "stockPanelBg",
    part: "stockPanel",
    label: "재고 패널 배경",
    group: "secondaryColor",
    screen: "stock",
    derive: infoBg,
  },
  {
    id: "gaugeLowBg",
    part: "stockGauge",
    label: "확률 게이지 (낮음)",
    group: "secondaryColor",
    screen: "stock",
    derive: (t) => t.secondaryColor,
  },
  {
    id: "progressTrackBg",
    part: "progressBar",
    label: "진행바 트랙",
    group: "secondaryColor",
    screen: "drawing",
    derive: buttonBg,
  },
  {
    id: "resultImageBg",
    part: "resultRow",
    label: "상품 이미지 자리 배경",
    group: "secondaryColor",
    screen: "result",
    derive: buttonBg,
  },

  // ─── 배경 컬러 ───
  {
    id: "pageBg",
    part: "pageBackground",
    label: "화면 배경",
    group: "backgroundColor",
    screen: "select",
    derive: (t) => t.backgroundColor,
  },
  {
    id: "inputBg",
    part: "quantityInput",
    label: "수량 입력창 배경",
    group: "backgroundColor",
    screen: "select",
    derive: (t, hasPoster) => (hasPoster ? "#ffffff" : t.backgroundColor),
  },

  // ─── 강조 컬러 ───
  {
    id: "quantityCardBg",
    part: "quantityCard",
    label: "수량 선택 카드 배경",
    group: "accentColor",
    screen: "select",
    derive: cardBg,
  },
  {
    id: "stockRowBg",
    part: "stockRow",
    label: "재고 상품 행 배경",
    group: "accentColor",
    screen: "stock",
    derive: cardBg,
  },
  {
    id: "gaugeMidBg",
    part: "stockGauge",
    label: "확률 게이지 (보통)",
    group: "accentColor",
    screen: "stock",
    derive: (t) => t.accentColor,
  },
  {
    id: "resultCardBg",
    part: "resultCard",
    label: "결과 카드 배경",
    group: "accentColor",
    screen: "result",
    derive: cardBg,
  },
  {
    id: "resultRowBg",
    part: "resultRow",
    label: "결과 상품 행 배경",
    group: "accentColor",
    screen: "result",
    derive: cardBgHover,
  },

  // ─── 제목 텍스트 ───
  {
    id: "titleText",
    part: "title",
    label: "이벤트 제목",
    group: "textColor",
    screen: "select",
    derive: (t) => t.textColor,
  },
  {
    id: "quantityCardTitleText",
    part: "quantityCard",
    label: "수량 선택 카드 제목",
    group: "textColor",
    screen: "select",
    derive: (t) => t.textColor,
  },
  {
    id: "stepperButtonText",
    part: "stepper",
    label: "+/- 버튼 글자",
    group: "textColor",
    screen: "select",
    derive: (t) => t.textColor,
  },
  {
    id: "quickButtonText",
    part: "quickButton",
    label: "빠른선택 버튼 글자",
    group: "textColor",
    screen: "select",
    derive: (t) => t.textColor,
  },
  {
    id: "resetButtonText",
    part: "resetButton",
    label: "초기화 버튼 글자",
    group: "textColor",
    screen: "select",
    derive: (t) => t.textColor,
  },
  {
    id: "inputText",
    part: "quantityInput",
    label: "수량 입력창 글자",
    group: "textColor",
    screen: "select",
    derive: (t, hasPoster) => (hasPoster ? t.primaryColor : t.textColor),
  },
  {
    id: "stockProductNameText",
    part: "stockRow",
    label: "재고 상품명",
    group: "textColor",
    screen: "stock",
    derive: (t) => t.textColor,
  },
  {
    id: "progressText",
    part: "progressLabel",
    label: "추첨 중 문구",
    group: "textColor",
    screen: "drawing",
    derive: (t) => t.textColor,
  },
  {
    id: "resultTitleText",
    part: "resultTitle",
    label: "결과 제목",
    group: "textColor",
    screen: "result",
    derive: (t) => t.textColor,
  },
  {
    id: "resultProductNameText",
    part: "resultRow",
    label: "결과 상품명",
    group: "textColor",
    screen: "result",
    derive: (t) => t.textColor,
  },

  // ─── 본문 텍스트 ───
  {
    id: "drawButtonText",
    part: "drawButton",
    label: "추첨 버튼 글자",
    group: "subTextColor",
    screen: "select",
    derive: (t) => t.subTextColor,
  },
  {
    id: "stockPanelTitleText",
    part: "stockPanel",
    label: "재고 패널 제목",
    group: "subTextColor",
    screen: "stock",
    derive: (t) => t.subTextColor,
  },
  {
    id: "stockCountText",
    part: "stockRow",
    label: "재고 수량 글자",
    group: "subTextColor",
    screen: "stock",
    derive: (t) => t.subTextColor,
  },
  {
    id: "stockMutedText",
    part: "stockRow",
    label: "품절 상품 글자",
    group: "subTextColor",
    screen: "stock",
    derive: faint,
  },
  {
    id: "gaugeTrackBg",
    part: "stockGauge",
    label: "확률 게이지 트랙",
    group: "subTextColor",
    screen: "stock",
    // faint()는 이미 알파 80을 붙이므로 여기에 30을 또 붙이면 10자리 무효 hex가 된다
    derive: (t) => `${t.subTextColor}30`,
  },
  {
    id: "stockDrawerIconColor",
    part: "stockDrawer",
    label: "재고 패널 아이콘",
    group: "subTextColor",
    screen: "stock",
    derive: (t) => t.subTextColor,
  },
  {
    id: "progressSubText",
    part: "progressLabel",
    label: "진행 상태 보조 문구",
    group: "subTextColor",
    screen: "drawing",
    derive: (t) => t.subTextColor,
  },
  {
    id: "resultBadgeText",
    part: "resultBadge",
    label: "수량 뱃지 글자",
    group: "subTextColor",
    screen: "result",
    derive: (t) => t.subTextColor,
  },
  {
    id: "resultAgainButtonText",
    part: "resultAgainButton",
    label: "다시하기 버튼 글자",
    group: "subTextColor",
    screen: "result",
    derive: (t) => t.subTextColor,
  },
] as const satisfies readonly TokenDef[];

export type TokenId = (typeof THEME_TOKENS)[number]["id"];

/** 이벤트별 색 오버라이드 (events.theme_tokens JSON 컬럼) */
export type ThemeTokenOverrides = Partial<Record<TokenId, string>>;

/** 모든 슬롯의 최종 색 */
export type ResolvedTokens = Record<TokenId, string>;

/** 기본 6색 + 오버라이드 → 최종 색 맵 */
export function resolveThemeTokens(
  theme: BaseThemeColors | null,
  overrides?: ThemeTokenOverrides | null,
): ResolvedTokens {
  const base: BaseThemeColors = theme ?? FALLBACK_THEME;
  const hasPoster = !!base.posterUrl;

  const resolved = {} as ResolvedTokens;
  for (const token of THEME_TOKENS) {
    resolved[token.id] = overrides?.[token.id] || token.derive(base, hasPoster);
  }
  return resolved;
}

/** 이벤트 로딩 전/실패 시 쓰는 중립 테마 */
const FALLBACK_THEME: BaseThemeColors = {
  primaryColor: "#c026d3",
  secondaryColor: "#701a75",
  backgroundColor: "#ffffff",
  textColor: "#1f2937",
  subTextColor: "#6b7280",
  accentColor: "#e879f9",
  posterUrl: null,
};
