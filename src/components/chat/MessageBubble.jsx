import { useState, useEffect } from 'react'

export default function MessageBubble({ role, content, isNew }) {
  const [mounted, setMounted] = useState(!isNew)

  useEffect(() => {
    if (!isNew) return
    const timer = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(timer)
  }, [isNew])

  const isUser = role === 'user'
  const isSystem = role === 'system'

  // System messages render differently — centered, subtle
  if (isSystem) {
    return (
      <div style={{
        alignSelf: 'center',
        maxWidth: '480px',
        width: '100%',
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.4s ease',
      }}>
        <p style={{
          margin: 0,
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '14px',
          fontStyle: 'italic',
          color: '#4a3a55',
          textAlign: 'center',
          lineHeight: 1.6,
          padding: '8px 16px',
          borderTop: '1px solid #2a1f30',
          borderBottom: '1px solid #2a1f30',
        }}>
          {content}
        </p>
      </div>
    )
  }

  return (
    <div style={{
      alignSelf: isUser ? 'flex-end' : 'flex-start',
      maxWidth: 'min(85%, 640px)',
      opacity: mounted ? 1 : 0,
      transform: mounted
        ? 'translateY(0)'
        : `translateY(${isUser ? '12px' : '12px'})`,
      transition: 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    }}>

      {/* Role label */}
      <div style={{
        marginBottom: '4px',
        paddingLeft: isUser ? 0 : '4px',
        paddingRight: isUser ? '4px' : 0,
        textAlign: isUser ? 'right' : 'left',
      }}>
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '10px',
          color: '#4a3a55',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
        }}>
          {isUser ? 'You' : 'MIRAGE'}
        </span>
      </div>

      {/* Bubble */}
      <div style={{
        backgroundColor: isUser ? '#8b1a4a' : '#110d14',
        padding: '14px 18px',
        borderRadius: isUser
          ? '18px 18px 4px 18px'
          : '18px 18px 18px 4px',
        border: isUser
          ? 'none'
          : '1px solid #2a1f30',
        boxShadow: isUser
          ? '0 4px 20px rgba(139, 26, 74, 0.25)'
          : '0 4px 20px rgba(0, 0, 0, 0.4)',
      }}>
        <p style={{
          margin: 0,
          fontFamily: "'Inter', sans-serif",
          fontSize: '15px',
          lineHeight: 1.65,
          color: '#e8ddf0',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>
          {content}
        </p>
      </div>

    </div>
  )
}
