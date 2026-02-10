"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/common/ImageUpload";
import {
  ColorPicker,
  ColorSwatchGroup,
  ThemePreview,
} from "@/components/admin/theme";
import type { EventFormState } from "@/hooks/useEventDetail";

interface EventSettingsFormProps {
  form: EventFormState;
  onSubmit: (e: React.FormEvent) => void;
  updateField: <K extends keyof EventFormState>(
    field: K,
    value: EventFormState[K],
  ) => void;
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
            <p className="text-xs text-muted-foreground">
              * 럭키드로우 페이지에서 제목으로 표시됩니다.
            </p>
          </div>

          <div className="space-y-2">
            <ImageUpload
              label="타이틀 이미지"
              value={form.titleImageUrl}
              onChange={(url) => updateField("titleImageUrl", url)}
              folder="luckdraw/events/titles"
              previewMode="contain"
            />
            <p className="text-xs text-muted-foreground">
              * 이미지를 등록하면 텍스트 제목 대신 이미지가 표시됩니다.
            </p>
            {form.titleImageUrl && (
              <div className="space-y-2 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="titleImageWidth">이미지 너비</Label>
                  <span className="text-sm text-muted-foreground font-mono">
                    {form.titleImageWidth}%
                  </span>
                </div>
                <input
                  id="titleImageWidth"
                  type="range"
                  min={20}
                  max={100}
                  step={5}
                  value={form.titleImageWidth}
                  onChange={(e) =>
                    updateField("titleImageWidth", Number(e.target.value))
                  }
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>20%</span>
                  <span>100%</span>
                </div>
              </div>
            )}
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
        <CardContent className="space-y-4">
          <ImageUpload
            label="배경 이미지"
            value={form.posterUrl}
            onChange={(url) => updateField("posterUrl", url)}
            folder="luckdraw/events/backgrounds"
            previewMode="cover"
          />
          <p className="text-xs text-muted-foreground">
            * 배경 이미지 설정 시 테마 색상 대신 이미지가 표시됩니다.
          </p>

          {form.posterUrl && (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="posterOverlay">배경 오버레이</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  배경 이미지 위에 어두운 오버레이를 표시합니다.
                </p>
              </div>
              <Switch
                id="posterOverlay"
                checked={form.posterOverlay}
                onCheckedChange={(checked) =>
                  updateField("posterOverlay", checked)
                }
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>표시 설정</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="showStockPanel">재고 & 확률 현황 패널</Label>
              <p className="text-xs text-muted-foreground mt-1">
                럭키드로우 페이지에 실시간 재고 현황을 표시합니다.
              </p>
            </div>
            <Switch
              id="showStockPanel"
              checked={form.showStockPanel}
              onCheckedChange={(checked) =>
                updateField("showStockPanel", checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "저장 중..." : "설정 저장"}
      </Button>
    </form>
  );
}
