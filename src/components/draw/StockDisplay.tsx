"use client";

import { Product } from "@/db/schema";
import { useLang } from "@/lib/i18n";
import type { ResolvedTokens } from "@/lib/themeTokens";

interface ProductWithProbability extends Product {
  realTimeProbability: string;
}

interface StockDisplayProps {
  products: ProductWithProbability[];
  totalStock: number;
  colors: ResolvedTokens;
}

/** 실시간 재고 및 확률 표시 컴포넌트 */
export default function StockDisplay({
  products,
  totalStock,
  colors,
}: StockDisplayProps) {
  const t = useLang();

  return (
    <div
      className="p-4 rounded-xl backdrop-blur"
      data-token-part="stockPanel"
      style={{ backgroundColor: colors.stockPanelBg }}
    >
      <div className="flex justify-between items-center mb-3">
        <h3
          className="text-sm font-medium"
          style={{ color: colors.stockPanelTitleText }}
        >
          {t.liveStock}
        </h3>
        <span className="text-xs" style={{ color: colors.stockMutedText }}>
          {t.totalStock(totalStock)}
        </span>
      </div>
      <div className="space-y-3">
        {products.map((product) => {
          const probability = parseFloat(product.realTimeProbability);
          return (
            <div
              key={product.id}
              className="rounded-lg overflow-hidden"
              data-token-part="stockRow"
              style={{ backgroundColor: colors.stockRowBg }}
            >
              <div className="flex items-center justify-between px-3 py-[4px]">
                <span
                  className="text-sm font-medium"
                  style={{
                    color:
                      product.remainingQuantity > 0
                        ? colors.stockProductNameText
                        : colors.stockMutedText,
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
                          ? colors.gaugeMidBg
                          : colors.stockMutedText,
                    }}
                  >
                    {product.realTimeProbability}%
                  </span> */}
                  <span
                    className="text-xs font-mono"
                    style={{
                      color:
                        product.remainingQuantity > 0
                          ? colors.stockCountText
                          : colors.stockMutedText,
                    }}
                  >
                    {product.remainingQuantity}/{product.totalQuantity}
                  </span>
                </div>
              </div>
              <div
                className="h-1 w-full"
                data-token-part="stockGauge"
                style={{ backgroundColor: colors.gaugeTrackBg }}
              >
                <div
                  className="h-full transition-all duration-700 ease-out"
                  style={{
                    width: `${probability}%`,
                    backgroundColor:
                      probability > 30
                        ? colors.gaugeHighBg
                        : probability > 10
                          ? colors.gaugeMidBg
                          : probability > 0
                            ? colors.gaugeLowBg
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
