# BolHisab Local AI Brain & Multi-Customer Disambiguation Plan

## 1. Executive Summary

Small shopkeepers often run into two major real-world challenges:
1. **The "Two Rameshes" Problem (Entity Ambiguity):** A shopkeeper often has multiple customers with the same common name (e.g., *Ramesh Tailor* vs. *Ramesh Plumber*, or *Ramesh Auto* vs. *Ramesh Patel*). A rigid parser risks assigning debt to the wrong person.
2. **Natural Language Flexibility (The "AI Brain"):** People speak in infinite variations ("Ramesh-ji ka hisaab kitna baki hai", "Ramesh ge estu", "Ramesh ko 40 ka samaan diya"). A regex parser can miss subtle slang, typos, or mixed dialects.

This plan solves both problems while strictly preserving **100% offline local privacy** and the **single-file (`index.html`) constraint**.

---

## 2. The 20MB Local AI Brain: What Is It & How It Works

You mentioned a **"simple ~20 MB AI"**. In modern web technology, this refers to **in-browser ONNX Runtime Web / Transformers.js** running quantized semantic models directly in WebAssembly (WASM) / WebGPU inside the user's browser.

| Model Candidate | Size & Tech | Capabilities | Pros & Cons |
|---|---|---|---|
| **1. Xenova/all-MiniLM-L6-v2** *(Recommended)* | ~23 MB (Quantized Q8 ONNX) | Dense semantic vector embeddings in browser memory | • **Pros:** 100% private, runs offline, understands intent similarity without rigid regex.<br>• **Cons:** Requires a 23MB one-time browser cache download. |
| **2. Chrome Built-In AI** *(Gemini Nano)* | 0 MB download (pre-installed on device) | Full LLM reasoning with `window.ai` | • **Pros:** Zero network download, extremely smart.<br>• **Cons:** Currently requires experimental flags in Chrome Dev/Canary. |
| **3. Micro-Brain Fuzzy Classifier** *(Instant)* | ~15 KB in vanilla JS | Levenshtein distance + Soundex phonetics + Indic suffix normalization | • **Pros:** Zero download, runs instantly (2ms), works on any budget smartphone.<br>• **Cons:** Rule-based rather than neural. |

### The 3-Tier Cascade AI Brain
To give the shopkeeper the best of both worlds:
```
[Spoken / Typed Input]
         │
         ▼
 ┌────────────────────────────────────────────────────────┐
 │ Tier 1: Instant Micro-Brain (0 KB, 2ms latency)        │
 │ • Handles numbers, amounts, and common Indic patterns  │
 └───────────────────────┬────────────────────────────────┘
                         │ (If confidence is high, proceed)
                         │ (If ambiguous or messy phrasing)
                         ▼
 ┌────────────────────────────────────────────────────────┐
 │ Tier 2: 20MB In-Browser AI (Transformers.js / MiniLM)   │
 │ • Computes semantic cosine similarity against intents  │
 │ • Runs 100% locally in browser memory via WASM         │
 └───────────────────────┬────────────────────────────────┘
                         │ (Optional fallback if online)
                         ▼
 ┌────────────────────────────────────────────────────────┐
 │ Tier 3: Optional Server AI Bridge (server.mjs)         │
 │ • Calls Gemini/OpenAI ONLY if API key is provided      │
 └────────────────────────────────────────────────────────┘
```

---

## 3. Solving the "Two Rameshes" Problem (Disambiguation)

When a shopkeeper has two customers named Ramesh, **guessing is dangerous** because money and customer trust are on the line.

### Customer Schema with Nicknames & Locality
In the local IndexedDB, customers will store identifying metadata:
```json
[
  {
    "id": "cust-001",
    "name": "Ramesh",
    "nickname": "Tailor",
    "phone": "98765-43210",
    "area": "Station Road",
    "balancePaise": 16000
  },
  {
    "id": "cust-002",
    "name": "Ramesh",
    "nickname": "Plumber",
    "phone": "98123-45678",
    "area": "Market Gate",
    "balancePaise": 0
  }
]
```

### Key Safety Rules for Multiple Matches:
- **Never auto-select:** If there are 2 Rameshes, the app must **never** randomly pick one or sum both balances.
- **Bilingual & Spoken Prompts:**
  - *Hindi:* "दो रमेश मिले: रमेश दर्ज़ी या रमेश प्लंबर?"
  - *Kannada:* "ಇಬ್ಬರು ರಮೇಶ್ ಇದ್ದಾರೆ: ರಮೇಶ್ ಟೈಲರ್ ಅಥವಾ ರಮೇಶ್ ಪ್ಲಂಬರ್?"
  - *English:* "Found 2 customers named Ramesh: Ramesh Tailor or Ramesh Plumber?"
- **Contextual Auto-Resolution:** If the shopkeeper says *"Ramesh Tailor ko 50 rupaye likho"*, the AI automatically matches the nickname `Tailor` and bypasses the clarification prompt directly to confirmation!
