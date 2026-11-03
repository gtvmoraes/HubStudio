import { authFetch } from './api'

export async function tiktokReview(path, { companyId, body } = {}) {
  const [route, query = ''] = path.split('?')
  const params = new URLSearchParams(query)
  if (companyId) params.set('companyId', companyId)
  const response = await authFetch(`${route}?${params}`, body ? { method: 'POST', body } : {})
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || `Falha na API (${response.status}). Verifique o perfil tiktok-review no backend.`)
  if (data.error && data.error.code !== 'ok') throw new Error(data.error.message || 'TikTok recusou a solicitação.')
  return data
}
