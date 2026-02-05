import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getTokenFromHeader } from '@/lib/auth'
import { createRecord, getRecords } from '@/lib/airtable'

// 이탈/해지 우려 폼 조회
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
            id: 'churn1',
            fields: {
              업체명: '글램핑 C',
              접수일: '2026-01-20',
              담당MD: '데모 MD',
              이탈사유: '수수료불만',
              상세내용: '경쟁사 수수료가 더 낮다고 불만 제기',
              현재상태: '대응중',
              대응방안: '수수료 협의 미팅 예정'
            }
          },
          {
            id: 'churn2',
            fields: {
              업체명: '펜션 G',
              접수일: '2026-01-15',
              담당MD: '데모 MD',
              이탈사유: '매출부진',
              상세내용: '예약률이 낮아 플랫폼 효과에 의문',
              현재상태: '모니터링',
              대응방안: '프로모션 지원 제안'
            }
          }
        ]
      })
    }

    const records = await getRecords('이탈해지우려', {
      filterByFormula: `{담당MD} = "${user.name}"`,
      sort: [{ field: '접수일', direction: 'desc' }]
    })

    return NextResponse.json({ records })
  } catch (error: any) {
    console.error('Churn risk fetch error:', error)
    return NextResponse.json(
      { message: '데이터를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 이탈/해지 우려 폼 제출
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
    if (!formData.업체명 || !formData.이탈사유 || !formData.상세내용) {
      return NextResponse.json(
        { message: '필수 항목을 모두 입력해주세요.' },
        { status: 400 }
      )
    }

    // 데모 사용자용
    if (user.id === 'demo-user') {
      return NextResponse.json({
        success: true,
        message: '이탈/해지 우려가 등록되었습니다. (데모 모드)',
        record: { id: 'demo-churn-' + Date.now(), fields: formData }
      })
    }

    const record = await createRecord('이탈해지우려', {
      ...formData,
      담당MD: user.name,
      담당MD_ID: user.id,
      접수일: new Date().toISOString().split('T')[0],
      현재상태: '접수'
    })

    return NextResponse.json({
      success: true,
      message: '이탈/해지 우려가 등록되었습니다.',
      record
    })
  } catch (error: any) {
    console.error('Churn risk submit error:', error)
    return NextResponse.json(
      { message: '폼 제출 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
