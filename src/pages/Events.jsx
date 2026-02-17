import usePageMeta from '../hooks/usePageMeta.js'
import { usePostsQuery } from '../hooks/usePostsQuery.js'
import EventCard from '../components/EventCard.jsx'

export default function Events() {
  usePageMeta({
    title: 'Events',
    description: 'Upcoming school events with dates, locations, and details.',
  })

  const { data, isLoading, isError } = usePostsQuery({ status: 'published', limit: 50 })
  const items = (data?.items || []).filter((item) => {
    const tag = (item.category_slug || item.category || item.category_id || '').toString().toLowerCase()
    return tag.includes('event')
  })

  return (
    <div>
      <section>
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="max-w-2xl" data-reveal>
            <h1 className="gold-gradient-text text-3xl font-black tracking-tight sm:text-4xl">Events</h1>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Stay updated with upcoming school events.</p>
          </div>
        </div>
      </section>

      <div className="w-full overflow-hidden bg-brand-sky leading-none dark:bg-slate-950" aria-hidden="true">
        <svg className="block h-8 w-full fill-current text-white dark:text-slate-900 sm:h-10" viewBox="0 0 1440 80" preserveAspectRatio="none" focusable="false">
          <path d="M0,32 C240,80 480,80 720,40 C960,0 1200,0 1440,32 L1440,80 L0,80 Z" />
        </svg>
      </div>

      <section className="bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-14">
          {isError ? <p className="text-sm text-rose-600 dark:text-rose-400">Failed to load events.</p> : null}
          {isLoading ? <p className="text-sm text-slate-600 dark:text-slate-300">Loading events…</p> : null}

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {items.length ? (
              items.map((item) => <EventCard key={item.id || item.slug} item={item} />)
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-300">No events yet. New schedules will appear here.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
