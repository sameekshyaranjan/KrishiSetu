import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'
import { Loader2 } from 'lucide-react'

/**
 * ProtectedRoute Guard
 * Verifies authentication and role authorization before rendering children routes.
 * 
 * @param {Array<string>} allowedRoles - Optional array of authorized roles (e.g. ['farmer', 'admin'])
 */
export const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user, role: contextRole, loading } = useAuth()
  const role = contextRole || user?.role
  const location = useLocation()

  // 1. Initial Session Hydration Gate
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm font-medium text-muted-foreground">Verifying security credentials...</p>
      </div>
    )
  }

  // 2. Unauthenticated: Redirect to login with return state
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 3. Unauthorized Role: Redirect to role-appropriate dashboard or home
  if (allowedRoles && !allowedRoles.includes(role)) {
    const fallbackPath = 
      role === 'farmer' ? '/farmer/dashboard' :
      role === 'trader' ? '/trader/dashboard' :
      role === 'admin' ? '/admin/dashboard' : '/'
      
    return <Navigate to={fallbackPath} replace />
  }

  // 4. Authorized: Render child routes via Outlet
  return <Outlet />
}

export default ProtectedRoute
