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
