import usePageMeta from '../hooks/usePageMeta.js'
import NewsCard from '../components/NewsCard.jsx'
import { newsItems } from '../data/siteContent.js'
import { FiPlusCircle } from 'react-icons/fi'

export default function News() {
  usePageMeta({
    title: 'News & Events',
    description: 'School news, events, and announcements from Divine Mercy School of Bukidnon, Inc.',
  })

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

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-extrabold text-brand-goldText ring-1 ring-slate-200 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 dark:bg-slate-900 dark:ring-slate-800 dark:hover:bg-slate-800"
              aria-disabled="true"
              title="Admin upload will be implemented later"
              onClick={() => {
                // Placeholder action until a CMS/admin portal is wired.
                window.alert('Admin upload will be implemented later (CMS/Admin Portal).')
              }}
            >
              <FiPlusCircle className="h-4 w-4 text-brand-blue" aria-hidden="true" />
              Admin: Upload latest
            </button>
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
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {newsItems.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
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
