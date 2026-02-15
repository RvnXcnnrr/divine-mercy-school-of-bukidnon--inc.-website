import { useMemo, useState } from 'react'
import { FiFilter, FiSearch } from 'react-icons/fi'
import usePageMeta from '../hooks/usePageMeta.js'
import { usePostsQuery } from '../hooks/usePostsQuery.js'
import { useCategoriesQuery } from '../hooks/useCategoriesQuery.js'
import VlogCard from '../components/VlogCard.jsx'

export default function Vlogs() {
  usePageMeta({
    title: 'Vlogs',
    description: 'Watch the latest school vlogs: events, sports, academics, and campus life.',
  })
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const { data: categories = [] } = useCategoriesQuery()
  const { data, isLoading, isError, refetch } = usePostsQuery({
    hasVideo: true,
    categoryId: category === 'All' ? undefined : category,
    search: search || undefined,
    status: 'published',
    limit: 12,
  })

  const items = data?.items || []

  const categoryOptions = useMemo(() => [{ id: 'All', name: 'All' }, ...categories.map((c) => ({ id: c.id, name: c.name }))], [categories])

  return (
    <div>
      <section>
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between" data-reveal>
            <div className="max-w-2xl">
              <h1 className="gold-gradient-text text-3xl font-black tracking-tight sm:text-4xl">School Vlogs</h1>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                Latest highlights from events, sports, academics, and campus life.
              </p>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-extrabold text-brand-goldText ring-1 ring-slate-200 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 dark:bg-slate-900 dark:ring-slate-800 dark:hover:bg-slate-800"
            >
              <FiFilter className="h-4 w-4" aria-hidden="true" />
              Refresh feed
            </button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center" data-reveal>
            <label className="relative block">
              <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search vlogs"
                className="w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </label>
            <div className="flex flex-wrap gap-2" aria-label="Filter vlogs by category">
              {categoryOptions.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={[
                    'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-extrabold transition-colors ring-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2',
                    category === cat.id
                      ? 'gold-gradient-bg text-white ring-brand-gold/60'
                      : 'bg-white text-brand-goldText ring-slate-200 hover:bg-brand-sky dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700',
                  ].join(' ')}
                >
                  {cat.name}
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
          {isError ? (
            <p className="text-sm text-rose-600 dark:text-rose-400">Failed to load vlogs. Please check Supabase configuration.</p>
          ) : null}
          {isLoading ? (
            <p className="text-sm text-slate-600 dark:text-slate-300">Loading vlogs…</p>
          ) : null}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.length ? (
              items.map((item) => <VlogCard key={item.id || item.slug} item={item} />)
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-300">No vlogs yet. Add one from the admin panel.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
