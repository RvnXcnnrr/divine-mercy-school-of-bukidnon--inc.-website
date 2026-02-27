import { Fragment, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiChevronLeft, FiChevronRight, FiEdit2, FiFilter, FiPlus, FiSearch, FiStar, FiTrash } from 'react-icons/fi'
import { usePostsQuery } from '../../hooks/usePostsQuery.js'
import { deletePost, savePost, toggleFeatured } from '../../services/postService.js'
import ConfirmModal from '../../components/ConfirmModal.jsx'
import LoadingOverlay from '../../components/LoadingOverlay.jsx'

export default function AdminPosts() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [savingId, setSavingId] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])
  const [confirmModal, setConfirmModal] = useState({ open: false, action: null, message: '' })
  const [acting, setActing] = useState(false)

  const limit = 12

  const queryParams = useMemo(
    () => ({
      status: statusFilter === 'all' ? undefined : statusFilter,
      search: search || undefined,
      hasVideo: typeFilter === 'video' ? true : undefined,
      categorySlug: typeFilter === 'events' ? 'event' : undefined,
      limit,
      page,
    }),
    [statusFilter, typeFilter, search, page]
  )

  const { data, isLoading, isFetching, refetch } = usePostsQuery(queryParams, { keepPreviousData: true })
  const items = data?.items || []
  const total = data?.count || 0
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const hasNext = page < totalPages
  const hasPrev = page > 1

  async function onDelete(id) {
    setConfirmModal({
      open: true,
      action: async () => {
        await deletePost(id)
        refetch()
      },
      message: 'Delete this post?'
    })
  }

  async function onToggleFeatured(id, current) {
    await toggleFeatured(id, !current)
    refetch()
  }

  function startEdit(post) {
    setEditingId(post.id)
    setEditForm({
      title: post.title || '',
      content: post.content || '',
      category_id: post.category_id || post.category || post.category_slug || '',
      featured_image_url: post.featured_image_url || '',
      video_url: post.video_url || '',
      status: post.status || 'published',
      is_featured: Boolean(post.is_featured),
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm({})
  }

  async function handleSave(id) {
    setSavingId(id)
    try {
      const payload = {
        id,
        ...editForm,
        status: editForm.status || 'published',
        category_id: editForm.category_id || null,
        featured_image_url: editForm.featured_image_url || null,
        video_url: editForm.video_url || null,
      }
      await savePost(payload)
      cancelEdit()
      refetch()
    } catch (err) {
      alert(err.message || 'Failed to save')
    } finally {
      setSavingId(null)
    }
  }

  function toggleSelect(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function selectAllVisible() {
    const visibleIds = items.map((p) => p.id)
    const allSelected = visibleIds.every((id) => selectedIds.includes(id))
    setSelectedIds(allSelected ? selectedIds.filter((id) => !visibleIds.includes(id)) : [...new Set([...selectedIds, ...visibleIds])])
  }

  async function bulkDelete() {
    if (!selectedIds.length) return
    setConfirmModal({
      open: true,
      action: async () => {
        await Promise.all(selectedIds.map((id) => deletePost(id)))
        setSelectedIds([])
        refetch()
      },
      message: `Delete ${selectedIds.length} item(s)?`
    })
  }

  async function bulkStatus(nextStatus) {
    if (!selectedIds.length) return
    await Promise.all(
      selectedIds.map((id) =>
        savePost({ id, status: nextStatus }).catch((err) => {
          console.error('bulk update failed', err)
        })
      )
    )
    refetch()
  }

  async function deleteCloudinaryPosts() {
    const cloudinaryPosts = items.filter(
      (post) =>
        post.featured_image_url?.includes('cloudinary') ||
        post.gallery_images?.some((img) => img?.includes('cloudinary')) ||
        post.images?.some((img) => img?.includes('cloudinary'))
    )
    
    if (cloudinaryPosts.length === 0) {
      alert('No posts with Cloudinary images found on this page.')
      return
    }

    setConfirmModal({
      open: true,
      action: async () => {
        await Promise.all(cloudinaryPosts.map((post) => deletePost(post.id)))
        refetch()
      },
      message: `Found ${cloudinaryPosts.length} post(s) with old Cloudinary images. Delete them?`
    })
  }

  return (
    <>
    {(savingId !== null || acting) && (
      <LoadingOverlay message={acting ? 'Deleting…' : 'Saving…'} />
    )}
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-brand-goldText">Posts</h1>
          <p className="text-sm text-slate-600">Create, edit, and manage posts.</p>
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

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Search posts"
              className="w-60 rounded-md border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <FiFilter className="h-4 w-4" aria-hidden="true" /> Filters
            </span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="all">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value)
                setPage(1)
              }}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="all">All content</option>
              <option value="video">Video / Media</option>
              <option value="events">Events</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <button
              type="button"
              onClick={bulkDelete}
              disabled={!selectedIds.length}
              className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-3 py-2 text-white transition hover:opacity-90 disabled:opacity-50"
            >
              Delete selected
            </button>
            <button
              type="button"
              onClick={() => bulkStatus('published')}
              disabled={!selectedIds.length}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-2 text-white transition hover:opacity-90 disabled:opacity-50"
            >
              Mark published
            </button>
            <button
              type="button"
              onClick={() => bulkStatus('draft')}
              disabled={!selectedIds.length}
              className="inline-flex items-center gap-2 rounded-full bg-slate-200 px-3 py-2 text-slate-800 transition hover:bg-slate-300 disabled:opacity-50"
            >
              Mark draft
            </button>
            <button
              type="button"
              onClick={deleteCloudinaryPosts}
              className="inline-flex items-center gap-2 rounded-full bg-orange-600 px-3 py-2 text-white transition hover:opacity-90"
              title="Delete posts with old Cloudinary images"
            >
              <FiTrash className="h-3 w-3" />
              Clean Cloudinary
            </button>
          </div>
        </div>
      </div>

      {(isLoading || acting) && <LoadingOverlay message={acting ? 'Deleting…' : 'Loading posts…'} />}

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  aria-label="Select all visible"
                  onChange={selectAllVisible}
                  checked={items.length > 0 && items.every((p) => selectedIds.includes(p.id))}
                />
              </th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Featured</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3">Media</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {items.map((post) => (
              <Fragment key={post.id}>
                <tr className="text-sm text-slate-700">
                  <td className="px-4 py-3 align-top">
                    <input
                      type="checkbox"
                      aria-label={`Select ${post.title}`}
                      checked={selectedIds.includes(post.id)}
                      onChange={() => toggleSelect(post.id)}
                    />
                  </td>
                  <td className="px-4 py-3 font-semibold">{post.title}</td>
                  <td className="px-4 py-3 text-slate-600">{post.category || post.category_slug || post.category_id || '—'}</td>
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
                  <td className="px-4 py-3 text-slate-500">{new Date(post.updated_at || post.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {post.featured_image_url ? (
                      <img
                        src={post.featured_image_url}
                        alt={post.title}
                        className="h-12 w-20 rounded-md object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-xs text-slate-500">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {editingId === post.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleSave(post.id)}
                            disabled={savingId === post.id}
                            className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:opacity-60"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="inline-flex items-center gap-1 rounded-md bg-white px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => startEdit(post)}
                            className="inline-flex items-center gap-1 rounded-md bg-white px-3 py-2 text-xs font-semibold text-brand-goldText ring-1 ring-slate-200 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
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
                        </>
                      )}
                    </div>
                  </td>
                </tr>
                {editingId === post.id ? (
                  <tr className="bg-slate-50">
                    <td colSpan={8} className="px-4 py-4">
                      <div className="grid gap-3 lg:grid-cols-2">
                        <label className="text-xs font-semibold text-slate-600">
                          Title
                          <input
                            type="text"
                            value={editForm.title || ''}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                          />
                        </label>
                        <label className="text-xs font-semibold text-slate-600">
                          Category
                          <input
                            type="text"
                            value={editForm.category_id || ''}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, category_id: e.target.value }))}
                            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                            placeholder="Category or slug"
                          />
                        </label>
                        <label className="text-xs font-semibold text-slate-600">
                          Status
                          <select
                            value={editForm.status || 'draft'}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
                            className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                          >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                          </select>
                        </label>
                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                          <input
                            type="checkbox"
                            checked={Boolean(editForm.is_featured)}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, is_featured: e.target.checked }))}
                            className="h-4 w-4"
                          />
                          Featured on homepage
                        </label>
                        <label className="text-xs font-semibold text-slate-600 lg:col-span-2">
                          Content
                          <textarea
                            value={editForm.content || ''}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, content: e.target.value }))}
                            rows={4}
                            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                          />
                        </label>
                        <label className="text-xs font-semibold text-slate-600">
                          Image URL (Supabase Storage)
                          <input
                            type="url"
                            value={editForm.featured_image_url || ''}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, featured_image_url: e.target.value }))}
                            placeholder="https://your-project.supabase.co/storage/v1/object/public/posts/..."
                            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                          />
                        </label>
                        <label className="text-xs font-semibold text-slate-600">
                          Video URL
                          <input
                            type="url"
                            value={editForm.video_url || ''}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, video_url: e.target.value }))}
                            placeholder="https://youtube.com/watch?v=..."
                            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                          />
                        </label>
                      </div>
                      {savingId === post.id ? <p className="mt-3 text-xs text-slate-500">Saving…</p> : null}
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            ))}
          </tbody>
        </table>
        {items.length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-600">No posts yet.</p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
        <div>
          Page {page} of {totalPages} • Showing {items.length} of {total} items
          {isFetching ? <span className="ml-2 text-xs">Loading…</span> : null}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!hasPrev}
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <FiChevronLeft className="h-4 w-4" aria-hidden="true" /> Prev
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={!hasNext}
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Next <FiChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
          {totalPages > 3 ? (
            <div className="flex items-center gap-1 text-xs font-semibold">
              {[...Array(Math.min(totalPages, 5))].map((_, idx) => {
                const num = idx + 1
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPage(num)}
                    className={[
                      'h-8 w-8 rounded-full ring-1 ring-slate-200 transition',
                      page === num ? 'bg-brand-goldText text-white' : 'bg-white text-slate-700',
                    ].join(' ')}
                  >
                    {num}
                  </button>
                )
              })}
              {totalPages > 5 ? <span className="px-1">…</span> : null}
            </div>
          ) : null}
        </div>
      </div>

      <ConfirmModal
        open={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, action: null, message: '' })}
        onConfirm={async () => {
          if (confirmModal.action) {
            setConfirmModal({ open: false, action: null, message: '' })
            setActing(true)
            try {
              await confirmModal.action()
            } finally {
              setActing(false)
            }
          }
        }}
        title="Confirm Delete"
        message={confirmModal.message}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
    </>
  )
}
