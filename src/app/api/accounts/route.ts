import { NextResponse } from "next/server";
import { db } from "@/db";
import { paymentAccounts } from "@/db/schema";
import { isNull, desc } from "drizzle-orm";

// GET /api/accounts - 계좌 목록 조회
export async function GET() {
  const accounts = await db
    .select()
    .from(paymentAccounts)
    .where(isNull(paymentAccounts.deletedAt))
    .orderBy(desc(paymentAccounts.createdAt));

  return NextResponse.json(accounts);
}

// POST /api/accounts - 계좌 생성
export async function POST(request: Request) {
  const body = await request.json();

  const result = await db.insert(paymentAccounts).values({
    slug: body.slug,
    displayName: body.displayName,
    description: body.description || null,
    logoUrl: body.logoUrl || null,
    bankCode: body.bankCode,
    accountNumber: body.accountNumber,
    accountHolder: body.accountHolder,
    defaultAmount: body.defaultAmount || null,
    primaryColor: body.primaryColor || "#3B82F6",
    backgroundColor: body.backgroundColor || "#F8FAFC",
    isActive: body.isActive ?? true,
  });

  const insertId = result[0].insertId;

  return NextResponse.json({ id: insertId }, { status: 201 });
}
