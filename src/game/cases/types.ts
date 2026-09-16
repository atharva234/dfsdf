/**
 * Case-file data model. Every case in the rotation is authored as a `GameCase`
 * — briefing, suspects, evidence exhibits, hints, solution and verdict fields —
 * so the same screens (brief → crime scene → records/interrogation → forensics
 * lab → accusation → results) render any case the server deals a team.
 *
 * Nothing appears by default: every exhibit and clue enters the team's
 * possession only through a hotspot, search, or interview — see EvidenceUnlock.
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

/**
 * How an exhibit or clue enters the team's possession. `free` items sit out in
 * the open (scene hotspots, desk trays); everything else must be earned —
 * via a clue (a discovered number/lead), a keyword search in the Records
 * Room, or by interviewing a suspect.
 */
export type EvidenceUnlock =
  | { type: "free" }
  | { type: "clue"; requires: string }
  | { type: "keyword"; keywords: string[] }
  | { type: "suspectAsked"; suspectId: string };

/**
 * A follow-up interview question is only offered once its gating evidence is
 * on the team's board (all listed exhibits must be discovered).
 */
export type QuestionUnlock = { type: "evidence"; requires: string[] };

export type Suspect = {
  id: string;
  name: string;
  role: string;
  location: string;
  age: number;
  motive: string;
  transcript: { q: string; a: string; unlock?: QuestionUnlock }[];
  tell: string;
};

/** Lightweight discoverable token — a lead the team carries between stages. */
export type Clue = { id: string; text: string };

/** A clickable zone on the Crime Scene stage. */
export type Hotspot = {
  id: string;
  label: string;
  reveals: { kind: "evidence" | "clue"; id: string };
  /**
   * When set, the hotspot stays locked until the gating clue is discovered —
   * and then demands the exact code typed into its entry field.
   */
  locked?: { requiresClue: string; combination: string };
};

/** The Forensics Lab gate — solved before the team may file a verdict. */
export type Puzzle = {
  prompt: string;
  answer: string;
  toleranceHint: string;
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
  /** How each exhibit is found — defaults handled in-game as free. */
  unlocks: Record<string, EvidenceUnlock>;
  /** Discoverable leads carried between stages (scene → records/interrogation). */
  clues: Clue[];
  /** Crime Scene stage zones. */
  hotspots: Hotspot[];
  /** Forensics Lab gate. */
  puzzle: Puzzle;
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
