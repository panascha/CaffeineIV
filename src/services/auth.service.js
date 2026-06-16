const GAS_URL = import.meta.env.VITE_GAS_WEBAPP_URL

export async function adminLogin(username, password) {
  const res = await fetch(GAS_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'login', data: { username, password } }),
  })
  return res.json()
}

export function adminLogout() {
  localStorage.removeItem('admin_session')
}

export function getAdminSession() {
  const stored = localStorage.getItem('admin_session')
  if (!stored) return null
  const session = JSON.parse(stored)
  if (Date.now() > session.exp) {
    localStorage.removeItem('admin_session')
    return null
  }
  return session
}
