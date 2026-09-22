  import { query, mutation } from "./_generated/server";
  import { v } from "convex/values";
  import { isHostPassword } from "./auth";

  export const getEvent = query({
    handler: async (ctx) => await ctx.db.query("event").unique(),
  });

  export const startRound1 = mutation({
    args: { password: v.string(), durationMs: v.number() },
    handler: async (ctx, args) => {
      if (!isHostPassword(args.password)) throw new Error("Wrong password");
      const ev = await ctx.db.query("event").unique();
      await ctx.db.patch(ev!._id, { status: "round1", roundEndsAt: Date.now() + args.durationMs });
    },
  });

  export const goToBreak = mutation({
    args: { password: v.string() },
    handler: async (ctx, args) => {
      if (!isHostPassword(args.password)) throw new Error("Wrong password");
      const ev = await ctx.db.query("event").unique();
      await ctx.db.patch(ev!._id, { status: "break", roundEndsAt: null });
    },
  });

  export const startRound2 = mutation({
    args: { password: v.string(), durationMs: v.number() },
    handler: async (ctx, args) => {
      if (!isHostPassword(args.password)) throw new Error("Wrong password");
      const ev = await ctx.db.query("event").unique();
      await ctx.db.patch(ev!._id, { status: "round2", roundEndsAt: Date.now() + args.durationMs });
    },
  });

  export const extendRound = mutation({
    args: { password: v.string(), extraMs: v.number() },
    handler: async (ctx, args) => {
      if (!isHostPassword(args.password)) throw new Error("Wrong password");
      const ev = await ctx.db.query("event").unique();
      if (!ev!.roundEndsAt) throw new Error("No round running");
      await ctx.db.patch(ev!._id, { roundEndsAt: ev!.roundEndsAt + args.extraMs });
    },
  });

  export const endEvent = mutation({
    args: { password: v.string() },
    handler: async (ctx, args) => {
      if (!isHostPassword(args.password)) throw new Error("Wrong password");
      const ev = await ctx.db.query("event").unique();
      await ctx.db.patch(ev!._id, { status: "ended", roundEndsAt: null });
    },
  });