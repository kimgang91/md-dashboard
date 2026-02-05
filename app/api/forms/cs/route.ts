import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getTokenFromHeader } from '@/lib/auth'
import { createRecord, getRecords } from '@/lib/airtable'

// CS 접수폼 조회
export async function GET(request: NextRequest) {
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
        records: [
          {
            id: 'cs1',
            fields: {
              업체명: '캠핑장 B',
              접수일: '2026-02-01',
              CS유형: '결제문의',
              담당MD: '데모 MD',
              고객명: '홍길동',
              연락처: '010-1234-5678',
              내용: '결제 취소 요청',
              처리상태: '처리중'
            }
          },
          {
            id: 'cs2',
            fields: {
              업체명: '글램핑 C',
              접수일: '2026-01-28',
              CS유형: '예약변경',
              담당MD: '데모 MD',
              고객명: '김철수',
              연락처: '010-9876-5432',
              내용: '예약 날짜 변경 요청',
              처리상태: '완료'
            }
          }
        ]
      })
    }

    const records = await getRecords('CS접수', {
      filterByFormula: `{담당MD} = "${user.name}"`,
      sort: [{ field: '접수일', direction: 'desc' }]
    })

    return NextResponse.json({ records })
  } catch (error: any) {
    console.error('CS fetch error:', error)
    return NextResponse.json(
      { message: '데이터를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// CS 접수폼 제출
export async function POST(request: NextRequest) {
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

    const formData = await request.json()

    // 필수 필드 검증
    if (!formData.업체명 || !formData.CS유형 || !formData.내용) {
      return NextResponse.json(
        { message: '필수 항목을 모두 입력해주세요.' },
        { status: 400 }
      )
    }

    // 데모 사용자용
    if (user.id === 'demo-user') {
      return NextResponse.json({
        success: true,
        message: 'CS 접수가 완료되었습니다. (데모 모드)',
        record: { id: 'demo-cs-' + Date.now(), fields: formData }
      })
    }

    const record = await createRecord('CS접수', {
      ...formData,
      담당MD: user.name,
      담당MD_ID: user.id,
      접수일: new Date().toISOString().split('T')[0],
      처리상태: '접수완료'
    })

    return NextResponse.json({
      success: true,
      message: 'CS 접수가 완료되었습니다.',
      record
    })
  } catch (error: any) {
    console.error('CS submit error:', error)
    return NextResponse.json(
      { message: '폼 제출 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
