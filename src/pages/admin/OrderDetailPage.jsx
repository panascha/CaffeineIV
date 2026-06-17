import { useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { ChevronLeft, Camera } from 'lucide-react'
import { gasPost } from '../../services/gas.service.js'
import { compressImage, formatPrice, formatDate } from '../../utils/helpers.js'
import { useToast } from '../../components/Toast.jsx'
import SlipVerifier from '../../components/admin/SlipVerifier.jsx'
import DropoffPhoto from '../../components/order/DropoffPhoto.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'

const NEXT_STATUS = {
  confirmed: 'preparing',
  preparing: 'delivering',
  delivering: 'delivered',
}

const NEXT_LABEL = {
  confirmed: 'Mark as Preparing',
  preparing: 'Mark as Delivering',
  delivering: 'Mark as Delivered',
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const locState = useLocation().state
  const navigate = useNavigate()
  const { show } = useToast()

  const [order, setOrder] = useState(locState?.order || null)
  const [loading, setLoading] = useState(false)

  if (!order) {
    return (
      <div style={{ minHeight: '100dvh', background: '#FAF6F0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '2rem' }}>
        <p style={{ fontSize: '15px', color: '#8C6A52', textAlign: 'center' }}>Order data not found. Go back to Dashboard.</p>
        <button onClick={() => navigate('/admin/dashboard')} style={{ background: '#7C3A1E', color: '#fff', border: 'none', borderRadius: '9999px', padding: '12px 24px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>
          Back to Dashboard
        </button>
      </div>
    )
  }

  const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items || []

  async function updateStatus(newStatus) {
    setLoading(true)
    try {
      const res = await gasPost('updateStatus', { order_id: order.order_id, status: newStatus })
      if (res.status === 'success') {
        setOrder(o => ({ ...o, status: newStatus }))
        show(`Status updated to ${newStatus}`, 'success')
      } else {
        show(res.message || 'Failed to update status', 'error')
      }
    } catch {
      show('Connection error', 'error')
    }
    setLoading(false)
  }

  async function handleDropoffPhoto(e) {
    const file = e.target.files[0]
    if (!file) return
    setLoading(true)
    try {
      const compressed = await compressImage(file)
      const res = await gasPost('uploadDropoffPhoto', { order_id: order.order_id, photo_base64: compressed })
      if (res.status === 'success') {
        setOrder(o => ({ ...o, dropoff_photo_url: res.data?.url || o.dropoff_photo_url }))
        show('Drop-off photo uploaded', 'success')
      } else {
        show(res.message || 'Upload failed', 'error')
      }
    } catch {
      show('Connection error', 'error')
    }
    setLoading(false)
  }

  const nextStatus = NEXT_STATUS[order.status]

  return (
    <div style={{ minHeight: '100dvh', background: '#FAF6F0', paddingBottom: '2rem' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #E8D5C0', padding: '12px 1rem', display: 'flex', alignItems: 'center', gap: '12px', position: 'sticky', top: 0, zIndex: 50 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '4px' }}>
          <ChevronLeft size={22} color="#2C1A0E" />
        </button>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#8C6A52', fontFamily: 'monospace' }}>{order.order_id}</p>
        </div>
        <StatusBadge status={order.status} size="sm" />
      </div>

      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Customer info */}
        <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '1rem', boxShadow: '0 2px 12px rgba(44,26,14,0.07)' }}>
          <p style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: 700, color: '#2C1A0E' }}>{order.customer_name}</p>
          <p style={{ margin: '0 0 2px', fontSize: '14px', color: '#8C6A52' }}>{order.customer_phone}</p>
          {order.alt_contact && <p style={{ margin: '0 0 2px', fontSize: '14px', color: '#8C6A52' }}>Alt: {order.alt_contact}</p>}
          {order.delivery_location && <p style={{ margin: '0 0 2px', fontSize: '14px', color: '#2C1A0E', fontWeight: 500 }}>{order.delivery_location}</p>}
          {order.delivery_date && <p style={{ margin: '0 0 2px', fontSize: '14px', color: '#8C6A52' }}>{formatDate(order.delivery_date)}</p>}
          {order.note && <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#7C3A1E', fontStyle: 'italic' }}>Note: {order.note}</p>}
          {order.is_gift === true || String(order.is_gift).toUpperCase() === 'TRUE' ? (
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#7C3A1E' }}>Gift — {order.gift_message}</p>
          ) : null}
        </div>

        {/* Items */}
        <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '1rem', boxShadow: '0 2px 12px rgba(44,26,14,0.07)' }}>
          <p style={{ margin: '0 0 10px', fontSize: '15px', fontWeight: 600, color: '#2C1A0E' }}>Items</p>
          {items.map((item, i) => (
            <div key={i} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#2C1A0E' }}>{item.name} ×{item.qty}</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#7C3A1E' }}>{formatPrice(item.price * item.qty)}</span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#8C6A52' }}>
                {[item.bean, item.sweet != null ? `${item.sweet}%` : null, item.milk].filter(Boolean).join(' · ')}
                {item.note ? ` — ${item.note}` : ''}
              </p>
            </div>
          ))}
          <div style={{ borderTop: '1px solid #E8D5C0', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '15px', fontWeight: 600 }}>Total</span>
            <span style={{ fontSize: '17px', fontWeight: 700, color: '#7C3A1E' }}>{formatPrice(order.total_thb)}</span>
          </div>
          {order.wallet_used_thb > 0 && (
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#8C6A52' }}>Wallet used: {formatPrice(order.wallet_used_thb)}</p>
          )}
        </div>

        {/* Slip verifier */}
        <SlipVerifier
          order={order}
          loading={loading}
          onConfirm={() => updateStatus('confirmed')}
          onReject={() => updateStatus('rejected')}
        />

        {/* Status advance button */}
        {nextStatus && (
          <button
            onClick={() => updateStatus(nextStatus)}
            disabled={loading}
            style={{ background: '#7C3A1E', color: '#fff', border: 'none', borderRadius: '9999px', padding: '16px', fontSize: '15px', fontWeight: 600, cursor: loading ? 'default' : 'pointer', boxShadow: '0 2px 8px rgba(124,58,30,0.25)', opacity: loading ? 0.7 : 1 }}
          >
            {NEXT_LABEL[order.status]}
          </button>
        )}

        {/* Drop-off photo */}
        {order.dropoff_photo_url && <DropoffPhoto url={order.dropoff_photo_url} />}

        {order.status === 'delivering' || order.status === 'delivered' ? (
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: '1.5px dashed #E8D5C0', borderRadius: '9999px', padding: '14px', fontSize: '14px', color: '#8C6A52', fontWeight: 500, cursor: 'pointer' }}>
            <Camera size={18} />
            {order.dropoff_photo_url ? 'Replace drop-off photo' : 'Upload drop-off photo'}
            <input type="file" accept="image/*" onChange={handleDropoffPhoto} style={{ display: 'none' }} disabled={loading} />
          </label>
        ) : null}
      </div>
    </div>
  )
}
