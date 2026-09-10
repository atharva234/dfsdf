/**
 * The Vanishing Ledger — app shell.
 * Landing page → Lobby → Briefing → Investigation Dashboard → Accusation →
 * Results. Room/team state lives in Convex; investigation progress is local.
 */

import { Suspense, lazy, useEffect, useMemo, useState } from "react";
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
import { useGameStore, setSession, resetProgress } from "./game/store";
import type { VerdictResult } from "./screens/Accusation";

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
          <span className="mono-label ml-2 hidden sm:block">Case VL-1995-88888</span>
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
              One bank.
              <br />
              Five days.
              <br />
              <span className="gold-glow-text text-gold-soft">£860,000,000,</span>
              <br />
              gone.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="mt-5 max-w-xl text-base leading-relaxed text-paper-dim"
            >
              Meridian Sovereign Bank is 233 years old and it will not survive the week. No vault
              was touched, no cheque forged — on paper, nothing is missing at all. Gather your unit
              of up to four detectives, work one shared case file, and name who emptied the bank
              before the clock runs out.
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
                Exhibit B — intercepted wire
              </div>
              <div className="mt-2 font-mono text-[12px] leading-relaxed text-[#3a3122]">
                BENEFICIARY: A. HAYES — a/c 88888888
                <br />
                AMOUNT: £35,000,000.00
                <br />
                REF: CLIENT MARGIN COLLECTIONS DUE
              </div>
            </div>
            <div className="paper-sheet relative rotate-[-2deg] p-6">
              <div className="mono-label" style={{ color: "#6b5a26" }}>
                Case file 88888 — opened 06:00
              </div>
              <div className="mt-3 space-y-2 font-mono text-[12px] text-[#3a3122]">
                <div>A/C 88888 — ERROR ACCOUNT (SUSPENSE)</div>
                <div>BALANCE CARRIED FORWARD −£40,650,000</div>
                <div>RECONCILING OFFICER: A. HAYES</div>
              </div>
              <div className="mt-4 flex justify-between">
                <span className="font-stamp text-[11px] uppercase tracking-[0.2em] text-blood-deep opacity-80">
                  classified
                </span>
                <span className="font-stamp text-[11px] uppercase tracking-[0.2em] text-verdigris opacity-80">
                  4 suspects
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
            { n: "1762", label: "Bank chartered" },
            { n: "£860M", label: "Vanished in a weekend" },
            { n: "8", label: "Exhibits to examine" },
            { n: "60:00", label: "On the shared clock" },
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
            },
            {
              icon: FileText,
              t: "Take the briefing",
              d: "Watch the case film, meet Meridian Sovereign, and read the 6 a.m. mandate.",
            },
            {
              icon: Search,
              t: "Work the evidence",
              d: "Eight exhibits, four suspects, one shared notepad. Hints cost points — spend carefully.",
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
                Thirty teams. One room code. One live leaderboard.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-paper-dim">
                Open a room, broadcast the six-character code, and every team investigates the same
                case on the same clock. Scores, times, and verdicts land on a live leaderboard the
                moment each team files.
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
            The Vanishing Ledger — Case VL-1995-88888
          </span>
          <span className="ml-auto text-[11px] text-paper-dim/40">
            A fictionalized case modeled on the 1995 collapse of Barings Bank.
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
 * Convex deployment URL. In the browser we always talk to the same-origin
 * /convex-url proxy (Vite forwards it to the local backend on 127.0.0.1:3210,
 * TLS included — the preview URL is https). A production/static build sets
 * VITE_CONVEX_URL to its hosted deployment instead.
 */
function useConvexUrl(): string {
  return useMemo(() => {
    const envUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;
    if (envUrl) return envUrl;
    if (typeof window !== "undefined") {
      return `${window.location.origin}/convex-url`;
    }
    return "http://127.0.0.1:3210"; // non-browser fallback (SSR/tests)
  }, []);
}

export default function App() {
  const convexUrl = useConvexUrl();
  const convexClient = useMemo(
    () => new ConvexReactClient(convexUrl),
    [convexUrl],
  );
  useEffect(() => {
    return () => {
      void convexClient.close();
    };
  }, [convexClient]);

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
  const startGame = useMutation(api.game.startGame);

  // If the room vanished (stale session), drop back to the landing page.
  useEffect(() => {
    if (session && game === null) resetProgress();
  }, [session, game]);

  const begin = async () => {
    if (!session) return;
    try {
      await startGame({ gameId: gameId as Id<"games"> });
    } catch {
      /* another teammate may have started it already */
    }
    setSession({ ...session, screen: "dashboard" });
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

  /* Active session */
  const onClock = !!game?.startedAt;
  const screen = session.screen;

  return (
    <div className="grain min-h-screen">
    <Suspense fallback={<CaseLoader />}>
      {(screen === "briefing" || screen === "dashboard") && !onClock && (
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-10 sm:px-6">
          <Briefing onBegin={begin} roomCode={session.roomCode} />
        </div>
      )}

      {(screen === "briefing" || screen === "dashboard") && onClock && (
        <Dashboard
          gameId={gameId as Id<"games">}
          teamId={teamId as Id<"teams">}
          teamName={session.teamName}
          roomCode={session.roomCode}
          startedAt={game.startedAt as number}
          timeLimitMs={game.timeLimitMs}
          penaltyPerHint={game.penaltyPerHint}
          onAccuse={() => setSession({ ...session, screen: "accusation" })}
          onExpire={() => setSession({ ...session, screen: "accusation" })}
          onAbandon={() => resetProgress()}
        />
      )}

      {screen === "accusation" && (
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-10 sm:px-6">
          <Accusation
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
            gameId={gameId as Id<"games">}
            teamName={session.teamName}
            verdict={verdict}
            verdictSuspectId={verdict.suspectId}
            verdictMethod={verdict.method}
            verdictEvidenceIds={verdict.evidenceIds}
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
