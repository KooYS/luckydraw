"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/common/ImageUpload";
import { ColorPicker, ColorSwatchGroup, ThemePreview } from "@/components/admin/theme";
import type { ThemeFormData } from "@/components/admin/theme";

interface NewEventForm extends ThemeFormData {
  description: string;
  posterUrl: string;
}

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<NewEventForm>({
    name: "",
    description: "",
    primaryColor: "#000000",
    secondaryColor: "#4f4f4f",
    backgroundColor: "#ffffff",
    textColor: "#000000",
    subTextColor: "#6b7280",
    accentColor: "#141414",
    posterUrl: "",
  });

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

          {/* 배경 이미지 설정 */}
          <Card>
            <CardHeader>
              <CardTitle>배경 이미지 (선택)</CardTitle>
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
