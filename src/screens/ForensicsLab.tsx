/**
 * Forensics Lab — the case's numeric gate. The team computes the answer from
 * discovered exhibits (for the Vanishing Ledger: the sum of the four error
 * postings on Account 88888). Wrong answers are free; the verdict stays
 * sealed until `puzzleSolved` is set server-side.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlaskConical, Unlock, TriangleAlert, Calculator, Check } from "lucide-react";
import type { GameCase } from "../game/cases/types";
import { Stamp } from "../components/ui";

export function ForensicsLab({
  kase,
  solved,
  onSubmitAnswer,
  onNext,
}: {
  kase: GameCase;
  solved: boolean;
  onSubmitAnswer: (answer: string) => Promise<boolean>;
  onNext: () => void;
}) {
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<"none" | "wrong" | "right">("none");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!answer.trim() || busy) return;
    setBusy(true);
    try {
      const ok = await onSubmitAnswer(answer.trim());
      setFeedback(ok ? "right" : "wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="mb-5">
        <div className="mono-label">Stage 04 — forensics</div>
        <h2 className="display text-2xl text-paper">The Forensics Lab</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-paper-dim">
          Numbers don't lie, but they hide. Work the exhibits you've gathered, compute what the
          file demands, and file the figure. The verdict stays sealed until the lab verifies it.
        </p>
      </div>

      <div className="panel-edge scanlines mx-auto max-w-2xl p-6">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-md border border-gold/40 bg-gold/10 text-gold">
            <FlaskConical className="h-5 w-5" />
          </span>
          <div>
            <div className="mono-label">Lab requisition</div>
            <div className="display text-base text-paper">Quantify the loss</div>
          </div>
          {solved && <Stamp text="verified" tone="verdigris" />}
        </div>

        <p className="rounded-md border border-ink-600/60 bg-ink-950/60 p-4 text-[13.5px] leading-relaxed text-paper">
          {kase.puzzle.prompt}
        </p>

        <p className="mt-2 flex items-center gap-1.5 font-mono text-[11px] text-paper-dim/60">
          <Calculator className="h-3.5 w-3.5 text-gold/60" />
          {kase.puzzle.toleranceHint}
        </p>

        <AnimatePresence mode="wait" initial={false}>
          {solved ? (
            <motion.div
              key="solved"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5"
            >
              <div className="flex items-center gap-2 rounded-md border border-verdigris/50 bg-verdigris/10 p-4">
                <Check className="h-5 w-5 text-verdigris" />
                <div>
                  <div className="display text-sm text-paper">Verified by the lab.</div>
                  <p className="text-xs text-paper-dim/80">
                    Your figure reconciles with the exhibits. The case board is complete — file
                    the verdict when your team is ready.
                  </p>
                </div>
              </div>
              <button onClick={onNext} className="btn-gold mt-4 w-full !py-3">
                <Unlock className="h-4 w-4" />
                Open the Case Board
              </button>
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5">
              <div className="flex gap-2">
                <input
                  value={answer}
                  onChange={(e) => {
                    setAnswer(e.target.value);
                    setFeedback("none");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  placeholder="Enter your figure…"
                  className="input-noir flex-1 font-mono text-lg tracking-widest"
                  aria-label="Puzzle answer"
                  autoFocus
                />
                <button
                  onClick={submit}
                  disabled={!answer.trim() || busy}
                  className="btn-gold"
                >
                  {busy ? "Checking…" : "File figure"}
                </button>
              </div>
              {feedback === "wrong" && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: [0, -6, 6, -3, 0] }}
                  className="mt-3 flex items-start gap-2 rounded-md border border-blood/40 bg-blood-deep/20 p-3"
                >
                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
                  <p className="text-xs leading-relaxed text-red-200/90">
                    Doesn't reconcile. Wrong figures cost nothing — but the lab won't sign off
                    until the number is right. Re-read the exhibit lines.
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
