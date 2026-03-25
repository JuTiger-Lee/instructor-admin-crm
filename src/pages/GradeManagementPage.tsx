import { useState } from 'react'
import { Award, Pencil, Trash2, Check, Plus } from 'lucide-react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function GradeManagementPage() {
  // 추가 모드
  const [isAdding, setIsAdding] = useState(false)
  const [newCode, setNewCode] = useState('')
  const [newLabel, setNewLabel] = useState('')

  // 수정 모드
  const [editingId, setEditingId] = useState<Id<"grades"> | null>(null)
  const [editCode, setEditCode] = useState('')
  const [editLabel, setEditLabel] = useState('')

  // 삭제 확인
  const [deletingId, setDeletingId] = useState<Id<"grades"> | null>(null)

  // Convex 쿼리/뮤테이션
  const gradesWithCounts = useQuery(api.grades.listWithCounts)
  const stats = useQuery(api.instructors.stats)
  const createGrade = useMutation(api.grades.create)
  const updateGrade = useMutation(api.grades.update)
  const removeGrade = useMutation(api.grades.remove)

  if (gradesWithCounts === undefined || stats === undefined) {
    return <LoadingSpinner message="등급 데이터를 불러오는 중..." />
  }

  const totalCount = stats.totalCount

  // 추가
  const handleAdd = async () => {
    const code = newCode.trim().toUpperCase()
    const label = newLabel.trim()
    if (!code || !label) return
    try {
      await createGrade({ code, label })
      setNewCode('')
      setNewLabel('')
      setIsAdding(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : '오류가 발생했습니다.')
    }
  }

  // 수정
  const startEdit = (id: Id<"grades">, code: string, label: string) => {
    setEditingId(id)
    setEditCode(code)
    setEditLabel(label)
    setDeletingId(null)
  }

  const handleEdit = async (id: Id<"grades">) => {
    const code = editCode.trim().toUpperCase()
    const label = editLabel.trim()
    if (!code || !label) return
    try {
      await updateGrade({ id, code, label })
      setEditingId(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : '오류가 발생했습니다.')
    }
  }

  // 삭제
  const handleDelete = async (id: Id<"grades">) => {
    try {
      await removeGrade({ id })
      setDeletingId(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : '오류가 발생했습니다.')
    }
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">등급 관리</h1>
          <p className="mt-1 text-sm text-slate-500">
            총 <span className="font-semibold text-teal-700">{gradesWithCounts.length}</span>개
            등급이 등록되어 있습니다.
          </p>
        </div>
        <Button
          onClick={() => { setIsAdding(true); setEditingId(null); setDeletingId(null) }}
          className="h-9 gap-1.5 rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700 active:bg-teal-800"
        >
          <Plus className="h-4 w-4" />
          등급 추가
        </Button>
      </div>

      {/* 새 등급 추가 */}
      {isAdding && (
        <Card className="border-teal-200 bg-teal-50/30">
          <CardContent className="flex items-center gap-3 p-4">
            <Input
              placeholder="등급 코드 (예: S)"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === 'Escape') { setIsAdding(false); setNewCode(''); setNewLabel('') }
              }}
              autoFocus
              className="h-9 w-32 rounded-xl border-gray-200 bg-white text-sm"
              maxLength={2}
            />
            <Input
              placeholder="등급 설명 (예: 특별 강사)"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd()
                if (e.key === 'Escape') { setIsAdding(false); setNewCode(''); setNewLabel('') }
              }}
              className="h-9 flex-1 rounded-xl border-gray-200 bg-white text-sm"
            />
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={!newCode.trim() || !newLabel.trim()}
              className="h-9 rounded-xl bg-teal-600 px-4 text-sm font-medium text-white hover:bg-teal-700"
            >
              <Check className="mr-1.5 h-3.5 w-3.5" />
              추가
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => { setIsAdding(false); setNewCode(''); setNewLabel('') }}
              className="h-9 rounded-xl border-gray-200 px-4 text-sm"
            >
              취소
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 등급 테이블 */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-200 hover:bg-transparent">
              <TableHead className="bg-gray-50 py-3 w-24 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500">등급</TableHead>
              <TableHead className="bg-gray-50 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">설명</TableHead>
              <TableHead className="bg-gray-50 py-3 w-32 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500">강사 수</TableHead>
              <TableHead className="bg-gray-50 py-3 w-40 text-[11px] font-semibold uppercase tracking-wider text-slate-500">비율</TableHead>
              <TableHead className="bg-gray-50 py-3 w-24 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gradesWithCounts.map((grade) => {
              const pct = totalCount > 0 ? Math.round((grade.count / totalCount) * 100) : 0
              const isEditing = editingId === grade._id
              const isDeleting = deletingId === grade._id

              return (
                <TableRow
                  key={grade._id}
                  className={`border-b border-gray-100 transition-colors ${
                    isDeleting ? 'bg-red-50/50' : 'hover:bg-gray-50/70'
                  }`}
                >
                  {isEditing ? (
                    <>
                      <TableCell className="py-3 text-center">
                        <Input
                          value={editCode}
                          onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                          className="h-8 w-16 mx-auto rounded-lg border-gray-200 text-center text-sm font-bold"
                          maxLength={2}
                          autoFocus
                        />
                      </TableCell>
                      <TableCell className="py-3">
                        <Input
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleEdit(grade._id)
                            if (e.key === 'Escape') setEditingId(null)
                          }}
                          className="h-8 rounded-lg border-gray-200 text-sm"
                        />
                      </TableCell>
                      <TableCell className="py-3 text-center text-sm text-slate-500">{grade.count}명</TableCell>
                      <TableCell className="py-3">
                        <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                          <div className="h-full rounded-full bg-teal-500" style={{ width: `${pct}%` }} />
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            size="sm"
                            onClick={() => handleEdit(grade._id)}
                            className="h-7 rounded-lg bg-teal-600 px-3 text-xs text-white hover:bg-teal-700"
                          >
                            저장
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingId(null)}
                            className="h-7 rounded-lg border-gray-200 px-3 text-xs"
                          >
                            취소
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  ) : isDeleting ? (
                    <>
                      <TableCell className="py-3 text-center">
                        <Badge className={`rounded-lg border px-2.5 py-0.5 text-xs font-bold ${grade.color}`}>
                          {grade.code}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3" colSpan={2}>
                        <p className="text-sm text-red-600 font-medium">
                          이 등급을 삭제하시겠습니까?
                          {grade.count > 0 && (
                            <span className="text-red-500 font-normal"> ({grade.count}명의 강사가 등록되어 있습니다)</span>
                          )}
                        </p>
                      </TableCell>
                      <TableCell className="py-3" colSpan={2}>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            onClick={() => handleDelete(grade._id)}
                            className="h-7 rounded-lg bg-red-600 px-3 text-xs text-white hover:bg-red-700"
                          >
                            삭제
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDeletingId(null)}
                            className="h-7 rounded-lg border-gray-200 px-3 text-xs"
                          >
                            취소
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="py-3.5 text-center">
                        <Badge className={`rounded-lg border px-2.5 py-0.5 text-xs font-bold ${grade.color}`}>
                          {grade.code}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3.5">
                        <span className="text-sm font-medium text-slate-800">{grade.label}</span>
                      </TableCell>
                      <TableCell className="py-3.5 text-center">
                        <span className="text-sm font-semibold text-slate-700 tabular-nums">{grade.count}</span>
                        <span className="text-xs text-slate-400 ml-0.5">명</span>
                      </TableCell>
                      <TableCell className="py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                            <div className="h-full rounded-full bg-teal-500 transition-all duration-500" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-slate-400 tabular-nums w-8">{pct}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3.5 text-center">
                        <div className="flex items-center justify-center gap-0.5">
                          <button
                            onClick={() => startEdit(grade._id, grade.code, grade.label)}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-gray-100 hover:text-slate-600"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => { setDeletingId(grade._id); setEditingId(null) }}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              )
            })}

            {gradesWithCounts.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Award className="h-8 w-8 text-slate-300" />
                    <p className="text-sm text-slate-500">등록된 등급이 없습니다.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
