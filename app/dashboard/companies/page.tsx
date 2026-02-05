'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'

interface Company {
  id: string
  fields: {
    업체명: string
    상태: string
    담당MD: string
    연락처?: string
    입점일?: string
    월매출?: number
    계약상태?: string
  }
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/companies', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (res.ok) {
        const data = await res.json()
        setCompanies(data.records || [])
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (company: Company) => {
    setEditingId(company.id)
    setEditData({ ...company.fields })
  }

  const handleSave = async (id: string) => {
    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/companies/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editData)
      })

      if (res.ok) {
        // 로컬 상태 업데이트
        setCompanies(companies.map(c => 
          c.id === id ? { ...c, fields: editData } : c
        ))
        setEditingId(null)
        alert('저장되었습니다.')
      } else {
        alert('저장에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error saving:', error)
      alert('저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditData({})
  }

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.fields.업체명?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || company.fields.상태 === filterStatus
    return matchesSearch && matchesFilter
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">업체 관리</h1>
            <p className="text-slate-500 mt-1">담당 업체 목록을 관리하세요</p>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="업체명 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field w-full sm:w-48"
          >
            <option value="all">전체 상태</option>
            <option value="정상운영">정상운영</option>
            <option value="이탈우려">이탈우려</option>
          </select>
        </div>

        {/* Companies Table */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="px-6 py-4 text-left">업체명</th>
                  <th className="px-6 py-4 text-left">상태</th>
                  <th className="px-6 py-4 text-left">연락처</th>
                  <th className="px-6 py-4 text-left">입점일</th>
                  <th className="px-6 py-4 text-right">월매출</th>
                  <th className="px-6 py-4 text-center">작업</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      데이터를 불러오는 중...
                    </td>
                  </tr>
                ) : filteredCompanies.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      {searchTerm || filterStatus !== 'all' 
                        ? '검색 결과가 없습니다' 
                        : '담당 업체가 없습니다'}
                    </td>
                  </tr>
                ) : (
                  filteredCompanies.map((company) => (
                    <tr key={company.id} className="table-row">
                      <td className="px-6 py-4">
                        {editingId === company.id ? (
                          <input
                            type="text"
                            value={editData.업체명 || ''}
                            onChange={(e) => setEditData({ ...editData, 업체명: e.target.value })}
                            className="input-field py-1 px-2"
                          />
                        ) : (
                          <span className="font-medium text-slate-800">{company.fields.업체명}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingId === company.id ? (
                          <select
                            value={editData.상태 || ''}
                            onChange={(e) => setEditData({ ...editData, 상태: e.target.value })}
                            className="input-field py-1 px-2"
                          >
                            <option value="정상운영">정상운영</option>
                            <option value="이탈우려">이탈우려</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            company.fields.상태 === '정상운영' 
                              ? 'bg-green-100 text-green-700'
                              : company.fields.상태 === '이탈우려'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {company.fields.상태 || '-'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {editingId === company.id ? (
                          <input
                            type="text"
                            value={editData.연락처 || ''}
                            onChange={(e) => setEditData({ ...editData, 연락처: e.target.value })}
                            className="input-field py-1 px-2"
                          />
                        ) : (
                          company.fields.연락처 || '-'
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {company.fields.입점일 || '-'}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-800">
                        {editingId === company.id ? (
                          <input
                            type="number"
                            value={editData.월매출 || ''}
                            onChange={(e) => setEditData({ ...editData, 월매출: Number(e.target.value) })}
                            className="input-field py-1 px-2 text-right w-32"
                          />
                        ) : (
                          company.fields.월매출 
                            ? formatCurrency(company.fields.월매출)
                            : '-'
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {editingId === company.id ? (
                            <>
                              <button
                                onClick={() => handleSave(company.id)}
                                disabled={saving}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              <button
                                onClick={handleCancel}
                                className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleEdit(company)}
                              className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          )}
                        </div>
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
