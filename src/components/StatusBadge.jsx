const STATUS = {
  pending:    { label: 'Pending',    bg: '#FEF3C7', color: '#92400E' },
  confirmed:  { label: 'Confirmed',  bg: '#DBEAFE', color: '#1E40AF' },
  preparing:  { label: 'Preparing',  bg: '#EDE9FE', color: '#5B21B6' },
  delivering: { label: 'Delivering', bg: '#FED7AA', color: '#9A3412' },
  delivered:  { label: 'Delivered',  bg: '#DCFCE7', color: '#14532D' },
  rejected:   { label: 'Rejected',   bg: '#FEE2E2', color: '#991B1B' },
}

export default function StatusBadge({ status, size = 'md' }) {
  const s = STATUS[status] || { label: status, bg: '#F5EDE3', color: '#2C1A0E' }
  const pad = size === 'sm' ? '2px 10px' : '4px 14px'
  const fs = size === 'sm' ? '12px' : '13px'
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: '9999px', padding: pad, fontSize: fs, fontWeight: 600, whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  )
}
