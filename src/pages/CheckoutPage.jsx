import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Zap, ClipboardList } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { useShop } from '../context/ShopContext.jsx'
import { gasGet, gasPost, gasGetCached } from '../services/gas.service.js'
import { getTodayStr, isCutoffPassed, formatPrice, generateOrderId } from '../utils/helpers.js'
import { normalizePhone, validatePhone } from '../utils/phoneNorm.js'
import CountdownTimer from '../components/CountdownTimer.jsx'

function isSlotAvailable(slot) {
  const active = typeof slot.active === 'boolean' ? slot.active : String(slot.active).toUpperCase() === 'TRUE'
  if (!active) return false
  if (slot.capacity && Number(slot.booked) >= Number(slot.capacity)) return false
  if (isCutoffPassed(slot.cut_off_datetime)) return false
  return true
}

function saveToHistory(order) {
  try {
    const history = JSON.parse(localStorage.getItem('civ_history') || '[]')
    if (!history.find(o => o.order_id === order.order_id)) {
      localStorage.setItem('civ_history', JSON.stringify([order, ...history]))
    }
  } catch {}
}

const inputStyle = {
  width: '100%', boxSizing: 'border-box', border: '1px solid #E8D5C0',
  borderRadius: '0.875rem', padding: '12px 14px', fontSize: '15px',
  background: '#fff', color: '#2C1A0E', outline: 'none',
}

function Field({ label, children }) {
  return (
    <div>
      <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 500, color: '#8C6A52' }}>{label}</p>
      {children}
    </div>
  )
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, total, count, clearCart } = useCart()
  const { gachaActive, deliveryLocations, blockedDates } = useShop()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [deliveryLocation, setDeliveryLocation] = useState('')
  const [altContact, setAltContact] = useState('')
  const [note, setNote] = useState('')
  const [slots, setSlots] = useState([])
  const [slotsLoading, setSlotsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlotId, setSelectedSlotId] = useState('')

  const autoSelectedRef = useRef(false)
  const [fastPassCustomer, setFastPassCustomer] = useState(null)
  const [showFullForm, setShowFullForm] = useState(false)
  const [usualOrder, setUsualOrder] = useState(null)
  const [usualBannerDismissed, setUsualBannerDismissed] = useState(false)

  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (count === 0) { navigate('/'); return }
    fetchSlots()
    checkFastPass()
    try {
      const raw = localStorage.getItem('usual_order')
      if (raw) setUsualOrder(JSON.parse(raw))
    } catch {}
  }, [])

  function fetchSlots() {
    setSlotsLoading(true)
    gasGetCached('getDeliverySlots', { from: getTodayStr() }, data => {
      const available = (data || []).filter(isSlotAvailable)
      setSlots(available)
      if (available.length > 0 && !autoSelectedRef.current) {
        setSelectedDate(available[0].date)
        setSelectedSlotId(available[0].slot_id)
        autoSelectedRef.current = true
      }
      setSlotsLoading(false)
    })
      .catch(() => {})
      .finally(() => setSlotsLoading(false))
  }

  async function checkFastPass() {
    try {
      const raw = localStorage.getItem('usual_order')
      if (!raw) return
      const usual = JSON.parse(raw)
      if (!usual.phone) return
      const res = await gasGet('getCustomer', { phone: usual.phone })
      if (res.status === 'success' && res.data && Number(res.data.wallet_thb) >= total) {
        setFastPassCustomer({ ...usual, wallet_thb: Number(res.data.wallet_thb), name: res.data.name || usual.name })
      }
    } catch {}
  }

  useEffect(() => {
    if (selectedDate && blockedDates.length > 0 && blockedDates.includes(selectedDate)) {
      const next = slots.find(s => !blockedDates.includes(s.date))
      setSelectedDate(next ? next.date : '')
      setSelectedSlotId(next ? next.slot_id : '')
    }
  }, [blockedDates])

  const filteredSlots = slots.filter(s => !blockedDates.includes(s.date))
  const dates = [...new Set(filteredSlots.map(s => s.date))]
  const slotsForDate = filteredSlots.filter(s => s.date === selectedDate)

  function selectDate(date) {
    setSelectedDate(date)
    const first = filteredSlots.find(s => s.date === date)
    if (first) setSelectedSlotId(first.slot_id)
  }

  async function handleFastPass() {
    if (!selectedSlotId) { setError('Select a delivery slot'); return }
    setError('')
    setSubmitting(true)
    const orderId = generateOrderId()
    try {
      const res = await gasPost('submitOrder', {
        order_id: orderId,
        customer_name: fastPassCustomer.name,
        customer_phone: fastPassCustomer.phone,
        delivery_date: selectedDate,
        delivery_slot: selectedSlotId,
        delivery_location: fastPassCustomer.location,
        alt_contact: fastPassCustomer.alt_contact || '',
        items: JSON.stringify(items),
        total_thb: total,
        note: '',
        is_gift: false,
        gift_message: '',
        is_beta_tester: false,
        is_fast_pass: true,
        is_gacha: gachaActive,
        slip_base64: '',
        slip_hash: '',
        wallet_used_thb: total,
      })
      if (res.status === 'success') {
        saveToHistory({ order_id: orderId, delivery_date: selectedDate, items, total_thb: total, status: 'pending' })
        clearCart()
        navigate(`/confirm/${orderId}`, { replace: true })
      } else {
        setError(res.message || 'Failed to place order')
      }
    } catch {
      setError('Connection error. Try again.')
    }
    setSubmitting(false)
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const normalized = normalizePhone(phone)
    if (!validatePhone(normalized)) { setError('Invalid phone number (e.g. 081-234-5678)'); return }
    if (!selectedSlotId) { setError('Select a delivery slot'); return }
    if (!deliveryLocation.trim()) { setError('Enter delivery location'); return }

    navigate('/payment', {
      state: {
        order: {
          order_id: generateOrderId(),
          customer_name: name.trim(),
          customer_phone: normalized,
          delivery_date: selectedDate,
          delivery_slot: selectedSlotId,
          delivery_location: deliveryLocation.trim(),
          alt_contact: altContact.trim(),
          items: JSON.stringify(items),
          total_thb: total,
          note: note.trim(),
          is_gift: false,
          gift_message: '',
          is_beta_tester: false,
          is_fast_pass: false,
          is_gacha: gachaActive,
          wallet_used_thb: 0,
        }
      }
    })
  }

  const showFastPass = fastPassCustomer && !showFullForm

  return (
    <div style={{ minHeight: '100dvh', background: '#FAF6F0', paddingBottom: '2rem' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #E8D5C0', padding: '12px 1rem', display: 'flex', alignItems: 'center', gap: '12px', position: 'sticky', top: 0, zIndex: 50 }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '4px' }}>
          <ChevronLeft size={22} color="#2C1A0E" />
        </button>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#2C1A0E' }}>Checkout</h1>
      </div>

      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Cart summary */}
        <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '1rem', boxShadow: '0 2px 12px rgba(44,26,14,0.07)' }}>
          <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 600, color: '#8C6A52', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Your Order</p>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '14px', color: '#2C1A0E' }}>{item.name} ×{item.qty}</span>
              <span style={{ fontSize: '14px', color: '#7C3A1E', fontWeight: 600 }}>{formatPrice(item.price * item.qty)}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid #E8D5C0', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '15px', fontWeight: 600, color: '#2C1A0E' }}>Total</span>
            <span style={{ fontSize: '17px', fontWeight: 700, color: '#7C3A1E' }}>{formatPrice(total)}</span>
          </div>
        </div>

        {gachaActive && (
          <div style={{ background: '#7C3A1E', borderRadius: '1rem', padding: '12px 14px' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#FEF3C7', fontWeight: 500 }}>Gacha week — your drink will be a surprise. It'll be good!</p>
          </div>
        )}

        {/* Slot selection */}
        <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '1rem', boxShadow: '0 2px 12px rgba(44,26,14,0.07)' }}>
          <p style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: 600, color: '#2C1A0E' }}>Delivery</p>
          {slotsLoading ? (
            <p style={{ margin: 0, fontSize: '14px', color: '#8C6A52' }}>Loading slots…</p>
          ) : slots.length === 0 ? (
            <p style={{ margin: 0, fontSize: '14px', color: '#C0392B' }}>No delivery slots available right now.</p>
          ) : (
            <>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '12px', paddingBottom: '2px', scrollbarWidth: 'none' }}>
                {dates.map(date => (
                  <button key={date} onClick={() => selectDate(date)} style={{ flexShrink: 0, background: selectedDate === date ? '#7C3A1E' : '#F5EDE3', color: selectedDate === date ? '#fff' : '#2C1A0E', border: 'none', borderRadius: '9999px', padding: '8px 16px', fontSize: '13px', fontWeight: selectedDate === date ? 600 : 400, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    {new Date(date + 'T00:00:00').toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {slotsForDate.map(slot => (
                  <button key={slot.slot_id} onClick={() => setSelectedSlotId(slot.slot_id)} style={{ background: selectedSlotId === slot.slot_id ? '#7C3A1E' : '#F5EDE3', color: selectedSlotId === slot.slot_id ? '#fff' : '#2C1A0E', border: 'none', borderRadius: '9999px', padding: '8px 16px', fontSize: '14px', fontWeight: selectedSlotId === slot.slot_id ? 600 : 400, cursor: 'pointer' }}>
                    {slot.slot_label}
                  </button>
                ))}
              </div>
              {selectedSlotId && (() => {
                const sel = slotsForDate.find(s => s.slot_id === selectedSlotId)
                return sel ? <div style={{ marginTop: '10px' }}><CountdownTimer cutoffDatetime={sel.cut_off_datetime} /></div> : null
              })()}
            </>
          )}
        </div>

        {showFastPass ? (
          <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '1rem', boxShadow: '0 2px 12px rgba(44,26,14,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Zap size={18} color="#7C3A1E" fill="#7C3A1E" />
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#2C1A0E' }}>Fast Pass</span>
              <span style={{ marginLeft: 'auto', fontSize: '13px', color: '#2E7D32', fontWeight: 600 }}>Wallet ฿{fastPassCustomer.wallet_thb}</span>
            </div>
            <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: 600, color: '#2C1A0E' }}>{fastPassCustomer.name}</p>
            <p style={{ margin: '0 0 2px', fontSize: '14px', color: '#8C6A52' }}>{fastPassCustomer.phone}</p>
            <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#8C6A52' }}>{fastPassCustomer.location}</p>
            {error && <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#C0392B' }}>{error}</p>}
            <button onClick={handleFastPass} disabled={submitting || !selectedSlotId} style={{ width: '100%', background: '#7C3A1E', color: '#fff', border: 'none', borderRadius: '9999px', padding: '14px', fontSize: '15px', fontWeight: 600, cursor: submitting ? 'default' : 'pointer', boxShadow: '0 2px 8px rgba(124,58,30,0.25)', opacity: submitting ? 0.7 : 1 }}>
              {submitting ? 'Placing order…' : `Pay with Wallet — ${formatPrice(total)}`}
            </button>
            <button onClick={() => setShowFullForm(true)} style={{ display: 'block', width: '100%', background: 'none', border: 'none', marginTop: '8px', color: '#8C6A52', fontSize: '14px', cursor: 'pointer', padding: '8px 0', textAlign: 'center' }}>
              Use different details
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {usualOrder && !usualBannerDismissed && (
              <div style={{ background: '#F5EDE3', borderRadius: '1rem', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ClipboardList size={16} color="#7C3A1E" />
                  <span style={{ fontSize: '14px', color: '#2C1A0E', fontWeight: 500 }}>Fill from last order ({usualOrder.name || usualOrder.phone})</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button type="button" onClick={() => {
                    if (usualOrder.name) setName(usualOrder.name)
                    if (usualOrder.phone) setPhone(usualOrder.phone)
                    if (usualOrder.location) setDeliveryLocation(usualOrder.location)
                    if (usualOrder.alt_contact) setAltContact(usualOrder.alt_contact)
                    setUsualBannerDismissed(true)
                  }} style={{ background: '#7C3A1E', color: '#fff', border: 'none', borderRadius: '9999px', padding: '6px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                    Fill
                  </button>
                  <button type="button" onClick={() => setUsualBannerDismissed(true)} style={{ background: 'none', border: 'none', color: '#8C6A52', fontSize: '13px', cursor: 'pointer', padding: '6px 4px' }}>
                    Dismiss
                  </button>
                </div>
              </div>
            )}
            <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '1rem', boxShadow: '0 2px 12px rgba(44,26,14,0.07)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#2C1A0E' }}>Contact</p>
              <Field label="Name"><input required value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={inputStyle} /></Field>
              <Field label="Phone"><input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="081-234-5678" style={inputStyle} /></Field>
              <Field label="Delivery location">
                {deliveryLocations.length > 0 ? (
                  <select required value={deliveryLocation} onChange={e => setDeliveryLocation(e.target.value)} style={{ ...inputStyle, appearance: 'none' }}>
                    <option value="">Select location…</option>
                    {deliveryLocations.map((loc, i) => <option key={i} value={loc}>{loc}</option>)}
                  </select>
                ) : (
                  <input required value={deliveryLocation} onChange={e => setDeliveryLocation(e.target.value)} placeholder="e.g. Ward 5, Room 308" style={inputStyle} />
                )}
              </Field>
              <Field label="Alt contact (optional)"><input value={altContact} onChange={e => setAltContact(e.target.value)} placeholder="LINE ID or other phone" style={inputStyle} /></Field>
            </div>

            <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '1rem', boxShadow: '0 2px 12px rgba(44,26,14,0.07)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Field label="Note (optional)"><input value={note} onChange={e => setNote(e.target.value)} placeholder="Allergies, special requests…" maxLength={100} style={inputStyle} /></Field>
              </div>

            {error && <p style={{ margin: 0, fontSize: '13px', color: '#C0392B' }}>{error}</p>}
            <button type="submit" disabled={filteredSlots.length === 0} style={{ background: '#7C3A1E', color: '#fff', border: 'none', borderRadius: '9999px', padding: '16px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(124,58,30,0.25)', opacity: filteredSlots.length === 0 ? 0.5 : 1 }}>
              Proceed to Payment — {formatPrice(total)}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
