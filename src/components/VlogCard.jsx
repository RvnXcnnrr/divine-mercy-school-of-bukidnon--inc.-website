import { FiCalendar, FiExternalLink, FiPlay, FiShare2, FiTag } from 'react-icons/fi'

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })
  } catch {
    return iso
  }
}

function getYoutubeThumb(url) {
  if (!url) return null
  const match = url.match(/(?:v=|youtu\.be\/)([\w-]{6,})/)
  const id = match?.[1]
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null
}

export default function VlogCard({ item }) {
  const thumb = item.thumbnail_url || getYoutubeThumb(item.video_url)
  const shareUrl = item.share_url || item.video_url

  return (
    <article className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition-transform hover:-translate-y-0.5 dark:bg-slate-900 dark:ring-slate-800" data-reveal>
      <div className="relative aspect-video bg-slate-100 dark:bg-slate-800">
        {thumb ? (
          <img src={thumb} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-500">No thumbnail</div>
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-black/70 px-3 py-2 text-xs font-bold text-white shadow-lg backdrop-blur">
            <FiPlay className="h-4 w-4" aria-hidden="true" />
            Watch
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-brand-blue">
          {item.category ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-sky px-2 py-1 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
              <FiTag className="h-3.5 w-3.5" aria-hidden="true" />
              {item.category}
            </span>
          ) : null}
          {item.date ? (
            <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
              <FiCalendar className="h-3.5 w-3.5" aria-hidden="true" />
              {formatDate(item.date)}
            </span>
          ) : null}
        </div>

        <h3 className="mt-2 text-base font-extrabold text-brand-goldText">{item.title}</h3>
        {item.description ? <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 line-clamp-3">{item.description}</p> : null}

        <div className="mt-auto flex items-center justify-between pt-3 text-sm font-extrabold text-brand-goldText">
          <a
            className="inline-flex items-center gap-2 hover:text-brand-navy"
            href={item.video_url || '#'}
            target="_blank"
            rel="noreferrer"
          >
            <FiExternalLink className="h-4 w-4" aria-hidden="true" />
            Watch video
          </a>
          {shareUrl ? (
            <a
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-brand-goldText"
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noreferrer"
            >
              <FiShare2 className="h-4 w-4" aria-hidden="true" />
              Share
            </a>
          ) : null}
        </div>
      </div>
    </article>
  )
}
