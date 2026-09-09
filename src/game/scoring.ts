/**
 * Scoring model for The Vanishing Ledger.
 * Teams start at 5,000 points. Clues cost nothing; hints and mistakes cost.
 */

export const START_SCORE = 5000;
export const VERDICT_BONUS = 2000;
export const TIME_BONUS_MAX = 3000;
export const WRONG_VERDICT_PENALTY = 1000;
export const VOTE_COST = 100; // each accusation attempt beyond the first

export function timeBonusFrom(remainingMs: number, totalMs: number): number {
  const frac = Math.max(0, Math.min(1, remainingMs / totalMs));
  return Math.round(frac * TIME_BONUS_MAX);
}

export function finalScore(opts: {
  start: number;
  hintsUsed: number;
  hintCosts: number[]; // cost of each hint revealed, in order
  wrongVotes: number;
  won: boolean;
  remainingMs: number;
  totalMs: number;
}): number {
  const hintsSpent = opts.hintCosts.reduce((a, b) => a + b, 0);
  const votesSpent = opts.wrongVotes * VOTE_COST;
  const base = opts.start - hintsSpent - votesSpent;
  if (!opts.won) return Math.max(0, base);
  const tb = timeBonusFrom(opts.remainingMs, opts.totalMs);
  return Math.max(0, base + VERDICT_BONUS + tb);
}

export function rankFor(score: number, solved: boolean): string {
  if (!solved) return score >= 3500 ? "Inspector" : "Cadet";
  if (score >= 8000) return "Chief Forensic Auditor";
  if (score >= 6500) return "Senior Investigator";
  if (score >= 5000) return "Investigator";
  return "Junior Analyst";
}
