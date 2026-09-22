import { useState } from "react";
import { ConvexProvider, ConvexReactClient, useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";

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

export default function Host() {
  return (
    <ConvexProvider client={convexClient}>
      <HostInner />
    </ConvexProvider>
  );
}

function HostInner() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const check = useQuery(api.auth.checkHostPassword, password ? { password } : "skip");

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#111", color: "#fff" }}>
        <div>
          <h1>Host login</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: 8, fontSize: 16 }}
          />
          <button onClick={() => check && setAuthed(true)} style={{ marginLeft: 8, padding: 8 }}>
            Enter
          </button>
          {password && check === false && <p style={{ color: "red" }}>Wrong password</p>}
        </div>
      </div>
    );
  }

  return <Dashboard password={password} />;
}

function Dashboard({ password }: { password: string }) {
  const event = useQuery(api.event.getEvent);
  const teams = useQuery(api.teams.listTeams, { password });
  const round = event?.status === "round2" ? 2 : 1;
  const submissions = useQuery(api.submissions.listSubmissions, { password, round });

  const startRound1 = useMutation(api.event.startRound1);
  const goToBreak = useMutation(api.event.goToBreak);
  const startRound2 = useMutation(api.event.startRound2);
  const extendRound = useMutation(api.event.extendRound);
  const endEvent = useMutation(api.event.endEvent);
  const sendHint = useMutation(api.hints.sendHint);

  const [hintText, setHintText] = useState("");
  const [hintTarget, setHintTarget] = useState<Id<"teams"> | "">("");

  const submittedIds = new Set((submissions ?? []).map((s) => s.teamId));

  return (
    <div style={{ minHeight: "100vh", background: "#111", color: "#fff", padding: 20 }}>
      <h1>Host Dashboard</h1>
      <p>Status: <b>{event?.status}</b></p>

      <div style={{ margin: "16px 0", display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => startRound1({ password, durationMs: 40 * 60 * 1000 })}>Start Round 1 (40m)</button>
        <button onClick={() => goToBreak({ password })}>Close Round 1 → Break</button>
        <button onClick={() => startRound2({ password, durationMs: 20 * 60 * 1000 })}>Start Round 2 (20m)</button>
        <button onClick={() => extendRound({ password, extraMs: 2 * 60 * 1000 })}>+2 min</button>
        <button onClick={() => endEvent({ password })}>End Event</button>
      </div>

      <h2>Send a hint</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <select value={hintTarget} onChange={(e) => setHintTarget(e.target.value as Id<"teams">)}>
          <option value="">Choose team…</option>
          {(teams ?? []).map((t) => (
            <option key={t._id} value={t._id}>{t.name} ({t.caseId})</option>
          ))}
        </select>
        <input
          value={hintText}
          onChange={(e) => setHintText(e.target.value)}
          placeholder="Hint text"
          style={{ flex: 1, padding: 6 }}
        />
        <button
          disabled={!hintTarget || !hintText.trim()}
          onClick={() => {
            sendHint({ password, teamId: hintTarget as Id<"teams">, text: hintText });
            setHintText("");
          }}
        >
          Send
        </button>
      </div>

      <h2>Teams ({teams?.length ?? 0})</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #444" }}>
            <th>Team</th><th>Case</th><th>Online</th><th>Round {round} submitted</th>
          </tr>
        </thead>
        <tbody>
          {(teams ?? []).map((t) => {
            const online = Date.now() - t.lastSeenAt < 60000;
            return (
              <tr key={t._id} style={{ borderBottom: "1px solid #222" }}>
                <td>{t.name}</td>
                <td>{t.caseId}</td>
                <td>{online ? "🟢" : "⚪"}</td>
                <td>{submittedIds.has(t._id) ? "✅" : "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h2 style={{ marginTop: 24 }}>Round {round} submissions</h2>
      {(submissions ?? []).map((s) => (
        <div key={s._id} style={{ border: "1px solid #333", padding: 10, marginBottom: 8 }}>
          <b>{teams?.find((t) => t._id === s.teamId)?.name}</b>
          <p style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(s.data)}</p>
        </div>
      ))}
    </div>
  );
}