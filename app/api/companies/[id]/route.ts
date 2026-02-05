import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getTokenFromHeader } from '@/lib/auth'
import { getRecord, updateRecord } from '@/lib/airtable'

// 특정 업체 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = getTokenFromHeader(authHeader)
    
    if (!token) {
      return NextResponse.json({ message: '인증이 필요합니다.' }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ message: '유효하지 않은 토큰입니다.' }, { status: 401 })
    }

    // 데모 사용자용 샘플 데이터
    if (user.id === 'demo-user') {
      return NextResponse.json({
        id: params.id,
        fields: {
          업체명: '캠핑장 A',
          상태: '정상운영',
          담당MD: '데모 MD',
          연락처: '010-1234-5678',
          이메일: 'camping@example.com',
          입점일: '2025-01-15',
          월매출: 15000000,
          계약상태: '정상',
          메모: '우수 업체, 지속 관리 필요'
        }
      })
    }

    const record = await getRecord('업체', params.id)
    return NextResponse.json(record)
  } catch (error: any) {
    console.error('Company fetch error:', error)
    return NextResponse.json(
      { message: '업체 정보를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 업체 정보 수정 (PATCH)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = getTokenFromHeader(authHeader)
    
    if (!token) {
      return NextResponse.json({ message: '인증이 필요합니다.' }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ message: '유효하지 않은 토큰입니다.' }, { status: 401 })
    }

    const fields = await request.json()

    // 데모 사용자용 - 실제 업데이트 없이 성공 반환
    if (user.id === 'demo-user') {
      return NextResponse.json({
        id: params.id,
        fields: fields,
        message: '업데이트 성공 (데모 모드)'
      })
    }

    const updatedRecord = await updateRecord('업체', params.id, fields)
    return NextResponse.json(updatedRecord)
  } catch (error: any) {
    console.error('Company update error:', error)
    return NextResponse.json(
      { message: '업체 정보 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
