import { useState, useEffect, useRef } from 'react'

export default function App() {
  // --- STATE ---
  const [apiKey, setApiKey] = useState('')
  const [keySet, setKeySet] = useState(false)
  const [selectedModel, setSelectedModel] = useState('openai/gpt-4o')
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello. I am MIRAGE. My controls sit beside the input.' }
  ])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false) // Toggle API settings

  const chatEndRef = useRef(null)

  // --- INIT & PERSISTENCE ---
  useEffect(() => {
    const stored = localStorage.getItem('mirage_key')
    if (stored) {
      setApiKey(stored)
      setKeySet(true)
    }
  }, [])

  useEffect(() => {
    if (keySet && apiKey) {
      localStorage.setItem('mirage_key', apiKey)
    }
  }, [keySet, apiKey])

  // --- AUTO SCROLL ---
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // --- HANDLERS ---

  const saveKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('mirage_key', apiKey.trim())
      setKeySet(true)
      setShowSettings(false)
    }
  }

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return

    const userMsg = { role: 'user', content: inputText }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInputText('')
    setIsLoading(true)

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'MIRAGE'
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: updatedMessages,
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'OpenRouter Error')
      }

      const data = await response.json()
      const assistantMsg = data.choices[0].message
      setMessages(prev => [...prev, assistantMsg])

    } catch (error) {
      console.error(error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `⚠️ Transmission Error: ${error.message}. Key valid?`
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const exportJSON = () => {
    const data = {
      model: selectedModel,
      timestamp: new Date().toISOString(),
      messages: messages
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `mirage-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearChat = () => {
    if (window.confirm('Clear the conversation?')) {
      setMessages([{ role: 'assistant', content: 'Conversation cleared. Awaiting input.' }])
    }
  }

  // --- RENDER ---

  return (
    <>
      {/* INSANELY BEAUTIFUL NEBULA WALLPAPER */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        background: '#09090b',
        overflow: 'hidden'
      }}>
        {/* Base deep gradient */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 70% 20%, rgba(192,132,252,0.08) 0%, transparent 60%)'
        }} />
        {/* Floating Nebula Orbs */}
        <div style={{
          position: 'absolute',
          width: '700px', height: '700px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(192,132,252,0.15), transparent 70%)',
          top: '-10%', right: '-10%',
          animation: 'float1 18s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          width: '600px', height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56,189,248,0.1), transparent 70%)',
          bottom: '-10%', left: '-10%',
          animation: 'float2 22s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          width: '500px', height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(129,140,248,0.08), transparent 70%)',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          animation: 'pulse 14s ease-in-out infinite'
        }} />
        {/* Subtle grain for texture */}
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.05,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }} />
      </div>

      {/* MAIN UI */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        {!keySet ? (
          /* API KEY SETUP (ONBOARDING) */
          <div style={{
            background: 'rgba(24,24,27,0.7)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '32px',
            padding: '48px 40px',
            width: '100%',
            maxWidth: '420px',
            backdropFilter: 'blur(40px)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            textAlign: 'center'
          }}>
            <h1 style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: '3rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #C084FC, #818CF8, #38BDF8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '4px',
              letterSpacing: '-2px'
            }}>MIRAGE</h1>
            <p style={{
              color: '#94A3B8',
              fontSize: '0.9rem',
              marginBottom: '32px',
              fontFamily: 'Inter, sans-serif'
            }}>Powerful AI. Gracefully integrated. Enter your OpenRouter key.</p>
            <input
              type="password"
              placeholder="sk-or-..."
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveKey()}
              style={{
                width: '100%',
                padding: '14px 18px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px',
                color: '#E2E8F0',
                fontSize: '0.9rem',
                fontFamily: 'JetBrains Mono, monospace',
                outline: 'none',
                marginBottom: '14px',
                transition: 'border-color 0.2s'
              }}
            />
            <button
              onClick={saveKey}
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #C084FC, #818CF8)',
                border: 'none',
                borderRadius: '16px',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 600,
                fontFamily: 'Syne, sans-serif',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(192,132,252,0.3)'
              }}
            >
              Establish Connection →
            </button>
            <p style={{
              marginTop: '20px',
              fontSize: '0.75rem',
              color: '#64748B'
            }}>
              Get your free key at{' '}
              <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer"
                style={{ color: '#818CF8', textDecoration: 'none' }}>
                openrouter.ai
              </a>
            </p>
          </div>
        ) : (
          /* ULTIMATE CHAT INTERFACE */
          <div style={{
            width: '100%',
            maxWidth: '960px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
          }}>
            
            {/* Subtle Brand Header */}
            <div style={{
              position: 'absolute',
              top: '-10px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'rgba(148,163,184,0.15)',
              fontFamily: 'Syne, sans-serif',
              fontSize: '2rem',
              fontWeight: 700,
              letterSpacing: '4px',
              pointerEvents: 'none'
            }}>
              MIRAGE
            </div>

            {/* MESSAGES AREA */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '30px 10px 10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              // Custom scrollbar styling
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(255,255,255,0.1) transparent'
            }}>
              {messages.map((msg, idx) => (
                <div key={idx} style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '75%',
                  padding: '16px 22px',
                  borderRadius: '24px',
                  background: msg.role === 'user' 
                    ? 'linear-gradient(145deg, #C084FC, #818CF8)' 
                    : 'rgba(255,255,255,0.04)',
                  border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  color: msg.role === 'user' ? 'white' : '#E2E8F0',
                  fontSize: '1rem',
                  fontFamily: 'Inter, sans-serif',
                  lineHeight: '1.6',
                  wordWrap: 'break-word',
                  boxShadow: msg.role === 'user' ? '0 8px 25px -8px rgba(192,132,252,0.3)' : '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                  {msg.content}
                </div>
              ))}
              {isLoading && (
                <div style={{
                  alignSelf: 'flex-start',
                  color: '#94A3B8',
                  fontSize: '0.85rem',
                  fontFamily: 'Inter, sans-serif',
                  marginTop: '4px',
                  marginLeft: '12px'
                }}>
                  MIRAGE is processing...
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* THE CONTROL PANEL DOCK */}
            <div style={{
              marginTop: 'auto',
              background: 'rgba(24,24,27,0.6)',
              backdropFilter: 'blur(30px)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '32px',
              padding: '10px 12px',
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              boxShadow: '0 -8px 30px rgba(0,0,0,0.3)'
            }}>
              
              {/* 1. Model Switcher (Pill-Shaped & Right in the Action) */}
              <select
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                style={{
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '40px',
                  color: '#E2E8F0',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  outline: 'none',
                  cursor: 'pointer',
                  minWidth: '140px',
                  appearance: 'none',
                  textAlign: 'center'
                }}
              >
                <option value="openai/gpt-4o">OpenAI GPT-4o</option>
                <option value="openai/gpt-3.5-turbo">OpenAI 3.5 Turbo</option>
                <option value="anthropic/claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                <option value="meta-llama/llama-3-8b-instruct">Llama 3 8B</option>
                <option value="google/gemini-1.5-flash">Gemini 1.5 Flash</option>
              </select>

              {/* 2. Text Input */}
              <input
                type="text"
                placeholder="Message MIRAGE..."
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '12px 18px',
                  background: 'rgba(255,255,255,0.02)',
                  border: 'none',
                  borderRadius: '40px',
                  color: '#E2E8F0',
                  fontSize: '0.95rem',
                  fontFamily: 'Inter, sans-serif',
                  outline: 'none',
                  minWidth: '100px'
                }}
              />

              {/* 3. Settings Hub (API, Export, Clear) */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  style={{
                    padding: '10px 14px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '40px',
                    color: '#94A3B8',
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  ⚙️
                </button>

                {/* Floating Settings Menu */}
                {showSettings && (
                  <div style={{
                    position: 'absolute',
                    bottom: 'calc(100% + 12px)',
                    right: '0',
                    width: '280px',
                    background: 'rgba(24,24,27,0.9)',
                    backdropFilter: 'blur(30px)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '20px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
                  }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#94A3B8', marginBottom: '4px' }}>
                      SETTINGS
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ color: '#94A3B8', fontSize: '0.75rem', fontFamily: 'Inter, sans-serif' }}>Update API Key</label>
                      <input
                        type="password"
                        placeholder="Update OpenRouter Key"
                        value={apiKey}
                        onChange={e => setApiKey(e.target.value)}
                        style={{
                          padding: '10px 14px',
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          borderRadius: '12px',
                          color: '#E2E8F0',
                          fontSize: '0.8rem',
                          outline: 'none'
                        }}
                      />
                      <button onClick={saveKey} style={{
                        padding: '8px',
                        background: '#818CF8',
                        border: 'none',
                        borderRadius: '10px',
                        color: 'white',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        fontFamily: 'Inter, sans-serif',
                        cursor: 'pointer'
                      }}>Update Key</button>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <button onClick={exportJSON} style={{
                        flex: 1,
                        padding: '8px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        background: 'transparent',
                        color: '#94A3B8',
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}>Export JSON</button>
                      <button onClick={clearChat} style={{
                        flex: 1,
                        padding: '8px',
                        border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: '12px',
                        background: 'transparent',
                        color: '#EF4444',
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}>Clear</button>
                    </div>
                    <button onClick={() => setShowSettings(false)} style={{
                      padding: '4px',
                      background: 'transparent',
                      border: 'none',
                      color: '#64748B',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      borderTop: '1px solid rgba(255,255,255,0.06)',
                      marginTop: '4px',
                      paddingTop: '8px'
                    }}>Close</button>
                  </div>
                )}
              </div>

              {/* 4. Send Button */}
              <button
                onClick={handleSend}
                disabled={isLoading}
                style={{
                  padding: '12px 20px',
                  background: 'linear-gradient(135deg, #C084FC, #818CF8)',
                  border: 'none',
                  borderRadius: '40px',
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  fontFamily: 'Syne, sans-serif',
                  cursor: isLoading ? 'default' : 'pointer',
                  opacity: isLoading ? 0.5 : 1,
                  transition: 'opacity 0.2s'
                }}
              >
                {isLoading ? '...' : 'Send'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* COMPLEX BACKGROUND ANIMATIONS */}
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
          33% { transform: translate(-40px, 60px) scale(1.1) rotate(45deg); }
          66% { transform: translate(80px, -40px) scale(0.9) rotate(-45deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(50px, -50px) scale(1.15); }
          66% { transform: translate(-60px, 40px) scale(0.85); }
        }
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); }
          50% { transform: translate(-50%, -50%) scale(1.3) rotate(180deg); }
        }
        
        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 6px;
        }
        ::-webkit-scrollbar-th