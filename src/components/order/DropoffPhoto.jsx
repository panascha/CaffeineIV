import { Package } from 'lucide-react'

export default function DropoffPhoto({ url }) {
  if (!url) return null
  return (
    <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '1rem', boxShadow: '0 2px 12px rgba(44,26,14,0.07)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <Package size={16} color="#7C3A1E" />
        <span style={{ fontSize: '15px', fontWeight: 600, color: '#2C1A0E' }}>Drop-off Photo</span>
      </div>
      <img src={url} alt="Drop-off" style={{ width: '100%', borderRadius: '0.875rem', objectFit: 'cover', maxHeight: '280px' }} />
    </div>
  )
}
