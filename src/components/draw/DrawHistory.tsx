"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { formatBatchTime, readAck, type DrawBatch } from "@/lib/drawRecovery";

interface DrawHistoryProps {
  eventId: string;
  onClose: () => void;
}

/**
 * 추첨 이력 패널 (운영자용).
 *
 * 재고 차감과 결과 기록은 한 트랜잭션이라, 네트워크가 끊겨 화면이 결과를 못 받았어도
 * 추첨이 실행됐다면 여기 반드시 남는다. 새로고침 후 이 목록에서 그때의 상품을 확인한다.
 * 테마 색을 안 쓴다 — SecretMenu 와 같은 운영자 도구라 관객 화면과 구분되게 둔다.
 */
export default function DrawHistory({ eventId, onClose }: DrawHistoryProps) {
  const t = useLang();
  const [batches, setBatches] = useState<DrawBatch[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [openAt, setOpenAt] = useState<string | null>(null);

  const acked = readAck(eventId);
  // ack 기록이 아예 없으면 판단 불가 — 전부 "미확인"으로 칠하면 노이즈만 된다.
  const isUnseen = (drawnAt: string) => !!acked && drawnAt > acked;

  useEffect(() => {
    fetch(`/api/events/${eventId}/batches?limit=20`, {
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("failed"))))
      .then((data) => setBatches(data.batches ?? []))
      .catch(() => setFailed(true));
  }, [eventId]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md max-h-[80vh] flex flex-col rounded-2xl bg-neutral-900 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">{t.historyTitle}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition"
            aria-label={t.close}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {failed && (
            <p className="px-5 py-8 text-center text-sm text-red-400">
              {t.historyLoadFailed}
            </p>
          )}

          {!failed && batches === null && (
            <p className="px-5 py-8 text-center text-sm text-white/50">
              {t.loading}
            </p>
          )}

          {batches?.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-white/50">
              {t.historyEmpty}
            </p>
          )}

          {batches?.map((batch) => {
            const expanded = openAt === batch.drawnAt;
            return (
              <div key={batch.drawnAt} className="border-b border-white/5">
                <button
                  type="button"
                  onClick={() => setOpenAt(expanded ? null : batch.drawnAt)}
                  className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-white/5 transition"
                >
                  {expanded ? (
                    <ChevronDown size={16} className="shrink-0 text-white/40" />
                  ) : (
                    <ChevronRight size={16} className="shrink-0 text-white/40" />
                  )}
                  <span className="font-mono text-sm text-white/80">
                    {formatBatchTime(batch.drawnAt)}
                  </span>
                  <span className="ml-auto text-sm font-bold text-white">
                    {t.unit(batch.total)}
                  </span>
                  {isUnseen(batch.drawnAt) && (
                    <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-xs font-bold text-amber-300">
                      {t.historyUnseen}
                    </span>
                  )}
                </button>

                {expanded && (
                  <ul className="px-5 pb-3 space-y-1">
                    {batch.items.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between gap-3 rounded-lg bg-white/5 px-3 py-2"
                      >
                        <span className="text-sm text-white/90 break-all line-clamp-2">
                          {item.productName ?? "-"}
                        </span>
                        <span className="shrink-0 text-sm font-bold text-white">
                          x {item.count}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
