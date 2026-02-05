'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'

interface FormRecord {
  id: string
  fields: {
    업체명: string
    인입일자: string
    인입경로: string
    담당MD: string
    대표자명?: string
    연락처?: string
    지역?: string
    미팅결과: string
    예상입점일?: string
  }
}

const inboundSources = ['홈페이지', '제휴문의', '전화문의', '소개', '이벤트', '기타']
const meetingResults = ['미팅예정', '미팅완료', '계약진행중', '계약완료', '보류', '거절']

export default function InboundFormPage() {
  const [records, setRecords] = useState<FormRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    업체명: '',
    인입일자: new Date().toISOString().split('T')[0],
    인입경로: '',
    대표자명: '',
    연락처: '',
    지역: '',
    미팅결과: '',
    예상입점일: ''
  })

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/forms/inbound', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (res.ok) {
        alert(data.message)
        setShowForm(false)
        setFormData({
          업체명: '',
          인입일자: new Date().toISOString().split('T')[0],
          인입경로: '',
          대표자명: '',
          연락처: '',
          지역: '',
          미팅결과: '',
          예상입점일: ''
        })
        fetchRecords()
      } else {
        alert(data.message || '제출에 실패했습니다.')
      }
    } catch (error) {
      alert('제출 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const getResultBadge = (result: string) => {
    const styles: Record<string, string> = {
      '미팅예정': 'bg-blue-100 text-blue-700',
      '미팅완료': 'bg-indigo-100 text-indigo-700',
      '계약진행중': 'bg-amber-100 text-amber-700',
      '계약완료': 'bg-green-100 text-green-700',
      '보류': 'bg-slate-100 text-slate-700',
      '거절': 'bg-red-100 text-red-700'
    }
    return styles[result] || 'bg-slate-100 text-slate-700'
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">인바운드 결과</h1>
            <p className="text-slate-500 mt-1">신규 인입 업체 미팅 결과를 등록하세요</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            새 인바운드 등록
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="glass-card rounded-2xl p-6 animate-fade-in">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">인바운드 결과 등록</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="form-label">업체명 *</label>
                  <input
                    type="text"
                    required
                    value={formData.업체명}
                    onChange={(e) => setFormData({ ...formData, 업체명: e.target.value })}
                    className="input-field"
                    placeholder="업체명을 입력하세요"
                  />
                </div>
                <div>
                  <label className="form-label">인입일자 *</label>
                  <input
                    type="date"
                    required
                    value={formData.인입일자}
                    onChange={(e) => setFormData({ ...formData, 인입일자: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="form-label">인입경로 *</label>
                  <select
                    required
                    value={formData.인입경로}
                    onChange={(e) => setFormData({ ...formData, 인입경로: e.target.value })}
                    className="input-field"
                  >
                    <option value="">경로를 선택하세요</option>
                    {inboundSources.map(source => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">대표자명</label>
                  <input
                    type="text"
                    value={formData.대표자명}
                    onChange={(e) => setFormData({ ...formData, 대표자명: e.target.value })}
                    className="input-field"
                    placeholder="대표자명을 입력하세요"
                  />
                </div>
                <div>
                  <label className="form-label">연락처</label>
                  <input
                    type="tel"
                    value={formData.연락처}
                    onChange={(e) => setFormData({ ...formData, 연락처: e.target.value })}
                    className="input-field"
                    placeholder="010-0000-0000"
                  />
                </div>
                <div>
                  <label className="form-label">지역</label>
                  <input
                    type="text"
                    value={formData.지역}
                    onChange={(e) => setFormData({ ...formData, 지역: e.target.value })}
                    className="input-field"
                    placeholder="지역을 입력하세요"
                  />
                </div>
                <div>
                  <label className="form-label">미팅결과 *</label>
                  <select
                    required
                    value={formData.미팅결과}
                    onChange={(e) => setFormData({ ...formData, 미팅결과: e.target.value })}
                    className="input-field"
                  >
                    <option value="">결과를 선택하세요</option>
                    {meetingResults.map(result => (
                      <option key={result} value={result}>{result}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">예상입점일</label>
                  <input
                    type="date"
                    value={formData.예상입점일}
                    onChange={(e) => setFormData({ ...formData, 예상입점일: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? '제출 중...' : '등록하기'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Records Table */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800">인바운드 내역</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="px-6 py-4 text-left">업체명</th>
                  <th className="px-6 py-4 text-left">인입일자</th>
                  <th className="px-6 py-4 text-left">인입경로</th>
                  <th className="px-6 py-4 text-left">대표자</th>
                  <th className="px-6 py-4 text-left">지역</th>
                  <th className="px-6 py-4 text-center">미팅결과</th>
                  <th className="px-6 py-4 text-left">예상입점일</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      데이터를 불러오는 중...
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      등록된 인바운드 내역이 없습니다
                    </td>
                  </tr>
                ) : (
                  records.map((record) => (
                    <tr key={record.id} className="table-row">
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {record.fields.업체명}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {record.fields.인입일자}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {record.fields.인입경로}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {record.fields.대표자명 || '-'}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {record.fields.지역 || '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getResultBadge(record.fields.미팅결과)}`}>
                          {record.fields.미팅결과}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {record.fields.예상입점일 || '-'}
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
