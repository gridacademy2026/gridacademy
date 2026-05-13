export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return res.status(200).json({ 
      text: 'Configuration error: API key missing. Add GEMINI_API_KEY to Vercel environment variables.' 
    });
  }

  try {
    const { messages, system } = req.body;

    const allMessages = [];
    
    messages.forEach((m, idx) => {
      allMessages.push({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ 
          text: idx === 0 && system 
            ? `${system}\n\n${m.content}` 
            : m.content 
        }]
      });
    });

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: allMessages,
          generationConfig: {
            maxOutputTokens: 800,
            temperature: 0.7
          }
        })
      }
    );

    const data = await geminiRes.json();

    if (data.error) {
      return res.status(200).json({ 
        text: `Gemini error: ${data.error.message}` 
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    return res.status(200).json({ 
      text: text || 'Gemini returned empty response. Please try again.' 
    });

  } catch (err) {
    return res.status(200).json({ 
      text: `Server error: ${err.message}` 
    });
  }
}
