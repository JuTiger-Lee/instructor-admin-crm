import { Users, Award, BarChart2, TrendingUp } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GRADE_COLORS, GRADE_LABELS } from '@/data/constants'
import LoadingSpinner from '@/components/LoadingSpinner'

const GENDER_COLORS = ['#3b82f6', '#ec4899']

const renderDonutLabel = ({
  cx,
  cy,
  totalCount,
}: {
  cx: number
  cy: number
  totalCount: number
}) => (
  <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
    <tspan x={cx} dy="-0.4em" fontSize={28} fontWeight={700} fill="#0f172a">
      {totalCount}
    </tspan>
    <tspan x={cx} dy="1.7em" fontSize={11} fill="#64748b">
      총 강사
    </tspan>
  </text>
)

const gradeAccentText: Record<string, string> = {
  A: 'text-teal-700',
  B: 'text-blue-700',
  C: 'text-amber-700',
  D: 'text-slate-500',
}

const gradeAccentBg: Record<string, string> = {
  A: 'bg-teal-50 border-teal-100',
  B: 'bg-blue-50 border-blue-100',
  C: 'bg-amber-50 border-amber-100',
  D: 'bg-slate-50 border-slate-200',
}

const gradeBarColor: Record<string, string> = {
  A: '#0d9488',
  B: '#3b82f6',
  C: '#f59e0b',
  D: '#94a3b8',
}

export default function DashboardPage() {
  const stats = useQuery(api.instructors.stats)

  if (stats === undefined) {
    return <LoadingSpinner message="대시보드 데이터를 불러오는 중..." />
  }

  const { totalCount, gradeCounts, fieldData, genderData } = stats

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="animate-slide-up">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          대시보드
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          강사 현황 및 통계를 한눈에 확인하세요.
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {/* 전체 강사 */}
        <div className="animate-slide-up rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500">전체 강사</span>
            <Users className="h-4 w-4 text-slate-400" />
          </div>
          <p className="text-3xl font-bold tabular-nums text-slate-900">{totalCount}</p>
          <p className="mt-1.5 text-[11px] text-slate-400">등록된 총 강사 수</p>
        </div>

        {/* 등급별 카드 */}
        {(['A', 'B', 'C', 'D'] as const).map((grade, i) => (
          <div
            key={grade}
            className={`animate-slide-up stagger-${i + 1} rounded-xl border bg-white p-5 shadow-sm ${gradeAccentBg[grade]}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500">{grade}등급</span>
              <Award className={`h-4 w-4 ${gradeAccentText[grade]}`} />
            </div>
            <p className={`text-3xl font-bold tabular-nums ${gradeAccentText[grade]}`}>
              {gradeCounts[grade] ?? 0}
            </p>
            <p className="mt-1.5 text-[11px] text-slate-400">{GRADE_LABELS[grade]}</p>
          </div>
        ))}
      </div>

      {/* 차트 영역 */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* 분야별 강사 수 */}
        <Card className="lg:col-span-2 animate-slide-up stagger-3">
          <CardHeader className="px-6 pt-5 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <BarChart2 className="h-4 w-4 text-slate-400" />
                <div>
                  <CardTitle className="text-[15px] font-semibold text-slate-800">
                    분야별 강사 수
                  </CardTitle>
                  <p className="mt-0.5 text-xs text-slate-400">활동분야별 등록 강사 인원 (중복 가능)</p>
                </div>
              </div>
              <span className="rounded-lg bg-teal-50 border border-teal-100 px-2.5 py-1 text-[11px] font-medium text-teal-700">
                {fieldData.length}개 분야
              </span>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <ResponsiveContainer width="100%" height={580}>
              <BarChart
                data={fieldData}
                layout="vertical"
                margin={{ top: 0, right: 24, left: 8, bottom: 0 }}
              >
                <XAxis
                  type="number"
                  domain={[0, 'dataMax']}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={118}
                  tick={{ fontSize: 11, fill: '#475569' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value: number) => [`${value}명`, '강사 수']}
                  contentStyle={{
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    fontSize: 12,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    background: '#fff',
                  }}
                  cursor={{ fill: 'rgba(13,148,136,0.05)' }}
                />
                <Bar dataKey="count" radius={[0, 5, 5, 0]} fill="#0d9488" opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 성별 비율 */}
        <Card className="animate-slide-up stagger-4">
          <CardHeader className="px-6 pt-5 pb-3">
            <div className="flex items-center gap-2.5">
              <TrendingUp className="h-4 w-4 text-slate-400" />
              <div>
                <CardTitle className="text-[15px] font-semibold text-slate-800">
                  성별 비율
                </CardTitle>
                <p className="mt-0.5 text-xs text-slate-400">등록 강사 성별 분포</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={72}
                  outerRadius={108}
                  paddingAngle={4}
                  dataKey="value"
                  labelLine={false}
                  label={(props: { cx: number; cy: number }) =>
                    renderDonutLabel({ ...props, totalCount })
                  }
                  strokeWidth={0}
                >
                  {genderData.map((_: { name: string; value: number }, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={GENDER_COLORS[index % GENDER_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend
                  formatter={(
                    value: string,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    entry: any
                  ) => (
                    <span style={{ color: '#475569', fontSize: 12 }}>
                      {value}:{' '}
                      <strong style={{ color: entry.color }}>
                        {entry.payload?.value}명
                      </strong>
                    </span>
                  )}
                />
                <Tooltip
                  formatter={(value: number) => [`${value}명`, '강사 수']}
                  contentStyle={{
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    fontSize: 12,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    background: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* 성별 상세 */}
            <div className="mt-3 space-y-2.5 rounded-xl border border-gray-100 bg-gray-50 p-4">
              {genderData.map((item: { name: string; value: number }, index: number) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: GENDER_COLORS[index] }}
                    />
                    <span className="text-sm font-medium text-slate-600">{item.name}성</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold tabular-nums text-slate-800">
                      {item.value}명
                    </span>
                    <span
                      className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold"
                      style={{
                        background: `${GENDER_COLORS[index]}18`,
                        color: GENDER_COLORS[index],
                      }}
                    >
                      {totalCount > 0 ? Math.round((item.value / totalCount) * 100) : 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 등급별 현황 요약 */}
      <Card className="animate-slide-up stagger-5">
        <CardHeader className="px-6 pt-5 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[15px] font-semibold text-slate-800">
              등급별 현황 요약
            </CardTitle>
            <span className="text-xs text-slate-400">전체 {totalCount}명 기준</span>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {(['A', 'B', 'C', 'D'] as const).map((grade, i) => {
              const count = gradeCounts[grade] ?? 0
              const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0
              return (
                <div
                  key={grade}
                  className={`animate-slide-up stagger-${i + 1} rounded-xl border p-4 ${gradeAccentBg[grade]}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${gradeAccentText[grade]} bg-white border ${gradeAccentBg[grade].split(' ')[1]}`}
                    >
                      {grade}
                    </span>
                    <span className={`text-[11px] font-semibold ${gradeAccentText[grade]}`}>
                      {pct}%
                    </span>
                  </div>
                  <p className={`text-[28px] font-bold tabular-nums leading-none ${gradeAccentText[grade]}`}>
                    {count}
                    <span className="text-sm font-normal text-slate-400 ml-1">명</span>
                  </p>
                  <p className="mt-1.5 text-[11px] text-slate-500">{GRADE_LABELS[grade]}</p>
                  <div className="mt-3 h-1 rounded-full bg-white/80 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: gradeBarColor[grade],
                      }}
                    />
                  </div>
                  <div className="mt-2.5">
                    <span
                      className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium border ${GRADE_COLORS[grade]}`}
                    >
                      {grade}등급
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
