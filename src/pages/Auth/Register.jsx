import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'

const Register = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    dob: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.username || !formData.fullName || !formData.email ||
      !formData.phone || !formData.dob || !formData.password || !formData.confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }
    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    setLoading(true)

    // --- MOCK DATA (xóa khi backend chạy) ---
    setTimeout(() => {
      console.log('Data gửi lên API:', {
        username: formData.username,
        full_name: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        dob: formData.dob,
      })
      localStorage.setItem('accessToken', 'mock-token-123')
      navigate('/')
      setLoading(false)
    }, 1000)
    // --- HẾT MOCK DATA ---
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        <div style={styles.logo}>
          <span style={styles.logoIcon}>✈️</span>
          <span style={styles.logoText}>
            Travel<span style={{ color: '#185FA5' }}>AI</span>
          </span>
        </div>

        <h2 style={styles.title}>Đăng ký tài khoản</h2>
        <p style={styles.subtitle}>Tham gia miễn phí, lên kế hoạch ngay!</p>

        <form onSubmit={handleSubmit} style={styles.form}>

          {/* Họ tên */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Họ và tên</label>
            <input
              type="text"
              name="fullName"
              placeholder="Nguyễn Văn A"
              value={formData.fullName}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          {/* Username */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Tên đăng nhập</label>
            <input
              type="text"
              name="username"
              placeholder="nguyenvana123"
              value={formData.username}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          {/* Email */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              placeholder="name@email.com"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          {/* Số điện thoại */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Số điện thoại</label>
            <input
              type="tel"
              name="phone"
              placeholder="0912345678"
              value={formData.phone}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          {/* Ngày sinh */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Ngày sinh</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
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
                placeholder="Ít nhất 6 ký tự"
                value={formData.password}
                onChange={handleChange}
                style={styles.inputInner}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                {showPassword ? <EyeOff size={18} color="#888" /> : <Eye size={18} color="#888" />}
              </button>
            </div>
          </div>

          {/* Xác nhận mật khẩu */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Xác nhận mật khẩu</label>
            <div style={styles.inputWrap}>
              <input
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Nhập lại mật khẩu"
                value={formData.confirmPassword}
                onChange={handleChange}
                style={styles.inputInner}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                style={styles.eyeBtn}
              >
                {showConfirm ? <EyeOff size={18} color="#888" /> : <Eye size={18} color="#888" />}
              </button>
            </div>
          </div>

          {/* Lỗi */}
          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
          </button>

        </form>

        <div style={styles.divider}><span>hoặc</span></div>

        <p style={styles.loginText}>
          Đã có tài khoản?{' '}
          <Link to="/login" style={styles.loginLink}>Đăng nhập</Link>
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
  formGroup: { marginBottom: '14px' },
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
  loginText: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#666',
  },
  loginLink: {
    color: '#185FA5',
    fontWeight: '500',
    textDecoration: 'none',
  },
}

export default Register