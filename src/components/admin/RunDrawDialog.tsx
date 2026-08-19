"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface RunDrawDialogProps {
  eventId: number;
  /** 실행 버튼 (호출부 스타일 그대로 사용) */
  children: React.ReactNode;
}

/** 실행 클릭 → 언어 선택 → 럭키드로우 페이지로 이동 */
export default function RunDrawDialog({
  eventId,
  children,
}: RunDrawDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>언어 선택</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2">
          <Button asChild>
            <Link href={`/draw/${eventId}`}>한국어</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href={`/draw/${eventId}?lang=ja`}>日本語</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
