import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Plane, Sparkles, MapPin, Mountain } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const TRAVEL_QUOTES = [
  { text: '"Đi để trở về — và mỗi chuyến đi là một trang ký ức mới."', author: '— TravelAI' },
  { text: '"Việt Nam, nơi mỗi góc phố là một bức tranh sống động."', author: '— Khách du lịch' },
  { text: '"Lên kế hoạch thông minh, trải nghiệm trọn vẹn."', author: '— TravelAI' },
]

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [quoteIdx] = useState(() => Math.floor(Math.random() * TRAVEL_QUOTES.length))

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
      navigate('/')
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản/mật khẩu.'
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
            <span style={{ fontSize: '48px' }}>✈️</span>
          </div>
          <h2 style={s.leftTitle}>
            Hành trình của bạn<br />
            bắt đầu từ đây
          </h2>
          <p style={s.leftSub}>
            AI lên kế hoạch, bạn chỉ cần tận hưởng
          </p>

          {/* Floating chips */}
          <div style={s.chipsRow}>
            {['🏔️ Sapa', '🏖️ Phú Quốc', '🌆 Hà Nội', '🌊 Đà Nẵng'].map((c, i) => (
              <span key={i} style={{ ...s.chip, animationDelay: `${i * 0.5}s` }} className="animate-fade-in-up">
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

          <h1 style={s.formTitle}>Chào mừng trở lại</h1>
          <p style={s.formSub}>Đăng nhập để tiếp tục hành trình của bạn</p>

          <form onSubmit={handleSubmit} style={s.form}>

            {/* Username */}
            <div style={s.fieldGroup}>
              <label style={s.label}>Tên đăng nhập</label>
              <input
                type="text"
                name="username"
                placeholder="Nhập tên đăng nhập..."
                value={formData.username}
                onChange={handleChange}
                style={s.input}
                className="input-premium"
                autoComplete="username"
              />
            </div>

            {/* Password */}
            <div style={s.fieldGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ ...s.label, marginBottom: 0 }}>Mật khẩu</label>
                <Link to="/forgot-password" style={s.forgotLink}>Quên mật khẩu?</Link>
              </div>
              <div style={s.inputWrap}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  style={{ ...s.input, paddingRight: '44px' }}
                  className="input-premium"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={s.eyeBtn}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
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
                  Đang đăng nhập...
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  Đăng nhập
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="divider" style={{ margin: '24px 0' }}>hoặc</div>

          <p style={s.registerText}>
            Chưa có tài khoản?{' '}
            <Link to="/register" style={s.registerLink}>Đăng ký miễn phí →</Link>
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
    gridTemplateColumns: '1fr 1fr',
    background: 'var(--bg-dark)',
  },

  // Left panel
  leftPanel: {
    position: 'relative',
    overflow: 'hidden',
    backgroundImage: 'url(https://images.unsplash.com/photo-1528702748617-c64d49f918af?w=900&q=80)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    flexDirection: 'column',
    padding: '32px',
  },
  leftOverlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(160deg, rgba(10,15,30,0.88) 0%, rgba(10,15,30,0.6) 50%, rgba(10,15,30,0.9) 100%)',
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
    flex: 1, display: 'flex', flexDirection: 'column',
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
    marginBottom: '32px', lineHeight: 1.5,
  },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  fieldGroup: { display: 'flex', flexDirection: 'column' },
  label: {
    fontSize: '13px', fontWeight: '600',
    color: 'rgba(248,250,252,0.8)', marginBottom: '8px',
    display: 'block',
  },
  input: {
    width: '100%', boxSizing: 'border-box',
    padding: '12px 16px',
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
  forgotLink: {
    fontSize: '12px', color: '#38BDF8', fontWeight: '500',
    textDecoration: 'none',
  },
  errorBox: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: '10px', padding: '12px 14px',
    fontSize: '13px', color: '#FCA5A5',
  },
  submitBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    padding: '13px', borderRadius: '10px', border: 'none',
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

export default Login