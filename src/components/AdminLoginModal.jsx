import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { FiEye, FiEyeOff, FiLock, FiMail, FiX } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../providers/AppProviders.jsx'

const schema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(6, 'Enter a password with at least 6 characters.'),
})

export default function AdminLoginModal({ open, onClose, redirectTo = '/admin' }) {
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState('')
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
    setAuthError('')
    const { error } = await signIn({ email: values.email, password: values.password })
    if (error) {
      setAuthError(error.message || 'We could not sign you in. Please check your email and password.')
      return
    }
    onClose?.()
    const safeRedirect = typeof redirectTo === 'string' && redirectTo.startsWith('/admin') ? redirectTo : '/admin'
    navigate(safeRedirect)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[180] flex items-center justify-center bg-black/60 px-4 backdrop-blur" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-blue">Staff access</p>
            <h2 className="text-xl font-black text-brand-goldText">Sign in to the dashboard</h2>
            <p className="text-xs text-slate-600">Use your staff email address and password.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
            aria-label="Close"
          >
            <FiX className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-3">
          <label className="block text-sm font-semibold text-slate-700">
            Email
            <div className="mt-1 flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 focus-within:border-brand-gold focus-within:ring-2 focus-within:ring-brand-gold/30">
              <FiMail className="h-4 w-4 text-slate-400" aria-hidden="true" />
              <input
                type="email"
                {...register('email')}
                className="login-field-input w-full bg-transparent text-sm text-slate-900 outline-none selection:bg-transparent selection:text-slate-900"
                placeholder="name@school.edu.ph"
                autoComplete="username"
              />
            </div>
            {errors.email ? <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p> : null}
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Password
            <div className="mt-1 flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 focus-within:border-brand-gold focus-within:ring-2 focus-within:ring-brand-gold/30">
              <FiLock className="h-4 w-4 text-slate-400" aria-hidden="true" />
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                className="login-field-input w-full bg-transparent text-sm text-slate-900 outline-none selection:bg-transparent selection:text-slate-900"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="inline-flex h-6 w-6 items-center justify-center text-slate-400 transition hover:text-slate-600 focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                {showPassword ? <FiEyeOff className="h-4 w-4" aria-hidden="true" /> : <FiEye className="h-4 w-4" aria-hidden="true" />}
              </button>
            </div>
            {errors.password ? <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p> : null}
          </label>

          {authError ? <p className="text-xs text-rose-600">{authError}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-md bg-brand-goldText px-4 py-3 text-sm font-extrabold text-white transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 disabled:opacity-70"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in to dashboard'}
          </button>
          <p className="text-[11px] text-slate-500">After you sign in, you will be taken to the dashboard automatically.</p>
        </form>
      </div>
    </div>
  )
}
