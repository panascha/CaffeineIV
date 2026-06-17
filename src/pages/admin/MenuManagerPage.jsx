import { useState, useEffect, useRef } from 'react'
import { Plus, X, ImagePlus } from 'lucide-react'
import { gasPost, gasGetCached } from '../../services/gas.service.js'
import { idbDelete } from '../../services/idb.service.js'
import { formatPrice, compressImage } from '../../utils/helpers.js'
import { useToast } from '../../components/Toast.jsx'
import AdminNav from '../../components/admin/AdminNav.jsx'

const BLANK_ITEM = {
  item_id: '', name: '', name_th: '', base_price_thb: '', category: '',
  description: '', image_url: '', available: true, is_specialty_week: false,
  bean_options: '', milk_options: '', oat_surcharge_thb: '', ingredients_used: '',
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
  const [imageFile, setImageFile] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => { fetchMenu() }, [])

  function fetchMenu() {
    setLoading(true)
    gasGetCached('getMenu', {}, data => { setMenu(data || []); setLoading(false) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  async function toggleField(item, field) {
    const updated = { ...item, [field]: !isTrue(item[field]) }
    setSaving(item.item_id + field)
    try {
      const res = await gasPost('saveMenuItem', updated)
      if (res.status === 'success') {
        setMenu(m => m.map(i => i.item_id === item.item_id ? updated : i))
        idbDelete('getMenu')
        show('Saved', 'success')
      } else {
        show(res.message || 'Save failed', 'error')
      }
    } catch { show('Connection error', 'error') }
    setSaving(null)
  }

  function splitCSV(val) { return typeof val === 'string' ? val.split(',').map(s => s.trim()).filter(Boolean) : (Array.isArray(val) ? val : []) }

  async function handleImageChange(e) {
    const file = e.target.files[0]
    if (!file) return
    try {
      const compressed = await compressImage(file, 500_000)
      setImageFile({ base64: compressed, name: `menu_${Date.now()}.jpg` })
    } catch { show('Image compression failed', 'error') }
  }

  async function saveForm() {
    if (!form.name.trim() || !form.base_price_thb) { show('Name and price are required', 'error'); return }
    setSaving('form')
    try {
      let imageUrl = form.image_url || ''
      if (imageFile) {
        const imgRes = await gasPost('uploadMenuImage', { base64: imageFile.base64, filename: imageFile.name })
        if (imgRes.status === 'success') imageUrl = imgRes.data.url
        else { show('Image upload failed', 'error'); setSaving(null); return }
      }
      const payload = {
        ...form,
        image_url: imageUrl,
        base_price_thb: Number(form.base_price_thb),
        oat_surcharge_thb: Number(form.oat_surcharge_thb) || 0,
        item_id: form.item_id || `item_${Date.now()}`,
        bean_options: splitCSV(form.bean_options),
        milk_options: splitCSV(form.milk_options),
        ingredients_used: splitCSV(form.ingredients_used),
      }
      const res = await gasPost('saveMenuItem', payload)
      if (res.status === 'success') {
        show('Saved', 'success')
        idbDelete('getMenu')
        setForm(null)
        setImageFile(null)
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
              <button onClick={() => { setForm(null); setImageFile(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} color="#8C6A52" /></button>
            </div>

            {/* Image upload */}
            <div>
              <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 500, color: '#8C6A52' }}>Image</p>
              <div style={{ position: 'relative', width: '100%', height: '140px', borderRadius: '0.875rem', overflow: 'hidden', background: '#F5EDE3', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
                {(imageFile?.base64 || form.image_url) ? (
                  <img src={imageFile?.base64 || form.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <ImagePlus size={24} color="#8C6A52" />
                    <span style={{ fontSize: '13px', color: '#8C6A52' }}>Tap to upload</span>
                  </div>
                )}
                <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: '#7C3A1E', borderRadius: '9999px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ImagePlus size={12} color="#fff" />
                  <span style={{ fontSize: '11px', color: '#fff', fontWeight: 600 }}>{imageFile ? 'Change' : form.image_url ? 'Replace' : 'Upload'}</span>
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
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
              ['Ingredients used (IDs, comma-sep)', 'ingredients_used', 'text'],
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
            <div key={item.item_id} style={{ background: '#fff', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: '0 2px 12px rgba(44,26,14,0.07)' }}>
              {item.image_url && <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />}
              <div style={{ padding: '1rem' }}>
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
              <button onClick={() => { setImageFile(null); setForm({ ...item, bean_options: Array.isArray(item.bean_options) ? item.bean_options.join(',') : item.bean_options || '', milk_options: Array.isArray(item.milk_options) ? item.milk_options.join(',') : item.milk_options || '', ingredients_used: Array.isArray(item.ingredients_used) ? item.ingredients_used.join(',') : item.ingredients_used || '' }) }} style={{ marginTop: '8px', background: 'none', border: '1px solid #E8D5C0', borderRadius: '9999px', padding: '4px 14px', fontSize: '13px', color: '#8C6A52', cursor: 'pointer' }}>
                Edit
              </button>
              </div>
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
