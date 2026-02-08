import { FiArrowRight, FiCalendar, FiTag } from 'react-icons/fi'

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    })
  } catch {
    return iso
  }
}

export default function NewsCard({ item, compact = false }) {
  return (
    <article
      className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition-transform hover:-translate-y-0.5 dark:bg-slate-900 dark:ring-slate-800"
      data-reveal
    >
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-sky px-3 py-1 font-semibold text-brand-goldText ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
          <FiTag className="h-3.5 w-3.5" aria-hidden="true" />
          {item.category}
        </span>
        <span className="inline-flex items-center gap-1">
          <FiCalendar className="h-3.5 w-3.5 text-brand-blue" aria-hidden="true" />
          {formatDate(item.date)}
        </span>
      </div>

      <h3 className="mt-3 text-base font-extrabold text-brand-goldText">{item.title}</h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.excerpt}</p>

      <div className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-brand-goldText">
        <span>Read update</span>
        <FiArrowRight className="h-4 w-4" aria-hidden="true" />
      </div>
    </article>
  )
}
