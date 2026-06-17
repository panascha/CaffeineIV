export function formatPrice(thb) {
  return `฿${thb}`
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateTime(dateTimeStr) {
  if (!dateTimeStr) return ''
  const d = new Date(dateTimeStr.replace(' ', 'T'))
  return d.toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function generateOrderId() {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `CIV-${Date.now()}-${rand}`
}

export function compressImage(file, maxBytes = 500_000) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement('canvas')
      let { width, height } = img
      const maxDim = 1200
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      let quality = 0.85
      const tryCompress = () => {
        const dataUrl = canvas.toDataURL('image/jpeg', quality)
        const bytes = Math.ceil((dataUrl.length - 'data:image/jpeg;base64,'.length) * 0.75)
        if (bytes <= maxBytes || quality <= 0.3) {
          resolve(dataUrl)
        } else {
          quality -= 0.1
          tryCompress()
        }
      }
      tryCompress()
    }
    img.onerror = reject
    img.src = url
  })
}

export function getTodayStr() {
  return new Date().toISOString().slice(0, 10)
}

export function isCutoffPassed(cutoffDatetime) {
  if (!cutoffDatetime) return false
  return Date.now() > new Date(cutoffDatetime.replace(' ', 'T')).getTime()
}
