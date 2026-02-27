import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useLocation, NavLink } from 'react-router-dom'
import { FiLock, FiMail } from 'react-icons/fi'
import { useAuth } from '../../providers/AppProviders.jsx'
import usePageMeta from '../../hooks/usePageMeta.js'
import LoadingOverlay from '../../components/LoadingOverlay.jsx'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export default function AdminLogin() {
  usePageMeta({ title: 'Admin Login', description: 'Secure login for editors and admins.' })
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) })
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/admin'
  const [signingIn, setSigningIn] = useState(false)

  async function onSubmit(values) {
    setSigningIn(true)
    const { error } = await signIn({ email: values.email, password: values.password })
    if (error) {
      setSigningIn(false)
      alert(error.message)
      return
    }
    navigate(from, { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-sky/30 px-4 py-10">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg ring-1 ring-slate-200"
      >
        <h1 className="text-2xl font-black text-brand-goldText">Admin Login</h1>
        <p className="mt-2 text-sm text-slate-600">Sign in with your Supabase credentials.</p>

        <label className="mt-5 block text-sm font-semibold text-slate-700">
          Email
          <div className="mt-1 flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 focus-within:border-brand-gold focus-within:ring-2 focus-within:ring-brand-gold/30">
            <FiMail className="h-4 w-4 text-slate-400" aria-hidden="true" />
            <input
              type="email"
              {...register('email')}
              className="w-full bg-transparent text-sm text-slate-900 outline-none"
              placeholder="you@example.com"
            />
          </div>
        </label>

        <label className="mt-4 block text-sm font-semibold text-slate-700">
          Password
          <div className="mt-1 flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 focus-within:border-brand-gold focus-within:ring-2 focus-within:ring-brand-gold/30">
            <FiLock className="h-4 w-4 text-slate-400" aria-hidden="true" />
            <input
              type="password"
              {...register('password')}
              className="w-full bg-transparent text-sm text-slate-900 outline-none"
              placeholder="••••••••"
            />
          </div>
        </label>

        {formState.errors.email || formState.errors.password ? (
          <p className="mt-2 text-xs text-rose-600">Invalid credentials format.</p>
        ) : null}

        <button
          type="submit"
          className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-brand-goldText px-4 py-3 text-sm font-extrabold text-white transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
        >
          Sign in
        </button>

        <p className="mt-4 text-center text-xs text-slate-500">
          Need an account? Ask an admin to invite you in Supabase. <NavLink to="/" className="font-semibold text-brand-goldText">Back to site</NavLink>
        </p>
      </form>
      {signingIn && <LoadingOverlay message="Signing in…" />}
    </div>
  )
}
