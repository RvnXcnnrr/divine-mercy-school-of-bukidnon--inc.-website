const variants = {
  published: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  draft: 'bg-slate-100 text-slate-700 ring-slate-200',
  featured: 'bg-blue-50 text-blue-700 ring-blue-200',
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  rejected: 'bg-rose-50 text-rose-700 ring-rose-200',
}

export default function StatusBadge({ status, className = '' }) {
  const label = (status || 'draft').toString().toLowerCase()
  const tone = variants[label] || 'bg-slate-100 text-slate-700 ring-slate-200'

  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ring-1',
        tone,
        className,
      ].join(' ')}
    >
      {label}
    </span>
  )
}

