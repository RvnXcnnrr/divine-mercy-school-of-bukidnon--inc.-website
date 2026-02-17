import { useEffect, useState } from 'react'
import usePageMeta from '../hooks/usePageMeta.js'
import BoardMemberCard from '../components/BoardMemberCard.jsx'
import { facultyMembers as facultyFallback, missionVision as missionVisionFallback, extraContent as extraFallback } from '../data/siteContent.js'
import { fetchFaculty, fetchSiteContent, cacheFaculty, readFacultyCache } from '../services/siteInfoService.js'

export default function About() {
  usePageMeta({
    title: 'About',
    description:
      'Learn about Divine Mercy School of Bukidnon, Inc.: our history, vision and mission, core values, and leadership.',
  })

  const [missionVision, setMissionVision] = useState(missionVisionFallback)
  const [extraContent, setExtraContent] = useState(extraFallback)
  const [faculty, setFaculty] = useState(() => readFacultyCache() || facultyFallback)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const [{ data: content }, { data: facultyData }] = await Promise.all([fetchSiteContent(), fetchFaculty()])
        if (!mounted) return
        if (content) {
          setMissionVision(content)
          setExtraContent(content.extra_content || extraFallback)
        }
        if (facultyData) {
          setFaculty(facultyData)
          cacheFaculty(facultyData)
        }
      } catch (err) {
        const cached = readFacultyCache()
        if (cached) setFaculty(cached)
        setExtraContent(extraFallback)
        console.warn('[About] Using fallback content', err)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  function LoadingIndicator({ label }) {
    return (
      <div className="mt-4 inline-flex items-center gap-3 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 shadow-sm backdrop-blur dark:bg-slate-900/70 dark:text-slate-200 dark:ring-slate-700">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-goldText border-t-transparent" aria-hidden="true" />
        <span>{label}</span>
      </div>
    )
  }

  return (
    <div>
      <section>
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="max-w-2xl" data-reveal>
            <h1 className="gold-gradient-text text-3xl font-black tracking-tight sm:text-4xl">About Us</h1>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{extraContent.about_intro}</p>
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
          {loading ? <LoadingIndicator label="Loading site content…" /> : null}
          <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
            <div data-reveal>
              <h2 className="gold-gradient-text text-2xl font-black tracking-tight">School History</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {missionVision.history}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Through dedicated educators and supportive families, we continue to strengthen programs that help students
                thrive in academics and in life.
              </p>
            </div>

            <div className="grid gap-5" data-reveal>
              <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                <h3 className="text-base font-extrabold text-brand-goldText">Vision</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{missionVision.vision}</p>
              </div>
              <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                <h3 className="text-base font-extrabold text-brand-goldText">Mission</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{missionVision.mission}</p>
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:items-start">
            <div className="rounded-2xl bg-brand-goldText p-8" data-reveal>
              <h2 className="text-2xl font-black tracking-tight text-white">Serving the Underserved</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/80">
                As part of our mission of compassion and service, the school supports underprivileged learners by offering
                FREE pick-up and drop-off transportation for students who live far from the campus, cannot afford daily
                transport, or are at risk of dropping out due to distance or financial hardship.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/80">
                We believe opportunity should not depend on location or income. We bring education closer—one safe commute
                at a time.
              </p>
            </div>

            <div data-reveal>
              <h2 className="gold-gradient-text text-2xl font-black tracking-tight">Core Values</h2>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                These values shape our culture and guide students in becoming responsible and compassionate members of
                society.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {(extraContent.core_values || []).map((v) => (
                  <span
                    key={v}
                    className="inline-flex items-center rounded-full bg-brand-sky px-3 py-1 text-xs font-semibold text-brand-goldText ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"
                  >
                    {v}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div
            className="mt-12 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
            aria-label="Principal message"
            data-reveal
          >
            <div className="flex items-start gap-4">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-brand-goldText text-lg font-black text-white">
                P
              </div>
              <div>
                <p className="text-sm font-extrabold text-brand-goldText">Principal’s Message</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{extraContent.principal_message}</p>
                <p className="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400">— School Principal</p>
              </div>
            </div>
          </div>

          <div className="mt-12" data-reveal>
            <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-brand-sky/35 to-white p-6 shadow-sm ring-1 ring-white/70 dark:border-slate-800/80 dark:from-slate-900 dark:via-slate-900/70 dark:to-slate-950">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(247,215,111,0.18),transparent_35%),radial-gradient(circle_at_90%_10%,rgba(82,143,255,0.14),transparent_30%)]" aria-hidden="true" />
              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-blue">Meet the Team</p>
                  <h2 className="mt-1 text-2xl font-black text-brand-goldText">Faculty & Staff</h2>
                  <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                    Keep your team profile updated—names, roles, and photos are managed from the admin panel. Profiles
                    update instantly for families and students browsing this page.
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="relative mt-6 flex items-center gap-3 rounded-xl border border-dashed border-slate-200/80 bg-white/70 p-4 text-sm font-semibold text-slate-600 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/70 dark:text-slate-200">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-goldText border-t-transparent" aria-hidden="true" />
                  Loading faculty & staff…
                </div>
              ) : (
                <div className="relative mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {faculty.map((m) => (
                    <BoardMemberCard key={m.id} member={m} />
                  ))}
                </div>
              )}
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
    </div>
  )
}
