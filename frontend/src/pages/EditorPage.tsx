import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Download,
  RefreshCw,
  FileCode,
  FileDown,
  Check,
  AlertTriangle,
  Maximize2,
  Minimize2,
  Code2,
  Eye,
} from 'lucide-react'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { basicSetup } from 'codemirror'
import {
  getJobStatus,
  getTexContent,
  getPdfBlob,
  updateTexAndRecompile,
  downloadFile,
} from '../lib/api'
import type { JobStatus } from '../types'

const GENERIC_ERROR_MESSAGE = "Une erreur s'est produite lors de la compilation. Veuillez vérifier la syntaxe de votre code LaTeX."

const mathSnippets = [
  { label: 'Fraction', snippet: '\\frac{a}{b}' },
  { label: 'Racine', snippet: '\\sqrt{x}' },
  { label: 'Somme', snippet: '\\sum_{i=1}^{n}' },
  { label: 'Intégrale', snippet: '\\int_{a}^{b} f(x)\\,dx' },
  { label: 'Équation', snippet: '\\begin{equation}\n  E = mc^2\n\\end{equation}' },
  { label: 'Matrice', snippet: '\\begin{pmatrix}\n  a & b \\\\\n  c & d\n\\end{pmatrix}' },
]

export default function EditorPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const navigate = useNavigate()
  const numericJobId = Number(jobId)

  const [job, setJob] = useState<JobStatus | null>(null)
  const [tex, setTex] = useState('')
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [compiling, setCompiling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pdfExpanded, setPdfExpanded] = useState(false)
  const [mobileTab, setMobileTab] = useState<'code' | 'pdf'>('code')

  const editorContainerRef = useRef<HTMLDivElement>(null)
  const editorViewRef = useRef<EditorView | null>(null)
  const texRef = useRef(tex)

  useEffect(() => {
    texRef.current = tex
  }, [tex])

  // Load job data
  useEffect(() => {
    if (isNaN(numericJobId)) return

    const loadJob = async () => {
      try {
        const status = await getJobStatus(numericJobId)
        setJob(status)

        if (status.status === 'completed') {
          const [texContent, pdfBlob] = await Promise.all([
            getTexContent(numericJobId),
            getPdfBlob(numericJobId),
          ])
          setTex(texContent)
          setPdfUrl(URL.createObjectURL(pdfBlob))
        } else if (status.error) {
          setError(GENERIC_ERROR_MESSAGE)
          try {
            const texContent = await getTexContent(numericJobId)
            setTex(texContent)
          } catch {
            // No tex yet
          }
        }
      } catch {
        setError(GENERIC_ERROR_MESSAGE)
      }
    }

    loadJob()
  }, [numericJobId])

  // Recompile handler
  const handleRecompile = useCallback(async () => {
    if (!numericJobId || compiling) return
    setCompiling(true)
    setError(null)

    try {
      const result = await updateTexAndRecompile(numericJobId, texRef.current)
      setJob(result)

      if (result.status === 'completed') {
        const pdfBlob = await getPdfBlob(numericJobId)
        if (pdfUrl) URL.revokeObjectURL(pdfUrl)
        setPdfUrl(URL.createObjectURL(pdfBlob))
        // On mobile, switch to preview tab after compilation
        if (window.innerWidth < 768) {
          setMobileTab('pdf')
        }
      } else if (result.status === 'failed') {
        setError(GENERIC_ERROR_MESSAGE)
      }
    } catch {
      setError(GENERIC_ERROR_MESSAGE)
    } finally {
      setCompiling(false)
    }
  }, [numericJobId, compiling, pdfUrl])

  // Keyboard shortcut Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleRecompile()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleRecompile])

  // Initialize CodeMirror editor
  useEffect(() => {
    if (!editorContainerRef.current || editorViewRef.current || !tex) return

    const state = EditorState.create({
      doc: tex,
      extensions: [
        basicSetup,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newDoc = update.state.doc.toString()
            texRef.current = newDoc
            setTex(newDoc)
          }
        }),
        EditorView.theme({
          '&': { height: '100%', fontSize: '13.5px', backgroundColor: '#FFFFFF' },
          '.cm-scroller': { overflow: 'auto', fontFamily: "'JetBrains Mono', 'Fira Code', monospace" },
          '.cm-content': { padding: '16px 0' },
          '.cm-gutters': {
            backgroundColor: '#FAF9F6',
            borderRight: '1px solid #E6E1D8',
            color: '#9E9890',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '12px',
          },
          '.cm-activeLine': { backgroundColor: '#F8F7F4' },
          '.cm-activeLineGutter': { backgroundColor: '#EFECE6', color: '#1C1B18' },
          '&.cm-focused .cm-cursor': { borderLeftColor: '#1C1B18' },
          '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
            backgroundColor: '#E2E8F0 !important',
          },
        }),
      ],
    })

    const view = new EditorView({
      state,
      parent: editorContainerRef.current,
    })

    editorViewRef.current = view

    return () => {
      view.destroy()
      editorViewRef.current = null
    }
  }, [tex])

  // Insert snippet helper
  const insertSnippet = (snippet: string) => {
    if (!editorViewRef.current) return
    const view = editorViewRef.current
    const selection = view.state.selection.main
    view.dispatch({
      changes: { from: selection.from, to: selection.to, insert: snippet },
      selection: { anchor: selection.from + snippet.length },
    })
    view.focus()
  }

  // Download handlers
  const handleDownloadTex = () => {
    if (!numericJobId || !job) return
    downloadFile(numericJobId, 'tex', job.filename.replace(/\.[^.]+$/, ''))
  }

  const handleDownloadPdf = () => {
    if (!numericJobId || !job) return
    downloadFile(numericJobId, 'pdf', job.filename.replace(/\.[^.]+$/, ''))
  }

  const displayName = job?.filename
    .replace(/\.[^.]+$/, '')
    .replace(/_/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase()) || 'Éditeur LaTeX'

  return (
    <div className="flex flex-col h-screen font-sans bg-surface">
      {/* Top Header Bar */}
      <header className="flex flex-wrap items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 border-b border-surface-border bg-surface-card flex-shrink-0 z-10 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => navigate('/')}
            className="p-1.5 rounded-lg hover:bg-surface text-stone-600 hover:text-charcoal transition-colors flex-shrink-0"
            title="Retour à la bibliothèque"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0">
            <h1 className="font-serif font-bold text-sm sm:text-base text-charcoal tracking-tight truncate max-w-[200px] sm:max-w-md">
              {displayName}
            </h1>
            {job && (
              <div className="flex items-center gap-1.5 text-[11px]">
                {job.status === 'completed' ? (
                  <span className="flex items-center gap-1 text-sage font-medium">
                    <Check size={12} strokeWidth={2.5} /> Compilé
                  </span>
                ) : job.status === 'processing' ? (
                  <span className="flex items-center gap-1 text-charcoal font-medium">
                    <RefreshCw size={12} className="animate-spin text-charcoal" /> Traitement...
                  </span>
                ) : job.status === 'failed' ? (
                  <span className="flex items-center gap-1 text-bordeaux font-medium">
                    <AlertTriangle size={12} /> Erreur
                  </span>
                ) : (
                  <span className="text-stone-400">En attente</span>
                )}
                <span className="text-stone-300 hidden sm:inline">•</span>
                <span className="text-stone-400 font-mono text-[10px] hidden sm:inline">Ctrl+S pour compiler</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          <button
            onClick={handleRecompile}
            disabled={compiling || !tex}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-semibold bg-charcoal hover:bg-charcoal-light text-white transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
          >
            <RefreshCw size={13} className={compiling ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">{compiling ? 'Compilation...' : 'Compiler le code'}</span>
            <span className="sm:hidden">{compiling ? '...' : 'Compiler'}</span>
          </button>

          <button
            onClick={handleDownloadTex}
            disabled={!job}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-medium border border-surface-border text-charcoal hover:bg-surface transition-colors"
            title="Télécharger le fichier source .tex"
          >
            <FileDown size={14} />
            <span>.tex</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={!pdfUrl}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-medium border border-surface-border bg-stone-800 text-white hover:bg-black transition-colors disabled:opacity-50"
            title="Télécharger le rendu PDF final"
          >
            <Download size={14} />
            <span>PDF</span>
          </button>
        </div>
      </header>

      {/* Mobile Tab Switcher (< md) */}
      <div className="flex md:hidden border-b border-surface-border bg-surface-card text-xs font-medium">
        <button
          onClick={() => setMobileTab('code')}
          className={`flex-1 py-2 text-center border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
            mobileTab === 'code'
              ? 'border-charcoal text-charcoal font-bold'
              : 'border-transparent text-stone-500 hover:text-charcoal'
          }`}
        >
          <FileCode size={14} />
          <span>Code LaTeX</span>
        </button>
        <button
          onClick={() => setMobileTab('pdf')}
          className={`flex-1 py-2 text-center border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
            mobileTab === 'pdf'
              ? 'border-charcoal text-charcoal font-bold'
              : 'border-transparent text-stone-500 hover:text-charcoal'
          }`}
        >
          <Eye size={14} />
          <span>Aperçu PDF</span>
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="border-b border-bordeaux-border bg-bordeaux-light px-4 sm:px-6 py-2 text-xs text-bordeaux font-sans flex items-center gap-2">
          <AlertTriangle size={14} className="flex-shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Snippet toolbar */}
      <div className="flex items-center gap-1 px-3 sm:px-4 py-1.5 bg-surface-card border-b border-surface-border overflow-x-auto text-xs flex-shrink-0">
        <span className="text-[11px] font-semibold text-stone-400 mr-1.5 flex items-center gap-1 flex-shrink-0">
          <Code2 size={13} className="text-charcoal" /> Snippets :
        </span>
        {mathSnippets.map((item) => (
          <button
            key={item.label}
            onClick={() => insertSnippet(item.snippet)}
            className="px-2 py-0.5 rounded bg-surface hover:bg-stone-200 hover:text-charcoal border border-surface-border text-[11px] font-mono text-stone-700 transition-colors whitespace-nowrap flex-shrink-0"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Workspace: Split on Desktop, Tabbed on Mobile */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Editor Panel */}
        <div
          className={`flex flex-col border-r border-surface-border transition-all duration-200 ${
            mobileTab !== 'code' ? 'hidden md:flex' : 'flex'
          } ${pdfExpanded ? 'md:w-0 md:overflow-hidden' : 'flex-1 min-w-0'}`}
        >
          <div className="hidden md:flex items-center justify-between px-4 py-2 border-b border-surface-border/60 bg-surface text-xs font-semibold text-stone-600">
            <div className="flex items-center gap-2">
              <FileCode size={14} className="text-charcoal" />
              <span>Source LaTeX (.tex)</span>
            </div>
            <span className="font-mono text-[11px] text-stone-400">UTF-8 • TeX</span>
          </div>
          <div ref={editorContainerRef} className="flex-1 overflow-auto bg-surface-card" />
        </div>

        {/* PDF Preview Panel */}
        <div
          className={`flex flex-col transition-all duration-200 ${
            mobileTab !== 'pdf' ? 'hidden md:flex' : 'flex'
          } ${pdfExpanded ? 'flex-1' : 'w-full md:w-[48%] md:min-w-[320px]'}`}
        >
          <div className="hidden md:flex items-center justify-between px-4 py-2 border-b border-surface-border/60 bg-surface text-xs font-semibold text-stone-600">
            <span>Rendu PDF compilé</span>
            <button
              onClick={() => setPdfExpanded(!pdfExpanded)}
              className="p-1 rounded hover:bg-surface-muted text-stone-500 hover:text-charcoal transition-colors"
              title={pdfExpanded ? 'Afficher la vue partagée' : 'Agrandir le visualiseur PDF'}
            >
              {pdfExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
          </div>
          <div className="flex-1 bg-stone-200/70 overflow-hidden relative">
            {pdfUrl ? (
              <iframe
                title="Rendu PDF"
                src={`${pdfUrl}#toolbar=1&navpanes=0`}
                className="w-full h-full border-none"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-stone-500 text-xs p-6 text-center">
                {compiling ? (
                  <div className="flex flex-col items-center gap-3">
                    <RefreshCw size={24} className="animate-spin text-charcoal" />
                    <span>Génération du document PDF en cours...</span>
                  </div>
                ) : (
                  <div>
                    <p className="font-serif font-bold text-sm text-charcoal mb-1">Aperçu non disponible</p>
                    <p className="text-stone-400 text-xs max-w-xs">
                      Cliquez sur "Compiler" pour exécuter le moteur LaTeX.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
