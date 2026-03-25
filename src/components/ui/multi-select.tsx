import * as React from 'react'
import { X, ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface MultiSelectProps {
  options: readonly string[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  maxCount?: number
  className?: string
  disabled?: boolean
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = '선택하세요',
  maxCount,
  className,
  disabled = false,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const containerRef = React.useRef<HTMLDivElement>(null)

  // 외부 클릭 시 닫기
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  )

  function toggle(opt: string) {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt))
    } else {
      if (maxCount && value.length >= maxCount) return
      onChange([...value, opt])
    }
  }

  function remove(opt: string, e: React.MouseEvent) {
    e.stopPropagation()
    onChange(value.filter((v) => v !== opt))
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* 트리거 */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={cn(
          'flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-lg border border-input bg-transparent px-3 py-1.5 text-sm shadow-sm transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          open && 'ring-2 ring-ring',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        {value.length === 0 ? (
          <span className="text-muted-foreground">{placeholder}</span>
        ) : (
          value.map((v) => (
            <span
              key={v}
              className="flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200"
            >
              {v}
              <button
                type="button"
                onClick={(e) => remove(v, e)}
                className="ml-0.5 rounded-sm text-emerald-500 hover:text-emerald-700 focus:outline-none"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))
        )}
        <ChevronDown
          className={cn(
            'ml-auto h-4 w-4 shrink-0 text-muted-foreground/60 transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>

      {/* 드롭다운 */}
      {open && (
        <div className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-border/60 bg-white shadow-lg">
          {/* 검색 */}
          <div className="border-b border-border/60 px-3 py-2">
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="검색..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
            />
          </div>

          {/* 선택 카운트 */}
          {value.length > 0 && (
            <div className="flex items-center justify-between border-b border-border/40 px-3 py-1.5">
              <span className="text-xs text-muted-foreground">
                {value.length}개 선택됨
                {maxCount && ` / 최대 ${maxCount}개`}
              </span>
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                전체 해제
              </button>
            </div>
          )}

          {/* 옵션 목록 */}
          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                검색 결과 없음
              </li>
            ) : (
              filtered.map((opt) => {
                const selected = value.includes(opt)
                const atMax = !selected && maxCount !== undefined && value.length >= maxCount
                return (
                  <li
                    key={opt}
                    onClick={() => !atMax && toggle(opt)}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors',
                      selected
                        ? 'bg-emerald-50/60 text-emerald-700'
                        : atMax
                        ? 'cursor-not-allowed opacity-40'
                        : 'text-foreground hover:bg-accent'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors',
                        selected
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : 'border-border'
                      )}
                    >
                      {selected && <Check className="h-3 w-3" />}
                    </span>
                    {opt}
                  </li>
                )
              })
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
