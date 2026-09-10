/**
 * Results — verdict reveal, the real solution breakdown, team score, and the
 * event leaderboard preview (up to 30 teams in the room).
 */

import { motion } from "framer-motion";
import {
  Trophy,
  Timer as TimerIcon,
  Lightbulb,
  CheckCircle2,
  XCircle,
  ChevronRight,
  RotateCcw,
  Medal,
} from "lucide-react";
import { useState } from "react";
import { CASE, SUSPECTS } from "../game/case";
import { EVIDENCE_BY_ID } from "../game/evidence";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { formatClock, Stamp } from "../components/ui";
import type { VerdictResult } from "./Accusation";

type LeaderRow = {
  rank: number;
  teamId: Id<"teams">;
  name: string;
  score: number;
  timeMs: number;
  correct: boolean;
  hintsUsed: number;
  playerCount: number;
};

export function Results({
  gameId,
  teamName,
  verdict,
  verdictSuspectId,
  verdictMethod,
  verdictEvidenceIds,
  hintsUsed,
  onPlayAgain,
}: {
  gameId: Id<"games">;
  teamName: string;
  verdict: VerdictResult;
  verdictSuspectId?: string;
  verdictMethod?: string;
  verdictEvidenceIds: string[];
  hintsUsed: number;
  onPlayAgain: () => void;
}) {
  const [showBoard, setShowBoard] = useState(false);
  const leaderboard = useQuery(api.game.leaderboard, { gameId }) as LeaderRow[] | undefined;

  const accusedName =
    SUSPECTS.find((s) => s.id === verdictSuspectId)?.name ?? "No suspect named";
  const culprit = SUSPECTS.find((s) => s.id === "alex-hayes");

  const keyExhibits = ["ev-statement-88888", "ev-email-meridian", "ev-erroraccount-88"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto w-full max-w-4xl space-y-4"
    >
      {/* Verdict banner */}
      <div
        className={`panel-edge relative overflow-hidden p-6 sm:p-8 ${
          verdict.correct ? "!border-verdigris/50" : "!border-blood/50"
        }`}
      >
        <div
          className={`pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full blur-3xl ${
            verdict.correct ? "bg-verdigris/15" : "bg-blood/20"
          }`}
        />
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <Stamp
            text={verdict.correct ? "CASE CLOSED" : "VERDICT OVERTURNED"}
            tone={verdict.correct ? "verdigris" : "blood"}
          />
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-paper-dim">
            {teamName} · Case {CASE.caseNo}
          </span>
        </div>
        <h2 className="display text-3xl text-paper sm:text-4xl">
          {verdict.correct ? (
            <>You got them. The bank falls — but justice lands.</>
          ) : (
            <>Wrong suspect. The ledger stays vanishing.</>
          )}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-paper-dim">
          You accused <span className="font-semibold text-paper">{accusedName}</span>.
          {verdict.correct
            ? " The prosecution rests. Here is how the money actually vanished."
            : ` The real architect walks. Study the file below — then take another run at it.`}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-md border border-ink-600/60 bg-ink-900/70 p-3">
            <div className="mono-label mb-1">Final score</div>
            <div className="font-mono text-xl font-bold text-gold-soft">{verdict.score}</div>
          </div>
          <div className="rounded-md border border-ink-600/60 bg-ink-900/70 p-3">
            <div className="mono-label mb-1">Case time</div>
            <div className="flex items-center gap-1.5 font-mono text-xl font-bold text-paper">
              <TimerIcon className="h-4 w-4 text-gold/70" />
              {formatClock(verdict.timeMs)}
            </div>
          </div>
          <div className="rounded-md border border-ink-600/60 bg-ink-900/70 p-3">
            <div className="mono-label mb-1">Hints used</div>
            <div className="flex items-center gap-1.5 font-mono text-xl font-bold text-paper">
              <Lightbulb className="h-4 w-4 text-gold/70" />
              {hintsUsed}
            </div>
          </div>
          <div className="rounded-md border border-ink-600/60 bg-ink-900/70 p-3">
            <div className="mono-label mb-1">Exhibits cited</div>
            <div className="font-mono text-xl font-bold text-paper">
              {verdictEvidenceIds.length}
            </div>
          </div>
        </div>
      </div>

      {/* Solution breakdown */}
      <div className="panel-edge p-5 sm:p-7">
        <div className="mono-label mb-1">The solution — how it really happened</div>
        <h3 className="display mb-4 text-xl text-paper">
          {culprit?.name}, {culprit?.role.split("—")[0].trim()}
        </h3>
        <p className="mb-5 rounded-md border border-gold/25 bg-gold-faint/30 p-3 text-sm leading-relaxed text-paper">
          {CASE.solution.headline}
        </p>
        <ol className="space-y-3">
          {CASE.solution.points.map((point, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-gold/40 bg-ink-900 font-mono text-[11px] text-gold-soft">
                {i + 1}
              </span>
              <p className="text-sm leading-relaxed text-paper-dim">{point}</p>
            </li>
          ))}
        </ol>

        <div className="mt-6 border-t border-ink-600/60 pt-4">
          <div className="mono-label mb-2">The exhibits that proved it</div>
          <div className="flex flex-wrap gap-2">
            {keyExhibits.map((id) => {
              const doc = EVIDENCE_BY_ID[id];
              const cited = verdictEvidenceIds.includes(id);
              return (
                <span
                  key={id}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] ${
                    cited
                      ? "border-verdigris/60 bg-verdigris/15 text-verdigris"
                      : "border-ink-500/70 bg-ink-900/60 text-paper-dim"
                  }`}
                  title={cited ? "You cited this exhibit" : "You missed this exhibit"}
                >
                  {cited ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <XCircle className="h-3 w-3" />
                  )}
                  {doc?.title}
                </span>
              );
            })}
          </div>
        </div>

        {verdictMethod && (
          <div className="mt-6 rounded-md border border-ink-600/60 bg-ink-900/60 p-4">
            <div className="mono-label mb-1">Your team's written verdict</div>
            <p className="font-mono text-[13px] leading-relaxed text-paper-dim">
              {verdictMethod}
            </p>
          </div>
        )}
      </div>

      {/* Leaderboard preview */}
      <div className="panel-edge overflow-hidden">
        <button
          onClick={() => setShowBoard((s) => !s)}
          className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-ink-800/60"
        >
          <div className="flex items-center gap-3">
            <Trophy className="h-5 w-5 text-gold" />
            <div>
              <div className="mono-label">Event room standings</div>
              <div className="display text-base text-paper">Leaderboard Preview</div>
            </div>
          </div>
          <ChevronRight
            className={`h-5 w-5 text-paper-dim transition-transform ${showBoard ? "rotate-90" : ""}`}
          />
        </button>
        {showBoard && (
          <div className="border-t border-ink-600/60 p-4">
            {leaderboard === undefined ? (
              <p className="py-4 text-center text-sm text-paper-dim/60">Loading standings…</p>
            ) : leaderboard.length === 0 ? (
              <p className="py-4 text-center text-sm text-paper-dim/60">
                No teams have filed verdicts yet — yours is the first name on the board.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="mono-label border-b border-ink-600/60">
                      <th className="py-2 pr-3">#</th>
                      <th className="py-2 pr-3">Team</th>
                      <th className="py-2 pr-3 text-right">Score</th>
                      <th className="py-2 pr-3 text-right">Time</th>
                      <th className="py-2 text-right">Verdict</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((row) => {
                      const isYou = row.name === teamName;
                      return (
                        <tr
                          key={row.teamId}
                          className={`border-b border-ink-700/40 last:border-0 ${
                            isYou ? "bg-gold/5" : ""
                          }`}
                        >
                          <td className="py-2 pr-3 font-mono">
                            {row.rank === 1 ? (
                              <Trophy className="h-4 w-4 text-gold" />
                            ) : row.rank <= 3 ? (
                              <Medal className="h-4 w-4 text-gold/60" />
                            ) : (
                              row.rank
                            )}
                          </td>
                          <td className="py-2 pr-3">
                            <span className={isYou ? "font-semibold text-gold-soft" : ""}>
                              {row.name}
                              {isYou && " — you"}
                            </span>
                            <span className="ml-2 font-mono text-[10px] text-paper-dim/50">
                              ×{row.playerCount}
                            </span>
                          </td>
                          <td className="py-2 pr-3 text-right font-mono text-gold-soft">
                            {row.score}
                          </td>
                          <td className="py-2 pr-3 text-right font-mono text-paper-dim">
                            {formatClock(row.timeMs)}
                          </td>
                          <td className="py-2 text-right">
                            {row.correct ? (
                              <CheckCircle2 className="ml-auto h-4 w-4 text-verdigris" />
                            ) : (
                              <XCircle className="ml-auto h-4 w-4 text-blood" />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pb-10">
        <p className="text-xs text-paper-dim/60">
          A fictionalized case modeled on the 1995 collapse of Barings Bank.
        </p>
        <button onClick={onPlayAgain} className="btn-ghost">
          <RotateCcw className="h-4 w-4" />
          Run the case again
        </button>
      </div>
    </motion.div>
  );
}
