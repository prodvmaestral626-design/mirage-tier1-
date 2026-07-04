import { useState } from 'react'
import { ChevronDown, Cpu, Loader } from 'lucide-react'
import { useProviderStore } from '../../store/providerStore'
import { useModels } from '../../hooks/useModels'

const TIER_COLORS = {
  Free: '#2d6a4f',
  Paid: '#8b1a4a',
  Hybrid: '#7a5c1a',
}

export default function ModelSelector() {
  const { selectedProviderId, selectedModelId, setModel } = useProviderStore()
  const { grouped, loadState } = useModels(selectedProviderId)
  const [hover, setHover] = useState(false)

  const isLoading = loadState === 'loading'
  const isError = loadState === 'error'
  const noKey = loadState === 'idle'

  const allModels = [
    ...grouped.Free,
    ...grouped.Hybrid,
    ...grouped.Paid,
  ]

  // Auto-select first model when list loads
  if (allModels.length > 0 && !selectedModelId) {
    setModel(allModels[0].id)
  }

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
        minWidth: '160px',
      }}
    >
      {isLoading
        ? <Loader size={14} color="#9b8aaa" style={{ animation: 'spin 1s linear infinite' }} />
        : <Cpu size={14} color="#8b1a4a" />
      }

      {isLoading ? (
        <span style={{
          color: '#9b8aaa',
          fontFamily: "'Inter', sans-serif",
          fontSize: '13px',
        }}>
          Loading models...
        </span>
      ) : isError ? (
        <span style={{
          color: '#8b1a1a',
          fontFamily: "'Inter', sans-serif",
          fontSize: '13px',
        }}>
          Failed to load
        </span>
      ) : noKey ? (
        <span style={{
          color: '#9b8aaa',
          fontFamily: "'Inter', sans-serif",
          fontSize: '13px',
        }}>
          Add API key
        </span>
      ) : (
        <select
          value={selectedModelId || ''}
          onChange={(e) => setModel(e.target.value)}
          style={{
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#e8ddf0',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '12px',
            cursor: 'pointer',
            paddingRight: '16px',
            maxWidth: '160px',
          }}
        >
          {grouped.Free.length > 0 && (
            <optgroup label="— Free" style={{ backgroundColor: '#110d14', color: '#2d6a4f' }}>
              {grouped.Free.map(m => (
                <option key={m.id} value={m.id} style={{ backgroundColor: '#110d14', color: '#e8ddf0' }}>
                  {m.name}
                </option>
              ))}
            </optgroup>
          )}
          {grouped.Hybrid.length > 0 && (
            <optgroup label="— Hybrid" style={{ backgroundColor: '#110d14', color: '#7a5c1a' }}>
              {grouped.Hybrid.map(m => (
                <option key={m.id} value={m.id} style={{ backgroundColor: '#110d14', color: '#e8ddf0' }}>
                  {m.name}
                </option>
              ))}
            </optgroup>
          )}
          {grouped.Paid.length > 0 && (
            <optgroup label="— Paid" style={{ backgroundColor: '#110d14', color: '#8b1a4a' }}>
              {grouped.Paid.map(m => (
                <option key={m.id} value={m.id} style={{ backgroundColor: '#110d14', color: '#e8ddf0' }}>
                  {m.name}
                </option>
              ))}
            </optgroup>
          )}
        </select>
      )}

      {!isLoading && !isError && !noKey && (
        <ChevronDown
          size={14}
          color="#9b8aaa"
          style={{ position: 'absolute', right: '12px', pointerEvents: 'none' }}
        />
      )}
    </div>
  )
}
