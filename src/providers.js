export const PROVIDERS = {
  openrouter: {
    name: 'OpenRouter', color: '#FF6B00',
    models: [
      { id: 'openrouter/free', name: 'Auto Free Router', free: true, lite: true },
      { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1', free: true },
      { id: 'qwen/qwen3-coder:free', name: 'Qwen3 Coder', free: true },
      { id: 'meta-llama/llama-3.2-3b-instruct:free', name: 'Llama 3.2 3B', free: true, lite: true },
      { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', free: false },
      { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', free: false },
    ]
  },
  hyperbolic: {
    name: 'Hyperbolic', color: '#EC4899',
    models: [
      { id: 'meta-llama/llama-3.3-70B-Instruct', name: 'Llama 3.3 70B', free: false },
      { id: 'deepseek-ai/DeepSeek-V3', name: 'DeepSeek V3', free: false },
      { id: 'Qwen/Qwen2.5-Coder-32B-Instruct', name: 'Qwen2.5 Coder 32B', free: false },
    ]
  },
  gemini: {
    name: 'Gemini', color: '#38BDF8',
    models: [
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', free: true },
      { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash-Lite', free: true, lite: true },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', free: true },
    ]
  },
  groq: {
    name: 'Groq', color: '#F97316',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', free: true },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', free: true, lite: true },
    ]
  },
  openai: {
    name: 'OpenAI', color: '#10A37F',
    models: [
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', free: false },
      { id: 'gpt-4o', name: 'GPT-4o', free: false },
    ]
  },
}

export const PERSONAS = [
  { id: 'assistant', name: 'Assistant', system: 'You are MIRAGE - a brilliant, elegant AI assistant.' },
  { id: 'coder', name: 'Coder', system: 'You are MIRAGE in Coder mode - an expert software engineer.' },
  { id: 'creative', name: 'Creative', system: 'You are MIRAGE in Creative mode - a visionary artist.' },
]
