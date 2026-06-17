import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const CartContext = createContext(null)

const STORAGE_KEY = 'civ_cart'

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(load)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = useCallback((item) => {
    setItems(prev => {
      const key = itemKey(item)
      const existing = prev.find(i => itemKey(i) === key)
      if (existing) {
        return prev.map(i => itemKey(i) === key ? { ...i, qty: i.qty + item.qty } : i)
      }
      return [...prev, item]
    })
  }, [])

  const removeItem = useCallback((key) => {
    setItems(prev => prev.filter(i => itemKey(i) !== key))
  }, [])

  const updateQty = useCallback((key, qty) => {
    if (qty < 1) {
      setItems(prev => prev.filter(i => itemKey(i) !== key))
    } else {
      setItems(prev => prev.map(i => itemKey(i) === key ? { ...i, qty } : i))
    }
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const updateItem = useCallback((oldKey, newData) => {
    setItems(prev => {
      const filtered = prev.filter(i => itemKey(i) !== oldKey)
      const newKey = itemKey(newData)
      const existing = filtered.find(i => itemKey(i) === newKey)
      if (existing) {
        return filtered.map(i => itemKey(i) === newKey ? { ...i, qty: i.qty + newData.qty } : i)
      }
      return [...filtered, newData]
    })
  }, [])

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const count = items.reduce((sum, i) => sum + i.qty, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, updateItem, clearCart, total, count, itemKey }}>
      {children}
    </CartContext.Provider>
  )
}

export function itemKey(item) {
  return `${item.id}|${item.bean ?? ''}|${item.sweet ?? ''}|${item.milk ?? ''}|${item.add_on ?? ''}`
}

export function useCart() {
  return useContext(CartContext)
}
