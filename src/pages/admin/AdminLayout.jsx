import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { FiGrid, FiLogOut, FiPenTool, FiPlusCircle, FiSettings } from 'react-icons/fi'
import { useAuth } from '../../providers/AppProviders.jsx'

export default function AdminLayout() {
  const { signOut } = useAuth()
  const [showConfirm, setShowConfirm] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    const INACTIVITY_LIMIT = 5 * 60 * 1000 // 5 minutes
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        setShowConfirm(false)
        signOut()
      }, INACTIVITY_LIMIT)
    }

    resetTimer()
    events.forEach((ev) => window.addEventListener(ev, resetTimer, { passive: true }))

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      events.forEach((ev) => window.removeEventListener(ev, resetTimer))
    }
  }, [signOut])

  function requestSignOut() {
    setShowConfirm(true)
  }

  function confirmSignOut() {
    setShowConfirm(false)
    signOut()
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <NavLink to="/admin" className="text-sm font-extrabold text-brand-goldText">
            Admin Panel
          </NavLink>
          <div className="flex items-center gap-2">
            <NavLink
              to="/"
              className="rounded-md px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-800"
            >
              View site
            </NavLink>
            <button
              type="button"
              onClick={requestSignOut}
              className="inline-flex items-center gap-2 rounded-md bg-brand-goldText px-3 py-2 text-xs font-extrabold text-white transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
            >
              <FiLogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[14rem_1fr]">
        <aside className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <nav className="space-y-2" aria-label="Admin">
            <NavItem to="/admin" label="Dashboard" icon={FiGrid} end />
            <NavItem to="/admin/posts" label="Posts" icon={FiPenTool} />
            <NavItem to="/admin/posts/new" label="New Post" icon={FiPlusCircle} />
            <NavItem to="/admin/settings" label="Settings" icon={FiSettings} />
          </nav>
        </aside>
        <main className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <Outlet />
        </main>
      </div>

      {showConfirm ? (
        <div className="fixed inset-0 z-[190] flex items-center justify-center bg-black/60 px-4 backdrop-blur" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
            <h2 className="text-lg font-black text-brand-goldText">Sign out?</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">You will need to log in again to manage posts.</p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmSignOut}
                className="rounded-md bg-rose-600 px-4 py-2 text-sm font-extrabold text-white transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function NavItem({ to, label, icon: Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors',
          isActive ? 'bg-brand-sky text-brand-goldText' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
        ].join(' ')
      }
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </NavLink>
  )
}
