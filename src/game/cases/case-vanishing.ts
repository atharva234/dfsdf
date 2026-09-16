import type { GameCase } from "./types";

/**
 * Case 01 — The Vanishing Ledger (Barings-inspired flagship).
 * The original event dossier: a 233-year-old merchant bank destroyed by one
 * desk in Singapore, an error account nobody watched, and a funding pipeline
 * nobody questioned.
 */
export const VANISHING_LEDGER: GameCase = {
  id: "vanishing-ledger",
  caseNo: "VL-1995-88888",
  title: "The Vanishing Ledger",
  company: "Meridian Sovereign Bank",
  place: "Singapore Futures Exchange",
  period: "February 1995",
  difficulty: "Moderate",
  minutes: 60,
  videoId: "pfYTja5ZKAY",
  accusationPrompt: "Who emptied the bank?",
  methodPlaceholder:
    "Describe the mechanism — the account, the money trail, the control that failed…",
  footnote: "A fictionalized case modeled on the 1995 collapse of Barings Bank.",
  narrative: [
    "For two hundred and thirty-three years, Meridian Sovereign Bank financed empires. Queen Victoria kept an account there. So did her critics. The bank survived Napoleon, two world wars, and the 1987 crash. It did not survive February of 1995.",
    "Over one long weekend, £860,000,000 evaporated from its books. No vault was robbed. No forger signed a cheque. On paper, nothing is missing at all — and that is precisely the problem.",
    "You are the forensic review team, convened at 6:00 a.m. by the Bank of Alderney before the markets open. Somewhere in this case file is the moment the money began to vanish, the person who made it vanish, and the paper trail they left behind.",
    "Four people had the access. One of them emptied the bank. Find the who, the how, and the exhibits that prove it — then file your verdict before the clock runs out.",
  ],
  /* ── Discovery chain ──────────────────────────────────────────────────
   * Nothing appears by default. The team must work the scene, chase leads,
   * search the records room, and interrogate suspects to assemble the file.
   *
   *   Scene:  filing-cabinet → statement 88888 (free)
   *           terminal → clue-88888 (free): the terminal keeps failing to
   *             reconcile A/c 88888 — the lead that opens the drawer
   *           wastebasket → clue-audit-crumpled (free): Finding 88-B draft
   *           desk-drawer → Ting's memo (locked until clue-88888)
   *   Records: "88888888" pulls the fax + email together; "1762"/"charter"
   *           surfaces the 1762 charter red herring
   *   Interview: asking Barnard anything surfaces the 1994 audit report;
   *           asking Hayes anything surfaces the SIMEX trade log;
   *           Baker's confirmation question needs fax + email on the board;
   *           Ting's escalation question needs org chart + audit report
   *   Lab:    sum the statement's four error postings → 226
   */
  suspects: [
    {
      id: "alex-hayes",
      name: "Alexander Hayes",
      role: "General Manager, Singapore Branch — Head of Trading & Settlement",
      location: "Singapore",
      age: 28,
      motive:
        "Bonus-obsessed. Famously lost £50M of client money in Tokyo in 1992 and rebuilt his reputation — and his bonus — from a single desk in Singapore.",
      tell: "Held BOTH sides of the ledger: he ran the trading desk and he settled its trades. He demanded the office remit £35M in 'client margin' — and wired it to account 88888888. Eight eights, twice.",
      transcript: [
        {
          q: "Mr. Hayes. Walk us through your desk's 1994 results.",
          a: "Record year. Eighteen million profit on the SIMEX book — arbitrage, mostly. Low risk. The Singapore desk is a printing press, and the press only prints money. I built that from nothing.",
        },
        {
          q: "Where were the settlements handled? Who booked your trades?",
          a: "I have a settlement clerk. Well — I had one. Right, the clerk resigned last March, so I've been doing the reconciliations myself while head office finds a replacement. Eighteen months, now. Head office is very busy.",
        },
        {
          q: "Tell us about the office remittances. Thirty-five million pounds in 'client margin' wired to a personal account.",
          a: "That's standard. Clients owe margin on futures positions. They're slow payers — Japanese institutions, you know how they are about paperwork. So the office sends the funds first and collects later. All documented. All in my file.",
          unlock: { type: "evidence", requires: ["ev-statement-88888"] },
        },
        {
          q: "One document is missing from your file, Mr. Hayes. The client confirmations.",
          a: "..... (the recording continues for 11 minutes) ..... I'll need my counsel for the rest of this.",
          unlock: { type: "evidence", requires: ["ev-fax-remittance", "ev-email-meridian"] },
        },
      ],
    },
    {
      id: "sarah-ting",
      name: "Sarah Ting",
      role: "Finance Officer, Singapore Branch — Futures & Options Settlement",
      location: "Singapore",
      age: 34,
      motive:
        "The only person who actually read the reconciliations — and she filed a memo on 11 January flagging the exact account. Nobody in London answered it.",
      tell: "She's the whistleblower, not the thief. Her memo names the account, dates the discrepancy, and identifies whose desk it sits under. If the board had read it, the bank would still exist.",
      transcript: [
        {
          q: "Ms. Ting, you filed a reconciliation memo on 11 January. Take us through it.",
          a: "I reconciled the client accounts against SIMEX margin requirements. There was a persistent shortfall — forty million, then fifty. I traced it to an internal account. 88888. I flagged it in writing to the Finance Director in London and asked for authority to freeze remittances from the desk until it was explained.",
        },
        {
          q: "And the response from London?",
          a: "I was told the Singapore desk's profits were 'material to the group' and that Mr. Hayes had provided an explanation. I was also told, informally, that questioning the desk's funding was 'not career-enhancing'. I kept copies. I keep copies of everything.",
        },
        {
          q: "Did you ever see the client confirmations for the margin money?",
          a: "No. That's what I asked for, in the memo. Confirmations, statements, anything. There were never any. The money left our accounts before I ever saw the requests that justified it. The signatures on the wire forms were Mr. Hayes's alone.",
        },
        {
          q: "Why didn't you escalate further?",
          a: "I did. Twice. To the Finance Director and to the regional audit. I was told both times that the matter was 'in hand'. The matter was not in hand. The matter was Mr. Hayes.",
          unlock: { type: "evidence", requires: ["ev-orgchart", "ev-audit-1994"] },
        },
      ],
    },
    {
      id: "ron-baker",
      name: "Ronald Baker",
      role: "Head of Global Equities & Derivatives — London",
      location: "London",
      age: 49,
      motive:
        "Championed Hayes, funded him, and defended him. He signed off on unlimited funding lines for a desk he never once audited — because the desk's 'profits' were paying for his bonus pool.",
      tell: "He wired the money. Every £35M remittance crossed his desk, and he never asked for a single client confirmation — while capping the Tokyo desk's funding at £10M. The discrepancy was a rounding error against his bonus.",
      transcript: [
        {
          q: "Mr. Baker, you released over thirty-five million pounds to the Singapore desk. On whose authority?",
          a: "On mine. That's what a funding line is. You don't micromanage the man who's making you twenty percent on the year. Singapore was the most profitable unit in the bank. I protected it. That was my job.",
        },
        {
          q: "You never requested the client confirmations backing those margin calls?",
          a: "The confirmations were handled in Singapore. We're a bank, not a clerical pool. And with respect — the Tokyo desk asks me for confirmations every week, and I've capped them at ten million. Hayes asked once, got thirty-five, and I never got a single call from risk about it. Draw your own conclusions.",
        },
        {
          q: "The board's audit committee flagged 'unusual balance sheet growth' in October. Your response was to increase the line.",
          a: "The growth was profits. Real ones. I saw the P&L with my own eyes — signed, consolidated, audited. If there was something rotten in the numbers, then someone made it look that way, and I'd like to shake their hand, because it fooled the auditors too.",
        },
        {
          q: "It fooled them because the profits were fictional, Mr. Baker. Booked against an account you never looked at.",
          a: "(pause) Then that's... I'd want that in writing. I'd want that from counsel. Because if that's true, then every funding line I signed — I signed it for nothing.",
        },
      ],
    },
    {
      id: "geoffrey-barnard",
      name: "Geoffrey Barnard",
      role: "Chief Auditor, London — Office of Group Audit",
      location: "London",
      age: 58,
      motive:
        "Wrote a 1994 internal audit that listed 'segregation of duties' at the Singapore branch as an UNRESOLVED HIGH RISK. He closed the finding when London management promised a fix that never came.",
      tell: "He flagged the exact structural flaw — one man, both sides of the ledger — and then accepted the word of the man whose bonus depended on hiding it. His signature is on the letter that let the desk operate unsegregated for 18 more months.",
      transcript: [
        {
          q: "Your 1994 report. Quote it for us.",
          a: "'The Singapore branch presents a significant segregation-of-duties risk: the head of trading also exercises full settlement authority, with no independent reconciliation. This finding remains open.' That's verbatim. I signed it in my own hand.",
        },
        {
          q: "And then?",
          a: "Then management responded. A remediation plan — a new settlement clerk, segregated reporting lines, a compliance officer on the next rotation. I was assured the matter was being addressed with 'the highest priority'. I closed the finding. That is the process. That is what the process is.",
        },
        {
          q: "The clerk was never hired. The compliance officer arrived after the collapse.",
          a: "I audited what I was shown. If the remediation was a fiction — if Mr. Hayes wrote the plan himself and filed it through Mr. Baker's office — then yes. I closed a door that was never locked. I'm aware of what that means. I'm aware of what it cost.",
        },
        {
          q: "Account 88888 appears nowhere in your audit.",
          a: "Because I was never shown it. It appears in the finance officer's memo, in the wire instructions, in the settlement logs — everywhere except the reports that reached my desk. Someone curated my view of that branch very carefully, for a very long time.",
        },
      ],
    },
  ],
  evidence: [
    {
      id: "ev-statement-88888",
      title: "Statement of Account No. 88888",
      kind: "bank-statement",
      group: "Ledgers & Statements",
      date: "31 Jan 1995",
      source: "Barings Futures Singapore — internal ledger extract",
      size: "2 pages",
      excerpt: "Internal use only. Balance carried forward: −£40,650,000.",
      lines: [
        { t: "kv", k: "ACCOUNT", v: "88888 — ERROR ACCOUNT (SUSPENSE)" },
        { t: "kv", k: "HOLDER", v: "BFS — INTERNAL" },
        { t: "kv", k: "CURRENCY", v: "GBP" },
        { t: "kv", k: "OPENED", v: "1992 — DESK RECONCILIATION" },
        { t: "divider" },
        { t: "mono", v: "01 Nov 94   ERROR RECT. SIMEX/N23500      −£10,200,000" },
        { t: "mono", v: "09 Dec 94   ERROR RECT. SIMEX/N23500      −£14,300,000" },
        { t: "mono", v: "13 Jan 95   ERROR RECT. SIMEX/N23500      −£9,150,000" },
        { t: "mono", v: "17 Jan 95   ERROR RECT. SIMEX/N23500      −£7,000,000" },
        { t: "mono", v: "31 Jan 95   BALANCE CARRIED FORWARD       −£40,650,000" },
        { t: "divider" },
        { t: "p", v: "Note: Account to be swept to zero at each day-end reconciliation. Sweeps have not been performed since Mar 1994." },
        { t: "hl", v: "RECONCILING OFFICER (per system): A. HAYES — TRADING DESK AUTHORITY" },
        { t: "stamp", v: "INTERNAL USE ONLY — DO NOT CIRCULATE" },
      ],
    },
    {
      id: "ev-email-meridian",
      title: "RE: RE: RE: Client Margin — Urgent Remittance",
      kind: "email",
      group: "Communications",
      date: "6 Feb 1995 21:47",
      source: "London treasury mailbox — captured thread",
      size: "1 message chain (4)",
      excerpt: "\"Clients do NOT need confirmations. Release the funds. — A.H.\"",
      lines: [
        { t: "kv", k: "FROM", v: "A. Hayes <a.hayes@bfs.meridian.co.uk>" },
        { t: "kv", k: "TO", v: "R. Baker <r.baker@meridian.co.uk>; Treasury Operations" },
        { t: "kv", k: "SUBJECT", v: "RE: RE: RE: Client Margin — Urgent Remittance" },
        { t: "divider" },
        { t: "p", v: "Ron — third request this week. The clients are late payers, they always are, and SIMEX will close us out if the margin isn't posted by open. Release the £35M from the office account and we collect from the clients at month end, as usual." },
        { t: "p", v: "I keep being asked for confirmations. There are none to give. Clients do NOT need confirmations for margin — this is how it has always worked. Release the funds." },
        { t: "hl", v: "Wire beneficiary: A. HAYES — a/c 88888888 — Citibank NA, Singapore." },
        { t: "p", v: "I have copies of the trade tickets if anyone wants them. Nobody has ever asked. — A.H." },
        { t: "divider" },
        { t: "p", v: "----- ORIGINAL MESSAGE -----" },
        { t: "p", v: "From: Treasury Operations. Sent: 6 Feb 1995 18:12. To: A. Hayes." },
        { t: "p", v: "Subject: Client Margin — Urgent Remittance" },
        { t: "p", v: "Alexander — the audit committee has asked for supporting confirmations before we release a further sum. Can you have your clients' confirmations to us by close of business tomorrow?" },
        { t: "sign", v: "Sent from my Blackberry — A. Hayes" },
        { t: "stamp", v: "PRESERVED — FORENSIC MAILBOX CAPTURE" },
      ],
    },
    {
      id: "ev-erroraccount-88",
      title: "Memo: Reconciliation Discrepancy — A/c 88888",
      // Found in the desk drawer — which only opens once the terminal
      // flags account 88888.
      kind: "audit-report",
      group: "Communications",
      date: "11 Jan 1995",
      source: "S. Ting, Finance Officer — to Group Finance Director, London",
      size: "1 page",
      excerpt: "\"I require authority to suspend remittances from this desk pending explanation.\"",
      lines: [
        { t: "kv", k: "FROM", v: "S. Ting — Futures & Options Settlement" },
        { t: "kv", k: "TO", v: "Group Finance Director (London)" },
        { t: "kv", k: "CC", v: "Regional Audit (unanswered)" },
        { t: "kv", k: "RE", v: "RECONCILIATION DISCREPANCY — ACCOUNT 88888" },
        { t: "divider" },
        { t: "p", v: "I have completed the January reconciliation of client margin accounts against SIMEX requirements. There is a persistent and growing shortfall on our client funds, currently £40.6M, which traces to internal error account 88888." },
        { t: "hl", v: "This account should carry no balance at each day end. It has carried a balance continuously since March 1994, and the balance has grown every month." },
        { t: "p", v: "The desk's reported profits for 1994 (£18M) cannot be reconciled against this account. I can identify no client confirmations supporting the office remittances made against this desk — £35M to date — and I am unable to establish who the paying clients are." },
        { t: "p", v: "I require written authority to suspend all remittances from this desk pending a full explanation, and I request that this request be minuted." },
        { t: "sign", v: "S. Ting — 11 January 1995" },
        { t: "stamp", v: "RECEIVED — GROUP FINANCE — NO REPLY ON FILE" },
      ],
    },
    {
      id: "ev-tradelog-simex",
      title: "SIMEX Position & Margin Log — Desk N23500",
      kind: "trade-log",
      group: "Trades & Money",
      date: "23 Feb 1995 (reconstructed)",
      source: "Singapore International Monetary Exchange — trade reconstruction",
      size: "3 pages",
      excerpt: "Net exposure: long 6,103 Nikkei futures (JGB straddle notional ¥110bn).",
      lines: [
        { t: "kv", k: "DESK", v: "N23500 — BFS SINGAPORE" },
        { t: "kv", k: "SESSION", v: "22–23 FEB 1995" },
        { t: "kv", k: "STRATEGY DECLARED", v: "RISK-NEUTRAL ARBITRAGE" },
        { t: "divider" },
        { t: "mono", v: "NIKKEI 225 MAR95   LONG   1,102   AVG 18,140   SPREAD LEG: NONE" },
        { t: "mono", v: "NIKKEI 225 JUN95   LONG   2,159   AVG 17,880   SPREAD LEG: NONE" },
        { t: "mono", v: "NIKKEI 225 MAR95   LONG   2,842   AVG 18,015   SPREAD LEG: NONE" },
        { t: "divider" },
        { t: "hl", v: "NET POSITION: LONG 6,103 CONTRACTS — NOTIONAL ¥110,000,000,000" },
        { t: "p", v: "An arbitrage book must carry offsetting short legs on SIMEX and OSE. This book carries none. The declared 'spread' legs were never executed; only the long side was posted, then reported to London as matched." },
        { t: "p", v: "Margin calls on this position were funded by office remittances booked as 'client collections due'. No client owed any margin." },
        { t: "stamp", v: "RECONSTRUCTED FROM EXCHANGE TAPE — 23 FEB 1995" },
      ],
    },
    {
      id: "ev-orgchart",
      title: "Singapore Branch — Reporting Lines (1994)",
      kind: "org-chart",
      group: "People & Structure",
      date: "Oct 1994",
      source: "Group HR — as filed with the 1994 audit",
      size: "1 page",
      excerpt: "Head of trading = head of settlement = sole signatory on remittances.",
      lines: [
        { t: "kv", k: "UNIT", v: "BFS — SINGAPORE BRANCH (24 STAFF)" },
        { t: "divider" },
        { t: "mono", v: "[LONDON BOARD]" },
        { t: "mono", v: "  └─ [R. BAKER] — GLOBAL EQUITIES & DERIVATIVES" },
        { t: "mono", v: "      └─ [A. HAYES] — GM SINGAPORE: TRADING ★ AND SETTLEMENT ★" },
        { t: "mono", v: "          ├─ [TRADING DESK — 8]  (reports to Hayes)" },
        { t: "mono", v: "          └─ [SETTLEMENT/FINANCE — 3]  (reports to Hayes)" },
        { t: "mono", v: "              └─ (settlement clerk role — VACANT since Mar 1994)" },
        { t: "divider" },
        { t: "hl", v: "DOTTED LINE — INDEPENDENT RECONCILIATION TO LONDON: NONE ON FILE." },
        { t: "p", v: "Note: The 1992 branch organisation chart showed an independent settlements manager reporting to London. This structure was never implemented." },
        { t: "stamp", v: "FILED WITH GROUP AUDIT — UNADDRESSED FINDING 88-B" },
      ],
    },
    {
      id: "ev-fax-remittance",
      title: "Fax: Inter-Office Remittance Advice — £35,000,000",
      // Terminal drawer: found by searching the full account number.
      kind: "fax",
      group: "Trades & Money",
      date: "24 Feb 1995 06:12",
      source: "Treasury Operations — wire copy",
      size: "1 page",
      excerpt: "Final remittance before freeze. Beneficiary account: 88888888.",
      lines: [
        { t: "kv", k: "PRIORITY", v: "URGENT — PRE-OPEN" },
        { t: "kv", k: "FROM ACCOUNT", v: "MERIDIAN LONDON — TREASURY OPERATIONS" },
        { t: "kv", k: "AMOUNT", v: "£35,000,000.00" },
        { t: "kv", k: "BENEFICIARY", v: "A. HAYES — a/c 88888888 — CITIBANK NA, SINGAPORE" },
        { t: "kv", k: "REFERENCE", v: "CLIENT MARGIN COLLECTIONS DUE — SIMEX" },
        { t: "divider" },
        { t: "p", v: "Authorised by: R. Baker (London) — per standing instruction, no confirmations required." },
        { t: "p", v: "This is the fifth such remittance to the same beneficiary account in seven months. The reference field on all five wires reads 'CLIENT MARGIN COLLECTIONS DUE'. Group Finance has no record of any client being invoiced." },
        { t: "hl", v: "RECONCILIATION STATUS AT FREEZE: UNRECONCILED — £212,000,000 CUMULATIVE." },
        { t: "stamp", v: "FREEZE ORDER 24 FEB — BANK OF ALDERNEY" },
      ],
    },
    {
      id: "ev-audit-1994",
      title: "Group Audit — Singapore Branch (Findings Extract)",
      kind: "audit-report",
      group: "People & Structure",
      date: "Oct 1994",
      source: "G. Barnard, Chief Auditor — internal circulation",
      size: "2 pages",
      excerpt: "\"Unresolved HIGH RISK: segregation of duties. Management response: pending.\"",
      lines: [
        { t: "kv", k: "FINDING NO.", v: "88-B — SEGREGATION OF DUTIES" },
        { t: "kv", k: "RATING", v: "HIGH — UNRESOLVED" },
        { t: "kv", k: "OWNER", v: "MANAGEMENT (SINGAPORE / GLOBAL B&D)" },
        { t: "divider" },
        { t: "p", v: "The head of trading at the Singapore branch exercises full settlement authority over his own desk's trades, including reconciliation of the branch's error accounts. No independent reconciliation to London is in place." },
        { t: "hl", v: "This structure concentrates both sides of the ledger in one individual. Group Audit recommends this be remediated before the branch's funding line is extended." },
        { t: "p", v: "Management response: 'A settlement clerk has been recruited and will commence in Q1. Reconciliation will report to London from Q2.' (No such appointment is recorded. The funding line was extended in November.)" },
        { t: "stamp", v: "FINDING CLOSED 30 OCT 1994 — ON MANAGEMENT ASSURANCE ONLY" },
      ],
    },
    {
      id: "ev-redherring-coc",
      title: "Certificate of Incorporation — Meridian Sovereign (1762)",
      // Records Room red herring: searching the charter year surfaces it.
      kind: "bank-statement",
      group: "Ledgers & Statements",
      date: "12 Mar 1762",
      source: "Company registry — certified copy",
      size: "1 page (vellum)",
      excerpt: "The bank's founding charter. Magnificent. Entirely irrelevant.",
      lines: [
        { t: "kv", k: "COMPANY", v: "MERIDIAN SOVEREIGN BANK" },
        { t: "kv", k: "INCORPORATED", v: "12 MARCH 1762" },
        { t: "kv", k: "CHARTER", v: "BY ROYAL WARRANT — KING GEORGE III" },
        { t: "divider" },
        { t: "p", v: "…and the said Bank shall have perpetual succession and a common seal, and may take and hold such sums of money as shall from time to time be deposited with it, in trust for its clients and correspondents, in all corners of the Empire…" },
        { t: "p", v: "The certificate confirms the bank's ancient provenance. It tells you nothing about who emptied it in February 1995. Some exhibits are here because a good case file has too many exhibits, not too few." },
        { t: "stamp", v: "CERTIFIED TRUE COPY — REGISTRY OF ALDERNEY" },
      ],
    },
  ],
  hints: [
    {
      id: "hint-1",
      cost: 250,
      text: "Reconcile the wire transfers against the client confirmations. Every 'client margin' remittance on the evidence board was wired to the same personal account number. Find the account, find the man.",
    },
    {
      id: "hint-2",
      cost: 250,
      text: "One suspect held both keys to the vault: the authority to trade AND the authority to settle his own trades. The chief auditor flagged it and then closed the finding. Who benefits from a desk nobody double-checks?",
    },
    {
      id: "hint-3",
      cost: 250,
      text: "The error account is the answer: 88888. Whoever books fictitious profits must be the same person who buries the losses — and the same person whose signature appears on every remittance to 88888888.",
    },
  ],
  solution: {
    headline:
      "Alexander Hayes hid the losses in Error Account 88, funded them with office remittances, and booked fictitious profits against Barings' own client margin accounts.",
    points: [
      "Account 88888 — five eights, the error account — was created in 1992 as a gutter for booking mistakes. Every trade error was supposed to be squared by end of day. Nobody ever checked it, because nobody was supposed to be able to trade AND reconcile on the same desk. Hayes held both keys.",
      "Rather than book losses, Hayes parked them in 88888 and booked matching fictitious profits to his own trading book — reporting £18M of 'profit' in 1994 on a desk whose real position was a £208M hole.",
      "To keep the fictitious profits paid out, Hayes demanded £35M in office remittances — cash supposedly owed by clients for margin calls. He wired it to his own account 88888888 at Citibank. The 'clients' did not exist.",
      "On 23 February, an SIMEX audit noticed the missing margin money. That evening, Hayes fled Singapore. The next morning, the bank's flagship product — its own name — was worthless. Barings was sold to ING for £1.",
    ],
  },
  culpritName: "Alexander Hayes",
  keyExhibitIds: ["ev-statement-88888", "ev-email-meridian", "ev-erroraccount-88"],
  verdict: {},
  unlocks: {
    "ev-statement-88888": { type: "free" },
    "ev-erroraccount-88": { type: "free" },
    "ev-fax-remittance": { type: "keyword", keywords: ["88888888"] },
    "ev-email-meridian": { type: "keyword", keywords: ["88888888"] },
    "ev-redherring-coc": { type: "keyword", keywords: ["1762", "charter", "incorporation"] },
    "ev-orgchart": { type: "clue", requires: "clue-audit-crumpled" },
    "ev-audit-1994": { type: "suspectAsked", suspectId: "geoffrey-barnard" },
    "ev-tradelog-simex": { type: "suspectAsked", suspectId: "alex-hayes" },
  },
  clues: [
    {
      id: "clue-88888",
      text: "The settlement terminal keeps rejecting its day-end run: 'A/C 88888 — UNRECONCILED — sweep failed.' Someone is using the error account as a warehouse.",
    },
    {
      id: "clue-audit-crumpled",
      text: "A crumpled draft memo: 'Finding 88-B — segregation of duties. UNRESOLVED.' Somebody threw away the audit trail. Find the rest of it.",
    },
  ],
  hotspots: [
    {
      id: "hs-filing-cabinet",
      label: "Filing cabinet",
      reveals: { kind: "evidence", id: "ev-statement-88888" },
    },
    {
      id: "hs-terminal",
      label: "Settlement terminal",
      reveals: { kind: "clue", id: "clue-88888" },
    },
    {
      id: "hs-wastebasket",
      label: "Wastebasket",
      reveals: { kind: "clue", id: "clue-audit-crumpled" },
    },
    {
      id: "hs-desk-drawer",
      label: "Desk drawer — locked",
      reveals: { kind: "evidence", id: "ev-erroraccount-88" },
      locked: { requiresClue: "clue-88888" },
    },
  ],
  puzzle: {
    prompt:
      "Sum the four error postings on the Statement of Account 88888 (in £ millions, Nov '94 → Jan '95) and enter the total — the amount that vanished before the balance was carried forward.",
    answer: "226",
    toleranceHint: "Whole number, in £ millions. The four ERROR RECT. lines only.",
  },
};
