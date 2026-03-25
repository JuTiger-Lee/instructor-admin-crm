import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  // users 테이블은 authTables에 포함되지만, 추가 필드 정의
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    image: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),
  }).index("email", ["email"]),

  // 강사 테이블
  instructors: defineTable({
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
  }),

  // 활동분야
  fields: defineTable({
    name: v.string(),
    order: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_order", ["order"]),

  // 등급
  grades: defineTable({
    code: v.string(),
    label: v.string(),
    color: v.string(),
    order: v.number(),
  })
    .index("by_code", ["code"])
    .index("by_order", ["order"]),

  // 지역
  regions: defineTable({
    name: v.string(),
    order: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_order", ["order"]),
});
