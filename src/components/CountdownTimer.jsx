import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

export default function CountdownTimer({ cutoffDatetime }) {
  const [remaining, setRemaining] = useState('')
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    if (!cutoffDatetime) return
    const target = new Date(cutoffDatetime.replace(' ', 'T')).getTime()

    function tick() {
      const diff = target - Date.now()
      if (diff <= 0) {
        setExpired(true)
        setRemaining('')
        return
      }
      const h = Math.floor(diff / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      const s = Math.floor((diff % 60_000) / 1000)
      setRemaining(`${h > 0 ? `${h}h ` : ''}${m}m ${s}s`)
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [cutoffDatetime])

  if (!cutoffDatetime) return null
  if (expired) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#C0392B', fontWeight: 500 }}>
      <Clock size={14} />
      Order cut-off passed
    </div>
  )

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#8C6A52', fontWeight: 500 }}>
      <Clock size={14} />
      Cut-off in {remaining}
    </div>
  )
}
