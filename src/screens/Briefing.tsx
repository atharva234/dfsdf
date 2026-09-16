/**
 * Case Briefing — embedded YouTube briefing film (when the case has one),
 * company dossier facts, narrative intro. Renders whichever case the team
 * was dealt.
 */

import { motion } from "framer-motion";
import { ArrowRight, Building2, CalendarClock, MapPin, FileLock2 } from "lucide-react";
import type { GameCase } from "../game/cases/types";
import { Typewriter } from "../components/ui";

export function Briefing({
  kase,
  onBegin,
  roomCode,
}: {
  kase: GameCase;
  onBegin: () => void;
  roomCode: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto w-full max-w-5xl"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="mono-label">Step 02 — Case briefing · Room {roomCode}</div>
          <h2 className="display mt-1 text-2xl text-paper sm:text-3xl">
            Your team's case file has been dealt
          </h2>
        </div>
        <FileLock2 className="h-8 w-8 text-gold/40" />
      </div>

      {/* Briefing film — only when the case ships with a video */}
      {kase.videoId ? (
        <div className="panel-edge overflow-hidden">
          <div className="relative aspect-video w-full bg-ink-950">
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${kase.videoId}?rel=0&modestbranding=1`}
              title={`Case briefing film — ${kase.title}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-ink-600/60 bg-ink-900/70 px-4 py-3">
            <span className="flex items-center gap-2 font-mono text-xs text-paper-dim">
              <Building2 className="h-3.5 w-3.5 text-gold/70" />
              {kase.company}
            </span>
            <span className="flex items-center gap-2 font-mono text-xs text-paper-dim">
              <MapPin className="h-3.5 w-3.5 text-gold/70" />
              {kase.place}
            </span>
            <span className="flex items-center gap-2 font-mono text-xs text-paper-dim">
              <CalendarClock className="h-3.5 w-3.5 text-gold/70" />
              {kase.period}
            </span>
            <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.2em] text-gold/70">
              Case No. {kase.caseNo}
            </span>
          </div>
        </div>
      ) : (
        <div className="panel-edge p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <span className="flex items-center gap-2 font-mono text-sm text-paper-dim">
              <Building2 className="h-4 w-4 text-gold/70" />
              {kase.company}
            </span>
            <span className="flex items-center gap-2 font-mono text-xs text-paper-dim">
              <MapPin className="h-3.5 w-3.5 text-gold/70" />
              {kase.place}
            </span>
            <span className="flex items-center gap-2 font-mono text-xs text-paper-dim">
              <CalendarClock className="h-3.5 w-3.5 text-gold/70" />
              {kase.period}
            </span>
            <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.2em] text-gold/70">
              Case No. {kase.caseNo}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-ink-600/60 pt-4 sm:grid-cols-4">
            {[
              { k: "Industry", v: kase.industry ?? "—" },
              { k: "Difficulty", v: kase.difficulty },
              { k: "On the clock", v: `${kase.minutes} minutes` },
              { k: "Exhibits", v: `${kase.evidence.length} documents` },
            ].map((f) => (
              <div key={f.k} className="rounded-md border border-ink-600/60 bg-ink-900/60 p-3">
                <div className="mono-label mb-1">{f.k}</div>
                <div className="font-mono text-sm text-paper">{f.v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Narrative intro */}
      <div className="panel-edge mt-4 p-5 sm:p-7">
        <div className="mono-label mb-3">Confidential — forensic review unit only</div>
        <Typewriter lines={[...kase.narrative]} className="max-w-3xl text-[15px] text-paper-dim" />
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button onClick={onBegin} className="btn-gold !px-6 !py-3 text-base">
            Begin Investigation
            <ArrowRight className="h-4 w-4" />
          </button>
          <p className="text-xs text-paper-dim/70">
            This case is designed for a {kase.minutes}-minute investigation. The shared room clock
            is set by your event host.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
