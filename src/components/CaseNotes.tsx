/**
 * Case Notes — shared sticky-note wall for team deductions, backed by Convex
 * so every player on the shared screen sees the same notes live.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StickyNote, Trash2 } from "lucide-react";
import type { Id } from "../../convex/_generated/dataModel";
import { api } from "../../convex/_generated/api";
import { useMutation } from "convex/react";

export type Note = {
  _id: Id<"notes">;
  author: string;
  body: string;
  createdAt: number;
};

const NOTE_TONES = [
  "linear-gradient(178deg,#efd98a,#e3c96e)",
  "linear-gradient(178deg,#cfe3d2,#b9d4bd)",
  "linear-gradient(178deg,#e8c8c2,#d9ada6)",
  "linear-gradient(178deg,#c9d4e8,#aab9d6)",
];

export function CaseNotes({
  gameId,
  notes,
  teamName,
}: {
  gameId: Id<"games">;
  notes: Note[];
  teamName: string;
}) {
  const [draft, setDraft] = useState("");
  const addNote = useMutation(api.game.addNote);
  const removeNote = useMutation(api.game.removeNote);
  const [pending, setPending] = useState(false);

  const submit = async () => {
    if (!draft.trim() || pending) return;
    setPending(true);
    try {
      await addNote({ gameId, author: teamName, body: draft });
      setDraft("");
    } finally {
      setPending(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="mono-label">Shared workspace — visible to all {teamName} players</div>
          <h3 className="display text-lg text-paper">Case Notes</h3>
        </div>
        <StickyNote className="h-4 w-4 text-gold/70" />
      </div>

      <div className="mb-5 flex gap-2">
        <input
          className="input-noir flex-1"
          placeholder="Jot a deduction… e.g. '88888 → personal account 88888888?'"
          value={draft}
          maxLength={280}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <button onClick={submit} disabled={!draft.trim() || pending} className="btn-gold">
          Pin it
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="rounded-lg border border-dashed border-ink-500/70 p-8 text-center">
          <StickyNote className="mx-auto mb-3 h-8 w-8 text-paper-dim/40" />
          <p className="text-sm text-paper-dim/70">
            No notes yet. Everything you pin here is shared with the whole team in real time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence initial={false}>
            {notes.map((note, i) => (
              <motion.div
                key={note._id}
                layout
                initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                animate={{ opacity: 1, scale: 1, rotate: ((i * 53) % 5) - 2 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="sticky-note group relative p-4 pb-8"
                style={{ background: NOTE_TONES[i % NOTE_TONES.length] }}
              >
                <button
                  onClick={() => removeNote({ noteId: note._id })}
                  className="absolute right-2 top-2 rounded p-1 text-black/30 opacity-0 transition-opacity hover:bg-black/10 hover:text-black/70 group-hover:opacity-100"
                  aria-label="Remove note"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <p className="whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed">
                  {note.body}
                </p>
                <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between font-mono text-[10px] text-black/45">
                  <span className="truncate">{note.author}</span>
                  <span>
                    {new Date(note.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
