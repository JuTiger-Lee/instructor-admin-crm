import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, SlidersHorizontal, Users, ChevronLeft, ChevronRight } from 'lucide-react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GRADE_COLORS } from '@/data/constants'
import { formatDate, formatPhoneNumber } from '@/lib/utils'
import LoadingSpinner from '@/components/LoadingSpinner'

const PAGE_SIZE = 20

const GRADE_DOT_COLORS: Record<string, string> = {
  A: '#0d9488',
  B: '#3b82f6',
  C: '#f59e0b',
  D: '#94a3b8',
}

const GRADE_AVATAR_BG: Record<string, string> = {
  A: '#0d9488',
  B: '#3b82f6',
  C: '#f59e0b',
  D: '#94a3b8',
}

export default function InstructorListPage() {
  const [search, setSearch] = useState('')
  const [fieldFilter, setFieldFilter] = useState<string>('all')
  const [regionFilter, setRegionFilter] = useState<string>('all')
  const [page, setPage] = useState(1)

  // Convex 쿼리
  const fieldsData = useQuery(api.fields.list)
  const regionsData = useQuery(api.regions.list)
  const result = useQuery(api.instructors.list, {
    search: search || undefined,
    fieldFilter: fieldFilter !== 'all' ? fieldFilter : undefined,
    regionFilter: regionFilter !== 'all' ? regionFilter : undefined,
    page,
    pageSize: PAGE_SIZE,
  })

  if (result === undefined || fieldsData === undefined || regionsData === undefined) {
    return <LoadingSpinner message="강사 목록을 불러오는 중..." />
  }

  const { items, totalCount } = result
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const handleFieldChange = (value: string) => {
    setFieldFilter(value)
    setPage(1)
  }

  const handleRegionChange = (value: string) => {
    setRegionFilter(value)
    setPage(1)
  }

  const getPageNumbers = () => {
    const delta = 2
    const start = Math.max(1, currentPage - delta)
    const end = Math.min(totalPages, currentPage + delta)
    const pages: number[] = []
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="animate-slide-up flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">강사 관리</h1>
          <p className="mt-1 text-sm text-slate-500">
            총{' '}
            <span className="font-semibold text-teal-700">{totalCount}</span>
            명의 강사가 등록되어 있습니다.
          </p>
        </div>
        <Button
          asChild
          className="h-9 gap-1.5 rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700 active:bg-teal-800"
        >
          <Link to="/instructors/new">
            <Plus className="h-4 w-4" />
            강사 등록
          </Link>
        </Button>
      </div>

      {/* 검색 / 필터 */}
      <div className="animate-slide-up stagger-1 flex items-center gap-3">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="강사 이름 검색..."
            value={search}
            onChange={handleSearchChange}
            className="h-9 rounded-xl border-gray-200 bg-white pl-9 text-sm placeholder:text-slate-400 transition-colors focus-visible:ring-1 focus-visible:ring-teal-500/40 focus-visible:border-teal-400 hover:border-gray-300"
          />
        </div>

        <Select value={fieldFilter} onValueChange={handleFieldChange}>
          <SelectTrigger className="h-9 w-52 rounded-xl border-gray-200 bg-white text-sm transition-colors hover:border-gray-300">
            <SlidersHorizontal className="mr-2 h-3.5 w-3.5 text-slate-400" />
            <SelectValue placeholder="활동분야 전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">활동분야 전체</SelectItem>
            {fieldsData.map((field) => (
              <SelectItem key={field._id} value={field.name}>
                {field.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={regionFilter} onValueChange={handleRegionChange}>
          <SelectTrigger className="h-9 w-44 rounded-xl border-gray-200 bg-white text-sm transition-colors hover:border-gray-300">
            <SelectValue placeholder="활동지역 전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">활동지역 전체</SelectItem>
            {regionsData.map((region) => (
              <SelectItem key={region._id} value={region.name}>
                {region.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 결과 카운트 */}
        {(search || fieldFilter !== 'all' || regionFilter !== 'all') && (
          <span className="text-sm text-slate-500">
            <span className="font-semibold text-slate-800">{totalCount}</span>개 결과
          </span>
        )}
      </div>

      {/* 테이블 카드 */}
      <div className="animate-slide-up stagger-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-200 hover:bg-transparent">
              {['번호', '프로필', '이름', '전화번호', '활동분야', '활동지역', '등급', '등록일'].map((h, i) => (
                <TableHead
                  key={h}
                  className={`bg-gray-50 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 ${i === 0 ? 'w-16 text-center' : ''} ${i === 1 ? 'w-12' : ''}`}
                >
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-24 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
                      <Users className="h-5 w-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">검색 결과가 없습니다</p>
                      <p className="mt-0.5 text-xs text-slate-400">다른 검색어 또는 필터를 사용해보세요.</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map((instructor, index) => (
                <TableRow
                  key={instructor._id}
                  className="cursor-pointer border-b border-gray-100 transition-colors hover:bg-gray-50/70 animate-fade-in"
                >
                  <TableCell className="py-3.5 text-center">
                    <Link
                      to={`/instructors/${instructor._id}/edit`}
                      className="inline-flex items-center justify-center h-6 min-w-[40px] rounded-lg bg-teal-50 border border-teal-100 px-2 text-xs font-semibold text-teal-700 transition-colors hover:bg-teal-100"
                    >
                      {(currentPage - 1) * PAGE_SIZE + index + 1}
                    </Link>
                  </TableCell>
                  <TableCell className="py-3.5">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback
                        className="text-[11px] font-semibold text-white"
                        style={{ backgroundColor: GRADE_AVATAR_BG[instructor.grade] ?? '#0d9488' }}
                      >
                        {instructor.name.slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="py-3.5">
                    <span className="text-sm font-semibold text-slate-800">
                      {instructor.name}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5 text-sm text-slate-500 tabular-nums">
                    {formatPhoneNumber(instructor.phone)}
                  </TableCell>
                  <TableCell className="py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {instructor.fields.slice(0, 2).map((field) => (
                        <Badge
                          key={field}
                          variant="secondary"
                          className="rounded-lg border-0 bg-teal-50 px-2 py-0.5 text-[11px] font-medium text-teal-700"
                        >
                          {field}
                        </Badge>
                      ))}
                      {instructor.fields.length > 2 && (
                        <Badge
                          variant="outline"
                          className="rounded-lg border-gray-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-400"
                        >
                          +{instructor.fields.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5 text-sm text-slate-500">
                    {instructor.regions.join(', ')}
                  </TableCell>
                  <TableCell className="py-3.5">
                    <Badge
                      className={`rounded-lg border px-2.5 py-0.5 text-[11px] font-semibold ${GRADE_COLORS[instructor.grade] ?? ''}`}
                    >
                      <span
                        className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: GRADE_DOT_COLORS[instructor.grade] }}
                      />
                      {instructor.grade}등급
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3.5 text-xs text-slate-400 tabular-nums">
                    {formatDate(instructor._creationTime)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400">
            {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, totalCount)}
            {' '}/ {totalCount}명
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 rounded-xl border-gray-200 bg-white p-0 text-slate-500 transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-600 disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            {getPageNumbers().map((p) => (
              <Button
                key={p}
                size="sm"
                onClick={() => setPage(p)}
                className={`h-8 w-8 rounded-xl p-0 text-xs font-semibold transition-colors ${
                  p === currentPage
                    ? 'bg-teal-600 text-white hover:bg-teal-700'
                    : 'border border-gray-200 bg-white text-slate-600 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700'
                }`}
              >
                {p}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 rounded-xl border-gray-200 bg-white p-0 text-slate-500 transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-600 disabled:opacity-40"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
