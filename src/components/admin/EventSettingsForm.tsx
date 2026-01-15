"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/common/ImageUpload";
import { ColorPicker, ColorSwatchGroup, ThemePreview } from "@/components/admin/theme";
import type { EventFormState } from "@/hooks/useEventDetail";

interface EventSettingsFormProps {
  form: EventFormState;
  onSubmit: (e: React.FormEvent) => void;
  updateField: <K extends keyof EventFormState>(field: K, value: EventFormState[K]) => void;
  isPending: boolean;
}

/** 이벤트 설정 폼 컴포넌트 */
export default function EventSettingsForm({
  form,
  onSubmit,
  updateField,
  isPending,
}: EventSettingsFormProps) {
  const swatches = [
    { label: "메인", color: form.primaryColor },
    { label: "보조", color: form.secondaryColor },
    { label: "배경", color: form.backgroundColor, border: true },
    { label: "강조", color: form.accentColor },
    { label: "제목", color: form.textColor },
    { label: "본문", color: form.subTextColor },
  ];

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="eventName">이벤트 이름 *</Label>
            <Input
              id="eventName"
              required
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventDesc">설명</Label>
            <Textarea
              id="eventDesc"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>테마 설정</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <ColorPicker
              label="메인 컬러"
              value={form.primaryColor}
              onChange={(value) => updateField("primaryColor", value)}
            />
            <ColorPicker
              label="보조 컬러"
              value={form.secondaryColor}
              onChange={(value) => updateField("secondaryColor", value)}
            />
            <ColorPicker
              label="배경 컬러"
              value={form.backgroundColor}
              onChange={(value) => updateField("backgroundColor", value)}
            />
            <ColorPicker
              label="강조 컬러"
              value={form.accentColor}
              onChange={(value) => updateField("accentColor", value)}
            />
            <ColorPicker
              label="제목 텍스트"
              value={form.textColor}
              onChange={(value) => updateField("textColor", value)}
            />
            <ColorPicker
              label="본문 텍스트"
              value={form.subTextColor}
              onChange={(value) => updateField("subTextColor", value)}
            />
          </div>

          <ColorSwatchGroup swatches={swatches} />

          <ThemePreview form={form} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>배경 이미지</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload
            label="배경 이미지"
            value={form.posterUrl}
            onChange={(url) => updateField("posterUrl", url)}
            folder="luckdraw/events/backgrounds"
            previewMode="cover"
          />
          <p className="text-xs text-muted-foreground mt-2">
            * 배경 이미지 설정 시 테마 색상 대신 이미지가 표시됩니다.
          </p>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "저장 중..." : "설정 저장"}
      </Button>
    </form>
  );
}
