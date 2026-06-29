import { API_BASE } from './api'

export const loginService = async (email, password) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'Credenciais inválidas')
  }
  const data = await res.json()
  localStorage.setItem('hs-token', data.token)
  return data
}

export const fetchMe = async () => {
  const token = localStorage.getItem('hs-token')
  const res = await fetch(`${API_BASE}/users/me`, {
    headers: { 'Authorization': `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Não foi possível carregar o perfil')
  return res.json()
}

export const registerService = async (data) => {
  const formData = new FormData()
  formData.append('name', data.name)
  formData.append('email', data.email)
  formData.append('password', data.password)
  if (data.profilePicture) formData.append('profilePicture', data.profilePicture)

  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'Erro ao criar conta')
  }
  const created = await res.json()
  return created
}
