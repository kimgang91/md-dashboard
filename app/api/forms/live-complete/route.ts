import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getTokenFromHeader } from '@/lib/auth'
import { createRecord, getRecords, updateRecord } from '@/lib/airtable'

// 라이브(입점) 완료 조회
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
              접수일자: '2026-01-15',
              '캠핑장 이름': '해피캠핑장',
              등급: 'A',
              유형: '캠핑장',
              MD이름: '데모 MD',
              입점유형: '신규',
              가입플랜: 'Premium',
              '수수료(%, vat포함)': '10%',
              경로: '직접영업',
              비고: '',
              'MD 성과급': 200000,
              '관리자 성과급': null,
              '관리자 비고': ''
            }
          }
        ]
      })
    }

    let records
    
    // 관리자는 모든 데이터 조회
    if (user.role === 'admin') {
      records = await getRecords('라이브(입점) 완료', {
        sort: [{ field: '접수일자', direction: 'desc' }]
      })
    } else {
      // 일반 MD는 본인 데이터만 조회
      records = await getRecords('라이브(입점) 완료', {
        filterByFormula: `{MD이름} = "${user.name}"`,
        sort: [{ field: '접수일자', direction: 'desc' }]
      })
    }

    return NextResponse.json({ records, userRole: user.role })
  } catch (error: any) {
    console.error('Live complete fetch error:', error)
    return NextResponse.json(
      { message: '데이터를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 라이브(입점) 완료 제출/수정
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

    // 데모 사용자용
    if (user.id === 'demo-user' || user.id === 'admin-user') {
      return NextResponse.json({
        success: true,
        message: '저장되었습니다. (데모 모드)',
        record: { id: 'demo-' + Date.now(), fields: formData }
      })
    }

    const record = await createRecord('라이브(입점) 완료', {
      ...formData,
      MD이름: user.name,
      제출일시: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: '저장되었습니다.',
      record
    })
  } catch (error: any) {
    console.error('Live complete submit error:', error)
    return NextResponse.json(
      { message: '저장 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 성과급 업데이트 (PATCH)
export async function PATCH(request: NextRequest) {
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

    const { recordId, fields } = await request.json()

    if (!recordId) {
      return NextResponse.json({ message: '레코드 ID가 필요합니다.' }, { status: 400 })
    }

    // 데모/관리자 사용자용
    if (user.id === 'demo-user' || user.id === 'admin-user') {
      return NextResponse.json({
        success: true,
        message: '업데이트되었습니다. (데모 모드)',
        record: { id: recordId, fields }
      })
    }

    // 관리자만 관리자 필드 수정 가능
    const allowedFields: Record<string, any> = {}
    
    if (user.role === 'admin') {
      // 관리자는 모든 필드 수정 가능
      if (fields['관리자 성과급'] !== undefined) allowedFields['관리자 성과급'] = fields['관리자 성과급']
      if (fields['관리자 비고'] !== undefined) allowedFields['관리자 비고'] = fields['관리자 비고']
    }
    
    // MD는 본인 성과급만 수정 가능
    if (fields['MD 성과급'] !== undefined) allowedFields['MD 성과급'] = fields['MD 성과급']

    const updatedRecord = await updateRecord('라이브(입점) 완료', recordId, allowedFields)

    return NextResponse.json({
      success: true,
      message: '업데이트되었습니다.',
      record: updatedRecord
    })
  } catch (error: any) {
    console.error('Live complete update error:', error)
    return NextResponse.json(
      { message: '업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
