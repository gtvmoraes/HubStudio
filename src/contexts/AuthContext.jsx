import { createContext, useContext, useState } from 'react'
import { loginService, registerService, fetchMe } from '../services/auth'

const AuthContext = createContext(null)

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

function clearSession() {
  localStorage.removeItem('hs-user')
  localStorage.removeItem('hs-token')
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('hs-user')
    const token = localStorage.getItem('hs-token')
    if (!stored) return null
    if (!token || isTokenExpired(token)) {
      clearSession()
      return null
    }
    return JSON.parse(stored)
  })

  const login = async (email, password) => {
    await loginService(email, password)
    const profile = await fetchMe()
    localStorage.setItem('hs-user', JSON.stringify(profile))
    localStorage.removeItem('hs-show-onboarding')
    setUser(profile)
    return profile
  }

  const register = async (data) => {
    await registerService(data)
    await loginService(data.email, data.password)
    const profile = await fetchMe()
    localStorage.setItem('hs-user', JSON.stringify(profile))
    localStorage.setItem('hs-show-onboarding', '1')
    setUser(profile)
    return profile
  }

  const logout = () => {
    clearSession()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
