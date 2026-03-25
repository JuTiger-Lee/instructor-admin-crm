import { Outlet } from 'react-router-dom'
import { Search, LogOut } from 'lucide-react'
import { useQuery } from 'convex/react'
import { useAuthActions } from '@convex-dev/auth/react'
import { api } from '../../convex/_generated/api'
import Sidebar from './Sidebar'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export default function Layout() {
  const user = useQuery(api.users.currentUser)
  const { signOut } = useAuthActions()

  const userName = user?.name ?? '관리자'
  const userInitial = userName.slice(0, 1)

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">

        {/* 헤더 */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">

          {/* 검색바 */}
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="검색..."
              className="h-8 rounded-xl border-gray-200 bg-gray-50 pl-8 text-sm placeholder:text-slate-400 transition-colors focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-teal-500/40 focus-visible:border-teal-400 hover:border-gray-300"
            />
          </div>

          {/* 우측 */}
          <div className="flex items-center gap-1">
            {/* 프로필 */}
            <div className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5">
              <Avatar className="h-7 w-7 ring-1 ring-gray-200">
                <AvatarFallback className="bg-teal-600 text-[11px] font-semibold text-white">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="text-[13px] font-semibold text-slate-800 leading-none">{userName}</span>
                <span className="text-[10px] text-slate-400 leading-none mt-0.5">Admin</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-gray-100 hover:text-slate-600"
                title="로그아웃"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* 페이지 컨텐츠 */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-7 py-7 page-animate">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
