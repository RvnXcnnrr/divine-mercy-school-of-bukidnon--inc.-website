import { useEffect, useMemo, useState } from 'react'
import {
  FiAward,
  FiBookOpen,
  FiCalendar,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiHeart,
  FiImage,
  FiShield,
  FiUsers,
} from 'react-icons/fi'
import { FaBus, FaHandHoldingHeart, FaMapLocationDot, FaShieldHeart } from 'react-icons/fa6'
import { NavLink } from 'react-router-dom'
import Hero from '../components/Hero.jsx'
import SectionCard from '../components/SectionCard.jsx'
import Testimonial from '../components/Testimonial.jsx'
import NewsCard from '../components/NewsCard.jsx'
import usePageMeta from '../hooks/usePageMeta.js'
import useFloatParallax from '../hooks/useFloatParallax.js'
import { boardMembers, highlights, newsItems, partners, testimonials, transportProgram } from '../data/siteContent.js'
import { fetchFaculty, cacheFaculty, readFacultyCache } from '../services/siteInfoService.js'
import BoardMemberCard from '../components/BoardMemberCard.jsx'
import { usePostsQuery } from '../hooks/usePostsQuery.js'
import { fetchSiteContent } from '../services/siteInfoService.js'
import { fetchApprovedTestimonials, submitTestimonial } from '../services/testimonialService.js'

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
  const { ref, style } = useFloatParallax({ factor: 0.1, max: 10 })
  const title = building.title || building.name || 'Campus Building'
  const subtitle = building.department || building.description || ''
  const image = building.image || building.featured_image_url || ''

  return (
    <figure ref={ref} style={style} className="surface-card overflow-hidden">
      <div className="relative aspect-[4/3] overflow-hidden">
        {image ? (
          <img src={image} alt={title} className="h-full w-full object-cover transition duration-200 hover:scale-105" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100 text-xs font-semibold text-slate-500">
            Add a building image
          </div>
        )}
      </div>
      <figcaption className="p-4">
        <p className="text-base font-extrabold text-brand-goldText">{title}</p>
        {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
      </figcaption>
    </figure>
  )
}

export default function Home() {
  usePageMeta({
    title: 'Home',
    description:
      'Divine Mercy School of Bukidnon - a private Catholic school committed to faith-based education, discipline, service, and compassionate support for learners.',
  })

  const highlightIcons = [FiAward, FiUsers, FiHeart, FiBookOpen]
  const trustItems = [
    'Accredited Institution',
    'Faith-based Curriculum',
    'Safe Campus',
    'Transportation Support',
  ]

  const defaultHighlights = [
    {
      title: 'Faith-led Formation',
      stat: '100%',
      description: 'Catholic values integrated into academics and daily school life.',
      meta: 'Character first',
    },
    {
      title: 'Student Support',
      stat: 'Daily',
      description: 'Guidance and transport assistance for learners who need extra support.',
      meta: 'Community care',
    },
    {
      title: 'Disciplined Learning',
      stat: '2',
      description: 'Junior and Senior High programs focused on growth and responsibility.',
      meta: 'Structured pathways',
    },
    {
      title: 'Service Culture',
      stat: 'Active',
      description: 'Programs that encourage service, compassion, and civic engagement.',
      meta: 'Purposeful education',
    },
  ]

  const heroHighlights = highlights.length ? highlights : defaultHighlights

  const { data: highlightMediaData } = usePostsQuery({ status: 'published', limit: 30 })
  const { data: recentUpdates } = usePostsQuery({ status: 'published', limit: 6 })
  const [slideIndex, setSlideIndex] = useState(0)
  const [buildings, setBuildings] = useState([])
  const transportCards = transportProgram.cards || []
  const hasTransport = Boolean(transportProgram.title || transportProgram.subtitle || transportCards.length)

  const campusSlides = useMemo(() => {
    const items = (highlightMediaData?.items || []).filter((item) => item.featured_image_url || item.gallery_images || item.images)
    if (!items.length) return []

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
  const [testimonialList, setTestimonialList] = useState(testimonials)
  const [testimonialForm, setTestimonialForm] = useState({ name: '', role: '', quote: '' })
  const [testimonialStatus, setTestimonialStatus] = useState('idle')

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
    let mounted = true
    ;(async () => {
      try {
        const { data } = await fetchApprovedTestimonials({ limit: 30 })
        if (!mounted || !data) return
        setTestimonialList(data)
      } catch (err) {
        console.warn('[Home] using fallback testimonials', err)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!hasMultipleSlides) return undefined
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
    <div className="bg-brand-sky">
      <Hero />

      <section id="home-trust" className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" data-reveal>
            {trustItems.map((item) => (
              <div key={item} className="surface-card flex items-center gap-3 p-4">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-brand-goldText">
                  <FiCheckCircle className="h-4 w-4" aria-hidden="true" />
                </span>
                <p className="text-sm font-bold text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space bg-brand-sky">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-2xl" data-reveal>
            <p className="page-kicker">Feature Section</p>
            <h2 className="page-h2 mt-3">Why families choose DMSB</h2>
            <p className="page-body mt-4">Clear values, steady formation, and practical support for learners.</p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {heroHighlights.map((item, idx) => (
              <HighlightCard key={item.title || idx} item={item} icon={highlightIcons[idx % highlightIcons.length]} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-space bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div data-reveal>
              <p className="page-kicker">Highlight Section</p>
              <h2 className="page-h2 mt-3">Campus highlights and updates</h2>
              <p className="page-body mt-4">
                Moments from school life, events, and learning activities across the campus.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={goToPrev}
                  disabled={!hasMultipleSlides}
                  className="btn-secondary rounded-xl px-4 py-2 text-xs disabled:opacity-60"
                >
                  <FiChevronLeft className="h-4 w-4" aria-hidden="true" />
                  Previous
                </button>
                <button
                  type="button"
                  onClick={goToNext}
                  disabled={!hasMultipleSlides}
                  className="btn-primary btn-ripple rounded-xl px-4 py-2 text-xs disabled:opacity-60"
                >
                  Next
                  <FiChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
                <NavLink to="/gallery" className="btn-secondary rounded-xl px-4 py-2 text-xs">
                  Open Gallery
                </NavLink>
              </div>

              {campusSlides.length === 0 ? (
                <div className="surface-card mt-6 flex aspect-[16/9] items-center justify-center p-6 text-center">
                  <div>
                    <FiImage className="mx-auto h-8 w-8 text-slate-300" aria-hidden="true" />
                    <p className="mt-2 text-sm font-semibold text-slate-500">No highlights available yet</p>
                  </div>
                </div>
              ) : (
                <div className="surface-card mt-6 overflow-hidden bg-slate-900">
                  <div className="relative aspect-[16/9]">
                    <img src={currentSlide.image} alt={currentSlide.title} className="h-full w-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" aria-hidden="true" />
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
                        Slide {slideIndex + 1} of {campusSlides.length}
                      </p>
                      <h3 className="mt-2 text-2xl font-bold">{currentSlide.title}</h3>
                      {currentSlide.description ? (
                        <p className="mt-1 text-sm text-white/85 line-clamp-2">{currentSlide.description}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-5" data-reveal>
              {hasTransport ? (
                <div className="surface-card p-6">
                  <p className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-brand-goldText">
                    <FaBus className="h-3.5 w-3.5" aria-hidden="true" />
                    Community Support
                  </p>
                  <h3 className="page-h3 mt-4">{transportProgram.title || 'Transport assistance program'}</h3>
                  {transportProgram.subtitle ? <p className="page-body mt-3 text-base">{transportProgram.subtitle}</p> : null}

                  {transportCards.length ? (
                    <div className="mt-4 grid gap-3">
                      {transportCards.slice(0, 3).map((card, idx) => {
                        const icons = [FaMapLocationDot, FaHandHoldingHeart, FaShieldHeart]
                        const Icon = icons[idx % icons.length]
                        return (
                          <div key={`${card.title}-${idx}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <p className="inline-flex items-center gap-2 text-sm font-bold text-brand-goldText">
                              <Icon className="h-4 w-4" aria-hidden="true" />
                              {card.title}
                            </p>
                            <p className="mt-1 text-sm text-slate-600">{card.description}</p>
                          </div>
                        )
                      })}
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="surface-card p-6">
                <p className="page-kicker">Campus Spaces</p>
                <h3 className="page-h3 mt-2">Explore our facilities</h3>
                {buildings.length ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {buildings.slice(0, 2).map((building, idx) => (
                      <BuildingCard key={building.title || building.name || idx} building={building} />
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-600">New facility photos will appear here.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-space bg-gradient-to-br from-red-700 to-rose-600 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center" data-reveal>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">CTA Block</p>
              <h2 className="mt-3 text-4xl font-extrabold leading-tight sm:text-5xl">Plan your campus visit with our team.</h2>
              <p className="mt-4 text-base text-white/85">
                Meet educators, tour facilities, and map out your learner's admissions path.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <NavLink to="/contact#visit" className="btn-base btn-ripple rounded-2xl bg-white text-brand-goldText hover:bg-white/90">
                <FiCalendar className="h-4 w-4" aria-hidden="true" />
                Book a Visit
              </NavLink>
              <NavLink to="/admissions" className="btn-base rounded-2xl border border-white/30 bg-white/10 text-white hover:bg-white/15">
                Admissions Guide
              </NavLink>
            </div>
          </div>
        </div>
      </section>

      <section className="section-space bg-brand-sky">
        <div className="mx-auto max-w-7xl space-y-16 px-4">
          <div data-reveal>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="page-kicker">Social Proof</p>
                <h2 className="page-h2 mt-3">Latest stories from our community</h2>
              </div>
              <NavLink to="/news" className="btn-primary btn-ripple rounded-xl px-4 py-2 text-xs">
                View all updates
              </NavLink>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {previewNews.map((item) => (
                <NewsCard key={item.id || item.slug || item.title} item={item} />
              ))}
            </div>
          </div>

          <div data-reveal>
            <div className="max-w-2xl">
              <h3 className="page-h3">Parent and guardian testimonials</h3>
              <p className="page-body mt-3 text-base">Feedback from families in our school community.</p>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {testimonialList.length ? (
                testimonialList.map((item) => (
                  <Testimonial key={item.id || item.name} quote={item.quote} name={item.name} role={item.role} />
                ))
              ) : (
                <p className="text-sm text-slate-600">No testimonials yet. Be the first to share your experience.</p>
              )}
            </div>

            <div className="surface-card mt-8 p-6">
              <div>
                <p className="page-kicker">Share your story</p>
                <h3 className="page-h3 mt-2">Submit a testimonial</h3>
                <p className="page-muted mt-2">Your message will be reviewed before publication.</p>
              </div>

              <form
                className="mt-5 grid gap-3 sm:grid-cols-2"
                onSubmit={async (e) => {
                  e.preventDefault()
                  if (!testimonialForm.name || !testimonialForm.quote) return

                  try {
                    setTestimonialStatus('loading')
                    await submitTestimonial({
                      name: testimonialForm.name.trim(),
                      role: testimonialForm.role.trim(),
                      quote: testimonialForm.quote.trim(),
                    })
                    setTestimonialStatus('success')
                    setTestimonialForm({ name: '', role: '', quote: '' })
                  } catch (err) {
                    console.error(err)
                    setTestimonialStatus('error')
                  }
                }}
              >
                <label className="block">
                  <span className="text-xs font-semibold text-slate-700">Name</span>
                  <input
                    required
                    value={testimonialForm.name}
                    onChange={(e) => setTestimonialForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition duration-200 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30"
                    placeholder="Your name"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-semibold text-slate-700">Role / relationship</span>
                  <input
                    value={testimonialForm.role}
                    onChange={(e) => setTestimonialForm((prev) => ({ ...prev, role: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition duration-200 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30"
                    placeholder="Parent, guardian, alumnus"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="text-xs font-semibold text-slate-700">Testimonial</span>
                  <textarea
                    required
                    value={testimonialForm.quote}
                    onChange={(e) => setTestimonialForm((prev) => ({ ...prev, quote: e.target.value }))}
                    rows={3}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition duration-200 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30"
                    placeholder="Share your experience"
                  />
                </label>

                <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
                  <button type="submit" disabled={testimonialStatus === 'loading'} className="btn-primary btn-ripple rounded-xl px-4 py-2 text-xs disabled:opacity-70">
                    Submit for review
                  </button>
                  {testimonialStatus === 'success' ? (
                    <span className="text-xs font-semibold text-emerald-700">Thanks. We will review your testimonial soon.</span>
                  ) : null}
                  {testimonialStatus === 'error' ? (
                    <span className="text-xs font-semibold text-rose-600">Submission failed. Please try again.</span>
                  ) : null}
                </div>
              </form>
            </div>
          </div>

          <div data-reveal>
            <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
              <div className="surface-card p-6">
                <h3 className="page-h3">Leadership team</h3>
                <p className="page-muted mt-2">Guiding our mission of faith, discipline, and service.</p>
                {faculty.length ? (
                  <div className="mt-5 grid gap-4">
                    {faculty.slice(0, 3).map((member) => (
                      <BoardMemberCard key={member.id || member.name} member={member} />
                    ))}
                  </div>
                ) : (
                  <p className="mt-5 text-sm text-slate-600">No faculty profiles yet. Add members from the admin dashboard.</p>
                )}
              </div>

              <div className="surface-card p-6">
                <h3 className="page-h3">Partners and community</h3>
                <p className="page-muted mt-2">Organizations and families that support our learners.</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  {partners.length ? (
                    partners.map((partner) => (
                      <span
                        key={partner.name}
                        className="inline-flex flex-col rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-brand-navy"
                      >
                        {partner.name}
                        <span className="text-[11px] font-normal text-slate-500">{partner.note}</span>
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-slate-600">Community partner details will appear here.</p>
                  )}
                </div>

                <div className="section-separator my-6" />

                <div className="rounded-xl bg-red-50 p-4">
                  <p className="inline-flex items-center gap-2 text-sm font-bold text-brand-goldText">
                    <FiShield className="h-4 w-4" aria-hidden="true" />
                    Safe and supportive campus environment
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Faith-based teaching, structured discipline, and practical support for every student journey.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-space bg-white">
        <div className="mx-auto max-w-7xl px-4" data-reveal>
          <div className="surface-card bg-gradient-to-br from-red-700 to-rose-600 p-8 text-white sm:p-10">
            <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">Final CTA</p>
                <h2 className="mt-3 text-4xl font-extrabold leading-tight sm:text-5xl">Ready to begin your journey with us?</h2>
                <p className="mt-4 text-base text-white/85">
                  Learn admission steps, requirements, and support programs built for your learner.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <NavLink to="/admissions" className="btn-base btn-ripple rounded-2xl bg-white text-brand-goldText hover:bg-white/90">
                  Enroll Now
                </NavLink>
                <NavLink to="/contact" className="btn-base rounded-2xl border border-white/30 bg-white/10 text-white hover:bg-white/15">
                  Contact Us
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
