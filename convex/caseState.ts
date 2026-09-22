import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { isHostPassword } from "./auth";

export const getReleased = query({
  args: { caseId: v.string() },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("caseState")
      .withIndex("by_caseId", (q) => q.eq("caseId", args.caseId))
      .unique();
    return row?.releasedEvidenceIds ?? [];
  },
});

export const releaseEvidence = mutation({
  args: { password: v.string(), caseId: v.string(), evidenceId: v.string() },
  handler: async (ctx, args) => {
    if (!isHostPassword(args.password)) throw new Error("Wrong password");
    const row = await ctx.db
      .query("caseState")
      .withIndex("by_caseId", (q) => q.eq("caseId", args.caseId))
      .unique();
    if (!row) throw new Error("Case state row not found — seed it first");
    if (row.releasedEvidenceIds.includes(args.evidenceId)) return; // already released
    await ctx.db.patch(row._id, {
      releasedEvidenceIds: [...row.releasedEvidenceIds, args.evidenceId],
    });
  },
});

export const listAllCaseStates = query({
  args: { password: v.string() },
  handler: async (ctx, args) => {
    if (!isHostPassword(args.password)) throw new Error("Wrong password");
    return await ctx.db.query("caseState").collect();
  },
});