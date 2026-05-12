export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ text: 'API key not configured' });

  try {
    const { messages, system } = req.body;
    
    // Build conversation with system prompt included in first message
    const contents = [];
    if (system) {
      contents.push({
        role: 'user',
        parts: [{ text: `Instructions: ${system}\n\nUser: ${messages[0]?.content || ''}` }]
      });
      contents.push({
        role: 'model', 
        parts: [{ text: 'Understood. I will follow these instructions.' }]
      });
      // Add remaining messages
      messages.slice(1).forEach(m => {
        contents.push({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        });
      });
    } else {
      messages.forEach(m => {
        contents.push({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        });
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.7
          }
        })
      }
    );

    const data = await response.json();
    
    // Handle API errors
    if (data.error) {
      return res.status(500).json({ 
        text: `API Error: ${data.error.message}` 
      });
    }

    // Extract text from response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      // Return full response for debugging
      return res.status(200).json({ 
        text: `Debug: ${JSON.stringify(data).slice(0, 200)}` 
      });
    }

    return res.status(200).json({ text });

  } catch (error) {
    return res.status(500).json({ text: `Error: ${error.message}` });
  }
}
