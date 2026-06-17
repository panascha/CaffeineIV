import { createContext, useContext, useState, useEffect } from 'react'
import { gasGet } from '../services/gas.service.js'

const ShopContext = createContext(null)

const DEFAULT = {
  shopOpen: true,
  announcement: '',
  stampThreshold: 10,
  gachaActive: false,
  promptpayNumber: '',
  deliveryLocations: [],
  blockedDates: [],
  loaded: false,
}

export function ShopProvider({ children }) {
  const [config, setConfig] = useState(DEFAULT)

  async function fetchConfig() {
    try {
      const res = await gasGet('getConfig')
      if (res.status === 'success') {
        const d = res.data
        const parseJsonArray = (val) => { try { const a = JSON.parse(val); return Array.isArray(a) ? a : [] } catch { return [] } }
        setConfig({
          shopOpen: String(d.shop_open).toUpperCase() !== 'FALSE',
          announcement: d.announcement || '',
          stampThreshold: Number(d.stamp_threshold) || 10,
          gachaActive: String(d.gacha_active).toUpperCase() === 'TRUE',
          promptpayNumber: d.promptpay_number || import.meta.env.VITE_PROMPTPAY_NUMBER || '',
          deliveryLocations: parseJsonArray(d.delivery_locations),
          blockedDates: parseJsonArray(d.blocked_dates),
          loaded: true,
        })
      }
    } catch {
      setConfig(prev => ({ ...prev, loaded: true }))
    }
  }

  useEffect(() => {
    fetchConfig()
  }, [])

  return (
    <ShopContext.Provider value={{ ...config, refetchConfig: fetchConfig }}>
      {children}
    </ShopContext.Provider>
  )
}

export function useShop() {
  return useContext(ShopContext)
}
