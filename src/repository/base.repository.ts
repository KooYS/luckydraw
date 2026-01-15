import { db } from "@/db";
import { eq, isNull, isNotNull, and, SQL } from "drizzle-orm";
import { MySqlTable, MySqlColumn } from "drizzle-orm/mysql-core";

type SoftDeletableTable = MySqlTable & {
  id: MySqlColumn;
  deletedAt: MySqlColumn;
};

/** 소프트 딜리트 지원 추상 리포지토리 */
export abstract class BaseRepository<T extends SoftDeletableTable> {
  constructor(protected readonly table: T) {}

  /** 삭제되지 않은 조건 */
  protected get notDeleted() {
    return isNull(this.table.deletedAt);
  }

  /** 삭제되지 않은 조건과 결합 */
  protected withNotDeleted(condition?: SQL): SQL | undefined {
    if (!condition) return this.notDeleted;
    return and(this.notDeleted, condition);
  }

  /** 전체 조회 (삭제된 항목 제외) */
  async findAll(condition?: SQL) {
    return db.select().from(this.table).where(this.withNotDeleted(condition));
  }

  /** ID로 조회 (삭제된 항목 제외) */
  async findById(id: number) {
    const [result] = await db
      .select()
      .from(this.table)
      .where(and(eq(this.table.id, id), this.notDeleted))
      .limit(1);
    return result ?? null;
  }

  /** ID로 조회 (삭제된 항목 포함) */
  async findByIdIncludeDeleted(id: number) {
    const [result] = await db
      .select()
      .from(this.table)
      .where(eq(this.table.id, id))
      .limit(1);
    return result ?? null;
  }

  /** 새 레코드 생성 */
  async create(
    data: Omit<T["$inferInsert"], "id" | "createdAt" | "updatedAt" | "deletedAt">
  ) {
    const [result] = await db.insert(this.table).values(data as T["$inferInsert"]);
    return result;
  }

  /** 레코드 수정 */
  async update(id: number, data: Partial<T["$inferInsert"]>) {
    return db
      .update(this.table)
      .set({ ...data, updatedAt: new Date() } as Partial<T["$inferInsert"]>)
      .where(eq(this.table.id, id));
  }

  /** 소프트 삭제 */
  async softDelete(id: number) {
    return db
      .update(this.table)
      .set({ deletedAt: new Date() } as Partial<T["$inferInsert"]>)
      .where(eq(this.table.id, id));
  }

  /** 삭제된 레코드 복원 */
  async restore(id: number) {
    return db
      .update(this.table)
      .set({ deletedAt: null } as Partial<T["$inferInsert"]>)
      .where(eq(this.table.id, id));
  }

  /** 영구 삭제 */
  async hardDelete(id: number) {
    return db.delete(this.table).where(eq(this.table.id, id));
  }

  /** 삭제된 레코드 조회 */
  async findDeleted() {
    return db.select().from(this.table).where(isNotNull(this.table.deletedAt));
  }
}
