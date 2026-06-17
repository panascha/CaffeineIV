import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { LayoutDashboard, UtensilsCrossed, CalendarDays, Package, ClipboardList, LogOut } from 'lucide-react'

const LINKS = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/menu',      icon: UtensilsCrossed, label: 'Menu' },
  { to: '/admin/calendar',  icon: CalendarDays,    label: 'Calendar' },
  { to: '/admin/stock',     icon: Package,          label: 'Stock' },
  { to: '/admin/batch',     icon: ClipboardList,    label: 'Batch' },
]

export default function AdminNav() {
  const { session, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div style={{ background: '#fff', borderBottom: '1px solid #E8D5C0', position: 'sticky', top: 0, zIndex: 100 }}>
      {/* Top bar */}
      <div style={{ padding: '10px 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/icon.jpg" alt="" style={{ height: '28px', borderRadius: '6px' }} />
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#2C1A0E' }}>Admin</span>
          {session?.admin_name && <span style={{ fontSize: '13px', color: '#8C6A52' }}>· {session.admin_name}</span>}
        </div>
        <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: '#8C6A52', fontSize: '13px', padding: '4px 0' }}>
          <LogOut size={15} />
          Sign out
        </button>
      </div>

      {/* Section links */}
      <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', padding: '0 1rem 10px', scrollbarWidth: 'none' }}>
        {LINKS.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none',
            padding: '6px 12px', borderRadius: '9999px', flexShrink: 0,
            background: isActive ? '#7C3A1E' : '#F5EDE3',
            color: isActive ? '#fff' : '#2C1A0E',
            fontSize: '13px', fontWeight: isActive ? 600 : 400,
          })}>
            <Icon size={14} />
            {label}
          </NavLink>
        ))}
      </div>
    </div>
  )
}
