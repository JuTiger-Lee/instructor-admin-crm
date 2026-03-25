import { query } from "./_generated/server";

// 지역 목록 조회 (order 순)
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("regions").withIndex("by_order").collect();
  },
});
