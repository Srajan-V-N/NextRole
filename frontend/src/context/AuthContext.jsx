import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('nextrole_token')
    const savedUser = localStorage.getItem('nextrole_user')
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem('nextrole_token')
        localStorage.removeItem('nextrole_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password })
    const { token, user: userData } = res.data
    localStorage.setItem('nextrole_token', token)
    localStorage.setItem('nextrole_user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }

  const register = async (name, email, password) => {
    const res = await authAPI.register({ name, email, password })
    const { token, user: userData } = res.data
    localStorage.setItem('nextrole_token', token)
    localStorage.setItem('nextrole_user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }

  const logout = () => {
    localStorage.removeItem('nextrole_token')
    localStorage.removeItem('nextrole_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
