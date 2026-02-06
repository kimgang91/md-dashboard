import { NextRequest, NextResponse } from 'next/server'
import { signToken } from '@/lib/auth'
import { getRecords } from '@/lib/airtable'

// 연락처에서 뒷자리 4자리 추출
function extractLast4Digits(phone: string): string {
  if (!phone) return ''
  // 숫자만 추출
  const digits = phone.replace(/\D/g, '')
  // 뒷자리 4자리 반환
  return digits.slice(-4)
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { message: '이메일과 비밀번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 데모 계정 체크 (에어테이블 연결 전 테스트용)
    if (email === 'demo@test.com' && password === 'demo1234') {
      const demoUser = {
        id: 'demo-user',
        email: 'demo@test.com',
        name: '데모 MD',
        role: 'md'
      }
      const token = signToken(demoUser)
      return NextResponse.json({ token, user: demoUser })
    }

    // 관리자 계정 체크
    if (email === 'abcdd1@nextedition.co.kr' && password === 'rlarodtn3479!') {
      const adminUser = {
        id: 'admin-user',
        email: 'abcdd1@nextedition.co.kr',
        name: '관리자',
        role: 'admin'
      }
      const token = signToken(adminUser)
      return NextResponse.json({ token, user: adminUser })
    }

    // 에어테이블 "MD 마스터 DB" 테이블에서 MD 정보 조회
    // "이메일" 필드로 검색
    const records = await getRecords('MD 마스터 DB', {
      filterByFormula: `{이메일} = "${email}"`,
      maxRecords: 1
    })

    if (records.length === 0) {
      return NextResponse.json(
        { message: '등록되지 않은 이메일입니다.' },
        { status: 401 }
      )
    }

    const mdRecord = records[0]
    
    // "연락처" 필드에서 뒷자리 4자리 추출하여 비밀번호로 사용
    const phoneNumber = mdRecord.fields['연락처'] || mdRecord.fields.연락처 || ''
    const expectedPassword = extractLast4Digits(phoneNumber)

    // 비밀번호 확인 (연락처 뒷자리 4자리)
    if (password !== expectedPassword) {
      return NextResponse.json(
        { message: '비밀번호가 일치하지 않습니다. (연락처 뒷자리 4자리)' },
        { status: 401 }
      )
    }

    // 사용자 정보 구성
    // "담당MD" 필드에서 이름 가져오기
    const user = {
      id: mdRecord.id,
      email: mdRecord.fields['이메일'] || mdRecord.fields.이메일 || email,
      name: mdRecord.fields['담당MD'] || mdRecord.fields.담당MD || mdRecord.fields['이름'] || mdRecord.fields.이름 || '담당자',
      role: mdRecord.fields['역할'] || mdRecord.fields.role || 'md'
    }

    const token = signToken(user)

    return NextResponse.json({ token, user })
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: '로그인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
