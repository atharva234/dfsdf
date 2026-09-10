# The Vanishing Ledger

A gamified financial-crime investigation game for teams of 1–4 players on one
shared screen. A fictionalized case modeled on the 1995 Barings Bank collapse:
a 233-year-old merchant bank, an error account nobody watched, and £860,000,000
that vanished over a weekend.

## Stack

- **React 19 + Vite + TypeScript** — frontend
- **Tailwind CSS** — noir theme (deep navy/charcoal, amber/gold accents, JetBrains Mono for data)
- **Convex** — rooms, teams, shared notes, scoring, leaderboard (30 concurrent teams per room)
- **Framer Motion** — evidence reveals, typewriter interviews, stamp animations

## Gameplay flow

1. **Landing → Lobby** — name your team, open a room (6-char code) or join one, set player count (1–4).
2. **Case Briefing** — embedded briefing film, case facts, narrative intro.
3. **Investigation Dashboard** — Evidence Board (corkboard of 8 exhibits with collected states and scanned-document modals), Suspects Panel (4 profiles expanding into typewriter interview transcripts), shared Case Notes (sticky wall, live via Convex), persistent countdown, hint line (each reveal costs points, with a confirmation warning).
4. **Accusation** — suspect + written "how" + supporting exhibits, with an irrevocable confirmation step.
5. **Results** — verdict reveal, solution breakdown, score/time, event leaderboard preview.

Scoring (server-side in `convex/game.ts`): base 10,000 − 10/second − 250/hint −
500 if wrong, plus up to +1,200 for correctly cited exhibits (−200 per red
herring). The answer key lives server-side only (`convex/caseAnswer.ts`).

## Development

```sh
bun install
bun run dev            # Vite dev server on 0.0.0.0:$PORT (default 5173)
bun convex dev --once  # deploy Convex functions to the local backend (port 3210)
bun run typecheck
```

The frontend talks to Convex through the same-origin `/convex-url` proxy
configured in `vite.config.ts`. For a production build, set `VITE_CONVEX_URL`
to your deployed Convex deployment URL.
