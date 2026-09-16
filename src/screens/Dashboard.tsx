/**
 * Investigation Dashboard — the shell for the chained-discovery stages:
 * Crime Scene → Records Room → Interrogation → Forensics Lab → Case Board,
 * with the informant (hint) panel docked in the rail and the countdown.
 * Content ownership lives in each stage screen; this shell carries the
 * team's shared discovery state down to whichever stage is active.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Archive,
  ScanSearch,
  Users,
  FlaskConical,
  Pin,
  Siren,
} from "lucide-react";
import type { GameCase } from "../game/cases/types";
import { useGameStore, revealHint, collectEvidence } from "../game/store";
import { HintSystem } from "../components/HintSystem";
import { CaseHeader } from "../components/ui";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useQuery } from "convex/react";

import { CrimeScene } from "./CrimeScene";
import { RecordsRoom } from "./RecordsRoom";
import { Interrogation } from "./Interrogation";
import { ForensicsLab } from "./ForensicsLab";
import { CaseBoard } from "./CaseBoard";

export type Stage = "scene" | "records" | "interrogation" | "puzzle" | "caseboard";

const STAGES: { key: Stage; label: string; icon: typeof Archive; blurb: string }[] = [
  { key: "scene", label: "Crime Scene", icon: Archive, blurb: "Search the office" },
  { key: "records", label: "Records Room", icon: ScanSearch, blurb: "Query the archive" },
  { key: "interrogation", label: "Interrogation", icon: Users, blurb: "Press the suspects" },
  { key: "puzzle", label: "Forensics Lab", icon: FlaskConical, blurb: "Quantify the loss" },
  { key: "caseboard", label: "Case Board", icon: Pin, blurb: "Assemble the file" },
];

export function Dashboard({
  kase,
  gameId,
  teamId,
  teamName,
  roomCode,
  startedAt,
  timeLimitMs,
  penaltyPerHint,
  discoveredEvidenceIds,
  discoveredClueIds,
  askedQuestionIds,
  puzzleSolved,
  initialStage,
  onStageChange,
  onDiscoverEvidence,
  onDiscoverClue,
  onAskQuestion,
  onSearch,
  onSubmitPuzzleAnswer,
  onAccuse,
  onExpire,
  onAbandon,
}: {
  kase: GameCase;
  gameId: Id<"games">;
  teamId: Id<"teams">;
  teamName: string;
  roomCode: string;
  startedAt: number;
  timeLimitMs: number;
  penaltyPerHint: number;
  /** Shared, server-owned discovery state. */
  discoveredEvidenceIds: string[];
  discoveredClueIds: string[];
  askedQuestionIds: string[];
  puzzleSolved: boolean;
  /** Stage to open on (persisted in session.screen when it's a stage key). */
  initialStage: Stage;
  /** Persists stage navigation into the session for refresh survival. */
  onStageChange: (stage: Stage) => void;
  onDiscoverEvidence: (id: string) => void;
  onDiscoverClue: (id: string) => void;
  onAskQuestion: (questionId: string) => Promise<void>;
  onSearch: (term: string) => Promise<string[]>;
  onSubmitPuzzleAnswer: (answer: string) => Promise<boolean>;
  onAccuse: () => void;
  onExpire: () => void;
  onAbandon: () => void;
}) {
  const { hints, collected } = useGameStore();
  const [stage, setStage] = useState<Stage>(initialStage);
  const selectStage = (s: Stage) => {
    setStage(s);
    onStageChange(s);
  };
  const notes = useQuery(api.game.getNotes, { gameId }) as
    | { _id: Id<"notes">; author: string; body: string; createdAt: number }[]
    | undefined;

  const endsAt = startedAt + timeLimitMs;

  return (
    <div className="min-h-screen">
      <CaseHeader
        roomCode={roomCode}
        teamName={teamName}
        caseNo={kase.caseNo}
        caseTitle={kase.title}
        evidenceCollected={discoveredEvidenceIds.length}
        evidenceTotal={kase.evidence.length}
        hintsUsed={hints.length}
        maxHints={kase.hints.length}
        endsAt={endsAt}
        onExpire={onExpire}
        onAccuse={onAccuse}
        onAbandon={onAbandon}
      />

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[260px_1fr]">
        {/* Side rail */}
        <aside className="space-y-4">
          <nav className="panel-edge overflow-hidden">
            {STAGES.map(({ key, label, icon: Icon, blurb }, i) => {
              const done =
                (key === "caseboard" && discoveredEvidenceIds.length > 0) ||
                (key === "puzzle" && puzzleSolved);
              return (
                <button
                  key={key}
                  onClick={() => selectStage(key)}
                  className={`flex w-full items-center gap-3 border-b border-ink-600/50 px-4 py-3 text-left transition-colors last:border-0 ${
                    stage === key
                      ? "bg-gold/10 text-gold-soft"
                      : "text-paper-dim hover:bg-ink-800/60 hover:text-paper"
                  }`}
                >
                  <span className="font-mono text-[10px] text-paper-dim/50">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <Icon className={`h-4 w-4 ${stage === key ? "text-gold" : ""}`} />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{label}</span>
                    <span className="block font-mono text-[10px] uppercase tracking-wider opacity-60">
                      {blurb}
                    </span>
                  </span>
                  {done && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-verdigris" />}
                </button>
              );
            })}
          </nav>

          <HintSystem
            kase={kase}
            teamId={teamId}
            revealed={hints}
            penaltyPerHint={penaltyPerHint}
            onRevealed={revealHint}
          />

          <div className="rounded-lg border border-blood/25 bg-blood-deep/10 p-4">
            <div className="mb-1 flex items-center gap-2">
              <Siren className="h-4 w-4 text-blood" />
              <span className="mono-label" style={{ color: "#e8a99f" }}>
                Ready to name them?
              </span>
            </div>
            <p className="mb-3 text-xs leading-relaxed text-paper-dim/80">
              The accusation is final — it locks your team's score and stops your clock.
            </p>
            <button onClick={onAccuse} className="btn-danger w-full !py-2 text-sm">
              File the Accusation
            </button>
          </div>
        </aside>

        {/* Main stage */}
        <main className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={stage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {stage === "scene" && (
                <CrimeScene
                  kase={kase}
                  discoveredEvidenceIds={discoveredEvidenceIds}
                  discoveredClueIds={discoveredClueIds}
                  onDiscoverEvidence={onDiscoverEvidence}
                  onDiscoverClue={onDiscoverClue}
                />
              )}

              {stage === "records" && (
                <RecordsRoom kase={kase} onSearch={onSearch} />
              )}

              {stage === "interrogation" && (
                <Interrogation
                  kase={kase}
                  discoveredEvidenceIds={discoveredEvidenceIds}
                  askedQuestionIds={askedQuestionIds}
                  onAskQuestion={onAskQuestion}
                  onEvidenceUnlocked={onDiscoverEvidence}
                />
              )}

              {stage === "puzzle" && (
                <ForensicsLab
                  kase={kase}
                  solved={puzzleSolved}
                  onSubmitAnswer={onSubmitPuzzleAnswer}
                  onNext={() => selectStage("caseboard")}
                />
              )}

              {stage === "caseboard" && (
                <CaseBoard
                  kase={kase}
                  gameId={gameId}
                  teamName={teamName}
                  notes={notes}
                  discoveredEvidenceIds={discoveredEvidenceIds}
                  discoveredClueIds={discoveredClueIds}
                  viewedEvidence={collected}
                  onViewEvidence={collectEvidence}
                  onGoScene={() => selectStage("scene")}
                  onGoRecords={() => selectStage("records")}
                  onGoInterrogation={() => selectStage("interrogation")}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

    </div>
  );
}
