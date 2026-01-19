"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProductWithProbability } from "@/hooks/useEventDetail";

interface StockOverviewProps {
  products: ProductWithProbability[];
  totalQuantity: number;
  totalRemaining: number;
  consumptionRate: number;
  onResetAll: () => void;
  resetPending: boolean;
}

/** 재고 및 확률 현황 컴포넌트 */
export default function StockOverview({
  products,
  totalQuantity,
  totalRemaining,
  consumptionRate,
  onResetAll,
  resetPending,
}: StockOverviewProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>재고 & 확률 현황</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={onResetAll}
          disabled={resetPending}
        >
          {resetPending ? "리셋 중..." : "재고 전체 리셋"}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg text-center">
            <p className="text-sm text-blue-600 mb-1">총 수량</p>
            <p className="text-2xl font-bold text-blue-700">
              {totalQuantity}개
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg text-center">
            <p className="text-sm text-green-600 mb-1">남은 재고</p>
            <p className="text-2xl font-bold text-green-700">
              {totalRemaining}개
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg text-center">
            <p className="text-sm text-purple-600 mb-1">소진률</p>
            <p className="text-2xl font-bold text-purple-700">
              {consumptionRate.toFixed(1)}%
            </p>
          </div>
        </div>

        {products.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-4 text-xs text-muted-foreground px-3">
              <span className="flex-1">상품명</span>
              <span className="w-20 text-center">수량</span>
              <span className="w-24 text-center">초기 확률</span>
              <span className="w-24 text-center">현재 확률</span>
            </div>
            {products.map((product) => (
              <div
                key={product.id}
                className={`flex items-center gap-4 p-3 rounded-lg ${
                  product.remainingQuantity > 0
                    ? "bg-muted/50"
                    : "bg-muted opacity-60"
                }`}
              >
                <span
                  className={`flex-1 font-medium ${
                    product.remainingQuantity === 0
                      ? "line-through text-muted-foreground"
                      : ""
                  }`}
                >
                  {product.name}
                </span>
                <span className="w-20 text-center text-muted-foreground">
                  {product.remainingQuantity}/{product.totalQuantity}
                </span>
                <span className="w-24 text-center">
                  <Badge
                    variant="outline"
                    className="bg-blue-100 text-blue-700 border-blue-200"
                  >
                    {product.baseProbability.toFixed(1)}%
                  </Badge>
                </span>
                <span className="w-24 text-center">
                  <Badge
                    variant="outline"
                    className={
                      product.remainingQuantity > 0
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {product.currentProbability.toFixed(1)}%
                  </Badge>
                </span>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-4">
          * 확률은 수량에 비례하여 자동 계산됩니다. 재고가 소진되면 해당 상품은
          제외됩니다.
        </p>
      </CardContent>
    </Card>
  );
}
