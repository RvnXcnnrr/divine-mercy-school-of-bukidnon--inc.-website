import { useEffect, useMemo, useState } from 'react'
import { FiChevronLeft, FiChevronRight, FiMaximize2, FiSearch, FiX } from 'react-icons/fi'
import usePageMeta from '../hooks/usePageMeta.js'
import { usePostsQuery } from '../hooks/usePostsQuery.js'
import { fetchSiteContent } from '../services/siteInfoService.js'
import { readPublishedSiteManagementFromContent } from '../services/siteManagementService.js'

function normalizeCategory(value, fallback = 'General') {
  const cleaned = String(value || '').trim()
  return cleaned || fallback
}

function categoryKey(value) {
  return normalizeCategory(value).toLowerCase()
}

function dedupeCategoryLabels(labels = []) {
  const unique = []
  const seen = new Set()

  for (const label of labels) {
    const cleaned = normalizeCategory(label, '')
    if (!cleaned) continue
    const key = cleaned.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(cleaned)
  }

  return unique
}

function isFacultyImage(src = '') {
  const value = String(src).toLowerCase()
  return value.includes('/faculty/') || value.includes('bucket=faculty')
}

export default function Gallery() {
  usePageMeta({
    title: 'Media Gallery',
    description: 'Image albums and highlights with optimized storage.',
  })

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [activeIndex, setActiveIndex] = useState(-1)
  const [gallerySettings, setGallerySettings] = useState({
    categories: [],
    layout: 'masonry',
    enableLightbox: true,
    defaultCaption: 'Campus memory',
  })

  const { data, isLoading, isError } = usePostsQuery({ status: 'published', limit: 100 })
  const items = useMemo(() => data?.items || [], [data?.items])

  const galleryItems = useMemo(() => {
    const seenUrls = new Set()

    return items.flatMap((item) => {
      const rawImages = [item.featured_image_url, ...(item.gallery_images || item.images || [])]
      const uniqueImages = []

      for (const image of rawImages) {
        const src = String(image || '').trim()
        if (!src || isFacultyImage(src)) continue
        if (seenUrls.has(src)) continue
        seenUrls.add(src)
        uniqueImages.push(src)
      }

      const itemCategory = normalizeCategory(item.category || item.category_slug || item.category_id || 'General')

      return uniqueImages.map((src, idx) => ({
        src,
        title: item.title || gallerySettings.defaultCaption || 'Campus memory',
        category: itemCategory,
        key: `${item.id || item.slug || 'item'}-${idx}-${src}`,
      }))
    })
  }, [items, gallerySettings.defaultCaption])

  const categories = useMemo(() => {
    const managedLabels = (gallerySettings.categories || [])
      .filter((item) => item.isVisible !== false)
      .map((item) => item.name)
    const managed = dedupeCategoryLabels(managedLabels).filter((label) => categoryKey(label) !== 'all')

    if (managed.length) {
      return ['All', ...managed]
    }

    const discovered = dedupeCategoryLabels(galleryItems.map((item) => item.category))
      .filter((label) => categoryKey(label) !== 'all')

    return ['All', ...discovered]
  }, [galleryItems, gallerySettings.categories])

  const filteredItems = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return galleryItems.filter((item) => {
      const categoryMatch = category === 'All' || categoryKey(item.category) === categoryKey(category)
      const searchMatch =
        !needle ||
        item.title.toLowerCase().includes(needle) ||
        String(item.category).toLowerCase().includes(needle)
      return categoryMatch && searchMatch
    })
  }, [galleryItems, search, category])

  useEffect(() => {
    if (!categories.includes(category)) {
      setCategory('All')
    }
  }, [categories, category])

  const normalizedIndex = activeIndex >= 0 && filteredItems.length ? Math.min(activeIndex, filteredItems.length - 1) : -1
  const activeItem = normalizedIndex >= 0 ? filteredItems[normalizedIndex] : null

  useEffect(() => {
    if (!activeItem) return undefined

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setActiveIndex(-1)
      if (e.key === 'ArrowRight') setActiveIndex((idx) => (idx + 1) % filteredItems.length)
      if (e.key === 'ArrowLeft') setActiveIndex((idx) => (idx - 1 + filteredItems.length) % filteredItems.length)
    }

    const prevBody = document.body.style.overflow
    const prevHtml = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = prevBody
      document.documentElement.style.overflow = prevHtml
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [activeItem, filteredItems.length])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data } = await fetchSiteContent()
        if (!mounted || !data) return
        const settings = readPublishedSiteManagementFromContent(data)
        setGallerySettings((prev) => ({
          ...prev,
          ...(settings.gallerySettings || {}),
        }))
      } catch (err) {
        console.warn('[Gallery] using default settings', err)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="bg-brand-sky">
      <section className="section-space bg-gradient-to-br from-white via-red-50/35 to-rose-50/55">
        <div className="mx-auto max-w-7xl px-4" data-reveal>
          <p className="page-kicker">Media Archive</p>
          <h1 className="page-h1 mt-4">Gallery</h1>
          <p className="page-body mt-6 max-w-2xl">Masonry-style highlights from school life, events, and campus moments.</p>
        </div>
      </section>

      <section className="section-space bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between" data-reveal>
            <div className="flex-1">
              <label className="relative block max-w-md">
                <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search images"
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 outline-none transition duration-200 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30"
                />
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setCategory(option)}
                  className={[
                    'rounded-full px-3 py-1 text-xs font-extrabold transition duration-200',
                    category === option
                      ? 'gold-gradient-bg text-white'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                  ].join(' ')}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {isError ? <p className="mt-6 text-sm text-rose-600">Failed to load gallery.</p> : null}
          {isLoading ? <p className="mt-6 text-sm text-slate-600">Loading images...</p> : null}

          <div className={['mt-8 gap-4', gallerySettings.layout === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3' : 'columns-1 sm:columns-2 lg:columns-3'].join(' ')} data-reveal>
            {filteredItems.length ? (
              filteredItems.map((item, idx) => (
                <button
                  type="button"
                  key={item.key}
                  onClick={() => {
                    if (!gallerySettings.enableLightbox) return
                    setActiveIndex(idx)
                  }}
                  className={['group relative mb-4 block w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 text-left', gallerySettings.layout === 'grid' ? '' : 'break-inside-avoid'].join(' ')}
                >
                  <img
                    src={item.src}
                    alt={item.title || 'Gallery image'}
                    className="h-auto w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 transition duration-200 group-hover:opacity-100" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white opacity-0 transition duration-200 group-hover:opacity-100">
                    <p className="text-sm font-bold">{item.title}</p>
                    <p className="text-xs text-white/80">{item.category}</p>
                  </div>
                  <span className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition duration-200 group-hover:opacity-100">
                    <FiMaximize2 className="h-4 w-4" aria-hidden="true" />
                  </span>
                </button>
              ))
            ) : (
              <p className="text-sm text-slate-600">No media found for this filter.</p>
            )}
          </div>
        </div>
      </section>

      {gallerySettings.enableLightbox && activeItem ? (
        <div
          className="fixed inset-0 z-[200] bg-black/80 p-4 backdrop-blur-sm sm:p-6"
          onClick={() => setActiveIndex(-1)}
          aria-modal="true"
          role="dialog"
          aria-label="Image preview"
        >
          <div className="relative flex h-full items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setActiveIndex(-1)}
              className="absolute right-2 top-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white ring-1 ring-white/20 transition duration-200 hover:bg-black/80"
              aria-label="Close preview"
            >
              <FiX className="h-5 w-5" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => setActiveIndex((idx) => (idx - 1 + filteredItems.length) % filteredItems.length)}
              className="absolute left-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white ring-1 ring-white/20 transition duration-200 hover:bg-black/80"
              aria-label="Previous image"
            >
              <FiChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>

            <figure className="max-h-full max-w-6xl overflow-hidden rounded-2xl">
              <img src={activeItem.src} alt={activeItem.title || 'Preview'} className="max-h-[78vh] w-full object-contain" loading="lazy" />
              <figcaption className="bg-white px-4 py-3">
                <p className="text-sm font-bold text-brand-ink">{activeItem.title}</p>
                <p className="text-xs text-slate-500">{activeItem.category}</p>
              </figcaption>
            </figure>

            <button
              type="button"
              onClick={() => setActiveIndex((idx) => (idx + 1) % filteredItems.length)}
              className="absolute right-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white ring-1 ring-white/20 transition duration-200 hover:bg-black/80"
              aria-label="Next image"
            >
              <FiChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
