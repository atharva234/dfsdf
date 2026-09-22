import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { isHostPassword } from "./auth";

export const login = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("teams")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .unique();
  },
});

export const heartbeat = mutation({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.teamId, { lastSeenAt: Date.now() });
  },
});

export const listTeams = query({
  args: { password: v.string() },
  handler: async (ctx, args) => {
    if (!isHostPassword(args.password)) throw new Error("Wrong password");
    return await ctx.db.query("teams").collect();
  },
});

export const getById = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => await ctx.db.get(args.teamId),
});