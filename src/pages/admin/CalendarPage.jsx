import { useState, useEffect } from 'react'
import { gasGet, gasPost } from '../../services/gas.service.js'
import { getTodayStr, isCutoffPassed } from '../../utils/helpers.js'
import { useToast } from '../../components/Toast.jsx'
import AdminNav from '../../components/admin/AdminNav.jsx'

function isTrue(v) { return typeof v === 'boolean' ? v : String(v).toUpperCase() === 'TRUE' }

export default function CalendarPage() {
  const { show } = useToast()

  const [shopOpen, setShopOpen] = useState(true)
  const [announcement, setAnnouncement] = useState('')
  const [stampThreshold, setStampThreshold] = useState(10)
  const [gachaActive, setGachaActive] = useState(false)
  const [promptpayNumber, setPromptpayNumber] = useState('')
  const [deliveryLocations, setDeliveryLocations] = useState([])
  const [newLocation, setNewLocation] = useState('')
  const [blockedDates, setBlockedDates] = useState([])
  const [slots, setSlots] = useState([])
  const [configLoading, setConfigLoading] = useState(true)
  const [slotsLoading, setSlotsLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchConfig()
    fetchSlots()
  }, [])

  async function fetchConfig() {
    setConfigLoading(true)
    try {
      const res = await gasGet('getConfig')
      if (res.status === 'success') {
        const parseJsonArray = (val) => { try { const a = JSON.parse(val); return Array.isArray(a) ? a : [] } catch { return [] } }
        setShopOpen(isTrue(res.data.shop_open))
        setAnnouncement(res.data.announcement || '')
        setStampThreshold(Number(res.data.stamp_threshold) || 10)
        setGachaActive(isTrue(res.data.gacha_active))
        setPromptpayNumber(res.data.promptpay_number || '')
        setDeliveryLocations(parseJsonArray(res.data.delivery_locations))
        setBlockedDates(parseJsonArray(res.data.blocked_dates))
      }
    } catch {}
    setConfigLoading(false)
  }

  async function fetchSlots() {
    setSlotsLoading(true)
    try {
      const res = await gasGet('getDeliverySlots', { from: getTodayStr() })
      if (res.status === 'success') setSlots(res.data || [])
    } catch {}
    setSlotsLoading(false)
  }

  async function saveConfig() {
    setSaving(true)
    try {
      const entries = [
        { key: 'shop_open', value: shopOpen },
        { key: 'announcement', value: announcement },
        { key: 'stamp_threshold', value: Number(stampThreshold) },
        { key: 'gacha_active', value: gachaActive },
        { key: 'promptpay_number', value: promptpayNumber },
        { key: 'delivery_locations', value: JSON.stringify(deliveryLocations) },
        { key: 'blocked_dates', value: JSON.stringify(blockedDates) },
      ]
      const results = await Promise.all(entries.map(e => gasPost('updateConfig', e)))
      if (results.every(r => r.status === 'success')) {
        show('Config saved', 'success')
      } else {
        show('Some settings failed to save', 'error')
      }
    } catch { show('Connection error', 'error') }
    setSaving(false)
  }

  const dates = [...new Set(slots.map(s => s.date))].sort()

  return (
    <div style={{ minHeight: '100dvh', background: '#FAF6F0' }}>
      <AdminNav />

      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Shop config */}
        <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '1rem', boxShadow: '0 2px 12px rgba(44,26,14,0.07)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#2C1A0E' }}>Shop Settings</p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '15px', color: '#2C1A0E' }}>Shop open</span>
            {configLoading ? (
              <span style={{ fontSize: '13px', color: '#8C6A52' }}>Loading…</span>
            ) : (
              <button onClick={() => setShopOpen(v => !v)} style={{ width: '44px', height: '24px', borderRadius: '9999px', background: shopOpen ? '#7C3A1E' : '#E8D5C0', border: 'none', cursor: 'pointer', position: 'relative' }}>
                <span style={{ position: 'absolute', top: '2px', left: shopOpen ? '22px' : '2px', width: '20px', height: '20px', borderRadius: '50%', background: '#fff', transition: '150ms ease-out', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
              </button>
            )}
          </div>

          <div>
            <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 500, color: '#8C6A52' }}>Announcement</p>
            <input
              value={announcement}
              onChange={e => setAnnouncement(e.target.value)}
              placeholder="Leave blank to hide banner"
              maxLength={200}
              style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #E8D5C0', borderRadius: '0.875rem', padding: '10px 12px', fontSize: '14px', background: '#fff', color: '#2C1A0E', outline: 'none' }}
            />
          </div>

          <div>
            <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 500, color: '#8C6A52' }}>PromptPay number</p>
            <input
              value={promptpayNumber}
              onChange={e => setPromptpayNumber(e.target.value)}
              placeholder="e.g. 0942805034"
              style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #E8D5C0', borderRadius: '0.875rem', padding: '10px 12px', fontSize: '14px', background: '#fff', color: '#2C1A0E', outline: 'none' }}
            />
          </div>

          <div>
            <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 500, color: '#8C6A52' }}>Stamps to redeem (threshold)</p>
            <input
              type="number"
              min={1}
              value={stampThreshold}
              onChange={e => setStampThreshold(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #E8D5C0', borderRadius: '0.875rem', padding: '10px 12px', fontSize: '14px', background: '#fff', color: '#2C1A0E', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '15px', color: '#2C1A0E' }}>Gacha week</span>
            <button type="button" onClick={() => setGachaActive(v => !v)} style={{ width: '44px', height: '24px', borderRadius: '9999px', background: gachaActive ? '#7C3A1E' : '#E8D5C0', border: 'none', cursor: 'pointer', position: 'relative' }}>
              <span style={{ position: 'absolute', top: '2px', left: gachaActive ? '22px' : '2px', width: '20px', height: '20px', borderRadius: '50%', background: '#fff', transition: '150ms ease-out', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </button>
          </div>

          <div>
            <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 500, color: '#8C6A52' }}>Delivery locations</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
              {deliveryLocations.map((loc, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#F5EDE3', borderRadius: '9999px', padding: '4px 10px', fontSize: '13px', color: '#2C1A0E' }}>
                  <span>{loc}</span>
                  <button type="button" onClick={() => setDeliveryLocations(prev => prev.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8C6A52', padding: '0 0 0 2px', lineHeight: 1, fontSize: '14px' }}>×</button>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                value={newLocation}
                onChange={e => setNewLocation(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (newLocation.trim()) { setDeliveryLocations(prev => [...prev, newLocation.trim()]); setNewLocation('') } } }}
                placeholder="Add location, press Enter"
                style={{ flex: 1, border: '1px solid #E8D5C0', borderRadius: '0.875rem', padding: '8px 12px', fontSize: '14px', background: '#fff', color: '#2C1A0E', outline: 'none' }}
              />
              <button type="button" onClick={() => { if (newLocation.trim()) { setDeliveryLocations(prev => [...prev, newLocation.trim()]); setNewLocation('') } }} style={{ background: '#7C3A1E', color: '#fff', border: 'none', borderRadius: '9999px', padding: '8px 16px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                Add
              </button>
            </div>
          </div>

          <div>
            <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 500, color: '#8C6A52' }}>Blocked dates (exam / leave)</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
              {blockedDates.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#FEE2E2', borderRadius: '9999px', padding: '4px 10px', fontSize: '13px', color: '#C0392B' }}>
                  <span>{d}</span>
                  <button type="button" onClick={() => setBlockedDates(prev => prev.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C0392B', padding: '0 0 0 2px', lineHeight: 1, fontSize: '14px' }}>×</button>
                </div>
              ))}
            </div>
            <input
              type="date"
              onChange={e => { const v = e.target.value; if (v && !blockedDates.includes(v)) { setBlockedDates(prev => [...prev, v].sort()); e.target.value = '' } }}
              style={{ border: '1px solid #E8D5C0', borderRadius: '0.875rem', padding: '8px 12px', fontSize: '14px', background: '#fff', color: '#2C1A0E', outline: 'none' }}
            />
          </div>

          <button onClick={saveConfig} disabled={saving || configLoading} style={{ background: '#7C3A1E', color: '#fff', border: 'none', borderRadius: '9999px', padding: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving…' : 'Save Config'}
          </button>
        </div>

        {/* Delivery slots (read-only view) */}
        <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '1rem', boxShadow: '0 2px 12px rgba(44,26,14,0.07)' }}>
          <p style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: 700, color: '#2C1A0E' }}>Delivery Slots</p>
          <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#8C6A52' }}>Edit slots directly in the Google Sheet.</p>

          {slotsLoading ? (
            <p style={{ margin: 0, fontSize: '14px', color: '#8C6A52' }}>Loading…</p>
          ) : dates.length === 0 ? (
            <p style={{ margin: 0, fontSize: '14px', color: '#8C6A52' }}>No upcoming slots found.</p>
          ) : (
            dates.map(date => {
              const dateSlots = slots.filter(s => s.date === date)
              return (
                <div key={date} style={{ marginBottom: '12px' }}>
                  <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 600, color: '#2C1A0E' }}>
                    {new Date(date + 'T00:00:00').toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'short' })}
                  </p>
                  {dateSlots.map(slot => {
                    const active = isTrue(slot.active)
                    const full = slot.capacity && Number(slot.booked) >= Number(slot.capacity)
                    const cutPassed = isCutoffPassed(slot.cut_off_datetime)
                    return (
                      <div key={slot.slot_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #F5EDE3' }}>
                        <span style={{ fontSize: '14px', color: !active || cutPassed ? '#8C6A52' : '#2C1A0E' }}>{slot.slot_label}</span>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '12px', color: '#8C6A52' }}>
                          <span>{slot.booked || 0}/{slot.capacity || '∞'}</span>
                          {!active && <span style={{ color: '#C0392B' }}>Inactive</span>}
                          {full && active && <span style={{ color: '#C0392B' }}>Full</span>}
                          {cutPassed && active && !full && <span style={{ color: '#8C6A52' }}>Cut-off passed</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
