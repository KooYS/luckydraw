"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ProductWithProbability } from "@/hooks/useEventDetail";

/** 재고 입력 컴포넌트 (로컬 상태 관리) */
function StockInput({
  productId,
  remainingQuantity,
  totalQuantity,
  onSetStock,
  disabled,
}: {
  productId: number;
  remainingQuantity: number;
  totalQuantity: number;
  onSetStock: (productId: number, newValue: number) => void;
  disabled: boolean;
}) {
  const [localValue, setLocalValue] = useState(String(remainingQuantity));
  const inputRef = useRef<HTMLInputElement>(null);

  // 서버 값이 변경되면 로컬 값도 업데이트 (단, 포커스 중이 아닐 때만)
  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setLocalValue(String(remainingQuantity));
    }
  }, [remainingQuantity]);

  const handleBlur = () => {
    const newValue = parseInt(localValue) || 0;
    const clampedValue = Math.max(0, Math.min(totalQuantity, newValue));
    setLocalValue(String(clampedValue));
    if (clampedValue !== remainingQuantity) {
      onSetStock(productId, clampedValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      inputRef.current?.blur();
    }
  };

  return (
    <Input
      ref={inputRef}
      type="number"
      min={0}
      max={totalQuantity}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className={`w-16 h-8 text-center font-mono text-sm px-1 ${
        remainingQuantity === 0 ? "text-destructive" : ""
      }`}
    />
  );
}

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
                    <div className="flex flex-col items-start gap-2 mt-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="outline"
                              className="bg-blue-100 text-blue-700 border-blue-200 cursor-help"
                            >
                              {product.baseProbability.toFixed(1)}%
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              가중치 적용 확률:{" "}
                              {product.weightedProbability.toFixed(2)}%
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <div className="flex items-center gap-2 ">
                        <span className="text-sm text-muted-foreground">
                          (수량: {product.totalQuantity}개)
                        </span>
                        {product.description && (
                          <span className="text-sm text-muted-foreground truncate overflow-hidden w-[200px]">
                            · {product.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAdjustStock(product.id, -1)}
                      disabled={
                        product.remainingQuantity === 0 || adjustPending
                      }
                    >
                      -
                    </Button>
                    <div className="flex items-center gap-1">
                      <StockInput
                        productId={product.id}
                        remainingQuantity={product.remainingQuantity}
                        totalQuantity={product.totalQuantity}
                        onSetStock={onSetStock}
                        disabled={adjustPending}
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

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(product)}
                  >
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
