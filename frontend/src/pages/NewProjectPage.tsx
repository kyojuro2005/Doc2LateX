import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, X, Lightbulb } from 'lucide-react'
import UploadZone from '../components/UploadZone'
import { uploadFile, getJobStatus } from '../lib/api'

const GENERIC_ERROR_MESSAGE = "Une erreur s'est produite, veuillez vérifier si votre fichier respecte la taille réglementée ou l'extension requise."

export default function NewProjectPage() {
  const navigate = useNavigate()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = async (file: File) => {
    setUploading(true)
    setError(null)
    try {
      const result = await uploadFile(file)

      // If conversion completed synchronously (Render mode), navigate immediately
      if (result.status === 'completed') {
        setUploading(false)
        navigate(`/editor/${result.job_id}`)
        return
      }

      // Otherwise poll for completion (local dev mode)
      let attempts = 0
      const maxAttempts = 60 // 2 minutes max polling
      const pollInterval = setInterval(async () => {
        attempts++
        try {
          const status = await getJobStatus(result.job_id)
          if (status.status === 'completed') {
            clearInterval(pollInterval)
            setUploading(false)
            navigate(`/editor/${result.job_id}`)
          } else if (status.status === 'failed') {
            clearInterval(pollInterval)
            setUploading(false)
            setError(GENERIC_ERROR_MESSAGE)
          } else if (attempts >= maxAttempts) {
            clearInterval(pollInterval)
            setUploading(false)
            setError(GENERIC_ERROR_MESSAGE)
          }
        } catch {
          clearInterval(pollInterval)
          setUploading(false)
          setError(GENERIC_ERROR_MESSAGE)
        }
      }, 2000)
    } catch {
      setUploading(false)
      setError(GENERIC_ERROR_MESSAGE)
    }
  }

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto font-sans">
      {/* Header */}
      <div className="mb-8 border-b border-surface-border pb-6">
        <h1 className="font-serif font-bold text-2xl lg:text-3xl text-charcoal tracking-tight">
          Nouveau projet
        </h1>
        <p className="text-stone-600 mt-1.5 text-sm max-w-2xl">
          Importez un document (image, PDF, Word, Excel) pour le convertir automatiquement en code LaTeX structuré.
        </p>
      </div>

      {/* Upload zone */}
      <div className="p-6 sm:p-8 rounded-xl border border-surface-border bg-surface-card shadow-sm">
        <div className="mb-5">
          <h2 className="font-serif font-bold text-lg text-charcoal">
            Numériser ou importer un document
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Le moteur extrait le texte, les théorèmes et les formules mathématiques en syntaxe LaTeX standard.
          </p>
        </div>

        <UploadZone onFileSelected={handleUpload} uploading={uploading} />

        {error && (
          <div className="mt-4 flex items-center gap-2 text-sm text-bordeaux bg-bordeaux-light border border-bordeaux-border px-4 py-2.5 rounded-lg">
            <AlertCircle size={17} className="flex-shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError(null)} className="text-bordeaux/60 hover:text-bordeaux">
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="mt-6 p-4 rounded-lg bg-stone-50 border border-stone-200 text-xs text-stone-600 space-y-1.5">
        <div className="flex items-center gap-1.5 font-semibold text-charcoal">
          <Lightbulb size={15} className="text-charcoal flex-shrink-0" />
          <span>Conseils pour une conversion optimale :</span>
        </div>
        <ul className="list-disc list-inside space-y-1 pl-1 text-stone-500">
          <li>Les images nettes avec un bon contraste donnent de meilleurs résultats.</li>
          <li>Les fichiers Word (.docx) conservent la structure des paragraphes et des listes.</li>
          <li>Les PDF avec du texte sélectionnable sont traités en priorité (OCR en fallback).</li>
          <li>Après conversion, modifiez le code LaTeX dans l'éditeur intégré.</li>
        </ul>
      </div>
    </div>
  )
}
