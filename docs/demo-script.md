# BolHisab — 2–3 Minute Live Demo Script
**Track 1: Helping Daily Workers and Small Businesses**  
**Tagline:** *“Boliye. Hisaab ho gaya.”*

---

## ⏱️ Timeline Overview

| Time | Section | Focus |
|---|---|---|
| **0:00 – 0:30** | Intro & The Problem | Chaiwala context, dirty/busy hands, why paper and complex apps fail. |
| **0:30 – 1:15** | Live Command & Safety Confirmation | Voice/text input: *"Ramesh ko 40 rupaye udhaar likho."* Safe confirmation preview. |
| **1:15 – 1:45** | The "Two Rameshes" Disambiguation | Resolving duplicate names (*"Ramesh Tailor"* vs *"Ramesh Plumber"*) with local AI brain. |
| **1:45 – 2:15** | Regional Voice & Talk-Back (Kannada/Tamil) | *"ramesh ge estu"* / *"ರಮೇಶ್ಗೆ ಎಷ್ಟು"* with Indic suffix stripping and native voice reply. |
| **2:15 – 2:45** | Balance Math & Overpayment Protection | *"Ramesh ne 50 rupaye de diye."* Integer paise math & blocking impossible payments. |
| **2:45 – 3:15** | Trust, Offline Local-First & Export | 20MB local ONNX AI brain, IndexedDB, zero data leaks, audit trail, JSON/CSV export. |

---

## 🎬 Step-by-Step Walkthrough

### 1. The Hook (0:00 – 0:30)
- **Show:** The warm-paper landing page with the 3D ceramic assistant, **Bolu**, looking at the shopkeeper.
- **Presenter says:**
  > *"Meet Ramesh Bhai, our local chaiwala. In the morning rush, one hand is holding the strainer, the other is boiling milk, and three customers are shouting orders. When someone says 'Bhai kal dunga', Ramesh either forgets to write it or fumbles with an oily smartphone screen.*
  >
  > *This is BolHisab. No crypto, no corporate clutter. Just speak or type in everyday Hindi or Hinglish, and your khata is updated safely."*

### 2. Live Command & Safe Confirmation (0:30 – 1:15)
- **Action:** Scroll to the **Live Demo** section.
- **Click:** The sample chip or type:
  ```text
  Ramesh ko 40 rupaye udhaar likho.
  ```
  *(Or click the microphone icon and speak in Hindi).*
- **Click:** `SAMJHEIN (PROCESS)`.
- **Key Moment:** Point out the **Confirmation Card**.
- **Presenter says:**
  > *"Notice what happened here: BolHisab parsed the command, but it DID NOT automatically change the ledger. Financial trust requires confirmation. It clearly shows: Ramesh, Current balance ₹160, adding ₹40, new balance will be ₹200.*
  >
  > *Only when the shopkeeper taps 'Haan, save karein' does the record write to the local ledger."*
- **Click:** `Haan, save karein`.
- **Show:** The metric card and Ramesh's row update instantly to ₹200.00. Notice the Undo toast alert at the bottom.

### 3. The "Two Rameshes" Disambiguation & Local AI Brain (1:15 – 1:45)
- **Presenter says:**
  > *"Now here is a real-world problem every Indian shopkeeper faces: there are two Rameshes in the neighborhood! Ramesh the Tailor and Ramesh the Plumber. How does the AI know who to charge?"*
- **Action:** Type or speak:
  ```text
  Ramesh ka balance batao.
  ```
- **Show:** The **Disambiguation Card** slides up!
- **Key Moment:** Point out the two options displayed with nicknames and areas:
  - Ramesh (Tailor) · Main Bazar · ₹160.00
  - Ramesh (Plumber) · Station Road · ₹50.00
  And listen to the spoken prompt: *"2 Ramesh mile: Ramesh (Tailor) ya Ramesh (Plumber)? Kise chunna hai?"*
- **Action:** Tap `Ramesh (Tailor)`. The balance (₹160.00) is shown and announced aloud.
- **Presenter says:**
  > *"The system never guesses or combines balances. But if Ramesh Bhai says 'Ramesh Tailor ko 40 rupaye udhaar likho', the local AI brain matches the profession tag directly and skips disambiguation automatically!"*

### 4. Regional Languages & Natural Talk-Back (1:45 – 2:15)
- **Action:** Switch the language dropdown to **ಕನ್ನಡ (Kannada)**.
- **Type or speak:**
  ```text
  ramesh ge estu
  ```
  *(or in native script: `ರಮೇಶ್ಗೆ ಎಷ್ಟು`)*
- **Presenter says:**
  > *"Notice two critical engineering details:
  > 1. In Kannada, people say 'Ramesh-ge' (to/for Ramesh). Our parser strips grammatical case suffixes across 8+ regional languages (-ge, -ku, -la, -ke, -nu), correctly matching customer 'Ramesh'.
  > 2. BolHisab talks back in pure Kannada voice—NO Hindi slang mixed into regional languages!"*
- **Show:** Spoken feedback in Kannada: *"ರಮೇಶ್ (Tailor) ಬಾಕಿ 160 ರೂಪಾಯಿ."*

### 5. Payment & Overpayment Protection (2:15 – 2:45)
- **Action:** Now demonstrate receiving money:
  ```text
  Ramesh Tailor ne 50 rupaye de diye.
  ```
- **Click:** `SAMJHEIN (PROCESS)`.
- **Show:** The preview shows `-₹50.00`, calculated new balance: `₹110.00`.
- **Click:** `Haan, save karein`.
- **Presenter says:**
  > *"Every calculation happens locally in integer paise. And what if someone tries to pay more than what they owe? If we try 'Ramesh ne 500 rupaye diye', the system immediately blocks it with a clear warning: you cannot record a payment greater than the outstanding balance. No negative balances, no bookkeeping drift."*

### 6. Trust, Privacy & Closing (2:45 – 3:15)
- **Action:** Scroll to the **Trust & Safety** section.
- **Show:** The robot face switches to a glowing white shield/checkmark.
- **Presenter says:**
  > *"Let's talk about privacy and safety:
  > 1. All records stay in browser IndexedDB—no customer phone numbers or debts are sent to any cloud.
  > 2. The local AI brain (~23MB ONNX embedding model) runs 100% inside your browser Web Worker/Wasm with zero network dependency.
  > 3. Everything can be exported to JSON/CSV with one click for tax or backup.
  >
  > BolHisab: Boliye. Hisaab ho gaya."*
