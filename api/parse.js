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

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(200).json({
      success: false,
      fallbackToLocal: true,
      reason: 'No cloud AI key configured on server. Use local in-browser parser.'
    });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const cmd = (body?.text || body?.command || '').trim();
  if (!cmd) {
    return res.status(400).json({ error: 'Command text is required' });
  }

  if (process.env.GEMINI_API_KEY) {
    try {
      const prompt = `Parse the Indian shopkeeper command: "${cmd}". Return ONLY a JSON object with: intent (ADD_CREDIT, RECORD_PAYMENT, GET_BALANCE, RESTOCK_ITEM, CHECK_STOCK, DAILY_SUMMARY, TOP_DUES, DRAFT_REMINDER, HELP, UNKNOWN), customerName (string or null), amountRupees (number or null), itemName (string or null), quantity (number or null), unit (string or null).`;
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });

      if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);
      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = JSON.parse(rawText || '{}');
      if (parsed.intent && ALLOWED_INTENTS.has(parsed.intent)) {
        return res.status(200).json({ success: true, parsed, result: parsed });
      }
    } catch (err) {
      console.warn('Gemini proxy error:', err.message);
    }
  }

  return res.status(200).json({
    success: false,
    fallbackToLocal: true,
    reason: 'Server parsing completed with local fallback'
  });
}
