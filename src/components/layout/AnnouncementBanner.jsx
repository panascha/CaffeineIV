import { useShop } from '../../context/ShopContext.jsx'
import { Megaphone } from 'lucide-react'

export default function AnnouncementBanner() {
  const { announcement } = useShop()
  if (!announcement) return null
  return (
    <div style={{ background: '#FEF3C7', borderBottom: '1px solid #FDE68A', padding: '10px 1rem', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
      <Megaphone size={16} style={{ color: '#92400E', flexShrink: 0, marginTop: '2px' }} />
      <p style={{ margin: 0, fontSize: '13px', color: '#78350F', lineHeight: 1.4 }}>{announcement}</p>
    </div>
  )
}
