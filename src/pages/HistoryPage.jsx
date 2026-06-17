import Navbar from '../components/layout/Navbar.jsx'
import OrderCard from '../components/order/OrderCard.jsx'
import { ClipboardList } from 'lucide-react'

const HISTORY_KEY = 'civ_history'

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []
  } catch {
    return []
  }
}

export default function HistoryPage() {
  const orders = loadHistory()
  const sorted = [...orders].sort((a, b) => b.order_id?.localeCompare(a.order_id) ?? 0)

  return (
    <div style={{ minHeight: '100dvh', background: '#FAF6F0', paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E8D5C0', padding: '14px 1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ClipboardList size={20} color="#7C3A1E" />
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#2C1A0E' }}>My Orders</h1>
      </div>

      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sorted.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '4rem 0' }}>
            <img src="/banner.jpg" alt="" style={{ width: '100px', opacity: 0.25 }} />
            <p style={{ margin: 0, fontSize: '15px', color: '#8C6A52' }}>No orders yet</p>
            <p style={{ margin: 0, fontSize: '13px', color: '#8C6A52', textAlign: 'center', lineHeight: 1.5 }}>Your order history will appear here after your first order.</p>
          </div>
        ) : (
          sorted.map(order => (
            <OrderCard key={order.order_id} order={order} />
          ))
        )}
      </div>

      <Navbar />
    </div>
  )
}
