import { useCallback, useEffect, useMemo, useState } from 'react'
import { FiCheck, FiClock, FiRefreshCw, FiSearch, FiTrash2, FiX } from 'react-icons/fi'
import { deleteTestimonial, fetchTestimonials, updateTestimonialStatus } from '../../services/testimonialService.js'
import LoadingOverlay from '../../components/LoadingOverlay.jsx'
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx'
import StatusBadge from '../../components/admin/StatusBadge.jsx'

const STATUSES = ['pending', 'approved', 'rejected']

function matchesDateRange(item, from, to) {
  if (!from && !to) return true
  const timestamp = new Date(item.created_at).getTime()
  if (Number.isNaN(timestamp)) return false

  const fromTs = from ? new Date(from).getTime() : null
  const toTs = to ? new Date(to).getTime() : null

  if (fromTs && timestamp < fromTs) return false
  if (toTs) {
    const inclusiveEnd = toTs + 24 * 60 * 60 * 1000 - 1
    if (timestamp > inclusiveEnd) return false
  }
  return true
}

export default function AdminTestimonials() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actingId, setActingId] = useState(null)
  const [statusFilter, setStatusFilter] = useState('pending')
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const { data, error: fetchError } = await fetchTestimonials({ status: statusFilter, limit: 400 })
    if (fetchError) setError(fetchError.message || 'Failed to load testimonials')
    setItems(data || [])
    setLoading(false)
  }, [statusFilter])

  useEffect(() => {
    load()
  }, [load])

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase()
    return items.filter((item) => {
      const haystack = `${item.name || ''} ${item.role || ''} ${item.quote || ''}`.toLowerCase()
      const searchMatch = !term || haystack.includes(term)
      return searchMatch && matchesDateRange(item, dateFrom, dateTo)
    })
  }, [items, search, dateFrom, dateTo])

  async function handleStatus(id, status) {
    setActingId(id)
    setError('')
    try {
      await updateTestimonialStatus(id, status)
      await load()
    } catch (err) {
      setError(err.message || 'Update failed')
    } finally {
      setActingId(null)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this testimonial?')) return
    setActingId(id)
    setError('')
    try {
      await deleteTestimonial(id)
      await load()
    } catch (err) {
      setError(err.message || 'Delete failed')
    } finally {
      setActingId(null)
    }
  }

  return (
    <>
      {(loading || actingId !== null) && <LoadingOverlay message={loading ? 'Loading testimonials...' : 'Updating testimonial...'} />}

      <div className="space-y-4">
        <AdminPageHeader
          title="Testimonials Moderation"
          description="Review submissions quickly with filters and one-click decisions."
          actions={
            <button type="button" onClick={load} className="admin-button-secondary">
              <FiRefreshCw className="h-4 w-4" aria-hidden="true" />
              Refresh
            </button>
          }
        />

        <section className="admin-card p-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {STATUSES.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={[
                    'admin-button px-4 py-2 text-xs uppercase tracking-[0.08em]',
                    statusFilter === status
                      ? 'border border-brand-goldText bg-rose-50 text-brand-goldText'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                  ].join(' ')}
                >
                  {status}
                </button>
              ))}
              <p className="ml-auto text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                <FiClock className="mr-1 inline-block h-4 w-4 align-text-bottom" aria-hidden="true" />
                {filteredItems.length} in view
              </p>
            </div>

            <div className="grid gap-2 md:grid-cols-[1fr_auto_auto]">
              <div className="relative">
                <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search name, role, or quote..."
                  className="admin-input pl-9"
                />
              </div>
              <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="admin-input md:w-44" />
              <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="admin-input md:w-44" />
            </div>
          </div>
        </section>

        {error ? <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p> : null}

        {filteredItems.length === 0 && !loading ? (
          <section className="admin-card px-4 py-12 text-center text-sm text-slate-500">No testimonials match the current filters.</section>
        ) : (
          <section className="grid gap-3 lg:grid-cols-2">
            {filteredItems.map((item) => (
              <article key={item.id} className="admin-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-100 text-sm font-semibold text-brand-goldText">
                      {(item.name || 'A').slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{item.name}</p>
                      {item.role ? <p className="text-xs text-slate-500">{item.role}</p> : null}
                      <p className="mt-2 line-clamp-4 text-sm leading-6 text-slate-700">{item.quote}</p>
                    </div>
                  </div>
                  <StatusBadge status={item.status} />
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-slate-500">{new Date(item.created_at).toLocaleString()}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {item.status === 'pending' ? (
                      <>
                        <button
                          type="button"
                          disabled={actingId === item.id}
                          onClick={() => handleStatus(item.id, 'approved')}
                          className="admin-button rounded-lg bg-emerald-600 px-3 py-1.5 text-xs text-white hover:bg-emerald-700"
                        >
                          <FiCheck className="h-3.5 w-3.5" aria-hidden="true" />
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={actingId === item.id}
                          onClick={() => handleStatus(item.id, 'rejected')}
                          className="admin-button rounded-lg bg-rose-600 px-3 py-1.5 text-xs text-white hover:bg-rose-700"
                        >
                          <FiX className="h-3.5 w-3.5" aria-hidden="true" />
                          Reject
                        </button>
                      </>
                    ) : null}

                    {item.status === 'approved' ? (
                      <button
                        type="button"
                        disabled={actingId === item.id}
                        onClick={() => handleStatus(item.id, 'rejected')}
                        className="admin-button rounded-lg bg-amber-500 px-3 py-1.5 text-xs text-white hover:bg-amber-600"
                      >
                        Mark rejected
                      </button>
                    ) : null}

                    {(item.status === 'approved' || item.status === 'rejected') ? (
                      <button
                        type="button"
                        disabled={actingId === item.id}
                        onClick={() => handleDelete(item.id)}
                        className="admin-button rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50"
                      >
                        <FiTrash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        Delete
                      </button>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </>
  )
}
