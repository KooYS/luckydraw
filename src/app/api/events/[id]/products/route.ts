import { NextResponse } from "next/server";
import { productRepository } from "@/repository";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/events/:id/products - 이벤트의 상품 목록 조회
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const eventId = parseInt(id);

    const eventProducts = await productRepository.findByEventId(eventId);

    return NextResponse.json(eventProducts);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json(
      { error: "상품 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// POST /api/events/:id/products - 상품 추가
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const eventId = parseInt(id);
    const body = await request.json();

    const result = await productRepository.createProduct({
      eventId,
      name: body.name,
      description: body.description,
      imageUrl: body.imageUrl,
      probability: body.probability,
      totalQuantity: body.totalQuantity,
      displayOrder: body.displayOrder || 0,
    });

    return NextResponse.json(
      { message: "상품이 추가되었습니다.", id: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json(
      { error: "상품 추가에 실패했습니다." },
      { status: 500 }
    );
  }
}
