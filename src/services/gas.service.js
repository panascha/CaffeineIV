import { idbGet, idbSet } from './idb.service.js'

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

function cacheKey(action, params = {}) {
  const keys = Object.keys(params).sort()
  if (!keys.length) return action
  return `${action}?${new URLSearchParams(Object.fromEntries(keys.map(k => [k, params[k]])))}`
}

export function gasGetCached(action, params = {}, onUpdate) {
  const key = cacheKey(action, params)
  let freshResolved = false
  idbGet(key).then(cached => { if (cached !== undefined && !freshResolved) onUpdate(cached) })
  return gasGet(action, params).then(res => {
    if (res.status === 'success') {
      freshResolved = true
      idbSet(key, res.data)
      onUpdate(res.data)
    }
    return res
  })
}
