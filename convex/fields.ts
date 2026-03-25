import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// 분야 목록 조회 (order 순)
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("fields").withIndex("by_order").collect();
  },
});

// 분야별 강사 수 포함 목록
export const listWithCounts = query({
  args: {},
  handler: async (ctx) => {
    const fields = await ctx.db.query("fields").withIndex("by_order").collect();
    const allInstructors = await ctx.db.query("instructors").collect();

    return fields.map((field) => {
      const count = allInstructors.filter((inst) =>
        inst.fields.includes(field.name)
      ).length;
      return { ...field, count };
    });
  },
});

// 분야 추가
export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    // 중복 체크
    const existing = await ctx.db
      .query("fields")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
    if (existing) {
      throw new Error("이미 존재하는 분야명입니다.");
    }

    // order 값 계산 (마지막 + 1)
    const allFields = await ctx.db.query("fields").collect();
    const maxOrder = allFields.length > 0
      ? Math.max(...allFields.map((f) => f.order))
      : -1;

    return await ctx.db.insert("fields", {
      name: args.name,
      order: maxOrder + 1,
    });
  },
});

// 분야명 수정 (강사 데이터도 연쇄 업데이트)
export const update = mutation({
  args: { id: v.id("fields"), name: v.string() },
  handler: async (ctx, args) => {
    const field = await ctx.db.get(args.id);
    if (!field) throw new Error("분야를 찾을 수 없습니다.");

    // 중복 체크 (자기 자신 제외)
    if (field.name !== args.name) {
      const existing = await ctx.db
        .query("fields")
        .withIndex("by_name", (q) => q.eq("name", args.name))
        .first();
      if (existing) {
        throw new Error("이미 존재하는 분야명입니다.");
      }

      // 강사 데이터에서 이전 분야명을 새 분야명으로 교체
      const instructors = await ctx.db.query("instructors").collect();
      for (const inst of instructors) {
        if (inst.fields.includes(field.name)) {
          await ctx.db.patch(inst._id, {
            fields: inst.fields.map((f) =>
              f === field.name ? args.name : f
            ),
          });
        }
      }
    }

    await ctx.db.patch(args.id, { name: args.name });
  },
});

// 분야 삭제
export const remove = mutation({
  args: { id: v.id("fields") },
  handler: async (ctx, args) => {
    const field = await ctx.db.get(args.id);
    if (!field) throw new Error("분야를 찾을 수 없습니다.");

    // 강사 데이터에서 해당 분야 제거
    const instructors = await ctx.db.query("instructors").collect();
    for (const inst of instructors) {
      if (inst.fields.includes(field.name)) {
        await ctx.db.patch(inst._id, {
          fields: inst.fields.filter((f) => f !== field.name),
        });
      }
    }

    await ctx.db.delete(args.id);
  },
});
