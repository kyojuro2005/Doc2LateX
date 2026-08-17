import { useEffect, useState } from 'react'
import { Download, X, Smartphone, Monitor } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [guideIOS, setGuideIOS] = useState(false)

  useEffect(() => {
    // Check if already running in standalone / installed mode
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    setIsStandalone(isStandaloneMode)

    if (isStandaloneMode) return

    // Check iOS device
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent)
    setIsIOS(isIosDevice)

    // Capture standard browser PWA install event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)
      setShowModal(true)

      // Try automatic native trigger if browser permits
      try {
        promptEvent.prompt().catch(() => {
          // Handled via user click on "Installer" button
        })
      } catch {
        // Handled via modal
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Show modal promptly after page load if not in standalone
    const timer = setTimeout(() => {
      if (!isStandaloneMode) {
        setShowModal(true)
      }
    }, 800)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (isIOS) {
      setGuideIOS(true)
      return
    }

    if (deferredPrompt) {
      setShowModal(false)
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      if (choiceResult.outcome === 'accepted') {
        setDeferredPrompt(null)
      }
    } else {
      // Guide the user to browser native installation
      alert("Pour installer l'application :\n1. Cliquez sur l'icône d'installation dans la barre d'adresse de votre navigateur.\nOu 2. Ouvrez le menu ⋮ (en haut à droite) et choisissez 'Installer Doc2LaTeX'.")
      setShowModal(false)
    }
  }

  const handleDismiss = () => {
    setShowModal(false)
  }

  if (isStandalone || !showModal) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in font-sans">
      <div className="relative w-full max-w-md rounded-2xl border border-surface-border bg-surface-card p-6 shadow-2xl">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-charcoal hover:bg-stone-100 transition-colors"
          title="Fermer"
        >
          <X size={18} />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 p-2 border border-surface-border mb-4 shadow-xs flex items-center justify-center">
            <img src="/icon-192.png" alt="Doc2LaTeX Logo" className="w-full h-full object-contain" />
          </div>

          <h3 className="font-serif font-bold text-xl text-charcoal tracking-tight">
            Installer l'application sur votre appareil
          </h3>

          <p className="text-sm text-stone-600 mt-2 leading-relaxed">
            Installez Doc2LaTeX sur votre ordinateur ou mobile pour profiter d'une expérience plein écran, d'un accès instantané et d'une utilisation plus fluide.
          </p>

          {/* Features pills */}
          <div className="grid grid-cols-2 gap-2 w-full mt-4 text-xs font-medium text-stone-700">
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-surface border border-surface-border justify-center">
              <Monitor size={15} className="text-charcoal" />
              <span>Accès direct 1-clic</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-surface border border-surface-border justify-center">
              <Smartphone size={15} className="text-charcoal" />
              <span>Mode plein écran</span>
            </div>
          </div>

          {guideIOS && (
            <div className="mt-4 p-3 rounded-lg bg-stone-100 border border-stone-200 text-xs text-left text-stone-700 space-y-1">
              <p className="font-semibold text-charcoal">Sur iPhone / iPad (Safari) :</p>
              <p>1. Appuyez sur le bouton <strong>Partager</strong> en bas de l'écran.</p>
              <p>2. Faites défiler et sélectionnez <strong>« Sur l'écran d'accueil »</strong>.</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full mt-6">
            <button
              onClick={handleInstallClick}
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-charcoal text-white hover:bg-charcoal-light font-semibold text-sm shadow-sm transition-all active:scale-[0.98]"
            >
              <Download size={16} />
              Installer
            </button>
            <button
              onClick={handleDismiss}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-surface-border text-stone-600 hover:text-charcoal hover:bg-stone-100 font-medium text-sm transition-colors"
            >
              Pas maintenant
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
