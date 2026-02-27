import { FiMessageCircle } from 'react-icons/fi'

export default function Testimonial({ quote, name, role }) {
  return (
    <figure className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200" data-reveal>
      <div className="flex items-start gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-brand-sky text-brand-navy ring-1 ring-slate-200">
          <FiMessageCircle className="h-5 w-5" aria-hidden="true" />
        </span>
        <blockquote className="text-sm text-slate-700">
          <p className="leading-relaxed">“{quote}”</p>
        </blockquote>
      </div>
      <figcaption className="mt-4 border-t border-slate-100 pt-4">
        <p className="text-sm font-extrabold text-brand-goldText">{name}</p>
        <p className="text-xs text-slate-500">{role}</p>
      </figcaption>
    </figure>
  )
}
