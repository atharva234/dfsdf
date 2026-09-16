/**
 * Per-case answer keys — evaluated on the server only.
 *
 * Each entry is keyed by the case id a team was dealt. `submitVerdict` scores
 * strictly against the key for the team's assigned `caseId`, so a verdict
 * meant for one case can never be graded against another.
 */

export type CaseAnswerKey = {
  suspectId: string;
  evidenceIds: string[];
  /** Scored option ids for the case's extra verdict fields (vendor/impact). */
  fieldAnswers: Record<string, string>;
};

/**
 * Records-Room keyword index: typed term → evidence ids pulled into the
 * team's board. Mirrors the `unlocks` blocks in each case dossier; kept
 * server-side so search results are computed where the answer keys live.
 */
export const KEYWORD_INDEX: Record<
  string,
  { terms: Map<string, string[]> }
> = {
  "vanishing-ledger": {
    terms: new Map<string, string[]>([
      ["88888888", ["ev-fax-remittance", "ev-email-meridian"]],
      ["88888", ["ev-fax-remittance", "ev-email-meridian"]],
      ["1762", ["ev-redherring-coc"]],
      ["charter", ["ev-redherring-coc"]],
      ["incorporation", ["ev-redherring-coc"]],
      // The crumpled-memo lead names Finding 88-B — chasing it in the
      // archive pulls the org chart that shows the reporting failure.
      ["88-b", ["ev-orgchart"]],
      ["88b", ["ev-orgchart"]],
      ["segregation", ["ev-orgchart"]],
      ["audit", ["ev-orgchart"]],
    ]),
  },
  // Full chains come later; these cases have no keyword-gated evidence yet.
  "nova-tech": { terms: new Map([]) },
  "greenleaf-049": { terms: new Map([]) },
};

/** Forensics-Lab gate answers, keyed by case id (normalized on compare). */
export const PUZZLE_ANSWERS: Record<string, string> = {
  "vanishing-ledger": "226",
  "nova-tech": "0", // placeholder until the chain is authored
  "greenleaf-049": "0", // placeholder until the chain is authored
};

export const ANSWER_KEYS: Record<string, CaseAnswerKey> = {
  "vanishing-ledger": {
    suspectId: "alex-hayes",
    evidenceIds: ["ev-statement-88888", "ev-email-meridian", "ev-erroraccount-88"],
    fieldAnswers: {},
  },
  "nova-tech": {
    suspectId: "sahil-mehta",
    evidenceIds: ["ev-nv-doc-c", "ev-nv-doc-d", "ev-nv-audit-log"],
    fieldAnswers: {
      vendor: "v002",
      impact: "b",
    },
  },
  "greenleaf-049": {
    suspectId: "sanjay-gupta",
    evidenceIds: ["ev-gl-journals", "ev-gl-crm", "ev-gl-aging"],
    fieldAnswers: {
      impact: "f",
    },
  },
};
