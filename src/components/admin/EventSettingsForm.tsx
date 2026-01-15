"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/common/ImageUpload";
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
          </div>

          <div className="mt-6 flex gap-3">
            <ColorSwatch label="메인" color={form.primaryColor} />
            <ColorSwatch label="보조" color={form.secondaryColor} />
            <ColorSwatch label="배경" color={form.backgroundColor} border />
            <ColorSwatch label="강조" color={form.accentColor} />
          </div>

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

/** 색상 선택 컴포넌트 */
function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 rounded cursor-pointer border"
        />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="flex-1" />
      </div>
    </div>
  );
}

/** 색상 스와치 컴포넌트 */
function ColorSwatch({
  label,
  color,
  border,
}: {
  label: string;
  color: string;
  border?: boolean;
}) {
  return (
    <div className="flex-1 text-center">
      <div
        className={`h-12 rounded-lg mb-1 ${border ? "border" : ""}`}
        style={{ backgroundColor: color }}
      />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

/** 테마 미리보기 컴포넌트 */
function ThemePreview({ form }: { form: EventFormState }) {
  return (
    <div className="mt-6">
      <p className="text-sm text-muted-foreground mb-2">화면 미리보기</p>
      <div
        className="p-8 rounded-xl text-center relative overflow-hidden"
        style={{ backgroundColor: form.backgroundColor }}
      >
        <div
          className="absolute top-0 left-0 w-24 h-24 rounded-full opacity-20 -translate-x-1/2 -translate-y-1/2"
          style={{ backgroundColor: form.secondaryColor }}
        />
        <div
          className="absolute bottom-0 right-0 w-32 h-32 rounded-full opacity-20 translate-x-1/2 translate-y-1/2"
          style={{ backgroundColor: form.accentColor }}
        />

        <div className="relative z-10">
          <h3
            className="text-2xl font-bold mb-4"
            style={{ color: form.primaryColor }}
          >
            {form.name || "이벤트 이름"}
          </h3>
          <button
            type="button"
            className="px-8 py-3 rounded-full text-white font-bold shadow-lg"
            style={{
              backgroundColor: form.primaryColor,
              boxShadow: `0 4px 20px ${form.primaryColor}50`,
            }}
          >
            럭키드로우
          </button>
          <p className="mt-4 text-sm" style={{ color: form.secondaryColor }}>
            행운을 시험해보세요!
          </p>
        </div>
      </div>
    </div>
  );
}
