import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getTokenFromHeader } from '@/lib/auth'
import { getRecords } from '@/lib/airtable'

export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const authHeader = request.headers.get('authorization')
    const token = getTokenFromHeader(authHeader)
    
    if (!token) {
      return NextResponse.json(
        { message: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json(
        { message: '유효하지 않은 토큰입니다.' },
        { status: 401 }
      )
    }

    // 데모 사용자용 샘플 데이터
    if (user.id === 'demo-user') {
      return NextResponse.json({
        records: [
          {
            id: 'rec1',
            fields: {
              업체명: '캠핑장 A',
              상태: '정상운영',
              담당MD: '데모 MD',
              연락처: '010-1234-5678',
              입점일: '2025-01-15',
              월매출: 15000000,
              계약상태: '정상'
            }
          },
          {
            id: 'rec2',
            fields: {
              업체명: '캠핑장 B',
              상태: '정상운영',
              담당MD: '데모 MD',
              연락처: '010-2345-6789',
              입점일: '2025-02-01',
              월매출: 8500000,
              계약상태: '정상'
            }
          },
          {
            id: 'rec3',
            fields: {
              업체명: '글램핑 C',
              상태: '이탈우려',
              담당MD: '데모 MD',
              연락처: '010-3456-7890',
              입점일: '2024-11-20',
              월매출: 3200000,
              계약상태: '주의'
            }
          },
          {
            id: 'rec4',
            fields: {
              업체명: '펜션 D',
              상태: '정상운영',
              담당MD: '데모 MD',
              연락처: '010-4567-8901',
              입점일: '2025-01-28',
              월매출: 12000000,
              계약상태: '정상'
            }
          },
        ]
      })
    }

    // 에어테이블에서 해당 MD의 업체 목록 조회
    // 업체 테이블에 담당MD 필드가 있다고 가정 (연결된 레코드 또는 텍스트)
    const records = await getRecords('업체', {
      filterByFormula: `OR({담당MD} = "${user.name}", {담당MD_ID} = "${user.id}")`,
      sort: [{ field: '업체명', direction: 'asc' }]
    })

    return NextResponse.json({ records })
  } catch (error: any) {
    console.error('Companies fetch error:', error)
    return NextResponse.json(
      { message: '업체 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
