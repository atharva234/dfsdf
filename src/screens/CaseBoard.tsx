/**
 * Case Board — the team's working wall. Only discovered exhibits appear
 * here (nothing by default), alongside the shared sticky notes and the
 * leads carried in from the Crime Scene. This is also the hub that routes
 * the team back into the scene, records room, and interrogation.
 */

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Pin, StickyNote, Archive, ScanSearch, Users } from "lucide-react";
import type { GameCase } from "../game/cases/types";
import type { Id } from "../../convex/_generated/dataModel";
import { EvidenceCard, DocumentModal } from "../components/EvidenceBoard";
import { CaseNotes, type Note } from "../components/CaseNotes";

export function CaseBoard({
  kase,
  gameId,
  teamName,
  notes,
  discoveredEvidenceIds,
  discoveredClueIds,
  viewedEvidence,
  onViewEvidence,
  onGoScene,
  onGoRecords,
  onGoInterrogation,
}: {
  kase: GameCase;
  gameId: Id<"games">;
  teamName: string;
  notes: Note[] | undefined;
  discoveredEvidenceIds: string[];
  discoveredClueIds: string[];
  /** Exhibit ids the team has actually opened (local "collected" state). */
  viewedEvidence: string[];
  onViewEvidence: (id: string) => void;
  onGoScene: () => void;
  onGoRecords: () => void;
  onGoInterrogation: () => void;
}) {
  const [openDocId, setOpenDocId] = useState<string | null>(null);
  const openDoc = kase.evidence.find((e) => e.id === openDocId) ?? null;

  const discovered = useMemo(
    () => kase.evidence.filter((d) => discoveredEvidenceIds.includes(d.id)),
    [kase, discoveredEvidenceIds],
  );
  const foundClues = kase.clues.filter((c) => discoveredClueIds.includes(c.id));

  const groups = useMemo(
    () => [...new Set(discovered.map((d) => d.group))],
    [discovered],
  );
  const [group, setGroup] = useState<string | null>(null);
  const shown = group ? discovered.filter((d) => d.group === group) : discovered;

  return (
    <div>
      <div className="mb-5">
        <div className="mono-label">Stage 05 — assemble the file</div>
        <h2 className="display text-2xl text-paper">Case Board</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-paper-dim">
          Everything your team has actually found, pinned in one place. An exhibit you never
          discovered was never evidence.
        </p>
      </div>

      {/* Route back into the discovery stages */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {[
          { icon: Archive, label: "Crime Scene", sub: "Search for what was left behind", onClick: onGoScene },
          { icon: ScanSearch, label: "Records Room", sub: "Query the archive by reference", onClick: onGoRecords },
          { icon: Users, label: "Interrogation", sub: "Press the suspects on your findings", onClick: onGoInterrogation },
        ].map(({ icon: Icon, label, sub, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="panel-edge group flex items-center gap-3 p-4 text-left transition-colors hover:border-gold/40"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-gold/40 bg-gold/10 text-gold">
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="display block text-sm text-paper group-hover:text-gold-soft">{label}</span>
              <span className="mono-label block">{sub}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Leads discovered at the scene */}
      {foundClues.length > 0 && (
        <div className="mb-6">
          <div className="mono-label mb-2">Leads on file — {foundClues.length}</div>
          <div className="grid gap-2 sm:grid-cols-2">
            {foundClues.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-2.5 rounded-md border border-verdigris/30 bg-verdigris/5 p-3"
              >
                <Pin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-verdigris" />
                <p className="text-[12.5px] leading-relaxed text-paper">{c.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Discovered exhibits */}
      <div className="corkboard rounded-xl border border-ink-700/80 p-4 shadow-pin sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mono-label">
              Evidence Locker — {discovered.length}/{kase.evidence.length} discovered
            </div>
            <h3 className="display text-lg text-paper">Case Exhibits</h3>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-paper-dim/70">
            <Pin className="h-3.5 w-3.5 text-gold/70" />
            pin to board
          </div>
        </div>

        {groups.length > 1 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            <FilterChip
              label={`All (${discovered.length})`}
              active={group === null}
              onClick={() => setGroup(null)}
            />
            {groups.map((g) => (
              <FilterChip
                key={g}
                label={`${g} (${discovered.filter((d) => d.group === g).length})`}
                active={group === g}
                onClick={() => setGroup(g)}
              />
            ))}
          </div>
        )}

        {shown.length === 0 ? (
          <div className="rounded-lg border border-dashed border-ink-500/70 p-8 text-center">
            <Pin className="mx-auto mb-3 h-8 w-8 text-paper-dim/40" />
            <p className="text-sm text-paper-dim/70">
              Nothing pinned yet. Work the Crime Scene — evidence has to be found before it
              reaches this board.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((doc, i) => (
              <EvidenceCard
                key={doc.id}
                doc={doc}
                viewed={viewedEvidence.includes(doc.id)}
                index={i}
                onOpen={(d) => {
                  setOpenDocId(d.id);
                  onViewEvidence(d.id);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Shared notes */}
      <div className="mt-8">
        {notes ? (
          <CaseNotes gameId={gameId} notes={notes} teamName={teamName} />
        ) : (
          <div className="panel-edge flex items-center justify-center gap-2 p-6 text-sm text-paper-dim/60">
            <StickyNote className="h-4 w-4 text-gold/60" /> Opening the shared notepad…
          </div>
        )}
      </div>

      {/* Scanned-document modal (shared primitive) */}
      <DocumentModal doc={openDoc} onClose={() => setOpenDocId(null)} />
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors ${
        active
          ? "border-gold/60 bg-gold/15 text-gold-soft"
          : "border-ink-500/60 bg-ink-900/50 text-paper-dim hover:border-gold/30 hover:text-paper"
      }`}
    >
      {label}
    </button>
  );
}
