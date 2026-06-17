import { useState } from 'react'
import { X, Minus, Plus } from 'lucide-react'
import { formatPrice } from '../../utils/helpers.js'
import { useCart } from '../../context/CartContext.jsx'

const SWEET_OPTIONS = [
  { value: 0,   label: '0%' },
  { value: 25,  label: '25%' },
  { value: 50,  label: '50%' },
  { value: 100, label: '100%' },
]

const MILK_LABELS = { fresh: 'Fresh milk', oat: 'Oat milk', none: 'No milk' }

export default function DrinkCustomizer({ item, onClose }) {
  const { addItem } = useCart()
  const beans = item.bean_options ? (typeof item.bean_options === 'string' ? JSON.parse(item.bean_options) : item.bean_options) : []
  const milks = item.milk_options ? (typeof item.milk_options === 'string' ? JSON.parse(item.milk_options) : item.milk_options) : []

  const [bean, setBean] = useState(beans[0] || '')
  const [sweet, setSweet] = useState(50)
  const [milk, setMilk] = useState(milks[0] || '')
  const [qty, setQty] = useState(1)
  const [note, setNote] = useState('')
  const [closing, setClosing] = useState(false)

  const oatSurcharge = milk === 'oat' ? (item.oat_surcharge_thb || 0) : 0
  const beanSurcharge = parseBeanSurcharge(bean)
  const unitPrice = item.base_price_thb + oatSurcharge + beanSurcharge

  function handleClose() {
    setClosing(true)
    setTimeout(() => onClose(), 250)
  }

  function handleAdd() {
    addItem({
      id: item.item_id,
      name: item.name,
      qty,
      bean: beans.length > 0 ? bean.replace(/\s*\(\+\d+\)/, '').trim() : undefined,
      sweet: SWEET_OPTIONS.some(s => s.value === sweet) ? sweet : 50,
      milk: milks.length > 0 ? milk : undefined,
      price: unitPrice,
      note: note.trim() || undefined,
    })
    onClose()
  }

  const overlayAnim = closing ? 'fadeOut 250ms ease-in forwards' : 'fadeIn 200ms ease-out'
  const sheetAnim   = closing ? 'slideDown 250ms ease-in forwards' : 'slideUp 300ms ease-out'

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={handleClose} style={{ position: 'absolute', inset: 0, background: 'rgba(44,26,14,0.4)', animation: overlayAnim }} />
      <div style={{ position: 'relative', background: '#fff', borderRadius: '1.5rem 1.5rem 0 0', padding: '1.5rem 1rem', boxShadow: '0 -4px 24px rgba(44,26,14,0.10)', maxHeight: '90vh', overflowY: 'auto', maxWidth: '480px', width: '100%', margin: '0 auto', animation: sheetAnim }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#2C1A0E' }}>{item.name}</h2>
            {item.name_th && <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#8C6A52' }}>{item.name_th}</p>}
          </div>
          <button onClick={handleClose} style={{ background: '#F5EDE3', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} color="#2C1A0E" />
          </button>
        </div>

        {/* Coffee Type */}
        {beans.length > 1 && (
          <Section label="Coffee Type">
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {beans.map(b => {
                const label = b.replace(/\s*\(\+\d+\)/, '').trim()
                const sur = parseBeanSurcharge(b)
                return (
                  <Chip key={b} active={bean === b} onClick={() => setBean(b)}>
                    {label}{sur > 0 ? ` +฿${sur}` : ''}
                  </Chip>
                )
              })}
            </div>
          </Section>
        )}

        {/* Sweetness */}
        <Section label="Sweetness">
          <div style={{ display: 'flex', gap: '8px' }}>
            {SWEET_OPTIONS.map(s => (
              <Chip key={s.value} active={sweet === s.value} onClick={() => setSweet(s.value)}>{s.label}</Chip>
            ))}
          </div>
        </Section>

        {/* Milk */}
        {milks.length > 1 && (
          <Section label="Milk">
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {milks.map(m => (
                <Chip key={m} active={milk === m} onClick={() => setMilk(m)}>
                  {MILK_LABELS[m] || m}{m === 'oat' && oatSurcharge > 0 ? ` +฿${oatSurcharge}` : ''}
                </Chip>
              ))}
            </div>
          </Section>
        )}

        {/* Note */}
        <Section label="Note (optional)">
          <input
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="e.g. less sweet, no ice"
            maxLength={100}
            style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #E8D5C0', borderRadius: '0.875rem', padding: '10px 14px', fontSize: '15px', background: '#fff', color: '#2C1A0E', outline: 'none' }}
          />
        </Section>

        {/* Qty + Add */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#F5EDE3', borderRadius: '9999px', padding: '6px 12px' }}>
            <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}>
              <Minus size={18} color="#7C3A1E" />
            </button>
            <span style={{ fontSize: '17px', fontWeight: 600, color: '#2C1A0E', minWidth: '24px', textAlign: 'center' }}>{qty}</span>
            <button onClick={() => setQty(q => q + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}>
              <Plus size={18} color="#7C3A1E" />
            </button>
          </div>
          <button onClick={handleAdd} style={{ flex: 1, background: '#7C3A1E', color: '#fff', border: 'none', borderRadius: '9999px', padding: '14px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(124,58,30,0.25)' }}>
            Add to cart — {formatPrice(unitPrice * qty)}
          </button>
        </div>
      </div>
    </div>
  )
}

function parseBeanSurcharge(name) {
  const m = name?.match(/\(\+(\d+)\)/)
  return m ? Number(m[1]) : 0
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 600, color: '#8C6A52', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
      {children}
    </div>
  )
}

function Chip({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{ background: active ? '#7C3A1E' : '#F5EDE3', color: active ? '#fff' : '#2C1A0E', border: 'none', borderRadius: '9999px', padding: '8px 16px', fontSize: '14px', fontWeight: active ? 600 : 400, cursor: 'pointer', transition: '150ms ease-out', whiteSpace: 'nowrap' }}>
      {children}
    </button>
  )
}
