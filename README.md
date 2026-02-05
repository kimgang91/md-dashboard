# MD 대시보드

에어테이블 기반 MD(담당자)별 업체 관리 대시보드 시스템입니다.

## 주요 기능

### 1. 로그인 시스템
- MD별 개별 로그인
- JWT 기반 인증
- 본인 담당 업체만 조회 가능

### 2. 대시보드
- 담당 업체 현황 한눈에 확인
- 전체 업체 수, 정상 운영, 이탈 우려, 월 총매출 통계
- 빠른 폼 접수 바로가기

### 3. 업체 관리
- 담당 업체 목록 조회
- 업체 정보 수정 (PATCH)
- 검색 및 필터링

### 4. 폼 접수 (4종)
- **라이브(입점) 완료폼**: 신규 입점 완료 업체 등록
- **CS 접수폼**: 고객 서비스 문의 등록
- **인바운드 결과폼**: 신규 인입 업체 미팅 결과 등록
- **이탈/해지 우려폼**: 이탈 위험 업체 등록 및 관리

## 기술 스택

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Airtable API
- **Authentication**: JWT
- **Deployment**: Vercel

## 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env.local` 파일을 생성하고 다음 내용을 입력하세요:

```env
AIRTABLE_API_KEY=your_airtable_api_key
AIRTABLE_BASE_ID=your_airtable_base_id
JWT_SECRET=your_jwt_secret_key_minimum_32_characters
```

### 3. 개발 서버 실행
```bash
npm run dev
```

### 4. 프로덕션 빌드
```bash
npm run build
npm start
```

## Vercel 배포

### 1. Vercel CLI 설치
```bash
npm i -g vercel
```

### 2. 배포
```bash
vercel
```

### 3. 환경 변수 설정
Vercel 대시보드에서 다음 환경 변수를 설정하세요:
- `AIRTABLE_API_KEY`
- `AIRTABLE_BASE_ID`
- `JWT_SECRET`

## 에어테이블 테이블 구조

### MD 테이블
| 필드명 | 타입 | 설명 |
|--------|------|------|
| email | Email | 로그인 이메일 |
| password | Single line text | 비밀번호 |
| name / 이름 | Single line text | MD 이름 |
| role | Single line text | 권한 |

### 업체 테이블
| 필드명 | 타입 | 설명 |
|--------|------|------|
| 업체명 | Single line text | 업체명 |
| 상태 | Single select | 정상운영/이탈우려 |
| 담당MD | Link / Single line text | 담당 MD |
| 담당MD_ID | Single line text | MD 레코드 ID |
| 연락처 | Phone number | 업체 연락처 |
| 입점일 | Date | 입점 날짜 |
| 월매출 | Number | 월 매출액 |
| 계약상태 | Single select | 정상/주의 |

### 라이브완료 테이블
| 필드명 | 타입 | 설명 |
|--------|------|------|
| 업체명 | Single line text | 업체명 |
| 입점완료일 | Date | 입점 완료 날짜 |
| 담당MD | Single line text | 담당 MD |
| 라이브URL | URL | 라이브 페이지 URL |
| 특이사항 | Long text | 특이사항 |

### CS접수 테이블
| 필드명 | 타입 | 설명 |
|--------|------|------|
| 업체명 | Single line text | 업체명 |
| 접수일 | Date | 접수 날짜 |
| CS유형 | Single select | CS 유형 |
| 담당MD | Single line text | 담당 MD |
| 고객명 | Single line text | 고객명 |
| 연락처 | Phone number | 연락처 |
| 내용 | Long text | 문의 내용 |
| 처리상태 | Single select | 접수완료/처리중/완료 |

### 인바운드결과 테이블
| 필드명 | 타입 | 설명 |
|--------|------|------|
| 업체명 | Single line text | 업체명 |
| 인입일자 | Date | 인입 날짜 |
| 인입경로 | Single select | 인입 경로 |
| 담당MD | Single line text | 담당 MD |
| 대표자명 | Single line text | 대표자명 |
| 연락처 | Phone number | 연락처 |
| 지역 | Single line text | 지역 |
| 미팅결과 | Single select | 미팅 결과 |
| 예상입점일 | Date | 예상 입점 날짜 |

### 이탈해지우려 테이블
| 필드명 | 타입 | 설명 |
|--------|------|------|
| 업체명 | Single line text | 업체명 |
| 접수일 | Date | 접수 날짜 |
| 담당MD | Single line text | 담당 MD |
| 이탈사유 | Single select | 이탈 사유 |
| 상세내용 | Long text | 상세 내용 |
| 현재상태 | Single select | 현재 상태 |
| 대응방안 | Long text | 대응 방안 |

## 테스트 계정

개발 환경에서 테스트용 계정:
- 이메일: `demo@test.com`
- 비밀번호: `demo1234`

## 라이선스

Private - 내부용
