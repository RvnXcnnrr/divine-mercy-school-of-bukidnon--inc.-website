export default function WaveDivider({
  from = 'bg-brand-sky dark:bg-slate-950',
  to = 'text-white dark:text-slate-900',
  className = '',
}) {
  return (
    <div className={['w-full overflow-hidden -mb-px leading-none', from, className].join(' ')} aria-hidden="true">
      <svg
        className={['block h-8 w-full fill-current sm:h-10', to].join(' ')}
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        focusable="false"
      >
        <path d="M0,32 C240,80 480,80 720,40 C960,0 1200,0 1440,32 L1440,80 L0,80 Z" />
      </svg>
    </div>
  )
}
