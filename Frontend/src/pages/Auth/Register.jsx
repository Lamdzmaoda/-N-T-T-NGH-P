import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Plane, Sparkles } from 'lucide-react'
import authService from '../../services/authService'
import { useAuth } from '../../context/AuthContext'

const TRAVEL_QUOTES = [
  { text: '"Hãy tích lũy những kỷ niệm đẹp, không phải là những thứ xa xỉ."', author: '— TravelAI' },
  { text: '"Một chuyến đi xa vạn dặm đều bắt đầu bằng một bước chân nhỏ bé."', author: '— Lão Tử' },
  { text: '"Du lịch dạy chúng ta mở lòng với thế giới bên ngoài."', author: '— TravelAI' },
]

const Register = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
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
  const [quoteIdx] = useState(() => Math.floor(Math.random() * TRAVEL_QUOTES.length))

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // 1. Kiểm tra rỗng
    if (!formData.username || !formData.fullName || !formData.email ||
      !formData.phone || !formData.dob || !formData.password || !formData.confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin')
      return
    }

    // 2. Validate độ dài Tên đăng nhập
    if (formData.username.trim().length < 3) {
      setError('Tên đăng nhập phải chứa ít nhất 3 ký tự')
      return
    }

    // 3. Validate định dạng Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Email không đúng định dạng (Ví dụ: name@example.com)')
      return
    }

    // 4. Validate Số điện thoại (chỉ chứa số, dài 10-11 ký tự)
    const phoneRegex = /^[0-9]{10,11}$/
    if (!phoneRegex.test(formData.phone)) {
      setError('Số điện thoại phải chứa 10 hoặc 11 chữ số')
      return
    }

    // 5. Validate tuổi (phải đủ 18 tuổi trở lên theo quy định của hệ thống)
    const birthDate = new Date(formData.dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    if (age < 18) {
      setError('Bạn phải từ 18 tuổi trở lên để đăng ký tài khoản')
      return
    }

    // 6. Validate khớp mật khẩu
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }

    // 7. Validate độ dài mật khẩu
    if (formData.password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự')
      return
    }

    setLoading(true)

    try {
      // 1. Tạo tài khoản trên database
      await authService.register({
        username: formData.username,
        full_name: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        dob: formData.dob,
      })
      // 2. Đăng ký thành công ➔ Gọi login tự động để lấy token
      await login(formData.username, formData.password)
      navigate('/')
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      {/* Left panel — visual */}
      <div style={s.leftPanel}>
        <div style={s.leftOverlay} />
        <div style={s.leftMesh} />

        {/* Logo */}
        <div style={s.leftLogo}>
          <div style={s.logoIconWrap}>
            <Plane size={18} color="#0A0F1E" />
          </div>
          <span style={s.logoText}>Travel<span style={s.logoAccent}>AI</span></span>
        </div>

        {/* Central illustration */}
        <div style={s.leftCenter}>
          <div style={s.heroIconWrap} className="animate-float animate-pulse-glow">
            <span style={{ fontSize: '48px' }}>🏕️</span>
          </div>
          <h2 style={s.leftTitle}>
            Tham gia cùng chúng tôi<br />
            Lên lịch trình thông minh
          </h2>
          <p style={s.leftSub}>
            Tạo tài khoản nhanh chóng chỉ trong vài giây
          </p>

          <div style={s.chipsRow}>
            {['☕ Hội An', '🏝️ Nha Trang', '🏜️ Mũi Né', '🗻 Hà Giang'].map((c, i) => (
              <span key={i} style={{ ...s.chip, animationDelay: `${i * 0.4}s` }} className="animate-fade-in-up">
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Quote */}
        <div style={s.quoteBox}>
          <p style={s.quoteText}>{TRAVEL_QUOTES[quoteIdx].text}</p>
          <p style={s.quoteAuthor}>{TRAVEL_QUOTES[quoteIdx].author}</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div style={s.rightPanel}>
        <div style={s.formWrap}>
          {/* Mobile logo */}
          <div style={s.mobileLogo}>
            <div style={s.logoIconWrap}>
              <Plane size={16} color="#0A0F1E" />
            </div>
            <span style={s.logoText}>Travel<span style={s.logoAccent}>AI</span></span>
          </div>

          <h1 style={s.formTitle}>Đăng ký tài khoản</h1>
          <p style={s.formSub}>Khám phá thế giới thông minh và dễ dàng hơn</p>

          <form onSubmit={handleSubmit} style={s.form}>
            {/* Họ tên */}
            <div style={s.fieldGroup}>
              <label style={s.label}>Họ và tên</label>
              <input
                type="text"
                name="fullName"
                placeholder="Nguyễn Văn A"
                value={formData.fullName}
                onChange={handleChange}
                style={s.input}
                className="input-premium"
                required
              />
            </div>

            {/* Username */}
            <div style={s.fieldGroup}>
              <label style={s.label}>Tên đăng nhập</label>
              <input
                type="text"
                name="username"
                placeholder="nguyenvana123"
                value={formData.username}
                onChange={handleChange}
                style={s.input}
                className="input-premium"
                required
              />
            </div>

            {/* Email */}
            <div style={s.fieldGroup}>
              <label style={s.label}>Email</label>
              <input
                type="email"
                name="email"
                placeholder="name@email.com"
                value={formData.email}
                onChange={handleChange}
                style={s.input}
                className="input-premium"
                required
              />
            </div>

            {/* Số điện thoại */}
            <div style={s.fieldGroup}>
              <label style={s.label}>Số điện thoại</label>
              <input
                type="tel"
                name="phone"
                placeholder="0912345678"
                value={formData.phone}
                onChange={handleChange}
                style={s.input}
                className="input-premium"
                required
              />
            </div>

            {/* Ngày sinh */}
            <div style={s.fieldGroup}>
              <label style={s.label}>Ngày sinh</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                style={s.input}
                className="input-premium"
                required
              />
            </div>

            {/* Mật khẩu */}
            <div style={s.fieldGroup}>
              <label style={s.label}>Mật khẩu (ít nhất 8 ký tự)</label>
              <div style={s.inputWrap}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  style={{ ...s.input, paddingRight: '44px' }}
                  className="input-premium"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={s.eyeBtn}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Xác nhận mật khẩu */}
            <div style={s.fieldGroup}>
              <label style={s.label}>Xác nhận mật khẩu</label>
              <div style={s.inputWrap}>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={{ ...s.input, paddingRight: '44px' }}
                  className="input-premium"
                  required
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={s.eyeBtn}>
                  {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={s.errorBox} className="animate-scale-in">
                <span style={{ fontSize: '14px' }}>⚠️</span>
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" style={{ ...s.submitBtn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
              {loading ? (
                <>
                  <div style={s.spinner} className="animate-spin" />
                  Đang tạo tài khoản...
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  Đăng ký tài khoản
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="divider" style={{ margin: '24px 0' }}>hoặc</div>

          <p style={s.registerText}>
            Đã có tài khoản?{' '}
            <Link to="/login" style={s.registerLink}>Đăng nhập ngay →</Link>
          </p>

          <p style={s.backLink}>
            <Link to="/" style={{ color: '#64748B', fontSize: '12px' }}>← Quay về trang chủ</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

const s = {
  page: {
    minHeight: '100vh',
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    background: 'var(--bg-dark)',
  },

  // Left panel
  leftPanel: {
    position: 'relative',
    overflow: 'hidden',
    backgroundImage: 'url(https://images.unsplash.com/photo-1506197603052-3c22b929a8f2?w=1000&q=80)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    flexDirection: 'column',
    padding: '32px',
    justifyContent: 'space-between',
  },
  leftOverlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(160deg, rgba(10,15,30,0.85) 0%, rgba(10,15,30,0.6) 50%, rgba(10,15,30,0.9) 100%)',
  },
  leftMesh: {
    position: 'absolute', inset: 0,
    backgroundImage: `radial-gradient(ellipse at 30% 70%, rgba(56,189,248,0.15) 0%, transparent 50%),
                      radial-gradient(ellipse at 70% 20%, rgba(129,140,248,0.12) 0%, transparent 50%)`,
    pointerEvents: 'none',
  },
  leftLogo: {
    position: 'relative', zIndex: 1,
    display: 'flex', alignItems: 'center', gap: '10px',
  },
  logoIconWrap: {
    width: '34px', height: '34px', borderRadius: '9px', flexShrink: 0,
    background: 'linear-gradient(135deg, #38BDF8, #818CF8)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 0 16px rgba(56,189,248,0.4)',
  },
  logoText: {
    fontSize: '18px', fontWeight: '700', color: '#F8FAFC',
  },
  logoAccent: {
    background: 'linear-gradient(135deg, #38BDF8, #818CF8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },

  leftCenter: {
    position: 'relative', zIndex: 1,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    textAlign: 'center', gap: '16px',
    padding: '40px 0',
  },
  heroIconWrap: {
    width: '88px', height: '88px', borderRadius: '24px',
    background: 'rgba(56,189,248,0.12)',
    border: '1px solid rgba(56,189,248,0.25)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(8px)',
  },
  leftTitle: {
    fontSize: '28px', fontWeight: '800', color: '#F8FAFC',
    lineHeight: 1.25, letterSpacing: '-0.5px',
  },
  leftSub: {
    fontSize: '14px', color: 'rgba(248,250,252,0.6)', lineHeight: 1.6,
  },
  chipsRow: {
    display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center',
    marginTop: '8px',
  },
  chip: {
    fontSize: '12px', fontWeight: '600',
    padding: '6px 14px', borderRadius: '20px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: 'rgba(248,250,252,0.8)',
    backdropFilter: 'blur(8px)',
  },

  quoteBox: {
    position: 'relative', zIndex: 1,
    padding: '16px 20px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    backdropFilter: 'blur(8px)',
  },
  quoteText: { fontSize: '13px', color: 'rgba(248,250,252,0.75)', lineHeight: 1.65, fontStyle: 'italic', marginBottom: '6px' },
  quoteAuthor: { fontSize: '11px', color: '#38BDF8', fontWeight: '600' },

  // Right panel
  rightPanel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px',
    overflowY: 'auto',
    maxHeight: '100vh',
  },
  formWrap: {
    width: '100%',
    maxWidth: '420px',
  },
  mobileLogo: {
    display: 'none',
    alignItems: 'center', gap: '10px',
    marginBottom: '28px', justifyContent: 'center',
  },
  formTitle: {
    fontSize: '28px', fontWeight: '800',
    color: '#F8FAFC', marginBottom: '6px',
    letterSpacing: '-0.5px',
  },
  formSub: {
    fontSize: '14px', color: '#64748B',
    marginBottom: '24px', lineHeight: 1.5,
  },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  fieldGroup: { display: 'flex', flexDirection: 'column' },
  label: {
    fontSize: '13px', fontWeight: '600',
    color: 'rgba(248,250,252,0.8)', marginBottom: '6px',
    display: 'block',
  },
  input: {
    width: '100%', boxSizing: 'border-box',
    padding: '11px 14px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    fontSize: '14px', color: '#F8FAFC',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  inputWrap: { position: 'relative' },
  eyeBtn: {
    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#64748B', display: 'flex', alignItems: 'center',
    transition: 'color 0.2s',
  },
  errorBox: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: '10px', padding: '12px 14px',
    fontSize: '13px', color: '#FCA5A5',
  },
  submitBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    padding: '12px', borderRadius: '10px', border: 'none',
    background: 'linear-gradient(135deg, #38BDF8, #818CF8)',
    color: '#0A0F1E', fontSize: '15px', fontWeight: '700',
    cursor: 'pointer', fontFamily: 'inherit',
    boxShadow: '0 0 24px rgba(56,189,248,0.3)',
    transition: 'all 0.2s ease',
    marginTop: '4px',
  },
  spinner: {
    width: '16px', height: '16px', borderRadius: '50%',
    border: '2px solid rgba(10,15,30,0.3)',
    borderTopColor: '#0A0F1E',
  },
  registerText: {
    textAlign: 'center', fontSize: '14px', color: '#64748B',
  },
  registerLink: {
    color: '#38BDF8', fontWeight: '600', textDecoration: 'none',
  },
  backLink: {
    textAlign: 'center', marginTop: '16px',
  },
}

export default Register