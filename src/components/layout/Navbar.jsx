import { NavLink } from 'react-router-dom'
import { Coffee, ClipboardList, Stamp, Wallet, CalendarDays } from 'lucide-react'

const TABS = [
  { to: '/',          icon: Coffee,         label: 'Menu' },
  { to: '/history',   icon: ClipboardList,  label: 'Orders' },
  { to: '/stamps',    icon: Stamp,          label: 'Stamps' },
  { to: '/wallet',    icon: Wallet,         label: 'Wallet' },
  { to: '/calendar',  icon: CalendarDays,   label: 'Calendar' },
]

export default function Navbar() {
  return (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #E8D5C0', display: 'flex', justifyContent: 'space-around', padding: '8px 0 max(8px, env(safe-area-inset-bottom))', zIndex: 100 }}>
      {TABS.map(({ to, icon: Icon, label }) => (
        <NavLink key={to} to={to} end={to === '/'} style={({ isActive }) => ({
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
          color: isActive ? '#7C3A1E' : '#8C6A52',
          textDecoration: 'none', minWidth: '60px', padding: '4px 0',
        })}>
          {({ isActive }) => (
            <>
              <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
              <span style={{ fontSize: '11px', fontWeight: isActive ? 600 : 400 }}>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
