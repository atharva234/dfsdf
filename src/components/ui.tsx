/**
 * Shared noir UI primitives: case header, countdown timer, typewriter,
 * modal shell, evidence stamps and icons.
 */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Mail,
  ScrollText,
  Network,
  Fax,
  FolderSearch,
  X,
  Copy,
  Check,
  Timer,
  Gavel,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/* ─────────────── Evidence icons ─────────────── */

export const KIND_ICON: Record<string, LucideIcon> = {
  "bank-statement": FileText,
  email: Mail,
  "trade-log": ScrollText,
  "org-chart": Network,
  fax: Fax,
  "audit-report": FolderSearch,
};

/* ─────────────── Typewriter ─────────────── */

export function Typewriter({
  lines,
  speed = 14,
  className,
}: {
  lines: string[];
  speed?: number;
  className?: string;
}) {
  const [visible, setVisible] = useState(0);
  const done = visible >= lines.length;

  useEffect(() => {
    if (done) return;
    const t = window.setTimeout(() => setVisible((v) => v + 1), speed * 30);
    return () => window.clearTimeout(t);
  }, [visible, done, speed]);

  return (
    <div className={className} aria-label={lines.join(" ")}>
      {lines.slice(0, visible + 1).map((line, i) => (
        <p key={i} className="mb-3 leading-relaxed">
          {line}
          {i === visible && !done ? (
            <span className="ml-0.5 inline-block h-4 w-2 animate-blink bg-gold align-middle" />
          ) : null}
        </p>
      ))}
    </div>
  );
}

/* ─────────────── Countdown ─────────────── */

export function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function Countdown({ endsAt, onExpire }: { endsAt: number; onExpire?: () => void }) {
  const [remaining, setRemaining] = useState(endsAt - Date.now());
  const expiredRef = useRef(false);

  useEffect(() => {
    const tick = () => {
      const left = endsAt - Date.now();
      setRemaining(left);
      if (left <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpire?.();
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [endsAt, onExpire]);

  const danger = remaining <= 10 * 60 * 1000;
  return (
    <div
      className={`flex items-center gap-2 rounded-md border px-3 py-1.5 font-mono text-lg font-semibold tabular-nums transition-colors ${
        danger
          ? "animate-pulseGlow border-blood/70 bg-blood-deep/30 text-red-300"
          : "border-gold/40 bg-ink-900/80 text-gold-soft"
      }`}
      title="Time remaining"
    >
      <Timer className="h-4 w-4" />
      {formatClock(remaining)}
    </div>
  );
}

/* ─────────────── Case header chrome ─────────────── */

export function CaseHeader({
  roomCode,
  teamName,
  evidenceCollected,
  evidenceTotal,
  hintsUsed,
  maxHints,
  endsAt,
  onExpire,
  onAccuse,
  onAbandon,
}: {
  roomCode: string;
  teamName: string;
  evidenceCollected: number;
  evidenceTotal: number;
  hintsUsed: number;
  maxHints: number;
  endsAt: number;
  onExpire?: () => void;
  onAccuse?: () => void;
  onAbandon?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard unavailable — non-fatal */
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-gold/15 bg-ink-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-md border border-gold/40 bg-ink-900">
            <Gavel className="h-4 w-4 text-gold" strokeWidth={1.75} />
          </span>
          <div className="leading-tight">
            <div className="mono-label">Case VL-1995-88888</div>
            <div className="display text-sm text-paper">The Vanishing Ledger</div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 md:flex">
            <span className="mono-label">Evidence</span>
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-ink-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold-deep to-gold-bright transition-all duration-500"
                style={{ width: `${(evidenceCollected / Math.max(1, evidenceTotal)) * 100}%` }}
              />
            </div>
            <span className="font-mono text-xs text-gold-soft">
              {evidenceCollected}/{evidenceTotal}
            </span>
          </div>

          <button
            onClick={copy}
            className="group hidden items-center gap-2 rounded-md border border-ink-500 bg-ink-900/70 px-2.5 py-1.5 font-mono text-sm text-paper-dim transition-colors hover:border-gold/50 hover:text-gold-soft sm:flex"
            title="Copy room code"
          >
            <Users className="h-3.5 w-3.5 text-gold/70" />
            <span className="tracking-[0.2em]">{roomCode}</span>
            {copied ? (
              <Check className="h-3.5 w-3.5 text-verdigris" />
            ) : (
              <Copy className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-60" />
            )}
          </button>

          <div className="hidden font-mono text-xs text-paper-dim lg:block">{teamName}</div>

          <Countdown endsAt={endsAt} onExpire={onExpire} />

          {onAccuse && (
            <button onClick={onAccuse} className="btn-gold !px-3.5 !py-1.5 text-sm">
              <Gavel className="h-4 w-4" />
              Accuse
            </button>
          )}
          {onAbandon && (
            <button
              onClick={onAbandon}
              className="rounded-md border border-ink-500/60 px-2 py-1.5 text-xs text-paper-dim transition-colors hover:border-blood/60 hover:text-red-300"
              title="Leave the case"
            >
              Leave
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

/* ─────────────── Modal shell ─────────────── */

export function Modal({
  open,
  onClose,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-40 grid place-items-center overflow-y-auto bg-ink-950/80 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
        >
          <motion.div
            className={`w-full ${wide ? "max-w-3xl" : "max-w-xl"}`}
            initial={{ opacity: 0, y: 24, scale: 0.97, rotate: -0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─────────────── Rubber stamp ─────────────── */

export function Stamp({ text, tone = "gold" }: { text: string; tone?: "gold" | "blood" | "verdigris" }) {
  const toneCls =
    tone === "blood"
      ? "border-blood/70 text-blood"
      : tone === "verdigris"
        ? "border-verdigris/70 text-verdigris"
        : "border-gold-deep/80 text-gold-deep";
  return (
    <span
      className={`inline-block -rotate-3 rounded border-2 px-2 py-0.5 font-stamp text-[10px] uppercase tracking-[0.2em] opacity-80 ${toneCls}`}
    >
      {text}
    </span>
  );
}

export function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      onClick={onClose}
      className="rounded-md border border-ink-500/70 bg-ink-900/70 p-1.5 text-paper-dim transition-colors hover:border-gold/50 hover:text-gold-soft"
      aria-label="Close"
    >
      <X className="h-4 w-4" />
    </button>
  );
}

/* ─────────────── Small helpers ─────────────── */

export function SectionTitle({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mb-6">
      <div className="mono-label mb-1">{kicker}</div>
      <h2 className="display text-2xl text-paper sm:text-3xl">{title}</h2>
    </div>
  );
}
