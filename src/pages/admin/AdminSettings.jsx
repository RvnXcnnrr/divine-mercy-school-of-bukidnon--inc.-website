import { useEffect, useState } from 'react'
import { FiDownload, FiMail, FiTrash } from 'react-icons/fi'
import { fetchSubscribers, deleteSubscriber } from '../../services/subscriberService.js'
import usePageMeta from '../../hooks/usePageMeta.js'
import LoadingOverlay from '../../components/LoadingOverlay.jsx'

export default function AdminSubscribers() {
  usePageMeta({ title: 'Subscribers' })
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const { data } = await fetchSubscribers()
      setItems(data)
    } catch (err) {
      setError(err.message || 'Failed to load subscribers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id) {
    if (!window.confirm('Remove this subscriber?')) return
    setDeletingId(id)
    try {
      await deleteSubscriber(id)
      setItems((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      setError(err.message || 'Failed to delete')
    } finally {
      setDeletingId(null)
    }
  }

  function exportCSV() {
    const rows = ['email,subscribed_at', ...items.map((s) => `"${s.email}","${s.created_at || ''}"`)]
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      {(loading || deletingId !== null) && (
        <LoadingOverlay message={loading ? 'Loading subscribers…' : 'Removing…'} />
      )}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-brand-goldText">Subscribers</h1>
            <p className="text-sm text-slate-600">{items.length} email{items.length !== 1 ? 's' : ''} subscribed.</p>
          </div>
          {items.length > 0 && (
            <button
              type="button"
              onClick={exportCSV}
              className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-brand-blue/90 hover:-translate-y-[1px]"
            >
              <FiDownload className="h-3.5 w-3.5" aria-hidden="true" /> Export CSV
            </button>
          )}
        </div>

        {error ? <p className="text-sm font-semibold text-rose-600">{error}</p> : null}

        {!loading && items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 py-14 text-center">
            <FiMail className="h-8 w-8 text-slate-300" aria-hidden="true" />
            <p className="text-sm font-semibold text-slate-500">No subscribers yet.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl ring-1 ring-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">#</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Subscribed</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {items.map((s, i) => (
                  <tr key={s.id} className="transition hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{s.email}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {s.created_at ? new Date(s.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(s.id)}
                        disabled={deletingId === s.id}
                        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-rose-600 ring-1 ring-rose-200 transition hover:bg-rose-50 disabled:opacity-50"
                      >
                        <FiTrash className="h-3.5 w-3.5" aria-hidden="true" /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
