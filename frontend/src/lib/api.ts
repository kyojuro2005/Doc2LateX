import axios from 'axios'
import type { JobStatus, SystemInfo } from '../types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
})

export async function uploadFile(file: File): Promise<{ job_id: number; status: string; message: string }> {
  const form = new FormData()
  form.append('file', file)
  const resp = await api.post('/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return resp.data
}

export async function getJobStatus(jobId: number): Promise<JobStatus> {
  const resp = await api.get<JobStatus>(`/job/${jobId}`)
  return resp.data
}

export async function listJobs(): Promise<JobStatus[]> {
  const resp = await api.get<JobStatus[]>('/jobs')
  return resp.data
}

export async function getTexContent(jobId: number): Promise<string> {
  const resp = await api.get(`/job/${jobId}/tex`, { responseType: 'text' })
  return resp.data
}

export async function getPdfBlob(jobId: number): Promise<Blob> {
  const resp = await api.get(`/job/${jobId}/pdf`, { responseType: 'blob' })
  return resp.data
}

export async function updateTexAndRecompile(jobId: number, tex: string): Promise<JobStatus> {
  const resp = await api.post<JobStatus>(`/job/${jobId}/tex`, { tex })
  return resp.data
}

export async function deleteJob(jobId: number): Promise<{ message: string; job_id: number }> {
  const resp = await api.delete(`/job/${jobId}`)
  return resp.data
}

export async function getSystemInfo(): Promise<SystemInfo> {
  const resp = await api.get<SystemInfo>('/system/info')
  return resp.data
}

export async function downloadFile(jobId: number, type: 'tex' | 'pdf', filename: string): Promise<void> {
  const resp = await api.get(`/job/${jobId}/${type}`, { responseType: 'blob' })
  const mimeType = type === 'tex' ? 'text/x-tex' : 'application/pdf'
  const blob = new Blob([resp.data], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.${type}`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export async function getTexContentInline(jobId: number): Promise<string> {
  const resp = await api.get<{ tex: string }>(`/job/${jobId}/tex/content`)
  return resp.data.tex
}

export default api

