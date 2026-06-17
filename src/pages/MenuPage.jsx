import { useState, useEffect, useRef } from 'react'
import { ShoppingBag, Download, X } from 'lucide-react'
import { gasGetCached } from '../services/gas.service.js'
import { useShop } from '../context/ShopContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useToast } from '../components/Toast.jsx'
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

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone

export default function MenuPage() {
  const { shopOpen, loaded } = useShop()
  const { count } = useCart()
  const { show: showToast } = useToast()
  const [menu, setMenu] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [selected, setSelected] = useState(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [showInstall, setShowInstall] = useState(!isStandalone)
  const installPrompt = useRef(null)

  useEffect(() => {
    gasGetCached('getMenu', {}, data => { setMenu(data || []); setLoading(false) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    function onBeforeInstall(e) {
      e.preventDefault()
      installPrompt.current = e
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', () => setShowInstall(false))
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
    }
  }, [])

  function handleInstall() {
    if (installPrompt.current) {
      installPrompt.current.prompt()
      installPrompt.current.userChoice.then(() => { installPrompt.current = null; setShowInstall(false) })
    } else if (isIOS) {
      showToast('Tap Share (⬆) then "Add to Home Screen"', 'info', 5000)
    }
  }

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

        {/* Install banner */}
        {showInstall && (
          <div style={{ margin: '0 1rem', background: '#fff', borderRadius: '1.25rem', boxShadow: '0 2px 12px rgba(44,26,14,0.07)', padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', background: '#F5EDE3', borderRadius: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Download size={20} color="#7C3A1E" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#2C1A0E' }}>Add to Home Screen</p>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#8C6A52' }}>Order faster next time</p>
            </div>
            <button onClick={handleInstall} style={{ background: '#7C3A1E', color: '#fff', border: 'none', borderRadius: '9999px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
              Install
            </button>
            <button onClick={() => setShowInstall(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', flexShrink: 0 }}>
              <X size={16} color="#8C6A52" />
            </button>
          </div>
        )}
      </div>

      {selected && <DrinkCustomizer item={selected} onClose={() => setSelected(null)} />}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <Navbar />
    </div>
  )
}
