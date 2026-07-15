import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Calendar, DollarSign, Heart, Sparkles, ArrowLeft, Check } from 'lucide-react'
import tripService from '../../services/tripService'

const PREFERENCES = [
  { id: 'culture', name: '🏛️ Văn hóa & Lịch sử' },
  { id: 'food', name: '🍜 Ẩm thực đặc sản' },
  { id: 'beach', name: '🏖️ Biển & Nghỉ dưỡng' },
  { id: 'nature', name: '⛰️ Thiên nhiên & Trải nghiệm' },
  { id: 'photo', name: '📸 Check-in & Sống ảo' },
  { id: 'shopping', name: '🛍️ Mua sắm & Giải trí' },
]

const BUDGET_OPTIONS = [
  { id: 'budget',   icon: '💚', name: 'Tiết kiệm',  desc: 'Tối ưu chi phí, trải nghiệm đầy đủ', color: '#2DD4BF', glow: 'rgba(45,212,191,0.2)' },
  { id: 'moderate', icon: '💙', name: 'Vừa phải',  desc: 'Cân bằng chất lượng và chi phí',    color: '#38BDF8', glow: 'rgba(56,189,248,0.2)' },
  { id: 'luxury',   icon: '💜', name: 'Sang trọng', desc: 'Dịch vụ cao cấp, trải nghiệm đỉnh', color: '#818CF8', glow: 'rgba(129,140,248,0.2)' },
]

const LOADING_MESSAGES = [
  { icon: '🤖', text: 'Khởi tạo bộ não AI TravelPlanner...' },
  { icon: '🗺️', text: 'Nghiên cứu địa hình và cung đường...' },
  { icon: '🏨', text: 'Quét danh sách khách sạn & nhà hàng...' },
  { icon: '🍴', text: 'Chọn lọc tinh hoa ẩm thực địa phương...' },
  { icon: '📍', text: 'Tính toán thời gian di chuyển tối ưu...' },
  { icon: '✨', text: 'Hoàn thiện lịch trình độc nhất vô nhị...' },
]

const CreateTrip = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [msgIdx, setMsgIdx] = useState(0)
  const [progress, setProgress] = useState(0)

  const [destination, setDestination] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [budget, setBudget] = useState('moderate')
  const [selectedPrefs, setSelectedPrefs] = useState([])

  // Loading animation
  useEffect(() => {
    let msgInterval, progressInterval
    if (loading) {
      msgInterval = setInterval(() => {
        setMsgIdx(prev => (prev + 1) % LOADING_MESSAGES.length)
      }, 2800)
      progressInterval = setInterval(() => {
        setProgress(prev => {
          const step = Math.random() * 4 + 1
          return Math.min(prev + step, 92)
        })
      }, 300)
    } else {
      setProgress(0)
      setMsgIdx(0)
    }
    return () => { clearInterval(msgInterval); clearInterval(progressInterval) }
  }, [loading])

  const togglePref = (id) => {
    setSelectedPrefs(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!destination.trim() || !startDate || !endDate) {
      alert('Vui lòng điền đầy đủ Điểm đến và Thời gian chuyến đi!')
      return
    }
    if (new Date(startDate) > new Date(endDate)) {
      alert('Ngày bắt đầu không được lớn hơn ngày kết thúc!')
      return
    }
    setLoading(true)
    try {
      const budgetObj = BUDGET_OPTIONS.find(b => b.id === budget)
      const preferencesNames = selectedPrefs.map(pId => PREFERENCES.find(p => p.id === pId).name)
      const payload = {
        destination: destination.trim(),
        startDate, endDate,
        budget: budgetObj ? budgetObj.name : 'Vừa phải',
        preferences: preferencesNames
      }
      const res = await tripService.generateTrip(payload)
      const generatedTrip = res.data.result
      setProgress(100)
      setTimeout(() => navigate(`/trips/${generatedTrip.id}`), 400)
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'AI lập lịch trình thất bại. Vui lòng kiểm tra lại API Key hoặc kết nối mạng!')
      setLoading(false)
    }
  }

  // ── Loading screen ─────────────────────────────────────
  if (loading) {
    const msg = LOADING_MESSAGES[msgIdx]
    return (
      <div style={s.loadingPage}>
        {/* Background mesh */}
        <div style={s.loadingBgMesh} />

        <div style={s.loadingCard} className="animate-scale-in">
          {/* Animated icon */}
          <div style={s.loadingIconRing} className="animate-pulse-glow">
            <div style={s.loadingIconInner}>
              <Sparkles size={32} color="#38BDF8" />
            </div>
          </div>

          {/* Progress bar */}
          <div style={s.progressBarWrap}>
            <div style={{ ...s.progressBar, width: `${progress}%` }} />
          </div>
          <div style={s.progressLabel}>{Math.round(progress)}%</div>

          {/* Message */}
          <div style={s.loadingMsgWrap} key={msgIdx} className="animate-fade-in">
            <span style={s.loadingIcon}>{msg.icon}</span>
            <p style={s.loadingMsg}>{msg.text}</p>
          </div>

          <h2 style={s.loadingTitle}>AI đang lên lịch trình cho bạn...</h2>
          <p style={s.loadingSub}>Quá trình này có thể mất 10–20 giây</p>

          {/* Steps indicator */}
          <div style={s.stepsRow}>
            {LOADING_MESSAGES.map((m, i) => (
              <div key={i} style={{
                ...s.stepDot,
                background: i <= msgIdx ? '#38BDF8' : 'rgba(255,255,255,0.1)',
                transform: i === msgIdx ? 'scale(1.3)' : 'scale(1)',
                boxShadow: i === msgIdx ? '0 0 8px rgba(56,189,248,0.6)' : 'none',
              }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Main form ──────────────────────────────────────────
  return (
    <div style={s.page}>
      {/* Background */}
      <div style={s.pageMesh} />

      <div style={s.container}>
        {/* Back */}
        <button style={s.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={15} />
          Quay lại
        </button>

        {/* Header */}
        <div style={s.header} className="animate-fade-in-up">
          <div style={s.headerBadge}>
            <Sparkles size={13} color="#F59E0B" />
            <span>Trí tuệ nhân tạo · Cá nhân hóa hoàn toàn</span>
          </div>
          <h1 style={s.title}>Lập kế hoạch bằng AI</h1>
          <p style={s.subtitle}>
            Chỉ với vài lựa chọn cơ bản, AI sẽ thiết kế riêng lịch trình hoàn hảo cho bạn
          </p>
        </div>

        {/* Form card */}
        <form onSubmit={handleSubmit} style={s.formCard} className="animate-fade-in-up delay-100">

          {/* 1. Điểm đến */}
          <div style={s.formSection}>
            <div style={s.sectionLabel}>
              <div style={{ ...s.sectionNum, background: 'rgba(56,189,248,0.12)', color: '#38BDF8', border: '1px solid rgba(56,189,248,0.25)' }}>1</div>
              <div style={s.sectionTitle}><MapPin size={15} color="#38BDF8" /> Điểm đến</div>
            </div>
            <input
              style={s.input}
              className="input-premium"
              required
              placeholder="Ví dụ: Hà Nội, Đà Nẵng, Phú Quốc, Sapa..."
              value={destination}
              onChange={e => setDestination(e.target.value)}
            />
          </div>

          <div style={s.divider} />

          {/* 2. Thời gian */}
          <div style={s.formSection}>
            <div style={s.sectionLabel}>
              <div style={{ ...s.sectionNum, background: 'rgba(45,212,191,0.12)', color: '#2DD4BF', border: '1px solid rgba(45,212,191,0.25)' }}>2</div>
              <div style={s.sectionTitle}><Calendar size={15} color="#2DD4BF" /> Thời gian chuyến đi</div>
            </div>
            <div style={s.dateRow}>
              <div style={s.dateField}>
                <label style={s.dateLabel}>Ngày khởi hành</label>
                <input
                  style={s.input}
                  className="input-premium"
                  type="date"
                  required
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
              </div>
              <div style={s.dateSep}>→</div>
              <div style={s.dateField}>
                <label style={s.dateLabel}>Ngày kết thúc</label>
                <input
                  style={s.input}
                  className="input-premium"
                  type="date"
                  required
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div style={s.divider} />

          {/* 3. Ngân sách */}
          <div style={s.formSection}>
            <div style={s.sectionLabel}>
              <div style={{ ...s.sectionNum, background: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.25)' }}>3</div>
              <div style={s.sectionTitle}><DollarSign size={15} color="#F59E0B" /> Mức ngân sách</div>
            </div>
            <div style={s.budgetGrid}>
              {BUDGET_OPTIONS.map(opt => {
                const isSelected = budget === opt.id
                return (
                  <div
                    key={opt.id}
                    style={{
                      ...s.budgetCard,
                      ...(isSelected ? {
                        borderColor: opt.color,
                        background: `${opt.glow}`,
                        boxShadow: `0 0 20px ${opt.glow}`,
                      } : {}),
                    }}
                    onClick={() => setBudget(opt.id)}
                  >
                    {isSelected && (
                      <div style={{ ...s.budgetCheck, color: opt.color }}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                    <div style={s.budgetIcon}>{opt.icon}</div>
                    <div style={{ ...s.budgetName, color: isSelected ? opt.color : '#F8FAFC' }}>{opt.name}</div>
                    <div style={s.budgetDesc}>{opt.desc}</div>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={s.divider} />

          {/* 4. Sở thích */}
          <div style={s.formSection}>
            <div style={s.sectionLabel}>
              <div style={{ ...s.sectionNum, background: 'rgba(129,140,248,0.12)', color: '#818CF8', border: '1px solid rgba(129,140,248,0.25)' }}>4</div>
              <div style={s.sectionTitle}><Heart size={15} color="#818CF8" /> Bạn muốn trải nghiệm gì?</div>
            </div>
            <p style={s.prefsHint}>Chọn một hoặc nhiều sở thích để AI cá nhân hóa lịch trình</p>
            <div style={s.prefsGrid}>
              {PREFERENCES.map(pref => {
                const isSelected = selectedPrefs.includes(pref.id)
                return (
                  <button
                    key={pref.id}
                    type="button"
                    style={{
                      ...s.prefChip,
                      ...(isSelected ? s.prefChipActive : {}),
                    }}
                    onClick={() => togglePref(pref.id)}
                  >
                    {isSelected && <Check size={11} strokeWidth={3} style={{ flexShrink: 0 }} />}
                    {pref.name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Submit */}
          <button type="submit" style={s.submitBtn}>
            <Sparkles size={17} />
            Tạo lịch trình với AI ngay
            <span style={s.submitArrow}>→</span>
          </button>

          <p style={s.submitNote}>
            🤖 AI sẽ tạo lịch trình hoàn chỉnh trong 10–20 giây
          </p>
        </form>
      </div>
    </div>
  )
}

const s = {
  // Page
  page: {
    minHeight: '100vh',
    background: 'var(--bg-dark)',
    padding: '40px 24px 60px',
    position: 'relative',
    overflow: 'hidden',
  },
  pageMesh: {
    position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
    backgroundImage: `radial-gradient(ellipse at 15% 50%, rgba(56,189,248,0.07) 0%, transparent 50%),
                      radial-gradient(ellipse at 85% 20%, rgba(129,140,248,0.07) 0%, transparent 50%)`,
  },
  container: {
    maxWidth: '680px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 1,
  },

  // Back
  backBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px', padding: '8px 14px',
    color: '#94A3B8', fontSize: '13px', fontWeight: '500',
    cursor: 'pointer', fontFamily: 'inherit', marginBottom: '28px',
    transition: 'all 0.2s ease',
  },

  // Header
  header: { textAlign: 'center', marginBottom: '36px' },
  headerBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '5px 14px', borderRadius: '20px',
    background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
    fontSize: '11px', fontWeight: '700', color: '#F59E0B',
    letterSpacing: '0.04em', marginBottom: '16px',
  },
  title: {
    fontSize: '34px', fontWeight: '900', color: '#F8FAFC',
    marginBottom: '10px', letterSpacing: '-0.5px',
    background: 'linear-gradient(135deg, #F8FAFC 60%, #38BDF8 100%)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    fontSize: '15px', color: '#64748B', lineHeight: 1.6,
  },

  // Form card
  formCard: {
    background: 'var(--bg-surface)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '24px',
    padding: '36px',
    display: 'flex', flexDirection: 'column', gap: '0',
    boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
  },

  formSection: {
    padding: '24px 0',
  },
  divider: {
    height: '1px',
    background: 'rgba(255,255,255,0.06)',
    margin: '0',
  },
  sectionLabel: {
    display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px',
  },
  sectionNum: {
    width: '26px', height: '26px', borderRadius: '8px', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '12px', fontWeight: '800',
  },
  sectionTitle: {
    display: 'flex', alignItems: 'center', gap: '7px',
    fontSize: '15px', fontWeight: '700', color: '#F8FAFC',
  },

  input: {
    width: '100%', boxSizing: 'border-box',
    padding: '13px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    fontSize: '14px', color: '#F8FAFC',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },

  dateRow: {
    display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '12px', alignItems: 'end',
  },
  dateField: { display: 'flex', flexDirection: 'column', gap: '7px' },
  dateLabel: { fontSize: '12px', fontWeight: '600', color: '#64748B', letterSpacing: '0.03em' },
  dateSep: {
    color: '#38BDF8', fontWeight: '700', fontSize: '18px',
    paddingBottom: '13px', textAlign: 'center',
  },

  // Budget
  budgetGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px',
  },
  budgetCard: {
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '14px', padding: '18px 14px',
    textAlign: 'center', cursor: 'pointer',
    transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
    background: 'rgba(255,255,255,0.03)',
    position: 'relative', overflow: 'hidden',
  },
  budgetCheck: {
    position: 'absolute', top: '8px', right: '8px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  budgetIcon: { fontSize: '26px', marginBottom: '8px' },
  budgetName: { fontSize: '14px', fontWeight: '700', marginBottom: '5px', transition: 'color 0.2s' },
  budgetDesc: { fontSize: '11px', color: '#64748B', lineHeight: 1.4 },

  // Preferences
  prefsHint: { fontSize: '12px', color: '#64748B', marginBottom: '14px' },
  prefsGrid: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  prefChip: {
    display: 'flex', alignItems: 'center', gap: '6px',
    fontSize: '13px', padding: '9px 16px', borderRadius: '24px',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.04)', color: '#94A3B8',
    cursor: 'pointer', fontFamily: 'inherit',
    transition: 'all 0.2s ease',
  },
  prefChipActive: {
    background: 'rgba(56,189,248,0.1)',
    borderColor: 'rgba(56,189,248,0.4)',
    color: '#38BDF8', fontWeight: '600',
    boxShadow: '0 0 12px rgba(56,189,248,0.15)',
  },

  // Submit
  submitBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
    padding: '16px', borderRadius: '14px', border: 'none',
    background: 'linear-gradient(135deg, #38BDF8 0%, #818CF8 100%)',
    backgroundSize: '200% 200%',
    color: '#0A0F1E', fontSize: '16px', fontWeight: '800',
    cursor: 'pointer', fontFamily: 'inherit',
    boxShadow: '0 0 32px rgba(56,189,248,0.4)',
    marginTop: '8px',
    transition: 'all 0.2s ease',
    animation: 'gradientShift 4s ease infinite',
  },
  submitArrow: { marginLeft: 'auto', fontSize: '18px' },
  submitNote: {
    textAlign: 'center', fontSize: '12px', color: '#64748B',
    marginTop: '12px', lineHeight: 1.5,
  },

  // Loading
  loadingPage: {
    minHeight: '100vh',
    background: 'var(--bg-dark)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '24px', position: 'relative', overflow: 'hidden',
  },
  loadingBgMesh: {
    position: 'absolute', inset: 0, pointerEvents: 'none',
    backgroundImage: `radial-gradient(ellipse at 30% 50%, rgba(56,189,248,0.1) 0%, transparent 50%),
                      radial-gradient(ellipse at 70% 30%, rgba(129,140,248,0.1) 0%, transparent 50%)`,
    animation: 'gradientShift 6s ease infinite',
    backgroundSize: '200% 200%',
  },
  loadingCard: {
    background: 'var(--bg-surface)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '28px', padding: '48px 40px',
    maxWidth: '460px', width: '100%', textAlign: 'center',
    boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px',
    position: 'relative', zIndex: 1,
  },
  loadingIconRing: {
    width: '88px', height: '88px', borderRadius: '50%',
    background: 'rgba(56,189,248,0.1)',
    border: '2px solid rgba(56,189,248,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  loadingIconInner: {
    width: '64px', height: '64px', borderRadius: '50%',
    background: 'rgba(56,189,248,0.08)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  progressBarWrap: {
    width: '100%', height: '4px', borderRadius: '2px',
    background: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%', borderRadius: '2px',
    background: 'linear-gradient(90deg, #38BDF8, #818CF8)',
    transition: 'width 0.3s ease',
    boxShadow: '0 0 8px rgba(56,189,248,0.5)',
  },
  progressLabel: {
    fontSize: '11px', color: '#38BDF8', fontWeight: '700',
    letterSpacing: '0.05em',
  },
  loadingMsgWrap: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
  },
  loadingIcon: { fontSize: '32px' },
  loadingMsg: {
    fontSize: '15px', color: '#38BDF8', fontWeight: '600',
    lineHeight: 1.5,
  },
  loadingTitle: {
    fontSize: '20px', fontWeight: '800', color: '#F8FAFC',
    lineHeight: 1.3,
  },
  loadingSub: { fontSize: '13px', color: '#64748B' },
  stepsRow: {
    display: 'flex', gap: '8px', alignItems: 'center',
  },
  stepDot: {
    width: '8px', height: '8px', borderRadius: '50%',
    transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
  },
}

export default CreateTrip