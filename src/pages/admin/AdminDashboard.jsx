import { useMemo } from 'react'
import { FiFileText, FiPlayCircle, FiStar, FiZap } from 'react-icons/fi'
import { usePostsQuery } from '../../hooks/usePostsQuery.js'

export default function AdminDashboard() {
  const { data } = usePostsQuery({ status: 'published', limit: 100 })
  const { data: drafts } = usePostsQuery({ status: 'draft', limit: 100 })

  const stats = useMemo(() => {
    const published = data?.items?.length || 0
    const draftsCount = drafts?.items?.length || 0
    const featured = (data?.items || []).filter((p) => p.is_featured).length
    const vlogs = (data?.items || []).filter((p) => p.video_url).length
    return [
      { label: 'Published', value: published, icon: FiFileText },
      { label: 'Drafts', value: draftsCount, icon: FiZap },
      { label: 'Featured', value: featured, icon: FiStar },
      { label: 'Vlogs', value: vlogs, icon: FiPlayCircle },
    ]
  }, [data, drafts])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-brand-goldText">Dashboard</h1>
        <p className="text-sm text-slate-600">Content overview at a glance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl bg-brand-sky p-4 ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-blue">{stat.label}</p>
              <stat.icon className="h-4 w-4 text-brand-goldText" aria-hidden="true" />
            </div>
            <p className="mt-2 text-2xl font-black text-brand-navy">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-600">
        Quick tips:
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>Use Supabase Storage for all image uploads with auto-compression.</li>
          <li>Mark a post as Featured to show on the homepage hero.</li>
          <li>Set status to Draft for content that is not ready to publish.</li>
        </ul>
      </div>
    </div>
  )
}
