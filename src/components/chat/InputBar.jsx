import { useState, useRef, useEffect } from 'react'
import { Plus, ArrowUp, Mic, Volume2, Download, X } from 'lucide-react'

export default function InputBar({ onSend = () => {} }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [sendHover, setSendHover] = useState(false)
  const [plusHover, setPlusHover] = useState(false)
  const textareaRef = useRef(null)

  const drawerItems = [
    { icon: Mic, label: 'STT' },
    { icon: Volume2, label: 'TTS' },
    { icon: Download, label: 'Export' },
  ]

  // Auto-resize textarea as user types
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, [inputValue])

  const handleSend = () => {
    const text = inputValue.trim()
    if (!text) return
    onSend(text)
    setInputValue('')
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const canSend = inputValue.trim().length > 0

  return (
    <div style={{
      position: 'relative',
      padding: '0 16px 24px 16px',
      backgroundColor: 'transparent',
      flexShrink: 0,
    }}>

      {/* Drawer */}
      <div style={{
        position: 'absolute',
        bottom: '82px',
        left: '32px',
        display: 'flex',
        gap: '8px',
        opacity: drawerOpen ? 1 : 0,
        transform: drawerOpen
          ? 'translateY(0) scale(1)'
          : 'translateY(12px) scale(0.95)',
        transformOrigin: 'bottom left',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: drawerOpen ? 'auto' : 'none',
        zIndex: 2,
      }}>
        {drawerItems.map((item, i) => (
          <DrawerPill key={i} Icon={item.icon} label={item.label} />
        ))}
      </div>

      {/* Main input container */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'flex-end',
        gap: '8px',
        padding: '8px 8px 8px 12px',
        backgroundColor: '#1a1220',
        borderRadius: '20px',
        border: `1px solid ${isFocused ? '#6b2040' : '#2a1f30'}`,
        boxShadow: isFocused
          ? '0 0 0 2px rgba(139, 26, 74, 0.15), 0 8px 30px rgba(0,0,0,0.4)'
          : '0 8px 30px rgba(0,0,0,0.4)',
        transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
      }}>

        {/* Plus / drawer toggle */}
        <button
          onClick={() => setDrawerOpen(!drawerOpen)}
          onMouseEnter={() => setPlusHover(true)}
          onMouseLeave={() => setPlusHover(false)}
          style={{
            flexShrink: 0,
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: plusHover ? '#2a1f30' : 'transparent',
            color: drawerOpen ? '#c0305a' : '#9b8aaa',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            transform: drawerOpen ? 'rotate(45deg)' : 'rotate(0deg)',
            marginBottom: '1px',
          }}
        >
          {drawerOpen ? <X size={18} /> : <Plus size={18} />}
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Send a message... (Shift+Enter for new line)"
          rows={1}
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            resize: 'none',
            color: '#e8ddf0',
            fontFamily: "'Inter', sans-serif",
            fontSize: '15px',
            lineHeight: '1.6',
            maxHeight: '120px',
            overflowY: 'auto',
            padding: '6px 0',
            caretColor: '#c0305a',
          }}
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          onMouseEnter={() => setSendHover(true)}
          onMouseLeave={() => setSendHover(false)}
          disabled={!canSend}
          style={{
            flexShrink: 0,
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: canSend
              ? sendHover ? '#c0305a' : '#8b1a4a'
              : '#1a1220',
            color: canSend ? '#e8ddf0' : '#4a3a55',
            cursor: canSend ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            transform: sendHover && canSend ? 'scale(1.08)' : 'scale(1)',
            boxShadow: canSend
              ? '0 4px 12px rgba(139, 26, 74, 0.4)'
              : 'none',
            marginBottom: '1px',
          }}
        >
          <ArrowUp size={18} />
        </button>

      </div>

      {/* Hint text */}
      <div style={{
        maxWidth: '800px',
        margin: '6px auto 0',
        paddingLeft: '16px',
      }}>
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '10px',
          color: '#4a3a55',
          letterSpacing: '0.08em',
        }}>
          Enter to send · Shift+Enter for new line
        </span>
      </div>

    </div>
  )
}

function DrawerPill({ Icon, label }) {
  const [hover, setHover] = useState(false)

  return (
    <button
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 14px',
        backgroundColor: hover ? '#1a1220' : '#110d14',
        border: `1px solid ${hover ? '#6b2040' : '#2a1f30'}`,
        borderRadius: '20px',
        color: hover ? '#e8ddf0' : '#9b8aaa',
        cursor: 'pointer',
        fontFamily: "'Inter', sans-serif",
        fontSize: '12px',
        letterSpacing: '0.05em',
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap',
      }}
    >
      <Icon size={13} />
      {label}
    </button>
  )
}
