# BolHisab Pitch Deck Outline (7 Slides)
**Track 1: Helping Daily Workers and Small Businesses**  
**Tagline:** *“Boliye. Hisaab ho gaya.”*

---

## Slide 1: Title, Team & Track
- **Project Name:** BolHisab
- **Tagline:** Boliye. Hisaab ho gaya. (Speak. The ledger is done.)
- **Track:** VibeX Codes Track 1 — Helping Daily Workers and Small Businesses.
- **Mission:** Empowering micro-merchants, chaiwalas, and neighborhood shopkeepers with a voice-first, safe, local-first khata assistant.
- **Visual:** Ceramic assistant "Bolu" on paper grid with warm orange-pink gradient.

---

## Slide 2: Target User & The Morning Rush Problem
- **The User:** Small tea stall owners (chaiwalas), kirana store owners, vegetable vendors, and daily wage micro-merchants.
- **The Real-World Context:**
  - Wet, milk-stained, or oily hands while brewing chai or weighing goods.
  - Constant interruptions and noisy environments.
  - High volume of small micro-credit ("Bhai kal subah dunga ₹40").
- **The Core Failure of Existing Tools:**
  - Traditional paper khatas get soiled, lost, or forgotten during peak rush hours.
  - Mainstream digital apps require 6+ screen taps, keyboard typing, and steady internet.
  - Voice apps often suffer from accidental transactions and hallucinated AI balances.

---

## Slide 3: BolHisab Solution & Workflow
- **Voice-First Input:** Speak naturally in Hindi, Hinglish, or English (`hi-IN` / `en-IN` Web Speech API) or fast single-field typing.
- **The 4-Step Safety Workflow:**
  1. **Speak / Type:** Shopkeeper speaks or types the command (e.g., *"Ramesh ko 40 rupaye udhaar likho"*).
  2. **Deterministic Parse:** The system extracts structured intent without executing.
  3. **Visual Confirmation Card:** Displays exact customer, previous balance, delta, and calculated new balance.
  4. **Explicit Tap to Save:** Nothing changes in the ledger until the shopkeeper explicitly clicks *"Haan, save karein"*.

---

## Slide 4: Live Product & Transaction Architecture
- **Interactive Capabilities:**
  - **Udhaar Management:** Track credit given, payments received, and outstanding balances.
  - **Payment Guardrails:** Prevents recording payments higher than outstanding debt (no negative balances).
  - **Daily Roznamcha (Today's Khata):** Real-time ledger summary of today's credit extended vs. cash collected.
  - **Inventory Tracking:** Real-time restock commands (*"Doodh ke 20 packet stock mein jodo"*) with low-stock alerts.
  - **WhatsApp Reminder Drafts:** One-click copy for polite payment reminders without automated spam.

---

## Slide 5: AI & System Architecture
- **Local-First Deterministic Core:**
  - Zero external dependency required: Works completely offline using a local regex and NLP command parser.
  - Devanagari digit normalization (`०-९` $\to$ `0-9`).
  - Integer paise accounting (`Math.round(rupees * 100)`) preventing floating point drift.
- **Optional Hybrid AI Bridge (`server.mjs`):**
  - Optional server-side LLM parser for colloquial variations.
  - **Strict Privacy Barrier:** Only the raw command prompt is processed; customer lists, phone numbers, and financial balances are *never* sent to an external API.
  - Strict allowlist schema validation on all incoming responses.

---

## Slide 6: Safety, Privacy, Verification & Limitations
- **Safety Principles:**
  1. *Confirm Before Save:* Voice transcripts and AI outputs are previews, never transactions.
  2. *Auditable Math:* Reversal entries and one-click Undo instead of silent record deletion.
  3. *Zero Cloud Lock-in:* Data persists in browser native IndexedDB with JSON/CSV export.
- **Known Limitations & Honest Scope:**
  - Web Speech API requires browser support (Chrome/Edge recommended; fallback to typing on unsupported devices).
  - Does not process direct UPI payments or automatically send SMS (drafts provided for user control).
  - Local database is per-browser profile unless exported.

---

## Slide 7: Links, Demo & Verification
- **Repository:** Self-contained single-page application (`index.html`) + optional server (`server.mjs`).
- **Live Demo Flow:** Tested on 10+ core test scenarios including Devanagari digits, overpayments, and stock restocks.
- **No-Framework Design:** Pure Three.js 0.160.0, Vanilla JS, CSS3, Native IndexedDB.
- **Demo Video / GitHub:** Ready for local execution and presentation.
