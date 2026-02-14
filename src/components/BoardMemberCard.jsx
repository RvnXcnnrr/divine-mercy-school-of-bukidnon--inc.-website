import { FaUserTie } from 'react-icons/fa6'

export default function BoardMemberCard({ member }) {
  const initials = member?.name
    ? member.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join('')
    : 'BM'

  return (
    <article className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800" data-reveal>
      <div className="flex items-center gap-4">
        <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-brand-sky ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
          {member?.photo ? (
            <img
              src={member.photo}
              alt={member?.name ? `${member.name} portrait` : 'Board member portrait'}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : null}
          <div className="absolute inset-0 grid place-items-center">
            <span className="text-sm font-black text-brand-goldText" aria-hidden="true">
              {initials}
            </span>
          </div>
        </div>

        <div>
          <p className="text-base font-extrabold text-brand-goldText">{member.name}</p>
          <p className="mt-1 inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <FaUserTie className="h-4 w-4 text-brand-blue" aria-hidden="true" />
            {member.role}
          </p>
        </div>
      </div>
    </article>
  )
}
