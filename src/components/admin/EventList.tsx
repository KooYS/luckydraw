"use client";

import Link from "next/link";
import { Event } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface EventListProps {
  events: Event[];
  loading: boolean;
  onDelete: (id: number) => void;
  onToggle: (id: number, isActive: boolean) => void;
  deletePending: boolean;
  togglePending: boolean;
}

/** 이벤트 목록 컴포넌트 */
export default function EventList({
  events,
  loading,
  onDelete,
  onToggle,
  deletePending,
  togglePending,
}: EventListProps) {
  if (loading) {
    return (
      <div className="text-center py-16 text-muted-foreground">로딩 중...</div>
    );
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-16">
          <p className="text-muted-foreground mb-4">등록된 이벤트가 없습니다.</p>
          <Button variant="link" asChild>
            <Link href="/admin/events/new">첫 번째 이벤트 만들기 →</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {events.map((event) => (
        <Card key={event.id}>
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-lg"
                style={{ backgroundColor: event.primaryColor }}
              />
              <div>
                <h2 className="text-xl font-bold">{event.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {event.description || "설명 없음"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={event.isActive}
                  onCheckedChange={(checked) => onToggle(event.id, checked)}
                  disabled={togglePending}
                />
                <Badge variant={event.isActive ? "default" : "secondary"}>
                  {event.isActive ? "운영 중" : "중지"}
                </Badge>
              </div>

              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/events/${event.id}`}>관리</Link>
              </Button>
              <Button variant="secondary" size="sm" asChild>
                <Link href={`/draw/${event.id}`}>실행</Link>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(event.id)}
                disabled={deletePending}
              >
                삭제
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
