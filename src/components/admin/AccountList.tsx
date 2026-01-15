"use client";

import { PaymentAccount } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { getBankByCode } from "@/lib/banks";
import QRPreview from "@/components/common/QRPreview";

interface AccountListProps {
  accounts: PaymentAccount[];
  loading: boolean;
  baseUrl: string;
  onEdit: (account: PaymentAccount) => void;
  onDelete: (account: PaymentAccount) => void;
  onToggle: (id: number, isActive: boolean) => void;
  onQRClick: (account: PaymentAccount) => void;
  onOpenForm: () => void;
  deletePending: boolean;
  togglePending: boolean;
}

/** 계좌 목록 컴포넌트 */
export default function AccountList({
  accounts,
  loading,
  baseUrl,
  onEdit,
  onDelete,
  onToggle,
  onQRClick,
  onOpenForm,
  deletePending,
  togglePending,
}: AccountListProps) {
  if (loading) {
    return (
      <div className="text-center py-16 text-muted-foreground">로딩 중...</div>
    );
  }

  if (accounts.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-16">
          <p className="text-muted-foreground mb-4">등록된 계좌가 없습니다.</p>
          <Button variant="link" onClick={onOpenForm}>
            첫 번째 계좌 만들기 →
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>계좌 목록</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {accounts.map((account) => {
            const bank = getBankByCode(account.bankCode);
            return (
              <div
                key={account.id}
                className="border rounded-lg p-4 flex items-start gap-4"
              >
                <QRPreview
                  url={`${baseUrl}/account/${account.slug}`}
                  size={80}
                  onClick={() => onQRClick(account)}
                />

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {bank?.iconUrl ? (
                      <img
                        src={bank.iconUrl}
                        alt={bank.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-[10px]"
                        style={{ backgroundColor: bank?.color || "#6B7280" }}
                      >
                        {bank?.shortName.slice(0, 2) || "은행"}
                      </div>
                    )}
                    <h3 className="font-bold">{account.displayName}</h3>
                    <Badge variant={account.isActive ? "default" : "secondary"}>
                      {account.isActive ? "활성" : "비활성"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {bank?.name || account.bankCode} · {account.accountNumber} ·{" "}
                    {account.accountHolder}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    /account/{account.slug}
                    {account.defaultAmount && (
                      <span className="ml-2 text-blue-600">
                        (기본 금액: {account.defaultAmount.toLocaleString()}원)
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={account.isActive}
                    onCheckedChange={(checked) => onToggle(account.id, checked)}
                    disabled={togglePending}
                  />
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/account/${account.slug}`} target="_blank">
                      열기
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onEdit(account)}>
                    수정
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(account)}
                    disabled={deletePending}
                  >
                    삭제
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
