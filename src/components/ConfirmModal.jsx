import { useEffect } from 'react'
import { FiAlertTriangle } from 'react-icons/fi'

export default function ConfirmModal({ 
  open, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action',
  message = 'Are you sure you want to continue?',
  confirmText = 'OK',
  cancelText = 'Cancel',
  variant = 'default' // 'default' | 'danger'
}) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose?.()
      if (e.key === 'Enter' && open) {
        e.preventDefault()
        onConfirm?.()
      }
    }
    if (open) {
      window.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose, onConfirm])

  if (!open) return null

  const isDanger = variant === 'danger'

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 px-4 backdrop-blur" 
      role="dialog" 
      aria-modal="true"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          {isDanger && (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100">
              <FiAlertTriangle className="h-5 w-5 text-rose-600" aria-hidden="true" />
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-900">
              {title}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm?.()
              onClose?.()
            }}
            className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-bold text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-500'
                : 'bg-brand-goldText hover:opacity-95 focus-visible:ring-brand-gold'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
