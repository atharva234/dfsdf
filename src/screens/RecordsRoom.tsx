/**
 * Records Room — a single search terminal. The team types a term; the
 * server checks it against the current case's keyword unlocks and returns
 * any matching documents, which are appended to the team's case board.
 * Most searches find nothing — that is the point.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FileQuestion, ScanSearch, FolderX } from "lucide-react";
import type { GameCase } from "../game/cases/types";
import { Stamp } from "../components/ui";

export function RecordsRoom({
  kase,
  onSearch,
}: {
  kase: GameCase;
  onSearch: (term: string) => Promise<string[]>;
}) {
  const [term, setTerm] = useState("");
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<string[] | null>(null);
  const [searched, setSearched] = useState<string | null>(null);

  const run = async () => {
    const q = term.trim();
    if (!q || busy) return;
    setBusy(true);
    try {
      const matches = await onSearch(q);
      setResults(matches);
      setSearched(q);
    } finally {
      setBusy(false);
    }
  };

  const foundDocs = (results ?? [])
    .map((id) => kase.evidence.find((e) => e.id === id))
    .filter((d): d is NonNullable<typeof d> => !!d);

  return (
    <div>
      <div className="mb-5">
        <div className="mono-label">Stage 02 — pull the records</div>
        <h2 className="display text-2xl text-paper">Records Room</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-paper-dim">
          One terminal, the bank's archives, and whatever references you've gathered. Type an
          account number, a year, a name. Files that exist surface here — and land on your case
          board. Files that don't, don't.
        </p>
      </div>

      <div className="panel-edge scanlines p-5 sm:p-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/60" />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && run()}
              placeholder="Query the archive — e.g. an account number…"
              className="input-noir w-full pl-9 font-mono text-sm tracking-wide"
              aria-label="Archive search"
              autoFocus
            />
          </div>
          <button onClick={run} disabled={!term.trim() || busy} className="btn-gold">
            <ScanSearch className="h-4 w-4" />
            {busy ? "Searching…" : "Run query"}
          </button>
        </div>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-paper-dim/50">
          archive.meridian.local · forensic image · read-only
        </p>
      </div>

      <AnimatePresence mode="wait">
        {searched && foundDocs.length > 0 && (
          <motion.div
            key={`${searched}-hit`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6"
          >
            <div className="mb-3 flex items-center gap-2">
              <Stamp text={`${foundDocs.length} record${foundDocs.length > 1 ? "s" : ""} found`} tone="verdigris" />
              <span className="font-mono text-[11px] text-paper-dim/60">
                for “{searched}” — added to your case board
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {foundDocs.map((doc, i) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, rotate: i % 2 ? 1 : -1 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  className="panel-edge flex items-center gap-3 p-4"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-gold/50 bg-gold/15 text-gold">
                    <ScanSearch className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="display truncate text-sm text-paper">{doc.title}</div>
                    <div className="mono-label mt-0.5">
                      {doc.kind.replace("-", " ")} · {doc.date}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {searched && foundDocs.length === 0 && (
          <motion.div
            key={`${searched}-miss`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6"
          >
            <div className="panel flex flex-col items-center p-8 text-center">
              {results === null ? (
                <FolderX className="mb-3 h-8 w-8 text-paper-dim/40" />
              ) : (
                <FileQuestion className="mb-3 h-8 w-8 text-paper-dim/40" />
              )}
              <div className="display text-base text-paper">No records found</div>
              <p className="mt-1 max-w-sm text-sm leading-relaxed text-paper-dim/75">
                The archive returns nothing for “{searched}”. Either nothing is filed under that
                reference — or you haven't found the right one yet. Leads come from the scene and
                the interviews.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
