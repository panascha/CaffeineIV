function crc16(str) {
  let crc = 0xffff
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1
    }
  }
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, '0')
}

function tlv(tag, value) {
  return `${tag}${String(value.length).padStart(2, '0')}${value}`
}

function normalizePromptPayId(phoneOrTaxId) {
  const raw = phoneOrTaxId.replace(/[-\s]/g, '')
  if (raw.length === 10 && raw.startsWith('0')) {
    // phone: 0812345678 → 0066812345678
    return '0066' + raw.slice(1)
  }
  return raw // tax ID / eWallet: 13+ digits, use as-is
}

export function generatePromptPayPayload(phoneOrTaxId, amountThb) {
  const accountId = normalizePromptPayId(phoneOrTaxId)
  const merchantInfo = tlv('00', 'A000000677010111') + tlv('01', accountId)

  let payload =
    tlv('00', '01') +
    tlv('01', amountThb ? '12' : '11') +
    tlv('29', merchantInfo) +
    tlv('53', '764') +
    (amountThb != null ? tlv('54', Number(amountThb).toFixed(2)) : '') +
    tlv('58', 'TH') +
    tlv('59', 'CAFFEINE IV') +
    tlv('60', 'BANGKOK') +
    '6304'

  return payload + crc16(payload)
}
