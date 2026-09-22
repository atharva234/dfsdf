import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { isHostPassword } from "./auth";

export const getMySubmission = query({
  args: { teamId: v.id("teams"), round: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("submissions")
      .withIndex("by_team_round", (q) => q.eq("teamId", args.teamId).eq("round", args.round))
      .unique();
  },
});

export const submitRound = mutation({
  args: { teamId: v.id("teams"), round: v.number(), data: v.any() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("submissions")
      .withIndex("by_team_round", (q) => q.eq("teamId", args.teamId).eq("round", args.round))
      .unique();
    if (existing) throw new Error("Already submitted");
    await ctx.db.insert("submissions", {
      teamId: args.teamId,
      round: args.round,
      data: args.data,
      submittedAt: Date.now(),
    });
  },
});

export const listSubmissions = query({
  args: { password: v.string(), round: v.number() },
  handler: async (ctx, args) => {
    if (!isHostPassword(args.password)) throw new Error("Wrong password");
    const all = await ctx.db.query("submissions").collect();
    return all.filter((s) => s.round === args.round);
  },
});