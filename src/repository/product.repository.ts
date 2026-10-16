import { db, type Tx } from "@/db";
import { products } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { BaseRepository } from "./base.repository";

/** 숫자를 숫자로 비교하는 이름 정렬 ("10등"이 "2등" 뒤로 가도록) */
const byNameNatural = (a: { name: string }, b: { name: string }) =>
  a.name.localeCompare(b.name, "ko", { numeric: true });

/** 상품 리포지토리 */
class ProductRepository extends BaseRepository<typeof products> {
  constructor() {
    super(products);
  }

  /** 이벤트별 상품 조회 (이름 자연 정렬: 1등 < 2등 < 10등) */
  async findByEventId(eventId: number) {
    const rows = await db
      .select()
      .from(this.table)
      .where(and(eq(products.eventId, eventId), this.notDeleted));

    return rows.sort(byNameNatural);
  }

  /** 이벤트별 재고 있는 상품 조회 (확률 오름차순) */
  async findAvailableByEventId(eventId: number) {
    return db
      .select()
      .from(this.table)
      .where(
        and(
          eq(products.eventId, eventId),
          this.notDeleted,
          sql`${products.remainingQuantity} > 0`
        )
      )
      .orderBy(sql`${products.totalQuantity} * ${products.weight} ASC`);
  }

  /** 상품 생성 */
  async createProduct(data: {
    eventId: number;
    name: string;
    description?: string;
    imageUrl?: string;
    probability?: number;
    totalQuantity: number;
    displayOrder?: number;
  }) {
    const [result] = await db.insert(products).values({
      eventId: data.eventId,
      name: data.name,
      description: data.description,
      imageUrl: data.imageUrl,
      probability: String(data.probability ?? 0),
      totalQuantity: data.totalQuantity,
      remainingQuantity: data.totalQuantity,
      displayOrder: data.displayOrder ?? 0,
    });
    return result;
  }

  /** 재고 1개 감소 */
  async decrementStock(id: number) {
    return db
      .update(this.table)
      .set({
        remainingQuantity: sql`GREATEST(${products.remainingQuantity} - 1, 0)`,
      })
      .where(eq(products.id, id));
  }

  /** 재고 일괄 감소 (상품ID별 감소량). tx 를 넘기면 그 트랜잭션 안에서 실행된다. */
  async batchDecrementStock(decrements: Record<number, number>, tx?: Tx) {
    const entries = Object.entries(decrements);
    if (entries.length === 0) return;

    // 트랜잭션은 커넥션 1개라 병렬 실행에 이득이 없다. 순차 루프가 그냥 더 단순.
    const runner = tx ?? db;
    for (const [id, count] of entries) {
      await runner
        .update(this.table)
        .set({
          remainingQuantity: sql`GREATEST(${products.remainingQuantity} - ${count}, 0)`,
        })
        .where(eq(products.id, Number(id)));
    }
  }

  /** 재고 조정 */
  async adjustStock(id: number, adjustment: number) {
    const product = await this.findById(id);
    if (!product) return null;

    const newRemaining = Math.max(
      0,
      Math.min(product.totalQuantity, product.remainingQuantity + adjustment)
    );

    await this.update(id, { remainingQuantity: newRemaining });
    return { ...product, remainingQuantity: newRemaining };
  }

  /** 재고 초기화 */
  async resetStock(id: number) {
    const product = await this.findById(id);
    if (!product) return null;

    await this.update(id, { remainingQuantity: product.totalQuantity });
    return { ...product, remainingQuantity: product.totalQuantity };
  }

  /** 이벤트별 전체 재고 초기화 */
  async resetAllStockByEventId(eventId: number) {
    const eventProducts = await this.findByEventId(eventId);

    for (const product of eventProducts) {
      await this.update(product.id, { remainingQuantity: product.totalQuantity });
    }

    return eventProducts.map((p) => ({
      ...p,
      remainingQuantity: p.totalQuantity,
    }));
  }
}

export const productRepository = new ProductRepository();
