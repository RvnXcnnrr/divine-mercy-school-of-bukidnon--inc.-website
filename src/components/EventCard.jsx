import { FiCalendar, FiClock, FiMapPin } from 'react-icons/fi'

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: '2-digit' })
  } catch {
    return iso
  }
}

export default function EventCard({ item }) {
  const countdown = item.date ? Math.floor((new Date(item.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null

  return (
    <article className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition-transform hover:-translate-y-0.5 dark:bg-slate-900 dark:ring-slate-800" data-reveal>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-extrabold text-brand-goldText">
          <FiCalendar className="h-4 w-4" aria-hidden="true" />
          {item.date ? formatDate(item.date) : 'TBA'}
        </div>
        {countdown != null ? (
          <span className="rounded-full bg-brand-sky px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand-blue ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
            {countdown >= 0 ? `${countdown} days left` : 'Past'}
          </span>
        ) : null}
      </div>

      <h3 className="mt-2 text-base font-extrabold text-brand-goldText">{item.title}</h3>
      {item.location ? (
        <p className="mt-1 inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <FiMapPin className="h-4 w-4 text-brand-blue" aria-hidden="true" />
          {item.location}
        </p>
      ) : null}
      {item.time ? (
        <p className="mt-1 inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <FiClock className="h-4 w-4 text-brand-blue" aria-hidden="true" />
          {item.time}
        </p>
      ) : null}
      {item.excerpt ? <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-3">{item.excerpt}</p> : null}
    </article>
  )
}
