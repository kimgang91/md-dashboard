const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID

const BASE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`

const headers = {
  'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
  'Content-Type': 'application/json',
}

export interface AirtableRecord {
  id: string
  fields: Record<string, any>
  createdTime: string
}

export interface AirtableResponse {
  records: AirtableRecord[]
  offset?: string
}

// 테이블에서 레코드 조회
export async function getRecords(
  tableName: string,
  options?: {
    filterByFormula?: string
    maxRecords?: number
    view?: string
    sort?: { field: string; direction: 'asc' | 'desc' }[]
  }
): Promise<AirtableRecord[]> {
  const params = new URLSearchParams()
  
  if (options?.filterByFormula) {
    params.append('filterByFormula', options.filterByFormula)
  }
  if (options?.maxRecords) {
    params.append('maxRecords', options.maxRecords.toString())
  }
  if (options?.view) {
    params.append('view', options.view)
  }
  if (options?.sort) {
    options.sort.forEach((s, i) => {
      params.append(`sort[${i}][field]`, s.field)
      params.append(`sort[${i}][direction]`, s.direction)
    })
  }

  const url = `${BASE_URL}/${encodeURIComponent(tableName)}?${params.toString()}`
  
  const response = await fetch(url, { headers })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Airtable API 오류')
  }

  const data: AirtableResponse = await response.json()
  return data.records
}

// 특정 레코드 조회
export async function getRecord(
  tableName: string,
  recordId: string
): Promise<AirtableRecord> {
  const url = `${BASE_URL}/${encodeURIComponent(tableName)}/${recordId}`
  
  const response = await fetch(url, { headers })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Airtable API 오류')
  }

  return response.json()
}

// 레코드 생성
export async function createRecord(
  tableName: string,
  fields: Record<string, any>
): Promise<AirtableRecord> {
  const url = `${BASE_URL}/${encodeURIComponent(tableName)}`
  
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ fields }),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Airtable API 오류')
  }

  return response.json()
}

// 레코드 수정 (PATCH)
export async function updateRecord(
  tableName: string,
  recordId: string,
  fields: Record<string, any>
): Promise<AirtableRecord> {
  const url = `${BASE_URL}/${encodeURIComponent(tableName)}/${recordId}`
  
  const response = await fetch(url, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ fields }),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Airtable API 오류')
  }

  return response.json()
}

// 여러 레코드 일괄 수정
export async function updateRecords(
  tableName: string,
  records: { id: string; fields: Record<string, any> }[]
): Promise<AirtableRecord[]> {
  const url = `${BASE_URL}/${encodeURIComponent(tableName)}`
  
  const response = await fetch(url, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ records }),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Airtable API 오류')
  }

  const data: AirtableResponse = await response.json()
  return data.records
}

// 레코드 삭제
export async function deleteRecord(
  tableName: string,
  recordId: string
): Promise<{ id: string; deleted: boolean }> {
  const url = `${BASE_URL}/${encodeURIComponent(tableName)}/${recordId}`
  
  const response = await fetch(url, {
    method: 'DELETE',
    headers,
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Airtable API 오류')
  }

  return response.json()
}
