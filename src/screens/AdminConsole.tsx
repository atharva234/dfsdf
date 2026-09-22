/**
 * Admin Console — password-gated host control room.
 *
 * Flow: first run shows a one-time setup form (username + password, stored as
 * a salted SHA-256 hash server-side). After that, login is required and the
 * server enforces a hard cap of 2 concurrent admin seats.
 *
 * Console powers:
 *   • START TIMER — flips a room's clock from lobby to active
 *   • +5 / +10 / +15 — grants bonus minutes to every team in the room
 *   • live view of every room: teams, clock state, bonus granted
 */

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  KeyRound,
  Loader2,
  LogOut,
  Play,
  Users,
  Timer,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Gavel,
  Hourglass,
  Crown,
} from "lucide-react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

const TOKEN_KEY = "vanishing-ledger-admin-token";

type RoomRow = {
  _id: string;
  roomCode: string;
  status: string;
  startedAt?: number;
  timeLimitMs: number;
  timeExtensionsMs: number;
  teamCount: number;
  solvedCount: number;
  hintsUsed: number;
  createdAt: number;
};

function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/* ─────────────── Auth gate (setup / login) ─────────────── */

function AuthGate({ onAuthed }: { onAuthed: (token: string) => void }) {
  const authStatus = useQuery(api.admin.getAuthStatus);
  const setPassword = useMutation(api.admin.setPassword);
  const login = useMutation(api.admin.login);

  const [username, setUsername] = useState("");
  const [password, setPassword_] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (authStatus === undefined) {
    return (
      <div className="grid min-h-[70vh] place-items-center">
        <div className="mono-label animate-flicker">Verifying credentials…</div>
      </div>
    );
  }

  const needsSetup = !authStatus.hasPassword;

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      if (needsSetup) {
        if (password.length < 4) {
          setError("Password must be at least 4 characters.");
          setBusy(false);
          return;
        }
        if (password !== confirm) {
          setError("Passwords do not match.");
          setBusy(false);
          return;
        }
        const res = await setPassword({ username, password });
        if ("error" in res && res.error) {
          setError(res.error);
          setBusy(false);
          return;
        }
        // Fall through to login below so the host lands in the console.
      }
      const res = await login({ username, password });
      if ("error" in res && res.error) {
        setError(res.error);
        setBusy(false);
        return;
      }
      if ("token" in res && res.token) {
        onAuthed(res.token);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="panel-edge p-6 sm:p-8"
      >
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-md border border-gold/40 bg-ink-900">
            {needsSetup ? (
              <Crown className="h-5 w-5 text-gold" />
            ) : (
              <KeyRound className="h-5 w-5 text-gold" />
            )}
          </span>
          <div>
            <div className="mono-label">Restricted access</div>
            <h1 className="display text-xl text-paper">
              {needsSetup ? "Claim the host console" : "Host login"}
            </h1>
          </div>
        </div>

        {needsSetup ? (
          <p className="mb-5 rounded-md border border-gold/25 bg-gold/5 p-3 text-xs leading-relaxed text-paper-dim">
            No admin password exists yet. The <strong className="text-gold-soft">first host</strong>{" "}
            sets the username and password now — every later login must match it, and at most{" "}
            <strong className="text-gold-soft">2 hosts</strong> can be logged in at once.
          </p>
        ) : (
          <p className="mb-5 text-xs leading-relaxed text-paper-dim">
            Enter the host password to open the console. Maximum{" "}
            <span className="text-gold-soft">2 concurrent hosts</span> — the console refuses a third
            login until one of you logs out.
          </p>
        )}

        <div className="space-y-4">
          <div>
            <label className="mono-label mb-1.5 block" htmlFor="adminUser">
              Username
            </label>
            <input
              id="adminUser"
              className="input-noir"
              placeholder={needsSetup ? "e.g. host" : "host"}
              value={username}
              autoComplete="username"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="mono-label mb-1.5 block" htmlFor="adminPass">
              Password
            </label>
            <input
              id="adminPass"
              type="password"
              className="input-noir"
              placeholder="••••••••"
              value={password}
              autoComplete={needsSetup ? "new-password" : "current-password"}
              onChange={(e) => setPassword_(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </div>
          {needsSetup && (
            <div>
              <label className="mono-label mb-1.5 block" htmlFor="adminPass2">
                Confirm password
              </label>
              <input
                id="adminPass2"
                type="password"
                className="input-noir"
                placeholder="••••••••"
                value={confirm}
                autoComplete="new-password"
                onChange={(e) => setConfirm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
              />
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-md border border-blood/50 bg-blood-deep/20 p-3 text-sm text-red-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-1">
            <span className="mono-label">
              {authStatus.activeAdmins} / 2 seats in use
            </span>
            <button onClick={submit} disabled={busy} className="btn-gold !px-5 !py-2.5">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              {needsSetup ? "Set Password & Enter" : "Unlock Console"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────── Room control card ─────────────── */

function RoomCard({
  room,
  token,
  now,
}: {
  room: RoomRow;
  token: string;
  now: number;
}) {
  const startGame = useMutation(api.admin.adminStartGame);
  const addTime = useMutation(api.admin.addTime);

  const [busy, setBusy] = useState<string | null>(null);
  const [flash, setFlash] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);

  const endsAt = room.startedAt ? room.startedAt + room.timeLimitMs + room.timeExtensionsMs : 0;
  const remaining = room.startedAt ? endsAt - now : room.timeLimitMs + room.timeExtensionsMs;
  const danger = room.startedAt && remaining <= 10 * 60 * 1000;

  const run = async (key: string, fn: () => Promise<{ error?: string; ok?: boolean }>) => {
    setBusy(key);
    setFlash(null);
    try {
      const res = await fn();
      if (res?.error) {
        setFlash({ kind: "err", msg: res.error });
      } else {
        setFlash({ kind: "ok", msg: key === "start" ? "Clock started." : "Time added to every team." });
      }
    } catch (err) {
      setFlash({ kind: "err", msg: err instanceof Error ? err.message : String(err) });
    } finally {
      setBusy(null);
      window.setTimeout(() => setFlash(null), 3500);
    }
  };

  return (
    <div className={`panel p-5 ${danger ? "border-blood/50" : ""}`}>
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`grid h-10 w-10 place-items-center rounded-md border font-mono text-sm font-bold tracking-[0.15em] ${
            room.startedAt ? "border-gold/50 bg-gold/10 text-gold-soft" : "border-ink-500 bg-ink-900 text-paper-dim"
          }`}
        >
          {room.roomCode}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] ${
                room.startedAt
                  ? "border-verdigris/50 bg-verdigris/10 text-verdigris"
                  : "border-ink-500 bg-ink-900 text-paper-dim"
              }`}
            >
              {room.startedAt ? <Hourglass className="h-3 w-3" /> : <Timer className="h-3 w-3" />}
              {room.startedAt ? "clock running" : "lobby — not started"}
            </span>
            {room.status === "solved" && (
              <span className="rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-gold-soft">
                has verdicts
              </span>
            )}
          </div>
          <div className="mt-1 font-mono text-[11px] text-paper-dim/70">
            {room.teamCount} team{room.teamCount === 1 ? "" : "s"} · {room.solvedCount} verdict
            {room.solvedCount === 1 ? "" : "s"} · {room.hintsUsed} hints
          </div>
        </div>

        <div className="ml-auto text-right">
          <div
            className={`font-mono text-2xl font-bold tabular-nums ${
              danger ? "text-red-300" : room.startedAt ? "text-gold-soft" : "text-paper-dim/60"
            }`}
          >
            {room.startedAt ? formatClock(remaining) : formatClock(room.timeLimitMs + room.timeExtensionsMs)}
          </div>
          <div className="mono-label mt-0.5">{room.startedAt ? "remaining" : "on start"}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ink-600/50 pt-4">
        {!room.startedAt ? (
          <button
            onClick={() => run("start", () => startGame({ token, gameId: room._id as Id<"games"> }))}
            disabled={busy !== null}
            className="btn-gold !px-5"
          >
            {busy === "start" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Start Timer
          </button>
        ) : (
          <>
            <span className="mono-label mr-1">Add time — all teams</span>
            {[5, 10, 15].map((mins) => (
              <button
                key={mins}
                onClick={() => run(`t${mins}`, () => addTime({ token, gameId: room._id as Id<"games">, minutes: mins }))}
                disabled={busy !== null}
                className="btn-ghost !px-3.5 hover:!border-verdigris/60 hover:!text-verdigris"
                title={`Add ${mins} minutes to every team's clock`}
              >
                <Plus className="h-3.5 w-3.5" />
                {mins}
              </button>
            ))}
            {room.timeExtensionsMs > 0 && (
              <span className="mono-label ml-1 text-verdigris">
                +{Math.round(room.timeExtensionsMs / 60000)}m granted
              </span>
            )}
          </>
        )}
      </div>

      {flash && (
        <div
          className={`mt-3 flex items-center gap-2 rounded-md border px-3 py-2 text-xs ${
            flash.kind === "ok"
              ? "border-verdigris/40 bg-verdigris/10 text-verdigris"
              : "border-blood/50 bg-blood-deep/20 text-red-200"
          }`}
        >
          {flash.kind === "ok" ? (
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          )}
          {flash.msg}
        </div>
      )}
    </div>
  );
}

/* ─────────────── The console itself ─────────────── */

function AdminConsole({ token, onLogout }: { token: string; onLogout: () => void }) {
  const rooms = useQuery(api.admin.listRooms, { token });
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-md border border-gold/40 bg-ink-900">
            <Gavel className="h-5 w-5 text-gold" />
          </span>
          <div>
            <div className="mono-label">Event control</div>
            <h1 className="display text-2xl text-paper">Host Console</h1>
          </div>
          <button onClick={onLogout} className="btn-ghost ml-auto !px-3.5 !py-2 text-xs">
            <LogOut className="h-3.5 w-3.5" />
            Log out
          </button>
        </div>

        {/* Legend strip */}
        <div className="panel-edge mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 p-4">
          <span className="flex items-center gap-2 text-xs text-paper-dim">
            <Play className="h-3.5 w-3.5 text-gold" /> Start a room's shared clock
          </span>
          <span className="flex items-center gap-2 text-xs text-paper-dim">
            <Plus className="h-3.5 w-3.5 text-verdigris" /> +5 / +10 / +15 minutes for every team
          </span>
          <span className="flex items-center gap-2 text-xs text-paper-dim">
            <Users className="h-3.5 w-3.5 text-gold/70" /> Teams see the change instantly
          </span>
        </div>

        {rooms === undefined ? (
          <div className="grid min-h-[30vh] place-items-center">
            <div className="mono-label animate-flicker">Pulling the room roster…</div>
          </div>
        ) : rooms.length === 0 ? (
          <div className="panel-edge p-10 text-center">
            <Users className="mx-auto mb-3 h-8 w-8 text-paper-dim/40" />
            <p className="text-sm text-paper-dim">
              No rooms yet. Rooms appear here the moment a team opens one from the lobby.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {rooms.map((r) => (
              <RoomCard key={r._id} room={r as RoomRow} token={token} now={now} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

/* ─────────────── Exported screen: gate + heartbeat + console ─────────────── */

export function AdminConsoleScreen() {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  });
  const [sessionInvalid, setSessionInvalid] = useState(false);
  const ping = useMutation(api.admin.ping);
  const logout = useMutation(api.admin.logout);
  const pingRef = useRef(ping);
  pingRef.current = ping;

  // Heartbeat: keeps this seat marked live and detects server-side expiry.
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    const beat = () => {
      void pingRef.current({ token }).then((res) => {
        if (!cancelled && res && "ok" in res && !res.ok) {
          setSessionInvalid(true);
        }
      });
    };
    beat();
    const id = window.setInterval(beat, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [token]);

  const handleAuthed = (t: string) => {
    try {
      localStorage.setItem(TOKEN_KEY, t);
    } catch {
      /* storage blocked — session lives in memory for this tab only */
    }
    setSessionInvalid(false);
    setToken(t);
  };

  const handleLogout = async () => {
    if (token) {
      try {
        await logout({ token });
      } catch {
        /* already gone server-side */
      }
    }
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
    setToken(null);
    setSessionInvalid(false);
  };

  if (!token || sessionInvalid) {
    return (
      <div className="grain min-h-screen">
        <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
          <a href="#/" className="mono-label hover:text-gold-soft">
            ← Back to the case file
          </a>
        </div>
        <AuthGate onAuthed={handleAuthed} />
      </div>
    );
  }

  return (
    <div className="grain min-h-screen">
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <a href="#/" className="mono-label hover:text-gold-soft">
          ← Back to the case file
        </a>
      </div>
      <AdminConsole token={token} onLogout={handleLogout} />
    </div>
  );
}
