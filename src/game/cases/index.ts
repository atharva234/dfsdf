/**
 * Case registry — the event's case rotation.
 *
 * Every case is authored as a `GameCase` dossier and code-split into its own
 * chunk: a team only downloads the case it was dealt. `getCase(id)` and the
 * `useCase` hook are the single source of truth the UI reads; the Convex
 * backend independently maps caseId → answer key for scoring (the answer
 * keys below exist only so the server and client never drift apart).
 */

import { useEffect, useSyncExternalStore } from "react";
import type { GameCase } from "./types";

export type CaseId = "vanishing-ledger" | "nova-tech" | "greenleaf-049";

export const CASE_IDS: CaseId[] = ["vanishing-ledger", "nova-tech", "greenleaf-049"];

/* Each dossier is a dynamic import so a team downloads only its own case. */
const LOADERS: Record<CaseId, () => Promise<GameCase>> = {
  "vanishing-ledger": () => import("./case-vanishing").then((m) => m.VANISHING_LEDGER),
  "nova-tech": () => import("./case-novatech").then((m) => m.NOVATECH),
  "greenleaf-049": () => import("./case-greenleaf").then((m) => m.GREENLEAF),
};

/* Micro-cache so navigating between tabs doesn't re-import. */
const cache = new Map<CaseId, GameCase>();
const failures = new Map<CaseId, unknown>();

type CaseState = {
  loading: CaseId | null;
  ready: Partial<Record<CaseId, GameCase>>;
};

let state: CaseState = { loading: null, ready: {} };
const listeners = new Set<() => void>();

function emit() {
  state = { ...state };
  for (const l of listeners) l();
}

/** Kick off loading for a case id (idempotent). Returns a promise. */
export function loadCase(id: CaseId): Promise<GameCase> {
  const cached = cache.get(id);
  if (cached) return Promise.resolve(cached);
  state.loading = id;
  emit();
  return LOADERS[id]()
    .then((c) => {
      cache.set(id, c);
      failures.delete(id);
      state.ready[id] = c;
      state.loading = null;
      emit();
      return c;
    })
    .catch((err) => {
      failures.set(id, err);
      state.loading = null;
      emit();
      throw err;
    });
}

export function getCaseSync(id: CaseId): GameCase | undefined {
  return cache.get(id) ?? state.ready[id];
}

/** React hook — resolves the team's assigned case, surviving re-renders. */
export function useCase(caseId: CaseId | null | undefined): GameCase | null {
  const snapshot = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
  );

  // Kick the (idempotent) load from an effect, never during render.
  useEffect(() => {
    if (caseId) void loadCase(caseId);
  }, [caseId]);

  if (!caseId) return null;
  return cache.get(caseId) ?? snapshot.ready[caseId] ?? null;
}

/** Pick the case a team is dealt — uniform at random over the rotation. */
export function dealRandomCase(): CaseId {
  return CASE_IDS[Math.floor(Math.random() * CASE_IDS.length)];
}
