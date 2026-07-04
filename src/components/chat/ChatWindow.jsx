import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'

export default function ChatWindow({ messages }) {
  const bottomRef = useRef(null)

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      background: 'transparent',
    }}>

      {/* Inner container — centers content, caps width */}
      <div style={{
        maxWidth: '800px',
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        paddingTop: '16px',
        paddingBottom: '16px',
        flex: 1,
      }}>

        {/* Empty state */}
        {messages.length === 0 && (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            paddingBottom: '80px',
          }}>
            <div style={{
              width: '48px',
              height: '1px',
              backgroundColor: '#2a1f30',
            }} />
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(18px, 3vw, 24px)',
              color: '#4a3a55',
              fontWeight: 300,
              fontStyle: 'italic',
              textAlign: 'center',
              lineHeight: 1.6,
              margin: 0,
              maxWidth: '320px',
            }}>
              The void awaits your first query.
            </p>
            <div style={{
              width: '48px',
              height: '1px',
              backgroundColor: '#2a1f30',
            }} />
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, index) => (
          <MessageBubble
            key={msg.id}
            role={msg.role}
            content={msg.content}
            isNew={index === messages.length - 1}
          />
        ))}

        {/* Scroll anchor */}
        <div ref={bottomRef} style={{ height: '1px' }} />

      </div>
    </div>
  )
}
