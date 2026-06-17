import { useState, useEffect, useRef } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { Home } from 'lucide-react'
import { gasGet } from '../services/gas.service.js'
import { formatPrice, formatDate } from '../utils/helpers.js'
import StatusBadge from '../components/StatusBadge.jsx'
import DropoffPhoto from '../components/order/DropoffPhoto.jsx'
import Navbar from '../components/layout/Navbar.jsx'

const POLL_MS = 15_000
const MAX_MS = 2 * 60 * 60 * 1000
const DONE = ['delivered', 'rejected']

const STATUS_MESSAGES = {
  pending: 'Waiting for payment confirmation…',
  confirmed: 'Payment confirmed! Your order is queued.',
  preparing: 'Your drinks are being prepared.',
  delivering: 'Your order is on its way!',
  delivered: 'Delivered! Enjoy your drinks.',
  rejected: 'Order rejected. Please contact the seller.',
}

function updateHistoryStatus(orderId, status) {
  try {
    const history = JSON.parse(localStorage.getItem('civ_history') || '[]')
    localStorage.setItem('civ_history', JSON.stringify(
      history.map(o => o.order_id === orderId ? { ...o, status } : o)
    ))
  } catch {}
}

export default function ConfirmPage() {
  const { orderId } = useParams()
  const locState = useLocation().state
  const navigate = useNavigate()

  const orderData = locState?.order
  const [status, setStatus] = useState(orderData?.status || 'pending')
  const [dropoffUrl, setDropoffUrl] = useState('')

  const statusRef = useRef(status)
  const inFlightRef = useRef(false)
  const startRef = useRef(Date.now())

  useEffect(() => { statusRef.current = status }, [status])

  useEffect(() => {
    async function poll() {
      if (inFlightRef.current) return
      inFlightRef.current = true
      try {
        const res = await gasGet('getOrderStatus', { order_id: orderId })
        if (res.status === 'success' && res.data) {
          const s = res.data.status
          setStatus(s)
          if (res.data.dropoff_photo_url) setDropoffUrl(res.data.dropoff_photo_url)
          updateHistoryStatus(orderId, s)
        }
      } catch {}
      inFlightRef.current = false
    }

    poll()

    const id = setInterval(() => {
      if (DONE.includes(statusRef.current)) { clearInterval(id); return }
      if (Date.now() - startRef.current > MAX_MS) { clearInterval(id); return }
      poll()
    }, POLL_MS)

    return () => clearInterval(id)
  }, [orderId])

  const items = orderData?.items || []

  return (
    <div style={{ minHeight: '100dvh', background: '#FAF6F0', paddingBottom: '80px' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #E8D5C0', padding: '14px 1rem' }}>
        <p style={{ margin: '0 0 2px', fontSize: '13px', color: '#8C6A52' }}>Order</p>
        <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#2C1A0E', fontFamily: 'monospace', letterSpacing: '0.02em' }}>{orderId}</p>
      </div>

      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Status */}
        <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '1.5rem 1rem', boxShadow: '0 2px 12px rgba(44,26,14,0.07)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', textAlign: 'center' }}>
          <StatusBadge status={status} />
          <p style={{ margin: 0, fontSize: '15px', color: '#2C1A0E' }}>{STATUS_MESSAGES[status] || status}</p>
          {!DONE.includes(status) && (
            <p style={{ margin: 0, fontSize: '12px', color: '#8C6A52' }}>Checking for updates every 15 seconds</p>
          )}
        </div>

        {/* Order details */}
        {orderData && (
          <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '1rem', boxShadow: '0 2px 12px rgba(44,26,14,0.07)' }}>
            {orderData.delivery_date && (
              <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#8C6A52' }}>Delivery: {formatDate(orderData.delivery_date)}</p>
            )}
            {items.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '14px', color: '#2C1A0E' }}>{item.name} ×{item.qty}</span>
                <span style={{ fontSize: '14px', color: '#7C3A1E', fontWeight: 600 }}>{formatPrice(item.price * item.qty)}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #E8D5C0', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#2C1A0E' }}>Total</span>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#7C3A1E' }}>{formatPrice(orderData.total_thb)}</span>
            </div>
          </div>
        )}

        {dropoffUrl && <DropoffPhoto url={dropoffUrl} />}

        <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'none', border: '1.5px solid #E8D5C0', borderRadius: '9999px', padding: '14px', fontSize: '15px', fontWeight: 600, color: '#2C1A0E', cursor: 'pointer' }}>
          <Home size={18} />
          Back to Menu
        </button>
      </div>

      <Navbar />
    </div>
  )
}
