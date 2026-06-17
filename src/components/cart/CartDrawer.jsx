import { useState, useEffect } from 'react'
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { useCart, itemKey } from '../../context/CartContext.jsx'
import { formatPrice } from '../../utils/helpers.js'
import { useNavigate } from 'react-router-dom'

const MILK_LABELS = { fresh: 'Fresh', oat: 'Oat', none: 'No milk' }

export default function CartDrawer({ open, onClose }) {
  const { items, updateQty, removeItem, total, count } = useCart()
  const navigate = useNavigate()
  const [visible, setVisible] = useState(open)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (open) { setVisible(true); setClosing(false) }
  }, [open])

  function handleClose() {
    setClosing(true)
    setTimeout(() => { setVisible(false); onClose() }, 250)
  }

  function handleCheckout() {
    onClose()
    navigate('/checkout')
  }

  if (!visible) return null

  const overlayAnim = closing ? 'fadeOut 250ms ease-in forwards' : 'fadeIn 200ms ease-out'
  const sheetAnim   = closing ? 'slideDown 250ms ease-in forwards' : 'slideUp 300ms ease-out'

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={handleClose} style={{ position: 'absolute', inset: 0, background: 'rgba(44,26,14,0.4)', animation: overlayAnim }} />
      <div style={{ position: 'relative', background: '#fff', borderRadius: '1.5rem 1.5rem 0 0', padding: '1.5rem 1rem', boxShadow: '0 -4px 24px rgba(44,26,14,0.10)', maxHeight: '80vh', display: 'flex', flexDirection: 'column', maxWidth: '480px', width: '100%', margin: '0 auto', animation: sheetAnim }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={20} color="#7C3A1E" />
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#2C1A0E' }}>Cart ({count})</h2>
          </div>
          <button onClick={handleClose} style={{ background: '#F5EDE3', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} color="#2C1A0E" />
          </button>
        </div>

        {items.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '2rem 0' }}>
            <img src="/banner.jpg" alt="" style={{ width: '80px', opacity: 0.3 }} />
            <p style={{ margin: 0, fontSize: '15px', color: '#8C6A52' }}>Cart is empty</p>
          </div>
        ) : (
          <>
            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '1rem' }}>
              {items.map(item => {
                const key = itemKey(item)
                return (
                  <div key={key} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#2C1A0E' }}>{item.name}</p>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#8C6A52' }}>
                        {[item.bean, item.sweet != null ? `${item.sweet}%` : null, MILK_LABELS[item.milk] || item.milk].filter(Boolean).join(' · ')}
                      </p>
                      <p style={{ margin: '4px 0 0', fontSize: '14px', fontWeight: 600, color: '#7C3A1E' }}>{formatPrice(item.price)}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button onClick={() => updateQty(key, item.qty - 1)} style={{ background: '#F5EDE3', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Minus size={14} color="#7C3A1E" />
                      </button>
                      <span style={{ fontSize: '15px', fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>{item.qty}</span>
                      <button onClick={() => updateQty(key, item.qty + 1)} style={{ background: '#F5EDE3', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Plus size={14} color="#7C3A1E" />
                      </button>
                      <button onClick={() => removeItem(key)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}>
                        <Trash2 size={16} color="#C0392B" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{ borderTop: '1px solid #E8D5C0', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '15px', fontWeight: 600, color: '#2C1A0E' }}>Total</span>
                <span style={{ fontSize: '18px', fontWeight: 700, color: '#7C3A1E' }}>{formatPrice(total)}</span>
              </div>
              <button onClick={handleCheckout} style={{ width: '100%', background: '#7C3A1E', color: '#fff', border: 'none', borderRadius: '9999px', padding: '14px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(124,58,30,0.25)' }}>
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
