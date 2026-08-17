import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Menu, FilePlus, FolderOpen, Settings, HelpCircle } from 'lucide-react'
import Sidebar from './Sidebar'
import PwaInstallPrompt from './PwaInstallPrompt'

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const isNavActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    if (path === '/new') return location.pathname === '/new'
    return location.pathname.startsWith(path)
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-surface">
      {/* Sidebar (Desktop sticky + Mobile drawer) */}
      <Sidebar mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0 w-full">
        {/* Mobile Top App Bar (< md) */}
        <header className="flex md:hidden items-center justify-between px-4 py-3 border-b border-surface-border bg-[#DCEAF5] text-[#0C2237] flex-shrink-0 z-20 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg text-[#0C2237] hover:bg-[#C1DAEE] transition-colors"
              title="Ouvrir le menu"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <img
                src="/icon-512.png"
                alt="Doc2LaTeX Logo"
                className="w-7 h-7 rounded-md object-contain bg-white p-0.5 border border-[#96BFE2] shadow-xs"
              />
              <span className="font-serif font-bold text-base tracking-tight text-[#102A42]">
                Doc2LaTeX
              </span>
            </div>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden pb-16 md:pb-0 bg-surface">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation Bar (< md) */}
        <nav className="flex md:hidden items-center justify-around border-t border-surface-border bg-surface-card py-2 px-1 fixed bottom-0 left-0 right-0 z-30 shadow-md font-sans">
          <button
            onClick={() => navigate('/new')}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[11px] font-medium transition-colors ${
              isNavActive('/new') ? 'text-[#0C2237] font-bold' : 'text-stone-500 hover:text-charcoal'
            }`}
          >
            <FilePlus size={18} />
            <span>Nouveau</span>
          </button>

          <button
            onClick={() => navigate('/')}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[11px] font-medium transition-colors ${
              isNavActive('/') ? 'text-[#0C2237] font-bold' : 'text-stone-500 hover:text-charcoal'
            }`}
          >
            <FolderOpen size={18} />
            <span>Bibliothèque</span>
          </button>

          <button
            onClick={() => navigate('/settings')}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[11px] font-medium transition-colors ${
              isNavActive('/settings') ? 'text-[#0C2237] font-bold' : 'text-stone-500 hover:text-charcoal'
            }`}
          >
            <Settings size={18} />
            <span>Paramètres</span>
          </button>

          <button
            onClick={() => navigate('/help')}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[11px] font-medium transition-colors ${
              isNavActive('/help') ? 'text-[#0C2237] font-bold' : 'text-stone-500 hover:text-charcoal'
            }`}
          >
            <HelpCircle size={18} />
            <span>Guide</span>
          </button>
        </nav>
      </div>

      <PwaInstallPrompt />
    </div>
  )
}
