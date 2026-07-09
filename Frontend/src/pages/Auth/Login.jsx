import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth() 
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.username || !formData.password) {
      setError('Vui lòng nhập đầy đủ thông tin')
      return
    }

    setLoading(true)

    try {
          await login(formData.username, formData.password)
          navigate('/') // Đăng nhập thành công ➔ Chuyển về trang chủ
        } catch (err) {
          // Lấy câu báo lỗi trả về từ GlobalExceptionHandler của Backend
          const errorMsg = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản/mật khẩu.'
          setError(errorMsg)
        } finally {
          setLoading(false)
        }
      }

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        {/* Logo */}
        <div style={styles.logo}>
          <span style={styles.logoIcon}>✈️</span>
          <span style={styles.logoText}>
            Travel<span style={{ color: '#185FA5' }}>AI</span>
          </span>
        </div>

        <h2 style={styles.title}>Đăng nhập</h2>
        <p style={styles.subtitle}>Chào mừng bạn quay lại!</p>

        <form onSubmit={handleSubmit} style={styles.form}>

          {/* Email */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              name="username"
              placeholder="Nhập tên đăng nhập (ví dụ: admin)"
              value={formData.username}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          {/* Mật khẩu */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Mật khẩu</label>
            <div style={styles.inputWrap}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                style={styles.inputInner}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                {showPassword
                  ? <EyeOff size={18} color="#888" />
                  : <Eye size={18} color="#888" />
                }
              </button>
            </div>
            <div style={styles.forgotWrap}>
              <Link to="/forgot-password" style={styles.forgot}>Quên mật khẩu?</Link>
            </div>
          </div>

          {/* Lỗi */}
          {error && <div style={styles.error}>{error}</div>}

          {/* Nút submit */}
          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>

        </form>

        <div style={styles.divider}><span>hoặc</span></div>

        <p style={styles.registerText}>
          Chưa có tài khoản?{' '}
          <Link to="/register" style={styles.registerLink}>Đăng ký miễn phí</Link>
        </p>

      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f2f0ea',
    padding: '24px 0',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '40px 36px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '24px',
  },
  logoIcon: { fontSize: '24px' },
  logoText: { fontSize: '22px', fontWeight: '600', color: '#1a1a18' },
  title: {
    fontSize: '22px',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: '6px',
    color: '#1a1a18',
  },
  subtitle: {
    fontSize: '14px',
    color: '#888',
    textAlign: 'center',
    marginBottom: '28px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '4px' },
  formGroup: { marginBottom: '16px' },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: '#444',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    color: '#1a1a18',
    fontFamily: 'inherit',
  },
  inputWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputInner: {
    width: '100%',
    padding: '10px 40px 10px 12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    color: '#1a1a18',
    fontFamily: 'inherit',
  },
  eyeBtn: {
    position: 'absolute',
    right: '10px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0',
    lineHeight: '1',
    display: 'flex',
    alignItems: 'center',
  },
  forgotWrap: { textAlign: 'right', marginTop: '6px' },
  forgot: { fontSize: '12px', color: '#185FA5', textDecoration: 'none' },
  error: {
    backgroundColor: '#FCEBEB',
    color: '#A32D2D',
    padding: '10px 12px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '12px',
  },
  btn: {
    width: '100%',
    padding: '11px',
    backgroundColor: '#185FA5',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '4px',
    fontFamily: 'inherit',
  },
  divider: {
    textAlign: 'center',
    margin: '20px 0',
    color: '#aaa',
    fontSize: '13px',
  },
  registerText: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#666',
  },
  registerLink: {
    color: '#185FA5',
    fontWeight: '500',
    textDecoration: 'none',
  },
}

export default Login