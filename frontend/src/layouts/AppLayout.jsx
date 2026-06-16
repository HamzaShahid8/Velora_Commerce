import { useState } from 'react'
import { navigation } from '../config/modules'

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5" aria-hidden="true">
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5" aria-hidden="true">
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  )
}


function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  )
}

function ForwardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="M12 5l7 7-7 7" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <path d="M15 17l5-5-5-5" />
      <path d="M20 12H9" />
      <path d="M11 19H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6" />
    </svg>
  )
}

function NavButton({ item, activePage, onNavigate }) {
  const isActive = activePage === item.key
  return (
    <button
      type="button"
      onClick={() => item.key && onNavigate(item.key)}
      className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
        isActive ? 'bg-emerald-50 text-[#065f46] shadow-sm ring-1 ring-emerald-100' : 'text-slate-700 hover:bg-slate-50 hover:text-[#065f46]'
      }`}
    >
      {item.label}
    </button>
  )
}

function SidebarContent({ activePage, onNavigate, onLogout, onClose, navigationItems = navigation }) {
  const handleNavigate = (key) => {
    onNavigate(key)
    onClose?.()
  }

  return (
    <div className="flex h-full flex-col border-r border-slate-200 bg-white p-5 text-slate-900">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#065f46] text-base font-semibold text-white shadow-sm">V</div>
          <div>
            <p className="text-base font-semibold tracking-tight text-slate-950">Velora</p>
            <p className="text-xs font-medium text-slate-500">Boutique Management</p>
          </div>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <CloseIcon />
          </button>
        ) : null}
      </div>

      <nav className="mt-8 space-y-2 pb-6">
        {navigationItems.map((item) => (
          <NavButton key={item.key} item={item} activePage={activePage} onNavigate={handleNavigate} />
        ))}
      </nav>

      <div className="mt-auto pt-6">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-[#065f46] shadow-sm transition hover:bg-[#065f46] hover:text-white"
        >
          <LogoutIcon />
          Logout
        </button>
      </div>
    </div>
  )
}

export function AppLayout({ children, activePage, onNavigate, onBack, onForward, canGoBack = false, canGoForward = false, onLogout, navigationItems = navigation }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <aside className="hidden h-screen w-72 shrink-0 lg:sticky lg:top-0 lg:block">
        <SidebarContent activePage={activePage} onNavigate={onNavigate} onLogout={onLogout} navigationItems={navigationItems} />
      </aside>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Close sidebar overlay" className="absolute inset-0 bg-slate-950/40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative h-full w-[82vw] max-w-80 shadow-2xl">
            <SidebarContent activePage={activePage} onNavigate={onNavigate} onLogout={onLogout} onClose={() => setSidebarOpen(false)} navigationItems={navigationItems} />
          </aside>
        </div>
      ) : null}

      <div className="min-w-0 flex-1">
        <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-5 lg:px-8">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-50 lg:hidden"
              aria-label="Open sidebar"
            >
              <MenuIcon />
            </button>
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <button
                type="button"
                onClick={onBack}
                disabled={!canGoBack}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-[#065f46] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-700"
                aria-label="Go back"
                title="Back"
              >
                <BackIcon />
              </button>
              <button
                type="button"
                onClick={onForward}
                disabled={!canGoForward}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-[#065f46] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-700"
                aria-label="Go forward"
                title="Forward"
              >
                <ForwardIcon />
              </button>
            </div>
          </div>
        </header>

        <main className="px-4 py-5 sm:px-5 sm:py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  )
}
