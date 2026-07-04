import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { PROVIDERS } from '../../lib/providers/index'
import { useProviderStore } from '../../store/providerStore'

export default function ProviderSelector() {
  const { selectedProviderId, setProvider } = useProviderStore()
  const [hover, setHover] = useState(false)

  const current = PROVIDERS.find(p => p.id === selectedProviderId)

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 14px 6px 10px',
        backgroundColor: hover ? '#1a1220' : '#110d14',
        border: `1px solid ${hover ? '#6b2040' : '#2a1f30'}`,
        borderRadius: '20px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      {current && (
        <span style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: current.color,
          boxShadow: `0 0 8px ${current.color}`,
          flexShrink: 0,
        }} />
      )}
      <select
        value={selectedProviderId}
        onChange={(e) => setProvider(e.target.value)}
        style={{
          appearance: 'none',
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          backgroundColor: 'transparent',
          border: 'none',
          outline: 'none',
          color: '#e8ddf0',
          fontFamily: "'Inter', sans-serif",
          fontSize: '13px',
          fontWeight: 500,
          cursor: 'pointer',
          paddingRight: '16px',
        }}
      >
        {PROVIDERS.map(p => (
          <option
            key={p.id}
            value={p.id}
            style={{ backgroundColor: '#110d14', color: '#e8ddf0' }}
          >
            {p.name}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        color="#9b8aaa"
        style={{ position: 'absolute', right: '12px', pointerEvents: 'none' }}
      />
    </div>
  )
}
