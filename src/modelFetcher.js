// Local price maps for providers that don't expose pricing in their API
const PRICE_MAP = {
  openai: {
    'gpt-4o': { prompt: 2.50, completion: 10.00 },
    'gpt-4o-mini': { prompt: 0.15, completion: 0.60 },
    'gpt-4-turbo': { prompt: 10.00, completion: 30.00 },
    'gpt-3.5-turbo': { prompt: 0.50, completion: 1.50 },
  },
  gemini: {
    'gemini-2.5-flash': { prompt: 0.00, completion: 0.00 }, // Free
    'gemini-2.5-flash-lite': { prompt: 0.00, completion: 0.00 }, // Free
    'gemini-2.5-pro': { prompt: 2.50, completion: 10.00 },
    'gemini-1.5-pro': { prompt: 5.00, completion: 20.00 },
    'gemini-1.5-flash': { prompt: 0.35, completion: 1.40 },
  },
  groq: {
    'llama-3.3-70b-versatile': { prompt: 0.00, completion: 0.00 },
    'llama-3.1-8b-instant': { prompt: 0.00, completion: 0.00 },
    'mixtral-8x7b-32768': { prompt: 0.00, completion: 0.00 },
    'llama-4-scout-17b-16e-instruct': { prompt: 0.00, completion: 0.00 },
  }
};

const PRICE_KEYS = ['openai', 'gemini', 'groq'];

async function fetchOpenRouterModels(apiKey) {
  const res = await fetch('https://openrouter.ai/api/v1/models', { headers: { 'Authorization': `Bearer ${apiKey}` } });
  const data = await res.json();
  return data.data.map(m => ({
    id: m.id, name: m.name,
    pricePrompt: m.free ? 0 : parseFloat(m.pricing?.prompt || "0.0"),
    free: m.free || parseFloat(m.pricing?.prompt || "0.0") === 0
  }));
}

async function fetchHyperbolicModels(apiKey) {
  const res = await fetch('https://api.hyperbolic.xyz/v1/models', { headers: { 'Authorization': `Bearer ${apiKey}` } });
  const data = await res.json();
  return data.data.map(m => ({
    id: m.id, name: m.name,
    pricePrompt: parseFloat(m.pricing?.prompt || "0.0"),
    free: parseFloat(m.pricing?.prompt || "0.0") === 0
  }));
}

async function fetchNvidiaModels(apiKey) {
  const res = await fetch('https://api.nvcf.nvidia.com/v2/nvcf/models', { headers: { 'Authorization': `Bearer ${apiKey}` } });
  const data = await res.json();
  return data.models?.map(m => ({
    id: m.modelId, name: m.modelName || m.modelId,
    pricePrompt: parseFloat(m.pricing?.prompt || "0.0"),
    free: parseFloat(m.pricing?.prompt || "0.0") === 0
  })) || [];
}

async function fetchGenericModels(apiKey, providerKey, url) {
  const res = await fetch(url, { headers: { 'Authorization': `Bearer ${apiKey}` } });
  const data = await res.json();
  const modelList = data.models || data.data || [];
  const priceMap = PRICE_MAP[providerKey] || {};
  return modelList.map(m => {
    const id = m.id || m.modelId || m.name;
    const priceInfo = priceMap[id] || { prompt: null };
    // If price is null, we mark as 'unknown' but we'll treat it as paid unless we know it's free
    const isFree = priceInfo.prompt === 0 || priceInfo.prompt === null ? false : priceInfo.prompt === 0;
    return {
      id: id, name: m.displayName || m.name || id,
      pricePrompt: priceInfo.prompt === null ? 0 : priceInfo.prompt,
      free: isFree
    };
  });
}

export async function fetchProviderModels(providerKey, apiKey) {
  if (!apiKey) return [];
  const configs = {
    openrouter: { url: 'https://openrouter.ai/api/v1/models', fetcher: fetchOpenRouterModels },
    hyperbolic: { url: 'https://api.hyperbolic.xyz/v1/models', fetcher: fetchHyperbolicModels },
    nvidia: { url: 'https://api.nvcf.nvidia.com/v2/nvcf/models', fetcher: fetchNvidiaModels },
    openai: { url: 'https://api.openai.com/v1/models', fetcher: (key) => fetchGenericModels(key, 'openai', 'https://api.openai.com/v1/models') },
    gemini: { url: `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, fetcher: (key) => fetchGenericModels(key, 'gemini', `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`) },
    groq: { url: 'https://api.groq.com/openai/v1/models', fetcher: (key) => fetchGenericModels(key, 'groq', 'https://api.groq.com/openai/v1/models') },
  };

  const config = configs[providerKey];
  if (!config) return [];
  try {
    if (config.fetcher) return await config.fetcher(apiKey);
    // Fallback generic
    const res = await fetch(config.url, { headers: { 'Authorization': `Bearer ${apiKey}` } });
    const data = await res.json();
    const list = data.models || data.data || [];
    return list.map(m => ({ id: m.id, name: m.name, pricePrompt: 0, free: true })); // fallback
  } catch (err) {
    console.error(`Failed to load ${providerKey} models:`, err);
    return [];
  }
}
