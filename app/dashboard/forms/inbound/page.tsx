'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'

interface FormRecord {
  id: string
  fields: {
    캠핑장명?: string
    지역?: string
    대표자명?: string
    연락처?: string
    인입경로?: string
    MD이름?: string
    '영업 결과 (from MD 인바운드 결과 DB)'?: string[]
    '캠지기 인입시간'?: string
    'MD 입력 시간 (from MD 인바운드 결과 DB)'?: string[]
    [key: string]: any
  }
}

// 영업 결과 상태값
const STATUS_VALUES = ['대기중', '검토중', '입점예정', '입점완료', '거절'] as const
type StatusType = typeof STATUS_VALUES[number]

// 에어테이블 폼 URL
const AIRTABLE_FORM_URL = 'https://airtable.com/appOpUJvUVEMcGUxq/pagjSZlXG3vuxgas2'

export default function InboundFormPage() {
  const [records, setRecords] = useState<FormRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/forms/inbound', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (res.ok) {
        const data = await res.json()
        setRecords(data.records || [])
      }
    } catch (error) {
      console.error('Error fetching records:', error)
    } finally {
      setLoading(false)
    }
  }

  // 배열에서 최신 값(마지막 값) 가져오기
  const getLatestValue = (value: string | string[] | undefined): string => {
    if (!value) return '-'
    if (Array.isArray(value)) {
      // 배열의 마지막 값 (최신 값)
      return value.length > 0 ? value[value.length - 1] : '-'
    }
    return value
  }

  // 상태별 배지 스타일
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      '대기중': 'bg-slate-100 text-slate-700',
      '검토중': 'bg-blue-100 text-blue-700',
      '입점예정': 'bg-amber-100 text-amber-700',
      '입점완료': 'bg-green-100 text-green-700',
      '거절': 'bg-red-100 text-red-700',
    }
    return styles[status] || 'bg-slate-100 text-slate-700'
  }

  // 날짜/시간 포맷팅
  const formatDateTime = (dateStr: string | undefined) => {
    if (!dateStr) return '-'
    try {
      const date = new Date(dateStr)
      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateStr
    }
  }

  // 에어테이블 폼 새 창으로 열기
  const openAirtableForm = () => {
    window.open(AIRTABLE_FORM_URL, '_blank')
  }

  // 통계 계산
  const getStats = () => {
    const statusCounts: Record<string, number> = {
      '대기중': 0,
      '검토중': 0,
      '입점예정': 0,
      '입점완료': 0,
      '거절': 0,
    }

    records.forEach(record => {
      const status = getLatestValue(record.fields['영업 결과 (from MD 인바운드 결과 DB)'])
      if (status in statusCounts) {
        statusCounts[status]++
      } else if (status !== '-') {
        // 매핑되지 않은 상태는 대기중으로
        statusCounts['대기중']++
      }
    })

    const total = records.length
    const completed = statusCounts['입점완료']
    const inProgress = statusCounts['검토중'] + statusCounts['입점예정']
    const rejected = statusCounts['거절']
    const waiting = statusCounts['대기중']

    // 성사율 계산 (입점완료 / (입점완료 + 거절) * 100)
    const closedDeals = completed + rejected
    const successRate = closedDeals > 0 ? ((completed / closedDeals) * 100).toFixed(1) : '0.0'

    // 진행율 계산 (입점완료 + 입점예정 / 전체)
    const progressRate = total > 0 ? (((completed + statusCounts['입점예정']) / total) * 100).toFixed(1) : '0.0'

    return {
      total,
      statusCounts,
      completed,
      inProgress,
      rejected,
      waiting,
      successRate,
      progressRate
    }
  }

  const stats = getStats()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">인바운드 결과</h1>
            <p className="text-slate-500 mt-1">인바운드 캠핑장 영업 현황을 확인하세요</p>
          </div>
          <button
            onClick={openAirtableForm}
            className="btn-primary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            새 인바운드 등록
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
        </div>

        {/* 분석 대시보드 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 전체 */}
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">전체 인바운드</p>
                <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          {/* 성사율 */}
          <div className="glass-card rounded-xl p-5 bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 mb-1">성사율</p>
                <p className="text-3xl font-bold text-green-700">{stats.successRate}%</p>
                <p className="text-xs text-green-500 mt-1">입점완료 / (완료+거절)</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* 진행율 */}
          <div className="glass-card rounded-xl p-5 bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 mb-1">진행율</p>
                <p className="text-3xl font-bold text-blue-700">{stats.progressRate}%</p>
                <p className="text-xs text-blue-500 mt-1">(입점완료+예정) / 전체</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>

          {/* 입점완료 */}
          <div className="glass-card rounded-xl p-5 bg-gradient-to-br from-emerald-50 to-teal-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600 mb-1">입점완료</p>
                <p className="text-3xl font-bold text-emerald-700">{stats.completed}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* 상태별 현황 */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">상태별 현황</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {STATUS_VALUES.map(status => (
              <div key={status} className="text-center p-4 rounded-xl bg-slate-50">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(status)}`}>
                  {status}
                </span>
                <p className="text-2xl font-bold text-slate-800 mt-2">
                  {stats.statusCounts[status]}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {stats.total > 0 ? ((stats.statusCounts[status] / stats.total) * 100).toFixed(0) : 0}%
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Info Card */}
        <div className="glass-card rounded-xl p-4 bg-blue-50 border border-blue-200">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-800">새 인바운드 등록 안내</p>
              <p className="text-sm text-blue-600 mt-1">
                "새 인바운드 등록" 버튼을 클릭하면 에어테이블 폼이 새 창에서 열립니다. 
                폼 작성 후 "새로고침" 버튼을 눌러주세요.
              </p>
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">인바운드 캠핑장 내역</h2>
            <button 
              onClick={fetchRecords}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              새로고침
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="px-4 py-4 text-left">캠핑장명</th>
                  <th className="px-4 py-4 text-left">지역</th>
                  <th className="px-4 py-4 text-left">대표자명</th>
                  <th className="px-4 py-4 text-left">연락처</th>
                  <th className="px-4 py-4 text-left">인입경로</th>
                  <th className="px-4 py-4 text-center">영업 결과</th>
                  <th className="px-4 py-4 text-left">캠지기 인입시간</th>
                  <th className="px-4 py-4 text-left">MD 입력 시간</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        데이터를 불러오는 중...
                      </div>
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                      등록된 인바운드 내역이 없습니다
                    </td>
                  </tr>
                ) : (
                  records.map((record) => {
                    const latestStatus = getLatestValue(record.fields['영업 결과 (from MD 인바운드 결과 DB)'])
                    const latestMDTime = getLatestValue(record.fields['MD 입력 시간 (from MD 인바운드 결과 DB)'])
                    
                    return (
                      <tr key={record.id} className="table-row">
                        <td className="px-4 py-4 font-medium text-slate-800">
                          {record.fields.캠핑장명 || '-'}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {record.fields.지역 || '-'}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {record.fields.대표자명 || '-'}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {record.fields.연락처 || '-'}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {record.fields.인입경로 || '-'}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {latestStatus !== '-' ? (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(latestStatus)}`}>
                              {latestStatus}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="px-4 py-4 text-slate-600 text-sm">
                          {formatDateTime(record.fields['캠지기 인입시간'])}
                        </td>
                        <td className="px-4 py-4 text-slate-600 text-sm">
                          {formatDateTime(latestMDTime)}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
