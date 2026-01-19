import { Product } from "@/db/schema";
import { randomBytes, randomInt } from "crypto";

export interface DrawResult {
  isWin: boolean;
  product: Product | null;
  probability?: number;
  randomValue?: number;
  seed?: string;
}

export interface ProductWithProbability extends Product {
  calculatedProbability: number;
  weightedValue: number; // remainingQuantity * weight
  rangeStart: number;
  rangeEnd: number;
}

export interface DrawStatistics {
  totalRemainingQuantity: number;
  totalWeightedValue: number;
  canDraw: boolean;
  products: ProductWithProbability[];
}

/** 암호학적으로 안전한 난수 생성 */
function secureRandom(): { value: number; seed: string } {
  const bytes = randomBytes(8);
  const seed = bytes.toString("hex");

  const bigIntValue = bytes.readBigUInt64BE();
  const maxValue = BigInt("0xFFFFFFFFFFFFFFFF");
  const value = Number(bigIntValue) / Number(maxValue);

  return { value, seed };
}

/** 암호학적으로 안전한 정수 난수 생성 */
function secureRandomInt(min: number, max: number): number {
  return randomInt(min, max + 1);
}

/** 상품 목록의 추첨 통계 계산 (가중치 기반) */
export function calculateDrawStatistics(products: Product[]): DrawStatistics {
  const availableProducts = products.filter((p) => p.remainingQuantity > 0);

  const totalRemainingQuantity = availableProducts.reduce(
    (sum, p) => sum + p.remainingQuantity,
    0
  );

  // 가중치를 적용한 총 값 계산
  const totalWeightedValue = availableProducts.reduce((sum, p) => {
    const weight = typeof p.weight === "string" ? parseFloat(p.weight) : (p.weight ?? 1);
    return sum + p.remainingQuantity * weight;
  }, 0);

  let cumulative = 0;
  const productsWithProbability: ProductWithProbability[] =
    availableProducts.map((product) => {
      const weight = typeof product.weight === "string" ? parseFloat(product.weight) : (product.weight ?? 1);
      const weightedValue = product.remainingQuantity * weight;

      const probability =
        totalWeightedValue > 0
          ? (weightedValue / totalWeightedValue) * 100
          : 0;

      const rangeStart = cumulative;
      cumulative += weightedValue;
      const rangeEnd = cumulative;

      return {
        ...product,
        calculatedProbability: Math.round(probability * 10000) / 10000,
        weightedValue,
        rangeStart,
        rangeEnd,
      };
    });

  return {
    totalRemainingQuantity,
    totalWeightedValue,
    canDraw: totalRemainingQuantity > 0,
    products: productsWithProbability.sort(
      (a, b) => b.calculatedProbability - a.calculatedProbability
    ),
  };
}

/** 이진 탐색으로 당첨 상품 찾기 */
function binarySearchProduct(
  products: ProductWithProbability[],
  target: number
): ProductWithProbability | null {
  let left = 0;
  let right = products.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const product = products[mid];

    if (target >= product.rangeStart && target < product.rangeEnd) {
      return product;
    }

    if (target < product.rangeStart) {
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }

  return null;
}

/** 단일 추첨 실행 */
export function executeDraw(products: Product[]): DrawResult {
  const stats = calculateDrawStatistics(products);

  if (!stats.canDraw || stats.products.length === 0) {
    return { isWin: false, product: null };
  }

  const { totalWeightedValue, products: weightedProducts } = stats;

  const sortedByRange = [...weightedProducts].sort(
    (a, b) => a.rangeStart - b.rangeStart
  );

  const { value: normalizedRandom, seed } = secureRandom();
  const randomValue = normalizedRandom * totalWeightedValue;
  const selectedProduct = binarySearchProduct(sortedByRange, randomValue);

  if (!selectedProduct) {
    const lastProduct = sortedByRange[sortedByRange.length - 1];
    return {
      isWin: true,
      product: lastProduct,
      probability: lastProduct.calculatedProbability,
      randomValue: normalizedRandom,
      seed,
    };
  }

  return {
    isWin: true,
    product: selectedProduct,
    probability: selectedProduct.calculatedProbability,
    randomValue: normalizedRandom,
    seed,
  };
}

/** 암호학적으로 안전한 배열 셔플 */
export function secureShuffle<T>(array: T[]): T[] {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = secureRandomInt(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

/** 복수 추첨 실행 */
export function executeMultipleDraw(
  products: Product[],
  count: number
): DrawResult[] {
  const results: DrawResult[] = [];
  const productsCopy = products.map((p) => ({ ...p }));

  for (let i = 0; i < count; i++) {
    const result = executeDraw(productsCopy);
    results.push(result);

    if (result.isWin && result.product) {
      const idx = productsCopy.findIndex((p) => p.id === result.product!.id);
      if (idx !== -1) {
        productsCopy[idx] = {
          ...productsCopy[idx],
          remainingQuantity: Math.max(
            0,
            productsCopy[idx].remainingQuantity - 1
          ),
        };
      }
    }
  }

  return results;
}

/** 확률 유효성 검증 */
export function validateProbabilities(products: Product[]): {
  valid: boolean;
  totalQuantity: number;
  remainingQuantity: number;
  message?: string;
} {
  const totalQuantity = products.reduce((sum, p) => sum + p.totalQuantity, 0);
  const remainingQuantity = products.reduce(
    (sum, p) => sum + p.remainingQuantity,
    0
  );

  if (products.length === 0) {
    return {
      valid: false,
      totalQuantity: 0,
      remainingQuantity: 0,
      message: "상품이 없습니다.",
    };
  }

  if (totalQuantity === 0) {
    return {
      valid: false,
      totalQuantity,
      remainingQuantity,
      message: "상품의 총 수량이 0입니다.",
    };
  }

  if (remainingQuantity === 0) {
    return {
      valid: false,
      totalQuantity,
      remainingQuantity,
      message: "남은 재고가 없습니다.",
    };
  }

  return { valid: true, totalQuantity, remainingQuantity };
}

/** 추첨 분포 시뮬레이션 */
export function simulateDrawDistribution(
  products: Product[],
  iterations = 10000
): Record<number, { expected: number; actual: number; deviation: number }> {
  const stats = calculateDrawStatistics(products);
  const counts: Record<number, number> = {};

  const infiniteStock = products.map((p) => ({
    ...p,
    remainingQuantity: p.totalQuantity,
  }));

  for (let i = 0; i < iterations; i++) {
    const result = executeDraw(infiniteStock);
    if (result.product) {
      counts[result.product.id] = (counts[result.product.id] || 0) + 1;
    }
  }

  const results: Record<
    number,
    { expected: number; actual: number; deviation: number }
  > = {};

  for (const product of stats.products) {
    const expected = product.calculatedProbability;
    const actual = ((counts[product.id] || 0) / iterations) * 100;
    const deviation = Math.abs(expected - actual);

    results[product.id] = {
      expected: Math.round(expected * 100) / 100,
      actual: Math.round(actual * 100) / 100,
      deviation: Math.round(deviation * 100) / 100,
    };
  }

  return results;
}

/** @deprecated Use calculateDrawStatistics instead */
export function calculateProbabilities(
  products: Product[],
  useRemaining = false
): Array<Product & { calculatedProbability: number }> {
  const quantities = products.map((p) =>
    useRemaining ? p.remainingQuantity : p.totalQuantity
  );
  const total = quantities.reduce((sum, q) => sum + q, 0);

  return products.map((p, i) => ({
    ...p,
    calculatedProbability: total > 0 ? (quantities[i] / total) * 100 : 0,
  }));
}
