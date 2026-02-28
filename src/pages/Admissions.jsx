import { useEffect, useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiFileText,
  FiHelpCircle,
  FiMail,
  FiPhone,
  FiUserPlus,
} from 'react-icons/fi'
import { FaBus, FaHandHoldingHeart, FaMapLocationDot, FaShieldHeart } from 'react-icons/fa6'
import usePageMeta from '../hooks/usePageMeta.js'
import { admissions } from '../data/siteContent.js'
import { fetchSiteContent } from '../services/siteInfoService.js'
import { extraContent as extraFallback, contactInfo as contactFallback } from '../data/siteContent.js'

const faqItems = [
  {
    q: 'Can we submit requirements in parts?',
    a: 'Yes. Submit available documents first, then coordinate with admissions for pending items.',
  },
  {
    q: 'Do you accept transferees?',
    a: 'Yes. Bring your latest report card and transfer credentials for evaluation.',
  },
  {
    q: 'How do we ask about transport support?',
    a: 'Contact the admissions office to check route availability and eligibility requirements.',
  },
]

export default function Admissions() {
  usePageMeta({
    title: 'Admissions',
    description: 'Admissions at Divine Mercy School of Bukidnon: steps, requirements, and downloadable forms.',
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
        console.warn('[Admissions] using fallback content', err)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  const progressSteps = useMemo(() => (steps.length ? steps : [
    { title: 'Inquiry', description: 'Contact admissions for orientation and schedule.' },
    { title: 'Requirements', description: 'Submit required documents for validation.' },
    { title: 'Assessment', description: 'Learner evaluation and interview if needed.' },
    { title: 'Enrollment', description: 'Finalize payment and complete registration.' },
  ]), [steps])

  return (
    <div className="bg-brand-sky">
      <section className="section-space bg-gradient-to-br from-white via-red-50/35 to-rose-50/55">
        <div className="mx-auto max-w-7xl px-4" data-reveal>
          <p className="page-kicker">Admissions Office</p>
          <h1 className="page-h1 mt-4">Admissions</h1>
          <p className="page-body mt-6 max-w-2xl">A guided enrollment path with clear timelines, required documents, and support options.</p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a href="/forms/Admissions-Form.pdf" className="btn-primary btn-ripple">
              <FiDownload className="h-4 w-4" aria-hidden="true" />
              Download Enrollment Form
            </a>
            <NavLink to="/contact#visit" className="btn-secondary">
              Book a Visit
            </NavLink>
          </div>
        </div>
      </section>

      <section className="section-space bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="surface-card p-6 sm:p-8" data-reveal>
            <p className="page-kicker">Step-by-Step Progress</p>
            <h2 className="page-h2 mt-3">Enrollment Process Timeline</h2>

            <ol className="mt-8 grid gap-4 lg:grid-cols-4">
              {progressSteps.slice(0, 4).map((step, idx) => (
                <li key={`${step.title}-${idx}`} className="relative rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-goldText text-xs font-extrabold text-white">
                    {idx + 1}
                  </span>
                  <h3 className="mt-3 text-lg font-bold text-brand-ink">{step.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{step.description}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div data-reveal>
              <h2 className="page-h3">Detailed Admission Steps</h2>
              <div className="mt-6 space-y-5">
                {progressSteps.map((step, idx) => (
                  <article key={`${step.title}-${idx}`} className="relative pl-14">
                    <span className="absolute left-0 top-0 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-sm font-extrabold text-brand-goldText ring-1 ring-red-100">
                      {idx + 1}
                    </span>
                    {idx < progressSteps.length - 1 ? (
                      <span className="absolute left-5 top-10 h-[calc(100%-0.5rem)] w-px bg-slate-200" aria-hidden="true" />
                    ) : null}
                    <div className="surface-card p-5">
                      <h3 className="text-2xl font-bold text-brand-ink">{step.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{step.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="space-y-5" data-reveal>
              <div className="surface-card p-5">
                <p className="page-kicker">Admissions Help</p>
                <h3 className="page-h3 mt-2">Need assistance?</h3>
                <ul className="mt-4 space-y-3 text-sm text-slate-700">
                  <li className="flex items-center gap-2">
                    <FiPhone className="h-4 w-4 text-brand-goldText" aria-hidden="true" />
                    <a className="hover:text-brand-goldText" href={`tel:${contact.contact_phone || ''}`}>
                      {contact.contact_phone || contactFallback.contact_phone}
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <FiMail className="h-4 w-4 text-brand-goldText" aria-hidden="true" />
                    <a className="hover:text-brand-goldText" href={`mailto:${contact.contact_email || ''}`}>
                      {contact.contact_email || contactFallback.contact_email}
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <FiClock className="h-4 w-4 text-brand-goldText" aria-hidden="true" />
                    <span>Mon-Fri, 8:00 AM - 5:00 PM</span>
                  </li>
                </ul>

                <div className="mt-4 grid gap-2">
                  <NavLink to="/contact#visit" className="btn-primary btn-ripple w-full rounded-xl">
                    Schedule Visit
                  </NavLink>
                  <a href="https://m.me/dmsb" className="btn-secondary w-full rounded-xl">
                    Message on Messenger
                  </a>
                </div>
              </div>

              <div className="surface-card p-5">
                <p className="page-kicker">Requirements Checklist</p>
                <ul className="mt-3 space-y-2">
                  {requirements.length ? (
                    requirements.map((requirement, idx) => (
                      <li key={`${requirement}-${idx}`} className="flex items-start gap-2 text-sm text-slate-700">
                        <FiCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand-goldText" aria-hidden="true" />
                        {requirement}
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-slate-600">Requirements will be posted by the admissions office.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-space bg-brand-sky">
        <div className="mx-auto max-w-7xl px-4">
          <div className="surface-card p-6 sm:p-8" data-reveal>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-2xl">
                <p className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-brand-goldText">
                  <FaBus className="h-3.5 w-3.5" aria-hidden="true" />
                  Transportation Assistance
                </p>
                <h2 className="page-h2 mt-3">Support for distance and financial barriers</h2>
                <p className="page-body mt-4">
                  Free pick-up and drop-off support helps learners stay enrolled, especially those who live far from campus.
                </p>
              </div>
              <NavLink to="/contact" className="btn-primary btn-ripple">
                Ask about eligibility
              </NavLink>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="inline-flex items-center gap-2 text-sm font-bold text-brand-goldText">
                  <FaMapLocationDot className="h-4 w-4" aria-hidden="true" />
                  Distance Support
                </p>
                <p className="mt-1 text-sm text-slate-600">For learners who live far from campus.</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="inline-flex items-center gap-2 text-sm font-bold text-brand-goldText">
                  <FaHandHoldingHeart className="h-4 w-4" aria-hidden="true" />
                  Financial Relief
                </p>
                <p className="mt-1 text-sm text-slate-600">For families with transport affordability concerns.</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="inline-flex items-center gap-2 text-sm font-bold text-brand-goldText">
                  <FaShieldHeart className="h-4 w-4" aria-hidden="true" />
                  Safe Commute
                </p>
                <p className="mt-1 text-sm text-slate-600">Reliable daily travel for better attendance.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-space bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="surface-card p-6" data-reveal>
              <div className="flex items-start gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-brand-goldText ring-1 ring-red-100">
                  <FiFileText className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="page-h3">Downloadable Forms</h3>
                  <p className="page-muted mt-2">Use official forms from the admissions office.</p>
                </div>
              </div>
              <div className="mt-5 grid gap-3">
                {forms.length ? (
                  forms.map((form, idx) => (
                    <a
                      key={`${form.label}-${idx}`}
                      className="inline-flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 transition duration-200 hover:bg-white"
                      href={form.url}
                      download
                    >
                      <span className="inline-flex items-center gap-2">
                        <FiDownload className="h-4 w-4 text-brand-goldText" aria-hidden="true" />
                        {form.label}
                      </span>
                      <span className="text-xs text-slate-500">Download</span>
                    </a>
                  ))
                ) : (
                  <p className="text-sm text-slate-600">No forms uploaded yet.</p>
                )}
              </div>
            </div>

            <div className="surface-card p-6" data-reveal>
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                <FiHelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
                Admissions FAQ
              </p>
              <div className="mt-4 space-y-3">
                {faqItems.map((item) => (
                  <details key={item.q} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <summary className="cursor-pointer list-none text-sm font-bold text-brand-ink">{item.q}</summary>
                    <p className="mt-2 text-sm text-slate-600">{item.a}</p>
                  </details>
                ))}
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <NavLink to="/contact" className="btn-primary btn-ripple flex-1">
                  <FiUserPlus className="h-4 w-4" aria-hidden="true" />
                  Contact Admissions
                </NavLink>
                <NavLink to="/" className="btn-secondary flex-1">
                  Back to Home
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
