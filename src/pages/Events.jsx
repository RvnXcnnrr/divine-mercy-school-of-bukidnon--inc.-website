import { useMemo, useState } from 'react'
import { FiCalendar, FiClock, FiLayout, FiList, FiStar } from 'react-icons/fi'
import usePageMeta from '../hooks/usePageMeta.js'
import { usePostsQuery } from '../hooks/usePostsQuery.js'
import EventCard from '../components/EventCard.jsx'

function toDate(value) {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function daysTo(value) {
  const parsed = toDate(value)
  if (!parsed) return null
  return Math.ceil((parsed.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

export default function Events() {
  usePageMeta({
    title: 'Events',
    description: 'Upcoming school events with dates, locations, and details.',
  })

  const [view, setView] = useState('timeline')
  const [now] = useState(() => Date.now())
  const { data, isLoading, isError } = usePostsQuery({ status: 'published', limit: 80 })

  const items = useMemo(() => {
    const source = data?.items || []
    return source
      .filter((item) => {
        const tag = (item.category_slug || item.category || item.category_id || '').toString().toLowerCase()
        return tag.includes('event')
      })
      .sort((a, b) => {
        const aDate = toDate(a.date)?.getTime() || 0
        const bDate = toDate(b.date)?.getTime() || 0
        return aDate - bDate
      })
  }, [data?.items])

  const upcoming = items.filter((item) => {
    const parsed = toDate(item.date)
    return parsed ? parsed.getTime() >= now - 1000 * 60 * 60 * 24 : true
  })
  const past = items.filter((item) => !upcoming.includes(item))

  const featuredEvent = upcoming[0] || items[0]
  const nextCountdown = daysTo(featuredEvent?.date)

  return (
    <div className="bg-brand-sky">
      <section className="section-space bg-gradient-to-br from-white via-red-50/35 to-rose-50/55">
        <div className="mx-auto max-w-7xl px-4" data-reveal>
          <p className="page-kicker">School Calendar</p>
          <h1 className="page-h1 mt-4">Events</h1>
          <p className="page-body mt-6 max-w-2xl">
            Stay current with upcoming school activities, celebrations, and community milestones.
          </p>
        </div>
      </section>

      {featuredEvent ? (
        <section className="pb-10">
          <div className="mx-auto max-w-7xl px-4" data-reveal>
            <div className="surface-card overflow-hidden bg-gradient-to-br from-red-700 to-rose-600 p-8 text-white sm:p-10">
              <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                    <FiStar className="h-3.5 w-3.5" aria-hidden="true" />
                    Featured Event
                  </p>
                  <h2 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">{featuredEvent.title}</h2>
                  <p className="mt-3 max-w-2xl text-sm text-white/85">{featuredEvent.excerpt || 'Details and schedule are now available.'}</p>
                </div>
                <div className="rounded-2xl bg-white/15 p-5 text-center ring-1 ring-white/20">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">Next Event</p>
                  <p className="mt-2 text-4xl font-extrabold">{nextCountdown != null ? Math.max(0, nextCountdown) : '--'}</p>
                  <p className="text-xs text-white/80">days remaining</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="section-space bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between" data-reveal>
            <div>
              <h2 className="page-h2">Upcoming Events Timeline</h2>
              <p className="page-muted mt-2">Switch between timeline and calendar card layouts.</p>
            </div>
            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setView('timeline')}
                className={[
                  'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-extrabold transition duration-200',
                  view === 'timeline' ? 'bg-white text-brand-goldText shadow-sm' : 'text-slate-600',
                ].join(' ')}
              >
                <FiList className="h-4 w-4" aria-hidden="true" />
                Timeline
              </button>
              <button
                type="button"
                onClick={() => setView('calendar')}
                className={[
                  'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-extrabold transition duration-200',
                  view === 'calendar' ? 'bg-white text-brand-goldText shadow-sm' : 'text-slate-600',
                ].join(' ')}
              >
                <FiLayout className="h-4 w-4" aria-hidden="true" />
                Calendar View
              </button>
            </div>
          </div>

          {isError ? <p className="mt-5 text-sm text-rose-600">Failed to load events.</p> : null}
          {isLoading ? <p className="mt-5 text-sm text-slate-600">Loading events...</p> : null}

          {upcoming.length ? (
            view === 'timeline' ? (
              <div className="relative mt-8 space-y-6">
                <span className="absolute left-[1.35rem] top-2 hidden h-[calc(100%-0.75rem)] w-px bg-slate-200 sm:block" aria-hidden="true" />
                {upcoming.map((item) => (
                  <EventCard key={item.id || item.slug} item={item} timeline />
                ))}
              </div>
            ) : (
              <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {upcoming.map((item) => (
                  <EventCard key={item.id || item.slug} item={item} />
                ))}
              </div>
            )
          ) : (
            <p className="mt-6 text-sm text-slate-600">No upcoming events yet. New schedules will appear here.</p>
          )}

          <div className="section-separator my-12" />

          <div data-reveal>
            <h3 className="page-h3">Past Events</h3>
            <p className="page-muted mt-2">Recent schedules and completed activities.</p>
            <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {past.length ? (
                past.slice(0, 6).map((item) => <EventCard key={`${item.id || item.slug}-past`} item={item} />)
              ) : (
                <p className="text-sm text-slate-600">No past events yet.</p>
              )}
            </div>
          </div>

          <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-5" data-reveal>
            <p className="inline-flex items-center gap-2 text-sm font-bold text-brand-goldText">
              <FiCalendar className="h-4 w-4" aria-hidden="true" />
              Calendar Notes
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Use "Add to Calendar" on each event to save reminders. Time and venue details are updated as schedules are finalized.
            </p>
            <p className="mt-2 inline-flex items-center gap-2 text-sm text-slate-500">
              <FiClock className="h-4 w-4" aria-hidden="true" />
              All schedules follow local campus time.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
