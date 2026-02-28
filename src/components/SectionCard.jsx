export default function SectionCard({ icon: Icon, title, description, stat, meta }) {
  return (
    <div
      className="surface-card surface-card-hover group p-6"
      data-reveal
    >
      <div className="flex items-center gap-3">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-brand-goldText ring-1 ring-red-100">
          {Icon ? <Icon className="h-5 w-5" aria-hidden="true" /> : null}
        </div>
        {stat ? (
          <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-sm font-black tracking-wide text-brand-goldText ring-1 ring-red-100">
            {stat}
          </span>
        ) : null}
      </div>
      <h3 className="mt-4 text-2xl font-bold leading-snug text-brand-ink">{title}</h3>
      <p className="mt-3 text-base leading-7 text-slate-600">{description}</p>
      {meta ? <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{meta}</p> : null}
    </div>
  )
}
