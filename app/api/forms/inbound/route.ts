import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getTokenFromHeader } from '@/lib/auth'
import { createRecord, getRecords } from '@/lib/airtable'

// 인바운드결과 폼 조회 - "인바운드 캠핑장 DB" 테이블 연동
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
            id: 'inbound1',
            fields: {
              업체명: '신규캠핑장 E',
              인입일자: '2026-01-30',
              인입경로: '홈페이지',
              담당MD: '데모 MD',
              대표자명: '박대표',
              연락처: '010-1111-2222',
              지역: '강원도',
              미팅결과: '미팅예정',
              예상입점일: '2026-03-01'
            }
          },
          {
            id: 'inbound2',
            fields: {
              업체명: '신규글램핑 F',
              인입일자: '2026-01-25',
              인입경로: '제휴문의',
              담당MD: '데모 MD',
              대표자명: '이대표',
              연락처: '010-3333-4444',
              지역: '경기도',
              미팅결과: '계약진행중',
              예상입점일: '2026-02-15'
            }
          }
        ]
      })
    }

    // 에어테이블 "인바운드 캠핑장 DB" 테이블에서 로그인한 MD 이름과 일치하는 내역 조회
    const records = await getRecords('인바운드 캠핑장 DB', {
      filterByFormula: `{담당MD} = "${user.name}"`,
      sort: [{ field: '인입일자', direction: 'desc' }]
    })

    return NextResponse.json({ records })
  } catch (error: any) {
    console.error('Inbound fetch error:', error)
    return NextResponse.json(
      { message: '데이터를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 인바운드결과 폼 제출
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
    if (!formData.업체명 || !formData.인입경로 || !formData.미팅결과) {
      return NextResponse.json(
        { message: '필수 항목을 모두 입력해주세요.' },
        { status: 400 }
      )
    }

    // 데모 사용자용
    if (user.id === 'demo-user') {
      return NextResponse.json({
        success: true,
        message: '인바운드 결과가 등록되었습니다. (데모 모드)',
        record: { id: 'demo-inbound-' + Date.now(), fields: formData }
      })
    }

    const record = await createRecord('인바운드결과', {
      ...formData,
      담당MD: user.name,
      담당MD_ID: user.id,
      인입일자: formData.인입일자 || new Date().toISOString().split('T')[0]
    })

    return NextResponse.json({
      success: true,
      message: '인바운드 결과가 등록되었습니다.',
      record
    })
  } catch (error: any) {
    console.error('Inbound submit error:', error)
    return NextResponse.json(
      { message: '폼 제출 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
