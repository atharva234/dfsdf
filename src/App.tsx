import { useState, useEffect } from "react";
import { ConvexProvider, ConvexReactClient, useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import { getCaseData } from "./caseData";

function resolveConvexUrl(): string {
  if (typeof window !== "undefined") {
    const envUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;
    const isRemote = envUrl && envUrl.startsWith("https://") && !envUrl.includes("127.0.0.1");
    if (isRemote && envUrl) return envUrl;
    return `${window.location.origin}/convex-url`;
  }
  return "http://127.0.0.1:3210";
}
const convexClient = new ConvexReactClient(resolveConvexUrl());

export default function App() {
  return (
    <ConvexProvider client={convexClient}>
      <AppInner />
    </ConvexProvider>
  );
}

function Countdown({ endsAt }: { endsAt: number | null }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!endsAt) return <span>--:--</span>;
  const remaining = Math.max(0, endsAt - now);
  const m = Math.floor(remaining / 60000);
  const s = Math.floor((remaining % 60000) / 1000);
  return <span>{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}</span>;
}

function ReportForm({ teamId, round }: { teamId: Id<"teams">; round: number }) {
  const existing = useQuery(api.submissions.getMySubmission, { teamId, round });
  const submit = useMutation(api.submissions.submitRound);
  const [text, setText] = useState("");

  if (existing === undefined) return <p>Loading…</p>;
  if (existing) {
    return (
      <div style={{ marginTop: 20, padding: 12, border: "1px solid #444" }}>
        <p><b>Round {round} report submitted.</b></p>
        <p style={{ opacity: 0.7, fontSize: 14 }}>{JSON.stringify(existing.data)}</p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 20 }}>
      <h3>Round {round} Report</h3>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        style={{ width: "100%", maxWidth: 500 }}
        placeholder="Suspect, reasoning, evidence..."
      />
      <br />
      <button
        onClick={() => submit({ teamId, round, data: { text } })}
        disabled={!text.trim()}
        style={{ marginTop: 8, padding: 8 }}
      >
        Submit Round {round}
      </button>
    </div>
  );
}

function HintInbox({ teamId }: { teamId: Id<"teams"> }) {
  const hints = useQuery(api.hints.getMyHints, { teamId });
  if (!hints || hints.length === 0) return null;
  return (
    <div style={{ marginTop: 20, padding: 12, border: "1px solid gold" }}>
      <h3>New Evidence Received</h3>
      {hints.map((h) => (
        <p key={h._id}>{h.text}</p>
      ))}
    </div>
  );
}

function AppInner() {
  const [codeInput, setCodeInput] = useState("");
  const [teamId, setTeamId] = useState<Id<"teams"> | null>(
    () => (localStorage.getItem("teamId") as Id<"teams"> | null) ?? null
  );

  const team = useQuery(
    api.teams.login,
    codeInput.length > 0 ? { code: codeInput } : "skip"
  );
  const storedTeam = useQuery(api.teams.getById, teamId ? { teamId } : "skip");
  const event = useQuery(api.event.getEvent);
  const heartbeat = useMutation(api.teams.heartbeat);

  useEffect(() => {
    if (!teamId) return;
    heartbeat({ teamId });
    const t = setInterval(() => heartbeat({ teamId }), 30000);
    return () => clearInterval(t);
  }, [teamId, heartbeat]);

  const tryLogin = () => {
    if (team) {
      localStorage.setItem("teamId", team._id);
      setTeamId(team._id);
    }
  };

  if (!teamId) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#111", color: "#fff" }}>
        <div>
          <h1>Enter your team code</h1>
          <input
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
            placeholder="e.g. BERLIN"
            style={{ padding: 8, fontSize: 18 }}
          />
          <button onClick={tryLogin} style={{ marginLeft: 8, padding: 8 }}>
            Enter
          </button>
          {codeInput.length > 2 && team === null && (
            <p style={{ color: "red" }}>Invalid code</p>
          )}
        </div>
      </div>
    );
  }

  const activeTeam = team ?? storedTeam;
  const round = event?.status === "round2" ? 2 : 1;
  const caseId = activeTeam?.caseId ?? "unknown";
  const kase = getCaseData(caseId);

  return (
    <div style={{ minHeight: "100vh", background: "#111", color: "#fff", padding: 20 }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <h1>Welcome, {activeTeam?.name}</h1>
        <p style={{ opacity: 0.6 }}>Case file: {caseId}</p>

        {kase ? (
          <div style={{ marginTop: 20 }}>
            <h2>{kase.title}</h2>
            <p style={{ opacity: 0.6 }}>{kase.company} — {kase.location}</p>
            <h3>Suspects</h3>
            <ul>
              {kase.suspects.map((s) => (
                <li key={s.id}>{s.name} — {s.position}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p style={{ color: "orange" }}>
            No case data found for caseId "{caseId}" — check the team's caseId in the dashboard.
          </p>
        )}

        <p>Status: {event?.status}</p>

        {event?.status === "lobby" && <p>Waiting for the host to start Round 1…</p>}

        {(event?.status === "round1" || event?.status === "round2") && (
          <>
            <h2>Round {round} — <Countdown endsAt={event.roundEndsAt} /></h2>
            <HintInbox teamId={teamId} />
            <ReportForm teamId={teamId} round={round} />
          </>
        )}

        {event?.status === "break" && <p>Round 1 closed. Waiting for Round 2 to start…</p>}
        {event?.status === "ended" && <p>Event has ended. Thank you!</p>}
      </div>
    </div>
  );
}