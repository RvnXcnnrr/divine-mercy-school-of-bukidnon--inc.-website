import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { FiBookOpen, FiGrid, FiLogOut, FiMessageSquare, FiPenTool, FiPlusCircle, FiUsers } from 'react-icons/fi'
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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[14rem_1fr]">
        <aside className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="mb-3 text-[11px] font-black uppercase tracking-[0.16em] text-brand-goldText">Admin Panel</div>
          <nav className="space-y-2" aria-label="Admin">
            <NavItem to="/admin" label="Dashboard" icon={FiGrid} end />
            <NavItem to="/admin/posts" label="Posts" icon={FiPenTool} />
            <NavItem to="/admin/posts/new" label="New Post" icon={FiPlusCircle} />
            <NavItem to="/admin/testimonials" label="Testimonials" icon={FiMessageSquare} />
            <NavItem to="/admin/content" label="Site Content" icon={FiBookOpen} />
            <NavItem to="/admin/settings" label="Subscribers" icon={FiUsers} />
          </nav>

          <div className="mt-6 space-y-2 border-t border-slate-200 pt-4">
            <NavLink
              to="/"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:-translate-y-[1px] hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
            >
              View site
            </NavLink>
            <button
              type="button"
              onClick={requestSignOut}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-goldText px-4 py-2 text-sm font-bold uppercase tracking-wide text-white shadow-none ring-1 ring-brand-goldText/30 transition hover:-translate-y-[1px] hover:bg-brand-goldText/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
            >
              <FiLogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </aside>
        <main className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <Outlet />
        </main>
      </div>

      {showConfirm ? (
        <div className="fixed inset-0 z-[190] flex items-center justify-center bg-black/60 px-4 backdrop-blur" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
            <h2 className="text-lg font-black text-brand-goldText">Sign out?</h2>
            <p className="mt-2 text-sm text-slate-600">You will need to log in again to manage posts.</p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
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
          isActive ? 'bg-brand-sky text-brand-goldText' : 'text-slate-700 hover:bg-slate-100',
        ].join(' ')
      }
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </NavLink>
  )
}
