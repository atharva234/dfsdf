/**
 * The Vanishing Ledger — game engine.
 *
 * Room model: one room = one live event instance (up to 30 concurrent teams).
 * A room opens in `lobby`; any team may start the clock (min 1 team present).
 * Teams join with a 6-char code; the room code is the shared coordination key.
 *
 * Scoring: base 10,000 − elapsed seconds × 10 − 250 × hints − 500 if wrong,
 * plus up to +1,200 for the evidence paper trail. Floor is zero.
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { ANSWER_KEYS } from "./caseAnswer";

const CODE_ALPHABET = "ACDEFGHJKLMNPQRTUVWXY34679";
const MAX_TEAMS_PER_ROOM = 30;
const MAX_PLAYERS_PER_TEAM = 4;
const PENALTY_PER_HINT = 250;
export const TIME_LIMIT_MS = 60 * 60 * 1000; // 60:00 wall clock

function randomCode(): string {
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return out;
}

export const createRoom = mutation({
  args: {},
  handler: async (ctx) => {
    let code = randomCode();
    for (let i = 0; i < 8; i++) {
      const clash = await ctx.db
        .query("games")
        .withIndex("by_roomCode", (q) => q.eq("roomCode", code))
        .first();
      if (!clash) break;
      code = randomCode();
    }
    const gameId = await ctx.db.insert("games", {
      roomCode: code,
      difficulty: "standard",
      status: "lobby",
      startedAt: undefined,
      timeLimitMs: TIME_LIMIT_MS,
      maxTeams: MAX_TEAMS_PER_ROOM,
      hintsUsed: 0,
      penaltyPerHint: PENALTY_PER_HINT,
      teamCount: 0,
      solvedCount: 0,
      isPublic: false,
    });
    return { gameId, roomCode: code };
  },
});

export const joinRoom = mutation({
  args: {
    roomCode: v.string(),
    teamName: v.string(),
    playerCount: v.number(),
  },
  handler: async (ctx, { roomCode, teamName, playerCount }) => {
    const game = await ctx.db
      .query("games")
      .withIndex("by_roomCode", (q) =>
        q.eq("roomCode", roomCode.trim().toUpperCase()),
      )
      .first();
    if (!game) return { error: "No open room with that code." } as const;
    if (game.teamCount >= game.maxTeams) {
      return { error: "That room is full (30 team cap)." } as const;
    }
    const name = teamName.trim().slice(0, 40) || "Unnamed Team";
    if (playerCount < 1 || playerCount > MAX_PLAYERS_PER_TEAM) {
      return { error: "Team size must be between 1 and 4." } as const;
    }
    // Deal each team one of the three cases at random (uniform).
    const caseId = CASE_IDS[Math.floor(Math.random() * CASE_IDS.length)];
    const teamId = await ctx.db.insert("teams", {
      gameId: game._id,
      name,
      caseId,
      playerCount,
      hintsUsed: 0,
      score: 0,
      timeMs: 0,
      correct: false,
      verdictEvidenceIds: [],
      joinedAt: Date.now(),
    });
    await ctx.db.patch(game._id, { teamCount: game.teamCount + 1 });
    return { teamId, gameId: game._id, roomCode: game.roomCode, caseId } as const;
  },
});

export const getGame = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => await ctx.db.get(gameId),
});

export const getGameByCode = query({
  args: { roomCode: v.string() },
  handler: async (ctx, { roomCode }) =>
    await ctx.db
      .query("games")
      .withIndex("by_roomCode", (q) =>
        q.eq("roomCode", roomCode.trim().toUpperCase()),
      )
      .first(),
});

export const getTeam = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, { teamId }) => await ctx.db.get(teamId),
});

/** The case this team was dealt — resolved once at join time. */
/**
 * Resolve (and persist) the case this team plays. Teams joining after this
 * deploy were dealt a case at join time; legacy rows get one dealt here, once.
 * Idempotent — safe to call on every app boot.
 */
export const ensureCaseDealt = mutation({
  args: { teamId: v.id("teams") },
  handler: async (ctx, { teamId }) => {
    const team = await ctx.db.get(teamId);
    if (!team) return { error: "Team not found." } as const;
    if (team.caseId) return { caseId: team.caseId } as const;
    const caseId = CASE_IDS[Math.floor(Math.random() * CASE_IDS.length)];
    await ctx.db.patch(teamId, { caseId });
    return { caseId } as const;
  },
});

export const getTeams = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) =>
    await ctx.db
      .query("teams")
      .withIndex("by_gameId", (q) => q.eq("gameId", gameId))
      .collect(),
});

/** Start the investigation clock for the whole room (idempotent). */
export const startGame = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    const game = await ctx.db.get(gameId);
    if (!game) return { error: "Room not found." } as const;
    if (game.status === "lobby") {
      await ctx.db.patch(gameId, {
        status: "active",
        startedAt: Date.now(),
      });
    }
    return { ok: true } as const;
  },
});

const CASE_IDS = ["vanishing-ledger", "nova-tech", "greenleaf-049"] as const;

/**
 * Reveal a hint: one shared hint budget per team, each reveal costs points.
 * The mutation commits the penalty up front; the UI reveals the text only on
 * success so peek-then-cancel is not possible.
 */
export const useHint = mutation({
  args: { teamId: v.id("teams"), hintId: v.string() },
  handler: async (ctx, { teamId }) => {
    const team = await ctx.db.get(teamId);
    if (!team) return { error: "Team not found." } as const;
    const game = await ctx.db.get(team.gameId);
    if (!game) return { error: "Room not found." } as const;
    await ctx.db.patch(teamId, { hintsUsed: team.hintsUsed + 1 });
    await ctx.db.patch(game._id, { hintsUsed: game.hintsUsed + 1 });
    return { ok: true, penalty: game.penaltyPerHint } as const;
  },
});

/** Shared case notes — one sticky note per entry, per room. */
export const addNote = mutation({
  args: {
    gameId: v.id("games"),
    author: v.string(),
    body: v.string(),
  },
  handler: async (ctx, { gameId, author, body }) => {
    const trimmed = body.trim().slice(0, 280);
    if (!trimmed) return { error: "Note is empty." } as const;
    const noteId = await ctx.db.insert("notes", {
      gameId,
      author: author.slice(0, 40) || "Detective",
      body: trimmed,
      createdAt: Date.now(),
    });
    return { noteId } as const;
  },
});

export const removeNote = mutation({
  args: { noteId: v.id("notes") },
  handler: async (ctx, { noteId }) => {
    await ctx.db.delete(noteId);
    return { ok: true } as const;
  },
});

export const getNotes = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) =>
    await ctx.db
      .query("notes")
      .withIndex("by_gameId", (q) => q.eq("gameId", gameId))
      .order("desc")
      .take(50),
});

export const submitVerdict = mutation({
  args: {
    teamId: v.id("teams"),
    caseId: v.string(),
    suspectId: v.string(),
    method: v.string(),
    evidenceIds: v.array(v.string()),
    // Answers to the case's scored dropdown fields (e.g. vendor, impact band).
    fieldAnswers: v.record(v.string(), v.string()),
  },
  handler: async (
    ctx,
    { teamId, caseId, suspectId, method, evidenceIds, fieldAnswers },
  ) => {
    const team = await ctx.db.get(teamId);
    if (!team) return { error: "Team not found." } as const;
    if (team.finishedAt) return { error: "Verdict already submitted." } as const;
    const game = await ctx.db.get(team.gameId);
    if (!game) return { error: "Room not found." } as const;
    if (!game.startedAt) return { error: "The clock has not started." } as const;

    // Score against the key for the case THE TEAM WAS DEALT — not the one the
    // client claims. A mismatch is either a stale tab or tampering.
    const key = ANSWER_KEYS[team.caseId ?? ""];
    if (!key) return { error: "No case dealt to this team." } as const;

    const now = Date.now();
    const timeMs = now - game.startedAt;
    const correct = suspectId === key.suspectId;

    // Scored verdict fields: +250 per correct dropdown (vendor / impact band).
    let fieldScore = 0;
    for (const [field, answer] of Object.entries(key.fieldAnswers)) {
      if (fieldAnswers[field] === answer) fieldScore += 250;
    }

    // Partial credit for the paper trail: +400 per correctly identified
    // exhibit, −200 per red herring, floored at zero.
    const found = new Set(evidenceIds);
    let evidenceScore = 0;
    for (const id of key.evidenceIds) {
      if (found.has(id)) evidenceScore += 400;
    }
    for (const id of evidenceIds) {
      if (!key.evidenceIds.includes(id)) evidenceScore -= 200;
    }
    evidenceScore = Math.max(0, evidenceScore);

    const elapsedSeconds = Math.floor(timeMs / 1000);
    const hintPenalty = team.hintsUsed * game.penaltyPerHint;
    const raw = 10000 - elapsedSeconds * 10 - hintPenalty - (correct ? 0 : 500);
    const score = Math.max(0, Math.round(raw + evidenceScore + fieldScore));

    await ctx.db.patch(teamId, {
      correct,
      score,
      timeMs,
      verdictSuspectId: suspectId,
      verdictMethod: method.slice(0, 600),
      verdictEvidenceIds: evidenceIds,
      verdictCaseId: caseId,
      verdictFields: fieldAnswers,
      finishedAt: now,
    });

    await ctx.db.patch(game._id, {
      solvedCount: game.solvedCount + 1,
      status: "solved",
    });
    return { ok: true, correct, score, timeMs } as const;
  },
});

export const leaderboard = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    const teams = await ctx.db
      .query("teams")
      .withIndex("by_gameId", (q) => q.eq("gameId", gameId))
      .collect();
    return teams
      .filter((t) => t.finishedAt !== undefined)
      .sort((a, b) => b.score - a.score || a.timeMs - b.timeMs)
      .slice(0, 30)
      .map((t, i) => ({
        rank: i + 1,
        teamId: t._id,
        name: t.name,
        score: t.score,
        timeMs: t.timeMs,
        correct: t.correct,
        hintsUsed: t.hintsUsed,
        playerCount: t.playerCount,
      }));
  },
});

export type GameDoc = {
  _id: Id<"games">;
  roomCode: string;
  difficulty: string;
  status: string;
  startedAt?: number;
  timeLimitMs: number;
  maxTeams: number;
  hintsUsed: number;
  penaltyPerHint: number;
  teamCount: number;
  solvedCount: number;
  isPublic: boolean;
};

export type TeamDoc = {
  _id: Id<"teams">;
  gameId: Id<"games">;
  name: string;
  caseId: string;
  playerCount: number;
  hintsUsed: number;
  score: number;
  timeMs: number;
  correct: boolean;
  verdictSuspectId?: string;
  verdictMethod?: string;
  verdictEvidenceIds: string[];
  verdictCaseId?: string;
  verdictFields?: Record<string, string>;
  finishedAt?: number;
  joinedAt: number;
};

export type NoteDoc = {
  _id: Id<"notes">;
  gameId: Id<"games">;
  author: string;
  body: string;
  createdAt: number;
};
