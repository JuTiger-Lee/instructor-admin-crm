import { query } from "./_generated/server";
import { auth } from "./auth";

// 현재 로그인한 사용자 정보 조회
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(userId);
  },
});
