import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getTokenFromHeader } from '@/lib/auth'
import { createRecord, getRecords } from '@/lib/airtable'

// 라이브(입점) 완료폼 조회
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
            id: 'live1',
            fields: {
              업체명: '캠핑장 A',
              입점완료일: '2025-01-15',
              담당MD: '데모 MD',
              라이브URL: 'https://example.com/camping-a',
              특이사항: '정상 오픈'
            }
          }
        ]
      })
    }

    const records = await getRecords('라이브완료', {
      filterByFormula: `{담당MD} = "${user.name}"`,
      sort: [{ field: '입점완료일', direction: 'desc' }]
    })

    return NextResponse.json({ records })
  } catch (error: any) {
    console.error('Live complete fetch error:', error)
    return NextResponse.json(
      { message: '데이터를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 라이브(입점) 완료폼 제출
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
    if (!formData.업체명 || !formData.입점완료일) {
      return NextResponse.json(
        { message: '필수 항목을 모두 입력해주세요.' },
        { status: 400 }
      )
    }

    // 데모 사용자용
    if (user.id === 'demo-user') {
      return NextResponse.json({
        success: true,
        message: '라이브 완료 폼이 제출되었습니다. (데모 모드)',
        record: { id: 'demo-' + Date.now(), fields: formData }
      })
    }

    const record = await createRecord('라이브완료', {
      ...formData,
      담당MD: user.name,
      담당MD_ID: user.id,
      제출일시: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: '라이브 완료 폼이 제출되었습니다.',
      record
    })
  } catch (error: any) {
    console.error('Live complete submit error:', error)
    return NextResponse.json(
      { message: '폼 제출 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
