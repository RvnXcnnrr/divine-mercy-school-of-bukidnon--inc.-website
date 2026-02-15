import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../providers/AppProviders.jsx'

export default function ProtectedRoute({ roles = [] }) {
  const { user, role, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-slate-600 dark:text-slate-300">Checking access…</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  if (roles.length && !roles.includes(role)) {
    return <Navigate to="/admin" replace />
  }

  return <Outlet />
}
