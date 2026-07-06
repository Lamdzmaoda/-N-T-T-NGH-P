import { createContext, useContext, useState, useEffect } from 'react'
import authService from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    // Thử gọi API thật trước
    authService.getMe()
      .then(res => setUser(res.data.data.user))
      .catch(() => {
        // Nếu backend chưa chạy → dùng mock user
        const mockUser = localStorage.getItem('mockUser')
        if (mockUser) {
          setUser(JSON.parse(mockUser))
        } else {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
        }
      })
      .finally(() => setLoading(false))
  } else {
    setLoading(false)
  }
}, [])

  const login = async (email, password) => {
    const res = await authService.login({ email, password })
    const { accessToken, refreshToken, user } = res.data.data
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    setUser(user)
    return user
  }

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      await authService.logout({ refreshToken })
    } catch {}
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)