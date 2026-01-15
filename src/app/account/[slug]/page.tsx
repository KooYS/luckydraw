"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { PaymentAccount } from "@/db/schema";
import {
  getAllBanks,
  getBankByCode,
  getAppStoreLink,
  getAppLink,
  getTossTransferLink,
  BankInfo,
} from "@/lib/banks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function AccountPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [account, setAccount] = useState<PaymentAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [showStoreFallback, setShowStoreFallback] = useState<{
    name: string;
    isOpened: boolean;
    bankCode: string;
  } | null>(null);

  // 계좌 정보 로드
  useEffect(() => {
    fetch(`/api/accounts/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Account not found");
        return res.json();
      })
      .then((data) => {
        setAccount(data);
        // 기본 금액이 설정되어 있으면 초기값으로 설정
        if (data.defaultAmount) {
          setAmount(data.defaultAmount.toString());
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [slug]);

  // 계좌번호 복사
  const copyAccountNumber = useCallback(async () => {
    if (!account) return;

    try {
      await navigator.clipboard.writeText(
        account.accountNumber.replace(/-/g, "")
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 폴백: 구형 브라우저
      const textArea = document.createElement("textarea");
      textArea.value = account.accountNumber.replace(/-/g, "");
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [account]);

  // 앱 스킴 실행 (hidden link 클릭 방식)
  const openAppScheme = useCallback((schemeUrl: string) => {
    const existingLinks = document.querySelectorAll("a[data-app-scheme]");
    existingLinks.forEach((link) => link.remove());

    const link = document.createElement("a");
    link.href = schemeUrl;
    link.style.display = "none";
    link.setAttribute("data-app-scheme", "true");
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);
  }, []);

  // 은행 앱 열기
  const openBankApp = useCallback(
    async (bankCode: string) => {
      if (!account) return;

      // 먼저 계좌번호 복사
      await copyAccountNumber();

      const bank = getBankByCode(bankCode);
      if (!bank) return;

      // 토스는 딥링크 파라미터 지원
      if (bankCode === "toss") {
        const tossLink = getTossTransferLink({
          bankCode: account.bankCode,
          accountNumber: account.accountNumber,
          accountHolder: account.accountHolder,
          amount: amount ? parseInt(amount) : undefined,
        });
        setShowStoreFallback({
          name: bank.name,
          isOpened: false,
          bankCode,
        });
        setTimeout(() => {
          openAppScheme(tossLink);
        }, 1500);
        return;
      }

      // 플랫폼별 앱 링크 가져오기
      const appLink = getAppLink(bankCode);

      // 폴백 배너 먼저 표시 (앱 스킴 시도 전에)
      setShowStoreFallback({
        name: bank.name,
        isOpened: false,
        bankCode,
      });

      // 사용자가 배너를 볼 시간 확보 후 앱 스킴 시도 (1.5초 지연)
      if (appLink) {
        openAppScheme(appLink);
      }
    },
    [account, amount, copyAccountNumber, openAppScheme]
  );

  // 스토어로 이동
  const goToStore = useCallback((bankCode: string) => {
    const storeLink = getAppStoreLink(bankCode);
    if (storeLink) {
      window.location.href = storeLink;
    }
    setShowStoreFallback(null);
  }, []);

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  // 에러 상태
  if (error || !account) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h1 className="text-xl font-bold mb-2">계좌를 찾을 수 없습니다</h1>
            <p className="text-muted-foreground">
              요청하신 계좌 정보가 존재하지 않거나 비활성화되었습니다.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const recipientBank = getBankByCode(account.bankCode);

  return (
    <main
      className="min-h-screen py-8 px-4"
      style={{ backgroundColor: account.backgroundColor }}
    >
      <div className="max-w-md mx-auto space-y-6">
        {/* 계좌 정보 카드 */}
        <Card className="overflow-hidden pt-0">
          <div
            className="p-6 text-white"
            style={{ backgroundColor: account.primaryColor }}
          >
            {account.logoUrl && (
              <img
                src={account.logoUrl}
                alt={account.displayName}
                className="h-12 mb-4 object-contain"
              />
            )}
            <h1 className="text-2xl font-bold">{account.displayName}</h1>
            {account.description && (
              <p className="mt-1 opacity-90 text-sm">{account.description}</p>
            )}
          </div>

          <CardContent className="pt-6 space-y-4">
            {/* 입금 은행 */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              {recipientBank?.iconUrl ? (
                <img
                  src={recipientBank.iconUrl}
                  alt={recipientBank.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: recipientBank?.color || "#6B7280" }}
                >
                  {recipientBank?.shortName}
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">입금은행</p>
                <p className="font-medium">
                  {recipientBank?.name || account.bankCode}
                </p>
              </div>
            </div>

            {/* 계좌번호 */}
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">계좌번호</p>
              <div className="flex items-center justify-between">
                <p className="text-xl font-mono font-bold">
                  {account.accountNumber}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyAccountNumber}
                  className="shrink-0"
                >
                  {copied ? "복사됨!" : "복사"}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                예금주: {account.accountHolder}
              </p>
            </div>

            {/* 금액 입력 */}
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                송금 금액 (선택)
              </label>
              <Input
                type="number"
                placeholder="금액을 입력하세요"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-lg"
              />
            </div>
          </CardContent>
        </Card>

        {/* 은행 선택 */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="font-bold mb-4">송금할 은행을 선택하세요</h2>
            <p className="text-sm text-muted-foreground mb-4">
              계좌번호가 자동으로 복사됩니다. 앱에서 붙여넣기 해주세요.
            </p>

            <BankGrid banks={getAllBanks()} onSelect={openBankApp} />
          </CardContent>
        </Card>

        {/* 안내 문구 */}
        <p className="text-center text-xs text-muted-foreground pb-20">
          계좌번호가 복사되었습니다. 앱에서 붙여넣기하세요.
        </p>
      </div>

      {/* 앱 미설치시 하단 고정 폴백 배너 */}
      {showStoreFallback && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 safe-area-pb">
          <div className="max-w-md mx-auto flex items-center justify-between gap-3">
            <p className="text-sm">
              {showStoreFallback?.name} 앱이 열리지 않나요?
            </p>
            <Button
              size="sm"
              onClick={() => goToStore(showStoreFallback.bankCode)}
            >
              앱 스토어 방문
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}

// ============================================================
// 은행 그리드 컴포넌트
// ============================================================

function BankGrid({
  banks,
  onSelect,
}: {
  banks: BankInfo[];
  onSelect: (code: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {banks.map((bank) => (
        <button
          key={bank.code}
          onClick={() => onSelect(bank.code)}
          className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-slate-100 transition-colors"
        >
          {bank.iconUrl ? (
            <img
              src={bank.iconUrl}
              alt={bank.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xs"
              style={{ backgroundColor: bank.color }}
            >
              {bank.shortName.slice(0, 3)}
            </div>
          )}
          <span className="text-xs text-center leading-tight">
            {bank.shortName}
          </span>
        </button>
      ))}
    </div>
  );
}
