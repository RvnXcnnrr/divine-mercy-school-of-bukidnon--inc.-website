import { useEffect, useMemo, useState } from 'react'
import usePageMeta from '../hooks/usePageMeta.js'
import BoardMemberCard from '../components/BoardMemberCard.jsx'
import {
  facultyMembers as facultyFallback,
  missionVision as missionVisionFallback,
  extraContent as extraFallback,
} from '../data/siteContent.js'
import { fetchFaculty, fetchSiteContent, cacheFaculty, readFacultyCache } from '../services/siteInfoService.js'
import useParallax from '../hooks/useParallax.js'

function toTimeline(historyText) {
  const chunks = (historyText || '')
    .split(/(?<=[.!?])\s+/)
    .map((entry) => entry.trim())
    .filter(Boolean)

  if (!chunks.length) {
    return [
      'Founded to provide faith-centered education in Bukidnon.',
      'Expanded programs through strong family and community partnerships.',
      'Continues to form learners through discipline, compassion, and service.',
    ]
  }

  return chunks.slice(0, 4)
}

export default function About() {
  usePageMeta({
    title: 'About',
    description: 'Learn about Divine Mercy School of Bukidnon: history, mission, values, and leadership.',
  })

  const missionParallaxRef = useParallax({ factorY: 0.09, factorX: 0.03 })

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
        console.warn('[About] using fallback content', err)
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  const historyTimeline = useMemo(() => toTimeline(missionVision.history), [missionVision.history])
  const photoGrid = useMemo(() => {
    const buildingPhotos = (extraContent.buildings || [])
      .map((item) => item.image || item.featured_image_url)
      .filter(Boolean)
    return buildingPhotos.slice(0, 6)
  }, [extraContent.buildings])

  return (
    <div className="bg-brand-sky">
      <section className="section-space bg-gradient-to-br from-white via-red-50/35 to-rose-50/55">
        <div className="mx-auto max-w-7xl px-4" data-reveal>
          <p className="page-kicker">School Profile</p>
          <h1 className="page-h1 mt-4">About Us</h1>
          <p className="page-body mt-6 max-w-2xl">{extraContent.about_intro || 'A faith-centered school community committed to discipline, compassion, and service.'}</p>
        </div>
      </section>

      <section className="section-space bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <div data-reveal>
            <p className="page-kicker">History Timeline</p>
            <h2 className="page-h2 mt-3">Our journey through the years</h2>
          </div>

          {loading ? (
            <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-goldText border-t-transparent" aria-hidden="true" />
              Loading site content...
            </div>
          ) : null}

          <ol className="mt-8 space-y-5" data-reveal>
            {historyTimeline.map((entry, idx) => (
              <li key={`${entry}-${idx}`} className="relative pl-14">
                <span className="absolute left-0 top-0 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-sm font-extrabold text-brand-goldText ring-1 ring-red-100">
                  {idx + 1}
                </span>
                {idx < historyTimeline.length - 1 ? (
                  <span className="absolute left-5 top-10 h-[calc(100%-0.25rem)] w-px bg-slate-200" aria-hidden="true" />
                ) : null}
                <article className="surface-card p-5">
                  <p className="text-base leading-7 text-slate-700">{entry}</p>
                </article>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        ref={missionParallaxRef}
        className="section-space relative overflow-hidden bg-gradient-to-br from-red-700 to-rose-600 text-white"
        style={{ backgroundPositionY: 'calc(var(--parallax-bg, 0px))' }}
      >
        <div className="absolute inset-0 opacity-25" aria-hidden="true">
          <div className="h-full w-full bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.35),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.22),transparent_28%)]" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-2 lg:items-start">
          <div data-reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">Mission</p>
            <h2 className="mt-3 text-4xl font-extrabold leading-tight sm:text-5xl">Serving learners with faith and purpose</h2>
            <p className="mt-4 text-base text-white/85">{missionVision.mission || 'Guiding students through values-based and academically sound formation.'}</p>
          </div>
          <div data-reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">Vision</p>
            <p className="mt-3 text-lg leading-8 text-white/90">{missionVision.vision || 'A compassionate and disciplined school community for lifelong learning.'}</p>

            <div className="mt-5 rounded-2xl bg-white/10 p-5 ring-1 ring-white/20">
              <p className="text-sm font-bold text-white">Principal's Message</p>
              <p className="mt-2 text-sm leading-7 text-white/85">{extraContent.principal_message || 'Together with families, we form students who lead with competence and compassion.'}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-space bg-brand-sky">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div data-reveal>
              <p className="page-kicker">Core Values</p>
              <h2 className="page-h2 mt-3">Values that shape our culture</h2>
              <p className="page-body mt-4">Faith, discipline, compassion, and service are lived daily in and out of the classroom.</p>
              <div className="mt-5 flex flex-wrap gap-3">
                {(extraContent.core_values || ['Faith', 'Discipline', 'Service']).map((value) => (
                  <span
                    key={value}
                    className="inline-flex items-center rounded-full border border-red-100 bg-white px-4 py-2 text-sm font-bold text-brand-goldText shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-red-50"
                  >
                    {value}
                  </span>
                ))}
              </div>
            </div>

            <div data-reveal>
              <p className="page-kicker">School Life</p>
              <h3 className="page-h3 mt-2">Photo highlights</h3>
              {photoGrid.length ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {photoGrid.map((photo, idx) => (
                    <figure key={`${photo}-${idx}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                      <img src={photo} alt={`Campus highlight ${idx + 1}`} className="aspect-[4/3] w-full object-cover transition duration-300 hover:scale-105" loading="lazy" />
                    </figure>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-600">No campus photos yet. Add building photos in admin content.</p>
              )}
            </div>
          </div>

          <div className="mt-12" data-reveal>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="page-kicker">Leadership</p>
                <h2 className="page-h2 mt-2">Faculty and staff</h2>
              </div>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {faculty.length ? (
                faculty.map((member) => <BoardMemberCard key={member.id || member.name} member={member} />)
              ) : (
                <p className="text-sm text-slate-600">No faculty profiles yet. Add members from the admin dashboard.</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
