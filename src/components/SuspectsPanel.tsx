/**
 * Suspects Panel — profile cards that expand into typewriter
 * interview transcripts. Roster comes from the team's assigned case.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MapPin, UserRound, Quote } from "lucide-react";
import type { GameCase, Suspect } from "../game/cases/types";
import { Typewriter } from "./ui";

function SuspectCard({ suspect, index }: { suspect: Suspect; index: number }) {
  const [open, setOpen] = useState(false);
  const initials = suspect.name
    .split(" ")
    .map((w) => w[0])
    .join("");

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
        {/* photo placeholder */}
        <div className="relative shrink-0">
          <div
            className={`grid h-16 w-14 place-items-center rounded-sm border-2 bg-gradient-to-b from-ink-700 to-ink-900 font-display text-lg font-semibold tracking-widest transition-colors ${
              open ? "border-gold/60 text-gold-soft" : "border-ink-500 text-paper-dim/70"
            }`}
          >
            {initials}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/50 to-transparent" />
          {/* file-tab corner */}
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
                  {suspect.transcript.map((turn, i) => (
                    <div key={i}>
                      <div className="mb-1 text-[11px] uppercase tracking-[0.18em] text-verdigris">
                        Q: {turn.q}
                      </div>
                      {i === suspect.transcript.length - 1 ? (
                        <Typewriter
                          lines={[`A: ${turn.a}`]}
                          speed={12}
                          className="text-paper"
                        />
                      ) : (
                        <div className="text-paper-dim">A: {turn.a}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 rounded-md border border-gold/25 bg-gold-faint/30 p-3">
                <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
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

export function SuspectsPanel({ kase }: { kase: GameCase }) {
  return (
    <div className="space-y-3">
      <div className="mb-1 flex items-center justify-between">
        <div>
          <div className="mono-label">Persons of interest — {kase.suspects.length}</div>
          <h3 className="display text-lg text-paper">The Interview Room</h3>
        </div>
      </div>
      {kase.suspects.map((s, i) => (
        <SuspectCard key={s.id} suspect={s} index={i} />
      ))}
    </div>
  );
}
