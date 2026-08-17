import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  FolderOpen,
  RefreshCw,
  AlertCircle,
  FileCode2,
  Download,
  Eye,
  EyeOff,
  Trash2,
  ExternalLink,
  FileText,
  Image,
  FileSpreadsheet,
  X,
} from 'lucide-react'
import { listJobs, deleteJob, downloadFile, getTexContentInline } from '../lib/api'
import type { JobStatus, FileType } from '../types'
import { detectFileType } from '../types'

const GENERIC_ERROR_MESSAGE = "Une erreur s'est produite, veuillez vérifier si votre fichier respecte la taille réglementée ou l'extension requise."

const typeLabels: Record<FileType, { label: string; icon: React.ReactNode }> = {
  image: { label: 'IMAGE → TEX', icon: <Image size={16} className="text-charcoal" /> },
  pdf: { label: 'PDF → TEX', icon: <FileText size={16} className="text-charcoal" /> },
  docx: { label: 'WORD → TEX', icon: <FileText size={16} className="text-charcoal" /> },
  xlsx: { label: 'EXCEL → TEX', icon: <FileSpreadsheet size={16} className="text-charcoal" /> },
  unknown: { label: 'DOC → TEX', icon: <FileCode2 size={16} className="text-stone-400" /> },
}

export default function ProjectsPage() {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState<JobStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [previewJobId, setPreviewJobId] = useState<number | null>(null)
  const [previewTex, setPreviewTex] = useState<string>('')
  const [previewLoading, setPreviewLoading] = useState(false)

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    try {
      const data = await listJobs()
      setJobs(data)
    } catch {
      console.warn('Impossible de joindre le serveur API.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  // Only show completed jobs (converted to LaTeX)
  const completedJobs = jobs.filter(
    (j) =>
      j.status === 'completed' &&
      j.filename.toLowerCase().includes(search.toLowerCase())
  )

  const handleDeleteJob = async (jobId: number) => {
    try {
      await deleteJob(jobId)
      setJobs((prev) => prev.filter((j) => j.job_id !== jobId))
      if (previewJobId === jobId) {
        setPreviewJobId(null)
        setPreviewTex('')
      }
    } catch {
      setError(GENERIC_ERROR_MESSAGE)
    }
  }

  const handlePreview = async (jobId: number) => {
    if (previewJobId === jobId) {
      setPreviewJobId(null)
      setPreviewTex('')
      return
    }
    setPreviewJobId(jobId)
    setPreviewLoading(true)
    try {
      const tex = await getTexContentInline(jobId)
      setPreviewTex(tex)
    } catch {
      setPreviewTex('% Impossible de charger le contenu LaTeX.')
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleDownloadTex = (job: JobStatus) => {
    const baseName = job.filename.replace(/\.[^.]+$/, '')
    downloadFile(job.job_id, 'tex', baseName)
  }

  const handleDownloadPdf = (job: JobStatus) => {
    const baseName = job.filename.replace(/\.[^.]+$/, '')
    downloadFile(job.job_id, 'pdf', baseName)
  }

  const formattedDate = (iso: string) =>
    new Date(iso).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  const displayName = (filename: string) =>
    filename
      .replace(/\.[^.]+$/, '')
      .replace(/_/g, ' ')
      .replace(/^\w/, (c) => c.toUpperCase())

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="mb-8 border-b border-surface-border pb-6">
        <h1 className="font-serif font-bold text-2xl lg:text-3xl text-charcoal tracking-tight">
          Bibliothèque LaTeX
        </h1>
        <p className="text-stone-600 mt-1.5 text-sm max-w-2xl">
          Tous vos documents convertis en LaTeX. Prévisualisez le code source, téléchargez les fichiers <code className="bg-stone-100 px-1 py-0.5 rounded text-xs">.tex</code> et <code className="bg-stone-100 px-1 py-0.5 rounded text-xs">.pdf</code> pour les ouvrir dans Texmaker ou tout éditeur LaTeX.
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 flex items-center gap-2 text-sm text-bordeaux bg-bordeaux-light border border-bordeaux-border px-4 py-2.5 rounded-lg">
          <AlertCircle size={17} className="flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-bordeaux/60 hover:text-bordeaux">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Search and filter bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un fichier LaTeX..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-surface-border bg-surface-card text-sm text-charcoal placeholder:text-stone-400 focus:outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <span className="text-xs text-stone-500 font-mono">
            {completedJobs.length} fichier{completedJobs.length !== 1 ? 's' : ''} LaTeX
          </span>
          <button
            onClick={fetchJobs}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-surface-border text-xs font-medium text-stone-600 hover:text-charcoal hover:bg-surface transition-colors"
            title="Actualiser la liste"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-charcoal' : 'text-charcoal'} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <RefreshCw size={24} className="animate-spin text-charcoal" />
          <p className="text-xs text-stone-500">Chargement de vos fichiers LaTeX...</p>
        </div>
      ) : completedJobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-dashed border-surface-border rounded-xl bg-surface-card/60">
          <div className="w-14 h-14 rounded-full bg-surface-muted flex items-center justify-center mb-3 text-stone-400">
            <FolderOpen size={24} />
          </div>
          <h3 className="font-serif font-bold text-base text-charcoal">
            {search ? 'Aucun fichier LaTeX trouvé' : 'Aucune conversion terminée'}
          </h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm">
            {search
              ? 'Aucun fichier LaTeX ne correspond à votre recherche.'
              : 'Convertissez un document depuis l\'onglet "Nouveau projet" pour le retrouver ici.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {completedJobs.map((job) => {
            const fileType = detectFileType(job.content_type, job.filename)
            const typeInfo = typeLabels[fileType]
            const isPreviewOpen = previewJobId === job.job_id

            return (
              <div
                key={job.job_id}
                className="rounded-xl border border-surface-border bg-surface-card shadow-sm transition-all duration-200 hover:shadow-md"
              >
                {/* Card row */}
                <div className="flex items-center gap-4 p-4 sm:p-5">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center flex-shrink-0">
                    <FileCode2 size={20} className="text-charcoal" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-serif font-bold text-sm text-charcoal truncate">
                        {displayName(job.filename)}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold tracking-wider text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200 flex-shrink-0">
                        {typeInfo.icon}
                        {typeInfo.label}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 font-mono truncate">
                      {job.filename.replace(/\.[^.]+$/, '')}.tex — {formattedDate(job.created_at)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {/* Preview toggle */}
                    <button
                      onClick={() => handlePreview(job.job_id)}
                      className={`p-2 rounded-lg text-xs transition-colors ${
                        isPreviewOpen
                          ? 'bg-stone-200 text-charcoal'
                          : 'text-stone-400 hover:text-charcoal hover:bg-stone-100'
                      }`}
                      title={isPreviewOpen ? 'Fermer l\'aperçu' : 'Aperçu du code LaTeX'}
                    >
                      {isPreviewOpen ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>

                    {/* Download .tex */}
                    <button
                      onClick={() => handleDownloadTex(job)}
                      className="p-2 rounded-lg text-stone-400 hover:text-charcoal hover:bg-stone-100 transition-colors"
                      title="Télécharger le fichier .tex"
                    >
                      <Download size={16} />
                    </button>

                    {/* Download .pdf */}
                    <button
                      onClick={() => handleDownloadPdf(job)}
                      className="p-2 rounded-lg text-stone-400 hover:text-charcoal hover:bg-stone-100 transition-colors"
                      title="Télécharger le PDF compilé"
                    >
                      <FileText size={16} />
                    </button>

                    {/* Open in editor */}
                    <button
                      onClick={() => navigate(`/editor/${job.job_id}`)}
                      className="p-2 rounded-lg text-stone-400 hover:text-charcoal hover:bg-stone-100 transition-colors"
                      title="Ouvrir dans l'éditeur"
                    >
                      <ExternalLink size={16} />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => {
                        if (confirm(`Supprimer définitivement "${displayName(job.filename)}" ?`)) {
                          handleDeleteJob(job.job_id)
                        }
                      }}
                      className="p-2 rounded-lg text-stone-400 hover:text-bordeaux hover:bg-bordeaux-light transition-colors"
                      title="Supprimer ce fichier"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Preview panel (expandable) */}
                {isPreviewOpen && (
                  <div className="border-t border-surface-border bg-stone-50/70 p-4 sm:p-5 rounded-b-xl">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono text-stone-500 font-semibold tracking-wider">
                        APERÇU LaTeX — {job.filename.replace(/\.[^.]+$/, '')}.tex
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownloadTex(job)}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-600 hover:text-charcoal transition-colors"
                        >
                          <Download size={12} />
                          Télécharger .tex
                        </button>
                        <button
                          onClick={() => handleDownloadPdf(job)}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-600 hover:text-charcoal transition-colors"
                        >
                          <Download size={12} />
                          Télécharger .pdf
                        </button>
                      </div>
                    </div>
                    {previewLoading ? (
                      <div className="flex items-center justify-center py-8 gap-2 text-xs text-stone-400">
                        <RefreshCw size={14} className="animate-spin text-charcoal" />
                        Chargement du code LaTeX...
                      </div>
                    ) : (
                      <pre className="bg-white border border-stone-200 rounded-lg p-4 text-xs text-stone-700 font-mono overflow-x-auto max-h-[400px] overflow-y-auto leading-relaxed whitespace-pre-wrap">
                        {previewTex}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
