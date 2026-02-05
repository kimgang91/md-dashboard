'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'

interface FormRecord {
  id: string
  fields: {
    업체명: string
    접수일: string
    CS유형: string
    담당MD: string
    고객명?: string
    연락처?: string
    내용: string
    처리상태: string
  }
}

const csTypes = ['결제문의', '예약변경', '취소/환불', '서비스불만', '시스템오류', '기타']

export default function CSFormPage() {
  const [records, setRecords] = useState<FormRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    업체명: '',
    CS유형: '',
    고객명: '',
    연락처: '',
    내용: ''
  })

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/forms/cs', {
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
      const res = await fetch('/api/forms/cs', {
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
          CS유형: '',
          고객명: '',
          연락처: '',
          내용: ''
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

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      '접수완료': 'bg-blue-100 text-blue-700',
      '처리중': 'bg-amber-100 text-amber-700',
      '완료': 'bg-green-100 text-green-700'
    }
    return styles[status] || 'bg-slate-100 text-slate-700'
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">CS 접수</h1>
            <p className="text-slate-500 mt-1">고객 서비스 문의를 등록하세요</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            새 CS 접수
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="glass-card rounded-2xl p-6 animate-fade-in">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">CS 접수 등록</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <label className="form-label">CS 유형 *</label>
                  <select
                    required
                    value={formData.CS유형}
                    onChange={(e) => setFormData({ ...formData, CS유형: e.target.value })}
                    className="input-field"
                  >
                    <option value="">유형을 선택하세요</option>
                    {csTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">고객명</label>
                  <input
                    type="text"
                    value={formData.고객명}
                    onChange={(e) => setFormData({ ...formData, 고객명: e.target.value })}
                    className="input-field"
                    placeholder="고객명을 입력하세요"
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
              </div>
              <div>
                <label className="form-label">문의 내용 *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.내용}
                  onChange={(e) => setFormData({ ...formData, 내용: e.target.value })}
                  className="input-field resize-none"
                  placeholder="문의 내용을 상세히 입력하세요"
                />
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
                  {submitting ? '제출 중...' : '접수하기'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Records Table */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800">CS 접수 내역</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="px-6 py-4 text-left">업체명</th>
                  <th className="px-6 py-4 text-left">접수일</th>
                  <th className="px-6 py-4 text-left">유형</th>
                  <th className="px-6 py-4 text-left">고객명</th>
                  <th className="px-6 py-4 text-left">내용</th>
                  <th className="px-6 py-4 text-center">상태</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      데이터를 불러오는 중...
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      등록된 CS 내역이 없습니다
                    </td>
                  </tr>
                ) : (
                  records.map((record) => (
                    <tr key={record.id} className="table-row">
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {record.fields.업체명}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {record.fields.접수일}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                          {record.fields.CS유형}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {record.fields.고객명 || '-'}
                      </td>
                      <td className="px-6 py-4 text-slate-600 max-w-xs truncate">
                        {record.fields.내용}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(record.fields.처리상태)}`}>
                          {record.fields.처리상태}
                        </span>
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
