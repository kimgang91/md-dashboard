import { NextRequest, NextResponse } from 'next/server'
import { signToken } from '@/lib/auth'
import { getRecords } from '@/lib/airtable'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { message: '이메일과 비밀번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 에어테이블에서 MD 정보 조회
    // MD 테이블에 email, password, name, role 필드가 있다고 가정
    const records = await getRecords('MD', {
      filterByFormula: `{email} = "${email}"`,
      maxRecords: 1
    })

    if (records.length === 0) {
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
      
      return NextResponse.json(
        { message: '등록되지 않은 이메일입니다.' },
        { status: 401 }
      )
    }

    const mdRecord = records[0]
    const storedPassword = mdRecord.fields.password

    // 실제 운영시에는 bcrypt로 비밀번호 해시 비교
    if (password !== storedPassword) {
      return NextResponse.json(
        { message: '비밀번호가 일치하지 않습니다.' },
        { status: 401 }
      )
    }

    const user = {
      id: mdRecord.id,
      email: mdRecord.fields.email,
      name: mdRecord.fields.name || mdRecord.fields.이름 || '담당자',
      role: mdRecord.fields.role || 'md'
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
