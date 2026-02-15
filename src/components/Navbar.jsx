import { useEffect, useId, useMemo, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { FiLogIn, FiMenu, FiMoon, FiSun, FiX } from 'react-icons/fi'
import { FaSchool } from 'react-icons/fa6'
import useTheme from '../hooks/useTheme.js'
import AdminLoginModal from './AdminLoginModal.jsx'
import { useAuth } from '../providers/AppProviders.jsx'

const baseLinkClass =
  'inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold tracking-tight transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950'

function NavItem({ to, children, onClick, className }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          baseLinkClass,
          className,
          isActive
            ? 'bg-brand-sky text-brand-goldText ring-1 ring-brand-gold/30 font-extrabold'
            : 'text-slate-700 hover:bg-slate-50 hover:text-brand-goldText dark:text-slate-200 dark:hover:bg-slate-900 dark:hover:text-brand-goldBright',
        ].join(' ')
      }
      end={to === '/'}
    >
      {children}
    </NavLink>
  )
}

export default function Navbar() {
  const { pathname } = useLocation()
  const [logoOk, setLogoOk] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { resolvedTheme, toggleTheme } = useTheme()
  const [loginOpen, setLoginOpen] = useState(false)
  const { user } = useAuth()
  const isDark = resolvedTheme === 'dark'
  const mobilePanelId = useId()

  const links = useMemo(
    () => [
      { to: '/', label: 'Home' },
      { to: '/about', label: 'About' },
      { to: '/academics', label: 'Academics' },
      { to: '/admissions', label: 'Admissions' },
      { to: '/vlogs', label: 'Vlogs' },
      { to: '/news', label: 'Updates' },
      { to: '/events', label: 'Events' },
      { to: '/gallery', label: 'Gallery' },
      { to: '/contact', label: 'Contact' },
    ],
    []
  )

  const actionCtas = (
    <div className="ml-4 flex items-center gap-2">
      <button
        type="button"
        onClick={toggleTheme}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-950"
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? <FiSun className="h-5 w-5" aria-hidden="true" /> : <FiMoon className="h-5 w-5" aria-hidden="true" />}
      </button>
      {user ? (
        <NavLink
          to="/admin"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-brand-goldText px-4 text-xs font-bold uppercase tracking-wide text-white shadow-none ring-1 ring-brand-goldText/20 transition hover:-translate-y-[1px] hover:bg-brand-goldText/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
        >
          Dashboard
        </NavLink>
      ) : (
        <button
          type="button"
          onClick={() => setLoginOpen(true)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-brand-goldText px-4 text-xs font-bold uppercase tracking-wide text-white shadow-none ring-1 ring-brand-goldText/20 transition hover:-translate-y-[1px] hover:bg-brand-goldText/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
        >
          <FiLogIn className="mr-1 h-4 w-4" aria-hidden="true" />
          Admin
        </button>
      )}
    </div>
  )

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    function handleChange(e) {
      if (e.matches) setMobileOpen(false)
    }
    mq.addEventListener('change', handleChange)
    return () => mq.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    if (mobileOpen) window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen])

  useEffect(() => {
    if (!mobileOpen) return
    const prevBodyOverflow = document.body.style.overflow
    const prevHtmlOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevBodyOverflow
      document.documentElement.style.overflow = prevHtmlOverflow
    }
  }, [mobileOpen])

  return (
    <>
      <header
        className={[
          'fixed inset-x-0 top-0 z-[120] border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80',
        ].join(' ')}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4">
          <NavLink
            to="/"
            className="inline-flex min-w-[220px] items-center gap-3 rounded-lg px-2 py-2 text-base font-black tracking-tight text-brand-goldText focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white ring-2 ring-brand-navy/25 shadow-sm">
              {logoOk ? (
                <img
                  src="/logo.png"
                  alt="Divine Mercy School of Bukidnon, Inc. logo"
                  className="h-full w-full object-contain"
                  loading="eager"
                  width="48"
                  height="48"
                  onError={() => setLogoOk(false)}
                />
              ) : (
                <FaSchool className="h-5 w-5 text-brand-navy" aria-hidden="true" />
              )}
            </span>
            <div className="flex flex-col leading-tight">
              <span className="hidden sm:inline whitespace-nowrap text-xl leading-[1.05] lg:text-2xl font-black text-brand-goldText dark:text-brand-goldBright">
                Divine Mercy School
              </span>
              <span className="hidden sm:inline text-[11px] lg:text-xs font-semibold tracking-[0.16em] text-brand-navy/80 dark:text-slate-300">
                of Bukidnon, Inc.
              </span>
              <span className="sm:hidden text-base font-black text-brand-goldText dark:text-brand-goldBright">DMSB</span>
            </div>
          </NavLink>

          <nav className="hidden items-center gap-2 lg:flex" aria-label="Primary">
            {links.map((l) => (
              <NavItem key={l.to} to={l.to}>
                {l.label}
              </NavItem>
            ))}

            {actionCtas}
          </nav>

          <button
            type="button"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-md text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-slate-200 dark:hover:bg-slate-900 dark:focus-visible:ring-offset-slate-950 lg:hidden"
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
            aria-controls={mobilePanelId}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <FiX className="h-6 w-6" aria-hidden="true" /> : <FiMenu className="h-6 w-6" aria-hidden="true" />}
          </button>
        </div>
      </header>

      <div className="lg:hidden" aria-live="polite">
        <div
          className={[
            'fixed inset-0 z-[130] bg-slate-900/40 transition-opacity duration-300 ease-out dark:bg-slate-900/60',
            mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
          ].join(' ')}
          aria-hidden="true"
          onClick={() => setMobileOpen(false)}
        />

        <div
          id={mobilePanelId}
          aria-hidden={!mobileOpen}
          className={[
            'fixed inset-y-0 right-0 z-[140] flex w-[min(18rem,78vw)] flex-col overflow-hidden border-l border-slate-200 bg-white shadow-2xl transition-transform duration-300 ease-out dark:border-slate-800 dark:bg-slate-950 sm:w-[min(20rem,72vw)]',
            mobileOpen ? 'translate-x-0' : 'translate-x-full',
          ].join(' ')}
          role="dialog"
          aria-modal="true"
        >
          <div className="flex w-full shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-950">
            <span className="text-base font-extrabold tracking-tight text-brand-goldText dark:text-brand-goldBright">Menu</span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex items-center justify-center rounded-md p-2 text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-slate-200 dark:hover:bg-slate-900 dark:focus-visible:ring-offset-slate-950"
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? <FiSun className="h-5 w-5" aria-hidden="true" /> : <FiMoon className="h-5 w-5" aria-hidden="true" />}
              </button>

              {user ? (
                <NavLink
                  to="/admin"
                  className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-extrabold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-slate-200 dark:hover:bg-slate-900 dark:focus-visible:ring-offset-slate-950"
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </NavLink>
              ) : (
                <button
                  type="button"
                  onClick={() => setLoginOpen(true)}
                  className="inline-flex items-center justify-center rounded-md p-2 text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-slate-200 dark:hover:bg-slate-900 dark:focus-visible:ring-offset-slate-950"
                >
                  <FiLogIn className="h-5 w-5" aria-hidden="true" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center rounded-md p-2 text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-slate-200 dark:hover:bg-slate-900 dark:focus-visible:ring-offset-slate-950"
                aria-label="Close menu"
                title="Close menu"
              >
                <FiX className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-white px-4 py-6 dark:bg-slate-950">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  [
                    'flex w-full items-center justify-start rounded-lg px-4 py-3 text-base font-semibold transition-colors',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2',
                    isActive
                      ? 'gold-gradient-bg text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
                  ].join(' ')
                }
              >
                {link.label}
              </NavLink>
            ))}

            <div className="mt-2 border-t border-slate-200 pt-4 dark:border-slate-800">
              <NavLink
                to="/admissions"
                onClick={() => setMobileOpen(false)}
                className="gold-gradient-bg flex w-full items-center justify-center rounded-full px-8 py-4 text-base font-extrabold text-white shadow-lg transition-all hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
              >
                Enroll Now
              </NavLink>
            </div>
          </div>
        </div>
      </div>

      <AdminLoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  )
}
