import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { gasGet } from '../../services/gas.service.js'
import { getTodayStr, formatPrice, formatDateTime } from '../../utils/helpers.js'
import AdminNav from '../../components/admin/AdminNav.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'

const STATUS_TABS = ['All', 'pending', 'confirmed', 'preparing', 'delivering', 'delivered', 'rejected']

export default function DashboardPage() {
  const navigate = useNavigate()
  const [date, setDate] = useState(getTodayStr())
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')

  useEffect(() => {
    fetchOrders()
  }, [date])

  async function fetchOrders() {
    setLoading(true)
    try {
      const res = await gasGet('getOrders', { date })
      if (res.status === 'success') setOrders(res.data || [])
    } catch {}
    setLoading(false)
  }

  const filtered = activeTab === 'All' ? orders : orders.filter(o => o.status === activeTab)

  const counts = STATUS_TABS.reduce((acc, tab) => {
    acc[tab] = tab === 'All' ? orders.length : orders.filter(o => o.status === tab).length
    return acc
  }, {})

  function getItemsSummary(order) {
    try {
      const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items
      return items?.map(i => `${i.name || i.id} ×${i.qty}`).join(', ') || ''
    } catch { return '' }
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#FAF6F0' }}>
      <AdminNav />

      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Date picker + refresh */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{ border: '1px solid #E8D5C0', borderRadius: '0.875rem', padding: '8px 12px', fontSize: '15px', background: '#fff', color: '#2C1A0E', outline: 'none', flex: 1 }}
          />
          <button onClick={fetchOrders} style={{ background: '#7C3A1E', color: '#fff', border: 'none', borderRadius: '9999px', padding: '8px 18px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            Refresh
          </button>
        </div>

        {/* Status tabs */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px', scrollbarWidth: 'none' }}>
          {STATUS_TABS.map(tab => counts[tab] > 0 || tab === 'All' ? (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ flexShrink: 0, background: activeTab === tab ? '#7C3A1E' : '#F5EDE3', color: activeTab === tab ? '#fff' : '#2C1A0E', border: 'none', borderRadius: '9999px', padding: '6px 14px', fontSize: '13px', fontWeight: activeTab === tab ? 600 : 400, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {tab === 'All' ? `All (${counts.All})` : `${tab} (${counts[tab]})`}
            </button>
          ) : null)}
        </div>

        {/* Order list */}
        {loading ? (
          <p style={{ fontSize: '15px', color: '#8C6A52', textAlign: 'center', padding: '2rem 0' }}>Loading…</p>
        ) : filtered.length === 0 ? (
          <p style={{ fontSize: '15px', color: '#8C6A52', textAlign: 'center', padding: '2rem 0' }}>No orders{activeTab !== 'All' ? ` with status "${activeTab}"` : ''} for this date.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filtered.map(order => (
              <div
                key={order.order_id}
                onClick={() => navigate(`/admin/orders/${order.order_id}`, { state: { order } })}
                style={{ background: '#fff', borderRadius: '1.25rem', padding: '1rem', boxShadow: '0 2px 12px rgba(44,26,14,0.07)', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#2C1A0E' }}>{order.customer_name}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#8C6A52', fontFamily: 'monospace' }}>{order.order_id}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <StatusBadge status={order.status} size="sm" />
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#7C3A1E' }}>{formatPrice(order.total_thb)}</span>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#8C6A52' }}>{getItemsSummary(order)}</p>
                {order.delivery_location && <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#8C6A52' }}>{order.delivery_location}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
