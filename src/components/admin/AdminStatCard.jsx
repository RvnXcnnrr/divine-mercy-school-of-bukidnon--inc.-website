import { createElement } from 'react'

export default function AdminStatCard({ label, value, trend, icon, tint = 'rose' }) {
  const tintStyles = {
    rose: 'bg-rose-50 text-rose-700',
    blue: 'bg-blue-50 text-blue-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    slate: 'bg-slate-100 text-slate-700',
  }

  const iconNode = icon ? createElement(icon, { className: 'h-4 w-4', 'aria-hidden': true }) : null

  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
        <span className={['rounded-xl p-2', tintStyles[tint] || tintStyles.rose].join(' ')}>
          {iconNode}
        </span>
      </div>
      <p className="mt-4 text-3xl font-semibold text-slate-900">{value}</p>
      {trend ? <p className="mt-2 text-xs font-medium text-emerald-700">{trend}</p> : null}
    </article>
  )
}
