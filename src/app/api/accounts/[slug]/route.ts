import { NextResponse } from "next/server";
import { db } from "@/db";
import { paymentAccounts } from "@/db/schema";
import { eq, isNull, and, or } from "drizzle-orm";

// GET /api/accounts/:slug - 계좌 정보 조회
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const admin = searchParams.get("admin") === "true";

  // 관리자 모드: 비활성 계좌도 조회 가능
  const conditions = admin
    ? and(
        or(
          eq(paymentAccounts.slug, slug),
          eq(paymentAccounts.id, parseInt(slug) || 0)
        ),
        isNull(paymentAccounts.deletedAt)
      )
    : and(
        eq(paymentAccounts.slug, slug),
        eq(paymentAccounts.isActive, true),
        isNull(paymentAccounts.deletedAt)
      );

  const account = await db
    .select()
    .from(paymentAccounts)
    .where(conditions)
    .limit(1);

  if (account.length === 0) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  return NextResponse.json(account[0]);
}

// PATCH /api/accounts/:slug - 계좌 정보 수정
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await request.json();

  // slug 또는 id로 조회
  const existing = await db
    .select()
    .from(paymentAccounts)
    .where(
      and(
        or(
          eq(paymentAccounts.slug, slug),
          eq(paymentAccounts.id, parseInt(slug) || 0)
        ),
        isNull(paymentAccounts.deletedAt)
      )
    )
    .limit(1);

  if (existing.length === 0) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  await db
    .update(paymentAccounts)
    .set({
      ...(body.slug && { slug: body.slug }),
      ...(body.displayName && { displayName: body.displayName }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.logoUrl !== undefined && { logoUrl: body.logoUrl }),
      ...(body.bankCode && { bankCode: body.bankCode }),
      ...(body.accountNumber && { accountNumber: body.accountNumber }),
      ...(body.accountHolder && { accountHolder: body.accountHolder }),
      ...(body.defaultAmount !== undefined && { defaultAmount: body.defaultAmount || null }),
      ...(body.primaryColor && { primaryColor: body.primaryColor }),
      ...(body.backgroundColor && { backgroundColor: body.backgroundColor }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    })
    .where(eq(paymentAccounts.id, existing[0].id));

  const updated = await db
    .select()
    .from(paymentAccounts)
    .where(eq(paymentAccounts.id, existing[0].id))
    .limit(1);

  return NextResponse.json(updated[0]);
}

// DELETE /api/accounts/:slug - 계좌 삭제 (soft delete)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const existing = await db
    .select()
    .from(paymentAccounts)
    .where(
      and(
        or(
          eq(paymentAccounts.slug, slug),
          eq(paymentAccounts.id, parseInt(slug) || 0)
        ),
        isNull(paymentAccounts.deletedAt)
      )
    )
    .limit(1);

  if (existing.length === 0) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  await db
    .update(paymentAccounts)
    .set({ deletedAt: new Date() })
    .where(eq(paymentAccounts.id, existing[0].id));

  return NextResponse.json({ success: true });
}
