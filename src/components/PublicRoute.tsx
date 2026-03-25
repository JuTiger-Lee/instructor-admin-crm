import { Navigate, Outlet } from 'react-router-dom'
import { useConvexAuth } from 'convex/react'
import LoadingSpinner from './LoadingSpinner'

/**
 * 인증되지 않은 사용자만 접근 가능한 라우트 가드.
 * 이미 로그인한 사용자는 홈(/)으로 리다이렉트합니다.
 */
export default function PublicRoute() {
  const { isAuthenticated, isLoading } = useConvexAuth()

  if (isLoading) {
    return <LoadingSpinner fullPage message="인증 확인 중..." />
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
