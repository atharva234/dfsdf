/**
 * Case-file data model. Every case in the rotation is authored as a `GameCase`
 * — briefing, suspects, evidence exhibits, hints, solution and verdict fields —
 * so the same five screens (brief → dashboard → accusation → results) render
 * any case the server deals a team.
 */

export type EvidenceKind =
  | "bank-statement"
  | "email"
  | "trade-log"
  | "org-chart"
  | "fax"
  | "audit-report"
  | "vendor-profile"
  | "po-invoice"
  | "directory"
  | "ledger"
  | "comm-log";

/** A single styled line inside a scanned/digital document modal. */
export type EvidenceLine =
  | { t: "kv"; k: string; v: string }
  | { t: "mono"; v: string }
  | { t: "p"; v: string }
  | { t: "sign"; v: string }
  | { t: "stamp"; v: string }
  | { t: "hl"; v: string }
  | { t: "divider" };

export type EvidenceDoc = {
  id: string;
  title: string;
  kind: EvidenceKind;
  /** Corkboard category — the evidence board renders one filter chip per group. */
  group: string;
  date: string;
  source: string;
  size: string;
  excerpt: string;
  lines: EvidenceLine[];
};

export type Suspect = {
  id: string;
  name: string;
  role: string;
  location: string;
  age: number;
  motive: string;
  transcript: { q: string; a: string }[];
  tell: string;
};

export type Hint = { id: string; cost: number; text: string };

export type Choice = { id: string; label: string };

/** Extra verdict fields a case can demand (e.g. "which vendor", impact band). */
export type VerdictField = {
  label: string;
  placeholder: string;
  options: Choice[];
  /** The scored option id — revealed on the Results screen. */
  answerId?: string;
};

export type GameCase = {
  id: string;
  caseNo: string;
  title: string;
  company: string;
  /** e.g. "Consumer Electronics Manufacturing" — optional dossier line. */
  industry?: string;
  place: string;
  period: string;
  difficulty: string;
  /** Suggested pacing in minutes — the room clock itself is server-configured. */
  minutes: number;
  /** Optional YouTube id for the briefing film; when absent the briefing falls back to the dossier panel. */
  videoId?: string;
  narrative: string[];
  /** Accusation-screen copy, tuned per case. */
  accusationPrompt: string;
  methodPlaceholder: string;
  suspects: Suspect[];
  evidence: EvidenceDoc[];
  hints: Hint[];
  solution: { headline: string; points: string[] };
  culpritName: string;
  keyExhibitIds: string[];
  /** Screen footer — provenance of the fictionalized case. */
  footnote: string;
  verdict: {
    vendor?: VerdictField;
    impact?: VerdictField;
  };
};
