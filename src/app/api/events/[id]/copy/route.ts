import { NextRequest, NextResponse } from 'next/server'
import { eventRepository, productRepository } from '@/repository'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST /api/events/:id/copy - 이벤트 복사 (설정 + 상품 목록)
export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const eventId = parseInt(id)

    const original = await eventRepository.findById(eventId)
    if (!original) {
      return NextResponse.json({ error: '이벤트를 찾을 수 없습니다.' }, { status: 404 })
    }

    // 이벤트 복사 (id/timestamp/adminPassword 제외, isActive는 false)
    const result = await eventRepository.create({
      name: `${original.name} (복사본)`,
      description: original.description,
      titleImageUrl: original.titleImageUrl,
      titleImageWidth: original.titleImageWidth,
      primaryColor: original.primaryColor,
      secondaryColor: original.secondaryColor,
      backgroundColor: original.backgroundColor,
      textColor: original.textColor,
      subTextColor: original.subTextColor,
      accentColor: original.accentColor,
      posterUrl: original.posterUrl,
      posterOverlay: original.posterOverlay,
      logoUrl: original.logoUrl,
      fontUrl: original.fontUrl,
      showStockPanel: original.showStockPanel,
      isActive: false,
    })

    const newEventId = (result as unknown as { insertId: number }).insertId

    // 상품 복사 (재고는 totalQuantity로 리셋)
    const products = await productRepository.findByEventId(eventId)
    await Promise.all(
      products.map((p) =>
        productRepository.create({
          eventId: newEventId,
          name: p.name,
          description: p.description,
          imageUrl: p.imageUrl,
          probability: p.probability,
          weight: p.weight,
          totalQuantity: p.totalQuantity,
          remainingQuantity: p.totalQuantity,
          displayOrder: p.displayOrder,
        })
      )
    )

    return NextResponse.json({ id: newEventId })
  } catch (error) {
    console.error('Failed to copy event:', error)
    return NextResponse.json({ error: '이벤트 복사에 실패했습니다.' }, { status: 500 })
  }
}
