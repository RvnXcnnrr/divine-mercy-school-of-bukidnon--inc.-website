import { useEffect, useMemo, useState } from 'react'
import { FiActivity, FiBook, FiBookOpen, FiChevronDown, FiCpu, FiMonitor, FiUsers } from 'react-icons/fi'
import SectionCard from '../components/SectionCard.jsx'
import usePageMeta from '../hooks/usePageMeta.js'
import { extraContent as extraFallback } from '../data/siteContent.js'
import useFloatParallax from '../hooks/useFloatParallax.js'
import { fetchSiteContent } from '../services/siteInfoService.js'

function ProgramCard({ title, description, icon }) {
  const Icon = icon || FiBook
  return (
    <article className="surface-card surface-card-hover p-6" data-reveal>
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-brand-goldText ring-1 ring-red-100">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-2xl font-bold leading-snug text-brand-ink">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
    </article>
  )
}

export default function Academics() {
  usePageMeta({
    title: 'Academics',
    description: 'Explore programs offered, curriculum overview, and learning facilities at Divine Mercy School of Bukidnon.',
  })

  const facilityIcons = [FiActivity, FiMonitor, FiBookOpen, FiUsers]
  const [programList, setProgramList] = useState(extraFallback.programs)
  const [curriculum, setCurriculum] = useState(extraFallback.curriculum_overview)
  const [facilityList, setFacilityList] = useState(extraFallback.facilities)
  const [facilityImages, setFacilityImages] = useState([])
  const [activeTab, setActiveTab] = useState('junior')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data } = await fetchSiteContent()
        if (!mounted || !data) return
        const extra = data.extra_content || extraFallback
        setProgramList(extra.programs || extraFallback.programs)
        setCurriculum(extra.curriculum_overview || extraFallback.curriculum_overview)
        setFacilityList(extra.facilities || extraFallback.facilities)
        const buildingImages = (extra.buildings || [])
          .map((building) => building.image || building.featured_image_url)
          .filter(Boolean)
        setFacilityImages(buildingImages)
      } catch (err) {
        console.warn('[Academics] using fallback content', err)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  const groupedPrograms = useMemo(() => {
    const junior = []
    const senior = []
    const unknown = []

    programList.forEach((program) => {
      const text = `${program.title || ''} ${program.description || ''}`.toLowerCase()
      if (text.includes('junior')) junior.push(program)
      else if (text.includes('senior')) senior.push(program)
      else unknown.push(program)
    })

    const fallback = programList.length ? programList : [
      { title: 'Junior High School', description: 'Foundation courses with values formation and skills building.' },
      { title: 'Senior High School', description: 'Academic strands and pathways for college and careers.' },
    ]

    return {
      junior: junior.length ? junior : fallback,
      senior: senior.length ? senior : fallback,
      fallback,
    }
  }, [programList])

  const visiblePrograms = activeTab === 'junior' ? groupedPrograms.junior : groupedPrograms.senior

  function FacilityCard({ facility, icon }) {
    const { ref, style } = useFloatParallax({ factor: 0.1, max: 10 })
    return (
      <div ref={ref} style={style}>
        <SectionCard icon={icon} title={facility.title} description={facility.description} />
      </div>
    )
  }

  return (
    <div className="bg-brand-sky">
      <section className="section-space bg-gradient-to-br from-white via-red-50/35 to-rose-50/55">
        <div className="mx-auto max-w-7xl px-4" data-reveal>
          <p className="page-kicker">Academic Programs</p>
          <h1 className="page-h1 mt-4">Academics</h1>
          <p className="page-body mt-6 max-w-2xl">
            Formation-driven programs that balance strong academics, discipline, and practical life preparation.
          </p>
        </div>
      </section>

      <section className="section-space bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between" data-reveal>
            <div>
              <p className="page-kicker">Program Tracks</p>
              <h2 className="page-h2 mt-3">Junior and Senior High pathways</h2>
            </div>
            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setActiveTab('junior')}
                className={[
                  'rounded-lg px-4 py-2 text-xs font-extrabold transition duration-200',
                  activeTab === 'junior' ? 'bg-white text-brand-goldText shadow-sm' : 'text-slate-600',
                ].join(' ')}
              >
                Junior High
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('senior')}
                className={[
                  'rounded-lg px-4 py-2 text-xs font-extrabold transition duration-200',
                  activeTab === 'senior' ? 'bg-white text-brand-goldText shadow-sm' : 'text-slate-600',
                ].join(' ')}
              >
                Senior High
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {visiblePrograms.map((program, idx) => (
              <ProgramCard
                key={`${program.title || idx}-${activeTab}`}
                title={program.title}
                description={program.description}
                icon={idx % 2 === 0 ? FiBook : FiCpu}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section-space bg-brand-sky">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
            <div data-reveal>
              <p className="page-kicker">Curriculum</p>
              <h2 className="page-h2 mt-3">Curriculum overview</h2>
              <p className="page-body mt-4">
                Core academics, values formation, and applied skills integrated into a structured learner journey.
              </p>

              <div className="mt-5 space-y-3">
                {(curriculum.length ? curriculum : ['Core subjects with mastery support', 'Christian values and discipline formation', 'Skills-based projects and community service']).map((item, idx) => (
                  <details key={`${item}-${idx}`} className="rounded-xl border border-slate-200 bg-white p-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-bold text-brand-ink">
                      {item}
                      <FiChevronDown className="h-4 w-4 text-brand-goldText" aria-hidden="true" />
                    </summary>
                    <p className="mt-2 text-sm text-slate-600">
                      Teachers align this area with clear outcomes, regular feedback, and student support.
                    </p>
                  </details>
                ))}
              </div>
            </div>

            <div className="surface-card p-6" data-reveal>
              <p className="page-kicker">Learning Model</p>
              <h3 className="page-h3 mt-2">Balanced academic formation</h3>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-slate-500">Approach</p>
                  <p className="mt-1 text-sm font-bold text-brand-goldText">Student-centered</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-slate-500">Focus</p>
                  <p className="mt-1 text-sm font-bold text-brand-goldText">Values plus skills</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-slate-500">Mentoring</p>
                  <p className="mt-1 text-sm font-bold text-brand-goldText">Advisory guidance</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-slate-500">Outcome</p>
                  <p className="mt-1 text-sm font-bold text-brand-goldText">College readiness</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-space bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <div data-reveal>
            <p className="page-kicker">Facilities</p>
            <h2 className="page-h2 mt-3">Labs and learning spaces</h2>
            <p className="page-muted mt-3">Designed to support practical learning and collaboration.</p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {(facilityList.length ? facilityList : [
              { title: 'Computer Lab', description: 'Digital literacy and research skills training.' },
              { title: 'Science Lab', description: 'Hands-on experiments and investigative learning.' },
              { title: 'Library', description: 'Reading and guided study environment.' },
              { title: 'Activity Spaces', description: 'Programs for arts, sports, and leadership.' },
            ]).map((facility, idx) => (
              <FacilityCard key={facility.title || idx} facility={facility} icon={facilityIcons[idx % facilityIcons.length]} />
            ))}
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-reveal>
            {(facilityImages.length ? facilityImages : ['/building-mock.png']).slice(0, 3).map((image, idx) => (
              <figure key={`${image}-${idx}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                <img src={image} alt={`Facility preview ${idx + 1}`} className="aspect-[4/3] w-full object-cover transition duration-300 hover:scale-105" loading="lazy" />
              </figure>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
