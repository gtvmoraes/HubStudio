export const API_BASE = import.meta.env.VITE_API_URL || 'https://hubstudio.onrender.com'

export const authFetch = async (path, options = {}) => {
  const token = localStorage.getItem('hs-token')
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (response.status === 401) {
    localStorage.removeItem('hs-user')
    localStorage.removeItem('hs-token')
    window.location.href = '/login'
    return response
  }

  return response
}
