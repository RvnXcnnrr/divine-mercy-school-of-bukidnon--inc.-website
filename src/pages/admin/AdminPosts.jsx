import { useNavigate } from 'react-router-dom'
import { FiEdit2, FiPlus, FiStar, FiTrash } from 'react-icons/fi'
import { usePostsQuery } from '../../hooks/usePostsQuery.js'
import { deletePost, toggleFeatured } from '../../services/postService.js'

export default function AdminPosts() {
  const navigate = useNavigate()
  const { data, isLoading, refetch } = usePostsQuery({ status: undefined, limit: 100 })
  const items = data?.items || []

  async function onDelete(id) {
    if (!window.confirm('Delete this post?')) return
    await deletePost(id)
    refetch()
  }

  async function onToggleFeatured(id, current) {
    await toggleFeatured(id, !current)
    refetch()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-brand-goldText">Posts</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">Create, edit, and manage posts.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin/posts/new')}
          className="inline-flex items-center gap-2 rounded-md bg-brand-goldText px-4 py-2 text-sm font-extrabold text-white transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
        >
          <FiPlus className="h-4 w-4" aria-hidden="true" />
          New Post
        </button>
      </div>

      {isLoading ? <p className="text-sm text-slate-600 dark:text-slate-300">Loading…</p> : null}

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Featured</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
            {items.map((post) => (
              <tr key={post.id} className="text-sm text-slate-700 dark:text-slate-200">
                <td className="px-4 py-3 font-semibold">{post.title}</td>
                <td className="px-4 py-3">
                  <span
                    className={[
                      'inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide',
                      post.status === 'published'
                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                        : 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
                    ].join(' ')}
                  >
                    {post.status || 'draft'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onToggleFeatured(post.id, post.is_featured)}
                    className={[
                      'inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide',
                      post.is_featured
                        ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-200'
                        : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
                    ].join(' ')}
                  >
                    <FiStar className="h-3.5 w-3.5" aria-hidden="true" />
                    {post.is_featured ? 'Featured' : 'Standard'}
                  </button>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{post.category || post.category_slug || post.category_id}</td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{new Date(post.updated_at || post.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/posts/${post.id}`)}
                      className="inline-flex items-center gap-1 rounded-md bg-white px-3 py-2 text-xs font-semibold text-brand-goldText ring-1 ring-slate-200 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 dark:bg-slate-800 dark:ring-slate-700"
                    >
                      <FiEdit2 className="h-4 w-4" aria-hidden="true" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(post.id)}
                      className="inline-flex items-center gap-1 rounded-md bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
                    >
                      <FiTrash className="h-4 w-4" aria-hidden="true" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-600 dark:text-slate-300">No posts yet.</p>
        ) : null}
      </div>
    </div>
  )
}
