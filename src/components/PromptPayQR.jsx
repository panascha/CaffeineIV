import { QRCodeSVG } from 'qrcode.react'
import { generatePromptPayPayload } from '../utils/promptpay.js'

export default function PromptPayQR({ phoneOrTaxId, amountThb, size = 200 }) {
  if (!phoneOrTaxId) return null
  const payload = generatePromptPayPayload(phoneOrTaxId, amountThb)
  return (
    <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '20px', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '12px', boxShadow: '0 2px 12px rgba(44,26,14,0.07)' }}>
      <QRCodeSVG value={payload} size={size} level="M" />
      {amountThb != null && (
        <p style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#7C3A1E' }}>฿{amountThb}</p>
      )}
      <p style={{ margin: 0, fontSize: '12px', color: '#8C6A52' }}>PromptPay · {phoneOrTaxId}</p>
    </div>
  )
}
