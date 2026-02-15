import { useState } from 'react'
import { FiMaximize2, FiSearch } from 'react-icons/fi'
import usePageMeta from '../hooks/usePageMeta.js'
import { usePostsQuery } from '../hooks/usePostsQuery.js'

export default function Gallery() {
  usePageMeta({
    title: 'Media Gallery',
    description: 'Image albums and highlights optimized with Cloudinary.',
  })
  const [search, setSearch] = useState('')
  const { data, isLoading, isError } = usePostsQuery({ status: 'published', search: search || undefined, limit: 30 })
  const items = (data?.items || []).filter((p) => p.featured_image_url)
  const [active, setActive] = useState(null)

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
            {items.length ? (
              items.map((item) => (
                <button
                  type="button"
                  key={item.id || item.slug}
                  onClick={() => setActive(item.featured_image_url)}
                  className="group relative overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200 transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold dark:bg-slate-800 dark:ring-slate-700"
                >
                  <img src={item.featured_image_url} alt={item.title} className="h-40 w-full object-cover" loading="lazy" />
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
        <div className="fixed inset-0 z-[200] bg-black/70 p-6 backdrop-blur" onClick={() => setActive(null)} aria-modal="true" role="dialog">
          <div className="flex h-full items-center justify-center">
            <img src={active} alt="Preview" className="max-h-full max-w-full rounded-xl shadow-2xl" loading="lazy" />
          </div>
        </div>
      ) : null}
    </div>
  )
}
