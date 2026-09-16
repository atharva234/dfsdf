/**
 * Lobby / Team Setup — create or join a room, size the team, start the case.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "convex/react";
import { Users, DoorOpen, Play, Loader2, Fingerprint, ShieldAlert } from "lucide-react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { setSession } from "../game/store";

export function Lobby({ onEntered }: { onEntered?: () => void }) {
  const [mode, setMode] = useState<"join" | "create">("create");
  const [teamName, setTeamName] = useState("");
  const [playerCount, setPlayerCount] = useState(2);
  const [roomCode, setRoomCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRoom = useMutation(api.game.createRoom);
  const joinRoom = useMutation(api.game.joinRoom);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      if (mode === "create") {
        const res = await createRoom({});
        // The creator registers as the room's first team so hints and the
        // final verdict have a team record to write to.
        const joined = await joinRoom({
          roomCode: res.roomCode,
          teamName,
          playerCount,
        });
        if ("error" in joined && joined.error) {
          setError(joined.error);
          setBusy(false);
          return;
        }
        setSession({
          gameId: joined.gameId as Id<"games">,
          teamId: joined.teamId as Id<"teams">,
          roomCode: joined.roomCode,
          teamName: teamName.trim().slice(0, 40) || "Unnamed Team",
          playerCount,
          // The case is dealt server-side at join and returned here.
          caseId: (joined as { caseId?: string }).caseId ?? null,
          screen: "briefing",
        });
      } else {
        if (roomCode.trim().length < 4) {
          setError("Enter the 6-character room code from your event host.");
          setBusy(false);
          return;
        }
        const res = await joinRoom({
          roomCode,
          teamName,
          playerCount,
        });
        if ("error" in res && res.error) {
          setError(res.error);
          setBusy(false);
          return;
        }
        setSession({
          gameId: res.gameId as Id<"games">,
          teamId: res.teamId as Id<"teams">,
          roomCode: res.roomCode,
          teamName: teamName.trim().slice(0, 40) || "Unnamed Team",
          playerCount,
          caseId: (res as { caseId?: string }).caseId ?? null,
          screen: "briefing",
        });
      }
      onEntered?.();
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      setError(
        `Could not reach the case server. ${detail || "Try again."} (If this says something about localhost or a failed fetch, hard-refresh with Ctrl+Shift+R — a stale page bundle is the usual cause.)`,
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="panel-edge p-6 sm:p-8"
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="mono-label">Step 01 — Team setup</div>
            <h2 className="display mt-1 text-2xl text-paper">Assemble your unit</h2>
          </div>
          <Fingerprint className="h-8 w-8 text-gold/40" />
        </div>

        {/* Mode toggle */}
        <div className="mb-5 grid grid-cols-2 gap-1 rounded-lg border border-ink-600/70 bg-ink-900/70 p-1">
          {(
            [
              { key: "create", label: "Open a Room", icon: DoorOpen },
              { key: "join", label: "Join a Room", icon: Users },
            ] as const
          ).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                mode === key
                  ? "bg-gold/15 text-gold-soft shadow-gold-glow"
                  : "text-paper-dim hover:text-paper"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-5">
          {/* Team name */}
          <div>
            <label className="mono-label mb-1.5 block" htmlFor="teamName">
              Team name
            </label>
            <input
              id="teamName"
              className="input-noir"
              placeholder="e.g. Forensic Unit 6"
              value={teamName}
              maxLength={40}
              onChange={(e) => setTeamName(e.target.value)}
            />
          </div>

          {/* Room code — join mode only */}
          {mode === "join" && (
            <div>
              <label className="mono-label mb-1.5 block" htmlFor="roomCode">
                Room code (from the event host)
              </label>
              <input
                id="roomCode"
                className="input-noir text-center text-xl font-semibold uppercase tracking-[0.5em]"
                placeholder="XXXXXX"
                value={roomCode}
                maxLength={6}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              />
              <p className="mt-1.5 text-xs text-paper-dim/60">
                Up to 30 teams share one event room — each is dealt its own case.
              </p>
            </div>
          )}

          {/* Player count 1–4 */}
          <div>
            <label className="mono-label mb-1.5 block">
              Players at this screen — {playerCount} of 4
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  onClick={() => setPlayerCount(n)}
                  className={`flex h-11 flex-1 items-center justify-center gap-1.5 rounded-md border font-mono text-sm transition-all ${
                    playerCount === n
                      ? "border-gold/70 bg-gold/15 text-gold-soft shadow-gold-glow"
                      : "border-ink-500/70 bg-ink-900/60 text-paper-dim hover:border-gold/30"
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  {n}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-md border border-blood/50 bg-blood-deep/20 p-3 text-sm text-red-200">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <button
            onClick={submit}
            disabled={busy || (mode === "join" && roomCode.trim().length < 4)}
            className="btn-gold w-full !py-3 text-base"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {mode === "create" ? "Open Case File" : "Join the Investigation"}
          </button>

          <p className="text-center text-xs leading-relaxed text-paper-dim/60">
            {mode === "create" ? (
              <>
                You'll receive a 6-character room code — share it with up to 30 event teams. Every
                team gets one of 3 cases at random.
              </>
            ) : (
              <>The server deals your team one of three cases the moment you join.</>
            )}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
