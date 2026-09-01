// 복구 판정 자체 점검. 프레임워크 없음 — node --experimental-strip-types 로 직접 돌린다.
//   node --experimental-strip-types scripts/check-draw-recovery.ts
import assert from "node:assert/strict";
import {
  formatBatchTime,
  isUnacked,
  type DrawBatch,
} from "../src/lib/drawRecovery.ts";

const batch = (drawnAt: string, ageSec: number): DrawBatch => ({
  drawnAt,
  ageSec,
  total: 600,
  items: [{ productId: 1, productName: "1등", count: 600 }],
});

const T1 = "2026-09-01T10:00:00.000Z";
const T2 = "2026-09-01T10:00:30.000Z";

// 히스토리가 비었으면 복구할 게 없다
assert.equal(isUnacked(null, null), false);
assert.equal(isUnacked(undefined, T1), false);

// 화면이 이미 확인한 배치는 다시 안 띄운다
assert.equal(isUnacked(batch(T1, 5), T1), false);

// ★ 사고 시나리오: 응답을 못 받은 직후의 배치 → 반드시 복구
assert.equal(isUnacked(batch(T1, 40), null), true);

// 직전 추첨은 확인했고 그 다음 배치가 새로 생겼다 → 복구
assert.equal(isUnacked(batch(T2, 12), T1), true);

// 시간 창을 넘긴 기록은 "지난 이력"이라 안 띄운다
assert.equal(isUnacked(batch(T1, 601), null), false);
assert.equal(isUnacked(batch(T1, 600), null), true);

// 이력 목록의 시각 표기: DB 에 적힌 벽시계 그대로여야 한다.
// toLocaleTimeString 등으로 "정리"하면 실행 머신 타임존만큼 밀린다.
assert.equal(formatBatchTime("2026-09-01T19:04:12.000Z"), "19:04:12");

console.log("draw recovery checks passed");
