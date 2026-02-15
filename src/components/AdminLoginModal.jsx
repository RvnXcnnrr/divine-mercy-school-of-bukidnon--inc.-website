import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { FiLock, FiMail, FiX } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../providers/AppProviders.jsx'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export default function AdminLoginModal({ open, onClose }) {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) })

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose?.()
    }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  async function onSubmit(values) {
    const { error } = await signIn({ email: values.email, password: values.password })
    if (error) {
      alert(error.message)
      return
    }
    onClose?.()
    navigate('/admin')
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[180] flex items-center justify-center bg-black/60 px-4 backdrop-blur" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-blue">Admin</p>
            <h2 className="text-xl font-black text-brand-goldText">Secure Login</h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">For admins and editors.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <FiX className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-3">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
            Email
            <div className="mt-1 flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 focus-within:border-brand-gold focus-within:ring-2 focus-within:ring-brand-gold/30 dark:border-slate-700 dark:bg-slate-950">
              <FiMail className="h-4 w-4 text-slate-400" aria-hidden="true" />
              <input
                type="email"
                {...register('email')}
                className="w-full bg-transparent text-sm text-slate-900 outline-none dark:text-slate-100"
                placeholder="you@example.com"
                autoComplete="username"
              />
            </div>
          </label>

          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
            Password
            <div className="mt-1 flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 focus-within:border-brand-gold focus-within:ring-2 focus-within:ring-brand-gold/30 dark:border-slate-700 dark:bg-slate-950">
              <FiLock className="h-4 w-4 text-slate-400" aria-hidden="true" />
              <input
                type="password"
                {...register('password')}
                className="w-full bg-transparent text-sm text-slate-900 outline-none dark:text-slate-100"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
          </label>

          {errors.email || errors.password ? (
            <p className="text-xs text-rose-600 dark:text-rose-400">Enter a valid email and password.</p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-md bg-brand-goldText px-4 py-3 text-sm font-extrabold text-white transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 disabled:opacity-70"
          >
            Sign in
          </button>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">You’ll be redirected to the admin dashboard after login.</p>
        </form>
      </div>
    </div>
  )
}
