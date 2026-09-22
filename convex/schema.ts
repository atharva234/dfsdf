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
    // Admin time controls: total granted bonus time (ms) added on top of
    // timeLimitMs, and creation timestamp for the admin console's room list.
    timeExtensionsMs: v.optional(v.number()),
    createdAt: v.optional(v.number()),
  })
    .index("by_roomCode", ["roomCode"])
    .index("by_isPublic", ["isPublic"]),

  teams: defineTable({
    gameId: v.id("games"),
    name: v.string(),
    // The case this team was dealt (random 1-of-3 at join time). Optional so
    // pre-rotation rows in an existing deployment still validate.
    caseId: v.optional(v.string()),
    playerCount: v.number(),
    // Chained-discovery progress. Evidence/clues enter these lists only via
    // discoverEvidence / discoverClue — the UI never shows undiscovered items.
    // Optional so legacy team rows in an existing deployment still validate.
    discoveredEvidenceIds: v.optional(v.array(v.string())),
    discoveredClueIds: v.optional(v.array(v.string())),
    askedQuestionIds: v.optional(v.array(v.string())),
    puzzleSolved: v.optional(v.boolean()),
    hintsUsed: v.number(),
    score: v.number(),
    timeMs: v.number(),
    correct: v.boolean(),
    verdictSuspectId: v.optional(v.string()),
    verdictMethod: v.optional(v.string()),
    verdictEvidenceIds: v.array(v.string()),
    verdictCaseId: v.optional(v.string()),
    verdictFields: v.optional(v.record(v.string(), v.string())),
    finishedAt: v.optional(v.number()),
    joinedAt: v.number(),
  }).index("by_gameId", ["gameId"]),

  notes: defineTable({
    gameId: v.id("games"),
    author: v.string(),
    body: v.string(),
    createdAt: v.number(),
  }).index("by_gameId", ["gameId"]),

  /* Admin console credentials — one SHA-256 password record per host.
     Passwords are hashed server-side with per-row salts; only the hash is
     stored. Seats are enforced against adminSessions. */
  adminAuth: defineTable({
    username: v.string(),
    salt: v.string(), // 64-char hex
    passwordHash: v.string(), // 64-char hex SHA-256(salt + password)
    createdAt: v.number(),
  }).index("by_username", ["username"]),

  /* Live admin login sessions. Hard seat cap: at most 2 concurrent admins. */
  adminSessions: defineTable({
    gameId: v.optional(v.id("games")),
    token: v.string(), // random 64-char hex issued at login
    createdAt: v.number(),
    lastSeenAt: v.number(),
  }).index("by_token", ["token"]),
});
