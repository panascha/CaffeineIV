export function normalizePhone(phone) {
  return phone.replace(/[-\s().]/g, '')
}

export function validatePhone(phone) {
  const n = normalizePhone(phone)
  return /^0[689]\d{8}$/.test(n)
}
