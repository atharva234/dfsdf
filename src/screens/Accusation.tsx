/**
 * Accusation — final verdict. Suspect + method + supporting exhibits, plus any
 * case-specific scored fields (vendor / impact band), with a confirmation step
 * because submission is final and closes the team's case.
 */

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Gavel, TriangleAlert, Loader2, ChevronDown, FileCheck2 } from "lucide-react";
import type { GameCase } from "../game/cases/types";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { Modal, Stamp } from "../components/ui";

export type VerdictResult = {
  correct: boolean;
  score: number;
  timeMs: number;
  suspectId: string;
  method: string;
  evidenceIds: string[];
  fieldAnswers: Record<string, string>;
};

export function Accusation({
  kase,
  teamId,
  collected,
  onSubmit,
  onBack,
}: {
  kase: GameCase;
  teamId: Id<"teams">;
  collected: string[];
  onSubmit: (r: VerdictResult) => void;
  onBack: () => void;
}) {
  const [suspectId, setSuspectId] = useState("");
  const [method, setMethod] = useState("");
  const [evidenceIds, setEvidenceIds] = useState<string[]>([]);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitVerdict = useMutation(api.game.submitVerdict);

  const toggleEvidence = (id: string) =>
    setEvidenceIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    );

  const caseFields = useMemo(
    () =>
      Object.entries(kase.verdict)
        .filter(([, f]) => f != null)
        .map(([key, f]) => ({ key, field: f! })),
    [kase],
  );

  const canSubmit = useMemo(
    () =>
      suspectId !== "" &&
      method.trim().length >= 20 &&
      caseFields.every(({ key }) => (fields[key] ?? "") !== ""),
    [suspectId, method, caseFields, fields],
  );

  const fire = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await submitVerdict({
        teamId,
        caseId: kase.id,
        suspectId,
        method,
        evidenceIds,
        fieldAnswers: fields,
      });
      if ("error" in res && res.error) {
        setError(res.error);
        setConfirming(false);
      } else {
        onSubmit({
          correct: res.correct,
          score: res.score,
          timeMs: res.timeMs,
          suspectId,
          method,
          evidenceIds,
          fieldAnswers: fields,
        });
      }
    } catch {
      setError("The court clerk is unreachable — try again.");
      setConfirming(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto w-full max-w-3xl"
    >
      <div className="mb-4">
        <div className="mono-label">
          Final step — file your verdict · Case {kase.caseNo}
        </div>
        <h2 className="display mt-1 flex items-center gap-3 text-2xl text-paper sm:text-3xl">
          <Gavel className="h-6 w-6 text-gold" />
          The Accusation
        </h2>
      </div>

      <div className="panel-edge space-y-6 p-5 sm:p-7">
        {/* Suspect select */}
        <div>
          <label className="mono-label mb-1.5 block" htmlFor="suspect">
            {kase.accusationPrompt}
          </label>
          <div className="relative">
            <select
              id="suspect"
              className="input-noir appearance-none pr-10"
              value={suspectId}
              onChange={(e) => setSuspectId(e.target.value)}
            >
              <option value="">— Select a suspect —</option>
              {kase.suspects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.role}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-paper-dim" />
          </div>
        </div>

        {/* Method */}
        <div>
          <label className="mono-label mb-1.5 block" htmlFor="method">
            How did they do it? <span className="normal-case tracking-normal">(min. 20 characters)</span>
          </label>
          <textarea
            id="method"
            className="input-noir min-h-28 resize-y"
            placeholder={kase.methodPlaceholder}
            value={method}
            maxLength={600}
            onChange={(e) => setMethod(e.target.value)}
          />
          <div className="mt-1 text-right font-mono text-[10px] text-paper-dim/60">
            {method.length}/600
          </div>
        </div>

        {/* Case-specific scored fields (vendor / impact band) */}
        {caseFields.map(({ key, field }) => (
          <div key={key}>
            <label className="mono-label mb-1.5 block" htmlFor={`field-${key}`}>
              {field.label}
            </label>
            <div className="relative">
              <select
                id={`field-${key}`}
                className="input-noir appearance-none pr-10"
                value={fields[key] ?? ""}
                onChange={(e) => setFields((f) => ({ ...f, [key]: e.target.value }))}
              >
                <option value="">— {field.placeholder} —</option>
                {field.options.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-paper-dim" />
            </div>
          </div>
        ))}

        {/* Evidence picker */}
        <div>
          <div className="mono-label mb-1.5 flex items-center justify-between">
            <span>Supporting exhibits — pinned to the verdict</span>
            <span className="font-mono text-gold-soft">{evidenceIds.length} selected</span>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {kase.evidence.map((doc) => {
              const picked = evidenceIds.includes(doc.id);
              const seen = collected.includes(doc.id);
              return (
                <button
                  key={doc.id}
                  onClick={() => toggleEvidence(doc.id)}
                  className={`flex items-start gap-2.5 rounded-md border p-2.5 text-left transition-colors ${
                    picked
                      ? "border-gold/60 bg-gold/10"
                      : "border-ink-600/60 bg-ink-900/50 hover:border-gold/30"
                  }`}
                >
                  <FileCheck2
                    className={`mt-0.5 h-4 w-4 shrink-0 ${picked ? "text-gold" : "text-paper-dim/50"}`}
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] text-paper">{doc.title}</span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-paper-dim/60">
                      {seen ? "reviewed" : "unreviewed"} · {doc.date}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-paper-dim/60">
            Correct exhibits earn points. Red herrings subtract — choose like a prosecutor.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-md border border-blood/50 bg-blood-deep/20 p-3 text-sm text-red-200">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 border-t border-ink-600/60 pt-5">
          <button onClick={onBack} className="btn-ghost">
            Back to the board
          </button>
          <button
            onClick={() => setConfirming(true)}
            disabled={!canSubmit}
            className="btn-gold ml-auto !px-6 !py-3 text-base"
          >
            <Gavel className="h-4 w-4" />
            Submit Verdict
          </button>
        </div>
      </div>

      {/* Confirmation modal — final step */}
      <Modal open={confirming} onClose={() => !busy && setConfirming(false)}>
        <div className="paper-sheet p-6 sm:p-8">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <div className="mono-label" style={{ color: "#6b5a26" }}>
                Court registry — final filing
              </div>
              <h3 className="display mt-1 text-xl text-[#241d10]">File this verdict?</h3>
            </div>
            <Stamp text="IRREVOCABLE" tone="blood" />
          </div>
          <div className="space-y-2 rounded-sm border border-[#8a7a55]/50 bg-[#cfc5a8]/40 p-4 font-mono text-[13px] text-[#332a1a]">
            <div>
              <span className="font-bold">ACCUSED:</span>{" "}
              {kase.suspects.find((s) => s.id === suspectId)?.name}
            </div>
            {caseFields.map(({ key, field }) => (
              <div key={key}>
                <span className="font-bold">{field.label.replace(/—.*$/, "").trim()}:</span>{" "}
                {field.options.find((o) => o.id === fields[key])?.label ?? "—"}
              </div>
            ))}
            <div>
              <span className="font-bold">EXHIBITS:</span> {evidenceIds.length} attached
            </div>
            <div className="pt-1 text-[12px] leading-relaxed">
              Filing closes your team's case and locks your score. Every team shares the room
              clock — the earlier the verdict, the higher the score.
            </div>
          </div>
          <div className="mt-5 flex flex-wrap justify-end gap-3">
            <button onClick={() => setConfirming(false)} disabled={busy} className="btn-ghost">
              Not yet
            </button>
            <button onClick={fire} disabled={busy} className="btn-gold">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gavel className="h-4 w-4" />}
              Confirm — Submit Verdict
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
