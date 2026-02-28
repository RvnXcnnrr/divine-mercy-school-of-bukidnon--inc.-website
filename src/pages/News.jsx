import { useMemo, useState } from 'react'
import { FiChevronLeft, FiChevronRight, FiFilter, FiSearch } from 'react-icons/fi'
import usePageMeta from '../hooks/usePageMeta.js'
import NewsCard from '../components/NewsCard.jsx'
import { usePostsQuery } from '../hooks/usePostsQuery.js'
import { useCategoriesQuery } from '../hooks/useCategoriesQuery.js'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isUuidLike(value) {
  return UUID_PATTERN.test(String(value || '').trim())
}

function normalizeSlug(value = '') {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
}

function humanizeSlug(value = '') {
  const cleaned = String(value || '')
    .replace(/[-_]+/g, ' ')
    .trim()
  if (!cleaned) return ''
  return cleaned
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function safeCategoryName(item) {
  const direct = String(item?.category_name || item?.category || '').trim()
  if (direct && !isUuidLike(direct)) return direct

  const slug = String(item?.category_slug || '').trim()
  if (slug && !isUuidLike(slug)) return humanizeSlug(slug)

  return 'Uncategorized'
}

export default function News() {
  usePageMeta({
    title: 'News & Events',
    description: 'School news, events, and announcements from Divine Mercy School of Bukidnon.',
  })

  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 6

  const { data: categories = [] } = useCategoriesQuery()
  const categorySlug = category === 'All' ? undefined : category
  const { data, isLoading, isError } = usePostsQuery({
    status: 'published',
    categorySlug,
    search: search || undefined,
    limit: 80,
  })

  const items = useMemo(() => data?.items || [], [data?.items])

  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const [upcomingItems, pastItems] = useMemo(() => {
    const upcoming = []
    const past = []

    items.forEach((item) => {
      const date = item?.date ? new Date(item.date) : null
      const isPast = date ? date < today : false
      const bucket = isPast || item.status === 'past' ? past : upcoming
      bucket.push(item)
    })

    return [upcoming, past]
  }, [items, today])

  const tagOptions = useMemo(() => {
    const seen = new Set()
    const options = [{ id: 'All', name: 'All' }]

    function pushOption(rawId, rawName) {
      const name = String(rawName || '').trim()
      if (!name) return
      const normalizedId = String(rawId || '').trim()
      const id = normalizedId || normalizeSlug(name)
      if (!id) return
      const key = id.toLowerCase()
      if (key === 'all' || seen.has(key)) return
      seen.add(key)
      options.push({ id, name })
    }

    categories.forEach((categoryItem) => {
      const id = String(categoryItem.slug || categoryItem.id || '').trim()
      pushOption(id, categoryItem.name || humanizeSlug(id))
    })

    items.forEach((item) => {
      const name = safeCategoryName(item)
      const slug = String(item.category_slug || '').trim()
      const id = slug || normalizeSlug(name)
      pushOption(id, name)
    })

    return options
  }, [categories, items])

  const featuredItem = upcomingItems[0]
  const listingItems = upcomingItems.slice(1)
  const totalPages = Math.max(1, Math.ceil(listingItems.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pagedItems = listingItems.slice((safePage - 1) * pageSize, safePage * pageSize)

  return (
    <div className="bg-brand-sky">
      <section className="section-space bg-gradient-to-br from-white via-red-50/35 to-rose-50/55">
        <div className="mx-auto max-w-7xl px-4" data-reveal>
          <p className="page-kicker">Newsroom</p>
          <h1 className="page-h1 mt-4">News and Events</h1>
          <p className="page-body mt-6 max-w-2xl">
            Featured stories, announcements, and event updates for students, families, and the school community.
          </p>
        </div>
      </section>

      <section className="section-space bg-brand-sky">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="space-y-8">
              {isError ? <p className="text-sm text-rose-600">Failed to load posts.</p> : null}
              {isLoading ? <p className="text-sm text-slate-600">Loading posts...</p> : null}

              {featuredItem ? (
                <div data-reveal>
                  <p className="page-kicker">Featured Post</p>
                  <div className="mt-4">
                    <NewsCard item={featuredItem} featured />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-600" data-reveal>
                  No featured items for this filter.
                </p>
              )}

              <div data-reveal>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="page-h3">Latest Updates</h2>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {listingItems.length} total
                  </p>
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  {pagedItems.length ? (
                    pagedItems.map((item) => <NewsCard key={item.id || item.slug} item={item} />)
                  ) : (
                    <p className="text-sm text-slate-600">No updates for this filter.</p>
                  )}
                </div>

                {listingItems.length > pageSize ? (
                  <div className="mt-6 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPage((value) => Math.max(1, value - 1))}
                      disabled={safePage <= 1}
                      className="btn-secondary rounded-xl px-3 py-2 text-xs disabled:opacity-60"
                    >
                      <FiChevronLeft className="h-4 w-4" aria-hidden="true" />
                      Prev
                    </button>
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pageNumber = idx + 1
                      return (
                        <button
                          key={pageNumber}
                          type="button"
                          onClick={() => setPage(pageNumber)}
                          className={[
                            'inline-flex h-9 w-9 items-center justify-center rounded-xl text-xs font-extrabold transition duration-200',
                            pageNumber === safePage
                              ? 'gold-gradient-bg text-white'
                              : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                          ].join(' ')}
                        >
                          {pageNumber}
                        </button>
                      )
                    })}
                    <button
                      type="button"
                      onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                      disabled={safePage >= totalPages}
                      className="btn-secondary rounded-xl px-3 py-2 text-xs disabled:opacity-60"
                    >
                      Next
                      <FiChevronRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                ) : null}
              </div>

              <div data-reveal>
                <h3 className="page-h3">Past Archive</h3>
                <p className="page-muted mt-2">Recently completed events and announcements.</p>
                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  {pastItems.length ? (
                    pastItems.slice(0, 6).map((item) => <NewsCard key={`${item.id || item.slug}-past`} item={item} />)
                  ) : (
                    <p className="text-sm text-slate-600">No past events for this filter.</p>
                  )}
                </div>
              </div>
            </div>

            <aside className="space-y-5" data-reveal>
              <div className="surface-card p-5">
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <FiSearch className="h-3.5 w-3.5" aria-hidden="true" />
                  Search
                </p>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  placeholder="Search posts"
                  className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition duration-200 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30"
                />
              </div>

              <div className="surface-card p-5">
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <FiFilter className="h-3.5 w-3.5" aria-hidden="true" />
                  Filters
                </p>
                <div className="mt-3 flex flex-wrap gap-2" aria-label="Filter news by category">
                  {tagOptions.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => {
                        setCategory(tag.id)
                        setPage(1)
                      }}
                      className={[
                        'rounded-full px-3 py-1 text-xs font-extrabold transition duration-200',
                        category === tag.id
                          ? 'gold-gradient-bg text-white'
                          : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                      ].join(' ')}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="surface-card p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Quick Stats</p>
                <dl className="mt-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-slate-600">Published</dt>
                    <dd className="text-lg font-extrabold text-brand-goldText">{items.length}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-slate-600">Upcoming</dt>
                    <dd className="text-lg font-extrabold text-brand-goldText">{upcomingItems.length}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-slate-600">Archive</dt>
                    <dd className="text-lg font-extrabold text-brand-goldText">{pastItems.length}</dd>
                  </div>
                </dl>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  )
}
