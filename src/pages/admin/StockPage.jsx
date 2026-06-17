import { useState, useEffect } from 'react'
import { gasGet, gasPost } from '../../services/gas.service.js'
import { useToast } from '../../components/Toast.jsx'
import AdminNav from '../../components/admin/AdminNav.jsx'

export default function StockPage() {
  const { show } = useToast()
  const [ingredients, setIngredients] = useState([])
  const [edits, setEdits] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchIngredients() }, [])

  async function fetchIngredients() {
    setLoading(true)
    try {
      const res = await gasGet('getIngredients')
      if (res.status === 'success') {
        const data = res.data || []
        setIngredients(data)
        const init = {}
        data.forEach(i => { init[i.ingredient_id || i.name] = i.stock_qty ?? '' })
        setEdits(init)
      }
    } catch {}
    setLoading(false)
  }

  async function handleSave() {
    setSaving(true)
    const updated = ingredients.map(i => ({
      ...i,
      stock_qty: Number(edits[i.ingredient_id || i.name]) || 0,
    }))
    try {
      const res = await gasPost('updateStock', { ingredients: updated })
      if (res.status === 'success') {
        show('Stock updated', 'success')
        fetchIngredients()
      } else {
        show(res.message || 'Save failed', 'error')
      }
    } catch { show('Connection error', 'error') }
    setSaving(false)
  }

  const hasChanges = ingredients.some(i => {
    const key = i.ingredient_id || i.name
    return String(edits[key]) !== String(i.stock_qty ?? '')
  })

  return (
    <div style={{ minHeight: '100dvh', background: '#FAF6F0' }}>
      <AdminNav />

      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#2C1A0E' }}>Stock</h2>
          {hasChanges && (
            <button onClick={handleSave} disabled={saving} style={{ background: '#7C3A1E', color: '#fff', border: 'none', borderRadius: '9999px', padding: '8px 18px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving…' : 'Save All'}
            </button>
          )}
        </div>

        {loading ? (
          <p style={{ fontSize: '15px', color: '#8C6A52', textAlign: 'center', padding: '2rem 0' }}>Loading…</p>
        ) : ingredients.length === 0 ? (
          <p style={{ fontSize: '15px', color: '#8C6A52', textAlign: 'center', padding: '2rem 0' }}>No ingredients found in sheet.</p>
        ) : (
          <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '1rem', boxShadow: '0 2px 12px rgba(44,26,14,0.07)', display: 'flex', flexDirection: 'column', gap: '0' }}>
            {ingredients.map((item, idx) => {
              const key = item.ingredient_id || item.name
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: idx < ingredients.length - 1 ? '1px solid #F5EDE3' : 'none' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#2C1A0E' }}>{item.name}</p>
                    {item.unit && <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#8C6A52' }}>{item.unit}</p>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="number"
                      min="0"
                      value={edits[key] ?? ''}
                      onChange={e => setEdits(prev => ({ ...prev, [key]: e.target.value }))}
                      style={{ width: '80px', border: '1px solid #E8D5C0', borderRadius: '0.75rem', padding: '6px 10px', fontSize: '15px', textAlign: 'right', background: '#fff', color: '#2C1A0E', outline: 'none' }}
                    />
                    {item.unit && <span style={{ fontSize: '13px', color: '#8C6A52', minWidth: '30px' }}>{item.unit}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
