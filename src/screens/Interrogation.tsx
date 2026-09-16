/**
 * Interrogation Room — suspects with gated questions. A question is only
 * offered once its unlock requirements are met: transcript entries carrying
 * an `unlock: { type: "evidence", requires: [...] }` appear only when every
 * listed exhibit is on the team's case board. Asking anything logs the
 * question server-side (askedQuestionIds) — which is also how suspect-unlock
 * evidence (e.g. a trade log that surfaces when Hayes is pressed) enters
 * the board.
 */

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MapPin, Quote, Lock, HelpCircle, FileSearch } from "lucide-react";
import type { GameCase, Suspect } from "../game/cases/types";
import { Typewriter } from "../components/ui";

function SuspectCard({
  suspect,
  index,
  discoveredEvidenceIds,
  askedQuestionIds,
  onAsk,
}: {
  suspect: Suspect;
  index: number;
  discoveredEvidenceIds: string[];
  askedQuestionIds: string[];
  onAsk: (questionId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [justUnlocked, setJustUnlocked] = useState<string | null>(null);
  const initials = suspect.name
    .split(" ")
    .map((w) => w[0])
    .join("");

  /** A transcript turn is askable when all its required exhibits are found. */
  const isAskable = (i: number) => {
    const turn = suspect.transcript[i];
    const req = turn.unlock?.type === "evidence" ? turn.unlock.requires : [];
    return req.every((id) => discoveredEvidenceIds.includes(id));
  };

  const askableCount = suspect.transcript.filter((_, i) => isAskable(i)).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className={`panel-edge overflow-hidden transition-colors ${
        open ? "border-gold/40" : "hover:border-gold/30"
      }`}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-4 p-4 text-left"
        aria-expanded={open}
      >
        <div className="relative shrink-0">
          <div
            className={`grid h-16 w-14 place-items-center rounded-sm border-2 bg-gradient-to-b from-ink-700 to-ink-900 font-display text-lg font-semibold tracking-widest transition-colors ${
              open ? "border-gold/60 text-gold-soft" : "border-ink-500 text-paper-dim/70"
            }`}
          >
            {initials}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/50 to-transparent" />
          <span className="absolute -right-1 -top-1 rounded-sm border border-gold/40 bg-ink-950 px-1 font-mono text-[9px] text-gold/80">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="display text-base text-paper">{suspect.name}</div>
          <div className="mt-0.5 line-clamp-2 text-xs leading-snug text-paper-dim/85">
            {suspect.role}
          </div>
          <div className="mt-1.5 flex items-center gap-3 font-mono text-[10px] text-paper-dim/60">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-gold/60" /> {suspect.location}
            </span>
            <span>AGE {suspect.age}</span>
            <span>
              {askableCount}/{suspect.transcript.length} questions open
            </span>
          </div>
        </div>

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-paper-dim transition-transform duration-200 ${
            open ? "rotate-180 text-gold" : ""
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-ink-600/60"
          >
            <div className="space-y-4 p-4">
              <div className="rounded-md border border-ink-600/60 bg-ink-900/60 p-3">
                <div className="mono-label mb-1">Known motive / pressure</div>
                <p className="text-[13px] leading-relaxed text-paper-dim">{suspect.motive}</p>
              </div>

              <div>
                <div className="mono-label mb-2 flex items-center gap-1.5">
                  <Quote className="h-3 w-3 text-gold/70" /> Interview transcript — recorded
                </div>
                <div className="space-y-3 rounded-md border border-gold/15 bg-ink-950/70 p-3 font-mono text-[12.5px]">
                  {suspect.transcript.map((turn, i) => {
                    const askable = isAskable(i);
                    const asked = askedQuestionIds.includes(`${suspect.id}:${i}`);
                    if (!askable) {
                      return (
                        <div
                          key={i}
                          className="rounded-md border border-dashed border-ink-500/60 bg-ink-900/40 p-3"
                        >
                          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-paper-dim/50">
                            <Lock className="h-3 w-3" /> Question {String(i + 1).padStart(2, "0")} —
                            locked
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-paper-dim/60">
                            {suspect.name.split(" ")[0]} isn't saying more yet. Find the exhibits
                            that corner the story — then ask again.
                          </p>
                        </div>
                      );
                    }
                    return (
                      <div key={i}>
                        <div className="mb-1 flex items-start justify-between gap-3">
                          <div className="text-[11px] uppercase tracking-[0.18em] text-verdigris">
                            Q: {turn.q}
                          </div>
                          {!asked && (
                            <button
                              onClick={() => {
                                onAsk(`${suspect.id}:${i}`);
                                setJustUnlocked(turn.a);
                              }}
                              className="btn-ghost shrink-0 !px-2.5 !py-1 text-[11px]"
                            >
                              <HelpCircle className="h-3 w-3" />
                              Ask
                            </button>
                          )}
                        </div>
                        {asked ? (
                          i === suspect.transcript.length - 1 || justUnlocked === turn.a ? (
                            <Typewriter
                              lines={[`A: ${turn.a}`]}
                              speed={12}
                              className="text-paper"
                            />
                          ) : (
                            <div className="text-paper-dim">A: {turn.a}</div>
                          )
                        ) : (
                          <div className="rounded-md border border-gold/25 bg-gold-faint/20 px-3 py-2 text-xs text-paper-dim/80">
                            Press {suspect.name.split(" ")[0]} on this — the answer logs to the
                            transcript.
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-md border border-gold/25 bg-gold-faint/30 p-3">
                <FileSearch className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <p className="text-[12.5px] leading-relaxed text-paper">
                  <span className="font-semibold text-gold-soft">Field note: </span>
                  {suspect.tell}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function Interrogation({
  kase,
  discoveredEvidenceIds,
  askedQuestionIds,
  onAskQuestion,
  onEvidenceUnlocked,
}: {
  kase: GameCase;
  discoveredEvidenceIds: string[];
  askedQuestionIds: string[];
  /** Logs the question server-side; `${suspectId}:${index}`. */
  onAskQuestion: (questionId: string) => Promise<void>;
  /** Fires when interviewing a suspect surfaces an exhibit (suspectAsked unlock). */
  onEvidenceUnlocked: (evidenceId: string) => void;
}) {
  // Derive which suspect-unlock exhibits each interview reveals.
  const suspectReveals = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const [evId, unlock] of Object.entries(kase.unlocks)) {
      if (unlock.type === "suspectAsked") {
        map.set(unlock.suspectId, [...(map.get(unlock.suspectId) ?? []), evId]);
      }
    }
    return map;
  }, [kase]);

  const handleAsk = async (suspectId: string, questionId: string) => {
    await onAskQuestion(questionId);
    const reveals = suspectReveals.get(suspectId) ?? [];
    for (const evId of reveals) {
      if (!discoveredEvidenceIds.includes(evId)) onEvidenceUnlocked(evId);
    }
  };

  return (
    <div className="space-y-3">
      <div className="mb-1">
        <div className="mono-label">Stage 03 — press the witnesses</div>
        <h2 className="display text-2xl text-paper">The Interview Room</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-paper-dim">
          Every question you can prove, you can ask. Some questions only open once the exhibits
          that support them are on your board — and pressing the right suspect surfaces evidence
          no search will find.
        </p>
      </div>
      {kase.suspects.map((s, i) => (
        <SuspectCard
          key={s.id}
          suspect={s}
          index={i}
          discoveredEvidenceIds={discoveredEvidenceIds}
          askedQuestionIds={askedQuestionIds}
          onAsk={(qId) => void handleAsk(s.id, qId)}
        />
      ))}
    </div>
  );
}
