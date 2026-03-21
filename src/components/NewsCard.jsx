import { NavLink } from 'react-router-dom'
import { FiArrowRight, FiCalendar, FiClock, FiMapPin, FiTag, FiUser } from 'react-icons/fi'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isUuidLike(value) {
  return UUID_PATTERN.test(String(value || '').trim())
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

function resolveCategoryLabel(item) {
  const direct = String(item?.category_name || item?.category || '').trim()
  if (direct && !isUuidLike(direct)) return direct

  const slug = String(item?.category_slug || '').trim()
  if (slug && !isUuidLike(slug)) return humanizeSlug(slug)

  return 'Uncategorized'
}

function formatDate(item) {
  const candidate = item?.date || item?.event_date || item?.created_at || item?.updated_at
  if (!candidate) return null
  const d = new Date(candidate)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })
}

function getPostUrl(item) {
  const identifier = String(item?.slug || item?.id || '').trim()
  if (!identifier) return '/news'
  return `/news/${encodeURIComponent(identifier)}`
}

export default function NewsCard({ item, featured = false }) {
  const categoryLabel = resolveCategoryLabel(item)
  const dateLabel = formatDate(item)
  const image = item.featured_image_url || (item.gallery_images || item.images || [])[0]
  const hasImage = Boolean(image)
  const author = String(item?.author_name || item?.author || '').trim()
  const readTime = String(item?.read_time || '').trim()
  const detailUrl = getPostUrl(item)

  return (
    <article
      className={[
        'group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg',
        featured ? 'lg:grid lg:grid-cols-[minmax(260px,42%)_1fr]' : '',
      ].join(' ')}
      data-reveal
    >
      <NavLink
        to={detailUrl}
        className={[
          'relative block overflow-hidden bg-slate-100',
          featured ? 'h-full min-h-[260px] lg:min-h-[320px]' : 'aspect-[16/10]',
        ].join(' ')}
      >
        {hasImage ? (
          <img
            src={image}
            alt={item.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full min-h-[220px] w-full items-center justify-center text-sm font-semibold text-slate-500">
            Image coming soon
          </div>
        )}
      </NavLink>

      <div className={['flex flex-1 flex-col p-5 sm:p-6', featured ? 'lg:justify-center' : ''].join(' ')}>
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 ring-1 ring-slate-200">
            <FiTag className="h-3.5 w-3.5" aria-hidden="true" />
            {categoryLabel}
          </span>
          {dateLabel ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 ring-1 ring-slate-200">
              <FiCalendar className="h-3.5 w-3.5" aria-hidden="true" />
              {dateLabel}
            </span>
          ) : null}
          {item.location ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 ring-1 ring-slate-200">
              <FiMapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {item.location}
            </span>
          ) : null}
        </div>

        <h3 className={featured ? 'mt-4 text-2xl font-extrabold leading-tight text-brand-ink sm:text-3xl' : 'mt-4 text-[1.8rem] font-extrabold leading-tight text-brand-ink'}>
          <NavLink to={detailUrl} className="transition hover:text-brand-goldText">
            {item.title}
          </NavLink>
        </h3>

        {item.excerpt ? (
          <p className={featured ? 'mt-4 text-base leading-7 text-slate-600 line-clamp-4' : 'mt-3 text-sm leading-6 text-slate-600 line-clamp-3'}>
            {item.excerpt}
          </p>
        ) : null}

        {author || readTime ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            {author ? (
              <span className="inline-flex items-center gap-1">
                <FiUser className="h-3.5 w-3.5" aria-hidden="true" />
                {author}
              </span>
            ) : null}
            {readTime ? (
              <span className="inline-flex items-center gap-1">
                <FiClock className="h-3.5 w-3.5" aria-hidden="true" />
                {readTime}
              </span>
            ) : null}
          </div>
        ) : null}

        <NavLink
          to={detailUrl}
          className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-extrabold text-brand-goldText transition hover:gap-2.5 hover:opacity-85"
        >
          <span>Read update</span>
          <FiArrowRight className="h-4 w-4" aria-hidden="true" />
        </NavLink>
      </div>
    </article>
  )
}
