import { CheckCircle, XCircle, ExternalLink } from 'lucide-react'
import { formatPrice } from '../../utils/helpers.js'

export default function SlipVerifier({ order, onConfirm, onReject, loading }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Slip image */}
      {order.slip_url ? (
        <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '1rem', boxShadow: '0 2px 12px rgba(44,26,14,0.07)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '15px', fontWeight: 600, color: '#2C1A0E' }}>Payment Slip</span>
            <a href={order.slip_url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#7C3A1E', textDecoration: 'none' }}>
              Open <ExternalLink size={13} />
            </a>
          </div>
          <img src={order.slip_url} alt="Slip" style={{ width: '100%', borderRadius: '0.875rem', objectFit: 'contain', maxHeight: '400px', background: '#FAF6F0' }} />
        </div>
      ) : (
        <div style={{ background: '#FEF3C7', borderRadius: '1.25rem', padding: '1rem', fontSize: '14px', color: '#92400E' }}>No slip uploaded</div>
      )}

      {/* Expected total */}
      <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '1rem', boxShadow: '0 2px 12px rgba(44,26,14,0.07)' }}>
        <p style={{ margin: 0, fontSize: '13px', color: '#8C6A52' }}>Expected amount</p>
        <p style={{ margin: '4px 0 0', fontSize: '24px', fontWeight: 700, color: '#7C3A1E' }}>{formatPrice(order.total_thb)}</p>
        {order.wallet_used_thb > 0 && (
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#8C6A52' }}>Wallet used: {formatPrice(order.wallet_used_thb)} · Slip should show {formatPrice(order.total_thb - order.wallet_used_thb)}</p>
        )}
      </div>

      {/* Actions */}
      {order.status === 'pending' && (
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onReject} disabled={loading} style={{ flex: 1, background: '#FEE2E2', color: '#991B1B', border: 'none', borderRadius: '9999px', padding: '14px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <XCircle size={18} /> Reject
          </button>
          <button onClick={onConfirm} disabled={loading} style={{ flex: 1, background: '#7C3A1E', color: '#fff', border: 'none', borderRadius: '9999px', padding: '14px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 2px 8px rgba(124,58,30,0.25)' }}>
            <CheckCircle size={18} /> Confirm
          </button>
        </div>
      )}
    </div>
  )
}
