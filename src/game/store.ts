/**
 * Client-side game session state.
 * Server (Convex) owns rooms/teams/scores; this store tracks the local
 * investigation progress (collected evidence, revealed hints) and session ids.
 */

import { useSyncExternalStore } from "react";

export type Session = {
  gameId: string;
  teamId: string;
  roomCode: string;
  teamName: string;
  playerCount: number;
  /** The case this team was dealt — assigned server-side at join time. */
  caseId: string | null;
  screen: "briefing" | "dashboard" | "accusation" | "results";
};

type ProgressState = {
  collected: string[];
  hints: string[];
  session: Session | null;
};

const KEY = "vanishing-ledger-session-v1";

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ProgressState>;
      return {
        collected: parsed.collected ?? [],
        hints: parsed.hints ?? [],
        session: parsed.session ?? null,
      };
    }
  } catch {
    /* corrupted storage — start fresh */
  }
  return { collected: [], hints: [], session: null };
}

let state: ProgressState = load();
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full/blocked — state stays in memory */
  }
}

export function setSession(s: Session | null) {
  state = { ...state, session: s };
  if (!s) {
    // Starting a new session resets investigation progress.
    state = { collected: [], hints: [], session: null };
  }
  persist();
  emit();
}

export function collectEvidence(id: string) {
  if (state.collected.includes(id)) return;
  state = { ...state, collected: [...state.collected, id] };
  persist();
  emit();
}

export function revealHint(id: string) {
  if (state.hints.includes(id)) return;
  state = { ...state, hints: [...state.hints, id] };
  persist();
  emit();
}

export function resetProgress() {
  state = { collected: [], hints: [], session: null };
  persist();
  emit();
}

export function useGameStore() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
  );
}
