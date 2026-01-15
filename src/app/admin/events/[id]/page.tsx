"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEventDetail } from "@/hooks/useEventDetail";
import StockOverview from "@/components/admin/StockOverview";
import ProductListCard from "@/components/admin/ProductListCard";
import ProductFormDialog from "@/components/admin/ProductFormDialog";
import EventSettingsForm from "@/components/admin/EventSettingsForm";

/** 이벤트 상세 페이지 */
export default function EventDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { state, computed, actions, pending } = useEventDetail(id);

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/40">
        <div className="text-xl text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  if (state.error || !state.event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/40">
        <div className="text-xl text-destructive">이벤트를 찾을 수 없습니다.</div>
      </div>
    );
  }

  const { event } = state;

  return (
    <main className="min-h-screen p-8 bg-muted/40">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin">←</Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{event.name}</h1>
            <p className="text-muted-foreground">{event.description}</p>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              checked={event.isActive}
              onCheckedChange={actions.toggleEventActive}
              disabled={pending.updateEvent}
            />
            <Badge variant={event.isActive ? "default" : "secondary"}>
              {event.isActive ? "운영 중" : "운영 중지"}
            </Badge>
          </div>

          <Button
            asChild
            disabled={!computed.canRunDraw}
            variant={computed.canRunDraw ? "default" : "secondary"}
          >
            <Link
              href={`/draw/${event.id}`}
              onClick={(e) => !computed.canRunDraw && e.preventDefault()}
            >
              럭키드로우 실행
            </Link>
          </Button>
        </div>

        {!event.isActive && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4 flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-medium text-yellow-800">
                  이벤트가 비활성화 상태입니다
                </p>
                <p className="text-sm text-yellow-600">
                  럭키드로우를 실행하려면 상단의 토글을 켜주세요.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="products">
          <TabsList className="mb-6">
            <TabsTrigger value="products">상품 관리</TabsTrigger>
            <TabsTrigger value="settings">이벤트 설정</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <StockOverview
              products={computed.productsWithProbability}
              totalQuantity={computed.totalQuantity}
              totalRemaining={computed.totalRemaining}
              consumptionRate={computed.consumptionRate}
              onResetAll={actions.resetAllStock}
              resetPending={pending.resetAllStock}
            />

            <ProductListCard
              products={computed.productsWithProbability}
              onAdd={actions.openProductForm}
              onEdit={actions.startEditProduct}
              onDelete={actions.deleteProduct}
              onAdjustStock={actions.adjustStock}
              onSetStock={actions.setStock}
              deletePending={pending.deleteProduct}
              adjustPending={pending.adjustStock}
            />
          </TabsContent>

          <TabsContent value="settings">
            <EventSettingsForm
              form={state.eventForm}
              onSubmit={actions.saveEventSettings}
              updateField={actions.updateEventForm}
              isPending={pending.updateEvent}
            />
          </TabsContent>
        </Tabs>

        <ProductFormDialog
          open={state.showProductForm}
          onOpenChange={(open) => !open && actions.closeProductForm()}
          editingProduct={state.editingProduct}
          form={state.productForm}
          onSubmit={actions.submitProduct}
          onCancel={actions.closeProductForm}
          updateField={actions.updateProductForm}
          isPending={pending.addProduct || pending.updateProduct}
        />
      </div>
    </main>
  );
}
