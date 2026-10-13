import { createContext, useContext, useState } from 'react'
import { loginService, registerService, fetchMe, verifyLogin, revokeCurrentSession } from '../services/auth'
import { googleLoginService, linkGoogleAccountService, verifyGoogleEmailService } from '../services/auth'

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
    const result = await loginService(email, password)
    if (result.requiresTwoFactor) return result
    const profile = await fetchMe()
    localStorage.setItem('hs-user', JSON.stringify(profile))
    localStorage.removeItem('hs-show-onboarding')
    setUser(profile)
    return profile
  }

  const updateUser = (profile) => {
    localStorage.setItem('hs-user', JSON.stringify(profile))
    setUser(profile)
  }

  const completeTwoFactor = async (challengeId, code) => {
    await verifyLogin(challengeId, code)
    const profile = await fetchMe()
    updateUser(profile)
    localStorage.removeItem('hs-show-onboarding')
    return profile
  }

  const finishGoogleLogin = async (result) => {
    if (!result.token) return result
    const profile = await fetchMe(result.token)
    localStorage.setItem('hs-token', result.token)
    updateUser(profile)
    if (result.createdUser) localStorage.setItem('hs-show-onboarding', '1')
    else localStorage.removeItem('hs-show-onboarding')
    return profile
  }
  const loginGoogle = async (credential, challengeId) => finishGoogleLogin(await googleLoginService(credential, challengeId))
  const linkGoogle = async (challengeId, password) => finishGoogleLogin(await linkGoogleAccountService(challengeId, password))
  const verifyGoogleEmail = async (challengeId, code) => finishGoogleLogin(await verifyGoogleEmailService(challengeId, code))

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
    revokeCurrentSession().catch(() => {})
    clearSession()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, completeTwoFactor, loginGoogle, linkGoogle, verifyGoogleEmail, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
