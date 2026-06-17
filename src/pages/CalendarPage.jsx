import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useShop } from '../context/ShopContext.jsx'
import Navbar from '../components/layout/Navbar.jsx'
import AnnouncementBanner from '../components/layout/AnnouncementBanner.jsx'

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay()
}

function toYMD(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export default function CalendarPage() {
  const { blockedDates, loaded } = useShop()
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)
  const todayStr = toYMD(today.getFullYear(), today.getMonth(), today.getDate())

  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div style={{ minHeight: '100dvh', background: '#FAF6F0', paddingBottom: '80px' }}>
      <AnnouncementBanner />

      <div style={{ background: '#fff', borderBottom: '1px solid #E8D5C0', padding: '12px 1rem' }}>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#2C1A0E' }}>Calendar</h1>
      </div>

      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '1rem', boxShadow: '0 2px 12px rgba(44,26,14,0.07)' }}>
          {/* Month navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}>
              <ChevronLeft size={20} color="#2C1A0E" />
            </button>
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#2C1A0E' }}>
              {new Date(viewYear, viewMonth).toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}>
              <ChevronRight size={20} color="#2C1A0E" />
            </button>
          </div>

          {/* Day labels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
            {DAY_LABELS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '11px', fontWeight: 600, color: '#8C6A52', padding: '4px 0' }}>{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dateStr = toYMD(viewYear, viewMonth, day)
              const isBlocked = blockedDates.includes(dateStr)
              const isToday = dateStr === todayStr
              const isPast = dateStr < todayStr

              let bg = 'transparent'
              let color = isPast ? '#C4A882' : '#2C1A0E'
              let border = 'none'
              if (isToday) { bg = '#7C3A1E'; color = '#fff' }
              if (isBlocked) { bg = '#FEE2E2'; color = '#C0392B' }

              return (
                <div key={day} style={{ textAlign: 'center', padding: '6px 2px', borderRadius: '0.5rem', background: bg, border, position: 'relative' }}>
                  <span style={{ fontSize: '14px', fontWeight: isToday ? 700 : 400, color }}>{day}</span>
                  {isBlocked && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#C0392B', margin: '2px auto 0' }} />}
                </div>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '1rem', boxShadow: '0 2px 12px rgba(44,26,14,0.07)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#8C6A52', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Legend</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#7C3A1E', flexShrink: 0 }} />
            <span style={{ fontSize: '14px', color: '#2C1A0E' }}>Today</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#FEE2E2', border: '1px solid #C0392B', flexShrink: 0 }} />
            <span style={{ fontSize: '14px', color: '#2C1A0E' }}>Closed — exam / leave</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#FAF6F0', border: '1px solid #E8D5C0', flexShrink: 0 }} />
            <span style={{ fontSize: '14px', color: '#2C1A0E' }}>Open — check slot availability at checkout</span>
          </div>
        </div>
      </div>

      <Navbar />
    </div>
  )
}
