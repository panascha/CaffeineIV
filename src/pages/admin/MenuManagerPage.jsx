import { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import { gasGet, gasPost } from '../../services/gas.service.js'
import { formatPrice } from '../../utils/helpers.js'
import { useToast } from '../../components/Toast.jsx'
import AdminNav from '../../components/admin/AdminNav.jsx'

const BLANK_ITEM = {
  item_id: '', name: '', name_th: '', base_price_thb: '', category: '',
  description: '', available: true, is_specialty_week: false,
  bean_options: '', milk_options: '', oat_surcharge_thb: '',
}

const inputStyle = {
  width: '100%', boxSizing: 'border-box', border: '1px solid #E8D5C0',
  borderRadius: '0.875rem', padding: '10px 12px', fontSize: '14px',
  background: '#fff', color: '#2C1A0E', outline: 'none',
}

function isTrue(v) { return typeof v === 'boolean' ? v : String(v).toUpperCase() === 'TRUE' }

export default function MenuManagerPage() {
  const { show } = useToast()
  const [menu, setMenu] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(null)
  const [form, setForm] = useState(null)

  useEffect(() => { fetchMenu() }, [])

  async function fetchMenu() {
    setLoading(true)
    try {
      const res = await gasGet('getMenu')
      if (res.status === 'success') setMenu(res.data || [])
    } catch {}
    setLoading(false)
  }

  async function toggleField(item, field) {
    const updated = { ...item, [field]: !isTrue(item[field]) }
    setSaving(item.item_id + field)
    try {
      const res = await gasPost('saveMenuItem', updated)
      if (res.status === 'success') {
        setMenu(m => m.map(i => i.item_id === item.item_id ? updated : i))
        show('Saved', 'success')
      } else {
        show(res.message || 'Save failed', 'error')
      }
    } catch { show('Connection error', 'error') }
    setSaving(null)
  }

  async function saveForm() {
    if (!form.name.trim() || !form.base_price_thb) { show('Name and price are required', 'error'); return }
    const payload = {
      ...form,
      base_price_thb: Number(form.base_price_thb),
      oat_surcharge_thb: Number(form.oat_surcharge_thb) || 0,
      item_id: form.item_id || `item_${Date.now()}`,
    }
    setSaving('form')
    try {
      const res = await gasPost('saveMenuItem', payload)
      if (res.status === 'success') {
        show('Saved', 'success')
        setForm(null)
        fetchMenu()
      } else {
        show(res.message || 'Save failed', 'error')
      }
    } catch { show('Connection error', 'error') }
    setSaving(null)
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#FAF6F0' }}>
      <AdminNav />

      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#2C1A0E' }}>Menu Items</h2>
          <button onClick={() => setForm({ ...BLANK_ITEM })} style={{ background: '#7C3A1E', color: '#fff', border: 'none', borderRadius: '9999px', padding: '8px 16px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Plus size={15} /> Add Item
          </button>
        </div>

        {/* Add/edit form */}
        {form && (
          <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '1rem', boxShadow: '0 2px 12px rgba(44,26,14,0.07)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#2C1A0E' }}>{form.item_id ? 'Edit Item' : 'New Item'}</p>
              <button onClick={() => setForm(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} color="#8C6A52" /></button>
            </div>
            {[
              ['Name (EN)', 'name', 'text'],
              ['Name (TH)', 'name_th', 'text'],
              ['Price (฿)', 'base_price_thb', 'number'],
              ['Category', 'category', 'text'],
              ['Description', 'description', 'text'],
              ['Bean options (comma-separated)', 'bean_options', 'text'],
              ['Milk options (comma-separated)', 'milk_options', 'text'],
              ['Oat surcharge (฿)', 'oat_surcharge_thb', 'number'],
            ].map(([label, key, type]) => (
              <div key={key}>
                <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 500, color: '#8C6A52' }}>{label}</p>
                <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={inputStyle} />
              </div>
            ))}
            <button onClick={saveForm} disabled={saving === 'form'} style={{ background: '#7C3A1E', color: '#fff', border: 'none', borderRadius: '9999px', padding: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>
              {saving === 'form' ? 'Saving…' : 'Save Item'}
            </button>
          </div>
        )}

        {/* Item list */}
        {loading ? (
          <p style={{ fontSize: '15px', color: '#8C6A52', textAlign: 'center', padding: '2rem 0' }}>Loading…</p>
        ) : (
          menu.map(item => (
            <div key={item.item_id} style={{ background: '#fff', borderRadius: '1.25rem', padding: '1rem', boxShadow: '0 2px 12px rgba(44,26,14,0.07)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#2C1A0E' }}>{item.name}</p>
                  {item.name_th && <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#8C6A52' }}>{item.name_th}</p>}
                  <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#7C3A1E', fontWeight: 600 }}>{formatPrice(item.base_price_thb)}</p>
                  {item.category && <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#8C6A52' }}>{item.category}</p>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                  <ToggleBtn
                    label="Available"
                    active={isTrue(item.available)}
                    disabled={saving === item.item_id + 'available'}
                    onClick={() => toggleField(item, 'available')}
                  />
                  <ToggleBtn
                    label="Specialty"
                    active={isTrue(item.is_specialty_week)}
                    disabled={saving === item.item_id + 'is_specialty_week'}
                    onClick={() => toggleField(item, 'is_specialty_week')}
                  />
                </div>
              </div>
              <button onClick={() => setForm({ ...item, bean_options: Array.isArray(item.bean_options) ? item.bean_options.join(',') : item.bean_options || '', milk_options: Array.isArray(item.milk_options) ? item.milk_options.join(',') : item.milk_options || '' })} style={{ marginTop: '8px', background: 'none', border: '1px solid #E8D5C0', borderRadius: '9999px', padding: '4px 14px', fontSize: '13px', color: '#8C6A52', cursor: 'pointer' }}>
                Edit
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function ToggleBtn({ label, active, disabled, onClick }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ background: active ? '#7C3A1E' : '#F5EDE3', color: active ? '#fff' : '#2C1A0E', border: 'none', borderRadius: '9999px', padding: '4px 12px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', opacity: disabled ? 0.6 : 1, whiteSpace: 'nowrap' }}>
      {label}
    </button>
  )
}
