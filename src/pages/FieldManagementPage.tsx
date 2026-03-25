import { useState } from 'react'
import { Search, Grid3X3, Users, Plus, Pencil, Trash2, Check } from 'lucide-react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function FieldManagementPage() {
  const [search, setSearch] = useState('')

  // 추가 모드
  const [isAdding, setIsAdding] = useState(false)
  const [newFieldName, setNewFieldName] = useState('')

  // 수정 모드
  const [editingFieldId, setEditingFieldId] = useState<Id<"fields"> | null>(null)
  const [editValue, setEditValue] = useState('')

  // 삭제 확인
  const [deletingFieldId, setDeletingFieldId] = useState<Id<"fields"> | null>(null)

  // Convex 쿼리/뮤테이션
  const fieldsWithCounts = useQuery(api.fields.listWithCounts)
  const stats = useQuery(api.instructors.stats)
  const createField = useMutation(api.fields.create)
  const updateField = useMutation(api.fields.update)
  const removeField = useMutation(api.fields.remove)

  if (fieldsWithCounts === undefined || stats === undefined) {
    return <LoadingSpinner message="분야 데이터를 불러오는 중..." />
  }

  // 검색 필터
  const filtered = fieldsWithCounts.filter((field) =>
    field.name.includes(search)
  )

  const totalInstructors = stats.totalCount
  const maxCount = Math.max(...fieldsWithCounts.map((f) => f.count), 1)

  // 분야 추가
  const handleAdd = async () => {
    const name = newFieldName.trim()
    if (!name) return
    try {
      await createField({ name })
      setNewFieldName('')
      setIsAdding(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : '오류가 발생했습니다.')
    }
  }

  // 분야 수정
  const handleEdit = async (id: Id<"fields">) => {
    const name = editValue.trim()
    if (!name) return
    try {
      await updateField({ id, name })
      setEditingFieldId(null)
      setEditValue('')
    } catch (err) {
      alert(err instanceof Error ? err.message : '오류가 발생했습니다.')
    }
  }

  // 분야 삭제
  const handleDelete = async (id: Id<"fields">) => {
    try {
      await removeField({ id })
      setDeletingFieldId(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : '오류가 발생했습니다.')
    }
  }

  // 수정 모드 시작
  const startEdit = (id: Id<"fields">, name: string) => {
    setEditingFieldId(id)
    setEditValue(name)
    setDeletingFieldId(null)
  }

  // 수정/추가 취소
  const cancelEdit = () => {
    setEditingFieldId(null)
    setEditValue('')
  }

  const cancelAdd = () => {
    setIsAdding(false)
    setNewFieldName('')
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">분야 관리</h1>
          <p className="mt-1 text-sm text-slate-500">
            총 <span className="font-semibold text-teal-700">{fieldsWithCounts.length}</span>개
            활동분야가 등록되어 있습니다.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
            <Grid3X3 className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-500">
              전체 강사 <span className="font-semibold text-slate-800">{totalInstructors}</span>명
            </span>
          </div>
          <Button
            onClick={() => { setIsAdding(true); setEditingFieldId(null); setDeletingFieldId(null) }}
            className="h-9 gap-1.5 rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700 active:bg-teal-800"
          >
            <Plus className="h-4 w-4" />
            분야 추가
          </Button>
        </div>
      </div>

      {/* 검색 */}
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="분야명 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 rounded-xl border-gray-200 bg-white pl-9 text-sm placeholder:text-slate-400 transition-colors focus-visible:ring-1 focus-visible:ring-teal-500/40 focus-visible:border-teal-400 hover:border-gray-300"
        />
      </div>

      {/* 새 분야 추가 입력 */}
      {isAdding && (
        <Card className="border-teal-200 bg-teal-50/30">
          <CardContent className="flex items-center gap-3 p-4">
            <Input
              placeholder="새 분야명을 입력하세요"
              value={newFieldName}
              onChange={(e) => setNewFieldName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd()
                if (e.key === 'Escape') cancelAdd()
              }}
              autoFocus
              className="h-9 flex-1 rounded-xl border-gray-200 bg-white text-sm"
            />
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={!newFieldName.trim()}
              className="h-9 rounded-xl bg-teal-600 px-4 text-sm font-medium text-white hover:bg-teal-700"
            >
              <Check className="mr-1.5 h-3.5 w-3.5" />
              추가
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={cancelAdd}
              className="h-9 rounded-xl border-gray-200 px-4 text-sm"
            >
              취소
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 분야 카드 그리드 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {filtered.map((field) => {
          const percentage = maxCount > 0 ? (field.count / maxCount) * 100 : 0
          const isEditing = editingFieldId === field._id
          const isDeleting = deletingFieldId === field._id

          return (
            <Card
              key={field._id}
              className={`group transition-colors ${
                isEditing ? 'border-teal-300 ring-1 ring-teal-100' :
                isDeleting ? 'border-red-200 bg-red-50/30' :
                'hover:border-teal-200'
              }`}
            >
              <CardContent className="p-4">
                {/* 수정 모드 */}
                {isEditing ? (
                  <div className="space-y-3">
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleEdit(field._id)
                        if (e.key === 'Escape') cancelEdit()
                      }}
                      autoFocus
                      className="h-8 rounded-lg border-gray-200 text-sm"
                    />
                    <div className="flex gap-1.5">
                      <Button
                        size="sm"
                        onClick={() => handleEdit(field._id)}
                        disabled={!editValue.trim()}
                        className="h-7 flex-1 rounded-lg bg-teal-600 text-xs font-medium text-white hover:bg-teal-700"
                      >
                        <Check className="mr-1 h-3 w-3" />
                        저장
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEdit}
                        className="h-7 flex-1 rounded-lg border-gray-200 text-xs"
                      >
                        취소
                      </Button>
                    </div>
                  </div>
                ) : isDeleting ? (
                  /* 삭제 확인 */
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-700">
                      <span className="font-semibold text-red-600">{field.name}</span>을(를) 삭제하시겠습니까?
                    </p>
                    {field.count > 0 && (
                      <p className="text-[11px] text-red-500">
                        이 분야에 {field.count}명의 강사가 등록되어 있습니다.
                      </p>
                    )}
                    <div className="flex gap-1.5">
                      <Button
                        size="sm"
                        onClick={() => handleDelete(field._id)}
                        className="h-7 flex-1 rounded-lg bg-red-600 text-xs font-medium text-white hover:bg-red-700"
                      >
                        삭제
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeletingFieldId(null)}
                        className="h-7 flex-1 rounded-lg border-gray-200 text-xs"
                      >
                        취소
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* 기본 모드 */
                  <>
                    <div className="flex items-start justify-between">
                      <h3 className="text-sm font-semibold text-slate-800 leading-tight">
                        {field.name}
                      </h3>
                      <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => startEdit(field._id, field.name)}
                          className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-gray-100 hover:text-slate-600"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => { setDeletingFieldId(field._id); setEditingFieldId(null) }}
                          className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {field.count > 0 && (
                      <Badge
                        variant="secondary"
                        className="mt-1.5 rounded-lg border-0 bg-teal-50 px-1.5 py-0 text-[10px] font-semibold text-teal-700"
                      >
                        강사 {field.count}명
                      </Badge>
                    )}

                    {/* 강사 수 바 */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1 text-slate-400">
                          <Users className="h-3 w-3" />
                          <span className="text-[11px]">등록 강사</span>
                        </div>
                        <span className="text-xs font-semibold text-slate-600 tabular-nums">
                          {field.count}명
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-teal-500 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 빈 상태 */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-700">검색 결과가 없습니다</p>
          <p className="mt-0.5 text-xs text-slate-400">다른 검색어를 사용해보세요.</p>
        </div>
      )}
    </div>
  )
}
