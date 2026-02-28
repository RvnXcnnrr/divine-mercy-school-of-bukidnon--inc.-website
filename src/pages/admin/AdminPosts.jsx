import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiCheckSquare, FiEdit2, FiFilter, FiLoader, FiPlus, FiSearch, FiStar, FiTrash2 } from 'react-icons/fi'
import { usePostsQuery } from '../../hooks/usePostsQuery.js'
import { deletePost, savePost, toggleFeatured } from '../../services/postService.js'
import ConfirmModal from '../../components/ConfirmModal.jsx'
import LoadingOverlay from '../../components/LoadingOverlay.jsx'
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx'
import AdminPagination from '../../components/admin/AdminPagination.jsx'
import StatusBadge from '../../components/admin/StatusBadge.jsx'

export default function AdminPosts() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedIds, setSelectedIds] = useState([])
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    action: null,
    message: '',
    title: 'Confirm Action',
    variant: 'default',
  })
  const [acting, setActing] = useState(false)
  const [rowAction, setRowAction] = useState({ id: null, type: null })

  const queryParams = useMemo(
    () => ({
      status: statusFilter === 'all' ? undefined : statusFilter,
      search: search || undefined,
      hasVideo: typeFilter === 'video' ? true : undefined,
      categorySlug: typeFilter === 'events' ? 'event' : undefined,
      limit: pageSize,
      page,
    }),
    [statusFilter, typeFilter, search, pageSize, page]
  )

  const { data, isLoading, isFetching, refetch } = usePostsQuery(queryParams, { keepPreviousData: true })
  const items = data?.items || []
  const total = data?.count || 0
  const allVisibleSelected = items.length > 0 && items.every((post) => selectedIds.includes(post.id))
  const selectedCount = selectedIds.length

  function openConfirm({ title, message, action, variant = 'default' }) {
    setConfirmModal({ open: true, title, message, action, variant })
  }

  function resetConfirm() {
    setConfirmModal({ open: false, action: null, message: '', title: 'Confirm Action', variant: 'default' })
  }

  async function onDelete(id) {
    openConfirm({
      title: 'Delete Post',
      message: 'Delete this post permanently?',
      variant: 'danger',
      action: async () => {
        await deletePost(id)
        setSelectedIds((prev) => prev.filter((itemId) => itemId !== id))
        await refetch()
      },
    })
  }

  async function onToggleFeatured(id, current) {
    setRowAction({ id, type: 'featured' })
    try {
      await toggleFeatured(id, !current)
      await refetch()
    } catch (error) {
      alert(error.message || 'Failed to update featured status.')
    } finally {
      setRowAction({ id: null, type: null })
    }
  }

  function toggleSelect(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]))
  }

  function selectAllVisible() {
    const visibleIds = items.map((post) => post.id)
    setSelectedIds((prev) => {
      const currentlySelected = visibleIds.every((id) => prev.includes(id))
      return currentlySelected ? prev.filter((id) => !visibleIds.includes(id)) : [...new Set([...prev, ...visibleIds])]
    })
  }

  async function runBulkDelete() {
    if (!selectedIds.length) return
    openConfirm({
      title: 'Delete Selected Posts',
      message: `Delete ${selectedIds.length} selected post(s)?`,
      variant: 'danger',
      action: async () => {
        await Promise.all(selectedIds.map((id) => deletePost(id)))
        setSelectedIds([])
        await refetch()
      },
    })
  }

  function runBulkStatus(nextStatus) {
    if (!selectedIds.length) return
    openConfirm({
      title: 'Update Status',
      message: `Mark ${selectedIds.length} selected post(s) as ${nextStatus}?`,
      action: async () => {
        await Promise.all(
          selectedIds.map((id) =>
            savePost({ id, status: nextStatus }).catch((error) => {
              console.error('Bulk status update failed', error)
            })
          )
        )
        await refetch()
      },
    })
  }

  return (
    <>
      {(isLoading || acting) && <LoadingOverlay message={acting ? 'Applying changes...' : 'Loading posts...'} />}

      <div className="space-y-4">
        <AdminPageHeader
          title="Posts Management"
          description="Search, filter, bulk-edit, and publish content with fewer clicks."
          actions={
            <button type="button" onClick={() => navigate('/admin/posts/new')} className="admin-button-primary">
              <FiPlus className="h-4 w-4" aria-hidden="true" />
              New Post
            </button>
          }
        />

        <section className="admin-card p-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full max-w-md">
                <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value)
                    setPage(1)
                  }}
                  placeholder="Search posts by title..."
                  className="admin-input pl-9"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  <FiFilter className="h-4 w-4" aria-hidden="true" />
                  Filters
                </span>
                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value)
                    setPage(1)
                  }}
                  className="admin-input min-w-36 py-2"
                >
                  <option value="all">All statuses</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(event) => {
                    setTypeFilter(event.target.value)
                    setPage(1)
                  }}
                  className="admin-input min-w-36 py-2"
                >
                  <option value="all">All content</option>
                  <option value="video">Video / Media</option>
                  <option value="events">Events</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <p className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
                <FiCheckSquare className="h-4 w-4" aria-hidden="true" />
                {selectedCount} selected
              </p>
              <button type="button" onClick={runBulkDelete} disabled={!selectedCount} className="admin-button-danger">
                Delete selected
              </button>
              <button type="button" onClick={() => runBulkStatus('published')} disabled={!selectedCount} className="admin-button-secondary">
                Mark published
              </button>
              <button type="button" onClick={() => runBulkStatus('draft')} disabled={!selectedCount} className="admin-button-secondary">
                Mark draft
              </button>
            </div>
          </div>
        </section>

        <section className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <div className="max-h-[64vh] overflow-auto">
              <table className="min-w-[920px] w-full border-separate border-spacing-0">
                <thead className="sticky top-0 z-10 bg-white">
                  <tr className="text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                    <th className="border-b border-slate-200 px-4 py-3">
                      <input
                        type="checkbox"
                        aria-label="Select all visible posts"
                        checked={allVisibleSelected}
                        onChange={selectAllVisible}
                        className="h-4 w-4 rounded border-slate-300 text-brand-goldText focus:ring-brand-goldText"
                      />
                    </th>
                    <th className="border-b border-slate-200 px-4 py-3">Title</th>
                    <th className="border-b border-slate-200 px-4 py-3">Category</th>
                    <th className="border-b border-slate-200 px-4 py-3">Status</th>
                    <th className="border-b border-slate-200 px-4 py-3">Featured</th>
                    <th className="border-b border-slate-200 px-4 py-3">Updated</th>
                    <th className="border-b border-slate-200 px-4 py-3">Media</th>
                    <th className="border-b border-slate-200 px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((post, index) => (
                    <tr
                      key={post.id}
                      className={[
                        'text-sm text-slate-700 transition hover:bg-rose-50/40',
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50/45',
                      ].join(' ')}
                    >
                      <td className="border-b border-slate-100 px-4 py-3 align-top">
                        <input
                          type="checkbox"
                          aria-label={`Select ${post.title}`}
                          checked={selectedIds.includes(post.id)}
                          onChange={() => toggleSelect(post.id)}
                          className="h-4 w-4 rounded border-slate-300 text-brand-goldText focus:ring-brand-goldText"
                        />
                      </td>
                      <td className="border-b border-slate-100 px-4 py-3">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/posts/${post.id}`)}
                          className="max-w-[320px] truncate text-left font-semibold text-slate-900 transition hover:text-brand-goldText"
                          title={post.title}
                        >
                          {post.title || 'Untitled'}
                        </button>
                      </td>
                      <td className="border-b border-slate-100 px-4 py-3 text-slate-600">
                        {post.category || post.category_slug || post.category_id || '-'}
                      </td>
                      <td className="border-b border-slate-100 px-4 py-3">
                        <StatusBadge status={post.status || 'draft'} />
                      </td>
                      <td className="border-b border-slate-100 px-4 py-3">
                        {post.is_featured ? <StatusBadge status="featured" /> : <span className="text-xs text-slate-500">Standard</span>}
                      </td>
                      <td className="border-b border-slate-100 px-4 py-3 text-slate-500">
                        {new Date(post.updated_at || post.created_at).toLocaleDateString()}
                      </td>
                      <td className="border-b border-slate-100 px-4 py-3 text-slate-500">
                        {post.featured_image_url ? (
                          <img src={post.featured_image_url} alt="" className="h-10 w-16 rounded-lg object-cover ring-1 ring-slate-200" loading="lazy" />
                        ) : (
                          <span className="text-xs">-</span>
                        )}
                      </td>
                      <td className="border-b border-slate-100 px-4 py-3 text-right">
                        <RowActions
                          onEdit={() => navigate(`/admin/posts/${post.id}`)}
                          onToggleFeatured={() => onToggleFeatured(post.id, post.is_featured)}
                          onDelete={() => onDelete(post.id)}
                          featured={Boolean(post.is_featured)}
                          busy={rowAction.id === post.id}
                          busyType={rowAction.id === post.id ? rowAction.type : null}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-500">No posts found for the current filters.</div>
          ) : null}
        </section>

        <AdminPagination
          page={page}
          pageSize={pageSize}
          totalItems={total}
          itemLabel="posts"
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPage(1)
          }}
          isLoading={isFetching}
        />
      </div>

      <ConfirmModal
        open={confirmModal.open}
        onClose={resetConfirm}
        onConfirm={async () => {
          if (!confirmModal.action) return
          setActing(true)
          try {
            await confirmModal.action()
          } finally {
            setActing(false)
            resetConfirm()
          }
        }}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Continue"
        cancelText="Cancel"
        variant={confirmModal.variant}
      />
    </>
  )
}

function RowActions({ onEdit, onToggleFeatured, onDelete, featured, busy, busyType }) {
  return (
    <div className="inline-flex items-center justify-end gap-1.5">
      <IconActionButton
        onClick={onEdit}
        icon={FiEdit2}
        label="Edit post"
        className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
        disabled={busy}
      />
      <IconActionButton
        onClick={onToggleFeatured}
        icon={busyType === 'featured' ? FiLoader : FiStar}
        label={featured ? 'Remove featured' : 'Mark as featured'}
        className={
          featured
            ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
            : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
        }
        disabled={busy}
        spin={busyType === 'featured'}
      />
      <IconActionButton
        onClick={onDelete}
        icon={FiTrash2}
        label="Delete post"
        className="border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
        disabled={busy}
      />
    </div>
  )
}

function IconActionButton({ onClick, icon: Icon, label, className, disabled = false, spin = false }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onClick?.()
      }}
      aria-label={label}
      title={label}
      disabled={disabled}
      className={[
        'inline-flex h-8 w-8 items-center justify-center rounded-lg border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-goldText focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
        className,
      ].join(' ')}
    >
      <Icon className={['h-4 w-4', spin ? 'animate-spin' : ''].join(' ')} aria-hidden="true" />
    </button>
  )
}
