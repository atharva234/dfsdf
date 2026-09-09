import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  games: defineTable({
    roomCode: v.string(),
    difficulty: v.string(), // "standard" | "hard"
    status: v.string(), // lobby | active | solved
    startedAt: v.optional(v.number()),
    timeLimitMs: v.number(),
    maxTeams: v.number(),
    hintsUsed: v.number(),
    penaltyPerHint: v.number(),
    teamCount: v.number(),
    solvedCount: v.number(),
    isPublic: v.boolean(),
  })
    .index("by_roomCode", ["roomCode"])
    .index("by_isPublic", ["isPublic"]),

  teams: defineTable({
    gameId: v.id("games"),
    name: v.string(),
    playerCount: v.number(),
    hintsUsed: v.number(),
    score: v.number(),
    timeMs: v.number(),
    correct: v.boolean(),
    verdictSuspectId: v.optional(v.string()),
    verdictMethod: v.optional(v.string()),
    verdictEvidenceIds: v.array(v.string()),
    finishedAt: v.optional(v.number()),
    joinedAt: v.number(),
  }).index("by_gameId", ["gameId"]),

  notes: defineTable({
    gameId: v.id("games"),
    author: v.string(),
    body: v.string(),
    createdAt: v.number(),
  }).index("by_gameId", ["gameId"]),
});
