"use client";

import { Product } from "@/db/schema";

interface ProductWithProbability extends Product {
  realTimeProbability: string;
}

interface StockDisplayProps {
  products: ProductWithProbability[];
  totalStock: number;
  primaryColor: string;
  accentColor: string;
  secondaryColor: string;
  colors: {
    textColor: string;
    textColorMuted: string;
    textColorFaint: string;
    cardBg: string;
    infoBg: string;
  };
}

/** 실시간 재고 및 확률 표시 컴포넌트 */
export default function StockDisplay({
  products,
  totalStock,
  primaryColor,
  accentColor,
  secondaryColor,
  colors,
}: StockDisplayProps) {
  return (
    <div
      className="p-4 rounded-xl backdrop-blur"
      style={{ backgroundColor: colors.infoBg }}
    >
      <div className="flex justify-between items-center mb-3">
        <h3
          className="text-sm font-medium"
          style={{ color: colors.textColorMuted }}
        >
          실시간 재고
        </h3>
        <span className="text-xs" style={{ color: colors.textColorFaint }}>
          총 재고: {totalStock}개
        </span>
      </div>
      <div className="space-y-3">
        {products.map((product) => {
          const probability = parseFloat(product.realTimeProbability);
          return (
            <div
              key={product.id}
              className="rounded-lg overflow-hidden"
              style={{ backgroundColor: colors.cardBg }}
            >
              <div className="flex items-center justify-between px-3 py-[4px]">
                <span
                  className="text-sm font-medium"
                  style={{
                    color:
                      product.remainingQuantity > 0
                        ? colors.textColor
                        : colors.textColorFaint,
                  }}
                >
                  {product.name}
                </span>
                <div className="flex items-center gap-3">
                  {/* <span
                    className="text-xs font-bold"
                    style={{
                      color:
                        product.remainingQuantity > 0
                          ? accentColor
                          : colors.textColorFaint,
                    }}
                  >
                    {product.realTimeProbability}%
                  </span> */}
                  <span
                    className="text-xs font-mono"
                    style={{
                      color:
                        product.remainingQuantity > 0
                          ? colors.textColorMuted
                          : colors.textColorFaint,
                    }}
                  >
                    {product.remainingQuantity}/{product.totalQuantity}
                  </span>
                </div>
              </div>
              <div
                className="h-1 w-full"
                style={{ backgroundColor: `${colors.textColorFaint}30` }}
              >
                <div
                  className="h-full transition-all duration-700 ease-out"
                  style={{
                    width: `${probability}%`,
                    backgroundColor:
                      probability > 30
                        ? primaryColor
                        : probability > 10
                          ? accentColor
                          : probability > 0
                            ? secondaryColor
                            : "transparent",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
