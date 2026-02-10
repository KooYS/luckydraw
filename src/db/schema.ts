import {
  mysqlTable,
  varchar,
  int,
  decimal,
  boolean,
  datetime,
  text,
} from 'drizzle-orm/mysql-core'
import { sql } from 'drizzle-orm'

// ============================================================
// 공통 컬럼 정의 (Base Columns)
// ============================================================

/** PK 컬럼 */
const pkColumn = {
  id: int('id').primaryKey().autoincrement(),
}

/** 생성/수정 타임스탬프 */
const timestampColumns = {
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: datetime('updated_at').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`).notNull(),
}

/** Soft Delete 컬럼 */
const softDeleteColumn = {
  deletedAt: datetime('deleted_at'),
}

/** 기본 컬럼 (PK + Timestamp + Soft Delete) */
const baseColumns = {
  ...pkColumn,
  ...timestampColumns,
  ...softDeleteColumn,
}

// ============================================================
// 테이블 정의
// ============================================================

/** 이벤트 테이블 */
export const events = mysqlTable('events', {
  ...baseColumns,

  // 기본 정보
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  titleImageUrl: varchar('title_image_url', { length: 500 }),
  titleImageWidth: int('title_image_width').default(80).notNull(),

  // 테마 설정
  primaryColor: varchar('primary_color', { length: 7 }).default('#c026d3').notNull(),
  secondaryColor: varchar('secondary_color', { length: 7 }).default('#701a75').notNull(),
  backgroundColor: varchar('background_color', { length: 7 }).default('#fdf4ff').notNull(),
  textColor: varchar('text_color', { length: 7 }).default('#1f2937').notNull(),
  subTextColor: varchar('sub_text_color', { length: 7 }).default('#6b7280').notNull(),
  accentColor: varchar('accent_color', { length: 7 }).default('#e879f9').notNull(),

  // 이미지
  posterUrl: varchar('poster_url', { length: 500 }),
  posterOverlay: boolean('poster_overlay').default(true).notNull(),
  logoUrl: varchar('logo_url', { length: 500 }),

  // 표시 설정
  showStockPanel: boolean('show_stock_panel').default(true).notNull(),

  // 상태
  isActive: boolean('is_active').default(true).notNull(),
})

/** 상품 테이블 */
export const products = mysqlTable('products', {
  ...baseColumns,

  // FK
  eventId: int('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),

  // 기본 정보
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  imageUrl: varchar('image_url', { length: 500 }),

  // 당첨 확률 (0.00 ~ 100.00) - 레거시, 수량 기반으로 대체됨
  probability: decimal('probability', { precision: 5, scale: 2 }).notNull(),

  // 가중치 (기본값 1.0, 높을수록 당첨 확률 증가)
  weight: decimal('weight', { precision: 5, scale: 2 }).default('1.00').notNull(),

  // 재고 관리
  totalQuantity: int('total_quantity').notNull(),
  remainingQuantity: int('remaining_quantity').notNull(),

  // 표시 순서
  displayOrder: int('display_order').default(0).notNull(),
})

/** 송금 계좌 테이블 */
export const paymentAccounts = mysqlTable('payment_accounts', {
  ...baseColumns,

  // URL slug (예: nice-company -> /account/nice-company)
  slug: varchar('slug', { length: 100 }).notNull().unique(),

  // 표시 정보
  displayName: varchar('display_name', { length: 255 }).notNull(),
  description: text('description'),
  logoUrl: varchar('logo_url', { length: 500 }),

  // 계좌 정보
  bankCode: varchar('bank_code', { length: 20 }).notNull(),
  accountNumber: varchar('account_number', { length: 50 }).notNull(),
  accountHolder: varchar('account_holder', { length: 100 }).notNull(),

  // 기본 송금 금액 (선택)
  defaultAmount: int('default_amount'),

  // 테마 설정
  primaryColor: varchar('primary_color', { length: 7 }).default('#3B82F6').notNull(),
  backgroundColor: varchar('background_color', { length: 7 }).default('#F8FAFC').notNull(),

  // 상태
  isActive: boolean('is_active').default(true).notNull(),
})

/** 당첨 결과 테이블 (로그성 - soft delete 미적용) */
export const drawResults = mysqlTable('draw_results', {
  ...pkColumn,

  // FK
  eventId: int('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  productId: int('product_id').references(() => products.id, {
    onDelete: 'set null',
  }),

  // 결과 정보
  isWin: boolean('is_win').notNull(),
  productName: varchar('product_name', { length: 255 }), // 상품 삭제되어도 기록 유지
  note: text('note'),

  // 타임스탬프 (생성만)
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
})

// ============================================================
// 타입 정의
// ============================================================

// Entity 타입
export type Event = typeof events.$inferSelect
export type NewEvent = typeof events.$inferInsert

export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert

export type DrawResult = typeof drawResults.$inferSelect
export type NewDrawResult = typeof drawResults.$inferInsert

export type PaymentAccount = typeof paymentAccounts.$inferSelect
export type NewPaymentAccount = typeof paymentAccounts.$inferInsert

// 테마 타입
export type EventTheme = Pick<
  Event,
  'primaryColor' | 'secondaryColor' | 'backgroundColor' | 'textColor' | 'subTextColor' | 'accentColor' | 'posterUrl' | 'logoUrl'
>

// Soft Delete 가능한 테이블 타입
export type SoftDeletable = {
  deletedAt: Date | null
}
