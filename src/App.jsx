import { useState } from 'react'

export default function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('openrouter_key') || '')
  const [keySet, setKeySet] = useState(!!localStorage.getItem('openrouter_key'))

  const saveKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('openrouter_key', apiKey.trim())
      setKeySet(true)
    }
  }

  return (
    <>
      {/* Live wallpaper */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        background: '#0A0A0F',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(192,132,252,0.15) 0%, transparent 70%)',
          top: '-100px',
          left: '-100px',
          animation: 'blob1 8s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%)',
          bottom: '-50px',
          right: '-50px',
          animation: 'blob2 10s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(129,140,248,0.1) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          animation: 'blob3 12s ease-in-out infinite'
        }} />
      </div>

      {/* Main UI */}
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
          /* API Key Setup Screen */
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '24px',
            padding: '40px 32px',
            width: '100%',
            maxWidth: '400px',
            backdropFilter: 'blur(20px)',
            textAlign: 'center'
          }}>
            <h1 style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: '2.5rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #C084FC, #818CF8, #38BDF8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '8px'
            }}>MIRAGE</h1>
            <p style={{
              color: '#94A3B8',
              fontSize: '0.9rem',
              marginBottom: '32px',
              fontFamily: 'Inter, sans-serif'
            }}>Your personal AI hub. Enter your OpenRouter API key to begin.</p>
            <input
              type="password"
              placeholder="sk-or-..."
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveKey()}
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#E2E8F0',
                fontSize: '0.95rem',
                fontFamily: 'JetBrains Mono, monospace',
                outline: 'none',
                marginBottom: '16px'
              }}
            />
            <button
              onClick={saveKey}
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #C084FC, #818CF8)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 600,
                fontFamily: 'Syne, sans-serif',
                cursor: 'pointer',
                transition: 'opacity 0.2s'
              }}
            >
              Enter MIRAGE →
            </button>
            <p style={{
              marginTop: '20px',
              fontSize: '0.75rem',
              color: '#64748B'
            }}>
              Get your free key at{' '}
              <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer"
                style={{ color: '#818CF8' }}>
                openrouter.ai
              </a>
            </p>
          </div>
        ) : (
          /* Chat placeholder — coming next */
          <div style={{
            color: '#94A3B8',
            fontFamily: 'Syne, sans-serif',
            fontSize: '1.2rem'
          }}>
            ✨ MIRAGE is ready. Chat coming next...
          </div>
        )}
      </div>

      <style>{`
        @keyframes blob1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(80px, 60px) scale(1.1); }
          66% { transform: translate(-40px, 80px) scale(0.95); }
        }
        @keyframes blob2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-60px, -80px) scale(1.05); }
          66% { transform: translate(80px, -40px) scale(0.9); }
        }
        @keyframes blob3 {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.15); }
        }
      `}</style>
    </>
  )
            }
