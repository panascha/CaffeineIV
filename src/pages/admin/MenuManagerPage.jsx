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
  bean_options: [], milk_options: [], oat_surcharge_thb: 0, ingredients_used: [],
}

const inputStyle = {
  width: '100%', boxSizing: 'border-box', border: '1px solid #E8D5C0',
  borderRadius: '0.875rem', padding: '10px 12px', fontSize: '14px',
  background: '#fff', color: '#2C1A0E', outline: 'none',
}

const smallInputStyle = {
  boxSizing: 'border-box', border: '1px solid #E8D5C0',
  borderRadius: '0.75rem', padding: '8px 10px', fontSize: '13px',
  background: '#fff', color: '#2C1A0E', outline: 'none',
}

function isTrue(v) { return typeof v === 'boolean' ? v : String(v).toUpperCase() === 'TRUE' }

function normOptions(raw) {
  const arr = Array.isArray(raw) ? raw
    : typeof raw === 'string'
      ? (() => { try { return JSON.parse(raw || '[]') } catch { return raw.split(',').map(s => s.trim()).filter(Boolean) } })()
      : []
  return arr.map(b => typeof b === 'string'
    ? { name: b.replace(/\s*\(\+\d+\)/, '').trim(), surcharge: Number(b.match(/\(\+(\d+)\)/)?.[1] || 0) }
    : { name: String(b.name || ''), surcharge: Number(b.surcharge) || 0 }
  )
}

function ZoneLabel({ children }) {
  return (
    <p style={{ margin: '8px 0 6px', fontSize: '11px', fontWeight: 700, color: '#8C6A52', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      {children}
    </p>
  )
}

function FieldLabel({ children }) {
  return <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 500, color: '#8C6A52' }}>{children}</p>
}

export default function MenuManagerPage() {
  const { show } = useToast()
  const [menu, setMenu] = useState([])
  const [ingredients, setIngredients] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(null)
  const [form, setForm] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [ingredSearch, setIngredSearch] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchMenu()
    gasGetCached('getIngredients', {}, data => setIngredients(data || []))
  }, [])

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
        oat_surcharge_thb: 0,
        item_id: form.item_id || `item_${Date.now()}`,
        bean_options: form.bean_options.filter(b => b.name.trim()),
        milk_options: form.milk_options.filter(m => m.name.trim()),
        ingredients_used: form.ingredients_used,
      }
      const res = await gasPost('saveMenuItem', payload)
      if (res.status === 'success') {
        show('Saved', 'success')
        idbDelete('getMenu')
        setForm(null)
        setImageFile(null)
        setIngredSearch('')
        fetchMenu()
      } else {
        show(res.message || 'Save failed', 'error')
      }
    } catch { show('Connection error', 'error') }
    setSaving(null)
  }

  function openEdit(item) {
    setImageFile(null)
    setIngredSearch('')
    setForm({
      ...item,
      bean_options: normOptions(item.bean_options),
      milk_options: normOptions(item.milk_options),
      ingredients_used: (() => {
        if (Array.isArray(item.ingredients_used)) return item.ingredients_used
        if (typeof item.ingredients_used !== 'string') return []
        try { const p = JSON.parse(item.ingredients_used); if (Array.isArray(p)) return p } catch {}
        return item.ingredients_used.split(',').map(s => s.trim()).filter(Boolean)
      })(),
    })
  }

  function openNew() {
    setImageFile(null)
    setIngredSearch('')
    setForm({ ...BLANK_ITEM })
  }

  // Bean / milk option helpers
  function addOption(field) {
    setForm(f => ({ ...f, [field]: [...f[field], { name: '', surcharge: 0 }] }))
  }
  function updateOption(field, idx, key, val) {
    setForm(f => {
      const arr = f[field].map((o, i) => i === idx ? { ...o, [key]: key === 'surcharge' ? Number(val) || 0 : val } : o)
      return { ...f, [field]: arr }
    })
  }
  function removeOption(field, idx) {
    setForm(f => ({ ...f, [field]: f[field].filter((_, i) => i !== idx) }))
  }

  // Ingredient multi-select helpers
  function toggleIngredient(id) {
    setForm(f => {
      const used = f.ingredients_used
      return { ...f, ingredients_used: used.includes(id) ? used.filter(i => i !== id) : [...used, id] }
    })
  }

  const filteredIngredients = ingredients.filter(ing => {
    const q = ingredSearch.toLowerCase()
    return (ing.name || '').toLowerCase().includes(q) || (ing.ingredient_id || '').toLowerCase().includes(q)
  })

  return (
    <div style={{ minHeight: '100dvh', background: '#FAF6F0' }}>
      <AdminNav />

      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#2C1A0E' }}>Menu Items</h2>
          <button onClick={openNew} style={{ background: '#7C3A1E', color: '#fff', border: 'none', borderRadius: '9999px', padding: '8px 16px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Plus size={15} /> Add Item
          </button>
        </div>

        {/* Add/edit form */}
        {form && (
          <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '1rem', boxShadow: '0 2px 12px rgba(44,26,14,0.07)', display: 'flex', flexDirection: 'column', gap: '10px' }}>

            {/* Form header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#2C1A0E' }}>{form.item_id ? 'Edit Item' : 'New Item'}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ToggleBtn
                  label="Available"
                  active={isTrue(form.available)}
                  onClick={() => setForm(f => ({ ...f, available: !isTrue(f.available) }))}
                />
                <button onClick={() => { setForm(null); setImageFile(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                  <X size={18} color="#8C6A52" />
                </button>
              </div>
            </div>

            {/* ── Zone 1: Main info ── */}
            <ZoneLabel>Main Info</ZoneLabel>

            {/* Image upload */}
            <div>
              <FieldLabel>Image</FieldLabel>
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

            {/* 2-column grid: Name EN | Name TH, Price | Category */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <FieldLabel>Name (EN)</FieldLabel>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <FieldLabel>Name (TH)</FieldLabel>
                <input value={form.name_th} onChange={e => setForm(f => ({ ...f, name_th: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <FieldLabel>Price (฿)</FieldLabel>
                <input type="number" min="0" value={form.base_price_thb} onChange={e => setForm(f => ({ ...f, base_price_thb: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <FieldLabel>Category</FieldLabel>
                <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={inputStyle} />
              </div>
            </div>

            <div>
              <FieldLabel>Description</FieldLabel>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={inputStyle} />
            </div>

            {/* ── Zone 2: Options ── */}
            <div style={{ borderTop: '1px solid #F5EDE3', paddingTop: '8px' }}>
              <ZoneLabel>Options</ZoneLabel>

              {/* Bean options */}
              <FieldLabel>Coffee bean options</FieldLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                {form.bean_options.map((b, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <input
                      value={b.name}
                      onChange={e => updateOption('bean_options', idx, 'name', e.target.value)}
                      placeholder="Bean name"
                      style={{ ...smallInputStyle, flex: 1 }}
                    />
                    <input
                      type="number"
                      min="0"
                      value={b.surcharge || ''}
                      onChange={e => updateOption('bean_options', idx, 'surcharge', e.target.value)}
                      placeholder="฿ surcharge"
                      style={{ ...smallInputStyle, width: '80px' }}
                    />
                    <button onClick={() => removeOption('bean_options', idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C0392B', fontSize: '16px', lineHeight: 1, padding: '4px', flexShrink: 0 }}>×</button>
                  </div>
                ))}
                <button onClick={() => addOption('bean_options')} style={{ background: '#F5EDE3', border: 'none', borderRadius: '9999px', padding: '6px 14px', fontSize: '13px', color: '#7C3A1E', fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Plus size={13} /> Add bean option
                </button>
              </div>

              {/* Milk options */}
              <FieldLabel>Milk options</FieldLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {form.milk_options.map((m, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <input
                      value={m.name}
                      onChange={e => updateOption('milk_options', idx, 'name', e.target.value)}
                      placeholder="Milk name"
                      style={{ ...smallInputStyle, flex: 1 }}
                    />
                    <input
                      type="number"
                      min="0"
                      value={m.surcharge || ''}
                      onChange={e => updateOption('milk_options', idx, 'surcharge', e.target.value)}
                      placeholder="฿ surcharge"
                      style={{ ...smallInputStyle, width: '80px' }}
                    />
                    <button onClick={() => removeOption('milk_options', idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C0392B', fontSize: '16px', lineHeight: 1, padding: '4px', flexShrink: 0 }}>×</button>
                  </div>
                ))}
                <button onClick={() => addOption('milk_options')} style={{ background: '#F5EDE3', border: 'none', borderRadius: '9999px', padding: '6px 14px', fontSize: '13px', color: '#7C3A1E', fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Plus size={13} /> Add milk option
                </button>
              </div>
            </div>

            {/* ── Zone 3: Stock ── */}
            <div style={{ borderTop: '1px solid #F5EDE3', paddingTop: '8px' }}>
              <ZoneLabel>Stock</ZoneLabel>
              <FieldLabel>Ingredients used</FieldLabel>

              {ingredients.length === 0 ? (
                <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#8C6A52' }}>No ingredients in stock sheet yet.</p>
              ) : (
                <>
                  {/* Selected chips */}
                  {form.ingredients_used.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                      {form.ingredients_used.map(id => {
                        const ing = ingredients.find(i => i.ingredient_id === id)
                        return (
                          <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#7C3A1E', borderRadius: '9999px', padding: '4px 10px' }}>
                            <span style={{ fontSize: '12px', color: '#fff', fontWeight: 500 }}>{ing?.name || id}</span>
                            <button onClick={() => toggleIngredient(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', fontSize: '14px', lineHeight: 1, padding: 0 }}>×</button>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Search input */}
                  <input
                    value={ingredSearch}
                    onChange={e => setIngredSearch(e.target.value)}
                    placeholder="Search ingredients…"
                    style={{ ...inputStyle, marginBottom: '6px' }}
                  />

                  {/* Filtered list */}
                  {ingredSearch && (
                    <div style={{ border: '1px solid #E8D5C0', borderRadius: '0.875rem', overflow: 'hidden', maxHeight: '160px', overflowY: 'auto' }}>
                      {filteredIngredients.length === 0 ? (
                        <p style={{ margin: 0, padding: '10px 12px', fontSize: '13px', color: '#8C6A52' }}>No match</p>
                      ) : filteredIngredients.map((ing, idx) => {
                        const selected = form.ingredients_used.includes(ing.ingredient_id)
                        return (
                          <div
                            key={ing.ingredient_id}
                            onClick={() => toggleIngredient(ing.ingredient_id)}
                            style={{ padding: '10px 12px', fontSize: '13px', cursor: 'pointer', background: selected ? '#F5EDE3' : '#fff', borderTop: idx > 0 ? '1px solid #F5EDE3' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                          >
                            <span style={{ color: '#2C1A0E' }}>{ing.name}</span>
                            {selected && <span style={{ fontSize: '11px', color: '#7C3A1E', fontWeight: 600 }}>Selected</span>}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Specialty toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ToggleBtn
                label="Specialty week"
                active={isTrue(form.is_specialty_week)}
                onClick={() => setForm(f => ({ ...f, is_specialty_week: !isTrue(f.is_specialty_week) }))}
              />
            </div>

            {/* Sticky Save */}
            <div style={{ position: 'sticky', bottom: 0, background: '#fff', borderTop: '1px solid #E8D5C0', padding: '12px 0 4px', marginTop: '4px' }}>
              <button onClick={saveForm} disabled={saving === 'form'} style={{ width: '100%', background: '#7C3A1E', color: '#fff', border: 'none', borderRadius: '9999px', padding: '13px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', opacity: saving === 'form' ? 0.7 : 1 }}>
                {saving === 'form' ? 'Saving…' : 'Save Item'}
              </button>
            </div>
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
                <button onClick={() => openEdit(item)} style={{ marginTop: '8px', background: 'none', border: '1px solid #E8D5C0', borderRadius: '9999px', padding: '4px 14px', fontSize: '13px', color: '#8C6A52', cursor: 'pointer' }}>
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
