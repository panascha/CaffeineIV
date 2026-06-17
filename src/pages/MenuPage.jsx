import { useState, useEffect } from 'react'
import { ShoppingBag } from 'lucide-react'
import { gasGet } from '../services/gas.service.js'
import { useShop } from '../context/ShopContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import Navbar from '../components/layout/Navbar.jsx'
import AnnouncementBanner from '../components/layout/AnnouncementBanner.jsx'
import WardGroupingBanner from '../components/loyalty/WardGroupingBanner.jsx'
import SpecialtyHighlight from '../components/menu/SpecialtyHighlight.jsx'
import DrinkCard from '../components/menu/DrinkCard.jsx'
import DrinkCustomizer from '../components/menu/DrinkCustomizer.jsx'
import CartDrawer from '../components/cart/CartDrawer.jsx'

function isTrue(val) {
  if (typeof val === 'boolean') return val
  return String(val).toUpperCase() === 'TRUE'
}

export default function MenuPage() {
  const { shopOpen, loaded } = useShop()
  const { count } = useCart()
  const [menu, setMenu] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [selected, setSelected] = useState(null)
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    gasGet('getMenu')
      .then(res => { if (res.status === 'success') setMenu(res.data || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const available = menu.filter(i => isTrue(i.available) || i.available == null)
  const specialties = available.filter(i => isTrue(i.is_specialty_week))
  const categories = ['All', ...new Set(available.map(i => i.category).filter(Boolean))]
  const filtered = activeCategory === 'All' ? available : available.filter(i => i.category === activeCategory)

  return (
    <div style={{ minHeight: '100dvh', background: '#FAF6F0', paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E8D5C0', padding: '12px 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <img src="/icon.jpg" alt="Caffeine._.iv" style={{ height: '36px', objectFit: 'contain' }} />
        <button
          onClick={() => setCartOpen(true)}
          style={{ background: '#7C3A1E', border: 'none', borderRadius: '9999px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#fff', fontSize: '15px', fontWeight: 600, boxShadow: '0 2px 8px rgba(124,58,30,0.25)' }}
        >
          <ShoppingBag size={18} color="#fff" />
          {count > 0 && <span>{count}</span>}
        </button>
      </div>

      <AnnouncementBanner />

      {/* Shop closed overlay */}
      {loaded && !shopOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 150, background: 'rgba(250,246,240,0.97)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '2rem' }}>
          <img src="/banner.jpg" alt="" style={{ width: '120px', opacity: 0.5 }} />
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#2C1A0E', textAlign: 'center' }}>Shop is closed</h2>
          <p style={{ margin: 0, fontSize: '15px', color: '#8C6A52', textAlign: 'center', maxWidth: '280px', lineHeight: 1.5 }}>Orders are not available right now. Check back soon.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingTop: '1rem' }}>
        <WardGroupingBanner />

        {specialties.length > 0 && (
          <SpecialtyHighlight items={specialties} onSelect={setSelected} />
        )}

        {/* Category chips */}
        {categories.length > 1 && (
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '0 1rem 2px', scrollbarWidth: 'none' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{ flexShrink: 0, background: activeCategory === cat ? '#7C3A1E' : '#F5EDE3', color: activeCategory === cat ? '#fff' : '#2C1A0E', border: 'none', borderRadius: '9999px', padding: '8px 18px', fontSize: '14px', fontWeight: activeCategory === cat ? 600 : 400, cursor: 'pointer', transition: '150ms ease-out', whiteSpace: 'nowrap' }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Menu grid */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '3rem 0' }}>
            <img src="/banner.jpg" alt="" style={{ width: '80px', opacity: 0.25 }} />
            <p style={{ margin: 0, fontSize: '15px', color: '#8C6A52' }}>Loading menu…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '3rem 0' }}>
            <img src="/banner.jpg" alt="" style={{ width: '80px', opacity: 0.25 }} />
            <p style={{ margin: 0, fontSize: '15px', color: '#8C6A52' }}>Nothing here yet</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', padding: '0 1rem' }}>
            {filtered.map(item => (
              <DrinkCard key={item.item_id} item={item} onSelect={setSelected} />
            ))}
          </div>
        )}
      </div>

      {selected && <DrinkCustomizer item={selected} onClose={() => setSelected(null)} />}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <Navbar />
    </div>
  )
}
