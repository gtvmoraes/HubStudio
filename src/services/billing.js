import { authFetch } from './api'

// Pagamento de plano via AbacatePay (checkout hospedado). Ver BillingController no backend.

const withCompany = (path, companyId) =>
  companyId ? `${path}${path.includes('?') ? '&' : '?'}companyId=${companyId}` : path

const readError = async (res, fallback) => {
  const body = await res.json().catch(() => ({}))
  return new Error(body.message || body.detail || fallback)
}

// { plan, validUntil, paymentsEnabled } — null se a API não responder
export const getCurrentPlan = async (companyId) => {
  try {
    const res = await authFetch(withCompany('/billing/plan', companyId))
    return res.ok ? await res.json() : null
  } catch { return null }
}

export const getPayments = async (companyId) => {
  try {
    const res = await authFetch(withCompany('/billing/payments', companyId))
    return res.ok ? await res.json() : []
  } catch { return [] }
}

// Devolve { paymentId, url } — o front redireciona pra url da AbacatePay
export const startCheckout = async (plan, cycle, companyId) => {
  const res = await authFetch(withCompany('/billing/checkout', companyId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan, cycle }),
  })
  if (!res.ok) throw await readError(res, 'Não foi possível iniciar o pagamento.')
  return res.json()
}

// Na volta do checkout: o backend consulta a AbacatePay e aplica o plano se já estiver pago
export const confirmPayment = async (paymentId) => {
  const res = await authFetch(`/billing/payments/${paymentId}/confirm`, { method: 'POST' })
  if (!res.ok) throw await readError(res, 'Não foi possível confirmar o pagamento.')
  return res.json()
}

// Volta para o Lite na hora (sem reembolso automático)
export const cancelPlan = async (companyId) => {
  const res = await authFetch(withCompany('/billing/cancel', companyId), { method: 'POST' })
  if (!res.ok) throw await readError(res, 'Não foi possível cancelar o plano.')
  return res.json()
}
