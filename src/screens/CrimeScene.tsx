/**
 * Crime Scene — the first stage of the investigation. Clickable hotspots
 * over a noir office backdrop; free hotspots reveal their evidence/clue on
 * click, locked hotspots demand the gating clue (with a code-entry field)
 * before they open. Nothing appears by default — the team must search.
 */

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Archive,
  Terminal,
  Trash2,
  FileSearch,
  KeyRound,
  PackageOpen,
  RotateCcw,
} from "lucide-react";
import type { GameCase, Hotspot } from "../game/cases/types";
import { Stamp } from "../components/ui";

/** Deterministic scene placement for each hotspot card. */
const SPOTS: { grid: string; icon: typeof Archive }[] = [
  { grid: "lg:col-start-1 lg:row-start-1", icon: Archive },
  { grid: "lg:col-start-2 lg:row-start-2", icon: Terminal },
  { grid: "lg:col-start-3 lg:row-start-1", icon: Trash2 },
  { grid: "lg:col-start-2 lg:row-start-3", icon: FileSearch },
];

function HotspotCard({
  hs,
  index,
  found,
  gateClueFound,
  gateLabel,
  onOpen,
  onUnlock,
}: {
  hs: Hotspot;
  index: number;
  found: boolean;
  gateClueFound: boolean;
  gateLabel: string | undefined;
  onOpen: () => void;
  onUnlock: (code: string) => void;
}) {
  const [code, setCode] = useState("");
  const [shake, setShake] = useState(0);
  const meta = SPOTS[index % SPOTS.length];
  const Icon = meta.icon;
  const locked = !!hs.locked && !gateClueFound;
  const opened = found;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35 }}
      className={`panel-edge relative flex min-h-[150px] flex-col p-4 ${meta.grid} ${
        opened ? "border-verdigris/40" : locked ? "opacity-90" : "hover:border-gold/40"
      }`}
    >
      <div className="mb-3 flex items-start justify-between">
        <span
          className={`grid h-10 w-10 place-items-center rounded-md border ${
            opened
              ? "border-verdigris/50 bg-verdigris/10 text-verdigris"
              : locked
                ? "border-blood/40 bg-blood-deep/20 text-blood"
                : "border-gold/40 bg-gold/10 text-gold"
          }`}
        >
          {opened ? <PackageOpen className="h-5 w-5" /> : locked ? <Lock className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
        </span>
        {opened && <Stamp text="searched" tone="verdigris" />}
      </div>

      <div className="display text-base text-paper">{hs.label}</div>
      <p className="mt-1 flex-1 text-xs leading-relaxed text-paper-dim/80">
        {locked
          ? `Locked. ${gateLabel ? `You need a lead: “${gateLabel}”.` : "You need a lead you haven't found yet."}`
          : opened
            ? "Searched. What you found is on your case board."
            : "Something may be here. Search it."}
      </p>

      <AnimatePresence initial={false} mode="wait">
        {locked ? (
          <motion.div
            key="locked"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3 space-y-2"
          >
            <div className="flex gap-1.5">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (!code.trim()) return;
                    onUnlock(code.trim());
                    setCode("");
                    setShake((s) => s + 1);
                  }
                }}
                placeholder="Enter code / reference…"
                className="input-noir flex-1 font-mono text-sm"
                aria-label={`${hs.label} code entry`}
              />
              <button
                onClick={() => {
                  if (!code.trim()) return;
                  onUnlock(code.trim());
                  setCode("");
                  setShake((s) => s + 1);
                }}
                className="btn-ghost !px-3"
                title="Try the code"
              >
                <KeyRound className="h-4 w-4" />
              </button>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper-dim/50">
              Wrong codes cost nothing — but nothing opens.
            </p>
          </motion.div>
        ) : !opened ? (
          <motion.button
            key="open"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onOpen}
            className="btn-gold mt-3 !py-2 text-sm"
          >
            <FileSearch className="h-4 w-4" />
            Search
          </motion.button>
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-verdigris"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            logged to case board
          </motion.div>
        )}
      </AnimatePresence>

      {/* failed-attempt shake cue */}
      {shake > 0 && locked && (
        <motion.span
          key={shake}
          className="pointer-events-none absolute inset-0 rounded-[0.75rem] border border-blood/50"
          initial={{ opacity: 0.9 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      )}
    </motion.div>
  );
}

export function CrimeScene({
  kase,
  discoveredEvidenceIds,
  discoveredClueIds,
  onDiscoverEvidence,
  onDiscoverClue,
}: {
  kase: GameCase;
  discoveredEvidenceIds: string[];
  discoveredClueIds: string[];
  onDiscoverEvidence: (id: string) => void;
  onDiscoverClue: (id: string) => void;
}) {
  const [flash, setFlash] = useState<{ id: string; label: string; kind: "evidence" | "clue" } | null>(
    null,
  );

  const clueById = useMemo(
    () => new Map(kase.clues.map((c) => [c.id, c])),
    [kase],
  );

  const handleUnlock = (hs: Hotspot, code: string) => {
    if (!hs.locked) return;
    // The lock opens when the typed code matches the combination declared on
    // the hotspot — exact (case-insensitive) match, no inference from the
    // gating clue's text.
    const ok =
      code.trim().toLowerCase() === hs.locked.combination.trim().toLowerCase();
    if (ok) {
      if (hs.reveals.kind === "evidence") onDiscoverEvidence(hs.reveals.id);
      else onDiscoverClue(hs.reveals.id);
      const label =
        hs.reveals.kind === "evidence"
          ? kase.evidence.find((e) => e.id === hs.reveals.id)?.title
          : clueById.get(hs.reveals.id)?.text;
      setFlash({ id: hs.id, label: label ?? "Opened", kind: hs.reveals.kind });
    }
  };

  return (
    <div>
      <div className="mb-5">
        <div className="mono-label">Stage 01 — secure the scene</div>
        <h2 className="display text-2xl text-paper">The Branch Office</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-paper-dim">
          The Singapore branch after the freeze: desks cleared in a hurry, terminals still warm.
          Click a zone to search it. Whatever you find is logged to your case board — nothing
          is handed to you.
        </p>
      </div>

      <div className="corkboard rounded-xl border border-ink-700/80 p-4 shadow-pin sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-3">
          {kase.hotspots.map((hs, i) => {
            const found =
              (hs.reveals.kind === "evidence" &&
                discoveredEvidenceIds.includes(hs.reveals.id)) ||
              (hs.reveals.kind === "clue" && discoveredClueIds.includes(hs.reveals.id));
            const gateClueFound = hs.locked
              ? discoveredClueIds.includes(hs.locked.requiresClue)
              : false;
            const gate = hs.locked ? clueById.get(hs.locked.requiresClue) : undefined;
            return (
              <HotspotCard
                key={hs.id}
                hs={hs}
                index={i}
                found={found}
                gateClueFound={gateClueFound}
                gateLabel={gate?.text}
                onOpen={() => {
                  if (hs.reveals.kind === "evidence") onDiscoverEvidence(hs.reveals.id);
                  else onDiscoverClue(hs.reveals.id);
                  const label =
                    hs.reveals.kind === "evidence"
                      ? kase.evidence.find((e) => e.id === hs.reveals.id)?.title
                      : clueById.get(hs.reveals.id)?.text;
                  setFlash({
                    id: hs.id,
                    label: label ?? "Evidence",
                    kind: hs.reveals.kind,
                  });
                }}
                onUnlock={(code) => handleUnlock(hs, code)}
              />
            );
          })}
        </div>
      </div>

      {/* Discovery flash */}
      <AnimatePresence>
        {flash && (
          <motion.div
            key={flash.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-xl"
          >
            <div className="panel-edge flex items-start gap-3 p-4 shadow-gold-glow-soft">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-gold/50 bg-gold/15 text-gold">
                {flash.kind === "evidence" ? (
                  <FileSearch className="h-4 w-4" />
                ) : (
                  <Terminal className="h-4 w-4" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="mono-label mb-0.5">
                  {flash.kind === "evidence" ? "Evidence logged" : "Lead discovered"}
                </div>
                <p className="text-sm leading-snug text-paper">{flash.label}</p>
              </div>
              <button
                onClick={() => setFlash(null)}
                className="mono-label shrink-0 hover:text-gold-soft"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
