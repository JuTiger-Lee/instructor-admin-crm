import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// 강사 목록 조회 (검색/필터/페이지네이션)
export const list = query({
  args: {
    search: v.optional(v.string()),
    fieldFilter: v.optional(v.string()),
    regionFilter: v.optional(v.string()),
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const allInstructors = await ctx.db.query("instructors").collect();

    // 필터링
    let filtered = allInstructors;

    if (args.search) {
      const search = args.search;
      filtered = filtered.filter((inst) => inst.name.includes(search));
    }

    if (args.fieldFilter && args.fieldFilter !== "all") {
      const fieldFilter = args.fieldFilter;
      filtered = filtered.filter((inst) =>
        inst.fields.includes(fieldFilter)
      );
    }

    if (args.regionFilter && args.regionFilter !== "all") {
      const regionFilter = args.regionFilter;
      filtered = filtered.filter((inst) =>
        inst.regions.includes(regionFilter)
      );
    }

    // 생성일 역순 정렬
    filtered.sort((a, b) => b._creationTime - a._creationTime);

    const totalCount = filtered.length;
    const pageSize = args.pageSize ?? 20;
    const page = args.page ?? 1;
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return { items, totalCount };
  },
});

// 단일 강사 조회
export const getById = query({
  args: { id: v.id("instructors") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// 대시보드 통계
export const stats = query({
  args: {},
  handler: async (ctx) => {
    const allInstructors = await ctx.db.query("instructors").collect();
    const allFields = await ctx.db
      .query("fields")
      .withIndex("by_order")
      .collect();

    const totalCount = allInstructors.length;

    // 등급별 카운트
    const gradeCounts: Record<string, number> = {};
    for (const inst of allInstructors) {
      gradeCounts[inst.grade] = (gradeCounts[inst.grade] ?? 0) + 1;
    }

    // 분야별 강사 수
    const fieldData = allFields
      .map((field) => ({
        name: field.name,
        count: allInstructors.filter((inst) =>
          inst.fields.includes(field.name)
        ).length,
      }))
      .sort((a, b) => b.count - a.count);

    // 성별 분포
    const male = allInstructors.filter((inst) => inst.gender === "남").length;
    const female = allInstructors.filter((inst) => inst.gender === "여").length;
    const genderData = [
      { name: "남", value: male },
      { name: "여", value: female },
    ];

    return { totalCount, gradeCounts, fieldData, genderData };
  },
});

// 강사 생성
export const create = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    gender: v.string(),
    grade: v.string(),
    fields: v.array(v.string()),
    regions: v.array(v.string()),
    career: v.string(),
    certificates: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        issuer: v.string(),
        date: v.string(),
      })
    ),
    education: v.array(
      v.object({
        id: v.string(),
        school: v.string(),
        major: v.string(),
        graduationYear: v.string(),
      })
    ),
    bankAccount: v.object({
      bank: v.string(),
      accountNumber: v.string(),
    }),
    profileImage: v.optional(v.union(v.id("_storage"), v.null())),
    resume: v.optional(v.union(v.id("_storage"), v.null())),
    portfolio: v.optional(v.array(v.id("_storage"))),
    idCard: v.optional(v.union(v.id("_storage"), v.null())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("instructors", {
      name: args.name,
      phone: args.phone,
      gender: args.gender,
      grade: args.grade,
      fields: args.fields,
      regions: args.regions,
      career: args.career,
      certificates: args.certificates,
      education: args.education,
      bankAccount: args.bankAccount,
      profileImage: args.profileImage ?? null,
      resume: args.resume ?? null,
      portfolio: args.portfolio ?? [],
      idCard: args.idCard ?? null,
    });
  },
});

// 강사 수정
export const update = mutation({
  args: {
    id: v.id("instructors"),
    name: v.string(),
    phone: v.string(),
    gender: v.string(),
    grade: v.string(),
    fields: v.array(v.string()),
    regions: v.array(v.string()),
    career: v.string(),
    certificates: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        issuer: v.string(),
        date: v.string(),
      })
    ),
    education: v.array(
      v.object({
        id: v.string(),
        school: v.string(),
        major: v.string(),
        graduationYear: v.string(),
      })
    ),
    bankAccount: v.object({
      bank: v.string(),
      accountNumber: v.string(),
    }),
    profileImage: v.optional(v.union(v.id("_storage"), v.null())),
    resume: v.optional(v.union(v.id("_storage"), v.null())),
    portfolio: v.optional(v.array(v.id("_storage"))),
    idCard: v.optional(v.union(v.id("_storage"), v.null())),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("강사를 찾을 수 없습니다.");

    await ctx.db.patch(id, {
      ...data,
      profileImage: data.profileImage ?? null,
      resume: data.resume ?? null,
      portfolio: data.portfolio ?? [],
      idCard: data.idCard ?? null,
    });
  },
});

// 강사 삭제
export const remove = mutation({
  args: { id: v.id("instructors") },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("강사를 찾을 수 없습니다.");

    // 관련 파일 삭제
    if (existing.profileImage) {
      await ctx.storage.delete(existing.profileImage);
    }
    if (existing.resume) {
      await ctx.storage.delete(existing.resume);
    }
    if (existing.idCard) {
      await ctx.storage.delete(existing.idCard);
    }
    if (existing.portfolio) {
      for (const fileId of existing.portfolio) {
        await ctx.storage.delete(fileId);
      }
    }

    await ctx.db.delete(args.id);
  },
});
