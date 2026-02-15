import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { FiClock, FiDownload, FiFileText, FiList, FiMail, FiPhone, FiUserPlus } from 'react-icons/fi'
import { FaBus, FaHandHoldingHeart, FaMapLocationDot, FaShieldHeart } from 'react-icons/fa6'
import usePageMeta from '../hooks/usePageMeta.js'
import { admissions } from '../data/siteContent.js'
import { fetchSiteContent } from '../services/siteInfoService.js'
import { extraContent as extraFallback, contactInfo as contactFallback } from '../data/siteContent.js'

function Step({ number, title, description }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800" data-reveal>
      <div className="flex items-start gap-4">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-goldText text-sm font-black text-white">
          {number}
        </div>
        <div>
          <h3 className="text-base font-extrabold text-brand-goldText">{title}</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{description}</p>
        </div>
      </div>
    </div>
  )
}

export default function Admissions() {
  usePageMeta({
    title: 'Admissions',
    description:
      'Admissions at Divine Mercy School of Bukidnon, Inc.: process steps, requirements, and downloadable forms.',
  })

  const [steps, setSteps] = useState(admissions.steps)
  const [requirements, setRequirements] = useState(admissions.requirements)
  const [forms, setForms] = useState(extraFallback.admissions_forms)
  const [contact, setContact] = useState(contactFallback)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data } = await fetchSiteContent()
        if (!mounted || !data) return
        const extra = data.extra_content || extraFallback
        setSteps(extra.admissions_steps || admissions.steps)
        setRequirements(extra.admissions_requirements || admissions.requirements)
        setForms(extra.admissions_forms || extraFallback.admissions_forms)
        setContact({
          contact_email: data.contact_email || contactFallback.contact_email,
          contact_phone: data.contact_phone || contactFallback.contact_phone,
        })
      } catch (err) {
        console.warn('[Admissions] Using fallback content', err)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div>
      <section>
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between" data-reveal>
            <div className="max-w-2xl">
              <h1 className="gold-gradient-text text-3xl font-black tracking-tight sm:text-4xl">Admissions</h1>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                Here’s a clear guide to help you complete enrollment smoothly.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <a
                href="/forms/Admissions-Form.pdf"
                className="gold-gradient-bg inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-extrabold text-white transition-opacity hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
              >
                <FiDownload className="h-4 w-4" aria-hidden="true" />
                Download Enroll Form
              </a>
              <NavLink
                to="/contact#visit"
                className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-extrabold text-brand-goldText ring-1 ring-slate-200 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 dark:bg-slate-900 dark:ring-slate-800 dark:hover:bg-slate-800"
              >
                Book a Visit
              </NavLink>
            </div>
          </div>
        </div>
      </section>

      <div className="w-full overflow-hidden bg-brand-sky leading-none dark:bg-slate-950" aria-hidden="true">
        <svg
          className="block h-8 w-full fill-current text-white dark:text-slate-900 sm:h-10"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          focusable="false"
        >
          <path d="M0,32 C240,80 480,80 720,40 C960,0 1200,0 1440,32 L1440,80 L0,80 Z" />
        </svg>
      </div>

      <section className="bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div data-reveal>
            <h2 className="gold-gradient-text text-2xl font-black tracking-tight">Admission Process</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Follow these steps to enroll.</p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {steps.map((s, idx) => (
              <Step key={`${s.title}-${idx}`} number={idx + 1} title={s.title} description={s.description} />
            ))}

            <div className="rounded-xl bg-brand-sky p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800" data-reveal>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-blue">Need help?</p>
              <h3 className="mt-2 text-base font-extrabold text-brand-goldText">Admissions contact</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-200">
                <li className="flex items-center gap-2">
                  <FiPhone className="h-4 w-4 text-brand-blue" aria-hidden="true" />
                  <a className="hover:text-brand-goldText" href={`tel:${contact.contact_phone || ''}`}>
                    {contact.contact_phone || contactFallback.contact_phone}
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <FiMail className="h-4 w-4 text-brand-blue" aria-hidden="true" />
                  <a className="hover:text-brand-goldText" href={`mailto:${contact.contact_email || ''}`}>
                    {contact.contact_email || contactFallback.contact_email}
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <FiUserPlus className="h-4 w-4 text-brand-blue" aria-hidden="true" />
                  <a className="hover:text-brand-goldText" href="https://m.me/dmsb">Message us on Messenger</a>
                </li>
                <li className="flex items-center gap-2">
                  <FiClock className="h-4 w-4 text-brand-blue" aria-hidden="true" />
                  <span>Mon–Fri, 8:00 AM – 5:00 PM</span>
                </li>
              </ul>
              <div className="mt-4 space-y-2">
                <a
                  href="/forms/Admissions-Form.pdf"
                  className="gold-gradient-bg inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-extrabold text-white transition-opacity hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
                >
                  <FiDownload className="h-4 w-4" aria-hidden="true" />
                  Open enrollment form
                </a>
                <NavLink
                  to="/contact#visit"
                  className="inline-flex w-full items-center justify-center rounded-md bg-white px-4 py-3 text-sm font-extrabold text-brand-goldText ring-1 ring-slate-200 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 dark:bg-slate-950 dark:ring-slate-700 dark:hover:bg-slate-900"
                >
                  Schedule a visit
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="w-full overflow-hidden bg-white leading-none dark:bg-slate-900" aria-hidden="true">
        <svg
          className="block h-8 w-full fill-current text-brand-sky dark:text-slate-950 sm:h-10"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          focusable="false"
        >
          <path d="M0,32 C240,80 480,80 720,40 C960,0 1200,0 1440,32 L1440,80 L0,80 Z" />
        </svg>
      </div>

      <section className="bg-brand-sky dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="rounded-2xl bg-slate-50 p-8 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800" data-reveal>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 rounded-full bg-brand-sky px-3 py-1 text-xs font-semibold text-brand-goldText ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
                <FaBus className="h-3.5 w-3.5" aria-hidden="true" />
                Student Support
              </p>
              <h2 className="gold-gradient-text mt-3 text-2xl font-black tracking-tight">Transportation Assistance Program</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                The school actively supports underprivileged learners by offering FREE pick-up and drop-off
                transportation for students who live far, cannot afford daily transport, or are at risk of dropping out
                due to distance or financial hardship.
              </p>
            </div>
            <NavLink
              to="/contact"
              className="inline-flex w-full items-center justify-center rounded-md bg-brand-goldText px-5 py-3 text-sm font-extrabold text-white transition-opacity hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 sm:w-auto"
            >
              Ask about eligibility
            </NavLink>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-brand-sky text-brand-navy ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700">
                <FaMapLocationDot className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-base font-extrabold text-brand-goldText">Distance Support</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Free transport support for learners living far from campus.</p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-brand-sky text-brand-navy ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700">
                <FaHandHoldingHeart className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-base font-extrabold text-brand-goldText">Financial Assistance</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Helping families who cannot afford daily transportation.</p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-brand-sky text-brand-navy ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700">
                <FaShieldHeart className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-base font-extrabold text-brand-goldText">Safe Daily Commute</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">A dependable commute that supports attendance and peace of mind.</p>
            </div>
          </div>
          </div>
        </div>
      </section>

      <div className="w-full overflow-hidden bg-brand-sky leading-none dark:bg-slate-950" aria-hidden="true">
        <svg
          className="block h-8 w-full fill-current text-white dark:text-slate-900 sm:h-10"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          focusable="false"
        >
          <path d="M0,32 C240,80 480,80 720,40 C960,0 1200,0 1440,32 L1440,80 L0,80 Z" />
        </svg>
      </div>

      <section className="bg-white dark:bg-slate-900">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-2 lg:items-start">
          <div data-reveal>
            <h2 className="gold-gradient-text text-2xl font-black tracking-tight">Requirements</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Requirements may vary by grade level. Confirm with the admissions office for the latest list.
            </p>
            <ul className="mt-5 space-y-3 text-sm text-slate-700 dark:text-slate-200">
              {requirements.map((r, idx) => (
                <li key={`${r}-${idx}`} className="flex gap-2">
                  <FiList className="mt-0.5 h-4 w-4 text-brand-blue" aria-hidden="true" />
                  {r}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800" data-reveal>
            <div className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-brand-sky text-brand-navy ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700">
                <FiFileText className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-base font-extrabold text-brand-goldText">Downloadable Forms</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Download and print the forms below. (You can replace these files with your official school forms.)
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {forms.map((form, idx) => (
                <a
                  key={`${form.label}-${idx}`}
                  className="inline-flex w-full items-center justify-between rounded-lg bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 transition-colors hover:bg-brand-sky focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800 dark:hover:bg-slate-800"
                  href={form.url}
                  download
                >
                  <span className="inline-flex items-center gap-2">
                    <FiDownload className="h-4 w-4 text-brand-blue" aria-hidden="true" />
                    {form.label}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Download</span>
                </a>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <NavLink
                to="/contact"
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand-goldText px-5 py-3 text-sm font-extrabold text-white transition-opacity hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 sm:w-auto"
              >
                <FiUserPlus className="h-4 w-4" aria-hidden="true" />
                Enrollment Assistance
              </NavLink>
              <NavLink
                to="/"
                className="inline-flex w-full items-center justify-center rounded-md bg-white px-5 py-3 text-sm font-extrabold text-brand-goldText ring-1 ring-slate-200 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 dark:bg-slate-900 dark:ring-slate-800 dark:hover:bg-slate-800 sm:w-auto"
              >
                Back to Home
              </NavLink>
            </div>
          </div>
        </div>
      </section>

      <div className="w-full overflow-hidden bg-white leading-none dark:bg-slate-900" aria-hidden="true">
        <svg
          className="block h-8 w-full fill-current text-brand-goldText dark:text-slate-950 sm:h-10"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          focusable="false"
        >
          <path d="M0,32 C240,80 480,80 720,40 C960,0 1200,0 1440,32 L1440,80 L0,80 Z" />
        </svg>
      </div>

      <section className="bg-brand-goldText">
        <div className="mx-auto max-w-6xl px-4 py-14" data-reveal>
          <h2 className="text-2xl font-black tracking-tight text-white">Enrollment CTA</h2>
          <p className="mt-2 text-sm text-white/80">
            Start your enrollment journey today—if you need support, we’re ready to help.
          </p>
          <div className="mt-6">
            <NavLink
              to="/contact"
              className="gold-gradient-bg inline-flex w-full items-center justify-center rounded-md px-5 py-3 text-sm font-extrabold text-white transition-opacity hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-goldText sm:w-auto"
            >
              Contact Admissions
            </NavLink>
          </div>
        </div>
      </section>

      <div className="w-full overflow-hidden bg-brand-goldText leading-none" aria-hidden="true">
        <svg
          className="block h-8 w-full fill-current text-brand-sky dark:text-slate-950 sm:h-10"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          focusable="false"
        >
          <path d="M0,32 C240,80 480,80 720,40 C960,0 1200,0 1440,32 L1440,80 L0,80 Z" />
        </svg>
      </div>
    </div>
  )
}
