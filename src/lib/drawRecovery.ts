/**
 * 응답을 못 받은 추첨의 복구 판정.
 *
 * 재고 차감과 결과 기록이 한 트랜잭션이므로, 히스토리에 배치가 있다 = 재고가 이미 빠졌다.
 * 화면이 그 배치를 확인(ack)했는지를 localStorage 워터마크로 추적해서,
 * "확인 못 한 최근 배치"가 있으면 재추첨 대신 그 결과를 되살린다.
 */

/** 배치 = created_at 이 같은 한 번의 추첨 */
export interface DrawBatch {
  /** 배치 식별자 겸 실행 시각 (동일성 비교 전용) */
  drawnAt: string;
  /** DB 시계 기준 경과 초 (앱/DB 타임존 어긋남에 안 휘둘리게 서버가 계산) */
  ageSec: number;
  total: number;
  items: {
    productId: number | null;
    productName: string | null;
    count: number;
  }[];
}

// ponytail: 미확인 배치로 볼 시간 창. 이보다 오래된 기록은 "지난 이력"으로 보고 안 띄운다.
//           끊긴 걸 알아채고 새로고침하는 데 10분씩 걸리진 않는다.
export const RECOVERY_WINDOW_SEC = 10 * 60;

const ackKey = (eventId: string) => `luckydraw:acked:${eventId}`;
const pendingKey = (eventId: string) => `luckydraw:pending:${eventId}`;

/** 추첨을 쐈다고 표시 (요청 직전). 남아 있으면 = 이 화면은 결과를 모른다는 뜻. */
export function markPending(eventId: string) {
  try {
    localStorage.setItem(pendingKey(eventId), String(Date.now()));
  } catch {
    // 저장 불가 환경 — 복구가 안 뜰 뿐, 잘못된 화면을 띄우진 않는다
  }
}

/** 결과를 확인했으니 표시 해제 */
export function clearPending(eventId: string) {
  try {
    localStorage.removeItem(pendingKey(eventId));
  } catch {
    // 무시
  }
}

export function hasPending(eventId: string): boolean {
  try {
    return localStorage.getItem(pendingKey(eventId)) !== null;
  } catch {
    return false;
  }
}

/** 이 배치는 화면으로 확인했다고 표시 (새로고침·기기 재시작에도 남아야 해서 localStorage) */
export function ack(eventId: string, drawnAt: string) {
  try {
    localStorage.setItem(ackKey(eventId), drawnAt);
  } catch {
    // 시크릿 모드 등 저장 불가 환경 — 복구 화면이 한 번 더 뜰 뿐이라 무시
  }
}

export function readAck(eventId: string): string | null {
  try {
    return localStorage.getItem(ackKey(eventId));
  } catch {
    return null;
  }
}

/**
 * 배치 시각 표시 (HH:MM:SS).
 *
 * drawnAt 은 DB 벽시계 문자열을 UTC 로 읽어들인 값이라, 로컬 시각으로 포맷하면
 * 서버 오프셋만큼 밀린다. UTC 부분을 그대로 꺼내야 DB 에 적힌 시각이 나온다.
 */
export function formatBatchTime(drawnAt: string): string {
  return drawnAt.slice(11, 19);
}

/**
 * 이 배치를 복구 화면으로 띄워야 하는가.
 *
 * 조건은 "이 화면이 추첨을 쐈는데 결과를 못 받았다"(pending)는 것.
 * 추첨을 쏘지도 않은 화면 — 두 번째 모니터, 새 탭, 뒤늦게 연 기기 — 이
 * 남의 정상 추첨을 사고로 오해하면 안 된다.
 */
export function shouldRecover(
  latest: DrawBatch | null | undefined,
  state: { pending: boolean; acked: string | null },
  windowSec: number = RECOVERY_WINDOW_SEC,
): boolean {
  if (!latest) return false;
  if (!state.pending) return false;
  if (latest.drawnAt === state.acked) return false;
  return latest.ageSec <= windowSec;
}
