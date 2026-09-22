import { query } from "./_generated/server";
import { v } from "convex/values";

export function isHostPassword(password: string): boolean {
  return password === process.env.HOST_PASSWORD;
}

export const checkHostPassword = query({
  args: { password: v.string() },
  handler: async (ctx, args) => isHostPassword(args.password),
});