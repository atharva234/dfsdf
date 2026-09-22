import type { CaseData } from "./types";
import novatech from "./novatech";
import silentbleed from "./silentbleed";
import revenuemanip from "./revenuemanip";

export const CASES: Record<string, CaseData> = {
  novatech,
  silentbleed,
  revenuemanip,
};

export function getCaseData(caseId: string): CaseData | null {
  return CASES[caseId] ?? null;
}