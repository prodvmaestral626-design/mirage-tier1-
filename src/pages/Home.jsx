import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()
  const [enterHover, setEnterHover] = useState(false)
  const [signupHover, setSignupHover] = useState(false)

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      padding: '24px',
      backgroundColor: 'transparent',
      position: 'relative',
    }}>

      {/* Logo + tagline */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px',
      }}>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(4rem, 15vw, 8rem)',
          fontWeight: 300,
          color: '#e8ddf0',
          letterSpacing: '0.25em',
          lineHeight: 1,
          margin: 0,
          textShadow: '0 0 60px rgba(139, 26, 74, 0.4)',
        }}>
          MIRAGE
        </h1>

        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 'clamp(10px, 2vw, 13px)',
          color: '#9b8aaa',
          letterSpacing: '0.35em',
          textTransform: 'uppercase',
          margin: 0,
        }}>
          Multi-LLM AI Chat Hub
        </p>

        {/* Crimson divider */}
        <div style={{
          width: '40px',
          height: '1px',
          backgroundColor: '#8b1a4a',
          marginTop: '8px',
          boxShadow: '0 0 8px rgba(139, 26, 74, 0.6)',
        }} />
      </div>

      {/* Subtitle */}
      <p style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 'clamp(14px, 2.5vw, 18px)',
        color: '#4a3a55',
        fontWeight: 300,
        fontStyle: 'italic',
        letterSpacing: '0.05em',
        margin: '0 0 24px 0',
        textAlign: 'center',
        maxWidth: '400px',
        lineHeight: 1.6,
      }}>
        Every model. One interface. No limits.
      </p>

      {/* CTA buttons */}
      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        <button
          onClick={() => navigate('/chat')}
          onMouseEnter={() => setEnterHover(true)}
          onMouseLeave={() => setEnterHover(false)}
          style={{
            padding: '14px 40px',
            backgroundColor: enterHover ? '#c0305a' : '#8b1a4a',
            border: 'none',
            borderRadius: '6px',
            color: '#e8ddf0',
            fontFamily: "'Inter', sans-serif",
            fontSize: '13px',
            fontWeight: 500,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease, box-shadow 0.2s ease, transform 0.1s ease',
            boxShadow: enterHover
              ? '0 0 24px rgba(192, 48, 90, 0.5)'
              : '0 4px 16px rgba(139, 26, 74, 0.3)',
            transform: enterHover ? 'translateY(-1px)' : 'translateY(0)',
          }}
        >
          Enter
        </button>

        <button
          onMouseEnter={() => setSignupHover(true)}
          onMouseLeave={() => setSignupHover(false)}
          style={{
            padding: '14px 40px',
            backgroundColor: 'transparent',
            border: `1px solid ${signupHover ? '#6b2040' : '#2a1f30'}`,
            borderRadius: '6px',
            color: signupHover ? '#e8ddf0' : '#9b8aaa',
            fontFamily: "'Inter', sans-serif",
            fontSize: '13px',
            fontWeight: 500,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            transform: signupHover ? 'translateY(-1px)' : 'translateY(0)',
          }}
        >
          Sign Up
        </button>
      </div>

      {/* Bottom footnote */}
      <p style={{
        position: 'absolute',
        bottom: '24px',
        fontFamily: "'Inter', sans-serif",
        fontSize: '11px',
        color: '#4a3a55',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        margin: 0,
      }}>
        by XORON Technologies
      </p>

    </div>
  )
}
