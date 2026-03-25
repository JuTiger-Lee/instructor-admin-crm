import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import InstructorForm from '@/components/InstructorForm'

export default function InstructorCreatePage() {
  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="animate-slide-up">
        <Link
          to="/instructors"
          className="mb-3 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:text-teal-600 hover:bg-teal-50 -ml-2"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          강사 목록으로
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          강사 등록
        </h1>
        <p className="mt-1 text-sm text-slate-500">새로운 강사 정보를 입력해주세요.</p>
        <div className="mt-4 h-px bg-gray-200" />
      </div>
      <InstructorForm mode="create" />
    </div>
  )
}
