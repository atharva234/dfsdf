/**
 * Admin console — password-gated host control surface.
 *
 * The event host logs in with a username + password (max 2 concurrent admin
 * seats), then can start any room's clock and hand out bonus time to every
 * team in the room with +5 / +10 / +15 minute buttons.
 *
 * Security model: passwords are stored ONLY as salted SHA-256 hashes in the
 * adminAuth table. Login issues a random 64-hex token stored in the
 * adminSessions table (hard cap of 2 live sessions); every privileged
 * mutation re-verifies the token server-side — nothing trusts the client.
 * All handlers are mutations/queries: pure-JS hashing needs no action ctx.
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { DataModel, Doc } from "./_generated/dataModel";
import type { GenericDatabaseReader } from "convex/server";
import { sha256Hex } from "./admin_sha";

/* ─────────────────── Helpers ─────────────────── */

const hexChars = "0123456789abcdef";
function randomHex(len: number): string {
  let out = "";
  for (let i = 0; i < len; i++) out += hexChars[Math.floor(Math.random() * 16)];
  return out;
}

function normalizeUsername(u: string): string {
  return u.trim().toLowerCase().slice(0, 40);
}

export const MAX_ADMIN_SEATS = 2;
export const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // sessions expire after 24h

type SessionRow = Doc<"adminSessions">;

/** Live = seen within the TTL. Used for the seat cap everywhere. */
function liveSessions(sessions: SessionRow[], now: number): SessionRow[] {
  return sessions.filter((s) => s.lastSeenAt >= now - SESSION_TTL_MS);
}

/** Token check shared by every privileged mutation/query. */
async function requireAdmin(
  db: GenericDatabaseReader<DataModel>,
  token: string,
): Promise<boolean> {
  if (!token || token.length !== 64) return false;
  const session = await db
    .query("adminSessions")
    .withIndex("by_token", (q) => q.eq("token", token))
    .first();
  return !!session && session.lastSeenAt >= Date.now() - SESSION_TTL_MS;
}

/* ─────────────────── Auth ─────────────────── */

export const getAuthStatus = query({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("adminAuth").withIndex("by_username").first();
    const sessions = await ctx.db.query("adminSessions").withIndex("by_token").collect();
    const now = Date.now();
    return { hasPassword: !!existing, activeAdmins: liveSessions(sessions, now).length };
  },
});

/** Set the admin password — allowed ONLY while no password exists yet. */
export const setPassword = mutation({
  args: { username: v.string(), password: v.string() },
  handler: async (ctx, { username, password }) => {
    const normalized = normalizeUsername(username);
    if (normalized.length < 3) {
      return { error: "Username must be at least 3 characters." } as const;
    }
    if (password.length < 4) {
      return { error: "Password must be at least 4 characters." } as const;
    }
    const existing = await ctx.db
      .query("adminAuth")
      .withIndex("by_username", (q) => q.eq("username", normalized))
      .first();
    if (existing) {
      return { error: "An admin password is already set. Log in with it instead." } as const;
    }
    const salt = randomHex(64);
    const passwordHash = sha256Hex(salt + password);
    await ctx.db.insert("adminAuth", {
      username: normalized,
      salt,
      passwordHash,
      createdAt: Date.now(),
    });
    return { ok: true } as const;
  },
});

/** Login with username + password. Enforces the 2 concurrent admin seat cap. */
export const login = mutation({
  args: { username: v.string(), password: v.string() },
  handler: async (ctx, { username, password }) => {
    const normalized = normalizeUsername(username);
    const record = await ctx.db
      .query("adminAuth")
      .withIndex("by_username", (q) => q.eq("username", normalized))
      .first();
    if (!record) return { error: "Invalid username or password." } as const;

    const attempt = sha256Hex(record.salt + password);
    // Constant-ish compare (both are 64-char lowercase hex).
    let mismatch = 0;
    for (let i = 0; i < 64; i++) {
      mismatch |= attempt.charCodeAt(i) ^ record.passwordHash.charCodeAt(i);
    }
    if (mismatch !== 0) {
      return { error: "Invalid username or password." } as const;
    }

    // Seat cap: at most 2 concurrent admin logins.
    const now = Date.now();
    const sessions = await ctx.db.query("adminSessions").withIndex("by_token").collect();
    if (liveSessions(sessions, now).length >= MAX_ADMIN_SEATS) {
      return {
        error: "Admin console is full (2 seats). Ask the other host to log out first.",
      } as const;
    }

    const token = randomHex(64);
    await ctx.db.insert("adminSessions", {
      gameId: undefined,
      token,
      createdAt: now,
      lastSeenAt: now,
    });
    return { ok: true, token } as const;
  },
});

/**
 * Change the admin password. Requires a live admin token AND the current
 * password, so a hijacked tab cannot lock the real hosts out.
 */
export const changePassword = mutation({
  args: {
    token: v.string(),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, { token, currentPassword, newPassword }) => {
    const ok = await requireAdmin(ctx.db, token);
    if (!ok) return { error: "Session expired. Please log in again." } as const;
    if (newPassword.length < 4) {
      return { error: "New password must be at least 4 characters." } as const;
    }
    const record = await ctx.db.query("adminAuth").withIndex("by_username").first();
    if (!record) return { error: "No admin password exists." } as const;
    const attempt = sha256Hex(record.salt + currentPassword);
    let mismatch = 0;
    for (let i = 0; i < 64; i++) {
      mismatch |= attempt.charCodeAt(i) ^ record.passwordHash.charCodeAt(i);
    }
    if (mismatch !== 0) {
      return { error: "Current password is incorrect." } as const;
    }
    const salt = randomHex(64);
    await ctx.db.patch(record._id, {
      salt,
      passwordHash: sha256Hex(salt + newPassword),
    });
    return { ok: true } as const;
  },
});

/** Heartbeat so the seat count reflects actual live admins. */
export const ping = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const ok = await requireAdmin(ctx.db, token);
    if (!ok) return { ok: false, error: "Session expired. Please log in again." } as const;
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();
    if (session) {
      await ctx.db.patch(session._id, { lastSeenAt: Date.now() });
    }
    return { ok: true } as const;
  },
});

/** Logout — frees a seat immediately. */
export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();
    if (session) await ctx.db.delete(session._id);
    return { ok: true } as const;
  },
});

/* ─────────────────── Room control ─────────────────── */

/**
 * Rooms visible to the admin console. Recent rooms first; if a token is
 * supplied it must be valid or the list comes back empty (no data leaks).
 */
export const listRooms = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, { token }) => {
    if (token !== undefined && token !== "") {
      const ok = await requireAdmin(ctx.db, token);
      if (!ok) return [];
    }
    const games = await ctx.db.query("games").order("desc").take(40);
    return games.map((g) => ({
      _id: g._id,
      roomCode: g.roomCode,
      status: g.status,
      startedAt: g.startedAt,
      timeLimitMs: g.timeLimitMs,
      timeExtensionsMs: g.timeExtensionsMs ?? 0,
      teamCount: g.teamCount,
      solvedCount: g.solvedCount,
      hintsUsed: g.hintsUsed,
      createdAt: g.createdAt ?? (g._creationTime as number),
    }));
  },
});

/**
 * START TIMER — flips a lobby room to active and stamps the clock start.
 * Any authorized admin can start any room's clock.
 */
export const adminStartGame = mutation({
  args: { token: v.string(), gameId: v.id("games") },
  handler: async (ctx, { token, gameId }) => {
    const ok = await requireAdmin(ctx.db, token);
    if (!ok) return { error: "Session expired. Please log in again." } as const;
    const game = await ctx.db.get(gameId);
    if (!game) return { error: "Room not found." } as const;
    if (game.startedAt) return { error: "Clock is already running for this room." } as const;
    await ctx.db.patch(gameId, { status: "active", startedAt: Date.now() });
    return { ok: true } as const;
  },
});

/**
 * ADD TIME — +5 / +10 / +15 minute buttons. Extends the room's shared clock
 * by adding to `timeExtensionsMs`, which App.tsx folds into timeLimitMs for
 * every team in the room reactively.
 */
export const addTime = mutation({
  args: { token: v.string(), gameId: v.id("games"), minutes: v.number() },
  handler: async (ctx, { token, gameId, minutes }) => {
    const ok = await requireAdmin(ctx.db, token);
    if (!ok) return { error: "Session expired. Please log in again." } as const;
    if (![5, 10, 15].includes(minutes)) {
      return { error: "Only +5, +10, or +15 minute grants are allowed." } as const;
    }
    const game = await ctx.db.get(gameId);
    if (!game) return { error: "Room not found." } as const;
    if (!game.startedAt) {
      return { error: "Start the clock before adding time." } as const;
    }
    const current = game.timeExtensionsMs ?? 0;
    const total = current + minutes * 60 * 1000;
    await ctx.db.patch(gameId, { timeExtensionsMs: total });
    return { ok: true, totalBonusMinutes: Math.round(total / 60000) } as const;
  },
});
