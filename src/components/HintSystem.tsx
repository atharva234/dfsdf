/**
 * Hint system — each reveal costs points. A subtle inline warning states the
 * cost and asks for confirmation before the mutation commits the penalty;
 * the text is revealed only after success.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, TriangleAlert, Check } from "lucide-react";
import { HINTS } from "../game/case";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useMutation } from "convex/react";

export function HintSystem({
  teamId,
  revealed,
  penaltyPerHint,
  onRevealed,
}: {
  teamId: Id<"teams">;
  revealed: string[];
  penaltyPerHint: number;
  onRevealed: (hintId: string) => void;
}) {
  const [confirming, setConfirming] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const useHint = useMutation(api.game.useHint);

  const reveal = async (hintId: string) => {
    setError(null);
    try {
      await useHint({ teamId, hintId });
      onRevealed(hintId);
    } catch {
      setError("The tip line is down — try again.");
    }
    setConfirming(null);
  };

  return (
    <div className="panel-edge p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="mono-label">Consult the tip line — each call costs points</div>
          <h3 className="display text-lg text-paper">Informants</h3>
        </div>
        <span className="font-mono text-xs text-gold-soft">
          −{penaltyPerHint} pts / hint
        </span>
      </div>

      <div className="space-y-2.5">
        {HINTS.map((hint, i) => {
          const isRevealed = revealed.includes(hint.id);
          const isConfirming = confirming === hint.id;
          return (
            <div
              key={hint.id}
              className={`rounded-md border p-3 transition-colors ${
                isRevealed
                  ? "border-verdigris/40 bg-verdigris/10"
                  : isConfirming
                    ? "border-gold/50 bg-gold-faint/30"
                    : "border-ink-600/60 bg-ink-900/50"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Lightbulb
                    className={`h-4 w-4 ${isRevealed ? "text-verdigris" : "text-gold/80"}`}
                  />
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-paper-dim">
                    Informant {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                {!isRevealed && (
                  <button
                    onClick={() => setConfirming(isConfirming ? null : hint.id)}
                    className="btn-ghost !px-3 !py-1 text-xs"
                  >
                    {isConfirming ? "Wait, no" : `Reveal −${penaltyPerHint}`}
                  </button>
                )}
                {isRevealed && (
                  <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-verdigris">
                    <Check className="h-3 w-3" /> on file
                  </span>
                )}
              </div>

              <AnimatePresence initial={false}>
                {isConfirming && !isRevealed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 flex items-start gap-2 rounded border border-blood/40 bg-blood-deep/20 p-2.5">
                      <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-300" />
                      <div className="text-xs leading-relaxed text-red-200/90">
                        Calling the informant costs <b>−{penaltyPerHint} points</b> from your
                        final score. This can't be undone.
                        <button
                          onClick={() => reveal(hint.id)}
                          className="btn-gold mt-2 !px-3 !py-1 text-xs"
                        >
                          I understand — reveal
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
                {isRevealed && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2.5 text-[13px] leading-relaxed text-paper"
                  >
                    {hint.text}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          );
        })}
        {error && <p className="text-xs text-red-300">{error}</p>}
      </div>
    </div>
  );
}
