export interface JobStatus {
  job_id: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  filename: string
  content_type: string
  error?: string | null
  created_at: string
  updated_at: string
}

export type FileType = 'image' | 'pdf' | 'docx' | 'xlsx' | 'unknown'

export function detectFileType(contentType: string, filename: string): FileType {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (contentType.startsWith('image/') || ['png', 'jpg', 'jpeg'].includes(ext || '')) return 'image'
  if (contentType === 'application/pdf' || ext === 'pdf') return 'pdf'
  if (contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || ext === 'docx') return 'docx'
  if (contentType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || ext === 'xlsx') return 'xlsx'
  return 'unknown'
}

export interface SystemInfo {
  gemini_configured?: boolean
  gemini_model?: string
  openai_configured?: boolean
  openai_model?: string
  latex_compiler: string
  max_upload_size_mb: number
}



