import { useEffect, useState } from 'react'
import { FiCheck, FiClock, FiLoader, FiTrash, FiX } from 'react-icons/fi'
import { deleteTestimonial, fetchTestimonials, updateTestimonialStatus } from '../../services/testimonialService.js'
import LoadingOverlay from '../../components/LoadingOverlay.jsx'

export default function AdminTestimonials() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actingId, setActingId] = useState(null)
  const [statusFilter, setStatusFilter] = useState('pending')

  async function load() {
    setLoading(true)
    setError('')
    const { data, error: fetchError } = await fetchTestimonials({ status: statusFilter, limit: 200 })
    if (fetchError) setError(fetchError.message || 'Failed to load testimonials')
    setItems(data || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [statusFilter])

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
    {(loading || actingId !== null) && <LoadingOverlay message={loading ? 'Loading testimonials…' : 'Please wait…'} />}
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-black text-brand-goldText">Testimonials</h1>
        <p className="text-sm text-slate-600">Approve, reject, or remove submissions.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <FiClock className="h-4 w-4" aria-hidden="true" /> {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} ({items.length})
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {['pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={[
                  'rounded-md px-3 py-2 text-xs font-semibold ring-1 transition',
                  statusFilter === status
                    ? 'bg-brand-goldText text-white ring-brand-goldText'
                    : 'text-slate-700 ring-slate-200 hover:bg-slate-50',
                ].join(' ')}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 py-10 text-sm text-slate-600">
            <FiLoader className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading testimonials...
          </div>
        ) : items.length === 0 ? (
          <p className="py-8 text-sm text-slate-600">No testimonials in this view.</p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {items.map((item) => (
              <li key={item.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                  {item.role ? <p className="text-xs text-slate-500">{item.role}</p> : null}
                  <p className="text-sm text-slate-700">{item.quote}</p>
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    Submitted {new Date(item.created_at).toLocaleString()}
                  </p>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Status: {item.status}</p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {statusFilter === 'pending' ? (
                    <>
                      <button
                        type="button"
                        disabled={actingId === item.id}
                        onClick={() => handleStatus(item.id, 'approved')}
                        className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                      >
                        <FiCheck className="h-4 w-4" aria-hidden="true" /> Approve
                      </button>
                      <button
                        type="button"
                        disabled={actingId === item.id}
                        onClick={() => handleStatus(item.id, 'rejected')}
                        className="inline-flex items-center gap-1 rounded-md bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                      >
                        <FiX className="h-4 w-4" aria-hidden="true" /> Reject
                      </button>
                    </>
                  ) : null}

                  {statusFilter === 'approved' ? (
                    <button
                      type="button"
                      disabled={actingId === item.id}
                      onClick={() => handleStatus(item.id, 'rejected')}
                      className="inline-flex items-center gap-1 rounded-md bg-amber-500 px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                    >
                      <FiX className="h-4 w-4" aria-hidden="true" /> Mark rejected
                    </button>
                  ) : null}

                  {(statusFilter === 'approved' || statusFilter === 'rejected') ? (
                    <button
                      type="button"
                      disabled={actingId === item.id}
                      onClick={() => handleDelete(item.id)}
                      className="inline-flex items-center gap-1 rounded-md bg-rose-700 px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                    >
                      <FiTrash className="h-4 w-4" aria-hidden="true" /> Delete
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}

        {error ? <p className="mt-3 text-xs font-semibold text-rose-600">{error}</p> : null}
      </div>
    </div>
    </>
  )
}
