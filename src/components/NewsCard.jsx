import { FiArrowRight, FiCalendar, FiClock, FiMapPin, FiTag, FiUser } from 'react-icons/fi'

function formatDate(item) {
  const candidate = item?.date || item?.event_date || item?.created_at || item?.updated_at
  if (!candidate) return null
  const d = new Date(candidate)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })
}

function estimateReadTime(item) {
  if (item?.read_time) return String(item.read_time)
  const source = item?.content || item?.excerpt || ''
  const words = source.trim().split(/\s+/).filter(Boolean).length
  if (!words) return '2 min read'
  const mins = Math.max(1, Math.round(words / 180))
  return `${mins} min read`
}

export default function NewsCard({ item, featured = false }) {
  const categoryLabel = item.category || item.category_slug || item.category_id || 'Uncategorized'
  const dateLabel = formatDate(item)
  const image = item.featured_image_url || (item.gallery_images || item.images || [])[0]
  const hasImage = Boolean(image)
  const author = item.author_name || item.author || 'DMSB Desk'
  const readTime = estimateReadTime(item)

  return (
    <article
      className={[
        'surface-card surface-card-hover flex h-full flex-col overflow-hidden',
        featured ? 'lg:flex-row' : '',
      ].join(' ')}
      data-reveal
    >
      <div
        className={[
          'relative overflow-hidden bg-gradient-to-br from-brand-sky via-white to-red-50',
          featured ? 'lg:w-[47%]' : 'aspect-[4/3]',
        ].join(' ')}
      >
        {hasImage ? (
          <img
            src={image}
            alt={item.title}
            className={[
              'h-full w-full object-cover transition duration-300',
              featured ? 'min-h-[260px]' : 'group-hover:scale-105',
            ].join(' ')}
            loading="lazy"
          />
        ) : (
          <div className="flex h-full min-h-[220px] w-full items-center justify-center text-sm font-semibold text-slate-500">
            Image coming soon
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" aria-hidden="true" />

        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-white">
          <span className="inline-flex items-center gap-1 rounded-full bg-black/70 px-3 py-1 ring-1 ring-white/20">
            <FiTag className="h-3.5 w-3.5" aria-hidden="true" />
            {categoryLabel}
          </span>
          {dateLabel ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-3 py-1 ring-1 ring-white/15">
              <FiCalendar className="h-3.5 w-3.5" aria-hidden="true" />
              {dateLabel}
            </span>
          ) : null}
        </div>
      </div>

      <div className={['flex flex-1 flex-col p-5', featured ? 'lg:p-6' : ''].join(' ')}>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <FiUser className="h-3.5 w-3.5" aria-hidden="true" />
            {author}
          </span>
          <span className="inline-flex items-center gap-1">
            <FiClock className="h-3.5 w-3.5" aria-hidden="true" />
            {readTime}
          </span>
          {item.location ? (
            <span className="inline-flex items-center gap-1">
              <FiMapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {item.location}
            </span>
          ) : null}
        </div>

        <h3 className={featured ? 'mt-4 text-3xl font-bold leading-tight text-brand-ink' : 'mt-3 text-2xl font-bold leading-snug text-brand-ink'}>
          {item.title}
        </h3>
        {item.excerpt ? (
          <p className={featured ? 'mt-3 text-base leading-7 text-slate-600 line-clamp-4' : 'mt-2 text-sm text-slate-600 line-clamp-3'}>
            {item.excerpt}
          </p>
        ) : null}

        {Array.isArray(item.tags) && item.tags.length ? (
          <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
            {item.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-full bg-slate-100 px-2 py-1 ring-1 ring-slate-200">
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-brand-goldText">
          <span>Read update</span>
          <FiArrowRight className="h-4 w-4" aria-hidden="true" />
        </div>
      </div>
    </article>
  )
}
