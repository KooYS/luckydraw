"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import EventList from "@/components/admin/EventList";
import AccountList from "@/components/admin/AccountList";
import AccountFormDialog from "@/components/admin/AccountFormDialog";
import QRCodeModal from "@/components/common/QRCodeModal";

/** 관리자 대시보드 페이지 */
export default function AdminDashboard() {
  const { state, computed, actions, pending } = useAdminDashboard();

  return (
    <main className="min-h-screen p-8 bg-muted/40">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">관리자 대시보드</h1>
        </div>

        <Tabs value={state.activeTab} onValueChange={actions.setActiveTab}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="events" className="gap-2">
                이벤트
                <Badge variant="secondary" className="ml-1">
                  {state.events.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="accounts" className="gap-2">
                송금 QR
                <Badge variant="secondary" className="ml-1">
                  {state.accounts.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            {state.activeTab === "events" ? (
              <Button asChild>
                <Link href="/admin/events/new">+ 새 이벤트</Link>
              </Button>
            ) : (
              <Button onClick={actions.openAccountForm}>+ 계좌 추가</Button>
            )}
          </div>

          <TabsContent value="events">
            <EventList
              events={state.events}
              loading={state.eventsLoading}
              onDelete={actions.deleteEvent}
              onToggle={actions.toggleEvent}
              deletePending={pending.deleteEvent}
              togglePending={pending.toggleEvent}
            />
          </TabsContent>

          <TabsContent value="accounts">
            <AccountList
              accounts={state.accounts}
              loading={state.accountsLoading}
              baseUrl={computed.baseUrl}
              onEdit={actions.startEditAccount}
              onDelete={actions.deleteAccount}
              onToggle={actions.toggleAccount}
              onQRClick={actions.setQrAccount}
              onOpenForm={actions.openAccountForm}
              deletePending={pending.deleteAccount}
              togglePending={pending.toggleAccount}
            />
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center">
          <Button variant="ghost" asChild>
            <Link href="/">← 홈으로</Link>
          </Button>
        </div>
      </div>

      <AccountFormDialog
        open={state.showAccountForm}
        onOpenChange={(open) => !open && actions.closeAccountForm()}
        editingAccount={state.editingAccount}
        form={state.accountForm}
        onSubmit={actions.submitAccount}
        onCancel={actions.closeAccountForm}
        updateField={actions.updateFormField}
        isPending={pending.addAccount || pending.updateAccount}
      />

      {state.qrAccount && (
        <QRCodeModal
          open={!!state.qrAccount}
          onOpenChange={(open) => !open && actions.setQrAccount(null)}
          url={`${computed.baseUrl}/account/${state.qrAccount.slug}`}
          title={state.qrAccount.displayName}
          description="QR코드를 스캔하면 송금 페이지로 이동합니다."
        />
      )}
    </main>
  );
}
