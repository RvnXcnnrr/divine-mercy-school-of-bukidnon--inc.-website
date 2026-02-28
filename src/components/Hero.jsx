import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { FiArrowDown, FiArrowRight, FiBookOpen, FiCalendar, FiShield, FiUsers } from 'react-icons/fi'
import { FaBus, FaSchool } from 'react-icons/fa6'
import useParallax from '../hooks/useParallax.js'

function useCountUp(target, duration = 1400, enabled = true) {
  const prefersReduced =
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const shouldAnimate = enabled && !prefersReduced
  const [value, setValue] = useState(shouldAnimate ? 0 : target)

  useEffect(() => {
    if (!shouldAnimate) return undefined

    let frame = null
    const start = performance.now()

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(target * eased))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => {
      if (frame !== null) cancelAnimationFrame(frame)
    }
  }, [target, duration, shouldAnimate])

  return shouldAnimate ? value : target
}

function parseStatValue(raw) {
  const value = String(raw || '').trim()
  const match = value.match(/^(\d+)(.*)$/)
  if (!match) return { numeric: null, suffix: '', raw: value || '--' }
  return { numeric: Number(match[1]), suffix: match[2] || '', raw: value }
}

function resolveStatIcon(name) {
  const normalized = String(name || '').trim().toLowerCase()
  if (normalized === 'school') return FaSchool
  if (normalized === 'shield') return FiShield
  if (normalized === 'users') return FiUsers
  return FiBookOpen
}

function FloatingStat({ card, className, style, animated }) {
  const parsed = parseStatValue(card?.value)
  const count = useCountUp(parsed.numeric || 0, 1400, animated && parsed.numeric != null)
  const display = parsed.numeric != null ? `${count}${parsed.suffix}` : parsed.raw
  const Icon = resolveStatIcon(card?.icon)

  return (
    <div className={className} style={style}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card?.label || 'Stat'}</p>
      <div className="mt-1 inline-flex items-center gap-2">
        <p className="text-2xl font-black text-brand-goldText">{display}</p>
        <span className="inline-flex items-center justify-center rounded-full bg-red-50 p-1.5 text-brand-goldText ring-1 ring-red-100">
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>
    </div>
  )
}

export default function Hero({ settings = null }) {
  const hero = settings?.homepage?.hero || null
  const ctaPrimaryText = hero?.ctaPrimaryText || 'Enroll Now'
  const ctaPrimaryLink = hero?.ctaPrimaryLink || '/admissions'
  const ctaSecondaryText = hero?.ctaSecondaryText || 'Book a Visit'
  const ctaSecondaryLink = hero?.ctaSecondaryLink || '/contact#visit'
  const title = hero?.title || 'Faith-centered learning. Disciplined formation. Service with purpose.'
  const subtitle =
    hero?.subtitle ||
    'A private Catholic school committed to Christian values, compassion, and academic excellence for every learner.'
  const focusLabel = hero?.focusLabel || 'Campus Focus'
  const focusText = hero?.focusText || 'Faith, Discipline, and Service in every classroom.'
  const focusImage = hero?.focusImage || ''
  const statCards = (hero?.statCards || []).filter((item) => item.isVisible !== false).slice(0, 3)
  const animatedCounters = hero?.enableAnimatedCounters !== false
  const enableParallax = hero?.enableParallax !== false

  const parallaxRef = useParallax({ factorY: 0.11, factorX: 0.05 })
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

  const effectiveMouse = enableParallax ? mouse : { x: 0, y: 0 }

  return (
    <section
      ref={parallaxRef}
      className="hero-animated relative overflow-hidden bg-gradient-to-br from-white via-rose-50/55 to-red-50/85"
      style={{
        backgroundPositionY: enableParallax ? 'calc(var(--parallax-bg, 0px))' : undefined,
        backgroundImage: hero?.backgroundImage
          ? `linear-gradient(120deg, rgba(255,255,255,0.93), rgba(255,255,255,0.85)), url(${hero.backgroundImage})`
          : undefined,
        backgroundSize: hero?.backgroundImage ? 'cover' : undefined,
        backgroundPosition: hero?.backgroundImage ? 'center' : undefined,
      }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="hero-sweep absolute inset-0" />
        <div className="hero-orb absolute -left-24 top-0 h-80 w-80 rounded-full bg-gradient-to-br from-red-200/55 via-rose-200/45 to-red-300/50 blur-3xl opacity-65" />
        <div className="hero-orb hero-orb--delay absolute -bottom-28 right-0 h-96 w-96 rounded-full bg-gradient-to-br from-red-300/50 via-rose-200/35 to-transparent blur-3xl opacity-65" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-14 px-4 pb-20 pt-16 lg:grid-cols-2 lg:items-center lg:py-24">
        <div className="relative z-10" data-reveal>
          <p className="page-kicker">Divine Mercy School of Bukidnon</p>
          <h1 className="page-h1 mt-4 max-w-xl">{title}</h1>
          <p className="page-body mt-6 max-w-2xl">{subtitle}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <NavLink to={ctaPrimaryLink} className="btn-primary btn-ripple">
              {ctaPrimaryText}
              <FiArrowRight className="h-4 w-4" aria-hidden="true" />
            </NavLink>
            <NavLink to={ctaSecondaryLink} className="btn-secondary">
              <FiCalendar className="h-4 w-4" aria-hidden="true" />
              {ctaSecondaryText}
            </NavLink>
          </div>

          <div className="mt-7 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-brand-goldText ring-1 ring-red-100 shadow-sm">
            <FiShield className="h-3.5 w-3.5" aria-hidden="true" />
            Trusted Catholic education with learner-centered support.
          </div>

          <div className="mt-6 surface-card p-5 hero-shimmer max-w-xl">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-brand-goldText ring-1 ring-red-100">
                <FaBus className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-extrabold text-brand-goldText">Transport Assistance Program</p>
                <p className="mt-1 text-sm text-slate-600">
                  Free pick-up and drop-off support for students facing distance or financial barriers.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          data-reveal
            className="relative"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const x = (e.clientX - rect.left) / rect.width - 0.5
              const y = (e.clientY - rect.top) / rect.height - 0.5
              if (enableParallax) setMouse({ x, y })
            }}
            onMouseLeave={() => setMouse({ x: 0, y: 0 })}
        >
          <div
            className="hero-parallax relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/80 p-2 shadow-lg backdrop-blur"
            style={{
              transform: `translate3d(${effectiveMouse.x * 10}px, ${effectiveMouse.y * 10}px, 0)`,
            }}
          >
            <div className="relative aspect-[5/4] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-red-100 via-white to-rose-100">
              {focusImage ? (
                <>
                  <img src={focusImage} alt={focusText || 'Campus focus'} className="h-full w-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" aria-hidden="true" />
                </>
              ) : (
                <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_20%_25%,rgba(185,28,28,0.16),transparent_36%),radial-gradient(circle_at_80%_8%,rgba(251,113,133,0.2),transparent_26%)]" aria-hidden="true" />
              )}
              <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
                <div>
                  <p className={['text-xs font-semibold uppercase tracking-[0.16em]', focusImage ? 'text-white/85' : 'text-slate-500'].join(' ')}>{focusLabel}</p>
                  <p className={['mt-2 text-lg font-bold', focusImage ? 'text-white' : 'text-brand-ink'].join(' ')}>{focusText}</p>
                </div>
              </div>
            </div>
          </div>

          {statCards[0] ? (
            <FloatingStat
              card={statCards[0]}
              animated={animatedCounters}
              className="hero-float absolute -left-5 top-6 hidden rounded-2xl border border-red-100 bg-white/95 px-4 py-3 shadow-md sm:block"
              style={{ transform: `translate3d(${effectiveMouse.x * -14}px, ${effectiveMouse.y * -12}px, 0)` }}
            />
          ) : null}
          {statCards[1] ? (
            <FloatingStat
              card={statCards[1]}
              animated={animatedCounters}
              className="hero-float hero-float--2 absolute -right-4 top-20 rounded-2xl border border-red-100 bg-white/95 px-4 py-3 shadow-md"
              style={{ transform: `translate3d(${effectiveMouse.x * 16}px, ${effectiveMouse.y * 12}px, 0)` }}
            />
          ) : null}
          {statCards[2] ? (
            <FloatingStat
              card={statCards[2]}
              animated={animatedCounters}
              className="hero-float hero-float--3 absolute -bottom-4 right-12 rounded-2xl border border-red-100 bg-white/95 px-4 py-3 shadow-md"
              style={{ transform: `translate3d(${effectiveMouse.x * 11}px, ${effectiveMouse.y * -11}px, 0)` }}
            />
          ) : null}
        </div>
      </div>

      <a
        href="#home-trust"
        className="hero-scroll-indicator absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 lg:inline-flex"
      >
        Scroll to explore
        <FiArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
      </a>
    </section>
  )
}
