import { useEffect, useState } from 'react'
import { FaUserTie } from 'react-icons/fa6'

export default function BoardMemberCard({ member }) {
  const [showFallback, setShowFallback] = useState(!member?.photo)

  useEffect(() => {
    setShowFallback(!member?.photo)
  }, [member?.photo])

  const initials = member?.name
    ? member.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join('')
    : 'BM'

  return (
    <article
      className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm ring-1 ring-white/60 backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/80 dark:ring-slate-800"
      data-reveal
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(247,215,111,0.12),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(82,143,255,0.10),transparent_26%)]" aria-hidden="true" />
      <div className="relative flex items-center gap-4">
        <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-brand-sky ring-2 ring-brand-goldText/20 shadow-inner">
          {member?.photo && !showFallback ? (
            <img
              src={member.photo}
              alt={member?.name ? `${member.name} portrait` : 'Board member portrait'}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                setShowFallback(true)
              }}
            />
          ) : null}
          {showFallback ? (
            <div className="absolute inset-0 grid place-items-center">
              <span className="text-sm font-black uppercase text-brand-goldText" aria-hidden="true">
                {initials}
              </span>
            </div>
          ) : null}
        </div>

        <div className="flex-1">
          <p className="text-base font-black text-slate-900 dark:text-white">{member.name}</p>
          <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <FaUserTie className="h-4 w-4 text-brand-blue" aria-hidden="true" />
            {member.role}
          </p>
          <div className="mt-3 h-[3px] w-16 rounded-full bg-gradient-to-r from-brand-goldText via-brand-blue to-transparent" aria-hidden="true" />
        </div>
      </div>
    </article>
  )
}
