'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'

interface FormRecord {
  id: string
  fields: {
    업체명: string
    접수일: string
    담당MD: string
    이탈사유: string
    상세내용: string
    현재상태: string
    대응방안?: string
  }
}

const churnReasons = ['수수료불만', '매출부진', '서비스불만', '경쟁사이동', '폐업예정', '기타']
const statusOptions = ['접수', '대응중', '모니터링', '해결완료', '이탈확정']

export default function ChurnRiskPage() {
  const [records, setRecords] = useState<FormRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    업체명: '',
    이탈사유: '',
    상세내용: '',
    대응방안: ''
  })

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/forms/churn-risk', {
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
      const res = await fetch('/api/forms/churn-risk', {
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
          이탈사유: '',
          상세내용: '',
          대응방안: ''
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
      '접수': 'bg-blue-100 text-blue-700',
      '대응중': 'bg-amber-100 text-amber-700',
      '모니터링': 'bg-purple-100 text-purple-700',
      '해결완료': 'bg-green-100 text-green-700',
      '이탈확정': 'bg-red-100 text-red-700'
    }
    return styles[status] || 'bg-slate-100 text-slate-700'
  }

  const getReasonBadge = (reason: string) => {
    const styles: Record<string, string> = {
      '수수료불만': 'bg-red-50 text-red-600',
      '매출부진': 'bg-amber-50 text-amber-600',
      '서비스불만': 'bg-orange-50 text-orange-600',
      '경쟁사이동': 'bg-purple-50 text-purple-600',
      '폐업예정': 'bg-slate-100 text-slate-600',
      '기타': 'bg-slate-50 text-slate-600'
    }
    return styles[reason] || 'bg-slate-50 text-slate-600'
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">이탈/해지 우려</h1>
            <p className="text-slate-500 mt-1">이탈 위험 업체를 등록하고 관리하세요</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            새 이탈우려 등록
          </button>
        </div>

        {/* Warning Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card rounded-xl p-4 border-l-4 border-amber-400">
            <p className="text-sm text-slate-500">대응 중</p>
            <p className="text-2xl font-bold text-amber-600">
              {records.filter(r => r.fields.현재상태 === '대응중').length}
            </p>
          </div>
          <div className="glass-card rounded-xl p-4 border-l-4 border-purple-400">
            <p className="text-sm text-slate-500">모니터링</p>
            <p className="text-2xl font-bold text-purple-600">
              {records.filter(r => r.fields.현재상태 === '모니터링').length}
            </p>
          </div>
          <div className="glass-card rounded-xl p-4 border-l-4 border-red-400">
            <p className="text-sm text-slate-500">이탈 확정</p>
            <p className="text-2xl font-bold text-red-600">
              {records.filter(r => r.fields.현재상태 === '이탈확정').length}
            </p>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="glass-card rounded-2xl p-6 animate-fade-in">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">이탈/해지 우려 등록</h2>
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
                  <label className="form-label">이탈사유 *</label>
                  <select
                    required
                    value={formData.이탈사유}
                    onChange={(e) => setFormData({ ...formData, 이탈사유: e.target.value })}
                    className="input-field"
                  >
                    <option value="">사유를 선택하세요</option>
                    {churnReasons.map(reason => (
                      <option key={reason} value={reason}>{reason}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label">상세 내용 *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.상세내용}
                  onChange={(e) => setFormData({ ...formData, 상세내용: e.target.value })}
                  className="input-field resize-none"
                  placeholder="이탈 우려 상황을 상세히 설명해주세요"
                />
              </div>
              <div>
                <label className="form-label">대응 방안</label>
                <textarea
                  rows={3}
                  value={formData.대응방안}
                  onChange={(e) => setFormData({ ...formData, 대응방안: e.target.value })}
                  className="input-field resize-none"
                  placeholder="계획 중인 대응 방안을 입력하세요"
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
                  {submitting ? '제출 중...' : '등록하기'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Records Table */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800">이탈우려 내역</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="px-6 py-4 text-left">업체명</th>
                  <th className="px-6 py-4 text-left">접수일</th>
                  <th className="px-6 py-4 text-center">이탈사유</th>
                  <th className="px-6 py-4 text-left">상세내용</th>
                  <th className="px-6 py-4 text-center">현재상태</th>
                  <th className="px-6 py-4 text-left">대응방안</th>
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
                      등록된 이탈우려 내역이 없습니다
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
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getReasonBadge(record.fields.이탈사유)}`}>
                          {record.fields.이탈사유}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 max-w-xs truncate">
                        {record.fields.상세내용}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(record.fields.현재상태)}`}>
                          {record.fields.현재상태}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 max-w-xs truncate">
                        {record.fields.대응방안 || '-'}
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
