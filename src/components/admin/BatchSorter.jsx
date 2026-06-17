import { MapPin } from 'lucide-react'
import { formatPrice } from '../../utils/helpers.js'

export default function BatchSorter({ batches }) {
  if (!batches || batches.length === 0) {
    return <p style={{ fontSize: '15px', color: '#8C6A52', textAlign: 'center', padding: '2rem 0' }}>No orders for this date.</p>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {batches.map(batch => (
        <div key={batch.location} style={{ background: '#fff', borderRadius: '1.25rem', padding: '1rem', boxShadow: '0 2px 12px rgba(44,26,14,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <MapPin size={16} color="#7C3A1E" />
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#2C1A0E' }}>{batch.location}</span>
            <span style={{ marginLeft: 'auto', fontSize: '13px', color: '#8C6A52' }}>{batch.orders?.length || 0} order{batch.orders?.length !== 1 ? 's' : ''}</span>
          </div>
          {batch.orders?.map(order => (
            <div key={order.order_id} style={{ borderTop: '1px solid #E8D5C0', paddingTop: '8px', marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#2C1A0E' }}>{order.customer_name}</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#7C3A1E' }}>{formatPrice(order.total_thb)}</span>
              </div>
              {(() => {
                const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items
                return items?.map((item, i) => (
                  <p key={i} style={{ margin: '2px 0', fontSize: '13px', color: '#8C6A52' }}>
                    {item.name || item.id} ×{item.qty} {item.bean ? `· ${item.bean}` : ''} {item.sweet != null ? `· ${item.sweet}%` : ''} {item.milk ? `· ${item.milk}` : ''}
                  </p>
                ))
              })()}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
