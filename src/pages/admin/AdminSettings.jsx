import { useEffect, useMemo, useState } from 'react'
import { FiDownload, FiMail, FiSearch } from 'react-icons/fi'
import { fetchSubscribers } from '../../services/subscriberService.js'
import usePageMeta from '../../hooks/usePageMeta.js'
import LoadingOverlay from '../../components/LoadingOverlay.jsx'
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx'
import AdminPagination from '../../components/admin/AdminPagination.jsx'

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

export default function AdminSettings() {
  usePageMeta({ title: 'Subscribers' })
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const { data } = await fetchSubscribers()
      setItems(data || [])
    } catch (err) {
      setError(err.message || 'Failed to load subscribers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return items.filter((item) => {
      const searchMatch = !term || item.email?.toLowerCase().includes(term)
      return searchMatch && matchesDateRange(item, dateFrom, dateTo)
    })
  }, [items, search, dateFrom, dateTo])

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(page, totalPages)
  const pagedItems = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, safePage, pageSize])

  useEffect(() => {
    if (page !== safePage) setPage(safePage)
  }, [page, safePage])

  function exportCSV() {
    const rows = ['email,subscribed_at', ...filtered.map((subscriber) => `"${subscriber.email}","${subscriber.created_at || ''}"`)]
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      {loading && <LoadingOverlay message="Loading subscribers..." />}

      <div className="space-y-4">
        <AdminPageHeader
          title="Subscribers"
          description="Manage your mailing list, filter by signup date, and export data safely."
          actions={
            <button type="button" onClick={exportCSV} disabled={!filtered.length} className="admin-button-primary">
              <FiDownload className="h-4 w-4" aria-hidden="true" />
              Export CSV
            </button>
          }
        />

        <section className="admin-card p-4">
          <div className="grid gap-2 md:grid-cols-[1fr_auto_auto_auto]">
            <div className="relative">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setPage(1)
                }}
                placeholder="Search email..."
                className="admin-input pl-9"
              />
            </div>
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => {
                setDateFrom(event.target.value)
                setPage(1)
              }}
              className="admin-input md:w-44"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(event) => {
                setDateTo(event.target.value)
                setPage(1)
              }}
              className="admin-input md:w-44"
            />
            <div className="inline-flex items-center justify-center rounded-xl bg-slate-100 px-4 text-sm font-semibold text-slate-700">
              Total: {filtered.length}
            </div>
          </div>
          {error ? <p className="mt-3 text-sm font-medium text-rose-600">{error}</p> : null}
        </section>

        {!loading && !filtered.length ? (
          <section className="admin-card flex flex-col items-center gap-3 py-14 text-center">
            <FiMail className="h-8 w-8 text-slate-300" aria-hidden="true" />
            <p className="text-sm font-medium text-slate-500">No subscribers match your filters.</p>
          </section>
        ) : (
          <section className="admin-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-[760px] w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  <tr>
                    <th className="border-b border-slate-200 px-4 py-3">#</th>
                    <th className="border-b border-slate-200 px-4 py-3">Email</th>
                    <th className="border-b border-slate-200 px-4 py-3">Subscribed</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedItems.map((subscriber, index) => (
                    <tr
                      key={subscriber.id}
                      className={[
                        'transition hover:bg-rose-50/40',
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50/45',
                      ].join(' ')}
                    >
                      <td className="border-b border-slate-100 px-4 py-3 text-slate-400">{(safePage - 1) * pageSize + index + 1}</td>
                      <td className="border-b border-slate-100 px-4 py-3 font-medium text-slate-800">{subscriber.email}</td>
                      <td className="border-b border-slate-100 px-4 py-3 text-slate-500">
                        {subscriber.created_at
                          ? new Date(subscriber.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <AdminPagination
          page={safePage}
          pageSize={pageSize}
          totalItems={total}
          itemLabel="subscribers"
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPage(1)
          }}
        />
      </div>
    </>
  )
}
