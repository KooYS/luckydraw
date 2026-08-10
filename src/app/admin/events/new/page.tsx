"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/common/ImageUpload";
import FontUpload from "@/components/common/FontUpload";
import { ColorSwatchGroup, ThemePreview, TokenGroupEditor } from "@/components/admin/theme";
import { THEME_GROUPS, type ThemeTokenOverrides } from "@/lib/themeTokens";

interface NewEventForm {
  name: string;
  description: string;
  titleImageUrl: string;
  titleImageWidth: number;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  subTextColor: string;
  accentColor: string;
  posterUrl: string;
  posterOverlay: boolean;
  fontUrl: string;
  showStockPanel: boolean;
  themeTokens: ThemeTokenOverrides;
}

const INITIAL_FORM: NewEventForm = {
  name: "",
  description: "",
  titleImageUrl: "",
  titleImageWidth: 80,
  primaryColor: "#000000",
  secondaryColor: "#4f4f4f",
  backgroundColor: "#ffffff",
  textColor: "#000000",
  subTextColor: "#6b7280",
  accentColor: "#141414",
  posterUrl: "",
  posterOverlay: true,
  fontUrl: "",
  showStockPanel: true,
  themeTokens: {},
};

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<NewEventForm>(INITIAL_FORM);

  const updateField = <K extends keyof NewEventForm>(field: K, value: NewEventForm[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/admin/events/${data.id}`);
      }
    } catch (error) {
      console.error("Failed to create event:", error);
    } finally {
      setLoading(false);
    }
  };

  const swatches = [
    { label: "메인", color: form.primaryColor },
    { label: "보조", color: form.secondaryColor },
    { label: "배경", color: form.backgroundColor, border: true },
    { label: "강조", color: form.accentColor },
    { label: "제목", color: form.textColor },
    { label: "본문", color: form.subTextColor },
  ];

  return (
    <main className="min-h-screen p-8 bg-muted/40">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin">←</Link>
          </Button>
          <h1 className="text-3xl font-bold">새 이벤트</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">이벤트 이름 *</Label>
                <Input
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="예: 2024 팬미팅 럭키드로우"
                />
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
                      onChange={(e) => updateField("titleImageWidth", Number(e.target.value))}
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
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={3}
                  placeholder="이벤트에 대한 간단한 설명"
                />
              </div>
            </CardContent>
          </Card>

          {/* 테마 설정 */}
          <Card>
            <CardHeader>
              <CardTitle>테마 설정</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {THEME_GROUPS.map((group) => (
                  <TokenGroupEditor
                    key={group}
                    group={group}
                    groupColor={form[group]}
                    onGroupColorChange={(value) => updateField(group, value)}
                    theme={{ ...form, posterUrl: form.posterUrl || null }}
                    overrides={form.themeTokens}
                    onOverridesChange={(next) => updateField("themeTokens", next)}
                  />
                ))}
              </div>

              <ColorSwatchGroup swatches={swatches} />

              <ThemePreview form={form} />
            </CardContent>
          </Card>

          {/* 배경 이미지 */}
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
                    onCheckedChange={(checked) => updateField("posterOverlay", checked)}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* 폰트 설정 */}
          <Card>
            <CardHeader>
              <CardTitle>폰트 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FontUpload
                label="커스텀 폰트"
                value={form.fontUrl}
                onChange={(url) => updateField("fontUrl", url)}
              />
              <p className="text-xs text-muted-foreground">
                * 폰트를 등록하면 추첨 페이지의 텍스트가 해당 폰트로 표시됩니다.
              </p>
            </CardContent>
          </Card>

          {/* 표시 설정 */}
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
                  onCheckedChange={(checked) => updateField("showStockPanel", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* 제출 버튼 */}
          <div className="flex gap-4">
            <Button variant="outline" className="flex-1" asChild>
              <Link href="/admin">취소</Link>
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "생성 중..." : "이벤트 생성"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
