import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// 등급 목록 조회 (order 순)
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("grades").withIndex("by_order").collect();
  },
});

// 등급별 강사 수 포함 목록
export const listWithCounts = query({
  args: {},
  handler: async (ctx) => {
    const grades = await ctx.db.query("grades").withIndex("by_order").collect();
    const allInstructors = await ctx.db.query("instructors").collect();

    return grades.map((grade) => {
      const count = allInstructors.filter(
        (inst) => inst.grade === grade.code
      ).length;
      return { ...grade, count };
    });
  },
});

// 등급 추가
export const create = mutation({
  args: {
    code: v.string(),
    label: v.string(),
  },
  handler: async (ctx, args) => {
    // 중복 체크
    const existing = await ctx.db
      .query("grades")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();
    if (existing) {
      throw new Error("이미 존재하는 등급 코드입니다.");
    }

    // order 값 계산
    const allGrades = await ctx.db.query("grades").collect();
    const maxOrder = allGrades.length > 0
      ? Math.max(...allGrades.map((g) => g.order))
      : -1;

    return await ctx.db.insert("grades", {
      code: args.code,
      label: args.label,
      color: "bg-gray-100 text-gray-600 border-gray-200",
      order: maxOrder + 1,
    });
  },
});

// 등급 수정 (강사 데이터도 연쇄 업데이트)
export const update = mutation({
  args: {
    id: v.id("grades"),
    code: v.string(),
    label: v.string(),
  },
  handler: async (ctx, args) => {
    const grade = await ctx.db.get(args.id);
    if (!grade) throw new Error("등급을 찾을 수 없습니다.");

    // 중복 체크 (자기 자신 제외)
    if (grade.code !== args.code) {
      const existing = await ctx.db
        .query("grades")
        .withIndex("by_code", (q) => q.eq("code", args.code))
        .first();
      if (existing) {
        throw new Error("이미 존재하는 등급 코드입니다.");
      }

      // 강사 데이터에서 이전 등급 코드를 새 코드로 교체
      const instructors = await ctx.db.query("instructors").collect();
      for (const inst of instructors) {
        if (inst.grade === grade.code) {
          await ctx.db.patch(inst._id, { grade: args.code });
        }
      }
    }

    await ctx.db.patch(args.id, {
      code: args.code,
      label: args.label,
    });
  },
});

// 등급 삭제
export const remove = mutation({
  args: { id: v.id("grades") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
