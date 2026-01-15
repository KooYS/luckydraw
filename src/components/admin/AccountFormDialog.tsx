"use client";

import { PaymentAccount } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BANKS, getAllBanks } from "@/lib/banks";
import ImageUpload from "@/components/common/ImageUpload";
import type { AccountFormState } from "@/hooks/useAdminDashboard";

interface AccountFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingAccount: PaymentAccount | null;
  form: AccountFormState;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  updateField: <K extends keyof AccountFormState>(
    field: K,
    value: AccountFormState[K]
  ) => void;
  isPending: boolean;
}

/** 계좌 추가/수정 다이얼로그 */
export default function AccountFormDialog({
  open,
  onOpenChange,
  editingAccount,
  form,
  onSubmit,
  onCancel,
  updateField,
  isPending,
}: AccountFormDialogProps) {
  const selectedBank = form.bankCode ? BANKS[form.bankCode] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingAccount ? "계좌 수정" : "계좌 추가"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium">기본 정보</h3>

            <div className="space-y-2">
              <Label htmlFor="displayName">표시 이름 *</Label>
              <Input
                id="displayName"
                required
                value={form.displayName}
                onChange={(e) => updateField("displayName", e.target.value)}
                placeholder="예: 주식회사 앰프"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL 슬러그 *</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">/account/</span>
                <Input
                  id="slug"
                  required
                  value={form.slug}
                  onChange={(e) =>
                    updateField(
                      "slug",
                      e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-")
                    )
                  }
                  placeholder="my-company"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="송금 안내 문구"
                rows={2}
              />
            </div>

            <ImageUpload
              label="로고 이미지"
              value={form.logoUrl}
              onChange={(url) => updateField("logoUrl", url)}
              folder="luckdraw/accounts"
              previewMode="contain"
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">계좌 정보</h3>

            <div className="space-y-2">
              <Label>은행 선택 *</Label>
              <div className="grid grid-cols-5 gap-2">
                {getAllBanks().map((bank) => (
                  <button
                    key={bank.code}
                    type="button"
                    onClick={() => updateField("bankCode", bank.code)}
                    className={`p-2 rounded-lg border-2 transition-colors ${
                      form.bankCode === bank.code
                        ? "border-primary bg-primary/5"
                        : "border-transparent hover:bg-muted"
                    }`}
                  >
                    {bank.iconUrl ? (
                      <img
                        src={bank.iconUrl}
                        alt={bank.name}
                        className="w-8 h-8 rounded-full mx-auto mb-1 object-cover"
                      />
                    ) : (
                      <div
                        className="w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: bank.color }}
                      >
                        {bank.shortName.slice(0, 2)}
                      </div>
                    )}
                    <p className="text-xs text-center truncate">
                      {bank.shortName}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accountNumber">계좌번호 *</Label>
                <Input
                  id="accountNumber"
                  required
                  value={form.accountNumber}
                  onChange={(e) =>
                    updateField(
                      "accountNumber",
                      e.target.value.replace(/[^0-9-]/g, "")
                    )
                  }
                  placeholder="1234-5678-9012"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountHolder">예금주 *</Label>
                <Input
                  id="accountHolder"
                  required
                  value={form.accountHolder}
                  onChange={(e) => updateField("accountHolder", e.target.value)}
                  placeholder="홍길동"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultAmount">기본 송금 금액 (선택)</Label>
              <Input
                id="defaultAmount"
                type="number"
                value={form.defaultAmount}
                onChange={(e) => updateField("defaultAmount", e.target.value)}
                placeholder="금액을 입력하면 송금 페이지에서 기본값으로 표시됩니다"
              />
              <p className="text-xs text-muted-foreground">
                설정 시 사용자가 송금 페이지를 열면 이 금액이 기본으로 입력되어
                있습니다.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">테마 설정</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>메인 컬러</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={form.primaryColor}
                    onChange={(e) =>
                      updateField("primaryColor", e.target.value)
                    }
                    className="w-12 h-10 rounded cursor-pointer border"
                  />
                  <Input
                    value={form.primaryColor}
                    onChange={(e) =>
                      updateField("primaryColor", e.target.value)
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
                      updateField("backgroundColor", e.target.value)
                    }
                    className="w-12 h-10 rounded cursor-pointer border"
                  />
                  <Input
                    value={form.backgroundColor}
                    onChange={(e) =>
                      updateField("backgroundColor", e.target.value)
                    }
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div
              className="p-4 rounded-xl"
              style={{ backgroundColor: form.backgroundColor }}
            >
              <div
                className="p-3 rounded-lg text-white text-sm"
                style={{ backgroundColor: form.primaryColor }}
              >
                <p className="font-bold">{form.displayName || "표시 이름"}</p>
              </div>
              <div className="mt-3 p-3 bg-white rounded-lg text-sm">
                <p className="font-mono font-bold">
                  {form.accountNumber || "1234-5678-9012"}
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  {selectedBank?.name || "은행"} ·{" "}
                  {form.accountHolder || "예금주"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onCancel}
            >
              취소
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!form.bankCode || isPending}
            >
              {isPending ? "처리 중..." : editingAccount ? "수정" : "추가"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
