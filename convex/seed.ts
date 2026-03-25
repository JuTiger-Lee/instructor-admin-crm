import { mutation } from "./_generated/server";

const ACTIVITY_FIELDS = [
  "리더십", "커뮤니케이션", "조직관리", "마케팅", "재무/회계",
  "인사/노무", "법률/규정", "취·창업", "자기계발", "직무역량",
  "안전교육", "응급처치", "코딩/프로그래밍", "데이터분석", "인공지능(AI)",
  "디자인(그래픽)", "3D모델링/프린팅", "외국어(영어)", "외국어(중국어)", "외국어(기타)",
  "요리/제과제빵", "캘리그라피", "드론", "영상제작", "사진/포토그래피",
  "음악/악기", "체육/피트니스", "심리상담", "환경/ESG", "진로/직업체험",
];

const ACTIVITY_REGIONS = [
  "서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종",
  "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주",
];

const GRADES = [
  { code: "A", label: "최우수 강사", color: "bg-emerald-100 text-emerald-700 border-emerald-200", order: 0 },
  { code: "B", label: "우수 강사", color: "bg-blue-100 text-blue-700 border-blue-200", order: 1 },
  { code: "C", label: "일반 강사", color: "bg-amber-100 text-amber-700 border-amber-200", order: 2 },
  { code: "D", label: "신규/수습 강사", color: "bg-slate-100 text-slate-600 border-slate-200", order: 3 },
];


export const run = mutation({
  args: {},
  handler: async (ctx) => {
    // 중복 실행 방지
    const existingField = await ctx.db.query("fields").first();
    if (existingField) {
      return "이미 시드 데이터가 존재합니다.";
    }

    // 활동분야 삽입
    for (let i = 0; i < ACTIVITY_FIELDS.length; i++) {
      await ctx.db.insert("fields", { name: ACTIVITY_FIELDS[i], order: i });
    }

    // 지역 삽입
    for (let i = 0; i < ACTIVITY_REGIONS.length; i++) {
      await ctx.db.insert("regions", { name: ACTIVITY_REGIONS[i], order: i });
    }

    // 등급 삽입
    for (const grade of GRADES) {
      await ctx.db.insert("grades", grade);
    }

    return "시드 데이터가 성공적으로 삽입되었습니다.";
  },
});

// 강사 데이터 전체 삭제
export const clearInstructors = mutation({
  args: {},
  handler: async (ctx) => {
    const allInstructors = await ctx.db.query("instructors").collect();
    for (const inst of allInstructors) {
      // 관련 파일 삭제
      if (inst.profileImage) await ctx.storage.delete(inst.profileImage);
      if (inst.resume) await ctx.storage.delete(inst.resume);
      if (inst.idCard) await ctx.storage.delete(inst.idCard);
      if (inst.portfolio) {
        for (const fileId of inst.portfolio) {
          await ctx.storage.delete(fileId);
        }
      }
      await ctx.db.delete(inst._id);
    }
    return `${allInstructors.length}명의 강사 데이터가 삭제되었습니다.`;
  },
});
