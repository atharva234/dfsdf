/**
 * The Vanishing Ledger — evidence exhibits.
 * Each exhibit renders in a DocumentModal styled as a scanned/digital record.
 * `body` uses line objects; the modal styles by type.
 */

export type EvidenceKind =
  | "bank-statement"
  | "email"
  | "trade-log"
  | "org-chart"
  | "fax"
  | "audit-report";

export type EvidenceLine =
  | { t: "kv"; k: string; v: string }
  | { t: "mono"; v: string }
  | { t: "p"; v: string }
  | { t: "sign"; v: string }
  | { t: "stamp"; v: string }
  | { t: "hl"; v: string }
  | { t: "divider" }; // highlighted line

export type EvidenceDoc = {
  id: string;
  title: string;
  kind: EvidenceKind;
  date: string;
  source: string;
  size: string;
  excerpt: string;
  lines: EvidenceLine[];
};

export const EVIDENCE: EvidenceDoc[] = [
  {
    id: "ev-statement-88888",
    title: "Statement of Account No. 88888",
    kind: "bank-statement",
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
    kind: "audit-report",
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
    kind: "fax",
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
    kind: "bank-statement",
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
];

export const EVIDENCE_BY_ID: Record<string, EvidenceDoc> = Object.fromEntries(
  EVIDENCE.map((e) => [e.id, e]),
);
