import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  event: defineTable({
    status: v.union(v.literal("lobby"), v.literal("round1"), v.literal("break"), v.literal("round2"), v.literal("ended")),
    roundEndsAt: v.union(v.number(), v.null()),
  }),
  teams: defineTable({
    code: v.string(),
    name: v.string(),
    leaderName: v.string(),
    members: v.array(v.string()),
    caseId: v.string(),
    lastSeenAt: v.number(),
  }).index("by_code", ["code"]),

  submissions: defineTable({
    teamId: v.id("teams"),
    round: v.number(),
    data: v.any(),
    submittedAt: v.number(),
  }).index("by_team_round", ["teamId", "round"]),

  hintsSent: defineTable({
    teamId: v.id("teams"),
    text: v.string(),
    sentAt: v.number(),
  }).index("by_team", ["teamId"]),

  caseState: defineTable({
    caseId: v.string(),
    releasedEvidenceIds: v.array(v.string()),
  }).index("by_caseId", ["caseId"]),
});