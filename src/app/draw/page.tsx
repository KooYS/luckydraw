'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Event } from '@/db/schema'

export default function DrawSelectPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/events')
      .then((res) => res.json())
      .then((data) => {
        setEvents(data.filter((e: Event) => e.isActive))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-background">
        <div className="text-xl text-theme-text">로딩 중...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen p-8 bg-theme-background">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-theme-primary mb-8 text-center">
          이벤트 선택
        </h1>

        {events.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-theme-text opacity-70 mb-4">
              활성화된 이벤트가 없습니다.
            </p>
            <Link
              href="/admin"
              className="text-theme-primary hover:underline"
            >
              관리자 대시보드에서 이벤트 생성하기
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/draw/${event.id}`}
                className="block p-6 rounded-xl border-2 border-theme-accent hover:border-theme-primary transition-all hover:shadow-lg"
                style={{
                  backgroundColor: event.backgroundColor,
                  borderColor: event.accentColor,
                }}
              >
                <div className="flex items-center gap-4">
                  {event.posterUrl && (
                    <img
                      src={event.posterUrl}
                      alt={event.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <h2
                      className="text-xl font-bold"
                      style={{ color: event.primaryColor }}
                    >
                      {event.name}
                    </h2>
                    {event.description && (
                      <p
                        className="opacity-70 mt-1"
                        style={{ color: event.textColor }}
                      >
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-theme-text opacity-50 hover:opacity-100"
          >
            ← 홈으로
          </Link>
        </div>
      </div>
    </main>
  )
}
