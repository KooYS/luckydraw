import { NextResponse } from 'next/server'
import { eventRepository } from '@/repository'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/events/:id - 특정 이벤트 조회
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const eventId = parseInt(id)

    const event = await eventRepository.findById(eventId)

    if (!event) {
      return NextResponse.json(
        { error: '이벤트를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error('Failed to fetch event:', error)
    return NextResponse.json(
      { error: '이벤트를 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// PATCH /api/events/:id - 이벤트 수정
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const eventId = parseInt(id)
    const body = await request.json()

    await eventRepository.update(eventId, body)

    // 수정된 이벤트 반환
    const updatedEvent = await eventRepository.findById(eventId)
    return NextResponse.json(updatedEvent)
  } catch (error) {
    console.error('Failed to update event:', error)
    return NextResponse.json(
      { error: '이벤트 수정에 실패했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE /api/events/:id - 이벤트 삭제 (soft delete)
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const eventId = parseInt(id)

    await eventRepository.softDelete(eventId)

    return NextResponse.json({ message: '이벤트가 삭제되었습니다.' })
  } catch (error) {
    console.error('Failed to delete event:', error)
    return NextResponse.json(
      { error: '이벤트 삭제에 실패했습니다.' },
      { status: 500 }
    )
  }
}
