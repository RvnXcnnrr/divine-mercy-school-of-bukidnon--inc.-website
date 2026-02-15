import { FiAward, FiBookOpen, FiCalendar, FiHeart, FiUsers } from 'react-icons/fi'
import { FaBus, FaHandHoldingHeart, FaMapLocationDot, FaShieldHeart } from 'react-icons/fa6'
import { NavLink } from 'react-router-dom'
import Hero from '../components/Hero.jsx'
import SectionCard from '../components/SectionCard.jsx'
import Testimonial from '../components/Testimonial.jsx'
import NewsCard from '../components/NewsCard.jsx'
import usePageMeta from '../hooks/usePageMeta.js'
import useFloatParallax from '../hooks/useFloatParallax.js'
import { boardMembers, buildings, highlights, newsItems, partners, testimonials, transportProgram } from '../data/siteContent.js'
import BoardMemberCard from '../components/BoardMemberCard.jsx'
import { usePostsQuery } from '../hooks/usePostsQuery.js'
import VlogCard from '../components/VlogCard.jsx'

function HighlightCard({ item, icon }) {
  const { ref, style } = useFloatParallax({ factor: 0.12, max: 12 })
  return (
    <div ref={ref} style={style}>
      <SectionCard icon={icon} title={item.title} stat={item.stat} description={item.description} meta={item.meta} />
    </div>
  )
}

function BuildingCard({ building }) {
  const { ref, style } = useFloatParallax({ factor: 0.12, max: 14 })
  return (
    <figure
      ref={ref}
      style={style}
      className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={building.image}
          alt={`${building.name} mockup`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-black/55 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur">
          Mockup
        </span>
      </div>
      <figcaption className="p-4">
        <p className="text-base font-extrabold text-brand-goldText">{building.name}</p>
        {building.description ? (
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{building.description}</p>
        ) : null}
      </figcaption>
    </figure>
  )
}

export default function Home() {
  usePageMeta({
    title: 'Home',
    description:
      'Divine Mercy School of Bukidnon, Inc. — a private Catholic school committed to faith-based education, discipline, service, and compassionate support for learners.',
  })

  const highlightIcons = [FiAward, FiUsers, FiHeart, FiBookOpen]
  const { data: featuredVlogData } = usePostsQuery({ hasVideo: true, isFeatured: true, status: 'published', limit: 1 })
  const { data: recentUpdates } = usePostsQuery({ status: 'published', limit: 6 })
  const featuredVlog = featuredVlogData?.items?.[0]
  const previewNews = recentUpdates?.items?.slice(0, 3) || newsItems.slice(0, 3)

  return (
    <div>
      <Hero />

      {featuredVlog ? (
        <section className="mx-auto max-w-6xl px-4 pb-6 pt-10" data-reveal>
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-blue">Featured vlog</p>
              <h2 className="mt-2 text-2xl font-black text-brand-goldText sm:text-3xl">{featuredVlog.title}</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{featuredVlog.excerpt || 'Latest highlight video.'}</p>
            </div>
            <VlogCard item={featuredVlog} />
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 pb-6 pt-4" data-reveal>
        <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200 shadow-sm dark:bg-slate-900 dark:ring-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-blue">Visit us</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">See classrooms, talk to staff, and plan your learner's path.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <NavLink
              to="/contact#visit"
              className="gold-gradient-bg inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-extrabold text-white transition-opacity hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
            >
              <FiCalendar className="h-4 w-4" aria-hidden="true" />
              Book a Visit
            </NavLink>
            <NavLink
              to="/admissions"
              className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-extrabold text-brand-goldText ring-1 ring-slate-200 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 dark:bg-slate-950 dark:ring-slate-700 dark:hover:bg-slate-900"
            >
              Admissions Guide
            </NavLink>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="max-w-2xl" data-reveal>
          <h2 className="gold-gradient-text text-2xl font-black tracking-tight sm:text-3xl">Why choose us</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Four quick proof points families care about.</p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((h, idx) => (
            <HighlightCard key={h.title} item={h} icon={highlightIcons[idx % highlightIcons.length]} />
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

      <section className="mx-auto max-w-6xl px-4 pb-14" data-reveal>
        <div className="rounded-2xl bg-brand-sky p-6 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-blue">Campus visit</p>
              <h3 className="text-xl font-black text-brand-goldText">Schedule a guided visit with our team</h3>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">Walk the campus, meet teachers, and discuss support options.</p>
            </div>
            <div className="flex gap-2">
              <NavLink
                to="/contact#visit"
                className="gold-gradient-bg inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-extrabold text-white transition-opacity hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
              >
                Book a Visit
              </NavLink>
              <NavLink
                to="/admissions"
                className="inline-flex items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-extrabold text-brand-goldText ring-1 ring-slate-200 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 dark:bg-slate-950 dark:ring-slate-700 dark:hover:bg-slate-900"
              >
                Admissions
              </NavLink>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14" data-reveal>
        <div className="max-w-2xl">
          <h2 className="gold-gradient-text text-2xl font-black tracking-tight sm:text-3xl">Campus Building</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Mockup photo and name shown below - swap in your real building image and official name anytime.
          </p>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {buildings.map((b) => (
            <BuildingCard key={b.name} building={b} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14" data-reveal>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="gold-gradient-text text-2xl font-black tracking-tight sm:text-3xl">Latest updates</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Fresh news, events, and announcements.</p>
          </div>
          <NavLink
            to="/news"
            className="inline-flex items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-extrabold text-brand-goldText ring-1 ring-slate-200 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 dark:bg-slate-900 dark:ring-slate-800 dark:hover:bg-slate-800"
          >
            View all updates
          </NavLink>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {previewNews.map((item) => (
            <NewsCard key={item.id || item.slug || item.title} item={item} />
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
          <div className="max-w-2xl" data-reveal>
            <h2 className="gold-gradient-text text-2xl font-black tracking-tight sm:text-3xl">Meet the Board</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Leadership guiding our mission of faith, discipline, and service.</p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {boardMembers.slice(0, 3).map((member) => (
              <BoardMemberCard key={member.id} member={member} />
            ))}
          </div>
        </div>
      </section>

      <div className="w-full overflow-hidden bg-white leading-none dark:bg-slate-900" aria-hidden="true">
        <svg
          className="block h-8 w-full fill-current text-white dark:text-slate-900 sm:h-10"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          focusable="false"
          aria-hidden="true"
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

          <div className="mt-10 rounded-2xl bg-brand-sky p-6 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800" data-reveal>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-blue">Partners & Community</p>
            <h3 className="mt-1 text-xl font-black text-brand-goldText">Trusted by families and local partners</h3>
            <div className="mt-4 flex flex-wrap gap-3">
              {partners.map((p) => (
                <span
                  key={p.name}
                  className="inline-flex flex-col rounded-lg bg-white px-3 py-2 text-xs font-semibold text-brand-navy ring-1 ring-slate-200 shadow-sm dark:bg-slate-950 dark:text-slate-100 dark:ring-slate-700"
                >
                  {p.name}
                  <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">{p.note}</span>
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-600 dark:text-slate-300">
              Want partner logos or deeper faculty highlights? We can add optimized assets and profiles anytime.
            </p>
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
