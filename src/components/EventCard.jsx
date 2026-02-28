import { useState } from 'react'
import { FiCalendar, FiClock, FiMapPin, FiPlusCircle } from 'react-icons/fi'

function toDate(value) {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function formatDate(iso) {
  const parsed = toDate(iso)
  if (!parsed) return 'TBA'
  return parsed.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

function dateBadgeParts(iso) {
  const parsed = toDate(iso)
  if (!parsed) return { month: 'TBA', day: '--' }
  return {
    month: parsed.toLocaleDateString(undefined, { month: 'short' }).toUpperCase(),
    day: String(parsed.getDate()).padStart(2, '0'),
  }
}

function toGoogleDate(value) {
  const parsed = toDate(value)
  if (!parsed) return null

  const yyyy = parsed.getUTCFullYear()
  const mm = String(parsed.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(parsed.getUTCDate()).padStart(2, '0')
  const hh = String(parsed.getUTCHours()).padStart(2, '0')
  const mi = String(parsed.getUTCMinutes()).padStart(2, '0')
  const ss = String(parsed.getUTCSeconds()).padStart(2, '0')

  return `${yyyy}${mm}${dd}T${hh}${mi}${ss}Z`
}

function buildGoogleCalendarUrl(item) {
  if (!item?.date) return null

  const start = toGoogleDate(item.date)
  if (!start) return null

  const endDate = new Date(item.date)
  if (!Number.isNaN(endDate.getTime())) {
    endDate.setHours(endDate.getHours() + 1)
  }
  const end = toGoogleDate(endDate.toISOString()) || start

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: item.title || 'School Event',
    details: item.excerpt || 'Event details from Divine Mercy School of Bukidnon.',
    location: item.location || 'Divine Mercy School of Bukidnon',
    dates: `${start}/${end}`,
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export default function EventCard({ item, timeline = false, showAddToCalendar = true, showCountdown = true }) {
  const [now] = useState(() => Date.now())
  const parsedDate = toDate(item.date)
  const badge = dateBadgeParts(item.date)
  const countdown = parsedDate ? Math.ceil((parsedDate.getTime() - now) / (1000 * 60 * 60 * 24)) : null
  const calendarUrl = buildGoogleCalendarUrl(item)

  if (timeline) {
    return (
      <article className="relative pl-14" data-reveal>
        <span className="absolute left-0 top-1 flex h-11 w-11 flex-col items-center justify-center rounded-xl bg-red-50 text-brand-goldText ring-1 ring-red-100">
          <span className="text-[10px] font-bold tracking-wide">{badge.month}</span>
          <span className="text-sm font-extrabold leading-none">{badge.day}</span>
        </span>
        <div className="surface-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="inline-flex items-center gap-2 text-sm font-bold text-brand-goldText">
              <FiCalendar className="h-4 w-4" aria-hidden="true" />
              {formatDate(item.date)}
            </p>
            {showCountdown && countdown != null ? (
              <span className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand-goldText ring-1 ring-red-100">
                {countdown >= 0 ? `${countdown} days left` : 'Past event'}
              </span>
            ) : null}
          </div>

          <h3 className="mt-3 text-2xl font-bold leading-snug text-brand-ink">{item.title}</h3>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
            {item.location ? (
              <span className="inline-flex items-center gap-1.5">
                <FiMapPin className="h-4 w-4 text-brand-goldText" aria-hidden="true" />
                {item.location}
              </span>
            ) : null}
            {item.time ? (
              <span className="inline-flex items-center gap-1.5">
                <FiClock className="h-4 w-4 text-brand-goldText" aria-hidden="true" />
                {item.time}
              </span>
            ) : null}
          </div>

          {item.excerpt ? <p className="mt-3 text-sm leading-7 text-slate-600">{item.excerpt}</p> : null}

          {showAddToCalendar && calendarUrl ? (
            <a
              href={calendarUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-brand-goldText transition duration-200 hover:-translate-y-0.5 hover:bg-slate-50"
            >
              <FiPlusCircle className="h-4 w-4" aria-hidden="true" />
              Add to Calendar
            </a>
          ) : null}
        </div>
      </article>
    )
  }

  return (
    <article className="surface-card surface-card-hover overflow-hidden p-5" data-reveal>
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-red-50 text-brand-goldText ring-1 ring-red-100">
          <span className="text-[10px] font-bold tracking-wide">{badge.month}</span>
          <span className="text-sm font-extrabold leading-none">{badge.day}</span>
        </span>
        {showCountdown && countdown != null ? (
          <span className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand-goldText ring-1 ring-red-100">
            {countdown >= 0 ? `${countdown} days left` : 'Past'}
          </span>
        ) : null}
      </div>

      <p className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-brand-goldText">
        <FiCalendar className="h-4 w-4" aria-hidden="true" />
        {formatDate(item.date)}
      </p>

      <h3 className="mt-2 text-2xl font-bold leading-snug text-brand-ink">{item.title}</h3>

      <div className="mt-3 space-y-1 text-sm text-slate-600">
        {item.location ? (
          <p className="inline-flex items-center gap-1.5">
            <FiMapPin className="h-4 w-4 text-brand-goldText" aria-hidden="true" />
            {item.location}
          </p>
        ) : null}
        {item.time ? (
          <p className="inline-flex items-center gap-1.5">
            <FiClock className="h-4 w-4 text-brand-goldText" aria-hidden="true" />
            {item.time}
          </p>
        ) : null}
      </div>

      {item.excerpt ? <p className="mt-3 text-sm leading-7 text-slate-600 line-clamp-3">{item.excerpt}</p> : null}

      {showAddToCalendar && calendarUrl ? (
        <a
          href={calendarUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-brand-goldText transition duration-200 hover:-translate-y-0.5 hover:bg-slate-50"
        >
          <FiPlusCircle className="h-4 w-4" aria-hidden="true" />
          Add to Calendar
        </a>
      ) : null}
    </article>
  )
}
