'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'

interface Company {
  id: string
  fields: {
    업체명: string
    상태: string
    월매출?: number
    계약상태?: string
  }
}

interface Stats {
  totalCompanies: number
  activeCompanies: number
  atRiskCompanies: number
  totalRevenue: number
}

export default function DashboardPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [stats, setStats] = useState<Stats>({
    totalCompanies: 0,
    activeCompanies: 0,
    atRiskCompanies: 0,
    totalRevenue: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/companies', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (res.ok) {
        const data = await res.json()
        setCompanies(data.records || [])
        
        // 통계 계산
        const records = data.records || []
        setStats({
          totalCompanies: records.length,
          activeCompanies: records.filter((c: Company) => 
            c.fields.상태 === '정상운영' || c.fields.계약상태 === '정상'
          ).length,
          atRiskCompanies: records.filter((c: Company) => 
            c.fields.상태 === '이탈우려' || c.fields.계약상태 === '주의'
          ).length,
          totalRevenue: records.reduce((sum: number, c: Company) => 
            sum + (c.fields.월매출 || 0), 0
          )
        })
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-slate-800">대시보드</h1>
          <p className="text-slate-500 mt-1">담당 업체 현황을 한눈에 확인하세요</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="stat-card animate-fade-in animate-delay-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">전체 업체</p>
                <p className="text-3xl font-bold text-slate-800">
                  {loading ? '-' : stats.totalCompanies}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="stat-card animate-fade-in animate-delay-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">정상 운영</p>
                <p className="text-3xl font-bold text-green-600">
                  {loading ? '-' : stats.activeCompanies}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="stat-card animate-fade-in animate-delay-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">이탈 우려</p>
                <p className="text-3xl font-bold text-amber-600">
                  {loading ? '-' : stats.atRiskCompanies}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="stat-card animate-fade-in animate-delay-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">월 총매출</p>
                <p className="text-2xl font-bold text-slate-800">
                  {loading ? '-' : formatCurrency(stats.totalRevenue)}
                </p>
              </div>
              <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Companies Table */}
        <div className="glass-card rounded-2xl overflow-hidden animate-fade-in">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800">담당 업체 현황</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="px-6 py-4 text-left">업체명</th>
                  <th className="px-6 py-4 text-left">상태</th>
                  <th className="px-6 py-4 text-left">계약상태</th>
                  <th className="px-6 py-4 text-right">월매출</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                      데이터를 불러오는 중...
                    </td>
                  </tr>
                ) : companies.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                      담당 업체가 없습니다
                    </td>
                  </tr>
                ) : (
                  companies.map((company) => (
                    <tr key={company.id} className="table-row">
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {company.fields.업체명}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          company.fields.상태 === '정상운영' 
                            ? 'bg-green-100 text-green-700'
                            : company.fields.상태 === '이탈우려'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {company.fields.상태 || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          company.fields.계약상태 === '정상' 
                            ? 'bg-primary-100 text-primary-700'
                            : company.fields.계약상태 === '주의'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {company.fields.계약상태 || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-800">
                        {company.fields.월매출 
                          ? formatCurrency(company.fields.월매출)
                          : '-'
                        }
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card rounded-2xl p-6 animate-fade-in">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">빠른 폼 접수</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <a href="/dashboard/forms/live-complete" className="flex items-center gap-3 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors group">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-slate-800">라이브 완료</p>
                <p className="text-xs text-slate-500">입점 완료 등록</p>
              </div>
            </a>

            <a href="/dashboard/forms/cs" className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors group">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-slate-800">CS 접수</p>
                <p className="text-xs text-slate-500">고객 서비스 등록</p>
              </div>
            </a>

            <a href="/dashboard/forms/inbound" className="flex items-center gap-3 p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors group">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-slate-800">인바운드 결과</p>
                <p className="text-xs text-slate-500">미팅 결과 등록</p>
              </div>
            </a>

            <a href="/dashboard/forms/churn-risk" className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors group">
              <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-slate-800">이탈/해지 우려</p>
                <p className="text-xs text-slate-500">리스크 업체 등록</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
