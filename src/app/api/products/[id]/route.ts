import { NextResponse } from 'next/server'
import { productRepository } from '@/repository'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/products/:id - 특정 상품 조회
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const productId = parseInt(id)

    const product = await productRepository.findById(productId)

    if (!product) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Failed to fetch product:', error)
    return NextResponse.json(
      { error: '상품을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// PATCH /api/products/:id - 상품 수정
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const productId = parseInt(id)
    const body = await request.json()

    await productRepository.update(productId, body)

    return NextResponse.json({ message: '상품이 수정되었습니다.' })
  } catch (error) {
    console.error('Failed to update product:', error)
    return NextResponse.json(
      { error: '상품 수정에 실패했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/:id - 상품 삭제 (soft delete)
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const productId = parseInt(id)

    await productRepository.softDelete(productId)

    return NextResponse.json({ message: '상품이 삭제되었습니다.' })
  } catch (error) {
    console.error('Failed to delete product:', error)
    return NextResponse.json(
      { error: '상품 삭제에 실패했습니다.' },
      { status: 500 }
    )
  }
}
