export default function SectionCard({ icon: Icon, title, description, stat, meta }) {
  return (
    <div
      className="surface-card surface-card-hover group p-6"
      data-reveal
    >
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-brand-goldText ring-1 ring-red-100">
        {Icon ? <Icon className="h-5 w-5" aria-hidden="true" /> : null}
      </div>
      <h3 className="mt-4 text-2xl font-bold leading-snug text-brand-ink">{title}</h3>
      {stat ? <p className="mt-1 text-2xl font-extrabold text-brand-goldText">{stat}</p> : null}
      <p className="mt-3 text-base leading-7 text-slate-600">{description}</p>
      {meta ? <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{meta}</p> : null}
    </div>
  )
}
