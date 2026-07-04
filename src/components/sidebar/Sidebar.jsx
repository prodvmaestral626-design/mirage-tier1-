import { useState } from 'react'
import { Plus, Settings, MessageSquare } from 'lucide-react'

export default function Sidebar({
  conversations,
  activeChatId,
  onSelectChat,
  isMobile,
  sidebarOpen,
}) {
  const [hoveredId, setHoveredId] = useState(null)
  const [newChatHover, setNewChatHover] = useState(false)
  const [settingsHover, setSettingsHover] = useState(false)

  return (
    <aside style={{
      position: 'fixed',
      left: 0,
      top: 0,
      height: '100vh',
      width: '280px',
      backgroundColor: '#110d14',
      borderRight: '1px solid #2a1f30',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 20,
      transform: isMobile && !sidebarOpen
        ? 'translateX(-280px)'
        : 'translateX(0)',
      transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      boxShadow: '4px 0 30px rgba(0,0,0,0.5)',
    }}>

      {/* Header */}
      <div style={{
        padding: '20px 16px',
        borderBottom: '1px solid #2a1f30',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#9b8aaa',
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600,
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            backgroundColor: '#8b1a4a',
            borderRadius: '50%',
            boxShadow: '0 0 6px rgba(139, 26, 74, 0.8)',
            flexShrink: 0,
          }} />
          Active Threads
        </div>
      </div>

      {/* Conversation list */}
      <nav style={{
        flex: 1,
        overflowY: 'auto',
        padding: '8px',
      }}>
        {conversations.length === 0 ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#4a3a55',
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '16px',
            fontStyle: 'italic',
            letterSpacing: '0.05em',
            padding: '24px',
            textAlign: 'center',
          }}>
            No conversations yet.
            <br />Begin a new thread.
          </div>
        ) : (
          conversations.map((convo) => {
            const isActive = convo.id === activeChatId
            const isHovered = hoveredId === convo.id

            return (
              <button
                key={convo.id}
                onClick={() => onSelectChat(convo.id)}
                onMouseEnter={() => setHoveredId(convo.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  backgroundColor: isActive
                    ? '#1a1220'
                    : isHovered
                    ? '#15101a'
                    : 'transparent',
                  border: 'none',
                  borderBottom: '1px solid #15101a',
                  borderLeft: `3px solid ${isActive ? '#8b1a4a' : 'transparent'}`,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  marginBottom: '2px',
                  borderRadius: '4px',
                }}
              >
                <MessageSquare
                  size={15}
                  color={isActive ? '#c0305a' : '#4a3a55'}
                  style={{ flexShrink: 0 }}
                />
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  flex: 1,
                  minWidth: 0,
                }}>
                  <span style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '17px',
                    fontWeight: isActive ? 500 : 400,
                    color: isActive ? '#e8ddf0' : '#9b8aaa',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    letterSpacing: '0.02em',
                  }}>
                    {convo.title}
                  </span>
                  <span style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '11px',
                    color: '#4a3a55',
                    marginTop: '2px',
                    letterSpacing: '0.03em',
                  }}>
                    {convo.timestamp}
                  </span>
                </div>
              </button>
            )
          })
        )}
      </nav>

      {/* Footer */}
      <footer style={{
        padding: '16px',
        borderTop: '1px solid #2a1f30',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        flexShrink: 0,
      }}>
        <button
          onMouseEnter={() => setNewChatHover(true)}
          onMouseLeave={() => setNewChatHover(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            backgroundColor: newChatHover ? '#c0305a' : '#8b1a4a',
            border: 'none',
            borderRadius: '6px',
            color: '#e8ddf0',
            fontFamily: "'Inter', sans-serif",
            fontSize: '13px',
            fontWeight: 500,
            letterSpacing: '0.08em',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease',
            transform: newChatHover ? 'translateY(-1px)' : 'translateY(0)',
            boxShadow: newChatHover
              ? '0 6px 20px rgba(139, 26, 74, 0.5)'
              : '0 4px 12px rgba(139, 26, 74, 0.3)',
          }}
        >
          <Plus size={16} />
          New Chat
        </button>

        <button
          onMouseEnter={() => setSettingsHover(true)}
          onMouseLeave={() => setSettingsHover(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px',
            backgroundColor: 'transparent',
            border: `1px solid ${settingsHover ? '#6b2040' : '#2a1f30'}`,
            borderRadius: '6px',
            color: settingsHover ? '#e8ddf0' : '#9b8aaa',
            fontFamily: "'Inter', sans-serif",
            fontSize: '13px',
            letterSpacing: '0.05em',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <Settings size={16} />
          Settings
        </button>
      </footer>
    </aside>
  )
}
