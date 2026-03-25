import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, GraduationCap, Settings, Grid3X3, Award } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const navigation = [
  { name: '대시보드', href: '/', icon: LayoutDashboard },
  { name: '강사 관리', href: '/instructors', icon: Users },
  { name: '분야 관리', href: '/fields', icon: Grid3X3 },
  { name: '등급 관리', href: '/grades', icon: Award },
]

const bottomNav = [
  { name: '설정', href: '#settings', icon: Settings },
]

interface NavItemProps {
  name: string
  href: string
  icon: React.ElementType
}

function NavItem({ name, href, icon: Icon }: NavItemProps) {
  const isHashLink = href.startsWith('#')

  const inner = (isActive: boolean) => (
    <span
      className={cn(
        'relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-150',
        isActive
          ? 'bg-white/12'
          : 'hover:bg-white/8'
      )}
    >
      {isActive && (
        <span className="absolute -left-3 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-teal-400" />
      )}
      <Icon
        className={cn(
          'h-[18px] w-[18px] shrink-0 transition-colors duration-150',
          isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'
        )}
      />
    </span>
  )

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {isHashLink ? (
          <button
            type="button"
            className="group flex items-center justify-center"
          >
            {inner(false)}
          </button>
        ) : (
          <NavLink
            to={href}
            end={href === '/'}
            className="group flex items-center justify-center"
          >
            {({ isActive }) => inner(isActive)}
          </NavLink>
        )}
      </TooltipTrigger>
      <TooltipContent
        side="right"
        sideOffset={14}
        className="rounded-lg border border-white/10 bg-slate-800 text-slate-100 shadow-lg"
      >
        <p className="text-[12px] font-medium">{name}</p>
      </TooltipContent>
    </Tooltip>
  )
}

export default function Sidebar() {
  return (
    <TooltipProvider delayDuration={150}>
      <aside
        className="relative flex h-screen w-[68px] shrink-0 flex-col items-center overflow-hidden border-r border-white/5"
        style={{ backgroundColor: 'hsl(215, 28%, 17%)' }}
      >
        {/* 우측 경계선 */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-px bg-white/5" />

        {/* 로고 */}
        <div className="flex h-14 w-full items-center justify-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600/20 ring-1 ring-teal-500/30 transition-colors duration-150 hover:bg-teal-600/30">
            <GraduationCap className="h-5 w-5 text-teal-400" />
          </div>
        </div>

        {/* 구분선 */}
        <div className="mx-auto w-8 h-px bg-white/8" />

        {/* 메인 네비게이션 */}
        <nav className="flex flex-1 flex-col items-center gap-1 pt-4">
          {navigation.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </nav>

        {/* 하단 네비게이션 */}
        <nav className="flex flex-col items-center gap-1 pb-5">
          <div className="mb-2 w-8 h-px bg-white/8" />
          {bottomNav.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </nav>
      </aside>
    </TooltipProvider>
  )
}
