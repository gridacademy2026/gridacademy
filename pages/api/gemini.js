export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'No API key' });
  try {
    const { messages, system } = req.body;
    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      { method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents,
          generationConfig: { maxOutputTokens: 1000 }
        })
      }
    );
    const d = await r.json();
    const text = d.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
    return res.status(200).json({ text });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
