import { useNavigate } from 'react-router-dom'
import { FileText, Image, FileSpreadsheet, Clock, Check, AlertTriangle, RefreshCw, Trash2, ArrowRight } from 'lucide-react'
import type { JobStatus, FileType } from '../types'
import { detectFileType } from '../types'

interface ProjectCardProps {
  job: JobStatus
  onDelete?: (jobId: number) => void
}

const typeTags: Record<FileType, { tag: string; icon: React.ReactNode }> = {
  image: { tag: 'IMAGE', icon: <Image size={20} className="text-mustard" /> },
  pdf: { tag: 'PDF', icon: <FileText size={20} className="text-charcoal" /> },
  docx: { tag: 'WORD', icon: <FileText size={20} className="text-charcoal" /> },
  xlsx: { tag: 'EXCEL', icon: <FileSpreadsheet size={20} className="text-sage" /> },
  unknown: { tag: 'DOC', icon: <FileText size={20} className="text-stone-400" /> },
}

export default function ProjectCard({ job, onDelete }: ProjectCardProps) {
  const navigate = useNavigate()
  const fileType = detectFileType(job.content_type, job.filename)
  const tagInfo = typeTags[fileType]

  const formattedDate = new Date(job.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const displayName = job.filename
    .replace(/\.[^.]+$/, '')
    .replace(/_/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase())

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`Supprimer définitivement le projet "${displayName}" ?`)) {
      onDelete?.(job.job_id)
    }
  }

  return (
    <div
      onClick={() => {
        if (job.status === 'completed') {
          navigate(`/editor/${job.job_id}`)
        }
      }}
      className={`group relative flex flex-col justify-between rounded-xl border border-surface-border bg-surface-card p-5 transition-all duration-200 font-sans shadow-sm
        ${
          job.status === 'completed'
            ? 'hover:border-mustard hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
            : 'opacity-85 cursor-default'
        }`}
    >
      {/* Top row: Format badge & Delete button */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {tagInfo.icon}
            <span className="text-[11px] font-mono font-semibold tracking-wider text-stone-500 bg-surface px-2 py-0.5 rounded border border-surface-border">
              {tagInfo.tag}
            </span>
          </div>
          {onDelete && (
            <button
              onClick={handleDelete}
              className="p-1.5 rounded text-stone-400 hover:text-bordeaux hover:bg-bordeaux-light transition-colors opacity-0 group-hover:opacity-100"
              title="Supprimer ce projet"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {/* Project Title */}
        <h3 className="font-serif font-bold text-base text-charcoal tracking-tight truncate group-hover:text-mustard-hover transition-colors mb-1">
          {displayName}
        </h3>
        <p className="text-xs text-stone-500 truncate mb-4">
          {job.filename}
        </p>
      </div>

      {/* Bottom row: Status & Date */}
      <div className="pt-3 border-t border-surface-border/60 flex items-center justify-between text-xs">
        <div>
          {job.status === 'completed' && (
            <span className="inline-flex items-center gap-1 font-medium text-sage">
              <Check size={13} strokeWidth={2.5} /> Compilé .tex + PDF
            </span>
          )}
          {job.status === 'processing' && (
            <span className="inline-flex items-center gap-1 font-medium text-mustard">
              <RefreshCw size={13} className="animate-spin" /> Conversion...
            </span>
          )}
          {job.status === 'pending' && (
            <span className="inline-flex items-center gap-1 font-medium text-stone-500">
              <Clock size={13} /> En attente
            </span>
          )}
          {job.status === 'failed' && (
            <span className="inline-flex items-center gap-1 font-medium text-bordeaux">
              <AlertTriangle size={13} /> Erreur
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-stone-400 font-mono text-[11px]">{formattedDate}</span>
          {job.status === 'completed' && (
            <ArrowRight size={14} className="text-stone-300 group-hover:text-mustard group-hover:translate-x-0.5 transition-all" />
          )}
        </div>
      </div>
    </div>
  )
}

