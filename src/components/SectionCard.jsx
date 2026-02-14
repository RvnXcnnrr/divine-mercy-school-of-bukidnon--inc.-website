export default function SectionCard({ icon: Icon, title, description, stat, meta }) {
  return (
    <div
      className="group rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition-transform hover:-translate-y-0.5 dark:bg-slate-900 dark:ring-slate-800"
      data-reveal
    >
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-brand-sky text-brand-navy ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700">
        {Icon ? <Icon className="h-5 w-5" aria-hidden="true" /> : null}
      </div>
      <h3 className="mt-4 text-base font-extrabold text-brand-goldText">{title}</h3>
      {stat ? <p className="mt-1 text-lg font-black text-brand-navy dark:text-slate-100">{stat}</p> : null}
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{description}</p>
      {meta ? <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-brand-blue">{meta}</p> : null}
    </div>
  )
}
