/**
 * The Vanishing Ledger — case content.
 * A fictionalized case modeled on the 1995 Barings Bank collapse:
 * a 233-year-old merchant bank destroyed by one desk in Singapore,
 * an error account nobody watched, and a funding pipeline nobody questioned.
 */

export const CASE = {
  caseNo: "VL-1995-88888",
  title: "The Vanishing Ledger",
  company: "Meridian Sovereign Bank",
  founded: "1762",
  place: "Singapore Futures Exchange",
  date: "February 1995",
  videoId: "pfYTja5ZKAY",
  narrative: [
    "For two hundred and thirty-three years, Meridian Sovereign Bank financed empires. Queen Victoria kept an account there. So did her critics. The bank survived Napoleon, two world wars, and the 1987 crash. It did not survive February of 1995.",
    "Over one long weekend, £860,000,000 evaporated from its books. No vault was robbed. No forger signed a cheque. On paper, nothing is missing at all — and that is precisely the problem.",
    "You are the forensic review team, convened at 6:00 a.m. by the Bank of Alderney before the markets open. Somewhere in this case file is the moment the money began to vanish, the person who made it vanish, and the paper trail they left behind.",
    "Four people had the access. One of them emptied the bank. Find the who, the how, and the exhibits that prove it — then file your verdict before the clock runs out.",
  ],
  solution: {
    headline: "Alexander Hayes hid the losses in Error Account 88, funded them with office remittances, and booked fictitious profits against Barings' own client margin accounts.",
    points: [
      "Account 88888 — five eights, the error account — was created in 1992 as a gutter for booking mistakes. Every trade error was supposed to be squared by end of day. Nobody ever checked it, because nobody was supposed to be able to trade AND reconcile on the same desk. Hayes held both keys.",
      "Rather than book losses, Hayes parked them in 88888 and booked matching fictitious profits to his own trading book — reporting £18M of 'profit' in 1994 on a desk whose real position was a £208M hole.",
      "To keep the fictitious profits paid out, Hayes demanded £35M in office remittances — cash supposedly owed by clients for margin calls. He wired it to his own account 88888888 at Citibank. The 'clients' did not exist.",
      "On 23 February, an SIMEX audit noticed the missing margin money. That evening, Hayes fled Singapore. The next morning, the bank's flagship product — its own name — was worthless. Barings was sold to ING for £1.",
    ],
  },
} as const;

export type Suspect = {
  id: string;
  name: string;
  role: string;
  location: string;
  age: number;
  motive: string;
  transcript: { q: string; a: string }[];
  tell: string;
};

export const SUSPECTS: Suspect[] = [
  {
    id: "alex-hayes",
    name: "Alexander Hayes",
    role: "General Manager, Singapore Branch — Head of Trading & Settlement",
    location: "Singapore",
    age: 28,
    motive: "Bonus-obsessed. Famously lost £50M of client money in Tokyo in 1992 and rebuilt his reputation — and his bonus — from a single desk in Singapore.",
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
      },
      {
        q: "One document is missing from your file, Mr. Hayes. The client confirmations.",
        a: "..... (the recording continues for 11 minutes) ..... I'll need my counsel for the rest of this.",
      },
    ],
  },
  {
    id: "sarah-ting",
    name: "Sarah Ting",
    role: "Finance Officer, Singapore Branch — Futures & Options Settlement",
    location: "Singapore",
    age: 34,
    motive: "The only person who actually read the reconciliations — and she filed a memo on 11 January flagging the exact account. Nobody in London answered it.",
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
      },
    ],
  },
  {
    id: "ron-baker",
    name: "Ronald Baker",
    role: "Head of Global Equities & Derivatives — London",
    location: "London",
    age: 49,
    motive: "Championed Hayes, funded him, and defended him. He signed off on unlimited funding lines for a desk he never once audited — because the desk's 'profits' were paying for his bonus pool.",
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
    motive: "Wrote a 1994 internal audit that listed 'segregation of duties' at the Singapore branch as an UNRESOLVED HIGH RISK. He closed the finding when London management promised a fix that never came.",
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
];

export type Hint = { id: string; cost: number; text: string };

export const HINTS: Hint[] = [
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
];
