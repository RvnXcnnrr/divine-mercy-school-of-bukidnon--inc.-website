import { useEffect, useMemo, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { FiMenu, FiMoon, FiSun, FiX } from 'react-icons/fi'
import { FaSchool } from 'react-icons/fa6'
import useTheme from '../hooks/useTheme.js'

const baseLinkClass =
  'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950'

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
            ? 'gold-gradient-bg text-white ring-1 ring-brand-gold/30 font-extrabold'
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
  const [mobileOpen, setMobileOpen] = useState(false)
  const [logoOk, setLogoOk] = useState(true)
  const { resolvedTheme, toggleTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const links = useMemo(
    () => [
      { to: '/', label: 'Home' },
      { to: '/about', label: 'About' },
      { to: '/academics', label: 'Academics' },
      { to: '/admissions', label: 'Admissions' },
      { to: '/news', label: 'News & Events' },
      { to: '/contact', label: 'Contact' },
    ],
    []
  )

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    if (mobileOpen) window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen])

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <NavLink
          to="/"
          className="inline-flex items-center gap-2 rounded-md px-2 py-2 text-sm font-extrabold tracking-tight text-brand-goldText focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-md bg-brand-navy ring-1 ring-brand-navy/20">
            {logoOk ? (
              <img
                src="/logo.png"
                alt="Divine Mercy School of Bukidnon, Inc. logo"
                className="h-full w-full object-contain bg-white dark:bg-slate-900"
                loading="eager"
                onError={() => setLogoOk(false)}
              />
            ) : (
              <FaSchool className="h-4 w-4 text-white" aria-hidden="true" />
            )}
          </span>
          <span className="hidden sm:inline">Divine Mercy School of Bukidnon, Inc.</span>
          <span className="sm:hidden">DMSB</span>
        </NavLink>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {links.map((l) => (
            <NavItem key={l.to} to={l.to}>
              {l.label}
            </NavItem>
          ))}

          <button
            type="button"
            onClick={toggleTheme}
            className="ml-1 inline-flex items-center justify-center rounded-md p-2 text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-slate-200 dark:hover:bg-slate-900 dark:focus-visible:ring-offset-slate-950"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <FiSun className="h-5 w-5" aria-hidden="true" /> : <FiMoon className="h-5 w-5" aria-hidden="true" />}
          </button>

          <NavLink
            to="/admissions"
            className={({ isActive }) =>
              [
                'gold-gradient-bg ml-2 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-extrabold text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2',
                isActive ? 'opacity-95 ring-1 ring-brand-navy/15' : 'hover:opacity-95',
              ].join(' ')
            }
          >
            Enroll Now
          </NavLink>
        </nav>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-slate-200 dark:hover:bg-slate-900 dark:focus-visible:ring-offset-slate-950 md:hidden"
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="md:hidden">
          <div
            className="fixed inset-0 z-40 bg-slate-900/40 dark:bg-slate-900/60"
            aria-hidden="true"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 right-0 top-16 z-50 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
            <nav className="mx-auto flex max-w-6xl flex-col items-start gap-1 px-4 py-3" aria-label="Mobile">
              <div className="flex self-stretch items-center justify-end">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="inline-flex items-center justify-center rounded-md p-2 text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-slate-200 dark:hover:bg-slate-900 dark:focus-visible:ring-offset-slate-950"
                  aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                  title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDark ? (
                    <FiSun className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <FiMoon className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              {links.map((l) => (
                <NavItem key={l.to} to={l.to} onClick={() => setMobileOpen(false)} className="w-full max-w-xs">
                  {l.label}
                </NavItem>
              ))}
              <NavLink
                to="/admissions"
                onClick={() => setMobileOpen(false)}
                className="gold-gradient-bg mt-1 inline-flex w-full max-w-xs items-center justify-center rounded-md px-4 py-2 text-sm font-extrabold text-white transition-colors hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
              >
                Enroll Now
              </NavLink>
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  )
}
