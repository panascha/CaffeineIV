import { Navigate, Outlet } from 'react-router-dom'

export default function ProtectedRoute() {
  const stored = localStorage.getItem('admin_credential')
  if (!stored) return <Navigate to="/admin/login" replace />

  const { exp } = JSON.parse(stored)
  if (Date.now() / 1000 > exp) {
    localStorage.removeItem('admin_credential')
    return <Navigate to="/admin/login" replace />
  }

  return <Outlet />
}
