let scriptPromise

export function resolveGoogleClientId(backendClientId) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim()
  if (clientId && clientId !== backendClientId) {
    throw new Error('Login com Google indisponível no momento. Tente entrar com e-mail e senha.')
  }
  return clientId || backendClientId
}

export function loadGoogleIdentity() {
  if (window.google?.accounts?.id) return Promise.resolve(window.google.accounts.id)
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    const timer = setTimeout(() => { script.remove(); scriptPromise = null; reject(new Error('Não foi possível carregar o login com Google. Tente novamente.')) }, 15000)
    script.onload = () => {
      clearTimeout(timer)
      if (window.google?.accounts?.id) resolve(window.google.accounts.id)
      else { scriptPromise = null; reject(new Error('Login com Google indisponível.')) }
    }
    script.onerror = () => { clearTimeout(timer); script.remove(); scriptPromise = null; reject(new Error('Não foi possível carregar o Google. Verifique sua conexão.')) }
    document.head.appendChild(script)
  })
  return scriptPromise
}
