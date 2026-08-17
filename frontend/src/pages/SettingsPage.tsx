import { useEffect, useState } from 'react'
import { Server, Cpu, CheckCircle2, AlertCircle, HardDrive, KeyRound, Sparkles } from 'lucide-react'
import { getSystemInfo } from '../lib/api'
import type { SystemInfo } from '../types'

export default function SettingsPage() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const info = await getSystemInfo()
        setSystemInfo(info)
      } catch {
        console.warn('Impossible de charger les métriques système')
      } finally {
        setLoading(false)
      }
    }
    fetchInfo()
  }, [])

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto font-sans">
      {/* Title */}
      <div className="mb-8 border-b border-surface-border pb-6">
        <h1 className="font-serif font-bold text-2xl lg:text-3xl text-charcoal tracking-tight">
          Configuration & Paramètres
        </h1>
        <p className="text-stone-600 mt-1.5 text-sm">
          État du moteur de conversion, compilateurs LaTeX locaux et connectivité système.
        </p>
      </div>

      <div className="space-y-6">
        {/* System Health / Status Card */}
        <div className="rounded-xl border border-surface-border bg-surface-card p-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-surface-border/60">
            <Server size={20} className="text-charcoal" />
            <h2 className="font-serif font-bold text-lg text-charcoal">
              État des composants système
            </h2>
          </div>

          {loading ? (
            <p className="text-sm text-stone-400">Interrogation du backend...</p>
          ) : systemInfo ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* AI Vision Engine Status */}
              <div className="p-4 rounded-lg bg-surface border border-surface-border flex items-start gap-3">
                <div className="p-2 rounded bg-surface-card border border-surface-border text-charcoal">
                  <KeyRound size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-charcoal">Moteur de Vision Google Gemini</h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Modèle configuré : <span className="font-mono text-stone-700 font-semibold">{systemInfo.gemini_model || systemInfo.openai_model || 'gemini-3-flash-preview'}</span>
                  </p>
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-medium">
                    {(systemInfo.gemini_configured ?? systemInfo.openai_configured) ? (
                      <span className="text-sage flex items-center gap-1">
                        <CheckCircle2 size={13} /> Clé API active & connectée
                      </span>
                    ) : (
                      <span className="text-bordeaux flex items-center gap-1">
                        <AlertCircle size={13} /> Clé API absente
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* LaTeX Compiler Status */}
              <div className="p-4 rounded-lg bg-surface border border-surface-border flex items-start gap-3">
                <div className="p-2 rounded bg-surface-card border border-surface-border text-charcoal">
                  <Cpu size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-charcoal">Compilateur LaTeX local</h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Binaire détecté : <span className="font-mono text-stone-700 font-semibold">{systemInfo.latex_compiler}</span>
                  </p>
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-sage">
                    <CheckCircle2 size={13} /> Moteur opérationnel pour rendu PDF
                  </div>
                </div>
              </div>

              {/* File Storage & Limit */}
              <div className="p-4 rounded-lg bg-surface border border-surface-border flex items-start gap-3">
                <div className="p-2 rounded bg-surface-card border border-surface-border text-charcoal">
                  <HardDrive size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-charcoal">Stockage & Fichiers</h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Taille maximale autorisée : <span className="font-mono text-stone-700 font-semibold">{systemInfo.max_upload_size_mb} Mo</span>
                  </p>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Répertoire runtime local : backend/runtime
                  </p>
                </div>
              </div>

              {/* Supported formats */}
              <div className="p-4 rounded-lg bg-surface border border-surface-border flex items-start gap-3">
                <div className="p-2 rounded bg-surface-card border border-surface-border text-charcoal">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-charcoal">Formats acceptés</h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Images (.png, .jpg), PDF scannés, Word (.docx), Excel (.xlsx)
                  </p>
                  <p className="text-[11px] text-sage font-medium mt-1">
                    Conversion sans perte des formules mathématiques
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-bordeaux bg-bordeaux-light p-3 rounded-lg border border-bordeaux-border">
              Une erreur s'est produite lors de la communication avec le serveur.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
