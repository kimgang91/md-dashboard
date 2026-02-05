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

// 에어테이블 폼 URL - "인바운드 캠핑장 영업 현황 업데이트 하기" 폼
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

  const getResultBadge = (result: string) => {
    const styles: Record<string, string> = {
      '미팅예정': 'bg-blue-100 text-blue-700',
      '미팅완료': 'bg-indigo-100 text-indigo-700',
      '계약진행중': 'bg-amber-100 text-amber-700',
      '계약완료': 'bg-green-100 text-green-700',
      '입점완료': 'bg-green-100 text-green-700',
      '보류': 'bg-slate-100 text-slate-700',
      '거절': 'bg-red-100 text-red-700',
      '컨택중': 'bg-blue-100 text-blue-700',
      '컨택완료': 'bg-indigo-100 text-indigo-700',
      '영업중': 'bg-amber-100 text-amber-700',
      '미진행': 'bg-slate-100 text-slate-700',
    }
    return styles[result] || 'bg-slate-100 text-slate-700'
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

  // 연결된 필드 값 가져오기 (배열일 수 있음)
  const getLinkedValue = (value: string | string[] | undefined) => {
    if (!value) return '-'
    if (Array.isArray(value)) return value[0] || '-'
    return value
  }

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

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card rounded-xl p-4">
            <p className="text-sm text-slate-500">전체 인바운드</p>
            <p className="text-2xl font-bold text-slate-800">{records.length}</p>
          </div>
          <div className="glass-card rounded-xl p-4">
            <p className="text-sm text-slate-500">영업 진행중</p>
            <p className="text-2xl font-bold text-amber-600">
              {records.filter(r => {
                const result = getLinkedValue(r.fields['영업 결과 (from MD 인바운드 결과 DB)'])
                return result === '영업중' || result === '컨택중' || result === '미팅예정'
              }).length}
            </p>
          </div>
          <div className="glass-card rounded-xl p-4">
            <p className="text-sm text-slate-500">입점 완료</p>
            <p className="text-2xl font-bold text-green-600">
              {records.filter(r => {
                const result = getLinkedValue(r.fields['영업 결과 (from MD 인바운드 결과 DB)'])
                return result === '입점완료' || result === '계약완료'
              }).length}
            </p>
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
                  records.map((record) => (
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
                        {getLinkedValue(record.fields['영업 결과 (from MD 인바운드 결과 DB)']) !== '-' ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getResultBadge(getLinkedValue(record.fields['영업 결과 (from MD 인바운드 결과 DB)']))}`}>
                            {getLinkedValue(record.fields['영업 결과 (from MD 인바운드 결과 DB)'])}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-4 text-slate-600 text-sm">
                        {formatDateTime(record.fields['캠지기 인입시간'])}
                      </td>
                      <td className="px-4 py-4 text-slate-600 text-sm">
                        {formatDateTime(getLinkedValue(record.fields['MD 입력 시간 (from MD 인바운드 결과 DB)']))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
