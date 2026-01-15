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

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    primaryColor: "#c026d3",
    secondaryColor: "#701a75",
    backgroundColor: "#fdf4ff",
    textColor: "#1f2937",
    accentColor: "#e879f9",
    posterUrl: "",
  });

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
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="예: 2024 팬미팅 럭키드로우"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
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
                <div className="space-y-2">
                  <Label>메인 컬러</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={form.primaryColor}
                      onChange={(e) =>
                        setForm({ ...form, primaryColor: e.target.value })
                      }
                      className="w-12 h-10 rounded cursor-pointer border"
                    />
                    <Input
                      value={form.primaryColor}
                      onChange={(e) =>
                        setForm({ ...form, primaryColor: e.target.value })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>보조 컬러</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={form.secondaryColor}
                      onChange={(e) =>
                        setForm({ ...form, secondaryColor: e.target.value })
                      }
                      className="w-12 h-10 rounded cursor-pointer border"
                    />
                    <Input
                      value={form.secondaryColor}
                      onChange={(e) =>
                        setForm({ ...form, secondaryColor: e.target.value })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>배경 컬러</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={form.backgroundColor}
                      onChange={(e) =>
                        setForm({ ...form, backgroundColor: e.target.value })
                      }
                      className="w-12 h-10 rounded cursor-pointer border"
                    />
                    <Input
                      value={form.backgroundColor}
                      onChange={(e) =>
                        setForm({ ...form, backgroundColor: e.target.value })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>강조 컬러</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={form.accentColor}
                      onChange={(e) =>
                        setForm({ ...form, accentColor: e.target.value })
                      }
                      className="w-12 h-10 rounded cursor-pointer border"
                    />
                    <Input
                      value={form.accentColor}
                      onChange={(e) =>
                        setForm({ ...form, accentColor: e.target.value })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* 컬러 스와치 */}
              <div className="mt-6 flex gap-3">
                <div className="flex-1 text-center">
                  <div
                    className="h-12 rounded-lg mb-1"
                    style={{ backgroundColor: form.primaryColor }}
                  />
                  <span className="text-xs text-muted-foreground">메인</span>
                </div>
                <div className="flex-1 text-center">
                  <div
                    className="h-12 rounded-lg mb-1"
                    style={{ backgroundColor: form.secondaryColor }}
                  />
                  <span className="text-xs text-muted-foreground">보조</span>
                </div>
                <div className="flex-1 text-center">
                  <div
                    className="h-12 rounded-lg mb-1 border"
                    style={{ backgroundColor: form.backgroundColor }}
                  />
                  <span className="text-xs text-muted-foreground">배경</span>
                </div>
                <div className="flex-1 text-center">
                  <div
                    className="h-12 rounded-lg mb-1"
                    style={{ backgroundColor: form.accentColor }}
                  />
                  <span className="text-xs text-muted-foreground">강조</span>
                </div>
              </div>

              {/* 실제 화면 미리보기 */}
              <div className="mt-6">
                <p className="text-sm text-muted-foreground mb-2">
                  화면 미리보기
                </p>
                <div
                  className="p-8 rounded-xl text-center relative overflow-hidden"
                  style={{ backgroundColor: form.backgroundColor }}
                >
                  {/* 보조 컬러로 장식 */}
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
                      className="px-8 py-3 rounded-full text-white font-bold shadow-lg transition hover:scale-105"
                      style={{
                        backgroundColor: form.primaryColor,
                        boxShadow: `0 4px 20px ${form.primaryColor}50`,
                      }}
                    >
                      럭키드로우
                    </button>
                    <p
                      className="mt-4 text-sm"
                      style={{ color: form.secondaryColor }}
                    >
                      행운을 시험해보세요!
                    </p>
                  </div>
                </div>
              </div>
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
                onChange={(url) => setForm({ ...form, posterUrl: url })}
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
