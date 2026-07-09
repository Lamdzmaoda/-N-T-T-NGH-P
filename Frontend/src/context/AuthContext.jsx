/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react'
import authService from '../services/authService'


const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  
  // Khởi tạo loading = true nếu có token trong trình duyệt, ngược lại = false
  const [loading, setLoading] = useState(() => {
    return !!localStorage.getItem('accessToken')
  })

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      authService.getMe()
        .then(res => {
          setUser(res.data.result)
        })
        .catch(() => {
          localStorage.removeItem('accessToken')
          setUser(null)
        })
        .finally(() => setLoading(false)) // Chạy bất đồng bộ (Hợp lệ)
    }
  }, [])

  const login = async (username, password) => {
    const res = await authService.login({ username, password })
    const token = res.data.result.token
    
    // Lưu token vào bộ nhớ trình duyệt
    localStorage.setItem('accessToken', token)
    
    // Gọi tiếp API lấy profile để lấy thông tin chi tiết
    const profileRes = await authService.getMe()
    const userData = profileRes.data.result
    
    setUser(userData)
    return userData
  }

  const logout = async () => {
    try {
      const token = localStorage.getItem('accessToken') // 🌟 Đã sửa từ 'refreshToken' thành 'accessToken'
      if (token) {
        await authService.logout({ token })
      }
    } catch (error) {
      console.error('Lỗi khi gọi API logout: ', error)
    } finally {
      localStorage.removeItem('accessToken')
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