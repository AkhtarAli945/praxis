// Groq has a free tier and an OpenAI-compatible API: https://console.groq.com
export async function llm(messages, { json = false } = {}) {
  if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY is missing. Get a free key at console.groq.com and add it to server/.env');
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + process.env.GROQ_API_KEY },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      messages, temperature: 0.4,
      ...(json ? { response_format: { type: 'json_object' } } : {}),
    }),
  });
  if (!r.ok) throw new Error('Groq error ' + r.status + ': ' + (await r.text()).slice(0, 200));
  return (await r.json()).choices[0].message.content;
}
