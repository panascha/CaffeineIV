export async function hashBase64(base64String) {
  const raw = base64String.replace(/^data:[^;]+;base64,/, '')
  const bytes = Uint8Array.from(atob(raw), c => c.charCodeAt(0))
  const hashBuffer = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}
