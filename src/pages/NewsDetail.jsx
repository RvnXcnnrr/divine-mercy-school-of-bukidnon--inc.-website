import { useEffect, useMemo, useState } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { FiArrowLeft, FiCalendar, FiMapPin, FiTag } from 'react-icons/fi'
import usePageMeta from '../hooks/usePageMeta.js'
import { fetchPostById } from '../services/postService.js'

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
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: '2-digit' })
}

export default function NewsDetail() {
  const { idOrSlug = '' } = useParams()
  const [post, setPost] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const decodedIdentifier = useMemo(() => decodeURIComponent(idOrSlug), [idOrSlug])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setIsLoading(true)
      setErrorMessage('')
      try {
        const { data } = await fetchPostById(decodedIdentifier)
        if (!mounted) return
        setPost(data || null)
      } catch (error) {
        if (!mounted) return
        setPost(null)
        setErrorMessage(error?.message || 'Failed to load update.')
      } finally {
        if (mounted) setIsLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [decodedIdentifier])

  usePageMeta({
    title: post?.title || 'Update',
    description: post?.excerpt || 'Read the latest school update from Divine Mercy School of Bukidnon.',
  })

  if (isLoading) {
    return (
      <div className="bg-slate-50">
        <section className="py-16">
          <div className="mx-auto max-w-[900px] px-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-600">Loading update...</p>
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="bg-slate-50">
        <section className="py-16">
          <div className="mx-auto max-w-[900px] px-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-rose-600">{errorMessage || 'Update not found.'}</p>
              <NavLink to="/news" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-goldText hover:opacity-85">
                <FiArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to updates
              </NavLink>
            </div>
          </div>
        </section>
      </div>
    )
  }

  const image = post.featured_image_url || (post.gallery_images || post.images || [])[0]
  const categoryLabel = resolveCategoryLabel(post)
  const dateLabel = formatDate(post)
  const content = String(post.content || '').trim()
  const paragraphs = content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\n+/g, ' ').trim())
    .filter(Boolean)

  return (
    <div className="bg-slate-50">
      <section className="py-12 sm:py-16">
        <article className="mx-auto max-w-[900px] px-4" data-reveal>
          <NavLink to="/news" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-goldText transition hover:opacity-85">
            <FiArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to updates
          </NavLink>

          <header className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h1 className="text-3xl font-extrabold leading-tight text-brand-ink sm:text-5xl">{post.title || 'School update'}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 ring-1 ring-slate-200">
                <FiTag className="h-3.5 w-3.5" aria-hidden="true" />
                {categoryLabel}
              </span>
              {dateLabel ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 ring-1 ring-slate-200">
                  <FiCalendar className="h-3.5 w-3.5" aria-hidden="true" />
                  {dateLabel}
                </span>
              ) : null}
              {post.location ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 ring-1 ring-slate-200">
                  <FiMapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  {post.location}
                </span>
              ) : null}
            </div>
            {post.excerpt ? <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">{post.excerpt}</p> : null}
          </header>

          {image ? (
            <figure className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <img
                src={image}
                alt={post.title || 'Update image'}
                className="mx-auto h-auto max-h-[560px] w-full object-cover"
                loading="lazy"
              />
            </figure>
          ) : null}

          {paragraphs.length ? (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="news-article-body text-base text-slate-700">
                {paragraphs.map((paragraph, idx) => (
                  <p key={`${idx}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
                ))}
              </div>
            </div>
          ) : null}
        </article>
      </section>
    </div>
  )
}
