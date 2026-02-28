import { FiMessageCircle } from 'react-icons/fi'

export default function Testimonial({ quote, name, role }) {
  return (
    <figure className="surface-card surface-card-hover p-6" data-reveal>
      <div className="flex items-start gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-brand-goldText ring-1 ring-red-100">
          <FiMessageCircle className="h-5 w-5" aria-hidden="true" />
        </span>
        <blockquote className="text-base leading-7 text-slate-700">
          <p className="leading-relaxed">"{quote}"</p>
        </blockquote>
      </div>
      <figcaption className="mt-5 border-t border-slate-100 pt-4">
        <p className="text-base font-extrabold text-brand-goldText">{name}</p>
        <p className="text-sm text-slate-500">{role}</p>
      </figcaption>
    </figure>
  )
}
