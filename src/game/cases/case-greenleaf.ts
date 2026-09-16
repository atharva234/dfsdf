import type { GameCase } from "./types";

/**
 * Case 03 — Case #049: The Revenue Manipulation Scheme (Greenleaf Organics).
 * Fictitious customers, aging-report manipulation, a ₹28L bonus for
 * "exceptional revenue growth" — plus the vendor-overbilling subplot.
 * Solution: Sanjay Gupta · fictitious revenue scheme · ₹72,00,000 loss.
 */
export const GREENLEAF: GameCase = {
  id: "greenleaf-049",
  caseNo: "CASE-049",
  title: "The Revenue Manipulation Scheme",
  company: "Greenleaf Organics Ltd.",
  industry: "Organic Food Products",
  place: "India — corporate HQ",
  period: "January 2026 – December 2026",
  difficulty: "Moderate",
  minutes: 40,
  accusationPrompt: "Who manufactured the revenue?",
  methodPlaceholder:
    "Describe the scheme — the fictitious customers, the aging-report manipulation, the bonus that paid for it…",
  footnote:
    "A fictional training case. Companies, vendors and individuals are fictitious; any resemblance is coincidental.",
  narrative: [
    "Greenleaf Organics grew revenue 60% in a single year. The market called it a darling. The cash account called it something else: down 72%, with profit up and collections lagging sixty days behind every invoice.",
    "Forensic accountants pulled one thread — revenue growth that never became cash — and the file began to unravel: customer accounts created in the same month, contracts with no payment history, aging reports edited at 11:45 p.m. from a device nobody recognises.",
    "Six names appear across the records: a CEO pushing targets, a CFO adjusting revenue, a sales head reporting sales nobody can verify, an AR clerk modifying reports, a sales manager creating accounts, and an external auditor who keeps writing that everything is fine.",
    "Examine the file. Connect the records — a single document never convicts anyone. Then name who manufactured the revenue, how it was hidden, and what it cost.",
  ],
  suspects: [
    {
      id: "rajiv-mehta",
      name: "Rajiv Mehta",
      role: "Chief Executive Officer",
      location: "Mumbai — HQ",
      age: 55,
      motive:
        "Publicly promised 40% growth; privately threatened demotions when quarters missed. The ₹28 lakh 'growth bonus' pool carries his signature.",
      tell:
        "He set the pressure, not the fraud. His own emails demand 'revenue recognition beyond the norm' — but every mechanic of the scheme ran beneath him.",
      transcript: [
        {
          q: "Mr. Mehta, in March you wrote: 'I need revenue recognised beyond the norm this quarter.' Explain.",
          a: "Context matters. We were losing shelf space to two competitors and the board was briefing a down year. I pushed for legitimate pipeline acceleration — pull deals forward, close early. Show me where I asked anyone to invent a customer.",
        },
        {
          q: "Six fictitious distributor accounts. One of them was created 48 hours after that email.",
          a: "(long pause) I approved the bonus pool based on reported revenue. If the revenue was fabricated, then I was the audience of the fabrication, not its author. My crime is credulity, and I'll wear it.",
        },
        {
          q: "You also signed the aging-report waiver that let Q3 receivables skip review.",
          a: "The waiver was standard — the AR team flagged it as a system migration issue. I signed what was put in front of me. That is exactly the problem, isn't it? Nobody put anything in front of me that was true.",
        },
      ],
    },
    {
      id: "sanjay-gupta",
      name: "Sanjay Gupta",
      role: "Chief Financial Officer",
      location: "Mumbai — HQ",
      age: 49,
      motive:
        "His bonus was tied to reported revenue growth. He booked the fictitious sales, adjusted the aging report, and certified the numbers to the auditors.",
      tell:
        "Every forged document traces to his credentials: revenue journals raised by FG017, the aging report edited from his terminal at 11:45 p.m., and the receivable reversals timed the day after each quarter closed.",
      transcript: [
        {
          q: "Mr. Gupta, journal FG017 books ₹1.2 crore of December sales to 'Meridian Distributors'. Who is Meridian?",
          a: "A regional distributor. I… don't have the KYC file in front of me.",
        },
        {
          q: "We checked. Meridian Distributors was registered as a customer on 29 December at 23:41, from inside the finance office, and it has never purchased anything.",
          a: "..... (the recording pauses) ..... If I answer that, I incriminate myself. I'd like counsel before continuing.",
        },
        {
          q: "One last question, then. The aging report — 45 invoices moved from 'over 90 days' to 'current' at 11:45 p.m. on quarter close. That was your login.",
          a: "…I want that noted: the sales team brought me these accounts as real. Vendors overbilled us on logistics and I turned a blind eye to that too. The rot didn't start with me. It just… ended with me holding the pen.",
        },
      ],
    },
    {
      id: "priya-nair",
      name: "Priya Nair",
      role: "Head of Sales",
      location: "Bengaluru",
      age: 42,
      motive:
        "Reported record 'channel expansion' — six new distributors in one quarter. Her commission plan paid on booked revenue, not collected cash.",
      tell:
        "Red herring. The distributor accounts were created from finance, not sales. Her CRM has no opportunities, contacts or orders for any of the six.",
      transcript: [
        {
          q: "Ms. Nair, you announced six new distributors at the January town hall. Walk us through how they were onboarded.",
          a: "That's what I've been asking myself since the audit notice. My team never onboarded them. No field visits, no credit checks, no purchase orders — nothing in the CRM. I reported the numbers because they arrived in my dashboard with finance's stamp on them.",
        },
        {
          q: "So you claimed credit for sales you couldn't verify?",
          a: "I claimed credit for numbers the company itself reported. Should I have audited my own CFO? (pause) Yes. Apparently yes. My commission is being clawed back and frankly the worst part is I celebrated those numbers.",
        },
        {
          q: "Did you ever meet Meridian Distributors, or Sunrise Traders, or any of the six?",
          a: "I've never heard those names outside this room.",
        },
      ],
    },
    {
      id: "amit-desai",
      name: "Amit Desai",
      role: "Accounts Receivable Clerk",
      location: "Mumbai — HQ",
      age: 31,
      motive:
        "Modified aging reports on instruction 'from above'. Kept a private log of every change after he realised the pattern.",
      tell:
        "The whistleblower. His private log names the dates, the invoices and the instruction chain — and it points at FG017 and one terminal on the third floor.",
      transcript: [
        {
          q: "Mr. Desai, 45 invoices were reclassified from 'over 90 days' to 'current' on two nights. Your credentials on one batch.",
          a: "I was told to run the reclassification script by the CFO's office — 'provisional migration cleanup', the ticket said. I did the first batch. When I saw the second batch, in December, I knew. Invoices don't migrate. People migrate them.",
        },
        {
          q: "You kept a private log.",
          a: "Every change, dated, with who asked and what the ticket said. I emailed it to myself from a personal address. If this company collapses, the log survives. That's not loyalty to the truth — that's just arithmetic.",
        },
        {
          q: "Why didn't you report it in December?",
          a: "To whom? The certification chain ends at the same desk the changes came from. (pause) I'm reporting it now.",
        },
      ],
    },
    {
      id: "kavita-rao",
      name: "Kavita Rao",
      role: "Sales Manager — West Zone",
      location: "Ahmedabad",
      age: 38,
      motive:
        "Created two of the six distributor accounts in the CRM after being handed 'pre-cleared' onboarding packs she didn't author.",
      tell:
        "She created the account shells but the KYC documents inside them were forged before they reached her. Her device timestamps show upload only — authorship sits elsewhere.",
      transcript: [
        {
          q: "Ms. Rao, you created the 'Sunrise Traders' account on 2 October. Tell us about the onboarding pack.",
          a: "It arrived from the finance side — registration certificate, GST letter, bank letter, all pre-filled. My job was to enter it. I remember thinking the bank letter looked photocopied. I remember entering it anyway.",
        },
        {
          q: "You suspected forgery and proceeded?",
          a: "I suspected nothing because I wanted my quarter to close. That's the honest answer and it's the damning one. But I never invented the account — I typed what was handed to me.",
        },
        {
          q: "Who handed it to you?",
          a: "A shared drive folder, 'onboarding-packs', maintained by finance. The folder has write access from one user ID. You already know which one.",
        },
      ],
    },
    {
      id: "vikram-sethi",
      name: "Vikram Sethi",
      role: "External Auditor — Sethi & Associates",
      location: "Mumbai",
      age: 61,
      motive:
        "Signed clean opinions for three consecutive years. His firm also earns ₹18 lakh a year in 'advisory fees' from Greenleaf — separate from the audit.",
      tell:
        "Conflict of interest. His workpapers flag revenue concentration and uncollected receivables, then accept management's oral explanations without third-party confirmation.",
      transcript: [
        {
          q: "Mr. Sethi, your 2026 workpapers note 'unusual revenue concentration in six newly registered distributors'. Then you issued a clean opinion. Why?",
          a: "Because management provided explanations. Circularisation confirmed two of the six addresses — post offices, I might add, but confirmed on paper. An auditor works through confirmation, not suspicion.",
        },
        {
          q: "Your firm billed ₹18 lakh in advisory fees to the same company you audit. How is that not a conflict?",
          a: "The engagements are firewalled and disclosed in our engagement letter's annex. (pause) I'm aware the annex is 40 pages long and the disclosure is on page 38.",
        },
        {
          q: "One of the 'confirmed' distributors turned out to be a mail drop registered the week before year-end.",
          a: "Then the confirmations were engineered, and I confirmed a fiction. I'll be revisiting every opinion I've signed for this client. So will my insurer, I imagine.",
        },
      ],
    },
  ],
  evidence: [
    {
      id: "ev-gl-brief",
      title: "Case File — Greenleaf Organics Ltd.",
      kind: "audit-report",
      group: "Case File",
      date: "FY 2026",
      source: "Board-commissioned forensic review — Case #049",
      size: "2 pages",
      excerpt:
        "The paradox: revenue up 60%, cash down 72%, profit up. Plus the three schemes the review must untangle.",
      lines: [
        { t: "kv", k: "COMPANY", v: "Greenleaf Organics Ltd." },
        { t: "kv", k: "LOCATION", v: "India — corporate HQ" },
        { t: "kv", k: "INDUSTRY", v: "Organic Food Products" },
        { t: "kv", k: "PERIOD", v: "January 2026 – December 2026" },
        { t: "divider" },
        { t: "hl", v: "THE PARADOX — revenue +60%, cash −72%, profit +18%. Sales that never become cash are not sales." },
        { t: "p", v: "The review spans three suspected irregularities: (1) revenue recognised for customers that may not exist, (2) receivables aging manipulated to hide collection failure, (3) vendor overbilling on logistics contracts. They may be connected. They may not." },
        { t: "divider" },
        { t: "hl", v: "FINANCIAL-IMPACT BANDS — classify the suspected loss" },
        { t: "mono", v: "A  ₹0 – ₹5 lakh      B  ₹5 – ₹10 lakh     C  ₹10 – ₹20 lakh" },
        { t: "mono", v: "D  ₹20 – ₹30 lakh    E  ₹30 – ₹50 lakh    F  > ₹50 lakh" },
        { t: "p", v: "Investigation rule: do not rely on a single record. Connect the customer registrations, the journal entries, the aging edits and the bonus approvals before you accuse anyone." },
        { t: "stamp", v: "CONFIDENTIAL — CASE #049" },
      ],
    },
    {
      id: "ev-gl-financials",
      title: "Financial Summary — FY2026 vs FY2025",
      kind: "ledger",
      group: "Financials",
      date: "Dec 2026",
      source: "Finance — consolidated management accounts",
      size: "2 tables",
      excerpt:
        "Revenue ₹187 Cr (+60%), operating cash flow −72%, receivables 2.3×. The arithmetic that starts the case.",
      lines: [
        { t: "mono", v: "ITEM                    FY2025      FY2026" },
        { t: "mono", v: "Revenue                 ₹117.0 Cr   ₹187.2 Cr   (+60%)" },
        { t: "mono", v: "Reported net profit     ₹9.4 Cr     ₹11.1 Cr    (+18%)" },
        { t: "hl", v: "OPERATING CASH FLOW     ₹18.9 Cr    ₹5.3 Cr     (−72%)" },
        { t: "mono", v: "Accounts receivable     ₹14.2 Cr    ₹33.4 Cr    (2.3×)" },
        { t: "mono", v: "DSO (days sales out.)   44 days     66 days" },
        { t: "divider" },
        { t: "mono", v: "NEW 'DISTRIBUTOR' REVENUE   FY2025: ₹0   FY2026: ₹21.6 Cr" },
        { t: "mono", v: "  Meridian Distributors                ₹8.4 Cr" },
        { t: "mono", v: "  Sunrise Traders                      ₹6.2 Cr" },
        { t: "mono", v: "  Four others (combined)               ₹7.0 Cr" },
        { t: "mono", v: "  Collected cash against the six:      ₹3.1 Cr  (14%)" },
        { t: "divider" },
        { t: "p", v: "Six accounts that did not exist in FY2025 booked ₹21.6 Cr of FY2026 revenue and paid 14 paise on the rupee. Every remaining exhibit in this file hangs off that hook." },
        { t: "stamp", v: "MANAGEMENT ACCOUNTS — FORENSIC COPY" },
      ],
    },
    {
      id: "ev-gl-crm",
      title: "Customer Master Extract — Six New Distributors",
      kind: "audit-report",
      group: "Customers",
      date: "Oct–Dec 2026",
      source: "CRM + customer master — created-by / created-from audit fields",
      size: "6 records",
      excerpt:
        "All six created within one quarter, after hours, from finance terminals. None passed credit review.",
      lines: [
        { t: "mono", v: "ACCOUNT               CREATED      TIME   TERMINAL   CREATOR" },
        { t: "mono", v: "Meridian Distrib.     29 Dec 26    23:41  FIN-03     FG017" },
        { t: "mono", v: "Sunrise Traders       02 Oct 26    20:55  FIN-01     KR044*" },
        { t: "mono", v: "Bharat Fresh Co.      11 Oct 26    22:17  FIN-03     FG017" },
        { t: "mono", v: "Evergreen Supply      19 Oct 26    21:03  FIN-03     FG017" },
        { t: "mono", v: "Metro Organics        07 Nov 26    23:29  FIN-01     KR044*" },
        { t: "mono", v: "Prime Leaf Traders   21 Nov 26    20:47  FIN-03     FG017" },
        { t: "divider" },
        { t: "hl", v: "*KR044 uploaded pre-filled onboarding packs from a finance-maintained shared folder. FG017 authored the packs." },
        { t: "p", v: "Notes: zero credit-review approvals on file (policy requires one). Four of six registered addresses are mail drops; two are vacant plots per the field team. 'Meridian Distributors' was registered 48 hours after the CEO's 'revenue beyond the norm' email — from a finance terminal, not a sales one." },
        { t: "stamp", v: "SYSTEM AUDIT FIELDS — IMMUTABLE" },
      ],
    },
    {
      id: "ev-gl-journals",
      title: "Journal Entry Log — FG017 Revenue Entries",
      kind: "ledger",
      group: "Financials",
      date: "2026",
      source: "GL entry log — revenue journals, user FG017",
      size: "9 entries",
      excerpt:
        "Every fictitious sale booked by one user ID, always in the last 72 hours of a quarter, always just below approval thresholds.",
      lines: [
        { t: "mono", v: "JE-ID     DATE         USER   DEBIT                 CREDIT" },
        { t: "hl", v: "JE-2211   30 Jun 26    FG017  AR — Meridian ₹4.2 Cr    Revenue ₹4.2 Cr" },
        { t: "mono", v: "JE-2245   28 Sep 26    FG017  AR — Meridian ₹2.1 Cr    Revenue ₹2.1 Cr" },
        { t: "hl", v: "JE-2246   28 Sep 26    FG017  AR — Sunrise  ₹1.9 Cr    Revenue ₹1.9 Cr" },
        { t: "mono", v: "JE-2262   29 Dec 26    FG017  AR — Meridian ₹2.1 Cr    Revenue ₹2.1 Cr" },
        { t: "mono", v: "JE-2263   29 Dec 26    FG017  AR — Sunrise  ₹2.2 Cr    Revenue ₹2.2 Cr" },
        { t: "mono", v: "JE-2264   29 Dec 26    FG017  AR — Bharat   ₹1.8 Cr    Revenue ₹1.8 Cr" },
        { t: "mono", v: "JE-2265   29 Dec 26    FG017  AR — Evergrn  ₹1.7 Cr    Revenue ₹1.7 Cr" },
        { t: "mono", v: "JE-2266   29 Dec 26    FG017  AR — Metro    ₹1.6 Cr    Revenue ₹1.6 Cr" },
        { t: "mono", v: "JE-2267   29 Dec 26    FG017  AR — Prime    ₹1.9 Cr    Revenue ₹1.9 Cr" },
        { t: "divider" },
        { t: "p", v: "Pattern: revenue is booked in bursts inside the final 72 hours of each quarter — classic cut-off manipulation. Every entry is raised by FG017 (the CFO's finance ID). No supporting invoice, delivery note or customer PO is attached to any of the nine entries." },
        { t: "stamp", v: "GL ENTRY LOG — NO SOURCE DOCUMENTS" },
      ],
    },
    {
      id: "ev-gl-aging",
      title: "Aging Report — Before & After Manipulation",
      kind: "ledger",
      group: "Financials",
      date: "30 Sep / 29 Dec 2026",
      source: "AR aging snapshots — version history preserved",
      size: "2 snapshots",
      excerpt:
        "45 invoices worth ₹11.8 Cr reclassified from 'over 90 days' to 'current' in two after-midnight edits.",
      lines: [
        { t: "hl", v: "SNAPSHOT 1 — 30 SEP 2026 (published)" },
        { t: "mono", v: "Current        ₹8.1 Cr" },
        { t: "mono", v: "31–60 days     ₹6.4 Cr" },
        { t: "mono", v: "61–90 days     ₹2.2 Cr" },
        { t: "mono", v: "Over 90 days   ₹3.1 Cr" },
        { t: "divider" },
        { t: "hl", v: "SNAPSHOT 1 — EDITED VERSION (22:14, 30 Sep)" },
        { t: "mono", v: "Current        ₹14.6 Cr   (+₹6.5 Cr reclassified)" },
        { t: "mono", v: "Over 90 days   ₹0.7 Cr    (45 invoices moved)" },
        { t: "divider" },
        { t: "hl", v: "SNAPSHOT 2 — 29 DEC 2026 (edited 23:45)" },
        { t: "mono", v: "Current        ₹19.8 Cr   (+₹5.3 Cr reclassified)" },
        { t: "mono", v: "Over 90 days   ₹0.2 Cr" },
        { t: "divider" },
        { t: "p", v: "Version history: the 30 September edit came from terminal FIN-01 (login AR-desk, elevated session opened by FG017). The 31 December edit came from FG017 directly. Both edits were reversed silently in January once the auditors left — the trail survives only because the system kept snapshots." },
        { t: "stamp", v: "VERSION HISTORY — PRESERVED EVIDENCE" },
      ],
    },
    {
      id: "ev-gl-bonus",
      title: "Compensation Committee Minute — Growth Bonus",
      kind: "audit-report",
      group: "Case File",
      date: "15 Jan 2027",
      source: "Board compensation committee — minute 2027/03",
      size: "1 page",
      excerpt:
        "A ₹28 lakh 'exceptional revenue growth' bonus — ₹19 lakh of it to the CFO who booked the sales.",
      lines: [
        { t: "kv", k: "MINUTE", v: "2027/03 — SPECIAL AWARD: EXCEPTIONAL REVENUE GROWTH" },
        { t: "divider" },
        { t: "mono", v: "SANJAY GUPTA (CFO)            ₹19,00,000" },
        { t: "mono", v: "RAJIV MEHTA (CEO)             ₹6,00,000" },
        { t: "mono", v: "PRIYA NAIR (HEAD OF SALES)    ₹3,00,000" },
        { t: "divider" },
        { t: "p", v: "The award cites '60% revenue growth and successful channel expansion into six new distribution partners'. The committee was not told that cash collection against those partners was 14%, nor that the CFO personally booked every sale." },
        { t: "hl", v: "Forensic note: the bonus mechanism paid on booked revenue. Whoever controls the booking controls the bonus. Follow the authorisation trail: who booked, who certified, who collected." },
        { t: "stamp", v: "BOARD MINUTE — CERTIFIED COPY" },
      ],
    },
    {
      id: "ev-gl-vendor",
      title: "Logistics Vendor Overbilling — ColdChain Freight",
      kind: "po-invoice",
      group: "Vendors",
      date: "2026",
      source: "Procurement + AP — rate card vs invoiced rates",
      size: "4 documents",
      excerpt:
        "The subplot: ₹9 lakh overbilled on approved rate cards — invoiced rates 18% above contract, paid without three-way match.",
      lines: [
        { t: "hl", v: "CONTRACT RATE CARD — COLDCHAIN FREIGHT (annual)" },
        { t: "mono", v: "Reefer truck / km            ₹142" },
        { t: "mono", v: "Cold storage / pallet-day    ₹38" },
        { t: "divider" },
        { t: "hl", v: "ACTUALLY INVOICED (sample, Q3)" },
        { t: "mono", v: "Reefer truck / km            ₹168  (+18%)" },
        { t: "mono", v: "Cold storage / pallet-day    ₹47   (+24%)" },
        { t: "divider" },
        { t: "p", v: "AP paid 11 consecutive invoices at the inflated rates. Three-way match was waived on all eleven — the waiver field reads 'relationship vendor, rates agreed by finance'. Rate cards are owned by procurement; no procurement signature exists on any change." },
        { t: "hl", v: "Estimated overbilling FY2026: ₹9,10,000. Contact at ColdChain: R. Ahuja — introduced to AP by the CFO's office in Feb 2026." },
        { t: "p", v: "Forensic note: real leakage, but an order of magnitude smaller than the revenue scheme. If the case asks you to classify the company's biggest loss, do not stop at the vendors." },
        { t: "stamp", v: "PROCUREMENT EXCEPTION REPORT" },
      ],
    },
    {
      id: "ev-gl-emails",
      title: "Email Capture — Pressure & Instruction Chain",
      kind: "comm-log",
      group: "Communications",
      date: "Mar–Dec 2026",
      source: "Forensic mailbox capture — selected threads",
      size: "7 messages",
      excerpt:
        "From the CEO's demand, to the CFO's instruction, to the clerk's private log — the chain in their own words.",
      lines: [
        { t: "hl", v: "GL-01 · 27 Mar · Rajiv Mehta → leadership (all)" },
        { t: "p", v: "“I need revenue recognised beyond the norm this quarter. People who can't deliver should think about whether this is the right seat for them.”" },
        { t: "hl", v: "GL-02 · 28 Jun · Sanjay Gupta → Amit Desai" },
        { t: "p", v: "“Run the migration cleanup script on the aging report tonight. Provisional only. Do not email about this.”" },
        { t: "hl", v: "GL-03 · 02 Oct · Finance shared-drive notification → Kavita Rao" },
        { t: "p", v: "“New onboarding pack available: Sunrise Traders (pre-cleared). Folder: /finance/onboarding-packs.”" },
        { t: "hl", v: "GL-04 · 14 Nov · Sanjay Gupta → Kavita Rao" },
        { t: "p", v: "“Enter the Metro Organics pack today. Registration docs are in the folder. No need to route through credit review — pre-cleared.”" },
        { t: "hl", v: "GL-05 · 29 Dec · Sanjay Gupta → self (drafts folder)" },
        { t: "p", v: "“Q4 numbers final. FY close +60%. Bonus letters to go out with the results release.”" },
        { t: "hl", v: "GL-06 · 05 Jan · Amit Desai → personal address" },
        { t: "p", v: "“Log update: second reclassification tonight, FG017 again. Keeping dated copies. If anyone asks later — I asked twice, in writing, and was told to stay in my lane.”" },
        { t: "hl", v: "GL-07 · 11 Jan · Priya Nair → Rajiv Mehta" },
        { t: "p", v: "“I cannot verify a single order behind the six distributors. I'm reporting this rather than presenting it.”" },
        { t: "divider" },
        { t: "p", v: "Read the chain: the demand (GL-01) is not the crime; the mechanics (GL-02, GL-04) and the bookings (FG017) are. The instruction 'no need to route through credit review' is the sentence the whole case turns on." },
        { t: "stamp", v: "PRESERVED — FORENSIC MAILBOX CAPTURE" },
      ],
    },
    {
      id: "ev-gl-certs",
      title: "Auditor Workpapers & Fee Disclosure",
      kind: "audit-report",
      group: "Case File",
      date: "2026",
      source: "Sethi & Associates — workpaper extract + engagement annex",
      size: "3 pages",
      excerpt:
        "Flags raised, then explained away — and ₹18 lakh of advisory fees to the firm signing the opinion.",
      lines: [
        { t: "kv", k: "AUDIT FIRM", v: "Sethi & Associates" },
        { t: "kv", k: "STATUTORY FEE", v: "₹12,00,000" },
        { t: "kv", k: "ADVISORY FEES (same client)", v: "₹18,00,000 — annex p.38" },
        { t: "divider" },
        { t: "hl", v: "WP-11 (finalised): 'Revenue concentration in six newly registered distributors — 11.5% of FY2026 revenue. Recommend third-party circularisation of all six.'" },
        { t: "p", v: "Workpaper WP-13 records that only two of six confirmations were returned, both 'verified by registered post'. The field team later identified both addresses as postal drops." },
        { t: "hl", v: "WP-18: 'Management explained receivables aging anomaly as a system migration artifact. Explanation accepted. No independent testing performed.'" },
        { t: "divider" },
        { t: "p", v: "Opinion issued: unmodified (clean), 14 February 2027. The external auditor is a witness to control failure — his fees and accepted explanations are relevant, but the auditor did not book the sales. Keep the accusation on the person who held the pen." },
        { t: "stamp", v: "PRIVILEGED — WORKPAPER EXTRACT" },
      ],
    },
    {
      id: "ev-gl-redherring",
      title: "Factory Expansion Proposal — Phase III",
      kind: "audit-report",
      group: "Vendors",
      date: "Nov 2026",
      source: "Operations — capital expenditure proposal",
      size: "1 page",
      excerpt:
        "A ₹40 Cr expansion plan that looks sinister next to fake revenue. It is just a plan. Magnificent. Entirely irrelevant.",
      lines: [
        { t: "kv", k: "PROPOSAL", v: "Phase III processing capacity — ₹40 Cr capex" },
        { t: "kv", k: "STATUS", v: "AWAITING BOARD APPROVAL — NOT SANCTIONED" },
        { t: "divider" },
        { t: "p", v: "The proposal projects 45% capacity growth and references 'strong revenue momentum'. It was drafted using the inflated FY2026 revenue figures, which is embarrassing, but no funds moved and no purchase orders exist." },
        { t: "p", v: "Some documents appear in a case file because a good case file has too many documents. The money that vanished left through revenue journals, not capex approvals." },
        { t: "stamp", v: "DRAFT — NOT EXECUTED" },
      ],
    },
  ],
  hints: [
    {
      id: "gl-hint-1",
      cost: 250,
      text: "Start at the customer master: six distributors, all created after hours, four from one terminal (FIN-03) under one user ID — FG017. Map FG017 to the personnel list, then check who raised journal entries JE-2211 → JE-2267.",
    },
    {
      id: "gl-hint-2",
      cost: 250,
      text: "Cash is the tell. ₹21.6 Cr of 'new distributor' revenue collected 14% — and the aging report was edited at night to hide exactly that. Follow who opened the elevated session on 30 September and who edited on 29 December. Same ID, both times.",
    },
    {
      id: "gl-hint-3",
      cost: 250,
      text: "Do the arithmetic for the verdict: fictitious revenue booked ₹21.6 Cr minus the ₹3.1 Cr collected, plus ₹9.1 lakh vendor overbilling, against the ₹28 lakh bonus pool — the review's headline loss is the fictitious revenue itself: ₹21.6 Cr booked, ₹18.5 Cr uncollected and reversed. That lands in band F (>₹50 lakh). The ₹9.1L vendor subplot is real but small.",
    },
  ],
  solution: {
    headline:
      "CFO Sanjay Gupta booked ₹21.6 Cr of fictitious revenue through six shell distributors (journal ID FG017), then edited the aging reports after midnight to hide the 14% collection rate — and took ₹19 lakh of the ₹28 lakh growth bonus the fake numbers triggered.",
    points: [
      "The mechanism: nine revenue journals (JE-2211 → JE-2267), every one raised by FG017 — Sanjay Gupta's finance ID — in the final 72 hours of Q2, Q3 and Q4. No invoices, delivery notes or customer POs support any entry. The six distributor accounts were created after hours, four of them from his terminal FIN-03.",
      "The concealment: 45 overdue invoices (₹11.8 Cr) were reclassified from 'over 90 days' to 'current' in two night edits — 30 September from an elevated session FG017 opened, 29 December directly by FG017. Both edits were silently reversed in January, after the audit. The aging snapshots survived in version history.",
      "The onboarding chain: 'pre-cleared' packs were forged on a finance shared folder; Kavita Rao typed two of them in and skipped credit review on the CFO's written instruction — 'no need to route through credit review'. The account shells were the execution; the forgery and instruction were the scheme.",
      "The payout: the compensation committee awarded ₹28 lakh for '60% revenue growth' — ₹19 lakh of it to Gupta himself. The bonus paid on booked revenue, so controlling the booking was controlling the bonus.",
      "The red herrings: CEO Mehta's pressure email is context, not authorship; Nair reported the numbers she was given and later blew the whistle in writing (GL-07); clerk Desai followed one instruction then kept a dated private log; the external auditor accepted explanations he shouldn't have; ColdChain overbilled ₹9.1 lakh — real leakage, but an order of magnitude below the revenue scheme.",
    ],
  },
  culpritName: "Sanjay Gupta",
  keyExhibitIds: ["ev-gl-journals", "ev-gl-crm", "ev-gl-aging"],
  verdict: {
    impact: {
      label: "Financial impact — which band covers the primary loss?",
      placeholder: "Compute it: fictitious revenue booked vs collected, plus the vendor subplot",
      options: [
        { id: "a", label: "A — ₹0–₹5 lakh" },
        { id: "b", label: "B — ₹5–₹10 lakh" },
        { id: "c", label: "C — ₹10–₹20 lakh" },
        { id: "d", label: "D — ₹20–₹30 lakh" },
        { id: "e", label: "E — ₹30–₹50 lakh" },
        { id: "f", label: "F — >₹50 lakh" },
      ],
      answerId: "f",
    },
  },
};
