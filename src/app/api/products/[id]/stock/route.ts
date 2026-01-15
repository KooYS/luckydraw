import { NextResponse } from 'next/server'
import { productRepository } from '@/repository'

interface RouteParams {
  params: Promise<{ id: string }>
}

// PATCH /api/products/:id/stock - 재고 수량 조정
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const productId = parseInt(id)
    const body = await request.json()
    const { remainingQuantity, adjustment } = body

    // 현재 상품 조회
    const product = await productRepository.findById(productId)

    if (!product) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    let newQuantity: number

    if (typeof remainingQuantity === 'number') {
      // 절대값으로 설정
      newQuantity = remainingQuantity
    } else if (typeof adjustment === 'number') {
      // 상대값으로 조정 (+/-)
      newQuantity = product.remainingQuantity + adjustment
    } else {
      return NextResponse.json(
        { error: 'remainingQuantity 또는 adjustment가 필요합니다.' },
        { status: 400 }
      )
    }

    // 음수 방지
    newQuantity = Math.max(0, newQuantity)

    // 최대값 제한 (초기 수량 초과 불가)
    newQuantity = Math.min(newQuantity, product.totalQuantity)

    await productRepository.update(productId, { remainingQuantity: newQuantity })

    return NextResponse.json({
      message: '재고가 수정되었습니다.',
      remainingQuantity: newQuantity,
    })
  } catch (error) {
    console.error('Failed to update stock:', error)
    return NextResponse.json(
      { error: '재고 수정에 실패했습니다.' },
      { status: 500 }
    )
  }
}
