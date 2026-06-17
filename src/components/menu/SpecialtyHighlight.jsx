import { Star } from 'lucide-react'

export default function SpecialtyHighlight({ items, onSelect }) {
  if (!items || items.length === 0) return null
  return (
    <div style={{ background: '#7C3A1E', borderRadius: '1.25rem', padding: '1rem', margin: '0 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
        <Star size={16} color="#FEF3C7" fill="#FEF3C7" />
        <span style={{ fontSize: '15px', fontWeight: 700, color: '#FEF3C7' }}>Specialty This Week</span>
      </div>
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
        {items.map(item => (
          <div key={item.item_id} onClick={() => onSelect(item)} style={{ flexShrink: 0, background: 'rgba(255,255,255,0.12)', borderRadius: '1rem', padding: '12px', cursor: 'pointer', minWidth: '140px' }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#fff' }}>{item.name}</p>
            {item.name_th && <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>{item.name_th}</p>}
            <p style={{ margin: '8px 0 0', fontSize: '15px', fontWeight: 700, color: '#FEF3C7' }}>฿{item.base_price_thb}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
