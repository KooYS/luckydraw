"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { ProductWithProbability } from "@/hooks/useEventDetail";

interface ProductListCardProps {
  products: ProductWithProbability[];
  onAdd: () => void;
  onEdit: (product: ProductWithProbability) => void;
  onDelete: (productId: number) => void;
  onAdjustStock: (productId: number, adjustment: number) => void;
  onSetStock: (productId: number, newValue: number) => void;
  deletePending: boolean;
  adjustPending: boolean;
}

/** 상품 목록 관리 컴포넌트 */
export default function ProductListCard({
  products,
  onAdd,
  onEdit,
  onDelete,
  onAdjustStock,
  onSetStock,
  deletePending,
  adjustPending,
}: ProductListCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>상품 목록 ({products.length}개)</CardTitle>
        <Button size="sm" onClick={onAdd}>
          + 상품 추가
        </Button>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            등록된 상품이 없습니다. 상품을 추가해주세요.
          </p>
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="border rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-2xl">
                      🎁
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className="bg-blue-100 text-blue-700 border-blue-200"
                      >
                        {product.initialProbability.toFixed(1)}%
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        (수량: {product.totalQuantity}개)
                      </span>
                      {product.description && (
                        <span className="text-sm text-muted-foreground">
                          · {product.description}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAdjustStock(product.id, -1)}
                      disabled={product.remainingQuantity === 0 || adjustPending}
                    >
                      -
                    </Button>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        min={0}
                        max={product.totalQuantity}
                        value={product.remainingQuantity}
                        onChange={(e) =>
                          onSetStock(product.id, parseInt(e.target.value) || 0)
                        }
                        className={`w-16 h-8 text-center font-mono text-sm px-1 ${
                          product.remainingQuantity === 0 ? "text-destructive" : ""
                        }`}
                      />
                      <span className="text-muted-foreground text-sm">
                        / {product.totalQuantity}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAdjustStock(product.id, 1)}
                      disabled={
                        product.remainingQuantity >= product.totalQuantity ||
                        adjustPending
                      }
                    >
                      +
                    </Button>
                  </div>

                  <Button variant="outline" size="sm" onClick={() => onEdit(product)}>
                    수정
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(product.id)}
                    disabled={deletePending}
                  >
                    삭제
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
