export async function callAI({ messages, model, provider, apiKey }) {
  if (!apiKey) throw new Error('Please enter an API key');
  
  const providerConfigs = {
    openrouter: { url: 'https://openrouter.ai/api/v1/chat/completions', headers: { 'Authorization': `Bearer ${apiKey}`, 'HTTP-Referer': window.location.origin } },
    hyperbolic: { url: 'https://api.hyperbolic.xyz/v1/chat/completions', headers: { 'Authorization': `Bearer ${apiKey}` } },
    gemini: { url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, transform: (data) => ({ contents: data.messages.map(m => ({ role: m.role, parts: [{ text: m.content }] })) }) },
    groq: { url: 'https://api.groq.com/openai/v1/chat/completions', headers: { 'Authorization': `Bearer ${apiKey}` } },
    openai: { url: 'https://api.openai.com/v1/chat/completions', headers: { 'Authorization': `Bearer ${apiKey}` } },
  };

  const config = providerConfigs[provider];
  if (!config) throw new Error('Unknown provider');

  let body = { model, messages };
  if (provider === 'gemini') {
    body = config.transform({ messages });
  } else {
    body = { model, messages };
  }

  const response = await fetch(config.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...config.headers },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API Error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  if (provider === 'gemini') return data.candidates[0].content.parts[0].text;
  return data.choices[0].message.content;
}
