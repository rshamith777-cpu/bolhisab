/**
 * BolHisab - Optional Minimal AI Bridge & Static File Server
 * Built with Node.js built-in modules (http, fs, path, url).
 * Zero external npm dependencies.
 *
 * Provides:
 * 1. Static file serving (index.html, docs, assets)
 * 2. Optional POST /api/ai/parse (proxies command to LLM only if API key is set in env)
 * 3. GET /api/ai/status (checks if online AI mode is available)
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

// Read API keys safely from environment variables - NEVER hardcoded!
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.md': 'text/markdown; charset=utf-8'
};

const ALLOWED_INTENTS = new Set([
  'ADD_CREDIT',
  'RECORD_PAYMENT',
  'GET_BALANCE',
  'RESTOCK_ITEM',
  'CHECK_STOCK',
  'DAILY_SUMMARY',
  'TOP_DUES',
  'DRAFT_REMINDER',
  'HELP',
  'UNKNOWN'
]);

const SYSTEM_PROMPT = `You are BolHisab's command parser for an Indian small shopkeeper khata ledger.
Parse the shopkeeper's spoken or typed command in Hindi, English, Tamil, Telugu, Kannada, Malayalam, Marathi, Bengali, Gujarati, Punjabi (in native script or Roman transliteration) into a strict JSON object.
NEVER include conversational text or markdown code fences outside valid JSON.

Supported intents:
- ADD_CREDIT: giving goods on credit/udhaar. Needs: customerName (string), amountRupees (positive number).
- RECORD_PAYMENT: money received from customer. Needs: customerName (string), amountRupees (positive number).
- GET_BALANCE: asking how much a customer owes. Needs: customerName (string).
- RESTOCK_ITEM: adding inventory received. Needs: itemName (string), quantity (positive number), optional unit (string e.g. "packet", "kg", "litre").
- CHECK_STOCK: checking stock of an item. Needs: itemName (string).
- DAILY_SUMMARY: asking for today's summary/hisab.
- TOP_DUES: asking who owes the most or list of debtors.
- DRAFT_REMINDER: preparing a payment reminder for a customer. Needs: customerName (string).
- HELP: asking how to use the app or what commands are supported.
- UNKNOWN: command is unclear, ambiguous, or unsupported.

Rules:
1. Normalize any Indian numeral script (Devanagari, Bengali, Gujarati, Gurmukhi, Tamil, Telugu, Kannada, Malayalam) to standard numbers.
2. If customer name or amount is missing for ADD_CREDIT / RECORD_PAYMENT, set intent to UNKNOWN or include missingFields: ["customerName", "amountRupees"].
3. Return JSON with this exact shape:
{
  "intent": "ADD_CREDIT" | "RECORD_PAYMENT" | "GET_BALANCE" | "RESTOCK_ITEM" | "CHECK_STOCK" | "DAILY_SUMMARY" | "TOP_DUES" | "DRAFT_REMINDER" | "HELP" | "UNKNOWN",
  "customerName": string | null,
  "amountRupees": number | null,
  "itemName": string | null,
  "quantity": number | null,
  "unit": string | null,
  "missingFields": string[],
  "clarificationPrompt": string | null
}`;

/**
 * Call configured AI provider (Gemini or OpenAI-compatible)
 */
async function callAIProvider(commandText) {
  if (GEMINI_API_KEY) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const payload = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${SYSTEM_PROMPT}\n\nCommand to parse: "${commandText}"` }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1
      }
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`Gemini API error: ${res.status}`);
    }

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error('Empty AI response');
    return JSON.parse(rawText);
  }

  if (OPENAI_API_KEY) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: commandText }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1
      })
    });

    if (!res.ok) {
      throw new Error(`OpenAI API error: ${res.status}`);
    }

    const data = await res.json();
    const rawText = data.choices?.[0]?.message?.content;
    if (!rawText) throw new Error('Empty AI response');
    return JSON.parse(rawText);
  }

  return null;
}

/**
 * Validate parsed result against strict allowlisted schema
 */
function sanitizeParsedIntent(raw) {
  if (!raw || typeof raw !== 'object') {
    return { intent: 'UNKNOWN', clarificationPrompt: 'Aapka aadesh samajh nahi aaya. Kripya dobara bolein ya likhein.' };
  }

  const intent = ALLOWED_INTENTS.has(raw.intent) ? raw.intent : 'UNKNOWN';
  let amountRupees = null;
  if (typeof raw.amountRupees === 'number' && Number.isFinite(raw.amountRupees) && raw.amountRupees > 0 && raw.amountRupees < 10000000) {
    amountRupees = Math.round(raw.amountRupees * 100) / 100;
  }

  let quantity = null;
  if (typeof raw.quantity === 'number' && Number.isFinite(raw.quantity) && raw.quantity > 0 && raw.quantity < 1000000) {
    quantity = Math.round(raw.quantity * 100) / 100;
  }

  const customerName = typeof raw.customerName === 'string' && raw.customerName.trim().length > 0
    ? raw.customerName.trim().slice(0, 50)
    : null;

  const itemName = typeof raw.itemName === 'string' && raw.itemName.trim().length > 0
    ? raw.itemName.trim().slice(0, 50)
    : null;

  const unit = typeof raw.unit === 'string' && raw.unit.trim().length > 0
    ? raw.unit.trim().slice(0, 20)
    : null;

  const missingFields = Array.isArray(raw.missingFields)
    ? raw.missingFields.filter(f => typeof f === 'string')
    : [];

  const clarificationPrompt = typeof raw.clarificationPrompt === 'string'
    ? raw.clarificationPrompt.slice(0, 150)
    : null;

  return {
    intent,
    customerName,
    amountRupees,
    itemName,
    quantity,
    unit,
    missingFields,
    clarificationPrompt,
    source: 'ai'
  };
}

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = reqUrl.pathname;

  // Endpoint: AI Status
  if (pathname === '/api/ai/status' && req.method === 'GET') {
    const hasKey = Boolean(GEMINI_API_KEY || OPENAI_API_KEY);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      available: hasKey,
      provider: GEMINI_API_KEY ? 'gemini' : (OPENAI_API_KEY ? 'openai' : 'none'),
      mode: hasKey ? 'online-ai' : 'local-only'
    }));
    return;
  }

  // Endpoint: AI Parse
  if (pathname === '/api/ai/parse' && req.method === 'POST') {
    if (!GEMINI_API_KEY && !OPENAI_API_KEY) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        fallbackToLocal: true,
        reason: 'No AI key configured on server. Use local parser.'
      }));
      return;
    }

    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 10000) { // Limit request size
        req.destroy();
      }
    });

    req.on('end', async () => {
      try {
        const parsedBody = JSON.parse(body || '{}');
        const command = typeof parsedBody.command === 'string' ? parsedBody.command.trim() : '';

        if (!command) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Command text is required' }));
          return;
        }

        const rawResult = await callAIProvider(command);
        const safeResult = sanitizeParsedIntent(rawResult);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          result: safeResult
        }));
      } catch (err) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          fallbackToLocal: true,
          reason: err.message || 'AI parsing failed'
        }));
      }
    });
    return;
  }

  // Static File Serving
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);

  // Security: prevent path traversal outside project root
  const resolvedPath = path.resolve(filePath);
  if (!resolvedPath.startsWith(path.resolve(__dirname))) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  fs.stat(resolvedPath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for root or 404
      if (pathname === '/' || !path.extname(pathname)) {
        filePath = path.join(__dirname, 'index.html');
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
        return;
      }
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error loading file');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

server.listen(PORT, () => {
  console.log(`BolHisab server running at http://localhost:${PORT}`);
  console.log(`AI status: ${GEMINI_API_KEY ? 'Gemini configured' : (OPENAI_API_KEY ? 'OpenAI configured' : 'Local parser only (offline ready)')}`);
});
