import { NavLink } from 'react-router-dom'
import { FiArrowRight, FiMail, FiUserPlus } from 'react-icons/fi'
import { FaBus, FaChurch, FaHandHoldingHeart, FaUserGraduate } from 'react-icons/fa6'
import useParallax from '../hooks/useParallax.js'

export default function Hero() {
  const parallaxRef = useParallax({ factorY: 0.12, factorX: 0.06 })

  return (
    <section
      ref={parallaxRef}
      className="hero-animated hero-light relative overflow-hidden bg-brand-sky dark:bg-slate-950"
      style={{ backgroundPositionY: 'calc(var(--parallax-bg, 0px))' }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="hero-sweep absolute inset-0" />
        <div className="hero-orb absolute -left-28 -top-28 h-80 w-80 rounded-full bg-gradient-to-br from-brand-goldPale/60 via-brand-goldBright/45 to-brand-gold/45 blur-3xl opacity-40" />
        <div className="hero-orb hero-orb--delay absolute -bottom-28 -right-28 h-80 w-80 rounded-full bg-brand-blue/60 blur-3xl opacity-20" />

        <div
          className="absolute left-[6%] top-8 h-32 w-32 rounded-full bg-gradient-to-br from-white/70 to-brand-gold/35 blur-2xl"
          style={{ transform: 'translate3d(calc(var(--parallax-x, 0px) * 0.25), calc(var(--parallax-y, 0px) * 0.32), 0)' }}
          aria-hidden="true"
        />
        <div
          className="absolute right-[8%] top-14 h-28 w-44 rounded-full bg-gradient-to-br from-brand-blue/35 to-brand-goldPale/25 blur-2xl"
          style={{ transform: 'translate3d(calc(var(--parallax-x, 0px) * -0.2), calc(var(--parallax-y, 0px) * 0.24), 0)' }}
          aria-hidden="true"
        />
        <div
          className="absolute left-[18%] bottom-6 h-24 w-24 rounded-full bg-white/25 blur-xl"
          style={{ transform: 'translate3d(calc(var(--parallax-x, 0px) * 0.18), calc(var(--parallax-y, 0px) * -0.18), 0)' }}
          aria-hidden="true"
        />
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-2 lg:items-center lg:py-20">
        <div data-reveal>
          <p className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-800">
            Divine Mercy School of Bukidnon, Inc.
          </p>
          <h1 className="mt-4 text-balance text-4xl font-black leading-tight tracking-tight text-brand-navy dark:text-slate-100 sm:text-5xl">
            Faith-centered learning, disciplined formation, and service.
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-base text-slate-700 dark:text-slate-300 sm:text-lg">
            A private Catholic school committed to Christian values, compassion, and moral formation—supporting every learner with dignity and hope.
          </p>

          <div className="mt-5 rounded-xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800" data-reveal>
            <p className="text-sm font-extrabold text-brand-goldText">Free Student Transport Program</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              FREE pick-up and drop-off support for learners who live far, cannot afford daily transport, or are at risk of dropping out due to distance or financial hardship.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <NavLink
              to="/admissions"
              className="gold-gradient-bg inline-flex w-full items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-extrabold text-white transition-all hover:-translate-y-0.5 hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:w-auto"
            >
              <FiUserPlus className="h-4 w-4" aria-hidden="true" />
              Enroll Now
              <FiArrowRight className="h-4 w-4" aria-hidden="true" />
            </NavLink>
            <NavLink
              to="/contact"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-extrabold text-brand-navy ring-1 ring-slate-200 transition-all hover:-translate-y-0.5 hover:bg-brand-sky focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800 dark:hover:bg-slate-800 sm:w-auto"
            >
              <FiMail className="h-4 w-4" aria-hidden="true" />
              Contact Us
            </NavLink>
          </div>
        </div>

        <div className="lg:pl-10" data-reveal>
          <div
            className="hero-parallax hero-shimmer relative rounded-2xl bg-white p-6 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const x = (e.clientX - rect.left) / rect.width - 0.5
              const y = (e.clientY - rect.top) / rect.height - 0.5
              e.currentTarget.style.setProperty('--hx', String(x))
              e.currentTarget.style.setProperty('--hy', String(y))
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.setProperty('--hx', '0')
              e.currentTarget.style.setProperty('--hy', '0')
            }}
          >
            <p className="text-sm font-extrabold text-brand-navy dark:text-slate-100">Quick Overview</p>
            <dl className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-brand-sky p-4 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
                <dt className="text-xs font-semibold text-slate-600 dark:text-slate-300">Departments</dt>
                <dd className="mt-1 text-2xl font-black text-brand-navy dark:text-slate-100">2</dd>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Junior High • Senior High</p>
              </div>
              <div className="rounded-xl bg-brand-sky p-4 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
                <dt className="text-xs font-semibold text-slate-600 dark:text-slate-300">Learning</dt>
                <dd className="mt-1 text-2xl font-black text-brand-navy dark:text-slate-100">Modern</dd>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Skills + character</p>
              </div>
              <div className="rounded-xl bg-brand-sky p-4 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
                <dt className="text-xs font-semibold text-slate-600 dark:text-slate-300">Values</dt>
                <dd className="mt-1 text-2xl font-black text-brand-navy dark:text-slate-100">Faith</dd>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Compassion • service</p>
              </div>
              <div className="rounded-xl bg-brand-sky p-4 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
                <dt className="text-xs font-semibold text-slate-600 dark:text-slate-300">Support</dt>
                <dd className="mt-1 text-2xl font-black text-brand-navy dark:text-slate-100">Transport</dd>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Free daily commute</p>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  )
}
