import { useState } from 'react'
import { Search, Stamp } from 'lucide-react'
import { gasGet } from '../services/gas.service.js'
import { normalizePhone, validatePhone } from '../utils/phoneNorm.js'
import { useShop } from '../context/ShopContext.jsx'
import Navbar from '../components/layout/Navbar.jsx'
import StampCard from '../components/loyalty/StampCard.jsx'

export default function StampsPage() {
  const { stampThreshold } = useShop()
  const [phone, setPhone] = useState('')
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLookup(e) {
    e.preventDefault()
    const normalized = normalizePhone(phone)
    if (!validatePhone(normalized)) {
      setError('Enter a valid Thai mobile number (e.g. 081-234-5678)')
      return
    }
    setError('')
    setCustomer(null)
    setLoading(true)
    try {
      const res = await gasGet('getCustomer', { phone: normalized })
      if (res.status === 'success' && res.data) {
        setCustomer(res.data)
      } else {
        setError('Phone number not found. Place an order first to start collecting stamps.')
      }
    } catch {
      setError('Could not connect. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#FAF6F0', paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E8D5C0', padding: '14px 1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Stamp size={20} color="#7C3A1E" />
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#2C1A0E' }}>Loyalty Stamps</h1>
      </div>

      <div style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <form onSubmit={handleLookup} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ margin: 0, fontSize: '15px', color: '#8C6A52' }}>Enter your phone number to check stamps.</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="081-234-5678"
              style={{ flex: 1, border: '1px solid #E8D5C0', borderRadius: '0.875rem', padding: '12px 14px', fontSize: '15px', background: '#fff', color: '#2C1A0E', outline: 'none' }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{ background: '#7C3A1E', color: '#fff', border: 'none', borderRadius: '9999px', padding: '12px 20px', fontSize: '15px', fontWeight: 600, cursor: loading ? 'default' : 'pointer', boxShadow: '0 2px 8px rgba(124,58,30,0.25)', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Search size={16} />
              {loading ? 'Searching…' : 'Check'}
            </button>
          </div>
          {error && <p style={{ margin: 0, fontSize: '13px', color: '#C0392B' }}>{error}</p>}
        </form>

        {customer && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ margin: 0, fontSize: '15px', color: '#2C1A0E' }}>
              Hi, <strong>{customer.name}</strong>!
            </p>
            <StampCard stamps={Number(customer.stamps) || 0} threshold={stampThreshold} />
            <p style={{ margin: 0, fontSize: '13px', color: '#8C6A52', textAlign: 'center' }}>
              {stampThreshold - (Number(customer.stamps) % stampThreshold)} more order{stampThreshold - (Number(customer.stamps) % stampThreshold) === 1 ? '' : 's'} until a free drink
            </p>
          </div>
        )}
      </div>

      <Navbar />
    </div>
  )
}
