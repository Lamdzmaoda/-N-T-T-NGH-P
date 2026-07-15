/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react'
import authService from '../services/authService'


const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  
  // Khởi tạo loading = true nếu có trạng thái đăng nhập trong trình duyệt
  const [loading, setLoading] = useState(() => {
    return !!localStorage.getItem('isLoggedIn')
  })

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn')
    if (loggedIn) {
      authService.getMe()
        .then(res => {
          setUser(res.data.result)
        })
        .catch(() => {
          localStorage.removeItem('isLoggedIn')
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (username, password) => {
    const res = await authService.login({ username, password })
    
    // Lưu cờ đăng nhập đơn giản vào localStorage
    localStorage.setItem('isLoggedIn', 'true')
    
    // Gọi tiếp API lấy profile
    const profileRes = await authService.getMe()
    const userData = profileRes.data.result
    
    setUser(userData)
    return userData
  }

  const logout = async () => {
    try {
      await authService.logout({})
    } catch (error) {
      console.error('Lỗi khi gọi API logout: ', error)
    } finally {
      localStorage.removeItem('isLoggedIn')
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)