const GAS_URL = import.meta.env.VITE_GAS_WEBAPP_URL
const GAS_SECRET = import.meta.env.VITE_GAS_SECRET

export async function gasPost(action, data) {
  const res = await fetch(GAS_URL, {
    method: 'POST',
    body: JSON.stringify({ action, secret: GAS_SECRET, data }),
  })
  return res.json()
}

export async function gasGet(action, params = {}) {
  const query = new URLSearchParams({ action, ...params })
  const res = await fetch(`${GAS_URL}?${query}`)
  return res.json()
}
