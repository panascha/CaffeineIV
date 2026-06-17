import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronLeft, Upload } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { useShop } from '../context/ShopContext.jsx'
import { gasPost } from '../services/gas.service.js'
import { compressImage, formatPrice } from '../utils/helpers.js'
import { hashBase64 } from '../utils/slipHash.js'
import PromptPayQR from '../components/PromptPayQR.jsx'

function saveToHistory(order) {
  try {
    const history = JSON.parse(localStorage.getItem('civ_history') || '[]')
    if (!history.find(o => o.order_id === order.order_id)) {
      localStorage.setItem('civ_history', JSON.stringify([order, ...history]))
    }
  } catch {}
}

function saveUsualOrder(order) {
  try {
    localStorage.setItem('usual_order', JSON.stringify({
      phone: order.customer_phone,
      name: order.customer_name,
      location: order.delivery_location,
      alt_contact: order.alt_contact || '',
    }))
  } catch {}
}

export default function PaymentPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { clearCart } = useCart()
  const { promptpayNumber } = useShop()

  const order = location.state?.order

  useEffect(() => {
    if (!order) navigate('/', { replace: true })
  }, [])

  const [slipPreview, setSlipPreview] = useState(null)
  const [slipBase64, setSlipBase64] = useState('')
  const [slipHash, setSlipHash] = useState('')
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!order) return null

  const items = JSON.parse(order.items || '[]')

  async function handleSlipChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const compressed = await compressImage(file)
      const hash = await hashBase64(compressed)
      setSlipBase64(compressed)
      setSlipHash(hash)
      setSlipPreview(compressed)
    } catch {
      setError('Could not process image. Try a different file.')
    }
    setUploading(false)
  }

  async function handleSubmit() {
    if (!slipBase64) { setError('Upload your payment slip first'); return }
    setError('')
    setSubmitting(true)
    try {
      const res = await gasPost('submitOrder', {
        ...order,
        slip_base64: slipBase64,
        slip_hash: slipHash,
      })
      if (res.status === 'success') {
        saveToHistory({ order_id: order.order_id, delivery_date: order.delivery_date, items, total_thb: order.total_thb, status: 'pending' })
        saveUsualOrder(order)
        clearCart()
        navigate(`/confirm/${order.order_id}`, { replace: true, state: { order: { ...order, items, status: 'pending' } } })
      } else if (res.message === 'DUPLICATE_SLIP') {
        setError('This slip has already been used. Upload a different slip.')
      } else {
        setError(res.message || 'Failed to submit order. Try again.')
      }
    } catch {
      setError('Connection error. Check your network and try again.')
    }
    setSubmitting(false)
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#FAF6F0', paddingBottom: '2rem' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #E8D5C0', padding: '12px 1rem', display: 'flex', alignItems: 'center', gap: '12px', position: 'sticky', top: 0, zIndex: 50 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '4px' }}>
          <ChevronLeft size={22} color="#2C1A0E" />
        </button>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#2C1A0E' }}>Payment</h1>
      </div>

      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
        {/* Instructions */}
        <div style={{ width: '100%', background: '#fff', borderRadius: '1.25rem', padding: '1rem', boxShadow: '0 2px 12px rgba(44,26,14,0.07)' }}>
          <p style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 600, color: '#2C1A0E' }}>Transfer {formatPrice(order.total_thb)}</p>
          <p style={{ margin: 0, fontSize: '14px', color: '#8C6A52' }}>Scan QR or use PromptPay number, then upload your slip below.</p>
        </div>

        <PromptPayQR phoneOrTaxId={promptpayNumber} amountThb={order.total_thb} size={220} />

        {/* Order summary */}
        <div style={{ width: '100%', background: '#fff', borderRadius: '1.25rem', padding: '1rem', boxShadow: '0 2px 12px rgba(44,26,14,0.07)' }}>
          <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 600, color: '#8C6A52', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Order Summary</p>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '14px', color: '#2C1A0E' }}>{item.name} ×{item.qty}</span>
              <span style={{ fontSize: '14px', color: '#7C3A1E', fontWeight: 600 }}>{formatPrice(item.price * item.qty)}</span>
            </div>
          ))}
        </div>

        {/* Slip upload */}
        <div style={{ width: '100%', background: '#fff', borderRadius: '1.25rem', padding: '1rem', boxShadow: '0 2px 12px rgba(44,26,14,0.07)' }}>
          <p style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: 600, color: '#2C1A0E' }}>Upload Payment Slip</p>

          {slipPreview ? (
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <img src={slipPreview} alt="Slip preview" style={{ width: '100%', borderRadius: '0.875rem', maxHeight: '280px', objectFit: 'contain', background: '#FAF6F0' }} />
              <button onClick={() => { setSlipPreview(null); setSlipBase64(''); setSlipHash('') }} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '9999px', padding: '4px 14px', fontSize: '13px', cursor: 'pointer', color: '#C0392B', fontWeight: 600 }}>
                Change
              </button>
            </div>
          ) : (
            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '2rem 1rem', border: '2px dashed #E8D5C0', borderRadius: '0.875rem', cursor: uploading ? 'default' : 'pointer', marginBottom: '12px' }}>
              <Upload size={24} color="#8C6A52" />
              <span style={{ fontSize: '14px', color: '#8C6A52' }}>{uploading ? 'Processing…' : 'Tap to upload slip'}</span>
              <input type="file" accept="image/*" onChange={handleSlipChange} style={{ display: 'none' }} disabled={uploading} />
            </label>
          )}

          {error && <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#C0392B' }}>{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={submitting || uploading || !slipBase64}
            style={{ width: '100%', background: slipBase64 ? '#7C3A1E' : '#F5EDE3', color: slipBase64 ? '#fff' : '#8C6A52', border: 'none', borderRadius: '9999px', padding: '16px', fontSize: '15px', fontWeight: 600, cursor: slipBase64 && !submitting ? 'pointer' : 'default', boxShadow: slipBase64 ? '0 2px 8px rgba(124,58,30,0.25)' : 'none', transition: '150ms ease-out' }}
          >
            {submitting ? 'Submitting…' : 'Submit Order'}
          </button>
        </div>
      </div>
    </div>
  )
}
