import { Coffee } from 'lucide-react'

export default function StampCard({ stamps, threshold = 10 }) {
  const filled = Math.min(stamps, threshold)
  return (
    <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '1rem', boxShadow: '0 2px 12px rgba(44,26,14,0.07)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
        <span style={{ fontSize: '15px', fontWeight: 600, color: '#2C1A0E' }}>Loyalty Stamps</span>
        <span style={{ fontSize: '13px', color: '#8C6A52' }}>{stamps} / {threshold}</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {Array.from({ length: threshold }).map((_, i) => (
          <div key={i} style={{ width: '36px', height: '36px', borderRadius: '50%', background: i < filled ? '#7C3A1E' : '#F5EDE3', border: '2px solid', borderColor: i < filled ? '#7C3A1E' : '#E8D5C0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Coffee size={16} color={i < filled ? '#fff' : '#E8D5C0'} />
          </div>
        ))}
      </div>
      {stamps >= threshold && (
        <p style={{ margin: '12px 0 0', fontSize: '13px', color: '#2E7D32', fontWeight: 600 }}>Free drink ready! Show this to redeem.</p>
      )}
    </div>
  )
}
