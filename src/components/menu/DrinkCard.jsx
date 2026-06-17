import { formatPrice } from '../../utils/helpers.js'
import { Plus, Star } from 'lucide-react'

export default function DrinkCard({ item, onSelect }) {
  const hasImage = Boolean(item.image_url)
  return (
    <div
      onClick={() => onSelect(item)}
      style={{ background: '#fff', borderRadius: '1.25rem', boxShadow: '0 2px 12px rgba(44,26,14,0.07)', overflow: 'hidden', cursor: 'pointer', transition: 'transform 150ms ease-out', position: 'relative' }}
      onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
      onMouseUp={e => e.currentTarget.style.transform = ''}
      onMouseLeave={e => e.currentTarget.style.transform = ''}
      onTouchStart={e => e.currentTarget.style.transform = 'scale(0.98)'}
      onTouchEnd={e => e.currentTarget.style.transform = ''}
    >
      {item.is_specialty_week && (
        <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#7C3A1E', color: '#fff', borderRadius: '9999px', padding: '2px 10px', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', zIndex: 1 }}>
          <Star size={10} fill="#fff" />
          Specialty
        </div>
      )}
      {hasImage ? (
        <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
      ) : (
        <div style={{ width: '100%', height: '140px', background: '#F5EDE3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src="/banner.jpg" alt="" style={{ height: '100px', objectFit: 'contain', opacity: 0.35 }} />
        </div>
      )}
      <div style={{ padding: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#2C1A0E' }}>{item.name}</p>
            {item.name_th && <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#8C6A52' }}>{item.name_th}</p>}
            {item.description && <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#8C6A52', lineHeight: 1.4 }}>{item.description}</p>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#7C3A1E' }}>{formatPrice(item.base_price_thb)}</span>
            <div style={{ width: '32px', height: '32px', background: '#7C3A1E', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(124,58,30,0.25)' }}>
              <Plus size={18} color="#fff" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
