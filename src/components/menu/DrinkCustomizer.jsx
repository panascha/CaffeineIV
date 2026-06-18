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

function normOpts(raw) {
  const arr = Array.isArray(raw) ? raw
    : typeof raw === 'string'
      ? (() => { try { return JSON.parse(raw || '[]') } catch { return [] } })()
      : []
  return arr.map(o => typeof o === 'string'
    ? { name: o.replace(/\s*\(\+\d+\)/, '').trim(), surcharge: Number(o.match(/\(\+(\d+)\)/)?.[1] || 0) }
    : { name: String(o.name || ''), surcharge: Number(o.surcharge) || 0 }
  )
}

export default function DrinkCustomizer({ item, onClose, initialValues = null, editKey = null, onUpdate = null }) {
  const { addItem } = useCart()
  const beans = normOpts(item.bean_options)
  const milks = normOpts(item.milk_options)

  const [bean, setBean] = useState(() => {
    if (initialValues?.bean) return beans.find(b => b.name === initialValues.bean) || beans[0] || null
    return beans[0] || null
  })
  const [sweet, setSweet] = useState(initialValues?.sweet ?? 50)
  const [milk, setMilk] = useState(() => {
    if (initialValues?.milk) return milks.find(m => m.name === initialValues.milk) || milks[0] || null
    return milks[0] || null
  })
  const [qty, setQty] = useState(initialValues?.qty ?? 1)
  const [addOn, setAddOn] = useState(initialValues?.add_on ?? '')
  const [addOnPrice, setAddOnPrice] = useState(initialValues?.add_on_price ?? 0)
  const [closing, setClosing] = useState(false)

  const beanSurcharge = bean?.surcharge || 0
  const milkSurcharge = milk?.surcharge || 0
  const unitPrice = item.base_price_thb + milkSurcharge + beanSurcharge + (addOnPrice || 0)

  function handleClose() {
    setClosing(true)
    setTimeout(() => onClose(), 250)
  }

  function handleAdd() {
    const cartItem = {
      id: item.item_id,
      name: item.name,
      qty,
      bean: beans.length > 0 ? bean?.name : undefined,
      sweet: SWEET_OPTIONS.some(s => s.value === sweet) ? sweet : 50,
      milk: milks.length > 0 ? milk?.name : undefined,
      price: unitPrice,
      add_on: addOn.trim() || undefined,
      add_on_price: addOnPrice > 0 ? addOnPrice : undefined,
    }
    if (editKey && onUpdate) {
      onUpdate(editKey, cartItem)
    } else {
      addItem(cartItem)
      onClose()
    }
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
              {beans.map(b => (
                <Chip key={b.name} active={bean?.name === b.name} onClick={() => setBean(b)}>
                  {b.name}{b.surcharge > 0 ? ` +฿${b.surcharge}` : ''}
                </Chip>
              ))}
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
                <Chip key={m.name} active={milk?.name === m.name} onClick={() => setMilk(m)}>
                  {m.name}{m.surcharge > 0 ? ` +฿${m.surcharge}` : ''}
                </Chip>
              ))}
            </div>
          </Section>
        )}

        {/* Add-on */}
        <Section label="Add-on (optional)">
          <textarea
            value={addOn}
            onChange={e => setAddOn(e.target.value)}
            placeholder="e.g. extra espresso shot, syrup"
            maxLength={100}
            rows={2}
            style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #E8D5C0', borderRadius: '0.875rem', padding: '10px 14px', fontSize: '15px', background: '#fff', color: '#2C1A0E', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
          />
        </Section>
        <Section label="Add-on price (฿)">
          <input
            type="number"
            value={addOnPrice || ''}
            onChange={e => setAddOnPrice(Math.max(0, Number(e.target.value) || 0))}
            placeholder="0"
            min={0}
            step={1}
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
            {editKey ? 'Update cart' : 'Add to cart'} — {formatPrice(unitPrice * qty)}
          </button>
        </div>
      </div>
    </div>
  )
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
