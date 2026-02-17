import { useEffect, useMemo, useState } from 'react'
import { FiMaximize2, FiSearch } from 'react-icons/fi'
import usePageMeta from '../hooks/usePageMeta.js'
import { usePostsQuery } from '../hooks/usePostsQuery.js'

export default function Gallery() {
  usePageMeta({
    title: 'Media Gallery',
    description: 'Image albums and highlights optimized with Cloudinary.',
  })
  const [search, setSearch] = useState('')
  const { data, isLoading, isError } = usePostsQuery({ status: 'published', search: search || undefined, limit: 50 })
  const items = data?.items || []
  const galleryItems = useMemo(() => {
    return items.flatMap((item) => {
      const images = [item.featured_image_url, ...(item.gallery_images || item.images || [])].filter(Boolean)
      return images.map((src, idx) => ({
        src,
        title: item.title,
        key: `${item.id || item.slug || 'item'}-${idx}`,
      }))
    })
  }, [items])
  const [active, setActive] = useState(null)

  useEffect(() => {
    if (!active) return undefined

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setActive(null)
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
  }, [active])

  return (
    <div>
      <section>
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between" data-reveal>
            <div>
              <h1 className="gold-gradient-text text-3xl font-black tracking-tight sm:text-4xl">Media Gallery</h1>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Browse optimized images served via Cloudinary CDN.</p>
            </div>
            <label className="relative block">
              <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search images"
                className="w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </label>
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
          {isError ? <p className="text-sm text-rose-600 dark:text-rose-400">Failed to load gallery.</p> : null}
          {isLoading ? <p className="text-sm text-slate-600 dark:text-slate-300">Loading images…</p> : null}

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {galleryItems.length ? (
              galleryItems.map((item) => (
                <button
                  type="button"
                  key={item.key}
                  onClick={() => setActive(item.src)}
                  className="group relative overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200 transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold dark:bg-slate-800 dark:ring-slate-700"
                >
                  <img src={item.src} alt={item.title || 'Gallery image'} className="h-40 w-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                    <FiMaximize2 className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                </button>
              ))
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-300">No media yet. Upload via the admin panel.</p>
            )}
          </div>
        </div>
      </section>

      {active ? (
        <div
          className="fixed inset-0 z-[200] bg-black/70 p-6 backdrop-blur"
          onClick={() => setActive(null)}
          aria-modal="true"
          role="dialog"
          aria-label="Image preview"
        >
          <div className="relative flex h-full items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setActive(null)}
              className="absolute right-2 top-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white ring-1 ring-white/20 transition hover:bg-black/75 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Close preview"
            >
              X
            </button>
            <img src={active} alt="Preview" className="max-h-full max-w-full rounded-xl shadow-2xl" loading="lazy" />
          </div>
        </div>
      ) : null}
    </div>
  )
}
