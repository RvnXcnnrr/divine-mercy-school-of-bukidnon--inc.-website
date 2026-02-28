import { createElement, useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  FiBook,
  FiBookOpen,
  FiCalendar,
  FiClipboard,
  FiGlobe,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiGrid,
  FiHome,
  FiImage,
  FiInfo,
  FiLogOut,
  FiMenu,
  FiMessageSquare,
  FiMonitor,
  FiPenTool,
  FiPhoneCall,
  FiPlusCircle,
  FiSettings,
  FiUsers,
  FiX,
} from 'react-icons/fi'
import { useAuth } from '../../providers/AppProviders.jsx'

const NAV_SECTIONS = [
  {
    title: 'Content',
    items: [
      { to: '/admin', label: 'Dashboard', icon: FiGrid, end: true },
      { to: '/admin/posts', label: 'Posts', icon: FiPenTool, end: true },
      { to: '/admin/posts/new', label: 'New Post', icon: FiPlusCircle, end: true },
    ],
  },
  {
    title: 'Engagement',
    items: [
      { to: '/admin/testimonials', label: 'Testimonials', icon: FiMessageSquare },
      { to: '/admin/settings', label: 'Subscribers', icon: FiUsers },
    ],
  },
  {
    title: 'Settings',
    items: [{ to: '/admin/content', label: 'Site Content (Legacy)', icon: FiBookOpen }],
  },
  {
    title: 'Site Management',
    collapsible: true,
    items: [
      { to: '/admin/site/homepage', label: 'Homepage', icon: FiHome },
      { to: '/admin/site/about', label: 'About Page', icon: FiInfo },
      { to: '/admin/site/academics', label: 'Academics Page', icon: FiBook },
      { to: '/admin/site/admissions', label: 'Admissions Page', icon: FiClipboard },
      { to: '/admin/site/events', label: 'Events Settings', icon: FiCalendar },
      { to: '/admin/site/gallery', label: 'Gallery Settings', icon: FiImage },
      { to: '/admin/site/contact', label: 'Contact Page', icon: FiPhoneCall },
      { to: '/admin/site/footer', label: 'Footer', icon: FiMonitor },
      { to: '/admin/site/global', label: 'Global Settings', icon: FiGlobe },
    ],
  },
]

const PAGE_TITLES = {
  '/admin': 'Dashboard',
  '/admin/posts': 'Posts',
  '/admin/posts/new': 'New Post',
  '/admin/testimonials': 'Testimonials',
  '/admin/settings': 'Subscribers',
  '/admin/content': 'Site Content',
  '/admin/site': 'Site Management',
}

const SITE_PAGE_TITLES = {
  homepage: 'Homepage Manager',
  about: 'About Page Manager',
  academics: 'Academics Page Manager',
  admissions: 'Admissions Page Manager',
  events: 'Events Settings',
  gallery: 'Gallery Settings',
  contact: 'Contact Page Manager',
  footer: 'Footer Manager',
  global: 'Global Settings',
}

function initialSidebarCollapsed() {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem('admin-sidebar-collapsed') === 'true'
}

function initialGroupState() {
  if (typeof window === 'undefined') return { 'Site Management': true }
  try {
    const raw = window.localStorage.getItem('admin-nav-open-groups')
    if (!raw) return { 'Site Management': true }
    return JSON.parse(raw)
  } catch {
    return { 'Site Management': true }
  }
}

export default function AdminLayout() {
  const { pathname } = useLocation()
  const { signOut } = useAuth()
  const [showConfirm, setShowConfirm] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(initialSidebarCollapsed)
  const [openGroups, setOpenGroups] = useState(initialGroupState)
  const timerRef = useRef(null)

  const pageTitle = useMemo(() => {
    if (pathname.startsWith('/admin/posts/') && pathname !== '/admin/posts/new') return 'Edit Post'
    if (pathname.startsWith('/admin/site/')) {
      const section = pathname.replace('/admin/site/', '').split('/')[0]
      return SITE_PAGE_TITLES[section] || 'Site Management'
    }
    return PAGE_TITLES[pathname] || 'Admin Panel'
  }, [pathname])

  useEffect(() => {
    const INACTIVITY_LIMIT = 5 * 60 * 1000
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        setShowConfirm(false)
        signOut()
      }, INACTIVITY_LIMIT)
    }

    resetTimer()
    events.forEach((eventName) => window.addEventListener(eventName, resetTimer, { passive: true }))

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      events.forEach((eventName) => window.removeEventListener(eventName, resetTimer))
    }
  }, [signOut])

  useEffect(() => {
    document.documentElement.classList.remove('dark')
    window.localStorage.removeItem('admin-dark-mode')
  }, [])

  useEffect(() => {
    window.localStorage.setItem('admin-sidebar-collapsed', String(isCollapsed))
  }, [isCollapsed])

  useEffect(() => {
    window.localStorage.setItem('admin-nav-open-groups', JSON.stringify(openGroups))
  }, [openGroups])

  function requestSignOut() {
    setShowConfirm(true)
  }

  function confirmSignOut() {
    setShowConfirm(false)
    signOut()
  }

  function closeMobileMenu() {
    setMobileOpen(false)
  }

  function toggleGroup(groupName) {
    setOpenGroups((prev) => ({
      ...prev,
      [groupName]: !(prev[groupName] ?? true),
    }))
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
          aria-hidden="true"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <div className="flex min-h-screen">
        <aside
          className={[
            'fixed inset-y-0 left-0 z-50 flex h-screen flex-col border-r border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur transition-all duration-200 md:sticky md:translate-x-0 md:shadow-none',
            isCollapsed ? 'w-[88px]' : 'w-[280px]',
            mobileOpen ? 'translate-x-0' : '-translate-x-full',
          ].join(' ')}
        >
          <div className="mb-5 flex items-center justify-between gap-2 px-1">
            <div className={isCollapsed ? 'hidden md:block' : 'min-w-0'}>
              {!isCollapsed ? (
                <>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-goldText">Divine Mercy School</p>
                  <p className="text-sm font-semibold text-slate-700">Admin Control Panel</p>
                </>
              ) : (
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-brand-goldText">
                  <FiSettings className="h-5 w-5" aria-hidden="true" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="admin-button-secondary px-2 md:hidden"
                aria-label="Close menu"
              >
                <FiX className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setIsCollapsed((prev) => !prev)}
                className="admin-button-secondary hidden px-2 md:inline-flex"
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? <FiChevronRight className="h-4 w-4" /> : <FiChevronLeft className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <nav className="flex-1 space-y-5 overflow-y-auto pr-1" aria-label="Admin navigation">
            {NAV_SECTIONS.map((section) => (
              <section key={section.title}>
                {section.collapsible && !isCollapsed ? (
                  <button
                    type="button"
                    onClick={() => toggleGroup(section.title)}
                    className="mb-2 flex w-full items-center justify-between rounded-lg px-2 py-1 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 hover:bg-slate-100"
                  >
                    <span>{section.title}</span>
                    <FiChevronDown
                      className={[
                        'h-3.5 w-3.5 transition-transform',
                        openGroups[section.title] === false ? '-rotate-90' : 'rotate-0',
                      ].join(' ')}
                    />
                  </button>
                ) : (
                  <p
                    className={[
                      'mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400',
                      isCollapsed ? 'hidden' : 'block',
                    ].join(' ')}
                  >
                    {section.title}
                  </p>
                )}

                {isCollapsed || !section.collapsible || openGroups[section.title] !== false ? (
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <NavItem
                        key={item.to}
                        to={item.to}
                        label={item.label}
                        icon={item.icon}
                        end={item.end}
                        collapsed={isCollapsed}
                        onNavigate={closeMobileMenu}
                      />
                    ))}
                  </div>
                ) : null}
              </section>
            ))}
          </nav>

          <div className="mt-4 space-y-2 border-t border-slate-200 pt-4">
            <a href="/" className={isCollapsed ? 'admin-button-secondary w-full px-0' : 'admin-button-secondary w-full'}>
              {isCollapsed ? 'Site' : 'View Site'}
            </a>
            <button
              type="button"
              onClick={requestSignOut}
              className={isCollapsed ? 'admin-button-danger w-full px-0' : 'admin-button-danger w-full'}
            >
              <FiLogOut className="h-4 w-4" aria-hidden="true" />
              {!isCollapsed ? 'Sign Out' : null}
            </button>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
            <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between gap-3 px-4 md:px-6">
              <div className="flex min-w-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  className="admin-button-secondary px-2 md:hidden"
                  aria-label="Open menu"
                >
                  <FiMenu className="h-4 w-4" aria-hidden="true" />
                </button>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{pageTitle}</p>
                  <p className="truncate text-xs text-slate-500">School Website CMS</p>
                </div>
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-[1600px] flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>

      {showConfirm ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 px-4 backdrop-blur" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Sign out?</h2>
            <p className="mt-2 text-sm text-slate-600">You will need to log in again to continue managing content.</p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button type="button" onClick={() => setShowConfirm(false)} className="admin-button-secondary">
                Cancel
              </button>
              <button type="button" onClick={confirmSignOut} className="admin-button-danger">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function NavItem({ to, label, icon: Icon, end, collapsed, onNavigate }) {
  const { pathname } = useLocation()

  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      className={({ isActive }) => {
        const postListActive =
          to === '/admin/posts' &&
          (pathname === '/admin/posts' || (pathname.startsWith('/admin/posts/') && pathname !== '/admin/posts/new'))

        const active = postListActive || isActive

        return [
          'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition duration-200',
          collapsed ? 'justify-center' : '',
          active
            ? 'bg-brand-goldText text-white shadow-sm'
            : 'text-slate-700 hover:bg-rose-50 hover:text-brand-goldText',
        ].join(' ')
      }}
    >
      {createElement(Icon, { className: 'h-4 w-4 shrink-0', 'aria-hidden': true })}
      {!collapsed ? <span className="truncate">{label}</span> : null}
    </NavLink>
  )
}
