'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'

interface FormRecord {
  id: string
  fields: {
    접수일자?: string
    '캠핑장 이름'?: string
    등급?: string
    유형?: string
    MD이름?: string
    입점유형?: string
    가입플랜?: string
    '수수료(%, vat포함)'?: string
    경로?: string
    비고?: string
    'MD 성과급'?: number
    '관리자 성과급'?: number
    '관리자 비고'?: string
    [key: string]: any
  }
}

type TabType = '내역' | '분석' | '성과급'
type PeriodType = '일간' | '주간' | '월간'

export default function LiveCompletePage() {
  const [records, setRecords] = useState<FormRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('내역')
  const [period, setPeriod] = useState<PeriodType>('월간')
  const [userRole, setUserRole] = useState<string>('md')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Record<string, any>>({})
  const [filterMD, setFilterMD] = useState<string>('all')

  useEffect(() => {
    fetchRecords()
    // 사용자 역할 확인
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      setUserRole(user.role || 'md')
    }
  }, [])

  const fetchRecords = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/forms/live-complete', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (res.ok) {
        const data = await res.json()
        setRecords(data.records || [])
        if (data.userRole) setUserRole(data.userRole)
      }
    } catch (error) {
      console.error('Error fetching records:', error)
    } finally {
      setLoading(false)
    }
  }

  // 성과급 저장
  const saveBonus = async (recordId: string) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/forms/live-complete', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ recordId, fields: editValues })
      })

      if (res.ok) {
        alert('저장되었습니다.')
        setEditingId(null)
        setEditValues({})
        fetchRecords()
      } else {
        alert('저장에 실패했습니다.')
      }
    } catch (error) {
      alert('저장 중 오류가 발생했습니다.')
    }
  }

  // 날짜 필터링
  const getFilteredRecordsByPeriod = () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    return records.filter(record => {
      if (!record.fields.접수일자) return false
      const recordDate = new Date(record.fields.접수일자)
      
      // MD 필터
      if (filterMD !== 'all' && record.fields.MD이름 !== filterMD) return false
      
      if (period === '일간') {
        return recordDate >= today
      } else if (period === '주간') {
        const weekAgo = new Date(today)
        weekAgo.setDate(weekAgo.getDate() - 7)
        return recordDate >= weekAgo
      } else {
        const monthAgo = new Date(today)
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        return recordDate >= monthAgo
      }
    })
  }

  // 분석 데이터 계산
  const getAnalytics = () => {
    const filtered = getFilteredRecordsByPeriod()
    
    const byType: Record<string, number> = {}
    const byEntryType: Record<string, number> = {}
    const byPlan: Record<string, number> = {}
    const byRoute: Record<string, number> = {}

    filtered.forEach(record => {
      const type = record.fields.유형 || '미분류'
      const entryType = record.fields.입점유형 || '미분류'
      const plan = record.fields.가입플랜 || '미분류'
      const route = record.fields.경로 || '미분류'

      byType[type] = (byType[type] || 0) + 1
      byEntryType[entryType] = (byEntryType[entryType] || 0) + 1
      byPlan[plan] = (byPlan[plan] || 0) + 1
      byRoute[route] = (byRoute[route] || 0) + 1
    })

    return { byType, byEntryType, byPlan, byRoute, total: filtered.length }
  }

  // 성과급 계산 (익익월 5일 지급)
  const getBonusSchedule = () => {
    const bonusByMonth: Record<string, { records: FormRecord[], totalMD: number, totalAdmin: number, paymentDate: string }> = {}

    records.forEach(record => {
      if (!record.fields.접수일자) return
      
      const recordDate = new Date(record.fields.접수일자)
      // 익익월 계산 (2개월 후)
      const paymentDate = new Date(recordDate)
      paymentDate.setMonth(paymentDate.getMonth() + 2)
      paymentDate.setDate(5) // 5일 지급
      
      const paymentKey = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`
      const paymentDateStr = `${paymentDate.getFullYear()}.${paymentDate.getMonth() + 1}.5`

      if (!bonusByMonth[paymentKey]) {
        bonusByMonth[paymentKey] = { records: [], totalMD: 0, totalAdmin: 0, paymentDate: paymentDateStr }
      }

      bonusByMonth[paymentKey].records.push(record)
      bonusByMonth[paymentKey].totalMD += record.fields['MD 성과급'] || 0
      bonusByMonth[paymentKey].totalAdmin += record.fields['관리자 성과급'] || 0
    })

    return bonusByMonth
  }

  // MD 목록 (관리자용 필터)
  const getMDList = () => {
    const mdSet = new Set<string>()
    records.forEach(record => {
      if (record.fields.MD이름) mdSet.add(record.fields.MD이름)
    })
    return Array.from(mdSet).sort()
  }

  const analytics = getAnalytics()
  const bonusSchedule = getBonusSchedule()
  const filteredRecords = filterMD === 'all' ? records : records.filter(r => r.fields.MD이름 === filterMD)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원'
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">라이브(입점) 완료</h1>
            <p className="text-slate-500 mt-1">입점 완료 현황 및 성과급 관리</p>
          </div>
          <div className="flex items-center gap-2">
            {userRole === 'admin' && (
              <select
                value={filterMD}
                onChange={(e) => setFilterMD(e.target.value)}
                className="input-field py-2 text-sm"
              >
                <option value="all">전체 MD</option>
                {getMDList().map(md => (
                  <option key={md} value={md}>{md}</option>
                ))}
              </select>
            )}
            <button
              onClick={fetchRecords}
              className="btn-secondary flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              새로고침
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="glass-card rounded-xl p-1 inline-flex">
          {(['내역', '분석', '성과급'] as TabType[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 내역 탭 */}
        {activeTab === '내역' && (
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800">입점 완료 내역</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="table-header">
                    <th className="px-3 py-3 text-left">접수일자</th>
                    <th className="px-3 py-3 text-left">캠핑장 이름</th>
                    <th className="px-3 py-3 text-center">등급</th>
                    <th className="px-3 py-3 text-center">유형</th>
                    {userRole === 'admin' && <th className="px-3 py-3 text-left">MD이름</th>}
                    <th className="px-3 py-3 text-center">입점유형</th>
                    <th className="px-3 py-3 text-center">가입플랜</th>
                    <th className="px-3 py-3 text-center">수수료</th>
                    <th className="px-3 py-3 text-center">경로</th>
                    <th className="px-3 py-3 text-right">MD 성과급</th>
                    {userRole === 'admin' && (
                      <>
                        <th className="px-3 py-3 text-right">관리자 성과급</th>
                        <th className="px-3 py-3 text-left">관리자 비고</th>
                      </>
                    )}
                    <th className="px-3 py-3 text-center">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={userRole === 'admin' ? 13 : 10} className="px-6 py-12 text-center text-slate-400">
                        데이터를 불러오는 중...
                      </td>
                    </tr>
                  ) : filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={userRole === 'admin' ? 13 : 10} className="px-6 py-12 text-center text-slate-400">
                        등록된 내역이 없습니다
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record) => (
                      <tr key={record.id} className="table-row">
                        <td className="px-3 py-3 text-slate-600">{record.fields.접수일자 || '-'}</td>
                        <td className="px-3 py-3 font-medium text-slate-800">{record.fields['캠핑장 이름'] || '-'}</td>
                        <td className="px-3 py-3 text-center">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs">
                            {record.fields.등급 || '-'}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center text-slate-600">{record.fields.유형 || '-'}</td>
                        {userRole === 'admin' && (
                          <td className="px-3 py-3 text-slate-600">{record.fields.MD이름 || '-'}</td>
                        )}
                        <td className="px-3 py-3 text-center">
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs">
                            {record.fields.입점유형 || '-'}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs">
                            {record.fields.가입플랜 || '-'}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center text-slate-600">{record.fields['수수료(%, vat포함)'] || '-'}</td>
                        <td className="px-3 py-3 text-center text-slate-600">{record.fields.경로 || '-'}</td>
                        <td className="px-3 py-3 text-right">
                          {editingId === record.id ? (
                            <input
                              type="number"
                              value={editValues['MD 성과급'] ?? record.fields['MD 성과급'] ?? ''}
                              onChange={(e) => setEditValues({ ...editValues, 'MD 성과급': Number(e.target.value) })}
                              className="input-field py-1 px-2 w-24 text-right text-sm"
                            />
                          ) : (
                            <span className="font-medium text-slate-800">
                              {record.fields['MD 성과급'] ? formatCurrency(record.fields['MD 성과급']) : '-'}
                            </span>
                          )}
                        </td>
                        {userRole === 'admin' && (
                          <>
                            <td className="px-3 py-3 text-right">
                              {editingId === record.id ? (
                                <input
                                  type="number"
                                  value={editValues['관리자 성과급'] ?? record.fields['관리자 성과급'] ?? ''}
                                  onChange={(e) => setEditValues({ ...editValues, '관리자 성과급': Number(e.target.value) })}
                                  className="input-field py-1 px-2 w-24 text-right text-sm"
                                />
                              ) : (
                                <span className="font-medium text-primary-600">
                                  {record.fields['관리자 성과급'] ? formatCurrency(record.fields['관리자 성과급']) : '-'}
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-3">
                              {editingId === record.id ? (
                                <input
                                  type="text"
                                  value={editValues['관리자 비고'] ?? record.fields['관리자 비고'] ?? ''}
                                  onChange={(e) => setEditValues({ ...editValues, '관리자 비고': e.target.value })}
                                  className="input-field py-1 px-2 w-32 text-sm"
                                  placeholder="비고 입력"
                                />
                              ) : (
                                <span className="text-slate-500 text-xs">{record.fields['관리자 비고'] || '-'}</span>
                              )}
                            </td>
                          </>
                        )}
                        <td className="px-3 py-3 text-center">
                          {editingId === record.id ? (
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => saveBonus(record.id)}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              <button
                                onClick={() => { setEditingId(null); setEditValues({}) }}
                                className="p-1 text-slate-400 hover:bg-slate-50 rounded"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setEditingId(record.id); setEditValues({}) }}
                              className="p-1 text-primary-600 hover:bg-primary-50 rounded"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 분석 탭 */}
        {activeTab === '분석' && (
          <div className="space-y-6">
            {/* 기간 선택 */}
            <div className="glass-card rounded-xl p-4 flex items-center gap-4">
              <span className="text-sm font-medium text-slate-600">기간:</span>
              <div className="inline-flex rounded-lg bg-slate-100 p-1">
                {(['일간', '주간', '월간'] as PeriodType[]).map(p => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                      period === p ? 'bg-white shadow text-primary-600' : 'text-slate-600'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <span className="text-sm text-slate-500">
                총 <strong className="text-primary-600">{analytics.total}</strong>건
              </span>
            </div>

            {/* 분석 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 유형별 */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">유형별 현황</h3>
                <div className="space-y-3">
                  {Object.entries(analytics.byType).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-slate-600">{key}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${(value / analytics.total) * 100}%` }}
                          />
                        </div>
                        <span className="font-medium text-slate-800 w-8 text-right">{value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 입점유형별 */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">입점유형별 현황</h3>
                <div className="space-y-3">
                  {Object.entries(analytics.byEntryType).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-slate-600">{key}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${(value / analytics.total) * 100}%` }}
                          />
                        </div>
                        <span className="font-medium text-slate-800 w-8 text-right">{value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 가입플랜별 */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">가입플랜별 현황</h3>
                <div className="space-y-3">
                  {Object.entries(analytics.byPlan).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-slate-600">{key}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${(value / analytics.total) * 100}%` }}
                          />
                        </div>
                        <span className="font-medium text-slate-800 w-8 text-right">{value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 경로별 */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">경로별 현황</h3>
                <div className="space-y-3">
                  {Object.entries(analytics.byRoute).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-slate-600">{key}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${(value / analytics.total) * 100}%` }}
                          />
                        </div>
                        <span className="font-medium text-slate-800 w-8 text-right">{value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 성과급 탭 */}
        {activeTab === '성과급' && (
          <div className="space-y-6">
            <div className="glass-card rounded-xl p-4 bg-amber-50 border border-amber-200">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-amber-800">성과급 지급 안내</p>
                  <p className="text-sm text-amber-600 mt-1">
                    성과급은 접수일자 기준 <strong>익익월 5일</strong>에 지급됩니다.
                    예: 2026.1.6 접수 → 2026.3.5 지급
                  </p>
                </div>
              </div>
            </div>

            {/* 월별 성과급 현황 */}
            <div className="space-y-4">
              {Object.entries(bonusSchedule)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([month, data]) => (
                  <div key={month} className="glass-card rounded-2xl overflow-hidden">
                    <div className="p-4 bg-gradient-to-r from-primary-50 to-accent-50 border-b border-slate-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-800">{data.paymentDate} 지급 예정</h3>
                          <p className="text-sm text-slate-500">{data.records.length}건</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-500">MD 성과급 합계</p>
                          <p className="text-xl font-bold text-primary-600">{formatCurrency(data.totalMD)}</p>
                          {userRole === 'admin' && data.totalAdmin > 0 && (
                            <p className="text-sm text-green-600">관리자 확인: {formatCurrency(data.totalAdmin)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50">
                            <th className="px-4 py-2 text-left text-slate-600">접수일자</th>
                            <th className="px-4 py-2 text-left text-slate-600">캠핑장명</th>
                            {userRole === 'admin' && <th className="px-4 py-2 text-left text-slate-600">MD</th>}
                            <th className="px-4 py-2 text-right text-slate-600">MD 성과급</th>
                            {userRole === 'admin' && <th className="px-4 py-2 text-right text-slate-600">관리자 확인</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {data.records.map(record => (
                            <tr key={record.id} className="border-t border-slate-100">
                              <td className="px-4 py-2 text-slate-600">{record.fields.접수일자}</td>
                              <td className="px-4 py-2 font-medium text-slate-800">{record.fields['캠핑장 이름']}</td>
                              {userRole === 'admin' && <td className="px-4 py-2 text-slate-600">{record.fields.MD이름}</td>}
                              <td className="px-4 py-2 text-right font-medium">
                                {record.fields['MD 성과급'] ? formatCurrency(record.fields['MD 성과급']) : '-'}
                              </td>
                              {userRole === 'admin' && (
                                <td className="px-4 py-2 text-right text-green-600 font-medium">
                                  {record.fields['관리자 성과급'] ? formatCurrency(record.fields['관리자 성과급']) : '-'}
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
