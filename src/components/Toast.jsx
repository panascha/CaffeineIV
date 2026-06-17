import { createContext, useContext, useState, useCallback } from 'react'
import { X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const show = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
  }, [])

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const bg = { info: '#2C1A0E', success: '#2E7D32', error: '#C0392B' }

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div style={{ position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px', width: 'calc(100% - 2rem)', maxWidth: '440px', pointerEvents: 'none' }}>
        {toasts.map(t => (
          <div key={t.id} style={{ background: bg[t.type] || bg.info, color: '#fff', borderRadius: '0.875rem', padding: '12px 16px', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', pointerEvents: 'auto', animation: 'toastIn 200ms ease-out' }}>
            <span>{t.message}</span>
            <button onClick={() => dismiss(t.id)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '0 0 0 12px', display: 'flex' }}>
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
