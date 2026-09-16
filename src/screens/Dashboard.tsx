/**
 * Investigation Dashboard — the main screen. Sidebar navigation across
 * Evidence Board / Suspects / Case Notes, with the informant (hint) panel
 * docked in the rail and the scanned-document modal.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FolderSearch, Users, StickyNote, Siren } from "lucide-react";
import type { EvidenceDoc, GameCase } from "../game/cases/types";
import { useGameStore, collectEvidence, revealHint } from "../game/store";
import { EvidenceBoard, DocumentModal } from "../components/EvidenceBoard";
import { SuspectsPanel } from "../components/SuspectsPanel";
import { CaseNotes } from "../components/CaseNotes";
import { HintSystem } from "../components/HintSystem";
import { CaseHeader } from "../components/ui";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useQuery } from "convex/react";

type Tab = "evidence" | "suspects" | "notes";

const TABS: { key: Tab; label: string; icon: typeof FolderSearch; blurb: string }[] = [
  { key: "evidence", label: "Evidence Board", icon: FolderSearch, blurb: "Case exhibits" },
  { key: "suspects", label: "Suspects", icon: Users, blurb: "Interview room" },
  { key: "notes", label: "Case Notes", icon: StickyNote, blurb: "Shared deductions" },
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
  onAccuse: () => void;
  onExpire: () => void;
  onAbandon: () => void;
}) {
  const { collected, hints } = useGameStore();
  const [tab, setTab] = useState<Tab>("evidence");
  const [openDoc, setOpenDoc] = useState<EvidenceDoc | null>(null);
  const notes = useQuery(api.game.getNotes, { gameId }) as
    | { _id: Id<"notes">; author: string; body: string; createdAt: number }[]
    | undefined;

  const endsAt = startedAt + timeLimitMs;

  const openEvidence = (doc: EvidenceDoc) => {
    collectEvidence(doc.id);
    setOpenDoc(doc);
  };

  return (
    <div className="min-h-screen">
      <CaseHeader
        roomCode={roomCode}
        teamName={teamName}
        caseNo={kase.caseNo}
        caseTitle={kase.title}
        evidenceCollected={collected.length}
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
            {TABS.map(({ key, label, icon: Icon, blurb }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex w-full items-center gap-3 border-b border-ink-600/50 px-4 py-3 text-left transition-colors last:border-0 ${
                  tab === key
                    ? "bg-gold/10 text-gold-soft"
                    : "text-paper-dim hover:bg-ink-800/60 hover:text-paper"
                }`}
              >
                <Icon className={`h-4 w-4 ${tab === key ? "text-gold" : ""}`} />
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{label}</span>
                  <span className="block font-mono text-[10px] uppercase tracking-wider opacity-60">
                    {blurb}
                  </span>
                </span>
                {key === "notes" && notes && notes.length > 0 && (
                  <span className="ml-auto rounded-full border border-gold/40 px-1.5 font-mono text-[10px] text-gold-soft">
                    {notes.length}
                  </span>
                )}
              </button>
            ))}
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
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {tab === "evidence" && (
                <EvidenceBoard kase={kase} collected={collected} onOpen={openEvidence} />
              )}
              {tab === "suspects" && <SuspectsPanel kase={kase} />}
              {tab === "notes" && notes && (
                <CaseNotes gameId={gameId} notes={notes} teamName={teamName} />
              )}
              {tab === "notes" && !notes && (
                <div className="panel-edge p-8 text-center text-sm text-paper-dim/60">
                  Opening the shared notepad…
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <DocumentModal doc={openDoc} onClose={() => setOpenDoc(null)} />
    </div>
  );
}
