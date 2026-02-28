import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi'

function buildPageItems(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, idx) => idx + 1)
  }

  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1])
  if (currentPage <= 3) {
    pages.add(2)
    pages.add(3)
    pages.add(4)
  }
  if (currentPage >= totalPages - 2) {
    pages.add(totalPages - 1)
    pages.add(totalPages - 2)
    pages.add(totalPages - 3)
  }

  const sorted = [...pages]
    .filter((page) => page > 0 && page <= totalPages)
    .sort((a, b) => a - b)

  const items = []
  for (let idx = 0; idx < sorted.length; idx += 1) {
    const page = sorted[idx]
    const prev = sorted[idx - 1]
    if (prev && page - prev > 1) items.push('ellipsis')
    items.push(page)
  }
  return items
}

function rangeLabel(page, pageSize, totalItems, itemLabel) {
  if (!totalItems) return `No ${itemLabel}`
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalItems)
  const suffix = totalItems === 1 ? itemLabel.replace(/s$/, '') : itemLabel
  return `Showing ${start}-${end} of ${totalItems} ${suffix}`
}

export default function AdminPagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  itemLabel = 'items',
  pageSizeOptions = [10, 25, 50, 100],
  isLoading = false,
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const hasPrev = page > 1
  const hasNext = page < totalPages
  const items = buildPageItems(page, totalPages)

  function jump(nextPage) {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) return
    onPageChange(nextPage)
  }

  function onKeyDown(event) {
    if (event.key === 'ArrowLeft') jump(page - 1)
    if (event.key === 'ArrowRight') jump(page + 1)
    if (event.key === 'Home') jump(1)
    if (event.key === 'End') jump(totalPages)
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-slate-600">
          {rangeLabel(page, pageSize, totalItems, itemLabel)}
          {isLoading ? <span className="ml-2 text-xs text-slate-500">Refreshing...</span> : null}
        </p>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <label htmlFor="rows-per-page" className="text-slate-600">
            Rows per page
          </label>
          <select
            id="rows-per-page"
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-brand-goldText focus:ring-2 focus:ring-brand-goldText/20"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      <nav
        className="mt-3 flex flex-wrap items-center gap-2"
        aria-label="Pagination"
        onKeyDown={onKeyDown}
      >
        <PageButton disabled={!hasPrev} onClick={() => jump(1)} ariaLabel="Go to first page">
          <FiChevronsLeft className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">First</span>
        </PageButton>
        <PageButton disabled={!hasPrev} onClick={() => jump(page - 1)} ariaLabel="Go to previous page">
          <FiChevronLeft className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Prev</span>
        </PageButton>

        <div className="flex items-center gap-1">
          {items.map((item, idx) =>
            item === 'ellipsis' ? (
              <span key={`ellipsis-${idx}`} className="px-2 text-slate-400" aria-hidden="true">
                ...
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => jump(item)}
                aria-current={page === item ? 'page' : undefined}
                className={[
                  'h-9 min-w-9 rounded-xl px-2 text-sm font-semibold transition',
                  page === item
                    ? 'bg-brand-goldText text-white shadow-sm'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                ].join(' ')}
              >
                {item}
              </button>
            )
          )}
        </div>

        <PageButton disabled={!hasNext} onClick={() => jump(page + 1)} ariaLabel="Go to next page">
          <span className="hidden sm:inline">Next</span>
          <FiChevronRight className="h-4 w-4" aria-hidden="true" />
        </PageButton>
        <PageButton disabled={!hasNext} onClick={() => jump(totalPages)} ariaLabel="Go to last page">
          <span className="hidden sm:inline">Last</span>
          <FiChevronsRight className="h-4 w-4" aria-hidden="true" />
        </PageButton>
      </nav>
    </div>
  )
}

function PageButton({ children, disabled, onClick, ariaLabel }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
      className="inline-flex h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-goldText focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  )
}

