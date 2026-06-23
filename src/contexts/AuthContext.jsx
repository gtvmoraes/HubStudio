import { createContext, useContext, useState } from 'react'
import { loginService, registerService } from '../services/auth'

const AuthContext = createContext(null)

const MOCK_USER = {
  name: 'Breno Dantas',
  email: 'breno.dantas.pc@gmail.com',
  avatar: null,
  plan: 'pro',
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('hs-user')
    return stored ? JSON.parse(stored) : null
  })

  const login = async (email, password) => {
    await loginService(email, password)
    const loggedUser = { ...MOCK_USER, email }
    localStorage.setItem('hs-user', JSON.stringify(loggedUser))
    // Login normal nunca dispara o tour de boas-vindas
    localStorage.removeItem('hs-show-onboarding')
    setUser(loggedUser)
    return loggedUser
  }

  const register = async (data) => {
    await registerService(data)
    const newUser = { ...MOCK_USER, ...data }
    localStorage.setItem('hs-user', JSON.stringify(newUser))
    // Sinaliza que o tour de boas-vindas deve aparecer (só no cadastro)
    localStorage.setItem('hs-show-onboarding', '1')
    setUser(newUser)
    return newUser
  }

  const logout = () => {
    localStorage.removeItem('hs-user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
