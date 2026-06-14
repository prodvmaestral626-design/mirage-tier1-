import { useState, useRef, useEffect, useCallback } from 'react'

// --- PROVIDERS (Updated with Hyperbolic + Qwen3) ---
const PROVIDERS = {
  openrouter: {
    name: 'OpenRouter', color: '#C084FC',
    models: [
      { id: 'meta-llama/llama-3.1-8b-instruct:free', name: 'Llama 3.1 8B', free: true },
      { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B', free: true },
      { id: 'google/gemma-3-27b-it:free', name: 'Gemma 3 27B', free: true },
      { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1', free: true },
      { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', free: false },
      { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', free: false },
    ]
  },
  hyperbolic: { name: 'Hyperbolic', color: '#F472B6', models: [ { id: 'Qwen/Qwen3-14B-Instruct', name: 'Qwen3 14B', free: true }, { id: 'Qwen/Qwen3-32B-Instruct', name: 'Qwen3 32B', free: true } ] },
  gemini: { name: 'Gemini', color: '#38BDF8', models: [ { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', free: false }, { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', free: false }, { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', free: false } ] },
  groq: { name: 'Groq', color: '#F97316', models: [ { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', free: false }, { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', free: false }, { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', free: false } ] },
  openai: { name: 'OpenAI', color: '#10A37F', models: [ { id: 'gpt-4o-mini', name: 'GPT-4o Mini', free: false }, { id: 'gpt-4o', name: 'GPT-4o', free: false } ] },
  nvidia: { name: 'NVIDIA', color: '#76B900', models: [ { id: 'meta/llama-3.1-8b-instruct', name: 'Llama 3.1 8B', free: false }, { id: 'meta/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', free: false } ] }
}

const PERSONAS = [
  { id: 'assistant', name: '✦ Assistant', system: 'You are MIRAGE — helpful, elegant, and intelligent. Be concise and warm.' },
  { id: 'coder', name: '⌥ Coder', system: 'Expert software engineer. Write clean code. Always use markdown code blocks.' },
  { id: 'creative', name: '◈ Creative', system: 'Creative partner with vivid imagination. Help with writing and storytelling with genuine flair.' },
  { id: 'analyst', name: '◎ Analyst', system: 'Sharp analytical mind. Break down complex topics into clear structured insights.' },
  { id: 'tutor', name: '◇ Tutor', system: 'Patient encouraging teacher. Explain clearly using examples and analogies.' },
]

// --- UNIVERSAL API HANDLER (Includes Hyperbolic + Qwen3) ---
async function callAI(provider, apiKey, model, messages, systemPrompt) {
  const withSystem = [{ role: 'system', content: systemPrompt }, ...messages]
  
  if (provider === 'gemini') {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    const contents = messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }))
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ system_instruction: { parts: [{ text: systemPrompt }] }, contents }) })
    const data = await res.json()
    if (data.error) throw new Error(data.error.message)
    return data.candidates[0].content.parts[0].text
  }
  
  const urls = { 
    openrouter: 'https://openrouter.ai/api/v1/chat/completions', 
    groq: 'https://api.groq.com/openai/v1/chat/completions', 
    openai: 'https://api.openai.com/v1/chat/completions', 
    nvidia: 'https://integrate.api.nvidia.com/v1/chat/completions',
    hyperbolic: 'https://api.hyperbolic.xyz/v1/chat/completions' // NEW
  }
  
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` }
  if (provider === 'openrouter') { headers['HTTP-Referer'] = window.location.origin; headers['X-Title'] = 'MIRAGE' }
  
  const res = await fetch(urls[provider], { method: 'POST', headers, body: JSON.stringify({ model, messages: withSystem, max_tokens: 2048 }) })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error))
  return data.choices[0].message.content
}

// --- WALLPAPER (Vanta.js Fog + CSS fallback) ---
function Wallpaper() {
  const ref = useRef(null)
  const fx = useRef(null)

  useEffect(() => {
    let alive = true
    const load = (src) => new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s) })
    ;(async () => {
      try {
        if (!window.THREE) await load('https://cdn.jsdelivr.net/npm/three@0.134.0/build/three.min.js')
        if (!window.VANTA) await load('https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.fog.min.js')
        if (alive && ref.current && !fx.current && window.VANTA?.FOG) {
          fx.current = window.VANTA.FOG({
            el: ref.current, mouseControls: false, touchControls: true, gyroControls: false,
            highlightColor: 0xb050f0, midtoneColor: 0x6050d0, lowlightColor: 0x080810,
            baseColor: 0x070709, blurFactor: 0.88, speed: 1.0, zoom: 0.65
          })
        }
      } catch (_) { /* CSS fallback shows */ }
    })()
    return () => { alive = false; if (fx.current) { fx.current.destroy(); fx.current = null } }
  }, [])

  return (
    <div ref={ref} style={{ position: 'fixed', inset: 0, zIndex: 0, background: '#070709' }}>
      <div style={{ position: 'absolute', width: '80vw', height: '80vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(176,80,240,0.18) 0%, transparent 70%)', top: '-20vw', right: '-20vw', animation: 'b1 20s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', width: '70vw', height: '70vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 70%)', bottom: '-15vw', left: '-15vw', animation: 'b2 25s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(96,80,208,0.1) 0%, transparent 70%)', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', animation: 'b3 16s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
    </div>
  )
}

// --- SPOTLIGHT (Aceternity-style) ---
function Spotlight({ children }) {
  const [pos, setPos] = useState({ x: 50, y: 30 })
  const handle = useCallback((e) => {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    const cx = e.touches ? e.touches[0].clientX : e.clientX
    const cy = e.touches ? e.touches[0].clientY : e.clientY
    setPos({ x: ((cx - rect.left) / rect.width) * 100, y: ((cy - rect.top) / rect.height) * 100 })
  }, [])
  return (
    <div style={{ position: 'relative', height: '100%' }} onMouseMove={handle} onTouchMove={handle}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', background: `radial-gradient(700px circle at ${pos.x}% ${pos.y}%, rgba(192,132,252,0.08), transparent 50%)`, transition: 'background 0.1s' }} />
      {children}
    </div>
  )
}

const G = { border: 'rgba(255,255,255,0.07)', surface: 'rgba(255,255,255,0.04)', text: '#E2E8F0', muted: '#64748B' }

// --- CSS ANIMATIONS ---
const CSS = () => (
  <style>{`
    @keyframes b1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(80px,60px) scale(1.1)} 66%{transform:translate(-40px,80px) scale(0.95)} }
    @keyframes b2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-60px,-80px) scale(1.05)} 66%{transform:translate(80px,-40px) scale(0.9)} }
    @keyframes b3 { 0%,100%{transform:translate(-50%,-50%) scale(1)} 50%{transform:translate(-50%,-50%) scale(1.2)} }
    @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
    ::-webkit-scrollbar { width: 4px }
    ::-webkit-scrollbar-track { background: transparent }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 6px }
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400&display=swap');
  `}</style>
)
export default function App() {
  const [screen, setScreen] = useState('onboarding')
  const [keys, setKeys] = useState(() => { try { return JSON.parse(localStorage.getItem('mirage_keys') || '{}') } catch { return {} } })
  const [tempKeys, setTempKeys] = useState({})
  const [provider, setProvider] = useState('openrouter')
  const [model, setModel] = useState(PROVIDERS.openrouter.models[0].id)
  const [persona, setPersona] = useState(PERSONAS[0])
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [panel, setPanel] = useState(null)
  const [btnHover, setBtnHover] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('mirage_keys') || '{}')
    if (Object.keys(saved).length > 0) {
      setKeys(saved); const first = Object.keys(saved)[0]
      setProvider(first); setModel(PROVIDERS[first]?.models[0]?.id || ''); setScreen('chat')
    }
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  const saveKeys = () => {
    const merged = { ...keys, ...tempKeys }
    const cleaned = Object.fromEntries(Object.entries(merged).filter(([, v]) => v?.trim()))
    if (!Object.keys(cleaned).length) return
    localStorage.setItem('mirage_keys', JSON.stringify(cleaned))
    setKeys(cleaned); const first = Object.keys(cleaned)[0]
    setProvider(first); setModel(PROVIDERS[first]?.models[0]?.id || ''); setScreen('chat')
  }

  const send = async (content) => {
    const message = content || input
    if (!message.trim() || loading) return
    const apiKey = keys[provider]
    if (!apiKey) { setError(`No key for ${PROVIDERS[provider].name} — add it in settings`); return }
    const next = [...messages, { role: 'user', content: message.trim() }]
    setMessages(next); setInput(''); setLoading(true); setError('')
    try {
      const reply = await callAI(provider, apiKey, model, next, persona.system)
      setMessages([...next, { role: 'assistant', content: reply }])
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  const exportChat = (fmt) => {
    const content = fmt === 'json' ? JSON.stringify({ persona: persona.name, model, provider, messages }, null, 2) : messages.map(m => `${m.role.toUpperCase()}:\n${m.content}`).join('\n\n---\n\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob); const a = document.createElement('a')
    a.href = url; a.download = `mirage-${Date.now()}.${fmt === 'json' ? 'json' : 'txt'}`; a.click(); URL.revokeObjectURL(url)
  }

  const currentModel = PROVIDERS[provider]?.models.find(m => m.id === model)

  // Greeting helper
  const getGreeting = () => {
    const hr = new Date().getHours()
    if (hr < 12) return 'Good Morning'
    if (hr < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  // ── ONBOARDING ──────────────────────────────────────────────
  if (screen === 'onboarding') return (
    <>
      <Wallpaper />
      <Spotlight>
        <div style={{ position: 'relative', zIndex: 2, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ width: '100%', maxWidth: '400px' }}>
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: '4rem', fontWeight: 800, letterSpacing: '-4px', background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, #C084FC 40%, #38BDF8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1, marginBottom: '6px' }}>MIRAGE</h1>
              <p style={{ color: '#374151', fontSize: '0.72rem', fontFamily: 'Inter,sans-serif', letterSpacing: '0.2em' }}>PERSONAL AI HUB</p>
            </div>
            <div style={{ position: 'relative', borderRadius: '28px', padding: '1px', background: 'linear-gradient(135deg, rgba(192,132,252,0.3), rgba(56,189,248,0.1), rgba(192,132,252,0.1))' }}>
              <div style={{ background: 'rgba(7,7,9,0.85)', borderRadius: '27px', padding: '28px 22px', backdropFilter: 'blur(40px)' }}>
                <p style={{ color: '#374151', fontSize: '0.68rem', fontFamily: 'Inter,sans-serif', marginBottom: '20px', textAlign: 'center', letterSpacing: '0.1em' }}>API KEYS — STORED ON YOUR DEVICE ONLY</p>

                {Object.entries(PROVIDERS).map(([id, p]) => (
                  <div key={id} style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '0.66rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px', letterSpacing: '0.08em' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: p.color, boxShadow: `0 0 8px ${p.color}`, flexShrink: 0 }} />
                      {p.name.toUpperCase()}
                      {id === 'openrouter' && <span style={{ color: '#4ADE80', fontSize: '0.58rem', padding: '1px 6px', border: '1px solid rgba(74,222,128,0.25)', borderRadius: '10px', marginLeft: '4px' }}>FREE</span>}
                    </label>
                    <input type="password" placeholder={`${p.name} key...`}
                      onChange={e => setTempKeys(k => ({ ...k, [id]: e.target.value }))}
                      style={{ width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', color: G.text, fontSize: '0.82rem', fontFamily: 'JetBrains Mono,monospace', outline: 'none' }} />
                  </div>
                ))}
                <button onClick={saveKeys} onMouseEnter={() => setBtnHover(true)} onMouseLeave={() => setBtnHover(false)}
                  style={{ position: 'relative', overflow: 'hidden', width: '100%', padding: '14px', background: 'linear-gradient(135deg, #9333EA, #7C3AED, #2563EB)', border: 'none', borderRadius: '14px', color: 'white', fontSize: '0.88rem', fontWeight: 700, fontFamily: 'Syne,sans-serif', cursor: 'pointer', marginTop: '8px', letterSpacing: '0.08em', boxShadow: '0 0 30px rgba(147,51,234,0.4)' }}>
                  <span style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)', backgroundSize: '200% 100%', animation: 'shimmer 2.5s linear infinite' }} />
                  ENTER MIRAGE →
                </button>
                <p style={{ textAlign: 'center', marginTop: '14px', fontSize: '0.65rem', color: '#374151' }}>
                  Free key at <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" style={{ color: '#818CF8', textDecoration: 'none' }}>openrouter.ai</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </Spotlight>
      <CSS />
    </>
  )

  // ── MAIN CHAT ────────────────────────────────────────────────
  return (
    <>
      <Wallpaper />
      <Spotlight>
        <div onClick={() => setPanel(null)} style={{ position: 'relative', zIndex: 2, height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          {/* TOP BAR (Cleaner & Minimized) */}
          <div onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', flexShrink: 0 }}>
            <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.2em', background: 'linear-gradient(135deg,#C084FC,#818CF8,#38BDF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MIRAGE</span>
            <button onClick={() => setPanel(panel === 'models' ? null : 'models')}
              style={{ flex: 1, padding: '6px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '40px', color: '#64748B', fontSize: '0.68rem', fontFamily: 'Inter,sans-serif', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '6px', backdropFilter: 'blur(20px)', letterSpacing: '0.03em' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: PROVIDERS[provider].color, boxShadow: `0 0 6px ${PROVIDERS[provider].color}`, flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{PROVIDERS[provider].name} · {currentModel?.name}</span>
            </button>
            <button onClick={() => { setMessages([]); setError(''); setPanel(null) }}
              style={{ width: '34px', height: '34px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '50%', color: '#475569', cursor: 'pointer', fontSize: '0.85rem', flexShrink: 0, backdropFilter: 'blur(20px)' }}>✦</button>
            <button onClick={e => { e.stopPropagation(); setPanel(panel === 'settings' ? null : 'settings') }}
              style={{ width: '34px', height: '34px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '50%', color: '#475569', cursor: 'pointer', fontSize: '0.85rem', flexShrink: 0, backdropFilter: 'blur(20px)' }}>⚙</button>
          </div>

          {/* DROPDOWN PANELS (Settings & Models) */}
          {panel === 'models' && (
            <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', top: '56px', left: '14px', right: '14px', zIndex: 30, background: 'rgba(5,5,8,0.96)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', maxHeight: '70vh', overflowY: 'auto', backdropFilter: 'blur(60px)', boxShadow: '0 20px 60px rgba(0,0,0,0.7)' }}>
              {Object.entries(PROVIDERS).map(([pid, p]) => (
                <div key={pid}>
                  <div style={{ padding: '10px 16px', fontSize: '0.62rem', color: '#374151', display: 'flex', alignItems: 'center', gap: '7px', letterSpacing: '0.1em', borderBottom: '1px solid rgba(255,255,255,0.04)', position: 'sticky', top: 0, background: 'rgba(5,5,8,0.98)' }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: p.color, boxShadow: `0 0 5px ${p.color}` }} />
                    {p.name.toUpperCase()}
                    {!keys[pid] && <span style={{ color: '#EF4444', fontSize: '0.58rem', marginLeft: 'auto' }}>NO KEY</span>}
                  </div>
                  {p.models.map(m => (
                    <button key={m.id} onClick={() => { setProvider(pid); setModel(m.id); setPanel(null) }}
                      style={{ width: '100%', padding: '11px 16px', textAlign: 'left', background: (provider === pid && model === m.id) ? 'rgba(192,132,252,0.08)' : 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.03)', color: (provider === pid && model === m.id) ? '#C084FC' : '#94A3B8', fontSize: '0.82rem', fontFamily: 'Inter,sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {m.name}
                      {m.free && <span style={{ color: '#4ADE80', fontSize: '0.6rem', padding: '1px 6px', border: '1px solid rgba(74,222,128,0.25)', borderRadius: '10px' }}>FREE</span>}
                      {(provider === pid && model === m.id) && <span style={{ color: '#C084FC', marginLeft: 'auto' }}>✓</span>}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}

          {panel === 'settings' && (
            <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', top: '56px', right: '14px', width: '280px', zIndex: 30, background: 'rgba(5,5,8,0.96)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', backdropFilter: 'blur(60px)', padding: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.7)', maxHeight: '80vh', overflowY: 'auto' }}>
              <p style={{ color: '#374151', fontSize: '0.62rem', letterSpacing: '0.1em', marginBottom: '16px' }}>API KEYS</p>
              {Object.entries(PROVIDERS).map(([id, p]) => (
                <div key={id} style={{ marginBottom: '10px' }}>
                  <label style={{ fontSize: '0.62rem', color: '#374151', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px', letterSpacing: '0.08em' }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: p.color, boxShadow: `0 0 5px ${p.color}` }} />
                    {p.name}
                  </label>
                  <input type="password" placeholder="Update key..." value={keys[id] || ''}
                    onChange={e => setKeys(k => ({ ...k, [id]: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', color: G.text, fontSize: '0.78rem', outline: 'none' }} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                <button onClick={() => { localStorage.setItem('mirage_keys', JSON.stringify(keys)); setPanel(null) }} style={{ flex: 1, padding: '8px', background: '#818CF8', border: 'none', borderRadius: '10px', color: 'white', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Save Keys</button>
                <button onClick={() => { exportChat('json'); setPanel(null) }} style={{ flex: 1, padding: '8px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#94A3B8', fontSize: '0.75rem', cursor: 'pointer' }}>Export JSON</button>
                <button onClick={() => { exportChat('txt'); setPanel(null) }} style={{ flex: 1, padding: '8px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#94A3B8', fontSize: '0.75rem', cursor: 'pointer' }}>.TXT</button>
              </div>
            </div>
          )}
          
          {/* MESSAGES AREA + HERO GREETING */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 16px', display: 'flex', flexDirection: 'column' }}>
            {messages.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '10px' }}>
                <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '1.8rem', letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #C084FC, #38BDF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.2 }}>{getGreeting()}</h1>
                <p style={{ color: '#64748B', fontSize: '0.9rem', fontFamily: 'Inter,sans-serif', fontWeight: 400, letterSpacing: '0.02em' }}>How can MIRAGE help you today?</p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px' }}>
                  {['Write a poem', 'Explain quantum physics', 'Plan a trip'].map(s => (
                    <button key={s} onClick={() => send(s)} style={{ padding: '8px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '40px', color: '#94A3B8', fontSize: '0.75rem', fontFamily: 'Inter,sans-serif', cursor: 'pointer', transition: '0.2s' }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%', padding: '12px 18px', marginBottom: '12px', borderRadius: '24px', background: msg.role === 'user' ? 'linear-gradient(145deg, #C084FC, #818CF8)' : 'rgba(255,255,255,0.04)', border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.04)' : 'none', color: msg.role === 'user' ? 'white' : '#E2E8F0', fontSize: '0.95rem', fontFamily: 'Inter,sans-serif', lineHeight: '1.5', wordWrap: 'break-word' }}>
                  {msg.content}
                </div>
              ))
            )}
            {loading && <div style={{ alignSelf: 'flex-start', color: '#64748B', fontSize: '0.8rem', fontFamily: 'Inter,sans-serif', marginLeft: '12px' }}>MIRAGE is thinking...</div>}
            {error && <div style={{ color: '#EF4444', fontSize: '0.8rem', textAlign: 'center', marginTop: '6px', fontFamily: 'Inter,sans-serif' }}>{error}</div>}
            <div ref={bottomRef} />
          </div>

          {/* PREMIUM INPUT DOCK (Large, Pill-shaped) */}
          <div style={{ marginTop: 'auto', padding: '0 16px 16px 16px', flexShrink: 0 }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', background: 'rgba(24,24,27,0.6)', backdropFilter: 'blur(30px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '60px', padding: '6px 6px 6px 20px', boxShadow: '0 -4px 20px rgba(0,0,0,0.3)' }}>
              <input
                type="text" placeholder="Message MIRAGE..."
                value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                disabled={loading}
                style={{ flex: 1, padding: '14px 0', background: 'transparent', border: 'none', color: '#E2E8F0', fontSize: '0.95rem', fontFamily: 'Inter,sans-serif', outline: 'none', minWidth: '0' }}
              />
              <button onClick={() => send()} disabled={loading}
                style={{ width: '48px', height: '48px', borderRadius: '50%', border: 'none', background: loading ? '#475569' : 'linear-gradient(135deg, #C084FC, #818CF8)', color: 'white', fontSize: '1.2rem', cursor: loading ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s', boxShadow: !loading ? '0 4px 15px rgba(192,132,252,0.4)' : 'none' }}>
                {loading ? '…' : '↑'}
              </button>
            </div>
          </div>
        </div>
      </Spotlight>
      <CSS />
    </>
  )
}