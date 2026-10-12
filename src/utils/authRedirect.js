// Aceita apenas retornos internos para o fluxo de convite.
export function authReturnPath(search) {
  const path = new URLSearchParams(search).get('returnTo')
  return /^\/invite\/[a-zA-Z0-9-]+$/.test(path || '') ? path : '/dashboard'
}

export function authSwitchPath(path, search) {
  const returnTo = authReturnPath(search)
  return returnTo === '/dashboard' ? path : `${path}?returnTo=${encodeURIComponent(returnTo)}`
}
