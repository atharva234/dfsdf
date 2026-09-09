/**
 * Case Briefing — embedded YouTube briefing film, case facts, narrative intro.
 */

import { motion } from "framer-motion";
import { ArrowRight, Building2, CalendarClock, MapPin, FileLock2 } from "lucide-react";
import { CASE } from "../game/case";
import { Typewriter } from "../components/ui";

export function Briefing({ onBegin, roomCode }: { onBegin: () => void; roomCode: string }) {
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
            The morning everything stopped
          </h2>
        </div>
        <FileLock2 className="h-8 w-8 text-gold/40" />
      </div>

      {/* Briefing film */}
      <div className="panel-edge overflow-hidden">
        <div className="relative aspect-video w-full bg-ink-950">
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${CASE.videoId}?rel=0&modestbranding=1`}
            title="Case briefing film — the fall of Meridian Sovereign Bank"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-ink-600/60 bg-ink-900/70 px-4 py-3">
          <span className="flex items-center gap-2 font-mono text-xs text-paper-dim">
            <Building2 className="h-3.5 w-3.5 text-gold/70" />
            {CASE.company} · est. {CASE.founded}
          </span>
          <span className="flex items-center gap-2 font-mono text-xs text-paper-dim">
            <MapPin className="h-3.5 w-3.5 text-gold/70" />
            {CASE.place}
          </span>
          <span className="flex items-center gap-2 font-mono text-xs text-paper-dim">
            <CalendarClock className="h-3.5 w-3.5 text-gold/70" />
            {CASE.date}
          </span>
          <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.2em] text-gold/70">
            Case No. {CASE.caseNo}
          </span>
        </div>
      </div>

      {/* Narrative intro */}
      <div className="panel-edge mt-4 p-5 sm:p-7">
        <div className="mono-label mb-3">Confidential — forensic review unit only</div>
        <Typewriter lines={[...CASE.narrative]} className="max-w-3xl text-[15px] text-paper-dim" />
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button onClick={onBegin} className="btn-gold !px-6 !py-3 text-base">
            Begin Investigation
            <ArrowRight className="h-4 w-4" />
          </button>
          <p className="text-xs text-paper-dim/70">
            The clock starts for the whole room the moment the first team begins. 60 minutes.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
