import { FiActivity, FiBook, FiBookOpen, FiCpu, FiMonitor, FiUsers } from 'react-icons/fi'
import SectionCard from '../components/SectionCard.jsx'
import usePageMeta from '../hooks/usePageMeta.js'
import { facilities, programs } from '../data/siteContent.js'

export default function Academics() {
  usePageMeta({
    title: 'Academics',
    description:
      'Explore programs offered, curriculum overview, and learning facilities at Divine Mercy School of Bukidnon, Inc.',
  })

  const facilityIcons = [FiActivity, FiMonitor, FiBookOpen, FiUsers]

  return (
    <div>
      <section>
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="max-w-2xl" data-reveal>
            <h1 className="gold-gradient-text text-3xl font-black tracking-tight sm:text-4xl">Academics</h1>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              Programs designed to build strong foundations, deepen understanding, and prepare students for their next
              steps.
            </p>
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
            <h2 className="gold-gradient-text text-2xl font-black tracking-tight">Programs Offered</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Junior High and Senior High.</p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {programs.map((p) => (
              <SectionCard key={p.title} icon={FiBook} title={p.title} description={p.description} />
            ))}
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

      <section>
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
            <div data-reveal>
              <h2 className="gold-gradient-text text-2xl font-black tracking-tight">Curriculum Overview</h2>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                We emphasize mastery of core subjects, values formation, and practical skills for real-world readiness.
              </p>
              <ul className="mt-5 space-y-3 text-sm text-slate-700 dark:text-slate-200">
                <li className="flex gap-2">
                  <FiBook className="mt-0.5 h-4 w-4 text-brand-blue" aria-hidden="true" />
                  Strong focus on literacy, numeracy, and scientific thinking
                </li>
                <li className="flex gap-2">
                  <FiCpu className="mt-0.5 h-4 w-4 text-brand-blue" aria-hidden="true" />
                  Digital literacy and responsible technology use
                </li>
                <li className="flex gap-2">
                  <FiUsers className="mt-0.5 h-4 w-4 text-brand-blue" aria-hidden="true" />
                  Collaboration, communication, and leadership development
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800" data-reveal>
              <p className="text-sm font-extrabold text-brand-goldText">Learning Support</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Teachers guide students with clear outcomes, regular feedback, and a safe learning environment.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-700">
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Approach</p>
                  <p className="mt-1 text-sm font-extrabold text-brand-goldText">Student-centered</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-700">
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Focus</p>
                  <p className="mt-1 text-sm font-extrabold text-brand-goldText">Skills + values</p>
                </div>
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
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div data-reveal>
            <h2 className="gold-gradient-text text-2xl font-black tracking-tight">Facilities & Labs</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Spaces that support hands-on learning and student growth.</p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {facilities.map((f, idx) => (
              <SectionCard
                key={f.title}
                icon={facilityIcons[idx]}
                title={f.title}
                description={f.description}
              />
            ))}
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
