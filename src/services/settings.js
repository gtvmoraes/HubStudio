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


// ─── Sessões ativas ───
export const getSessions = () => accountRequest('/sessions')

// Faturas e uso do plano: services/billing.js (dados reais do backend)
