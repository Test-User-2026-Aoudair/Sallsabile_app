export async function onRequestPost(context) {
  const { prompt } = await context.request.json();

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${context.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      max_tokens: 900,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';
  return new Response(JSON.stringify({ content: [{ text }] }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
