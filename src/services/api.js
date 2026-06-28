export const API_BASE = import.meta.env.VITE_API_URL || 'https://hubstudio.onrender.com'

export const authFetch = (path, options = {}) => {
  const token = localStorage.getItem('hs-token')
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
}
