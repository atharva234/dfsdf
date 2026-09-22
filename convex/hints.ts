import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { isHostPassword } from "./auth";

export const getMyHints = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("hintsSent")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();
  },
});

export const sendHint = mutation({
  args: { password: v.string(), teamId: v.id("teams"), text: v.string() },
  handler: async (ctx, args) => {
    if (!isHostPassword(args.password)) throw new Error("Wrong password");
    await ctx.db.insert("hintsSent", { teamId: args.teamId, text: args.text, sentAt: Date.now() });
  },
});