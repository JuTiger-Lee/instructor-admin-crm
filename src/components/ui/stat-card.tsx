import * as React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface StatCardProps {
  label: string
  value: string | number
  icon: React.ElementType
  /** 트렌드: 양수면 상승, 음수면 하락, 0이면 변동없음 */
  trend?: number
  /** 트렌드 설명 텍스트 (예: "지난달 대비") */
  trendLabel?: string
  /** 아이콘 배경 색상 커스텀 */
  iconClassName?: string
  className?: string
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendLabel,
  iconClassName,
  className,
}: StatCardProps) {
  const hasTrend = trend !== undefined

  const TrendIcon =
    !hasTrend ? null
    : trend > 0 ? TrendingUp
    : trend < 0 ? TrendingDown
    : Minus

  const trendColor =
    !hasTrend ? ''
    : trend > 0 ? 'text-emerald-600'
    : trend < 0 ? 'text-red-500'
    : 'text-muted-foreground'

  return (
    <Card className={cn('group overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5', className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          {/* 텍스트 영역 */}
          <div className="flex flex-col gap-1">
            <span className="text-[13px] font-medium text-muted-foreground">{label}</span>
            <span className="text-3xl font-bold tracking-tight text-foreground">
              {value}
            </span>

            {/* 트렌드 */}
            {hasTrend && TrendIcon && (
              <div className={cn('flex items-center gap-1 text-xs font-medium', trendColor)}>
                <TrendIcon className="h-3.5 w-3.5" />
                <span>
                  {trend > 0 ? '+' : ''}{trend}%
                  {trendLabel && (
                    <span className="ml-1 font-normal text-muted-foreground">{trendLabel}</span>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* 아이콘 */}
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110',
              iconClassName ?? 'bg-emerald-50 text-emerald-600'
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
