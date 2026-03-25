import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Plus, Trash2, Camera, User, Loader2 } from 'lucide-react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id, Doc } from '../../convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  GENDERS,
  BANKS,
} from '@/data/constants'
import { formatPhoneNumber } from '@/lib/utils'
import LoadingSpinner from './LoadingSpinner'

interface Certificate {
  id: string
  name: string
  issuer: string
  date: string
}

interface Education {
  id: string
  school: string
  major: string
  graduationYear: string
}

type InstructorFormData = {
  name: string
  gender: '남' | '여'
  phone: string
  grade: string
  fields: string[]
  regions: string[]
  career: string
  bank: string
  accountNumber: string
}

type Props = {
  defaultValues?: Doc<"instructors">
  mode: 'create' | 'edit'
  instructorId?: Id<"instructors">
}

function generateId() {
  return Math.random().toString(36).slice(2)
}

// 섹션 래퍼
function FormSection({
  title,
  children,
  className,
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card className={className}>
      <CardHeader className="px-6 pt-5 pb-4 border-b border-gray-100">
        <CardTitle className="text-[14px] font-semibold text-slate-800">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 py-5">{children}</CardContent>
    </Card>
  )
}

// 필드 레이블
function FieldLabel({
  htmlFor,
  required,
  children,
  hint,
}: {
  htmlFor?: string
  required?: boolean
  children: React.ReactNode
  hint?: string
}) {
  return (
    <Label htmlFor={htmlFor} className="text-[13px] font-medium text-slate-700">
      {children}
      {required && <span className="ml-0.5 text-rose-500">*</span>}
      {hint && (
        <span className="ml-2 text-[11px] font-normal text-slate-400">{hint}</span>
      )}
    </Label>
  )
}

export default function InstructorForm({ defaultValues, mode, instructorId }: Props) {
  const navigate = useNavigate()

  // Convex 쿼리/뮤테이션
  const fieldsData = useQuery(api.fields.list)
  const regionsData = useQuery(api.regions.list)
  const gradesData = useQuery(api.grades.list)
  const createInstructor = useMutation(api.instructors.create)
  const updateInstructor = useMutation(api.instructors.update)
  const generateUploadUrl = useMutation(api.files.generateUploadUrl)

  // 프로필 이미지 URL 조회
  const profileImageUrl = useQuery(
    api.files.getUrl,
    defaultValues?.profileImage
      ? { storageId: defaultValues.profileImage }
      : "skip"
  )

  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InstructorFormData>({
    defaultValues: {
      name: defaultValues?.name ?? '',
      gender: (defaultValues?.gender as '남' | '여') ?? '남',
      phone: defaultValues?.phone ?? '',
      grade: defaultValues?.grade ?? 'C',
      fields: defaultValues?.fields ?? [],
      regions: defaultValues?.regions ?? [],
      career: defaultValues?.career ?? '',
      bank: defaultValues?.bankAccount?.bank ?? '',
      accountNumber: defaultValues?.bankAccount?.accountNumber ?? '',
    },
  })

  const [profilePreview, setProfilePreview] = useState<string | null>(
    profileImageUrl ?? null
  )
  const [profileFile, setProfileFile] = useState<File | null>(null)
  const profileInputRef = useRef<HTMLInputElement>(null)

  // 서류 파일 상태
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [portfolioFiles, setPortfolioFiles] = useState<File[]>([])
  const [idCardFile, setIdCardFile] = useState<File | null>(null)

  const [certificates, setCertificates] = useState<Certificate[]>(
    defaultValues?.certificates ?? []
  )
  const [education, setEducation] = useState<Education[]>(
    defaultValues?.education ?? []
  )

  const watchedFields = watch('fields') ?? []
  const watchedRegions = watch('regions') ?? []
  const watchedGender = watch('gender')
  const watchedGrade = watch('grade')
  const watchedBank = watch('bank')

  if (fieldsData === undefined || regionsData === undefined || gradesData === undefined) {
    return <LoadingSpinner message="폼 데이터를 불러오는 중..." />
  }

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfileFile(file)
      const url = URL.createObjectURL(file)
      setProfilePreview(url)
    }
  }

  const toggleField = (field: string) => {
    const current = watchedFields
    const next = current.includes(field)
      ? current.filter((f) => f !== field)
      : [...current, field]
    setValue('fields', next, { shouldValidate: true })
  }

  const toggleRegion = (region: string) => {
    const current = watchedRegions
    const next = current.includes(region)
      ? current.filter((r) => r !== region)
      : [...current, region]
    setValue('regions', next, { shouldValidate: true })
  }

  const addCertificate = () => {
    setCertificates((prev) => [
      ...prev,
      { id: generateId(), name: '', issuer: '', date: '' },
    ])
  }
  const removeCertificate = (id: string) => {
    setCertificates((prev) => prev.filter((c) => c.id !== id))
  }
  const updateCertificate = (id: string, field: keyof Certificate, value: string) => {
    setCertificates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    )
  }

  const addEducation = () => {
    setEducation((prev) => [
      ...prev,
      { id: generateId(), school: '', major: '', graduationYear: '' },
    ])
  }
  const removeEducation = (id: string) => {
    setEducation((prev) => prev.filter((e) => e.id !== id))
  }
  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setEducation((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    )
  }

  // 파일 업로드 헬퍼
  const uploadFile = async (file: File): Promise<Id<"_storage">> => {
    const url = await generateUploadUrl()
    const result = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': file.type },
      body: file,
    })
    const { storageId } = await result.json()
    return storageId
  }

  const onSubmit = async (data: InstructorFormData) => {
    if (data.fields.length === 0) {
      alert('활동분야를 1개 이상 선택해주세요.')
      return
    }
    if (data.regions.length === 0) {
      alert('활동지역을 1개 이상 선택해주세요.')
      return
    }

    setSubmitting(true)

    try {
      // 파일 업로드
      let profileImageId: Id<"_storage"> | null = defaultValues?.profileImage ?? null
      let resumeId: Id<"_storage"> | null = defaultValues?.resume ?? null
      let idCardId: Id<"_storage"> | null = defaultValues?.idCard ?? null
      let portfolioIds: Id<"_storage">[] = defaultValues?.portfolio ?? []

      if (profileFile) {
        profileImageId = await uploadFile(profileFile)
      }
      if (resumeFile) {
        resumeId = await uploadFile(resumeFile)
      }
      if (idCardFile) {
        idCardId = await uploadFile(idCardFile)
      }
      if (portfolioFiles.length > 0) {
        portfolioIds = await Promise.all(portfolioFiles.map(uploadFile))
      }

      const instructorData = {
        name: data.name,
        phone: data.phone,
        gender: data.gender,
        grade: data.grade,
        fields: data.fields,
        regions: data.regions,
        career: data.career,
        certificates,
        education,
        bankAccount: {
          bank: data.bank,
          accountNumber: data.accountNumber,
        },
        profileImage: profileImageId,
        resume: resumeId,
        portfolio: portfolioIds,
        idCard: idCardId,
      }

      if (mode === 'create') {
        await createInstructor(instructorData)
        alert('강사가 등록되었습니다.')
      } else if (instructorId) {
        await updateInstructor({ id: instructorId, ...instructorData })
        alert('강사 정보가 수정되었습니다.')
      }
      navigate('/instructors')
    } catch (err) {
      alert(`오류가 발생했습니다: ${err instanceof Error ? err.message : '알 수 없는 오류'}`)
    } finally {
      setSubmitting(false)
    }
  }

  const inputCls = (hasError?: boolean) =>
    `h-9 rounded-xl border-gray-200 bg-white text-sm placeholder:text-slate-400 transition-colors focus-visible:ring-1 focus-visible:ring-teal-500/40 focus-visible:border-teal-400 hover:border-gray-300 ${hasError ? 'border-rose-300 focus-visible:ring-rose-400/30' : ''}`

  const GRADE_TEXT: Record<string, string> = {
    A: 'text-teal-700',
    B: 'text-blue-700',
    C: 'text-amber-700',
    D: 'text-slate-500',
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

      {/* 섹션 1: 프로필 사진 */}
      <FormSection title="프로필 사진">
        <div className="flex items-center gap-6">
          <div className="relative shrink-0">
            <Avatar className="h-20 w-20 ring-2 ring-gray-100">
              {profilePreview ? (
                <AvatarImage src={profilePreview} alt="프로필" />
              ) : profileImageUrl ? (
                <AvatarImage src={profileImageUrl} alt="프로필" />
              ) : null}
              <AvatarFallback className="bg-teal-600 text-2xl font-semibold text-white">
                {watch('name')?.slice(0, 1) || <User className="h-7 w-7 text-white/80" />}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => profileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-teal-600 text-white shadow-sm transition-colors hover:bg-teal-700"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => profileInputRef.current?.click()}
              className="h-8 rounded-xl border-gray-200 text-xs font-medium text-slate-600 transition-colors hover:bg-gray-50 hover:border-gray-300"
            >
              사진 선택
            </Button>
            <p className="mt-1.5 text-[11px] text-slate-400">JPG, PNG 파일 (최대 5MB)</p>
          </div>
          <input
            ref={profileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleProfileChange}
          />
        </div>
      </FormSection>

      {/* 섹션 2: 기본 정보 */}
      <FormSection title="기본 정보">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* 이름 */}
          <div className="space-y-2">
            <FieldLabel htmlFor="name" required>이름</FieldLabel>
            <Input
              id="name"
              placeholder="홍길동"
              {...register('name', { required: '이름을 입력해주세요.' })}
              className={inputCls(!!errors.name)}
            />
            {errors.name && (
              <p className="text-[11px] text-rose-500">{errors.name.message}</p>
            )}
          </div>

          {/* 성별 */}
          <div className="space-y-2">
            <FieldLabel required>성별</FieldLabel>
            <div className="flex gap-2 pt-0.5">
              {GENDERS.map((g) => (
                <label
                  key={g}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border px-5 py-2 text-sm font-medium transition-colors"
                  style={
                    watchedGender === g
                      ? {
                          borderColor: '#0d9488',
                          background: 'rgba(13,148,136,0.05)',
                          color: '#0f766e',
                        }
                      : {
                          borderColor: '#e5e7eb',
                          background: '#fff',
                          color: '#64748b',
                        }
                  }
                >
                  <span
                    className="h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center transition-colors"
                    style={
                      watchedGender === g
                        ? { borderColor: '#0d9488', background: '#0d9488' }
                        : { borderColor: '#d1d5db', background: '#fff' }
                    }
                  >
                    {watchedGender === g && (
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </span>
                  <input
                    type="radio"
                    value={g}
                    checked={watchedGender === g}
                    onChange={() => setValue('gender', g, { shouldValidate: true })}
                    className="hidden"
                  />
                  {g === '남' ? '남성' : '여성'}
                </label>
              ))}
            </div>
          </div>

          {/* 전화번호 */}
          <div className="space-y-2">
            <FieldLabel htmlFor="phone" required>전화번호</FieldLabel>
            <Input
              id="phone"
              placeholder="010-0000-0000"
              {...register('phone', {
                required: '전화번호를 입력해주세요.',
                pattern: {
                  value: /^010-\d{4}-\d{4}$/,
                  message: '올바른 전화번호 형식을 입력해주세요.',
                },
              })}
              onChange={(e) => {
                const formatted = formatPhoneNumber(e.target.value)
                setValue('phone', formatted, { shouldValidate: true })
              }}
              className={inputCls(!!errors.phone)}
            />
            {errors.phone && (
              <p className="text-[11px] text-rose-500">{errors.phone.message}</p>
            )}
          </div>

          {/* 등급 */}
          <div className="space-y-2">
            <FieldLabel required>등급</FieldLabel>
            <Select
              value={watchedGrade}
              onValueChange={(v) =>
                setValue('grade', v, { shouldValidate: true })
              }
            >
              <SelectTrigger className="h-9 rounded-xl border-gray-200 bg-white text-sm transition-colors hover:border-gray-300">
                {watchedGrade && (
                  <span className={`mr-2 text-xs font-bold ${GRADE_TEXT[watchedGrade] ?? ''}`}>
                    {watchedGrade}등급
                  </span>
                )}
                <SelectValue placeholder="등급 선택" />
              </SelectTrigger>
              <SelectContent>
                {gradesData.map((g) => (
                  <SelectItem key={g._id} value={g.code}>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${GRADE_TEXT[g.code] ?? ''}`}>{g.code}등급</span>
                      <span className="text-slate-500">— {g.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </FormSection>

      {/* 섹션 3: 활동 정보 */}
      <FormSection title="활동 정보">
        <div className="space-y-6">
          {/* 활동분야 */}
          <div className="space-y-2.5">
            <FieldLabel required hint={watchedFields.length > 0 ? `${watchedFields.length}개 선택됨` : undefined}>
              활동분야
            </FieldLabel>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-5">
              {fieldsData.map((field) => {
                const active = watchedFields.includes(field.name)
                return (
                  <label
                    key={field._id}
                    className="flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-[12px] font-medium transition-colors"
                    style={
                      active
                        ? {
                            borderColor: '#0d9488',
                            background: 'rgba(13,148,136,0.05)',
                            color: '#0f766e',
                          }
                        : {
                            borderColor: '#e5e7eb',
                            background: '#fff',
                            color: '#64748b',
                          }
                    }
                  >
                    <span
                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-colors"
                      style={
                        active
                          ? { borderColor: '#0d9488', background: '#0d9488' }
                          : { borderColor: '#d1d5db', background: '#fff' }
                      }
                    >
                      {active && (
                        <svg viewBox="0 0 8 6" className="h-2 w-2 fill-none stroke-white stroke-[1.5]">
                          <polyline points="1,3 3,5 7,1" />
                        </svg>
                      )}
                    </span>
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggleField(field.name)}
                      className="hidden"
                    />
                    <span className="truncate">{field.name}</span>
                  </label>
                )
              })}
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* 활동지역 */}
          <div className="space-y-2.5">
            <FieldLabel required hint={watchedRegions.length > 0 ? `${watchedRegions.length}개 선택됨` : undefined}>
              활동지역
            </FieldLabel>
            <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5 md:grid-cols-9">
              {regionsData.map((region) => {
                const active = watchedRegions.includes(region.name)
                return (
                  <label
                    key={region._id}
                    className="flex cursor-pointer items-center justify-center rounded-xl border px-2 py-2 text-[12px] font-medium transition-colors"
                    style={
                      active
                        ? {
                            borderColor: '#0d9488',
                            background: 'rgba(13,148,136,0.05)',
                            color: '#0f766e',
                          }
                        : {
                            borderColor: '#e5e7eb',
                            background: '#fff',
                            color: '#64748b',
                          }
                    }
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggleRegion(region.name)}
                      className="hidden"
                    />
                    {region.name}
                  </label>
                )
              })}
            </div>
          </div>
        </div>
      </FormSection>

      {/* 섹션 4: 경력 & 자격 */}
      <FormSection title="경력 및 자격">
        <div className="space-y-6">
          {/* 경력 */}
          <div className="space-y-2">
            <FieldLabel htmlFor="career">경력 사항</FieldLabel>
            <Textarea
              id="career"
              placeholder="강의 경력, 관련 활동 등을 입력해주세요."
              rows={4}
              {...register('career')}
              className="rounded-xl border-gray-200 bg-white text-sm placeholder:text-slate-400 transition-colors focus-visible:ring-1 focus-visible:ring-teal-500/40 focus-visible:border-teal-400 hover:border-gray-300 resize-none"
            />
          </div>

          <div className="h-px bg-gray-100" />

          {/* 자격증 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <FieldLabel>자격증</FieldLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCertificate}
                className="h-7 rounded-xl border-gray-200 px-3 text-[11px] font-medium text-slate-600 transition-colors hover:bg-gray-50 hover:border-gray-300"
              >
                <Plus className="mr-1 h-3 w-3" />
                추가
              </Button>
            </div>
            {certificates.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-5 text-center text-[12px] text-slate-400">
                등록된 자격증이 없습니다.
              </div>
            )}
            <div className="space-y-2">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="grid grid-cols-1 gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 sm:grid-cols-3 animate-fade-in"
                >
                  <Input
                    placeholder="자격증명"
                    value={cert.name}
                    onChange={(e) => updateCertificate(cert.id, 'name', e.target.value)}
                    className={inputCls()}
                  />
                  <Input
                    placeholder="발급기관"
                    value={cert.issuer}
                    onChange={(e) => updateCertificate(cert.id, 'issuer', e.target.value)}
                    className={inputCls()}
                  />
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={cert.date}
                      onChange={(e) => updateCertificate(cert.id, 'date', e.target.value)}
                      className={`${inputCls()} flex-1`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 shrink-0 rounded-xl p-0 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
                      onClick={() => removeCertificate(cert.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* 학력 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <FieldLabel>학력</FieldLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addEducation}
                className="h-7 rounded-xl border-gray-200 px-3 text-[11px] font-medium text-slate-600 transition-colors hover:bg-gray-50 hover:border-gray-300"
              >
                <Plus className="mr-1 h-3 w-3" />
                추가
              </Button>
            </div>
            {education.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-5 text-center text-[12px] text-slate-400">
                등록된 학력이 없습니다.
              </div>
            )}
            <div className="space-y-2">
              {education.map((edu) => (
                <div
                  key={edu.id}
                  className="grid grid-cols-1 gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 sm:grid-cols-3 animate-fade-in"
                >
                  <Input
                    placeholder="학교명"
                    value={edu.school}
                    onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                    className={inputCls()}
                  />
                  <Input
                    placeholder="전공"
                    value={edu.major}
                    onChange={(e) => updateEducation(edu.id, 'major', e.target.value)}
                    className={inputCls()}
                  />
                  <div className="flex gap-2">
                    <Input
                      placeholder="졸업연도 (예: 2020)"
                      value={edu.graduationYear}
                      onChange={(e) =>
                        updateEducation(edu.id, 'graduationYear', e.target.value)
                      }
                      className={`${inputCls()} flex-1`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 shrink-0 rounded-xl p-0 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
                      onClick={() => removeEducation(edu.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </FormSection>

      {/* 섹션 5: 서류 첨부 */}
      <FormSection title="서류 첨부">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="space-y-2">
            <FieldLabel htmlFor="resume">이력서</FieldLabel>
            <Input
              id="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
              className="h-9 cursor-pointer rounded-xl border-gray-200 bg-white text-[12px] text-slate-500 transition-colors hover:border-gray-300 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-1 file:text-[11px] file:font-medium file:text-slate-600"
            />
            <p className="text-[11px] text-slate-400">PDF, DOC 파일</p>
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="portfolio">포트폴리오</FieldLabel>
            <Input
              id="portfolio"
              type="file"
              accept=".pdf,.ppt,.pptx"
              multiple
              onChange={(e) => setPortfolioFiles(Array.from(e.target.files ?? []))}
              className="h-9 cursor-pointer rounded-xl border-gray-200 bg-white text-[12px] text-slate-500 transition-colors hover:border-gray-300 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-1 file:text-[11px] file:font-medium file:text-slate-600"
            />
            <p className="text-[11px] text-slate-400">복수 선택 가능</p>
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="idCard">신분증</FieldLabel>
            <Input
              id="idCard"
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setIdCardFile(e.target.files?.[0] ?? null)}
              className="h-9 cursor-pointer rounded-xl border-gray-200 bg-white text-[12px] text-slate-500 transition-colors hover:border-gray-300 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-1 file:text-[11px] file:font-medium file:text-slate-600"
            />
            <p className="text-[11px] text-slate-400">이미지 또는 PDF</p>
          </div>
        </div>
      </FormSection>

      {/* 섹션 6: 정산 정보 */}
      <FormSection title="정산 정보">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel>은행</FieldLabel>
            <Select
              value={watchedBank}
              onValueChange={(v) => setValue('bank', v)}
            >
              <SelectTrigger className="h-9 rounded-xl border-gray-200 bg-white text-sm transition-colors hover:border-gray-300">
                <SelectValue placeholder="은행 선택" />
              </SelectTrigger>
              <SelectContent>
                {BANKS.map((bank) => (
                  <SelectItem key={bank} value={bank}>
                    {bank}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="accountNumber">계좌번호</FieldLabel>
            <Input
              id="accountNumber"
              placeholder="계좌번호를 입력해주세요."
              {...register('accountNumber')}
              className={inputCls()}
            />
          </div>
        </div>
      </FormSection>

      {/* 하단 버튼 */}
      <div className="flex justify-end gap-3 pb-8 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/instructors')}
          disabled={submitting}
          className="h-9 rounded-xl border-gray-200 px-6 text-sm font-medium text-slate-600 transition-colors hover:bg-gray-50 hover:border-gray-300"
        >
          취소
        </Button>
        <Button
          type="submit"
          disabled={submitting}
          className="h-9 rounded-xl bg-teal-600 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700 active:bg-teal-800 disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {mode === 'create' ? '강사 등록' : '수정 저장'}
        </Button>
      </div>
    </form>
  )
}
