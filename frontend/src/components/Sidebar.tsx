import { useLocation, useNavigate } from 'react-router-dom'
import {
  FolderOpen,
  FilePlus,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import { useState } from 'react'

interface NavItem {
  icon: React.ReactNode
  label: string
  path: string
}

const navItems: NavItem[] = [
  { icon: <FilePlus size={19} />, label: 'Nouveau projet', path: '/new' },
  { icon: <FolderOpen size={19} />, label: 'Bibliothèque', path: '/' },
]

const bottomItems: NavItem[] = [
  { icon: <Settings size={19} />, label: 'Configuration', path: '/settings' },
  { icon: <HelpCircle size={19} />, label: 'Documentation', path: '/help' },
]

interface SidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export default function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    if (path === '/new') return location.pathname === '/new'
    return location.pathname.startsWith(path)
  }

  const handleNavClick = (path: string) => {
    navigate(path)
    onMobileClose?.()
  }

  const sidebarContent = (isMobileView = false) => (
    <div
      style={{ backgroundColor: '#DCEAF5', borderColor: '#C3DCEF', color: '#0C2237' }}
      className={`flex flex-col h-full select-none font-sans ${
        isMobileView ? 'w-[260px]' : collapsed ? 'w-[70px]' : 'w-[250px]'
      }`}
    >
      {/* Logo & Branding */}
      <div
        style={{ borderColor: '#C8DEF0' }}
        className="flex items-center justify-between px-4 py-4 border-b"
      >
        <div className="flex items-center gap-3 min-w-0">
          <img
            src="/icon-512.png"
            alt="Doc2LaTeX Logo"
            className="w-9 h-9 rounded-lg object-contain bg-white p-1 border border-[#96BFE2] shadow-xs flex-shrink-0"
          />
          {(!collapsed || isMobileView) && (
            <div className="flex flex-col min-w-0">
              <span className="font-serif font-bold text-base text-[#102A42] tracking-tight whitespace-nowrap">
                Doc2LaTeX
              </span>
              <span className="text-[11px] text-[#486B8A] font-sans tracking-wide truncate">
                Moteur OCR & Typographie
              </span>
            </div>
          )}
        </div>

        {isMobileView && (
          <button
            onClick={onMobileClose}
            className="p-1 rounded-lg text-stone-500 hover:text-charcoal hover:bg-[#C1DAEE] transition-colors"
            title="Fermer le menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Main navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-hidden">
        {navItems.map((item) => {
          const active = isActive(item.path)
          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              style={
                active
                  ? { backgroundColor: '#C1DAEE', color: '#0C2237' }
                  : undefined
              }
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-all duration-150
                ${
                  active
                    ? 'font-bold shadow-xs'
                    : 'text-[#2D4F6E] hover:text-[#0C2237] hover:bg-[#D0E2F1] font-medium'
                }`}
              title={collapsed && !isMobileView ? item.label : undefined}
            >
              <span className={`flex-shrink-0 ${active ? 'text-[#0C2237]' : 'text-[#3B6287]'}`}>
                {item.icon}
              </span>
              {(!collapsed || isMobileView) && <span className="whitespace-nowrap">{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Bottom navigation */}
      <div
        style={{ borderColor: '#C8DEF0' }}
        className="px-3 py-4 space-y-1.5 border-t flex-shrink-0"
      >
        {bottomItems.map((item) => {
          const active = isActive(item.path)
          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              style={
                active
                  ? { backgroundColor: '#C1DAEE', color: '#0C2237' }
                  : undefined
              }
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-sm transition-all duration-150
                ${
                  active
                    ? 'font-bold shadow-xs'
                    : 'text-[#2D4F6E] hover:text-[#0C2237] hover:bg-[#D0E2F1] font-medium'
                }`}
              title={collapsed && !isMobileView ? item.label : undefined}
            >
              <span className={`flex-shrink-0 ${active ? 'text-[#0C2237]' : 'text-[#3B6287]'}`}>
                {item.icon}
              </span>
              {(!collapsed || isMobileView) && <span className="whitespace-nowrap">{item.label}</span>}
            </button>
          )
        })}

        {/* Collapse toggle (desktop only) */}
        {!isMobileView && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs text-[#486B8A] hover:text-[#0C2237] hover:bg-[#D0E2F1] transition-colors"
            title={collapsed ? 'Agrandir la barre latérale' : 'Réduire la barre latérale'}
          >
            <span className="flex-shrink-0">
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </span>
            {!collapsed && <span>Réduire le panneau</span>}
          </button>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        style={{ backgroundColor: '#DCEAF5', borderColor: '#C3DCEF' }}
        className="hidden md:flex flex-col h-screen sticky top-0 flex-shrink-0 border-r transition-all duration-300 z-30 shadow-sm overflow-hidden"
      >
        {sidebarContent(false)}
      </aside>

      {/* Mobile Drawer (Overlay) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-in">
          {/* Backdrop */}
          <div
            onClick={onMobileClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer content */}
          <div className="relative z-50 h-full shadow-2xl overflow-hidden">
            {sidebarContent(true)}
          </div>
        </div>
      )}
    </>
  )
}
