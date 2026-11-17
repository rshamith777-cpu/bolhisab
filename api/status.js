export default function handler(req, res) {
  const hasKey = !!(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    available: hasKey,
    provider: hasKey ? (process.env.GEMINI_API_KEY ? 'gemini' : 'openai') : 'none'
  });
}
