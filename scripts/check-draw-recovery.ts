// 복구 판정 자체 점검. 프레임워크 없음 — node --experimental-strip-types 로 직접 돌린다.
//   node --experimental-strip-types scripts/check-draw-recovery.ts
import assert from "node:assert/strict";
import {
  formatBatchTime,
  shouldRecover,
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

const fired = (acked: string | null = null) => ({ pending: true, acked });
const idle = (acked: string | null = null) => ({ pending: false, acked });

// 히스토리가 비었으면 복구할 게 없다
assert.equal(shouldRecover(null, fired()), false);
assert.equal(shouldRecover(undefined, fired(T1)), false);

// 화면이 이미 확인한 배치는 다시 안 띄운다
assert.equal(shouldRecover(batch(T1, 5), fired(T1)), false);

// ★ 사고 시나리오: 추첨을 쐈는데 응답을 못 받았다 → 반드시 복구
assert.equal(shouldRecover(batch(T1, 40), fired()), true);

// 직전 추첨은 확인했고 그 다음 배치가 새로 생겼다 → 복구
assert.equal(shouldRecover(batch(T2, 12), fired(T1)), true);

// ★ 병렬 화면: 추첨을 쏜 적 없는 화면은 남의 추첨을 사고로 오해하면 안 된다
assert.equal(shouldRecover(batch(T1, 3), idle()), false);
assert.equal(shouldRecover(batch(T2, 3), idle(T1)), false);

// 시간 창을 넘긴 기록은 "지난 이력"이라 안 띄운다
assert.equal(shouldRecover(batch(T1, 601), fired()), false);
assert.equal(shouldRecover(batch(T1, 600), fired()), true);

// 이력 목록의 시각 표기: DB 에 적힌 벽시계 그대로여야 한다.
// toLocaleTimeString 등으로 "정리"하면 실행 머신 타임존만큼 밀린다.
assert.equal(formatBatchTime("2026-09-01T19:04:12.000Z"), "19:04:12");

console.log("draw recovery checks passed");
