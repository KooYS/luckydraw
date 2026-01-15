"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Event, PaymentAccount } from "@/db/schema";
import { toast } from "react-toastify";

/** 계좌 폼 상태 타입 */
export interface AccountFormState {
  slug: string;
  displayName: string;
  description: string;
  logoUrl: string;
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
  defaultAmount: string;
  primaryColor: string;
  backgroundColor: string;
}

const INITIAL_ACCOUNT_FORM: AccountFormState = {
  slug: "",
  displayName: "",
  description: "",
  logoUrl: "",
  bankCode: "",
  accountNumber: "",
  accountHolder: "",
  defaultAmount: "",
  primaryColor: "#3B82F6",
  backgroundColor: "#F8FAFC",
};

/** 관리자 대시보드 훅 반환 타입 */
interface UseAdminDashboardReturn {
  state: {
    events: Event[];
    accounts: PaymentAccount[];
    eventsLoading: boolean;
    accountsLoading: boolean;
    activeTab: string;
    showAccountForm: boolean;
    editingAccount: PaymentAccount | null;
    accountForm: AccountFormState;
    qrAccount: PaymentAccount | null;
  };
  computed: {
    baseUrl: string;
  };
  actions: {
    setActiveTab: (tab: string) => void;
    deleteEvent: (id: number) => void;
    toggleEvent: (id: number, isActive: boolean) => void;
    openAccountForm: () => void;
    closeAccountForm: () => void;
    startEditAccount: (account: PaymentAccount) => void;
    submitAccount: (e: React.FormEvent) => void;
    deleteAccount: (account: PaymentAccount) => void;
    toggleAccount: (id: number, isActive: boolean) => void;
    updateFormField: <K extends keyof AccountFormState>(field: K, value: AccountFormState[K]) => void;
    setQrAccount: (account: PaymentAccount | null) => void;
  };
  pending: {
    deleteEvent: boolean;
    toggleEvent: boolean;
    addAccount: boolean;
    updateAccount: boolean;
    deleteAccount: boolean;
    toggleAccount: boolean;
  };
}

/** 관리자 대시보드 비즈니스 로직 훅 */
export function useAdminDashboard(): UseAdminDashboardReturn {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("events");
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<PaymentAccount | null>(null);
  const [qrAccount, setQrAccount] = useState<PaymentAccount | null>(null);
  const [accountForm, setAccountForm] = useState<AccountFormState>(INITIAL_ACCOUNT_FORM);

  /** 이벤트 목록 조회 */
  const { data: events = [], isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["events"],
    queryFn: () => fetch("/api/events").then((res) => res.json()),
  });

  /** 계좌 목록 조회 */
  const { data: accounts = [], isLoading: accountsLoading } = useQuery<PaymentAccount[]>({
    queryKey: ["accounts"],
    queryFn: () => fetch("/api/accounts").then((res) => res.json()),
  });

  /** 이벤트 삭제 */
  const deleteEventMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/events/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast("이벤트가 삭제되었습니다.", { type: "success" });
    },
  });

  /** 이벤트 활성화 토글 */
  const toggleEventMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      await fetch(`/api/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
    },
    onSuccess: (_, { isActive }) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast(isActive ? "운영으로 변경되었습니다." : "중지되었습니다.", {
        type: isActive ? "success" : "error",
      });
    },
  });

  /** 계좌 추가 */
  const addAccountMutation = useMutation({
    mutationFn: async (
      data: Omit<AccountFormState, "defaultAmount"> & { defaultAmount: number | null }
    ) => {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to add account");
      return res.json();
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["accounts"] });
      const newAccounts = queryClient.getQueryData<PaymentAccount[]>(["accounts"]);
      const newAccount = newAccounts?.find((a) => a.slug === variables.slug);
      if (newAccount) {
        setQrAccount(newAccount);
      }
      resetAccountForm();
      toast("계좌가 추가되었습니다.", { type: "success" });
    },
  });

  /** 계좌 수정 */
  const updateAccountMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<PaymentAccount> }) => {
      const res = await fetch(`/api/accounts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update account");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      resetAccountForm();
      toast("계좌가 수정되었습니다.", { type: "success" });
    },
  });

  /** 계좌 삭제 */
  const deleteAccountMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/accounts/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast("계좌가 삭제되었습니다.", { type: "success" });
    },
  });

  /** 계좌 활성화 토글 */
  const toggleAccountMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      await fetch(`/api/accounts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });

  /** 계좌 폼 초기화 */
  const resetAccountForm = useCallback(() => {
    setAccountForm(INITIAL_ACCOUNT_FORM);
    setEditingAccount(null);
    setShowAccountForm(false);
  }, []);

  /** 계좌 수정 시작 */
  const startEditAccount = useCallback((account: PaymentAccount) => {
    setAccountForm({
      slug: account.slug,
      displayName: account.displayName,
      description: account.description || "",
      logoUrl: account.logoUrl || "",
      bankCode: account.bankCode,
      accountNumber: account.accountNumber,
      accountHolder: account.accountHolder,
      defaultAmount: account.defaultAmount?.toString() || "",
      primaryColor: account.primaryColor,
      backgroundColor: account.backgroundColor,
    });
    setEditingAccount(account);
    setShowAccountForm(true);
  }, []);

  /** 계좌 폼 제출 */
  const submitAccount = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const formData = {
        ...accountForm,
        defaultAmount: accountForm.defaultAmount ? parseInt(accountForm.defaultAmount) : null,
      };
      if (editingAccount) {
        updateAccountMutation.mutate({ id: editingAccount.id, data: formData });
      } else {
        addAccountMutation.mutate(formData);
      }
    },
    [accountForm, editingAccount, updateAccountMutation, addAccountMutation]
  );

  /** 이벤트 삭제 핸들러 */
  const handleDeleteEvent = useCallback(
    (id: number) => {
      if (!confirm("정말 삭제하시겠습니까?")) return;
      deleteEventMutation.mutate(id);
    },
    [deleteEventMutation]
  );

  /** 계좌 삭제 핸들러 */
  const handleDeleteAccount = useCallback(
    (account: PaymentAccount) => {
      if (!confirm(`"${account.displayName}" 계좌를 삭제하시겠습니까?`)) return;
      deleteAccountMutation.mutate(account.id);
    },
    [deleteAccountMutation]
  );

  /** 폼 필드 업데이트 */
  const updateFormField = useCallback(
    <K extends keyof AccountFormState>(field: K, value: AccountFormState[K]) => {
      setAccountForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  /** 계좌 폼 열기 */
  const openAccountForm = useCallback(() => {
    setAccountForm(INITIAL_ACCOUNT_FORM);
    setEditingAccount(null);
    setShowAccountForm(true);
  }, []);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  return {
    state: {
      events,
      accounts,
      eventsLoading,
      accountsLoading,
      activeTab,
      showAccountForm,
      editingAccount,
      accountForm,
      qrAccount,
    },
    computed: {
      baseUrl,
    },
    actions: {
      setActiveTab,
      deleteEvent: handleDeleteEvent,
      toggleEvent: (id, isActive) => toggleEventMutation.mutate({ id, isActive }),
      openAccountForm,
      closeAccountForm: resetAccountForm,
      startEditAccount,
      submitAccount,
      deleteAccount: handleDeleteAccount,
      toggleAccount: (id, isActive) => toggleAccountMutation.mutate({ id, isActive }),
      updateFormField,
      setQrAccount,
    },
    pending: {
      deleteEvent: deleteEventMutation.isPending,
      toggleEvent: toggleEventMutation.isPending,
      addAccount: addAccountMutation.isPending,
      updateAccount: updateAccountMutation.isPending,
      deleteAccount: deleteAccountMutation.isPending,
      toggleAccount: toggleAccountMutation.isPending,
    },
  };
}
