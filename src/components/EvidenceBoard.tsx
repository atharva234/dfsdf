/**
 * Evidence primitives — the scanned-document modal and the pinned exhibit
 * card. The boards that render them (CaseBoard) only ever receive exhibits
 * the team has actually discovered; nothing appears by default.
 */

import { motion } from "framer-motion";
import { Check, FileText } from "lucide-react";
import type { EvidenceDoc, EvidenceLine } from "../game/cases/types";
import { KIND_ICON, Modal, Stamp, CloseButton } from "./ui";

function DocLine({ line }: { line: EvidenceLine }) {
  switch (line.t) {
    case "kv":
      return (
        <div className="mb-1 flex flex-wrap gap-x-2 text-[13px]">
          <span className="font-mono font-bold tracking-wide text-[#5c4a1e]">{line.k}:</span>
          <span className="font-mono text-[#2b2416]">{line.v}</span>
        </div>
      );
    case "mono":
      return (
        <div className="mb-0.5 whitespace-pre font-mono text-[12.5px] text-[#3a3122]">
          {line.v}
        </div>
      );
    case "p":
      return <p className="mb-2 text-[13.5px] leading-relaxed text-[#332a1a]">{line.v}</p>;
    case "sign":
      return (
        <p className="mb-2 mt-3 font-stamp text-[13px] text-[#4a3c1a]">— {line.v}</p>
      );
    case "stamp":
      return (
        <div className="mt-4 flex justify-end">
          <Stamp text={line.v} tone="blood" />
        </div>
      );
    case "hl":
      return (
        <p className="mb-2 rounded-sm border-l-2 border-gold-deep bg-gold-faint/60 px-2 py-1 font-mono text-[12.5px] font-semibold text-[#4a3a12]">
          {line.v}
        </p>
      );
    case "divider":
      return <hr className="my-3 border-t border-[#8a7a55]/50" />;
  }
}

function DocumentModal({
  doc,
  onClose,
}: {
  doc: EvidenceDoc | null;
  onClose: () => void;
}) {
  const Icon = doc ? KIND_ICON[doc.kind] : FileText;
  return (
    <Modal open={!!doc} onClose={onClose} wide>
      {doc && (
        <div className="paper-sheet max-h-[85vh] overflow-y-auto p-6 sm:p-8">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <div className="mono-label" style={{ color: "#6b5a26" }}>
                {doc.kind.toUpperCase()} · {doc.date}
              </div>
              <h3 className="display mt-1 text-xl text-[#241d10]">{doc.title}</h3>
              <div className="mt-1 font-mono text-[11px] text-[#6b5a26]">{doc.source}</div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="grid h-9 w-9 place-items-center rounded-md border border-[#8a7a55]/60 bg-[#c9bd9e]/60"
                title={doc.kind}
              >
                <Icon className="h-4 w-4 text-[#5c4a1e]" />
              </span>
              <CloseButton onClose={onClose} />
            </div>
          </div>
          <div className="border-t border-[#8a7a55]/50 pt-4">
            {doc.lines.map((line, i) => (
              <DocLine key={i} line={line} />
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-[#8a7a55]/40 pt-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6b5a26]">
              Exhibit {doc.id.replace("ev-", "").toUpperCase()} · {doc.size}
            </span>
            <Stamp text="LOGGED AS EVIDENCE" tone="verdigris" />
          </div>
        </div>
      )}
    </Modal>
  );
}

/** One pinned exhibit card. `state`: found-but-unreviewed vs logged. */
export function EvidenceCard({
  doc,
  viewed,
  index,
  onOpen,
}: {
  doc: EvidenceDoc;
  viewed: boolean;
  index: number;
  onOpen: (doc: EvidenceDoc) => void;
}) {
  const Icon = KIND_ICON[doc.kind];
  const rotation = ((index * 37) % 7) - 3; // deterministic scatter: -3..3 deg
  return (
    <motion.button
      onClick={() => onOpen(doc)}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      whileHover={{ rotate: 0, scale: 1.02, zIndex: 5 }}
      style={{ rotate: rotation }}
      className={`group relative rounded-md border p-4 text-left shadow-pin transition-colors ${
        viewed
          ? "border-gold/60 bg-ink-800/90 shadow-gold-glow"
          : "border-ink-600/70 bg-ink-850/90 hover:border-gold/40"
      }`}
    >
      {/* pushpin */}
      <span
        className={`absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full border shadow ${
          viewed ? "border-gold-bright bg-gold" : "border-ink-500 bg-ink-600"
        }`}
      />
      <div className="mb-3 flex items-center justify-between">
        <span
          className={`grid h-9 w-9 place-items-center rounded-md border ${
            viewed
              ? "border-gold/50 bg-gold/15 text-gold-soft"
              : "border-ink-500 bg-ink-800 text-paper-dim group-hover:text-gold-soft"
          }`}
        >
          <Icon className="h-4 w-4" />
        </span>
        {viewed ? (
          <span className="flex items-center gap-1 rounded-full border border-verdigris/60 bg-verdigris/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-verdigris">
            <Check className="h-3 w-3" /> collected
          </span>
        ) : (
          <span className="font-mono text-[10px] uppercase tracking-wider text-paper-dim/50">
            new
          </span>
        )}
      </div>
      <div className="mono-label mb-1">{doc.kind.replace("-", " ")} · {doc.group}</div>
      <div className="display text-[15px] leading-snug text-paper group-hover:text-gold-soft">
        {doc.title}
      </div>
      <div className="mt-2 line-clamp-2 text-xs leading-relaxed text-paper-dim/80">
        {doc.excerpt}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-ink-600/60 pt-2 font-mono text-[10px] text-paper-dim/60">
        <span>{doc.date}</span>
        <span>{doc.size}</span>
      </div>
    </motion.button>
  );
}

export { DocumentModal };
