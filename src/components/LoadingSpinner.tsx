import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  /** 전체 페이지 모드 (중앙 배치) */
  fullPage?: boolean
  /** 표시할 메시지 */
  message?: string
}

export default function LoadingSpinner({ fullPage = false, message }: LoadingSpinnerProps) {
  if (fullPage) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          {message && (
            <p className="text-sm text-slate-500">{message}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
        {message && (
          <p className="text-sm text-slate-500">{message}</p>
        )}
      </div>
    </div>
  )
}
