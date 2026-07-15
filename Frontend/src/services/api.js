import axios from 'axios'

const api = axios.create({
  baseURL: '/travel-ai-planner',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve()
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Tránh loop vô tận khi chính request auth/token hoặc auth/refresh lỗi 401
    const isAuthPath = [
      '/auth/token',
      '/auth/refresh',
      '/auth/logout',
      '/users/register',
      '/auth/register'
    ].some(path => originalRequest.url && originalRequest.url.includes(path))

    if (error.response?.status === 401 && !isAuthPath && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => {
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Gọi API refresh với body rỗng - backend tự đọc token từ HttpOnly Cookie
        await axios.post(
          '/travel-ai-planner/auth/refresh',
          {},
          { withCredentials: true }
        )
        processQueue(null)
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError)
        localStorage.removeItem('isLoggedIn')
        const isLoginPage = ['/login', '/register'].includes(window.location.pathname)
        if (!isLoginPage) {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    if (error.response?.status === 401 && !isAuthPath) {
      const isLoginPage = ['/login', '/register'].includes(window.location.pathname)
      if (!isLoginPage) {
        localStorage.removeItem('isLoggedIn')
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api