import { useState, useEffect } from 'react'
import { gasGetCached } from '../../services/gas.service.js'
import { getTodayStr } from '../../utils/helpers.js'
import AdminNav from '../../components/admin/AdminNav.jsx'
import BatchSorter from '../../components/admin/BatchSorter.jsx'

export default function BatchPage() {
  const [date, setDate] = useState(getTodayStr())
  const [batches, setBatches] = useState([])
  const [volumes, setVolumes] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchBatch() }, [date])

  function fetchBatch() {
    setLoading(true)
    let batchReady = false, volReady = false
    function checkReady() { if (batchReady && volReady) setLoading(false) }

    gasGetCached('getBatchSummary', { date }, data => {
      const normalized = Array.isArray(data)
        ? data
        : Object.entries(data || {}).map(([location, orders]) => ({ location, orders }))
      setBatches(normalized)
      batchReady = true
      checkReady()
    })
      .catch(() => {}).finally(() => { batchReady = true; checkReady() })

    gasGetCached('calcBatchVolumes', { date }, data => { setVolumes(data || {}); volReady = true; checkReady() })
      .catch(() => {}).finally(() => { volReady = true; checkReady() })
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
