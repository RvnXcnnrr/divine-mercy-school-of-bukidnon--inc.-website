import { useEffect, useMemo, useState } from 'react'
import { FiAward, FiBookOpen, FiCalendar, FiChevronLeft, FiChevronRight, FiHeart, FiUsers } from 'react-icons/fi'
import { FaBus, FaHandHoldingHeart, FaMapLocationDot, FaShieldHeart } from 'react-icons/fa6'
import { NavLink } from 'react-router-dom'
import Hero from '../components/Hero.jsx'
import SectionCard from '../components/SectionCard.jsx'
import Testimonial from '../components/Testimonial.jsx'
import NewsCard from '../components/NewsCard.jsx'
import WaveDivider from '../components/WaveDivider.jsx'
import usePageMeta from '../hooks/usePageMeta.js'
import useFloatParallax from '../hooks/useFloatParallax.js'
import { boardMembers, highlights, newsItems, partners, testimonials, transportProgram } from '../data/siteContent.js'
import { fetchFaculty, cacheFaculty, readFacultyCache } from '../services/siteInfoService.js'
import BoardMemberCard from '../components/BoardMemberCard.jsx'
import { usePostsQuery } from '../hooks/usePostsQuery.js'
import { fetchSiteContent } from '../services/siteInfoService.js'

function sortFaculty(list = []) {
  return [...list].sort((a, b) => {
    const orderA = a.sort_order ?? Number.MAX_SAFE_INTEGER
    const orderB = b.sort_order ?? Number.MAX_SAFE_INTEGER
    if (orderA !== orderB) return orderA - orderB
    return (a.name || '').localeCompare(b.name || '')
  })
}

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
  const title = building.title || building.name || 'Campus Building'
  const subtitle = building.department || building.description || ''
  const image = building.image || building.featured_image_url || ''
  return (
    <figure
      ref={ref}
      style={style}
      className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {image ? (
          <img src={image} alt={title} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            Add a building image
          </div>
        )}
      </div>
      <figcaption className="p-4">
        <p className="text-base font-extrabold text-brand-goldText">{title}</p>
        {subtitle ? <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{subtitle}</p> : null}
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
  const { data: highlightMediaData } = usePostsQuery({ status: 'published', limit: 30 })
  const { data: recentUpdates } = usePostsQuery({ status: 'published', limit: 6 })
  const [slideIndex, setSlideIndex] = useState(0)
  const [buildings, setBuildings] = useState([])
  const transportCards = transportProgram.cards || []
  const hasTransport = Boolean(transportProgram.title || transportProgram.subtitle || transportCards.length)
  const campusSlides = useMemo(() => {
    const items = (highlightMediaData?.items || []).filter((item) => item.featured_image_url || item.gallery_images || item.images)
    if (!items.length) {
      return [
        {
          image: '/building-mock.png',
          title: 'Campus Fair Highlights',
          description: 'Showcase your campus fair photos and campus images here.',
        },
      ]
    }
    return items.flatMap((item, idx) => {
      const images = [item.featured_image_url, ...(item.gallery_images || item.images || [])].filter(Boolean)
      if (!images.length) return []
      return images.map((imageUrl, imgIdx) => ({
        image: imageUrl,
        title: item.title || `Campus highlight ${idx + 1}`,
        description: item.excerpt || 'Captured during our campus events.',
        key: `${item.id || item.slug || idx}-${imgIdx}`,
      }))
    })
  }, [highlightMediaData])
  const hasMultipleSlides = campusSlides.length > 1
  const currentSlide = campusSlides[slideIndex] || campusSlides[0]
  const previewNews = recentUpdates?.items?.slice(0, 3) || newsItems.slice(0, 3)
  const [faculty, setFaculty] = useState(() => sortFaculty(readFacultyCache() || boardMembers))

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data } = await fetchFaculty()
        if (!mounted || !data) return
        const sorted = sortFaculty(data)
        setFaculty(sorted)
        cacheFaculty(sorted)
      } catch (err) {
        console.warn('[Home] using cached board list', err)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data } = await fetchSiteContent()
        if (!mounted || !data) return
        setBuildings(data.extra_content?.buildings || [])
      } catch (err) {
        console.warn('[Home] using empty buildings', err)
        if (!mounted) return
        setBuildings([])
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    setSlideIndex(0)
  }, [campusSlides.length])

  useEffect(() => {
    if (!hasMultipleSlides) return
    const id = setInterval(() => {
      setSlideIndex((idx) => (idx + 1) % campusSlides.length)
    }, 6000)
    return () => clearInterval(id)
  }, [campusSlides.length, hasMultipleSlides])

  function goToPrev() {
    setSlideIndex((idx) => (idx - 1 + campusSlides.length) % campusSlides.length)
  }

  function goToNext() {
    setSlideIndex((idx) => (idx + 1) % campusSlides.length)
  }

  return (
    <div>
      <Hero />

      <section className="mx-auto max-w-6xl px-4 pb-8 pt-10 is-visible">
        <div className="grid gap-6 lg:grid-cols-[1.08fr_1fr] lg:items-center">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-blue">Campus Fair Highlights</p>
            <h2 className="text-2xl font-black text-brand-goldText sm:text-3xl">Campus Fair Highlights</h2>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              A rotating slideshow of our campus images and fair moments. Tap through to spotlight every highlight.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={goToPrev}
                disabled={!hasMultipleSlides}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-extrabold text-brand-goldText ring-1 ring-slate-200 transition hover:-translate-y-[1px] hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 disabled:opacity-60 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700 dark:hover:bg-slate-800"
              >
                <FiChevronLeft className="h-4 w-4" aria-hidden="true" />
                Previous
              </button>
              <button
                type="button"
                onClick={goToNext}
                disabled={!hasMultipleSlides}
                className="inline-flex items-center gap-2 rounded-full bg-brand-goldText px-4 py-2 text-xs font-extrabold text-white transition hover:-translate-y-[1px] hover:bg-brand-goldText/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 disabled:opacity-60"
              >
                Next
                <FiChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <NavLink
                to="/gallery"
                className="inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-extrabold text-brand-goldText ring-1 ring-slate-200 transition hover:-translate-y-[1px] hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 dark:bg-slate-950 dark:text-slate-100 dark:ring-slate-700 dark:hover:bg-slate-900"
              >
                Open gallery
              </NavLink>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-slate-900 ring-1 ring-slate-200 shadow-lg dark:bg-slate-950 dark:ring-slate-800">
            <div className="relative aspect-[16/9] overflow-hidden">
              <img
                src={currentSlide.image}
                alt={currentSlide.title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent" aria-hidden="true" />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 text-white">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">
                    Slide {slideIndex + 1} of {campusSlides.length}
                  </p>
                  <h3 className="text-lg font-black leading-tight">{currentSlide.title}</h3>
                  {currentSlide.description ? (
                    <p className="text-sm text-white/80 line-clamp-2">{currentSlide.description}</p>
                  ) : null}
                </div>
                {hasMultipleSlides ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={goToPrev}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
                      aria-label="Previous slide"
                    >
                      <FiChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={goToNext}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
                      aria-label="Next slide"
                    >
                      <FiChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                ) : null}
              </div>
              {hasMultipleSlides ? (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {campusSlides.map((slide, idx) => (
                    <button
                      key={`${slide.title}-${idx}`}
                      type="button"
                      onClick={() => setSlideIndex(idx)}
                      className={[
                        'h-2.5 w-8 rounded-full transition-all',
                        idx === slideIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/70',
                      ].join(' ')}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-6 pt-4 is-visible">
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

      <WaveDivider />

      {hasTransport ? (
        <>
          <section className="bg-white dark:bg-slate-900">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
              <div data-reveal>
                <p className="inline-flex items-center gap-2 rounded-full bg-brand-sky px-3 py-1 text-xs font-semibold text-brand-goldText ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
                  <FaBus className="h-3.5 w-3.5" aria-hidden="true" />
                  Community Support
                </p>
                <h2 className="gold-gradient-text mt-3 text-2xl font-black tracking-tight sm:text-3xl">
                  {transportProgram.title || 'Transport assistance program'}
                </h2>
                {transportProgram.subtitle ? (
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{transportProgram.subtitle}</p>
                ) : null}

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

              {transportCards.length ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1" data-reveal>
                  {transportCards.map((card, idx) => {
                    const icons = [FaMapLocationDot, FaHandHoldingHeart, FaShieldHeart]
                    const Icon = icons[idx % icons.length]
                    return <SectionCard key={card.title || idx} icon={Icon} title={card.title} description={card.description} />
                  })}
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <WaveDivider from="bg-white dark:bg-slate-900" to="text-brand-sky dark:text-slate-950" />
        </>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 pb-14 pt-10" data-reveal>
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
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Photos, titles, and departments managed from the admin dashboard.</p>
        </div>

        {buildings.length ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {buildings.map((b, idx) => (
              <BuildingCard key={b.title || b.name || idx} building={b} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">No campus buildings added yet.</p>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14" data-reveal>
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-sky/70 via-white to-brand-sky/40 p-6 ring-1 ring-slate-200 shadow-sm dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 dark:ring-slate-800">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-blue">What’s new</p>
              <h2 className="gold-gradient-text text-2xl font-black tracking-tight sm:text-3xl">Latest updates</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Fresh news, events, and annual field trips.</p>
            </div>
            <NavLink
              to="/news"
              className="inline-flex items-center justify-center rounded-full bg-brand-goldText px-4 py-2 text-sm font-extrabold text-white transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
            >
              View all updates
            </NavLink>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {previewNews.map((item) => (
              <NewsCard key={item.id || item.slug || item.title} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="max-w-2xl" data-reveal>
            <h2 className="gold-gradient-text text-2xl font-black tracking-tight sm:text-3xl">Meet the Board</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Leadership guiding our mission of faith, discipline, and service.</p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {faculty.slice(0, 3).map((member) => (
              <BoardMemberCard key={member.id} member={member} />
            ))}
          </div>
        </div>
      </section>

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

      <WaveDivider from="bg-white dark:bg-slate-900" to="text-brand-goldText" />

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
    </div>
  )
}
