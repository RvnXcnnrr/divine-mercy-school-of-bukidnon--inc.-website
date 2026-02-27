export default function LoadingOverlay({ message = 'Loading…' }) {
  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="status"
      aria-label={message}
    >
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-white px-12 py-8 shadow-2xl ring-1 ring-slate-200">
        <svg
          className="h-10 w-10 animate-spin text-brand-goldText"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
        <p className="text-sm font-bold tracking-wide text-slate-700">{message}</p>
      </div>
    </div>
  )
}
