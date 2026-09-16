/**
 * The Vanishing Ledger — app shell.
 * Landing page → Lobby → Briefing → Investigation Dashboard → Accusation →
 * Results. Room/team state lives in Convex; investigation progress is local.
 */

import { Suspense, lazy, useEffect, useState } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "convex/react";
import {
  Gavel,
  FolderSearch,
  Users,
  StickyNote,
  Play,
  Building2,
  Landmark,
  Timer,
  Scale,
  Search,
  FileText,
  ArrowRight,
} from "lucide-react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import { useGameStore, setSession, resetProgress, collectEvidence } from "./game/store";
import { useCase } from "./game/cases";
import type { CaseId } from "./game/cases";
import type { Stage } from "./screens/Dashboard";
import type { VerdictResult } from "./screens/Accusation";

/* Investigation stages that render inside the Dashboard shell, in chained
   order: scene → records → interrogation → puzzle → caseboard → accusation. */
const STAGE_SCREENS = new Set(["scene", "records", "interrogation", "puzzle", "caseboard"]);

/* Screens are code-split: the landing page and lobby load on a minimal core
   bundle, and each phase of the game pulls its own chunk on first navigation —
   friendlier for 30 teams on weak venue wifi. */
const Lobby = lazy(() =>
  import("./screens/Lobby").then((m) => ({ default: m.Lobby })),
);
const Briefing = lazy(() =>
  import("./screens/Briefing").then((m) => ({ default: m.Briefing })),
);
const Dashboard = lazy(() =>
  import("./screens/Dashboard").then((m) => ({ default: m.Dashboard })),
);
const Accusation = lazy(() =>
  import("./screens/Accusation").then((m) => ({ default: m.Accusation })),
);
const Results = lazy(() =>
  import("./screens/Results").then((m) => ({ default: m.Results })),
);

/* ─────────────────────────── Landing page ─────────────────────────── */

function Landing({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-30 border-b border-gold/10 bg-ink-950/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <span className="grid h-8 w-8 place-items-center rounded-md border border-gold/40 bg-ink-900">
            <Gavel className="h-4 w-4 text-gold" />
          </span>
          <span className="display text-sm tracking-wide text-paper">The Vanishing Ledger</span>
          <span className="mono-label ml-2 hidden sm:block">Financial Crime Files</span>
          <button onClick={onStart} className="btn-gold ml-auto !px-4 !py-1.5 text-sm">
            Start the Case
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-[-240px] h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-gold/10 blur-[120px]" />
          <div className="absolute bottom-[-180px] right-[-120px] h-[380px] w-[380px] rounded-full bg-verdigris/10 blur-[110px]" />
        </div>

        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-16 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:pt-24">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mono-label mb-4 flex items-center gap-2"
            >
              <span className="inline-block h-px w-8 bg-gold/60" />
              A collaborative financial-crime investigation
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="display text-4xl leading-[1.05] text-paper sm:text-6xl"
            >
              One room.
              <br />
              Three case files.
              <br />
              <span className="gold-glow-text text-gold-soft">One fraud</span>
              <br />
              per team.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="mt-5 max-w-xl text-base leading-relaxed text-paper-dim"
            >
              Three financial-crime cases modeled on real frauds. One live event room. Your team of
              up to four detectives is dealt one case at random — a collapsing merchant bank, a
              procurement scheme in Pune, a revenue mill that never collected a rupee — and must
              name the perpetrator before the clock runs out.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
              className="mt-7 flex flex-wrap items-center gap-4"
            >
              <button onClick={onStart} className="btn-gold !px-6 !py-3 text-base">
                <Play className="h-4 w-4" />
                Start the Case
              </button>
              <a href="#how" className="btn-ghost">
                How it works
                <ArrowRight className="h-4 w-4" />
              </a>
            </motion.div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.18em] text-paper-dim/60">
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-gold/70" /> Teams of 1–4
              </span>
              <span className="flex items-center gap-1.5">
                <Timer className="h-3.5 w-3.5 text-gold/70" /> 60-minute clock
              </span>
              <span className="flex items-center gap-1.5">
                <Landmark className="h-3.5 w-3.5 text-gold/70" /> 30 teams per room
              </span>
            </div>
          </div>

          {/* Case-file stack visual */}
          <motion.div
            initial={{ opacity: 0, rotate: 4, y: 30 }}
            animate={{ opacity: 1, rotate: 0, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="relative mx-auto hidden w-full max-w-sm lg:block"
            aria-hidden
          >
            <div className="paper-sheet absolute inset-x-6 top-10 rotate-[4deg] p-5 opacity-90">
              <div className="mono-label" style={{ color: "#6b5a26" }}>
                Exhibit C — revised purchase order
              </div>
              <div className="mt-2 font-mono text-[12px] leading-relaxed text-[#3a3122]">
                PO-2571-R1 · QTY 2,000 → 2,400
                <br />
                VALUE: ₹44,40,000.00
                <br />
                APPROVAL ROUTING: NOT FOUND
              </div>
            </div>
            <div className="paper-sheet relative rotate-[-2deg] p-6">
              <div className="mono-label" style={{ color: "#6b5a26" }}>
                Case rotation — dealt at random
              </div>
              <div className="mt-3 space-y-2 font-mono text-[12px] text-[#3a3122]">
                <div>01 — THE VANISHING LEDGER · merchant bank, 1995</div>
                <div>02 — THE NOVA-TECH FILE · procurement fraud, Pune</div>
                <div>03 — THE REVENUE SCHEME · fictitious customers</div>
              </div>
              <div className="mt-4 flex justify-between">
                <span className="font-stamp text-[11px] uppercase tracking-[0.2em] text-blood-deep opacity-80">
                  classified
                </span>
                <span className="font-stamp text-[11px] uppercase tracking-[0.2em] text-verdigris opacity-80">
                  6 suspects
                </span>
              </div>
            </div>
            <div className="absolute -bottom-5 -right-2 rotate-6">
              <span className="inline-block rounded border-2 border-blood/80 px-3 py-1 font-stamp text-sm uppercase tracking-[0.25em] text-blood shadow-pin">
                top secret
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stat strip */}
      <section className="border-y border-ink-600/50 bg-ink-900/50">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 md:grid-cols-4">
          {[
            { n: "3", label: "Cases in the rotation" },
            { n: "1 of 3", label: "Dealt at random per team" },
            { n: "13–18", label: "Exhibits per case file" },
            { n: "30", label: "Teams per event room" },
          ].map((s) => (
            <div key={s.label}>
              <div className="font-mono text-2xl font-bold text-gold-soft sm:text-3xl">{s.n}</div>
              <div className="mono-label mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mono-label mb-1">The drill</div>
        <h2 className="display mb-8 text-2xl text-paper sm:text-3xl">
          From briefing to verdict in four moves
        </h2>
        <div className="grid gap-4 md:grid-cols-4">
          {[
            {
              icon: Users,
              t: "Assemble the unit",
              d: "Name your team, take a seat at one shared screen, and enter the event room code.",
            },              {
                icon: FileText,
                t: "Get your case",
                d: "The server deals your team one of three cases at random. Read the briefing, learn the rules of the file.",
              },              {
                icon: Search,
                t: "Work the evidence",
                d: "Up to 18 exhibits, up to 6 suspects, one shared notepad. Hints cost points — spend carefully.",
              },
            {
              icon: Scale,
              t: "File the verdict",
              d: "Name the culprit, describe the mechanism, cite your exhibits. Filing locks your score.",
            },
          ].map((step, i) => (
            <motion.div
              key={step.t}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.07 }}
              className="panel-edge p-5"
            >
              <span className="mb-3 grid h-9 w-9 place-items-center rounded-md border border-gold/40 bg-ink-900">
                <step.icon className="h-4 w-4 text-gold" />
              </span>
              <div className="mono-label mb-1">Step {String(i + 1).padStart(2, "0")}</div>
              <div className="display mb-1.5 text-base text-paper">{step.t}</div>
              <p className="text-[13px] leading-relaxed text-paper-dim/85">{step.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Screen tour */}
      <section className="border-t border-ink-600/50 bg-ink-900/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mono-label mb-1">Inside the case file</div>
          <h2 className="display mb-8 text-2xl text-paper sm:text-3xl">Your investigation desk</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: FolderSearch,
                t: "Evidence Board",
                d: "A corkboard of pinned exhibits — statements, intercepted email, trade logs, org charts. Every document opens as a scanned record; everything you review stays collected.",
              },
              {
                icon: Users,
                t: "Suspects Panel",
                d: "Four profile cards with motives and field notes. Expand one and the interview transcript types itself out, line by line.",
              },
              {
                icon: StickyNote,
                t: "Case Notes",
                d: "A shared sticky wall for the team's deductions, pinned live for everyone at the screen.",
              },
              {
                icon: Gavel,
                t: "The Accusation",
                d: "One suspect, one mechanism, your exhibits. Confirm twice — the verdict is final and the whole room sees the leaderboard.",
              },
            ].map((f, i) => (
              <motion.div
                key={f.t}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.06 }}
                className="panel flex items-start gap-4 p-5"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-gold/30 bg-ink-900">
                  <f.icon className="h-5 w-5 text-gold" />
                </span>
                <div>
                  <div className="display text-base text-paper">{f.t}</div>
                  <p className="mt-1 text-[13px] leading-relaxed text-paper-dim/85">{f.d}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Event CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="panel-edge relative overflow-hidden p-7 sm:p-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
          <div className="relative flex flex-wrap items-center gap-6">
            <div className="min-w-0 flex-1">
              <div className="mono-label mb-1">For event hosts</div>
              <h2 className="display text-2xl text-paper sm:text-3xl">
                Thirty teams. One room code. Three cases, dealt at random.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-paper-dim">
                Open a room, broadcast the six-character code, and every team is dealt its own case
                on the same clock. Scoring is per-case — teams can't copy each other's answers, and
                every verdict lands on the live leaderboard the moment it's filed.
              </p>
            </div>
            <button onClick={onStart} className="btn-gold !px-6 !py-3 text-base">
              <Play className="h-4 w-4" />
              Open a Room
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink-600/50 py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 sm:px-6">
          <Building2 className="h-4 w-4 text-gold/60" />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-paper-dim/60">
            The Vanishing Ledger — Financial Crime Files
          </span>
          <span className="ml-auto text-[11px] text-paper-dim/40">
            Fictionalized training cases. Companies and individuals are fictitious.
          </span>
        </div>
      </footer>
    </div>
  );
}

/* ─────────────────────────── Chunk fallback ─────────────────────────── */

function CaseLoader() {
  return (
    <div className="grid min-h-screen place-items-center">
      <div className="mono-label animate-flicker">Retrieving case file…</div>
    </div>
  );
}

/* ─────────────────────────── App router ─────────────────────────── */

/**
 * Convex deployment URL. In the browser we talk to the same-origin
 * /convex-url proxy (Vite forwards it to the local backend on 127.0.0.1:3210).
 * A VITE_CONVEX_URL of http://127.0.0.1:3210 (injected by the sandbox .env)
 * is meaningless inside a remote browser, so only a remote https deployment
 * URL overrides the proxy. Non-browser fallback stays the local backend.
 */
function resolveConvexUrl(): string {
  if (typeof window !== "undefined") {
    const envUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;
    const isRemoteDeployment =
      envUrl &&
      envUrl.startsWith("https://") &&
      !envUrl.includes("localhost") &&
      !envUrl.includes("127.0.0.1");
    if (isRemoteDeployment && envUrl) return envUrl;
    return `${window.location.origin}/convex-url`;
  }
  return "http://127.0.0.1:3210";
}

/* The Convex client lives at module scope: created exactly once for the app's
 * lifetime and never closed. StrictMode's mount→cleanup→remount cycle used to
 * close the effect-scoped client while useMemo handed the same (now dead)
 * instance back on remount, killing every Convex call afterwards. */
const convexClient = new ConvexReactClient(resolveConvexUrl());

export default function App() {
  // The provider only covers its children, so every component that calls
  // useQuery/useMutation — AppInner included — must render inside it.
  return (
    <ConvexProvider client={convexClient}>
      <AppInner />
    </ConvexProvider>
  );
}

function AppInner() {
  const { session, collected, hints } = useGameStore();
  const [view, setView] = useState<"landing" | "lobby">("landing");
  const [verdict, setVerdict] = useState<VerdictResult | null>(null);

  const gameId = session ? (session.gameId as Id<"games">) : undefined;
  const teamId = session ? (session.teamId as Id<"teams">) : undefined;

  const game = useQuery(api.game.getGame, gameId ? { gameId } : "skip");
  const team = useQuery(api.game.getTeam, teamId ? { teamId } : "skip");
  const startGame = useMutation(api.game.startGame);
  const ensureCaseDealt = useMutation(api.game.ensureCaseDealt);
  const discoverEvidenceMut = useMutation(api.game.discoverEvidence);
  const discoverClueMut = useMutation(api.game.discoverClue);
  const recordQuestionMut = useMutation(api.game.recordQuestionAsked);
  const submitSearchMut = useMutation(api.game.submitSearch);
  const submitPuzzleAnswerMut = useMutation(api.game.submitPuzzleAnswer);

  /* Shared discovery state — server-owned, empty until discovered. */
  const discoveredEvidenceIds = team?.discoveredEvidenceIds ?? [];
  const discoveredClueIds = team?.discoveredClueIds ?? [];
  const askedQuestionIds = team?.askedQuestionIds ?? [];
  const puzzleSolved = team?.puzzleSolved ?? false;

  const discoverEvidence = (id: string) => {
    void discoverEvidenceMut({ teamId: teamId as Id<"teams">, evidenceId: id });
    collectEvidence(id); // local "viewed" tracking for the accusation screen
  };
  const discoverClue = (id: string) => {
    void discoverClueMut({ teamId: teamId as Id<"teams">, clueId: id });
  };
  const askQuestion = async (questionId: string) => {
    await recordQuestionMut({ teamId: teamId as Id<"teams">, questionId });
  };
  const runSearch = async (term: string): Promise<string[]> => {
    const res = await submitSearchMut({
      teamId: teamId as Id<"teams">,
      caseId: dealtCaseId ?? "",
      term,
    });
    if ("matches" in res && res.matches) {
      for (const id of res.matches) collectEvidence(id);
      return res.matches;
    }
    return [];
  };
  const checkPuzzle = async (answer: string): Promise<boolean> => {
    const res = await submitPuzzleAnswerMut({
      teamId: teamId as Id<"teams">,
      caseId: dealtCaseId ?? "",
      answer,
    });
    return "correct" in res && res.correct ? true : false;
  };

  /* ── Hooks: every hook below runs unconditionally, before ANY early return.
     useCase used to sit behind the `!session` return, so joining a room
     changed the hook count between renders and crashed React to a blank
     page. Keep this section free of conditional returns. ── */

  // The case the server dealt this team. Fresh joins receive it in the
  // joinRoom response (session.caseId); legacy team rows get one dealt by
  // the idempotent ensureCaseDealt mutation, cached here until submission.
  const sessionCaseId = (session?.caseId as CaseId | undefined) ?? null;
  const [legacyCaseId, setLegacyCaseId] = useState<CaseId | null>(null);

  useEffect(() => {
    // Session ended (left the case / played again) — drop the legacy deal.
    if (!session) {
      setLegacyCaseId(null);
      return;
    }
    if (!teamId || sessionCaseId) return;
    let cancelled = false;
    ensureCaseDealt({ teamId })
      .then((res) => {
        if (!cancelled && "caseId" in res && res.caseId) {
          setLegacyCaseId(res.caseId as CaseId);
        }
      })
      .catch(() => {
        /* the effect re-runs when session changes; nothing to do inline */
      });
    return () => {
      cancelled = true;
    };
  }, [session, teamId, sessionCaseId, ensureCaseDealt]);

  // If the room vanished (stale session), drop back to the landing page.
  useEffect(() => {
    if (session && game === null) resetProgress();
  }, [session, game]);

  const dealtCaseId = sessionCaseId ?? legacyCaseId;
  const kase = useCase(dealtCaseId);

  const begin = async () => {
    if (!session) return;
    try {
      await startGame({ gameId: gameId as Id<"games"> });
    } catch {
      /* another teammate may have started it already */
    }
    setSession({ ...session, screen: "scene" });
  };

  /* No session yet → marketing landing or lobby */
  if (!session) {
    return (
      <div className="grain min-h-screen">
        <Suspense fallback={<CaseLoader />}>
          {view === "landing" ? (
            <Landing onStart={() => setView("lobby")} />
          ) : (
            <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-10 sm:px-6">
              <button
                onClick={() => setView("landing")}
                className="mono-label mb-6 self-start hover:text-gold-soft"
              >
                ← Back to the case file
              </button>
              <Lobby />
            </div>
          )}
        </Suspense>
      </div>
    );
  }

  /* Active session — every screen is gated on the dealt case being loaded. */
  const onClock = !!game?.startedAt;
  const screen = session.screen;

  if (!kase) {
    return (
      <div className="grain grid min-h-screen place-items-center">
        <div className="text-center">
          <div className="mono-label animate-flicker">Retrieving your assigned case file…</div>
          {!dealtCaseId && (
            <p className="mt-3 text-xs text-paper-dim/60">
              Waiting for the server to deal your case…
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grain min-h-screen">
    <Suspense fallback={<CaseLoader />}>
      {(screen === "briefing" || screen === "dashboard") && !onClock && (
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-10 sm:px-6">
          <Briefing kase={kase} onBegin={begin} roomCode={session.roomCode} />
        </div>
      )}

      {/* Chained-discovery stages, in order, before the accusation. */}
      {(screen === "briefing" || screen === "dashboard" || STAGE_SCREENS.has(screen)) && onClock && (
        <Dashboard
          kase={kase}
          gameId={gameId as Id<"games">}
          teamId={teamId as Id<"teams">}
          teamName={session.teamName}
          roomCode={session.roomCode}
          startedAt={game.startedAt as number}
          timeLimitMs={game.timeLimitMs}
          penaltyPerHint={game.penaltyPerHint}
          discoveredEvidenceIds={discoveredEvidenceIds}
          discoveredClueIds={discoveredClueIds}
          askedQuestionIds={askedQuestionIds}
          puzzleSolved={puzzleSolved}
          initialStage={STAGE_SCREENS.has(screen) ? (screen as Stage) : "scene"}
          onStageChange={(s) => setSession({ ...session, screen: s })}
          onDiscoverEvidence={discoverEvidence}
          onDiscoverClue={discoverClue}
          onAskQuestion={askQuestion}
          onSearch={runSearch}
          onSubmitPuzzleAnswer={checkPuzzle}
          onAccuse={() => setSession({ ...session, screen: "accusation" })}
          onExpire={() => setSession({ ...session, screen: "accusation" })}
          onAbandon={() => resetProgress()}
        />
      )}

      {screen === "accusation" && (
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-10 sm:px-6">
          <Accusation
            kase={kase}
            teamId={teamId as Id<"teams">}
            collected={collected}
            onBack={() => setSession({ ...session, screen: "dashboard" })}
            onSubmit={(r) => {
              setVerdict(r);
              setSession({ ...session, screen: "results" });
            }}
          />
        </div>
      )}

      {screen === "results" && verdict && (
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-10 sm:px-6">
          <Results
            kase={kase}
            gameId={gameId as Id<"games">}
            teamName={session.teamName}
            verdict={verdict}
            verdictSuspectId={verdict.suspectId}
            verdictMethod={verdict.method}
            verdictEvidenceIds={verdict.evidenceIds}
            verdictFieldAnswers={verdict.fieldAnswers}
            hintsUsed={hints.length}
            onPlayAgain={() => {
              resetProgress();
              setVerdict(null);
              setView("lobby");
            }}
          />
        </div>
      )}
    </Suspense>
    </div>
  );
}
