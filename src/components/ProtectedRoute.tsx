import { Navigate, Outlet } from 'react-router-dom'
import { useConvexAuth } from 'convex/react'
import LoadingSpinner from './LoadingSpinner'

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useConvexAuth()

  if (isLoading) {
    return <LoadingSpinner fullPage message="인증 확인 중..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
