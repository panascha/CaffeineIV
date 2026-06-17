import { useState, useEffect } from 'react'
import { gasGet } from '../../services/gas.service.js'
import { getTodayStr } from '../../utils/helpers.js'
import AdminNav from '../../components/admin/AdminNav.jsx'
import BatchSorter from '../../components/admin/BatchSorter.jsx'

export default function BatchPage() {
  const [date, setDate] = useState(getTodayStr())
  const [batches, setBatches] = useState([])
  const [volumes, setVolumes] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchBatch() }, [date])

  async function fetchBatch() {
    setLoading(true)
    try {
      const [batchRes, volRes] = await Promise.all([
        gasGet('getBatchSummary', { date }),
        gasGet('calcBatchVolumes', { date }),
      ])
      if (batchRes.status === 'success') setBatches(batchRes.data || [])
      if (volRes.status === 'success') setVolumes(volRes.data || {})
    } catch {}
    setLoading(false)
  }

  const totalOrders = batches.reduce((sum, b) => sum + (b.orders?.length || 0), 0)

  return (
    <div style={{ minHeight: '100dvh', background: '#FAF6F0' }}>
      <AdminNav />

      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{ border: '1px solid #E8D5C0', borderRadius: '0.875rem', padding: '8px 12px', fontSize: '15px', background: '#fff', color: '#2C1A0E', outline: 'none', flex: 1 }}
          />
          <button onClick={fetchBatch} style={{ background: '#7C3A1E', color: '#fff', border: 'none', borderRadius: '9999px', padding: '8px 18px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            Refresh
          </button>
        </div>

        {!loading && totalOrders > 0 && (
          <p style={{ margin: 0, fontSize: '14px', color: '#8C6A52' }}>
            {totalOrders} order{totalOrders !== 1 ? 's' : ''} across {batches.length} location{batches.length !== 1 ? 's' : ''}
          </p>
        )}

        {loading ? (
          <p style={{ fontSize: '15px', color: '#8C6A52', textAlign: 'center', padding: '2rem 0' }}>Loading…</p>
        ) : (
          <>
            <BatchSorter batches={batches} />
            {volumes && Object.keys(volumes).length > 0 && (
              <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '1rem', boxShadow: '0 2px 12px rgba(44,26,14,0.07)' }}>
                <p style={{ margin: '0 0 10px', fontSize: '15px', fontWeight: 600, color: '#2C1A0E' }}>Ingredient Totals</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {Object.entries(volumes).map(([key, qty]) => (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                      <span style={{ color: '#2C1A0E' }}>{key.replace(/_/g, ' ')}</span>
                      <span style={{ color: '#7C3A1E', fontWeight: 600 }}>{qty}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
