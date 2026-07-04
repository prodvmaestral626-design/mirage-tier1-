import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import Sidebar from '../components/sidebar/Sidebar'
import ChatWindow from '../components/chat/ChatWindow'
import InputBar from '../components/chat/InputBar'
import ProviderSelector from '../components/providers/ProviderSelector'
import ModelSelector from '../components/providers/ModelSelector'

const MOCK_MESSAGES = [
  { id: 'm1', role: 'user', content: 'Can you design a dark, elegant UI component for me?' },
  { id: 'm2', role: 'assistant', content: 'Of course. I will conjure a design featuring deep onyx backgrounds, rich wine accents, and serif typography fit for nobility.' },
  { id: 'm3', role: 'user', content: 'Perfect. Make it feel vampiric but modern.' },
]

const MOCK_CONVERSATIONS = [
  { id: 'chat-1', title: 'The Crimson Algorithm', timestamp: '2 hrs ago' },
  { id: 'chat-2', title: 'Renaissance Art Prompts', timestamp: 'Yesterday' },
  { id: 'chat-3', title: 'Optimizing React Renders', timestamp: '3 days ago' },
  { id: 'chat-4', title: 'Vampiric Architecture', timestamp: 'Last week' },
]

export default function Chat() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeChatId, setActiveChatId] = useState('chat-1')
  const [conversations] = useState(MOCK_CONVERSATIONS)
  const [messages, setMessages] = useState(MOCK_MESSAGES)

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile) setSidebarOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleSend = (text) => {
    const newMsg = {
      id: `m${Date.now()}`,
      role: 'user',
      content: text,
    }
    setMessages((prev) => [...prev, newMsg])
  }

  return (
    <main style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      fontFamily: "'Inter', sans-serif",
      color: '#e8ddf0',
      position: 'relative',
      backgroundColor: 'transparent',
    }}>

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 10,
            transition: 'opacity 0.3s ease',
          }}
        />
      )}

      <Sidebar
        conversations={conversations}
        activeChatId={activeChatId}
        onSelectChat={(id) => {
          setActiveChatId(id)
          if (isMobile) setSidebarOpen(false)
        }}
        isMobile={isMobile}
        sidebarOpen={sidebarOpen}
      />

      <section style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        marginLeft: isMobile ? 0 : '280px',
        height: '100vh',
        transition: 'margin-left 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 24px',
          borderBottom: '1px solid #2a1f30',
          backgroundColor: 'rgba(17, 13, 20, 0.85)',
          backdropFilter: 'blur(12px)',
          zIndex: 5,
          flexShrink: 0,
          gap: '12px',
        }}>

          {/* Left: hamburger + selectors */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flex: 1,
            minWidth: 0,
          }}>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#e8ddf0',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0,
                }}
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}

            {/* Selectors wrap on very small screens */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap',
            }}>
              <ProviderSelector />
              <ModelSelector />
            </div>
          </div>

          {/* Right: MIRAGE wordmark */}
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(18px, 3vw, 24px)',
            fontWeight: 500,
            color: '#e8ddf0',
            letterSpacing: '0.15em',
            margin: 0,
            flexShrink: 0,
          }}>
            MIRAGE
          </h1>

        </header>

        <ChatWindow messages={messages} />
        <InputBar onSend={handleSend} />

      </section>
    </main>
  )
}
