import { FiArrowRight, FiCalendar, FiMapPin, FiTag } from 'react-icons/fi'

function formatDate(item) {
  const candidate = item?.date || item?.event_date || item?.created_at || item?.updated_at
  if (!candidate) return null
  const d = new Date(candidate)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })
}

export default function NewsCard({ item, compact = false }) {
  const categoryLabel = item.category || item.category_slug || item.category_id || 'Uncategorized'
  const dateLabel = formatDate(item)
  const image = item.featured_image_url || (item.gallery_images || item.images || [])[0]
  const hasImage = Boolean(image)
  return (
    <article
      className="flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md"
      data-reveal
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-brand-sky via-white to-brand-sky">
        {hasImage ? (
          <img src={image} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-white/85">Image coming soon</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" aria-hidden="true" />
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

      <div className="flex flex-1 flex-col p-5">
        {!hasImage ? (
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-sky px-3 py-1 font-semibold text-brand-goldText ring-1 ring-slate-200">
              <FiTag className="h-3.5 w-3.5" aria-hidden="true" />
              {categoryLabel}
            </span>
            {dateLabel ? (
              <span className="inline-flex items-center gap-1">
                <FiCalendar className="h-3.5 w-3.5 text-brand-blue" aria-hidden="true" />
                {dateLabel}
              </span>
            ) : null}
            {item.location ? (
              <span className="inline-flex items-center gap-1">
                <FiMapPin className="h-3.5 w-3.5 text-brand-blue" aria-hidden="true" />
                {item.location}
              </span>
            ) : null}
          </div>
        ) : null}

        <h3 className="mt-3 text-base font-extrabold text-brand-goldText">{item.title}</h3>
        {item.excerpt ? <p className="mt-2 text-sm text-slate-600 line-clamp-3">{item.excerpt}</p> : null}

        {Array.isArray(item.tags) && item.tags.length ? (
          <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wide text-brand-blue">
            {item.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-full bg-brand-sky px-2 py-1 ring-1 ring-slate-200">
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-brand-goldText">
          <span>Read update</span>
          <FiArrowRight className="h-4 w-4" aria-hidden="true" />
        </div>
      </div>
    </article>
  )
}
