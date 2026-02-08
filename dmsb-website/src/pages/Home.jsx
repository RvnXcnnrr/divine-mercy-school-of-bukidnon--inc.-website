import { FiAward, FiBookOpen, FiHeart } from 'react-icons/fi'
import { FaBus, FaHandHoldingHeart, FaMapLocationDot, FaShieldHeart } from 'react-icons/fa6'
import { NavLink } from 'react-router-dom'
import Hero from '../components/Hero.jsx'
import SectionCard from '../components/SectionCard.jsx'
import Testimonial from '../components/Testimonial.jsx'
import NewsCard from '../components/NewsCard.jsx'
import usePageMeta from '../hooks/usePageMeta.js'
import { highlights, newsItems, testimonials, transportProgram } from '../data/siteContent.js'

export default function Home() {
  usePageMeta({
    title: 'Home',
    description:
      'Divine Mercy School of Bukidnon, Inc. — a private Catholic school committed to faith-based education, discipline, service, and compassionate support for learners.',
  })

  const highlightIcons = [FiBookOpen, FiHeart, FiAward]
  const previewNews = newsItems.slice(0, 3)

  return (
    <div>
      <Hero />

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="max-w-2xl" data-reveal>
          <h2 className="gold-gradient-text text-2xl font-black tracking-tight sm:text-3xl">
            Why families choose DMSB
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            A supportive Catholic learning community where learners grow in faith, discipline, and excellence.
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((h, idx) => (
            <SectionCard
              key={h.title}
              icon={highlightIcons[idx]}
              title={h.title}
              description={h.description}
            />
          ))}
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
              <p className="inline-flex items-center gap-2 rounded-full bg-brand-sky px-3 py-1 text-xs font-semibold text-brand-goldText ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
                <FaBus className="h-3.5 w-3.5" aria-hidden="true" />
                Community Support
              </p>
              <h2 className="gold-gradient-text mt-3 text-2xl font-black tracking-tight sm:text-3xl">
                {transportProgram.title}
              </h2>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{transportProgram.subtitle}</p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <NavLink
                  to="/admissions"
                  className="inline-flex w-full items-center justify-center rounded-md bg-brand-goldText px-5 py-3 text-sm font-extrabold text-white transition-opacity hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 sm:w-auto"
                >
                  Learn eligibility
                </NavLink>
                <NavLink
                  to="/contact"
                  className="inline-flex w-full items-center justify-center rounded-md bg-white px-5 py-3 text-sm font-extrabold text-brand-goldText ring-1 ring-slate-200 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 dark:bg-slate-950 dark:ring-slate-700 dark:hover:bg-slate-900 sm:w-auto"
                >
                  Ask about transport
                </NavLink>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1" data-reveal>
              <SectionCard
                icon={FaMapLocationDot}
                title={transportProgram.cards[0].title}
                description={transportProgram.cards[0].description}
              />
              <SectionCard
                icon={FaHandHoldingHeart}
                title={transportProgram.cards[1].title}
                description={transportProgram.cards[1].description}
              />
              <SectionCard
                icon={FaShieldHeart}
                title={transportProgram.cards[2].title}
                description={transportProgram.cards[2].description}
              />
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between" data-reveal>
            <div>
              <h2 className="gold-gradient-text text-2xl font-black tracking-tight sm:text-3xl">
                News & Announcements
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">School activities and important updates.</p>
            </div>
            <NavLink
              to="/news"
              className="inline-flex w-full items-center justify-center rounded-md bg-brand-goldText px-4 py-2 text-sm font-extrabold text-white transition-opacity hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 sm:w-auto"
            >
              View all
            </NavLink>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {previewNews.map((item) => (
              <NewsCard key={item.id} item={item} compact />
            ))}
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
          <div className="max-w-2xl" data-reveal>
            <h2 className="gold-gradient-text text-2xl font-black tracking-tight sm:text-3xl">
              Testimonials
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Parent and guardian feedback from our community.</p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, idx) => (
              <Testimonial key={idx} quote={t.quote} name={t.name} role={t.role} />
            ))}
          </div>
        </div>
      </section>

      <div className="w-full overflow-hidden bg-white leading-none dark:bg-slate-900" aria-hidden="true">
        <svg
          className="block h-8 w-full fill-current text-brand-goldText sm:h-10"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          focusable="false"
        >
          <path d="M0,32 C240,80 480,80 720,40 C960,0 1200,0 1440,32 L1440,80 L0,80 Z" />
        </svg>
      </div>

      <section className="bg-brand-goldText">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 lg:grid-cols-2 lg:items-center">
          <div data-reveal>
            <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Ready to begin your journey with us?
            </h2>
            <p className="mt-2 text-sm text-white/80">
              Learn about admission steps, requirements, and the support programs that help learners stay in school.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end" data-reveal>
            <NavLink
              to="/admissions"
              className="gold-gradient-bg inline-flex w-full items-center justify-center rounded-md px-5 py-3 text-sm font-extrabold text-white transition-opacity hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-goldText sm:w-auto"
            >
              Enroll Now
            </NavLink>
            <NavLink
              to="/contact"
              className="inline-flex w-full items-center justify-center rounded-md bg-white/10 px-5 py-3 text-sm font-extrabold text-white ring-1 ring-white/20 transition-colors hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-goldText sm:w-auto"
            >
              Contact Us
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
