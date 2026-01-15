"use client";

import { Product } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  onSubmit,
  onCancel,
  updateField,
  isPending,
}: ProductFormDialogProps) {
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
            <p className="text-xs text-muted-foreground">
              * 확률은 수량에 비례하여 자동 계산됩니다
            </p>
          </div>

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
