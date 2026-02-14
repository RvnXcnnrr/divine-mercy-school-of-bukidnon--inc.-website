import usePageMeta from '../hooks/usePageMeta.js'
import BoardMemberCard from '../components/BoardMemberCard.jsx'
import { boardMembers } from '../data/siteContent.js'

export default function About() {
  usePageMeta({
    title: 'About',
    description:
      'Learn about Divine Mercy School of Bukidnon, Inc.: our history, vision and mission, core values, and leadership.',
  })

  const values = ['Faith', 'Excellence', 'Compassion', 'Integrity', 'Service', 'Respect']

  return (
    <div>
      <section>
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="max-w-2xl" data-reveal>
            <h1 className="gold-gradient-text text-3xl font-black tracking-tight sm:text-4xl">About Us</h1>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              Divine Mercy School of Bukidnon, Inc. is a private Catholic school committed to faith-based education,
              discipline, and service—forming learners through Christian values, compassion, and moral formation.
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
          <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
            <div data-reveal>
              <h2 className="gold-gradient-text text-2xl font-black tracking-tight">School History</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Our story is rooted in the desire to provide quality education that develops the whole person—mind,
                character, and faith. (Replace this text with your official school history for accuracy.)
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Through dedicated educators and supportive families, we continue to strengthen programs that help students
                thrive in academics and in life.
              </p>
            </div>

            <div className="grid gap-5" data-reveal>
              <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                <h3 className="text-base font-extrabold text-brand-goldText">Vision</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  A Christ-centered learning community that forms disciplined, compassionate, and excellent learners who
                  serve with faith and integrity.
                </p>
              </div>
              <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                <h3 className="text-base font-extrabold text-brand-goldText">Mission</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  To provide quality education rooted in Christian values—strengthening academic growth, moral formation,
                  discipline, and community service while supporting learners who face barriers to attendance.
                </p>
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
                {values.map((v) => (
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
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  Welcome to Divine Mercy School of Bukidnon, Inc. We are committed to forming learners who are
                  competent, compassionate, disciplined, and grounded in faith. We also believe that distance and
                  financial hardship should not keep a child from learning.
                </p>
                <p className="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400">— School Principal</p>
              </div>
            </div>
          </div>

          <div className="mt-12" data-reveal>
            <h2 className="gold-gradient-text text-2xl font-black tracking-tight">Board Members</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Meet the people who help steward the school’s mission of faith, discipline, and compassionate service.
              Replace the placeholder names and photos anytime.
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {boardMembers.map((m) => (
                <BoardMemberCard key={m.id} member={m} />
              ))}
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
