export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(200).json({ 
    text: 'GROQ_API_KEY not configured in Vercel environment variables.' 
  });

  try {
    const { messages, system } = req.body;

    const groqMessages = [];
    if (system) groqMessages.push({ role: 'system', content: system });
    messages.forEach(m => groqMessages.push({ 
      role: m.role, 
      content: m.content 
    }));

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: groqMessages,
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({ text: `Error: ${data.error.message}` });
    }

    const text = data.choices?.[0]?.message?.content;
    return res.status(200).json({ 
      text: text || 'No response from AI.' 
    });

  } catch (err) {
    return res.status(200).json({ text: `Server error: ${err.message}` });
  }
}
