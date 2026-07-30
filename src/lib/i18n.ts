"use client";

import { useSearchParams } from "next/navigation";

// ponytail: dict 1개 + 훅 1개. next-intl 안 씀 — 문구 15개에 라우팅/미들웨어/프로바이더는 과함.
// 문구가 50개 넘거나 복수형·날짜 포맷이 필요해지면 next-intl로 교체.

const ko = {
  loading: "로딩 중...",
  eventNotFound: "이벤트를 찾을 수 없습니다.",
  selectQuantity: "럭키드로우 수량 선택",
  unit: (n: number) => `${n}개`,
  reset: "초기화",
  drawN: (n: number) => `${n}개 추첨하기`,
  soldOut: "모든 상품의 재고가 소진되었습니다.",
  drawingN: (n: number) => `${n}개 추첨 중...`,
  drawing: "추첨 진행 중...",
  result: "추첨 결과",
  noPrize: "재고가 없어 당첨 상품이 없습니다.",
  drawAgain: "다시 추첨하기",
  stockStatus: "재고 현황",
  liveStock: "실시간 재고",
  totalStock: (n: number) => `총 재고: ${n}개`,
};

// 타입 주석이 키 누락 검사 역할 — ja에 빠진 키가 있으면 빌드가 깨진다.
const ja: typeof ko = {
  loading: "読み込み中...",
  eventNotFound: "イベントが見つかりません。",
  // 아래 4개는 유저 지정 번역 — 임의 수정 금지
  selectQuantity: "ラッキードロー数量選択",
  unit: (n: number) => `${n}個`,
  reset: "リセット",
  drawN: (n: number) => `${n}個引く`,
  soldOut: "すべての景品が品切れです。",
  drawingN: (n: number) => `${n}個 抽選中...`,
  drawing: "抽選中...",
  result: "抽選結果",
  noPrize: "在庫がないため、当選景品はありません。",
  drawAgain: "もう一度抽選する",
  stockStatus: "在庫状況",
  liveStock: "リアルタイム在庫",
  totalStock: (n: number) => `総在庫：${n}個`,
};

const dict = { ko, ja };

export type Dict = typeof ko;

/** ?lang=ja → 일본어, 그 외 전부 한국어 */
export function useLang(): Dict {
  const lang = useSearchParams().get("lang");
  return dict[lang as keyof typeof dict] ?? dict.ko;
}
