import { authFetch } from './api'

const accountRequest = async (path, method = 'GET', body) => {
  const res = await authFetch(`/users/me${path}`, {
    method,
    ...(body instanceof FormData ? { body } : body !== undefined ? {
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    } : {}),
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message || error.error || 'Não foi possível concluir a solicitação.')
  }
  return res.status === 204 ? null : res.json()
}

export const updateProfile = (form, photo) => {
  const body = new FormData()
  for (const [key, value] of Object.entries(form)) if (value !== undefined && value !== null) body.append(key, value)
  if (photo) body.append('profilePicture', photo)
  return accountRequest('', 'PUT', body)
}
export const changePassword = (currentPassword, newPassword) => accountRequest('/password', 'PUT', { currentPassword, newPassword })
export const revokeSession = (id) => accountRequest(`/sessions/${encodeURIComponent(id)}`, 'DELETE')
export const revokeOtherSessions = () => accountRequest('/sessions', 'DELETE')
export const requestTwoFactorCode = (currentPassword) => accountRequest('/two-factor/challenge', 'POST', { currentPassword })
export const configureTwoFactor = (enabled, currentPassword, challengeId, code) => accountRequest('/two-factor', 'PUT', { enabled, currentPassword, challengeId, code })
export const exportAccount = () => accountRequest('/export')
export const deleteAccount = (currentPassword, confirmation) => accountRequest('', 'DELETE', { currentPassword, confirmation })

// Faturas e uso do plano ainda aguardam backend.

// ─── Sessões ativas ───
export const getSessions = () => accountRequest('/sessions')

// ─── Histórico de faturas ───
export const getInvoices = () => Promise.resolve([
  { id: 'INV-2026-006', date: '01 jun 2026', amount: 'R$ 39,90', status: 'paga',     plan: 'Pro · Mensal' },
  { id: 'INV-2026-005', date: '01 mai 2026', amount: 'R$ 39,90', status: 'paga',     plan: 'Pro · Mensal' },
  { id: 'INV-2026-004', date: '01 abr 2026', amount: 'R$ 39,90', status: 'paga',     plan: 'Pro · Mensal' },
  { id: 'INV-2026-003', date: '01 mar 2026', amount: 'R$ 39,90', status: 'paga',     plan: 'Pro · Mensal' },
])

// ─── Uso do plano ───
export const getUsage = () => Promise.resolve({
  profiles: { used: 6,  total: 10 },
  posts:    { used: 142, total: null },   // null = ilimitado
  storage:  { used: 3.2, total: 10, unit: 'GB' },
})
