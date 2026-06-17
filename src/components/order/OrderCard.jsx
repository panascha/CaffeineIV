import { Link } from 'react-router-dom'
import StatusBadge from '../StatusBadge.jsx'
import { formatDate, formatPrice } from '../../utils/helpers.js'
import { ChevronRight } from 'lucide-react'

export default function OrderCard({ order }) {
  const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items
  const summary = items?.map(i => `${i.name || i.id} ×${i.qty}`).join(', ') || ''

  return (
    <Link to={`/confirm/${order.order_id}`} style={{ display: 'block', background: '#fff', borderRadius: '1.25rem', padding: '1rem', boxShadow: '0 2px 12px rgba(44,26,14,0.07)', textDecoration: 'none', color: 'inherit' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <p style={{ margin: 0, fontSize: '13px', color: '#8C6A52' }}>{order.order_id}</p>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#8C6A52' }}>{formatDate(order.delivery_date)}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <StatusBadge status={order.status} size="sm" />
          <ChevronRight size={16} color="#8C6A52" />
        </div>
      </div>
      <p style={{ margin: 0, fontSize: '14px', color: '#2C1A0E', fontWeight: 500 }}>{summary}</p>
      <p style={{ margin: '4px 0 0', fontSize: '14px', fontWeight: 600, color: '#7C3A1E' }}>{formatPrice(order.total_thb)}</p>
    </Link>
  )
}
