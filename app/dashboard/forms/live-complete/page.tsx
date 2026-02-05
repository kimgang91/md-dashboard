'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'

interface FormRecord {
  id: string
  fields: {
    업체명: string
    입점완료일: string
    담당MD: string
    라이브URL?: string
    특이사항?: string
  }
}

export default function LiveCompletePage() {
  const [records, setRecords] = useState<FormRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    업체명: '',
    입점완료일: new Date().toISOString().split('T')[0],
    라이브URL: '',
    특이사항: ''
  })

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/forms/live-complete', {
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
      const res = await fetch('/api/forms/live-complete', {
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
          입점완료일: new Date().toISOString().split('T')[0],
          라이브URL: '',
          특이사항: ''
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">라이브(입점) 완료</h1>
            <p className="text-slate-500 mt-1">신규 입점 완료 업체를 등록하세요</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            새 폼 작성
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="glass-card rounded-2xl p-6 animate-fade-in">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">라이브 완료 등록</h2>
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
                  <label className="form-label">입점완료일 *</label>
                  <input
                    type="date"
                    required
                    value={formData.입점완료일}
                    onChange={(e) => setFormData({ ...formData, 입점완료일: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="form-label">라이브 URL</label>
                  <input
                    type="url"
                    value={formData.라이브URL}
                    onChange={(e) => setFormData({ ...formData, 라이브URL: e.target.value })}
                    className="input-field"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="form-label">특이사항</label>
                  <input
                    type="text"
                    value={formData.특이사항}
                    onChange={(e) => setFormData({ ...formData, 특이사항: e.target.value })}
                    className="input-field"
                    placeholder="특이사항을 입력하세요"
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
                  {submitting ? '제출 중...' : '제출하기'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Records Table */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800">등록 내역</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="px-6 py-4 text-left">업체명</th>
                  <th className="px-6 py-4 text-left">입점완료일</th>
                  <th className="px-6 py-4 text-left">라이브 URL</th>
                  <th className="px-6 py-4 text-left">특이사항</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                      데이터를 불러오는 중...
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                      등록된 내역이 없습니다
                    </td>
                  </tr>
                ) : (
                  records.map((record) => (
                    <tr key={record.id} className="table-row">
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {record.fields.업체명}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {record.fields.입점완료일}
                      </td>
                      <td className="px-6 py-4">
                        {record.fields.라이브URL ? (
                          <a
                            href={record.fields.라이브URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:underline"
                          >
                            링크 열기
                          </a>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {record.fields.특이사항 || '-'}
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
