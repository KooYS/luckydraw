import { NextRequest, NextResponse } from 'next/server'
import { eventRepository } from '@/repository'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/events/:id - 특정 이벤트 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    const hasPassword = !!event.adminPassword
    const isAuthenticated = hasPassword
      ? request.cookies.get(`event_auth_${eventId}`)?.value === 'true'
      : true

    // adminPassword 값 자체는 클라이언트에 노출하지 않음
    const { adminPassword: _, ...eventData } = event

    return NextResponse.json({
      ...eventData,
      hasPassword,
      isAuthenticated,
    })
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

    // 수정된 이벤트 반환 (adminPassword 제외)
    const updatedEvent = await eventRepository.findById(eventId)
    if (updatedEvent) {
      const { adminPassword: _, ...eventData } = updatedEvent
      const hasPassword = !!updatedEvent.adminPassword

      const response = NextResponse.json({
        ...eventData,
        hasPassword,
        isAuthenticated: true,
      })

      // 패스워드가 설정된 경우 인증 쿠키도 함께 설정 (관리자가 잠기지 않도록)
      if (hasPassword) {
        response.cookies.set(`event_auth_${eventId}`, 'true', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 7일
        })
      } else {
        // 패스워드가 제거된 경우 쿠키도 삭제
        response.cookies.delete(`event_auth_${eventId}`)
      }

      return response
    }
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
