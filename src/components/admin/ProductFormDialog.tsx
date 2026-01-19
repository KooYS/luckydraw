"use client";

import { useMemo } from "react";
import { Product } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ImageUpload from "@/components/common/ImageUpload";
import type { ProductFormState } from "@/hooks/useEventDetail";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingProduct: Product | null;
  form: ProductFormState;
  products: Product[]; // 전체 상품 목록
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  updateField: <K extends keyof ProductFormState>(field: K, value: ProductFormState[K]) => void;
  isPending: boolean;
}

/** 상품 추가/수정 다이얼로그 */
export default function ProductFormDialog({
  open,
  onOpenChange,
  editingProduct,
  form,
  products,
  onSubmit,
  onCancel,
  updateField,
  isPending,
}: ProductFormDialogProps) {
  // 확률 미리보기 계산
  const probabilityPreview = useMemo(() => {
    const currentQty = parseInt(form.totalQuantity) || 0;
    const currentWeight = parseFloat(form.weight) || 1;

    if (currentQty <= 0) return null;

    // 다른 상품들 (편집 중인 상품 제외)
    const otherProducts = products.filter((p) => p.id !== editingProduct?.id);

    // 다른 상품들의 가중치 적용 합계
    const otherWeightedQty = otherProducts.reduce((sum, p) => {
      const w = typeof p.weight === "string" ? parseFloat(p.weight) : (p.weight ?? 1);
      return sum + p.totalQuantity * w;
    }, 0);

    // 가중치 1일 때 확률 (기준점)
    const totalWithWeight1 = otherWeightedQty + currentQty * 1;
    const probabilityWithWeight1 = totalWithWeight1 > 0
      ? ((currentQty * 1) / totalWithWeight1) * 100
      : 0;

    // 현재 가중치 적용 확률
    const totalWithCurrentWeight = otherWeightedQty + currentQty * currentWeight;
    const probabilityWithCurrentWeight = totalWithCurrentWeight > 0
      ? ((currentQty * currentWeight) / totalWithCurrentWeight) * 100
      : 0;

    return {
      baseProbability: probabilityWithWeight1,
      weightedProbability: probabilityWithCurrentWeight,
      isWeightApplied: currentWeight !== 1,
    };
  }, [form.totalQuantity, form.weight, products, editingProduct?.id]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingProduct ? "상품 수정" : "상품 추가"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="productName">상품명 *</Label>
            <Input
              id="productName"
              required
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="예: 1등 - 스페셜 포토카드"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="productDesc">설명</Label>
            <Input
              id="productDesc"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </div>

          <ImageUpload
            label="상품 이미지"
            value={form.imageUrl}
            onChange={(url) => updateField("imageUrl", url)}
            folder="luckdraw/products"
            previewMode="cover"
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productQty">수량 *</Label>
              <Input
                id="productQty"
                type="number"
                required
                min="1"
                value={form.totalQuantity}
                onChange={(e) => updateField("totalQuantity", e.target.value)}
                placeholder="수량 입력"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="productWeight">가중치</Label>
              <Input
                id="productWeight"
                type="number"
                step="0.01"
                min="0.01"
                value={form.weight}
                onChange={(e) => updateField("weight", e.target.value)}
                placeholder="1.00"
              />
            </div>
          </div>

          {/* 확률 미리보기 */}
          {probabilityPreview && (
            <div className="rounded-lg border bg-muted/50 p-3 space-y-2">
              <div className="text-sm font-medium">예상 당첨 확률</div>
              <div className="flex items-center gap-2">
                {probabilityPreview.isWeightApplied ? (
                  <>
                    <Badge
                      variant="outline"
                      className="bg-gray-100 text-gray-500 border-gray-200 line-through"
                    >
                      {probabilityPreview.baseProbability.toFixed(2)}%
                    </Badge>
                    <span className="text-muted-foreground">→</span>
                    <Badge
                      variant="outline"
                      className={`${
                        probabilityPreview.weightedProbability > probabilityPreview.baseProbability
                          ? "bg-green-100 text-green-700 border-green-200"
                          : "bg-orange-100 text-orange-700 border-orange-200"
                      }`}
                    >
                      {probabilityPreview.weightedProbability.toFixed(2)}%
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      ({probabilityPreview.weightedProbability > probabilityPreview.baseProbability ? "+" : ""}
                      {(probabilityPreview.weightedProbability - probabilityPreview.baseProbability).toFixed(2)}%p)
                    </span>
                  </>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-blue-100 text-blue-700 border-blue-200"
                  >
                    {probabilityPreview.baseProbability.toFixed(2)}%
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                가중치 1 미만 = 확률 감소, 1 초과 = 확률 증가
              </p>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
              취소
            </Button>
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? "처리 중..." : editingProduct ? "수정" : "추가"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
