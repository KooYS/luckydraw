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

  // 응답을 못 받은 추첨 복구 / 실패 안내
  recoveredTitle: "확인되지 않은 추첨 결과",
  recoveredDesc: (ago: string, n: number) =>
    `${ago} 전에 실행된 ${n}개 추첨입니다. 재고는 이미 차감되었으니 다시 추첨하지 마세요.`,
  recoveredAck: "확인했습니다 · 계속하기",
  agoSec: (n: number) => `${n}초`,
  agoMin: (n: number) => `${n}분`,
  drawFailedSafe: "네트워크 오류로 추첨이 실행되지 않았습니다. 재고는 그대로입니다. 다시 시도하세요.",
  drawUnknown: "결과를 확인할 수 없습니다. 재고 현황을 확인한 뒤 진행하세요.",

  // 추첨 이력
  historyTitle: "추첨 이력",
  historyEmpty: "추첨 기록이 없습니다.",
  historyUnseen: "미확인",
  historyLoadFailed: "이력을 불러오지 못했습니다.",
  close: "닫기",
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

  recoveredTitle: "未確認の抽選結果",
  recoveredDesc: (ago: string, n: number) =>
    `${ago}前に実行された${n}個の抽選です。在庫はすでに引かれているため、再抽選しないでください。`,
  recoveredAck: "確認しました · 続ける",
  agoSec: (n: number) => `${n}秒`,
  agoMin: (n: number) => `${n}分`,
  drawFailedSafe:
    "ネットワークエラーで抽選は実行されませんでした。在庫はそのままです。もう一度お試しください。",
  drawUnknown: "結果を確認できません。在庫状況を確認してから進めてください。",

  historyTitle: "抽選履歴",
  historyEmpty: "抽選記録がありません。",
  historyUnseen: "未確認",
  historyLoadFailed: "履歴を読み込めませんでした。",
  close: "閉じる",
};

const dict = { ko, ja };

export type Dict = typeof ko;

/** ?lang=ja → 일본어, 그 외 전부 한국어 */
export function useLang(): Dict {
  const lang = useSearchParams().get("lang");
  return dict[lang as keyof typeof dict] ?? dict.ko;
}
