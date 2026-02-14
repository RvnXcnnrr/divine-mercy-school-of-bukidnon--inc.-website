import { useEffect, useMemo, useState } from 'react'
import usePageMeta from '../hooks/usePageMeta.js'
import NewsCard from '../components/NewsCard.jsx'
import { newsItems as fallbackNews } from '../data/siteContent.js'

export default function News() {
  usePageMeta({
    title: 'News & Events',
    description: 'School news, events, and announcements from Divine Mercy School of Bukidnon, Inc.',
  })

  const [items, setItems] = useState([])
  const [selectedTag, setSelectedTag] = useState('All')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch('/news.json')
        if (!res.ok) throw new Error('Failed to load news.json')
        const data = await res.json()
        if (!cancelled) setItems(Array.isArray(data) ? data : [])
      } catch (err) {
        if (cancelled) return
        setItems(
          fallbackNews.map((n) => ({
            ...n,
            location: n.location || 'Campus',
            tags: n.tags || [n.category],
          }))
        )
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const tags = useMemo(() => {
    const set = new Set(['All'])
    items.forEach((item) => {
      if (item.category) set.add(item.category)
      if (Array.isArray(item.tags)) item.tags.forEach((t) => set.add(t))
    })
    return Array.from(set)
  }, [items])

  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  function matchesTag(item) {
    if (selectedTag === 'All') return true
    const set = new Set([item.category, ...(item.tags || [])].filter(Boolean))
    return set.has(selectedTag)
  }

  const [activeItems, pastItems] = useMemo(() => {
    const upcoming = []
    const past = []
    items.forEach((item) => {
      const date = item?.date ? new Date(item.date) : null
      const isPast = date ? date < today : false
      const bucket = isPast || item.status === 'past' ? past : upcoming
      bucket.push(item)
    })
    return [upcoming.filter(matchesTag), past.filter(matchesTag)]
  }, [items, today, selectedTag])

  return (
    <div>
      <section>
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between" data-reveal>
            <div className="max-w-2xl">
              <h1 className="gold-gradient-text text-3xl font-black tracking-tight sm:text-4xl">News & Events</h1>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                Updates on school activities, announcements, and community highlights.
              </p>
            </div>
            <div className="flex flex-wrap gap-2" aria-label="Filter news by tag">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={[
                    'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-extrabold transition-colors ring-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2',
                    selectedTag === tag
                      ? 'gold-gradient-bg text-white ring-brand-gold/60'
                      : 'bg-white text-brand-goldText ring-slate-200 hover:bg-brand-sky dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700',
                  ].join(' ')}
                >
                  {tag}
                </button>
              ))}
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
          <div className="max-w-2xl" data-reveal>
            <h2 className="gold-gradient-text text-2xl font-black tracking-tight">Latest & Upcoming</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Events and announcements you can act on now.</p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {activeItems.length ? (
              activeItems.map((item) => <NewsCard key={item.id} item={item} />)
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-300" data-reveal>No items for this filter.</p>)
            }
          </div>

          <div className="mt-12" data-reveal>
            <h3 className="text-lg font-extrabold text-brand-goldText">Past events archive</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">Recent past events for reference and documentation.</p>
          </div>
          <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {pastItems.length ? (
              pastItems.map((item) => <NewsCard key={`${item.id}-past`} item={item} />)
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-300" data-reveal>No past events for this filter.</p>)
            }
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
