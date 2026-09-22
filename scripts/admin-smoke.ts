/**
 * End-to-end smoke test for the admin console backend (convex/admin.ts).
 *
 * Boots a local Convex backend via `convex dev` (watch mode), then talks to it
 * through the official ConvexHttpClient, exercising the real flow:
 * first-run setup → login → 2-seat cap → start timer → +5/+10/+15 →
 * wrong password → changePassword → logout frees a seat.
 *
 * Hygiene:
 *  • Fails fast if port 3210 is already occupied (e.g. the preview's own
 *    backend is running) instead of hanging on a lost boot race.
 *  • Snapshots .convex/local before the run and restores it after, so the
 *    developer's dev database (admin password included) is left untouched.
 *  • Kills the actual convex-local-backend child process, not just the CLI
 *    wrapper, and verifies the port is free before exiting — no orphans.
 *
 * Run: bun scripts/admin-smoke.ts
 */
import { spawn, execSync } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import { cpSync, rmSync, existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

let failures = 0;
const check = (name: string, cond: boolean, detail = "") => {
  console.log(`${cond ? "ok:" : "FAIL:"} ${name}${cond ? "" : ` — ${detail}`}`);
  if (!cond) failures++;
};

const PORT = 3210;
const BASE = `http://127.0.0.1:${PORT}`;

function backendPids(): string[] {
  try {
    const out = execSync("ps -eo pid=,command=", { encoding: "utf8" });
    return out
      .split("\n")
      .filter((l) => l.includes("convex-local-backend"))
      .map((l) => l.trim().split(/\s+/)[0])
      .filter(Boolean);
  } catch {
    return [];
  }
}

function portBusy(port: number): boolean {
  try {
    execSync(`lsof -t -i:${port}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

/* ── Pre-flight: never fight a running preview backend ── */
if (portBusy(PORT)) {
  console.error(
    `Port ${PORT} is already in use (the preview dev backend?). Stop the preview first, then re-run this test.`,
  );
  process.exit(1);
}

/* ── Snapshot state we might dirty ── */
const DATA_DIR = join(process.cwd(), ".convex", "local");
const backupDir = mkdtempSync(join(tmpdir(), "convex-smoke-backup-"));
const hadExistingData = existsSync(DATA_DIR);
if (hadExistingData) {
  cpSync(DATA_DIR, join(backupDir, "local"), { recursive: true });
}
const preBackendPids = new Set(backendPids());

console.log("Booting local Convex backend…");
const proc = spawn("bunx", ["convex", "dev"], {
  stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env },
});
let lastOut = "";
proc.stdout.on("data", (d) => (lastOut += d.toString()));
proc.stderr.on("data", (d) => (lastOut += d.toString()));

const client = new ConvexHttpClient(BASE);
const closeClient = () => {
  const anyClient = client as unknown as { close?: () => void };
  if (typeof anyClient.close === "function") anyClient.close();
};

/* Probe through ConvexHttpClient: it only succeeds once the backend is live
   AND the functions are pushed (raw port checks race the push). */
const deadline = Date.now() + 120_000;
let up = false;
while (Date.now() < deadline) {
  try {
    await client.query(api.admin.getAuthStatus, {});
    up = true;
    break;
  } catch {
    await sleep(500);
  }
}

try {
  if (!up) {
    console.error("Backend did not come up. Last output:\n" + lastOut.slice(-1500));
    process.exitCode = 1;
  } else {
    console.log("Backend is up.\n");

    /* ═══ A. First-run setup ═══ */
    const st = await client.query(api.admin.getAuthStatus, {});
    check("fresh deployment has no password yet", st.hasPassword === false, JSON.stringify(st));

    const setRes = await client.mutation(api.admin.setPassword, {
      username: "host",
      password: "hunter2",
    });
    check("setPassword succeeds", setRes.ok === true, JSON.stringify(setRes));

    const setRes2 = await client.mutation(api.admin.setPassword, {
      username: "intruder",
      password: "bad",
    });
    check(
      "second setPassword is rejected",
      typeof setRes2.error === "string",
      JSON.stringify(setRes2),
    );

    /* ═══ B. Auth + seat cap ═══ */
    const bad = await client.mutation(api.admin.login, { username: "host", password: "wrong" });
    check("wrong password rejected", typeof bad.error === "string", JSON.stringify(bad));

    const l1 = await client.mutation(api.admin.login, { username: "host", password: "hunter2" });
    const token1 = l1.token;
    check(
      "login issues a 64-char token",
      typeof token1 === "string" && token1.length === 64,
      JSON.stringify(l1).slice(0, 120),
    );

    const l2b = await client.mutation(api.admin.login, { username: "host", password: "hunter2" });
    const token2 = l2b.token;
    check("second seat login ok", typeof token2 === "string", JSON.stringify(l2b).slice(0, 120));

    const l3 = await client.mutation(api.admin.login, { username: "host", password: "hunter2" });
    check(
      "third login refused (2-seat cap)",
      typeof l3.error === "string" && /full/.test(l3.error),
      JSON.stringify(l3),
    );

    /* ═══ C. Room control ═══ */
    const room = await client.mutation(api.game.createRoom, {});
    check(
      "createRoom returns a 6-char code",
      typeof room.roomCode === "string" && room.roomCode.length === 6,
      JSON.stringify(room).slice(0, 120),
    );
    const gameId = room.gameId;

    const list1 = await client.query(api.admin.listRooms, { token: token1 });
    check(
      "listRooms shows the new room",
      Array.isArray(list1) && list1.some((g) => g._id === gameId),
      JSON.stringify(list1).slice(0, 160),
    );

    const early = await client.mutation(api.admin.addTime, { token: token1, gameId, minutes: 10 });
    check(
      "addTime before start is refused",
      typeof early.error === "string" && /Start the clock/.test(early.error),
      JSON.stringify(early),
    );

    const startRes = await client.mutation(api.admin.adminStartGame, { token: token1, gameId });
    check("adminStartGame starts the clock", startRes.ok === true, JSON.stringify(startRes));
    const startRes2 = await client.mutation(api.admin.adminStartGame, { token: token1, gameId });
    check("double-start is refused", typeof startRes2.error === "string", JSON.stringify(startRes2));

    for (const [mins, total] of [
      [5, 5],
      [10, 15],
      [15, 30],
    ] as const) {
      const r = await client.mutation(api.admin.addTime, { token: token1, gameId, minutes: mins });
      check(
        `addTime +${mins} (running total ${total}m)`,
        r.ok === true && r.totalBonusMinutes === total,
        JSON.stringify(r),
      );
    }

    const badAmt = await client.mutation(api.admin.addTime, {
      token: token1,
      gameId,
      minutes: 7,
    });
    check(
      "addTime +7 is refused",
      typeof badAmt.error === "string" && /Only \+5/.test(badAmt.error),
      JSON.stringify(badAmt),
    );

    const list2 = await client.query(api.admin.listRooms, { token: token1 });
    const g = list2.find((x) => x._id === gameId);
    check(
      "listRooms shows +30m granted",
      !!g && g.timeExtensionsMs === 30 * 60 * 1000,
      JSON.stringify(g),
    );

    /* ═══ D. Password change + seat lifecycle ═══ */
    const cp = await client.mutation(api.admin.changePassword, {
      token: token1,
      currentPassword: "wrong",
      newPassword: "n3wpass",
    });
    check(
      "changePassword rejects a wrong current password",
      typeof cp.error === "string",
      JSON.stringify(cp),
    );
    const cp2 = await client.mutation(api.admin.changePassword, {
      token: token1,
      currentPassword: "hunter2",
      newPassword: "n3wpass",
    });
    check("changePassword succeeds", cp2.ok === true, JSON.stringify(cp2));

    const oldLogin = await client.mutation(api.admin.login, {
      username: "host",
      password: "hunter2",
    });
    check(
      "old password rejected after change",
      typeof oldLogin.error === "string",
      JSON.stringify(oldLogin),
    );

    await client.mutation(api.admin.logout, { token: token1 });
    await client.mutation(api.admin.logout, { token: token2 });
    const newLogin = await client.mutation(api.admin.login, {
      username: "host",
      password: "n3wpass",
    });
    check(
      "after logouts, new password accepted",
      typeof newLogin.token === "string",
      JSON.stringify(newLogin).slice(0, 120),
    );
    if (typeof newLogin.token === "string") {
      await client.mutation(api.admin.logout, { token: newLogin.token });
    }

    console.log("");
  }
} catch (err) {
  failures++;
  console.error("UNEXPECTED ERROR:", err instanceof Error ? err.message : err);
} finally {
  closeClient();
  proc.kill("SIGTERM");
  await sleep(400);
  proc.kill("SIGKILL");
  // The Go backend is a grandchild — kill any spawned during this test.
  for (const pid of backendPids()) {
    if (!preBackendPids.has(pid)) {
      try {
        execSync(`kill -9 ${pid}`, { stdio: "ignore" });
      } catch {
        /* already gone */
      }
  }
  }
  await sleep(400);
  // Restore the pre-test dev database exactly as we found it.
  rmSync(DATA_DIR, { recursive: true, force: true });
  if (hadExistingData) {
    cpSync(join(backupDir, "local"), DATA_DIR, { recursive: true });
  }
  if (portBusy(PORT)) {
    console.error(`WARNING: port ${PORT} still busy after teardown.`);
    process.exitCode = process.exitCode ?? 1;
  }
}
if (process.exitCode !== 1) {
  console.log(failures === 0 ? "ALL SMOKE CHECKS PASSED" : `${failures} CHECK(S) FAILED`);
  if (failures > 0) process.exitCode = 1;
}
