import { Navigate, Outlet } from 'react-router-dom'
import { getAdminSession } from '../services/auth.service.js'

export default function ProtectedRoute() {
  const session = getAdminSession()
  if (!session) return <Navigate to="/admin/login" replace />
  return <Outlet />
}
