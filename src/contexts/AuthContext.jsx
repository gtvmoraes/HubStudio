import { createContext, useContext, useState } from 'react'
import { loginService, registerService } from '../services/auth'

const AuthContext = createContext(null)

const MOCK_USER = {
  name: 'Breno Dantas',
  email: 'breno.dantas.pc@gmail.com',
  avatar: null,
  plan: 'pro',
}

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
    const loggedUser = { ...MOCK_USER, email }
    localStorage.setItem('hs-user', JSON.stringify(loggedUser))
    localStorage.removeItem('hs-show-onboarding')
    setUser(loggedUser)
    return loggedUser
  }

  const register = async (data) => {
    await registerService(data)
    const newUser = { ...MOCK_USER, ...data }
    localStorage.setItem('hs-user', JSON.stringify(newUser))
    localStorage.setItem('hs-show-onboarding', '1')
    setUser(newUser)
    return newUser
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
