import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiActivity, FiExternalLink, FiFileText, FiMessageCircle, FiPlayCircle, FiPlus, FiStar, FiZap } from 'react-icons/fi'
import { usePostsQuery } from '../../hooks/usePostsQuery.js'
import { fetchSubscribers } from '../../services/subscriberService.js'
import { fetchTestimonials } from '../../services/testimonialService.js'
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx'
import AdminStatCard from '../../components/admin/AdminStatCard.jsx'
import StatusBadge from '../../components/admin/StatusBadge.jsx'

function toDate(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function countWithinDays(items, days) {
  const now = Date.now()
  const range = days * 24 * 60 * 60 * 1000
  return items.filter((item) => {
    const date = toDate(item.created_at || item.updated_at)
    if (!date) return false
    return now - date.getTime() <= range
  }).length
}

function trendText(current, previous) {
  if (!previous && !current) return 'No activity this week'
  if (!previous && current > 0) return 'New activity this week'
  if (!previous) return 'No trend data'
  const delta = ((current - previous) / previous) * 100
  if (Math.abs(delta) < 1) return 'Stable this week'
  const sign = delta > 0 ? '+' : ''
  return `${sign}${Math.round(delta)}% this week`
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [pendingTestimonials, setPendingTestimonials] = useState(0)
  const [subscribers, setSubscribers] = useState(0)

  const { data: publishedData } = usePostsQuery({ status: 'published', limit: 200 })
  const { data: draftData } = usePostsQuery({ status: 'draft', limit: 200 })

  const publishedItems = useMemo(() => publishedData?.items || [], [publishedData?.items])
  const draftItems = useMemo(() => draftData?.items || [], [draftData?.items])

  const stats = useMemo(() => {
    const published = publishedItems.length
    const draftsCount = draftItems.length
    const featured = publishedItems.filter((post) => post.is_featured).length
    const vlogs = publishedItems.filter((post) => post.video_url).length

    const thisWeekPublished = countWithinDays(publishedItems, 7)
    const previousWeekPublished = Math.max(0, countWithinDays(publishedItems, 14) - thisWeekPublished)

    const thisWeekDrafts = countWithinDays(draftItems, 7)
    const previousWeekDrafts = Math.max(0, countWithinDays(draftItems, 14) - thisWeekDrafts)

    return [
      {
        label: 'Published',
        value: published,
        trend: trendText(thisWeekPublished, previousWeekPublished),
        icon: FiFileText,
        tint: 'rose',
      },
      {
        label: 'Drafts',
        value: draftsCount,
        trend: trendText(thisWeekDrafts, previousWeekDrafts),
        icon: FiZap,
        tint: 'slate',
      },
      {
        label: 'Featured',
        value: featured,
        trend: `${featured ? `${Math.round((featured / Math.max(published, 1)) * 100)}%` : '0%'} of published`,
        icon: FiStar,
        tint: 'blue',
      },
      {
        label: 'Vlogs',
        value: vlogs,
        trend: `${vlogs ? `${Math.round((vlogs / Math.max(published, 1)) * 100)}%` : '0%'} with media`,
        icon: FiPlayCircle,
        tint: 'emerald',
      },
    ]
  }, [publishedItems, draftItems])

  const recentPosts = useMemo(() => {
    return [...publishedItems, ...draftItems]
      .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
      .slice(0, 6)
  }, [publishedItems, draftItems])

  useEffect(() => {
    let active = true
    async function loadMeta() {
      const [{ data: pending }, { data: subscriberItems }] = await Promise.all([
        fetchTestimonials({ status: 'pending', limit: 200 }),
        fetchSubscribers(),
      ])
      if (!active) return
      setPendingTestimonials(pending?.length || 0)
      setSubscribers(subscriberItems?.length || 0)
    }
    loadMeta()
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dashboard Overview"
        description="Monitor publishing activity, moderation queue, and audience growth."
        actions={
          <>
            <button type="button" className="admin-button-secondary" onClick={() => navigate('/')}>
              <FiExternalLink className="h-4 w-4" aria-hidden="true" />
              View Site
            </button>
            <button type="button" className="admin-button-primary" onClick={() => navigate('/admin/posts/new')}>
              <FiPlus className="h-4 w-4" aria-hidden="true" />
              Create Post
            </button>
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <AdminStatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            trend={stat.trend}
            icon={stat.icon}
            tint={stat.tint}
          />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <article className="admin-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Recent Activity</h2>
            <FiActivity className="h-4 w-4 text-slate-400" aria-hidden="true" />
          </div>
          {recentPosts.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-sm text-slate-500">No recent post activity found.</p>
          ) : (
            <ul className="space-y-2">
              {recentPosts.map((post) => (
                <li
                  key={post.id}
                  className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{post.title || 'Untitled post'}</p>
                    <p className="text-xs text-slate-500">
                      Updated {new Date(post.updated_at || post.created_at).toLocaleString()}
                    </p>
                  </div>
                  <StatusBadge status={post.status || 'draft'} />
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="admin-card p-5">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Quick Actions</h2>
          <div className="space-y-2">
            <button type="button" className="admin-button-secondary w-full justify-start" onClick={() => navigate('/admin/posts/new')}>
              <FiPlus className="h-4 w-4" aria-hidden="true" />
              Create New Post
            </button>
            <button type="button" className="admin-button-secondary w-full justify-start" onClick={() => navigate('/admin/testimonials')}>
              <FiMessageCircle className="h-4 w-4" aria-hidden="true" />
              Manage Testimonials
            </button>
            <button type="button" className="admin-button-secondary w-full justify-start" onClick={() => navigate('/admin/posts')}>
              <FiFileText className="h-4 w-4" aria-hidden="true" />
              Review Posts
            </button>
          </div>
          <dl className="mt-5 space-y-3 rounded-xl bg-slate-50 p-4">
            <div className="flex items-center justify-between text-sm">
              <dt className="text-slate-600">Pending testimonials</dt>
              <dd className="font-semibold text-slate-900">{pendingTestimonials}</dd>
            </div>
            <div className="flex items-center justify-between text-sm">
              <dt className="text-slate-600">Total subscribers</dt>
              <dd className="font-semibold text-slate-900">{subscribers}</dd>
            </div>
          </dl>
        </article>
      </section>
    </div>
  )
}
