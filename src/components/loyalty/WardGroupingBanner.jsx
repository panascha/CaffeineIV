import { useState, useEffect } from 'react'
import { gasGet } from '../../services/gas.service.js'
import { getTodayStr } from '../../utils/helpers.js'
import { Users } from 'lucide-react'

export default function WardGroupingBanner() {
  const [groups, setGroups] = useState([])

  async function fetch() {
    try {
      const res = await gasGet('getWardGrouping', { date: getTodayStr() })
      if (res.status === 'success' && res.data)
        setGroups(Object.entries(res.data).map(([location, count]) => ({ location, count })))
    } catch {}
  }

  useEffect(() => {
    fetch()
    const id = setInterval(fetch, 60_000)
    return () => clearInterval(id)
  }, [])

  const notable = groups.filter(g => g.count >= 2)
  if (!notable.length) return null

  return (
    <div style={{ background: '#F5EDE3', borderRadius: '1rem', padding: '12px 14px', margin: '0 1rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#7C3A1E' }}>
        <Users size={15} />
        Group orders today
      </div>
      {notable.map(g => (
        <p key={g.location} style={{ margin: 0, fontSize: '13px', color: '#2C1A0E' }}>
          {g.location} — {g.count} order{g.count !== 1 ? 's' : ''}
        </p>
      ))}
    </div>
  )
}
