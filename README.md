# BolHisab (बोलहिसाब)
> **“Boliye. Hisaab ho gaya.”**  
> *A voice-first daily ledger for chaiwalas and small shops.*  
> **Track:** VibeX Codes Track 1 — Helping daily workers and small businesses.

BolHisab is an offline-capable, local-first voice ledger assistant designed for small shopkeepers, chaiwalas, and neighborhood vendors who need to record credit (*udhaar*), cash payments, and inventory while keeping their hands free.

Featuring a warm paper-grid design and an interactive 3D ceramic assistant, **Bolu**, built with pure Three.js.

---

## ⚡ Quick Start

### Option A: Direct Static (No server required)
Simply double-click or open `index.html` in any modern web browser (Google Chrome, Microsoft Edge, Safari, Firefox).  
BolHisab runs **100% offline** using its built-in local multi-lingual parser, in-browser neural AI brain, and browser IndexedDB.

### Option B: Local Node.js Server (Recommended for Speech API & Clean Localhost Serving)
Speech Recognition (`webkitSpeechRecognition`) and Speech Synthesis (`speechSynthesis`) work best when served over `http://localhost` or HTTPS.

Run with Node.js (v18+ with zero npm dependencies):
```bash
node server.mjs
```
Then visit: **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧠 In-Browser Local AI Brain & "Two Rameshes" Disambiguation

### 1. The 20MB Local Neural AI Brain (`all-MiniLM-L6-v2`)
- **100% Client-Side Privacy:** Powered by dynamic import of `@xenova/transformers` (`Xenova/all-MiniLM-L6-v2`, ~23MB quantized ONNX model) running directly inside the browser Web Worker/Wasm context.
- **Zero Cloud Leaks:** Customer financial balances and contact details **never** leave the device.
- **Instant Fallback (0 KB):** If offline or network-isolated, BolHisab instantly falls back to its built-in sub-millisecond local semantic vector matcher without missing a beat.
- **Live Status Badge:** Displayed in the console header (`#ai-brain-badge`):
  - `AI BRAIN: FAST LOCAL (0KB)`
  - `AI BRAIN: ONNX READY (23MB)`

### 2. Disambiguating Duplicate Customers ("Two Rameshes" Problem)
In real Indian mohallas, every neighborhood has multiple people with the same common name (e.g., *Ramesh Tailor* vs. *Ramesh Plumber*):
- **Never Guess or Combine Balances:** If a shopkeeper asks *"Ramesh ka balance batao"* or *"Ramesh ko 40 rupaye udhaar likho"*, BolHisab identifies all matching customers and immediately presents an interactive **Disambiguation Card** (`#disambiguation-card`) showing:
  - Full Name & Nickname / Profession Tag (*"Tailor"*, *"Plumber"*)
  - Area / Mohalla (*"Main Bazar"*, *"Station Road"*)
  - Phone number snippet
  - Current outstanding balance
- **Regional Voice Prompt:** BolHisab announces aloud in the selected language:
  - Hindi: *"2 Ramesh mile: Ramesh (Tailor) ya Ramesh (Plumber)? Kise chunna hai?"*
  - Kannada: *"2 ರಮೇಶ್ ಸಿಕ್ಕಿದ್ದಾರೆ: Ramesh (Tailor) ಅಥವಾ Ramesh (Plumber)? ಯಾರನ್ನು ಆಯ್ಕೆ ಮಾಡುತ್ತೀರಿ?"*
- **Explicit Mention Bypass:** If the shopkeeper says *"Ramesh Tailor ko 40 rupaye udhaar likho"*, BolHisab's regional parser detects the nickname and resolves directly to Ramesh Tailor without interrupting with a disambiguation prompt.

---

## 🎙️ Supported Commands (Multi-Lingual: 10 Indian Regional Languages)

BolHisab supports **10 Indian regional languages** in both native scripts and Roman transliterations, alongside automatic normalization of native Indian numeral scripts (Devanagari, Bengali, Gujarati, Gurmukhi, Tamil, Telugu, Kannada, Malayalam):

1. **हिन्दी (Hindi - `hi-IN`):** *"Ramesh ko 40 rupaye udhaar likho."* / *"रमेश को ४० रुपये उधार लिखो"*
2. **English (India - `en-IN`):** *"Add 40 credit for Ramesh."* / *"Check balance for Ramesh"*
3. **தமிழ் (Tamil - `ta-IN`):** *"ரமேஷுக்கு 40 ரூபாய் கடன் எழுது"* / *"ரமேஷ் 50 ரூபாய் கொடுத்தார்"*
4. **తెలుగు (Telugu - `te-IN`):** *"రమేష్ కు 40 అప్పు రాయి"* / *"ఈ రోజు లెక్క చూపించు"*
5. **ಕನ್ನಡ (Kannada - `kn-IN`):** *"ರಮೇಶ್ ಗೆ 40 ಸಾಲ ಬರೆ"* / *"ರಮೇಶ್ 50 ರೂಪಾಯಿ ಕೊಟ್ಟಿದ್ದಾನೆ"*
6. **മലയാളം (Malayalam - `ml-IN`):** *"രമേഷിന് 40 രൂപ കടം എഴുതുക"* / *"രമേഷ് 50 രൂപ തന്നു"*
7. **मराठी (Marathi - `mr-IN`):** *"रमेशला 40 रुपये उधार लिहा"* / *"रमेशने 50 रुपये दिले"*
8. **বাংলা (Bengali - `bn-IN`):** *"রমেশকে ৪০ টাকা ধার লিখুন"* / *"রমেশ ৫০ টাকা জমা দিলো"*
9. **ગુજરાતી (Gujarati - `gu-IN`):** *"રમેશને 40 રૂપિયા ઉધાર લખો"* / *"રમેશે 50 રૂપિયા આપ્યા"*
10. **ਪੰਜਾਬੀ (Punjabi - `pa-IN`):** *"ਰਮੇਸ਼ ਨੂੰ 40 ਰੁਪਏ ਉਧਾਰ ਲਿਖੋ"* / *"ਰਮੇਸ਼ ਨੇ 50 ਰੁਪਏ ਦੇ ਦਿੱਤੇ"*

Selecting your language from the **BHASHA** dropdown automatically switches the speech recognition locale (`recognition.lang`), updates the input placeholder, dynamically reloads sample command chips, and adjusts the action tabs.

| Intent | Sample Command | Behavior |
|---|---|---|
| **Add Udhaar** | *"Ramesh ko 40 rupaye udhaar likho."* / *"ரமேஷுக்கு 40 கடன் எழுது"* | Previews credit of ₹40 for Ramesh; requires confirmation tap to save. |
| **Record Payment** | *"Ramesh ne 50 rupaye de diye."* / *"ரமேஷ் 50 ரூபாய் கொடுத்தார்"* | Previews payment of ₹50; validates that payment doesn't exceed balance. |
| **Check Balance** | *"Ramesh ka balance batao."* / *"ರಮೇಶ್ ಬಾಕಿ ಎಷ್ಟು?"* | Queries local IndexedDB and calculates balance in integer paise. |
| **Restock Item** | *"Doodh ke 20 packet stock mein jodo."* / *"20 பாக்கெட் பால் சேர்"* | Previews adding 20 packets of milk to inventory. |
| **Check Stock** | *"Doodh ka stock batao."* / *"பால் எவ்வளவு இருப்பு?"* | Shows current quantity and low-stock warning threshold. |
| **Daily Summary** | *"Aaj ka hisaab dikhao."* / *"ఈ రోజు లెక్క చూపించు"* | Shows today's total credit extended, cash collected, and transaction count. |
| **Top Dues** | *"Sabse zyada udhaar kiska hai."* / *"அதிக கடன் யார்?"* | Lists customers with pending balances in descending order. |
| **Draft Reminder** | *"Ramesh ko reminder bhejo."* / *"ரமேஷுக்கு நினைவூட்டல்"* | Generates a courteous WhatsApp payment reminder text to copy. |
| **Help** | *"Madad" / "Help" / "உதவி" / "సహాయం"* | Displays supported commands and examples. |

---

## 🛡️ Core Safety Principles

1. **Confirm Before Save:**  
   Spoken words, transcripts, or AI classifications **never** alter the financial ledger directly. Every write action displays a structured preview card showing the target customer/item, prior balance, amount, and projected balance. The ledger updates **only** when the user taps **"Haan, save karein"**.
2. **Mathematical Integrity in Integer Paise:**  
   Financial amounts are stored in integer paise (`Math.round(rupees * 100)`), avoiding JavaScript floating-point errors. Payments cannot exceed outstanding dues, preventing negative debt anomalies.
3. **Local-First & Private:**  
   All customer names, contact numbers, and balances are stored exclusively inside your browser's local IndexedDB. No customer data or transaction history is sent to any cloud server.
4. **Auditable Reversals:**  
   Mistakes happen during rush hours. An immediate **Undo** toast is provided upon saving, along with an audit-friendly reversal action on recent transactions.
5. **No Hallucinated Financials:**  
   Balances are never generated by an LLM; they are mathematically summed from validated local ledger entries.

---

## 🤖 Architecture & Optional AI Bridge

```
┌────────────────────────────────────────────────────────┐
│                      BolHisab UI                       │
│  (Single index.html · Three.js 0.160.0 · IndexedDB)    │
└──────────────────────────┬─────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
 ┌──────────────────────┐    ┌────────────────────────┐
 │ Local Command Parser │    │ Optional server.mjs    │
 │ (Offline regex/NLP)  │    │ (POST /api/ai/parse)   │
 └──────────────────────┘    └───────────┬────────────┘
                                         │ Only raw command text
                                         ▼ (Never ledger data!)
                             ┌────────────────────────┐
                             │ LLM Provider           │
                             │ (Gemini / OpenAI API)  │
                             └────────────────────────┘
```

- **Local Parser (Default):** Runs in the browser without any network connection or API keys. Normalizes Devanagari numerals (`०१२३४५६७८९` $\to$ `0123456789`), extracts amounts and customer names, and handles common Hindi/Hinglish patterns.
- **Optional Online AI:** If `server.mjs` is run with `GEMINI_API_KEY` or `OPENAI_API_KEY` in the environment, the server exposes `POST /api/ai/parse` solely for intent extraction. The frontend verifies the endpoint and displays `AI CONNECTED (HYBRID)`. If absent, it gracefully stays in `LOCAL COMMAND MODE`.

To configure an optional AI provider:
```bash
# Example with Gemini
export GEMINI_API_KEY="your-gemini-key"
node server.mjs

# Or on Windows PowerShell:
$env:GEMINI_API_KEY="your-gemini-key"
node server.mjs
```

---

## 🧪 Acceptance Tests & Verification Checklist

- [x] **Standalone Execution:** Page loads and demo works without any API keys or build step.
- [x] **Command Preview:** Typing *"Ramesh ko 40 rupaye udhaar likho"* produces a visual confirmation preview card.
- [x] **Customer Disambiguation:** Resolves multiple customers with identical names (e.g. Ramesh Tailor vs. Ramesh Plumber) via disambiguation card and voice prompt.
- [x] **Local AI Brain:** In-browser 23MB ONNX embedding model with zero-kb instant semantic fallback.
- [x] **Indic Suffix Stripping & Regional TTS:** Native speech recognition and talk-back in 10 languages without Hindi slang in regional modes.
- [x] **Confirmation Gating:** Ledger does not change until *"Haan, save karein"* is clicked.
- [x] **Correct Math:** Confirming ₹40 udhaar updates Ramesh's balance from ₹160 to ₹200.
- [x] **Payment Verification:** Recording ₹50 payment updates balance to ₹150; overpayments are blocked.
- [x] **Persistence:** Refreshing the browser preserves saved transactions (IndexedDB).
- [x] **Stock Tracking:** Restocking items updates inventory quantities and flags low-stock items.
- [x] **Reversal / Undo:** Instant Undo toast and manual transaction reversals work properly.
- [x] **Export & Reset:** JSON export downloads the full database; Reset Demo resets to baseline fictional data.
- [x] **3D Ceramic Robot:** Three.js robot "Bolu" animates with blinking eyes, camera parallax, and switches to a shield/checkmark glyph in the Trust section.
- [x] **Accessibility & Reduced Motion:** Respects `prefers-reduced-motion` and provides clean CSS fallback if WebGL is unavailable.

---

## 📁 Repository Structure

```
BOLHISAB/
├── index.html               # Complete frontend (HTML, CSS, Vanilla JS, Three.js 0.160.0)
├── server.mjs               # Minimal Node.js static server & optional AI bridge (zero deps)
├── README.md                # Project documentation and instructions
└── docs/
    ├── demo-script.md       # 2–3 minute presentation demo script
    └── pitch-deck-outline.md# 7-slide hackathon presentation outline
```

---

## 📜 License
Built for **VibeX Codes Track 1** (2026). Created with care for daily workers and small businesses.
