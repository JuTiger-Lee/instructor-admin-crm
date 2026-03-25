/** 활동분야 30개 */
export const ACTIVITY_FIELDS = [
  '리더십', '커뮤니케이션', '조직관리', '마케팅', '재무/회계',
  '인사/노무', '법률/규정', '취·창업', '자기계발', '직무역량',
  '안전교육', '응급처치', '코딩/프로그래밍', '데이터분석', '인공지능(AI)',
  '디자인(그래픽)', '3D모델링/프린팅', '외국어(영어)', '외국어(중국어)', '외국어(기타)',
  '요리/제과제빵', '캘리그라피', '드론', '영상제작', '사진/포토그래피',
  '음악/악기', '체육/피트니스', '심리상담', '환경/ESG', '진로/직업체험',
] as const

/** 활동지역 17개 시도 */
export const ACTIVITY_REGIONS = [
  '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
  '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주',
] as const

/** 강사 등급 */
export const GRADES = ['A', 'B', 'C', 'D'] as const

export const GRADE_LABELS: Record<string, string> = {
  A: '최우수 강사',
  B: '우수 강사',
  C: '일반 강사',
  D: '신규/수습 강사',
}

export const GRADE_COLORS: Record<string, string> = {
  A: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  B: 'bg-blue-100 text-blue-700 border-blue-200',
  C: 'bg-amber-100 text-amber-700 border-amber-200',
  D: 'bg-slate-100 text-slate-600 border-slate-200',
}

/** 성별 */
export const GENDERS = ['남', '여'] as const

/** 은행 목록 */
export const BANKS = [
  '국민은행', '신한은행', '우리은행', '하나은행', 'NH농협은행',
  'IBK기업은행', 'SC제일은행', '카카오뱅크', '토스뱅크', '케이뱅크',
  '대구은행', '부산은행', '경남은행', '광주은행', '전북은행',
  '제주은행', '수협은행', '새마을금고', '신협', '우체국',
] as const

export type ActivityField = typeof ACTIVITY_FIELDS[number]
export type ActivityRegion = typeof ACTIVITY_REGIONS[number]
export type Grade = typeof GRADES[number]
export type Gender = typeof GENDERS[number]
