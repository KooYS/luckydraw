import { db } from "@/db";
import { products } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { BaseRepository } from "./base.repository";

/** 상품 리포지토리 */
class ProductRepository extends BaseRepository<typeof products> {
  constructor() {
    super(products);
  }

  /** 이벤트별 상품 조회 */
  async findByEventId(eventId: number) {
    return db
      .select()
      .from(this.table)
      .where(and(eq(products.eventId, eventId), this.notDeleted))
      .orderBy(products.displayOrder);
  }

  /** 이벤트별 재고 있는 상품 조회 */
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
      .orderBy(products.displayOrder);
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

  /** 재고 일괄 감소 (상품ID별 감소량) */
  async batchDecrementStock(decrements: Record<number, number>) {
    const entries = Object.entries(decrements);
    if (entries.length === 0) return;

    await Promise.all(
      entries.map(([id, count]) =>
        db
          .update(this.table)
          .set({
            remainingQuantity: sql`GREATEST(${products.remainingQuantity} - ${count}, 0)`,
          })
          .where(eq(products.id, Number(id)))
      )
    );
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
