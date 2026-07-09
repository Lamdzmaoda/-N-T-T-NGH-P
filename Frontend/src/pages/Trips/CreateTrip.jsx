import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Calendar, DollarSign, Heart, Sparkles, Loader2, ArrowLeft } from 'lucide-react'
import tripService from '../../services/tripService'

const PREFERENCES = [
  { id: 'culture', name: '🏛️ Văn hóa & Lịch sử' },
  { id: 'food', name: '🍜 Ẩm thực đặc sản' },
  { id: 'beach', name: '🏖️ Bãi biển & Nghỉ dưỡng' },
  { id: 'nature', name: '⛰️ Thiên nhiên & Trải nghiệm' },
  { id: 'photo', name: '📸 Check-in & Sống ảo' },
  { id: 'shopping', name: '🛍️ Mua sắm & Giải trí' },
]

const BUDGET_OPTIONS = [
  { id: 'budget', name: 'Giá rẻ', desc: 'Tối ưu chi phí tối đa' },
  { id: 'moderate', name: 'Tiết kiệm', desc: 'Cân bằng giữa dịch vụ và chi phí' },
  { id: 'luxury', name: 'Sang trọng', desc: 'Trải nghiệm dịch vụ cao cấp nhất' },
]

const LOADING_MESSAGES = [
  '🤖 Đang khởi tạo bộ não AI TravelPlanner...',
  '🗺️ Đang nghiên cứu địa hình và cung đường tại điểm đến...',
  '🏨 Đang quét danh sách khách sạn và nhà hàng phù hợp...',
  '🍴 Đang chọn lọc tinh hoa ẩm thực địa phương...',
  '📍 Đang tính toán thời gian di chuyển tối ưu nhất...',
  '✨ Đang sắp xếp lịch trình hoàn chỉnh độc nhất vô nhị...',
]

const CreateTrip = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [msgIdx, setMsgIdx] = useState(0)

  // Form State
  const [destination, setDestination] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [budget, setBudget] = useState('moderate')
  const [selectedPrefs, setSelectedPrefs] = useState([])

  // Hiệu ứng chữ chạy khi tạo AI
  useEffect(() => {
    let interval
    if (loading) {
      interval = setInterval(() => {
        setMsgIdx(prev => (prev + 1) % LOADING_MESSAGES.length)
      }, 2500)
    }
    return () => clearInterval(interval)
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
    setMsgIdx(0)

    try {
      const budgetObj = BUDGET_OPTIONS.find(b => b.id === budget)
      const preferencesNames = selectedPrefs.map(pId => PREFERENCES.find(p => p.id === pId).name)

      const payload = {
        destination: destination.trim(),
        startDate,
        endDate,
        budget: budgetObj ? budgetObj.name : 'Tiết kiệm',
        preferences: preferencesNames
      }

      const res = await tripService.generateTrip(payload)
      const generatedTrip = res.data.result
      
      // Chuyển hướng đến trang chi tiết lịch trình vừa tạo
      navigate(`/trips/${generatedTrip.id}`)
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'AI lập lịch trình thất bại. Vui lòng kiểm tra lại API Key hoặc kết nối mạng của bạn!')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingCard}>
          <Loader2 size={48} color="#185FA5" className="animate-spin" />
          <div style={styles.loadingTitleRow}>
            <Sparkles size={20} color="#854F0B" />
            <h2 style={styles.loadingTitle}>AI Đang lên lịch trình cho bạn...</h2>
          </div>
          <p style={styles.loadingMsg}>{LOADING_MESSAGES[msgIdx]}</p>
          <span style={styles.loadingSub}>Quá trình này có thể mất từ 10 - 20 giây</span>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Back Button */}
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Quay lại
        </button>

        {/* Title */}
        <div style={styles.header}>
          <h1 style={styles.title}>Lập kế hoạch bằng AI</h1>
          <p style={styles.subtitle}>Chỉ với vài lựa chọn cơ bản, AI sẽ thiết kế riêng lịch trình hoàn hảo cho chuyến đi của bạn</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.formCard}>
          {/* Điểm đến */}
          <div style={styles.formGroup}>
            <label style={styles.label}><MapPin size={14} color="#185FA5" /> Điểm đến của bạn</label>
            <input
              style={styles.input}
              required
              placeholder="Ví dụ: Hà Nội, Đà Nẵng, Phú Quốc..."
              value={destination}
              onChange={e => setDestination(e.target.value)}
            />
          </div>

          {/* Thời gian */}
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}><Calendar size={14} color="#185FA5" /> Ngày khởi hành</label>
              <input
                style={styles.input}
                type="date"
                required
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}><Calendar size={14} color="#185FA5" /> Ngày kết thúc</label>
              <input
                style={styles.input}
                type="date"
                required
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Ngân sách */}
          <div style={styles.formGroup}>
            <label style={styles.label}><DollarSign size={14} color="#185FA5" /> Mức ngân sách mong muốn</label>
            <div style={styles.budgetGrid}>
              {BUDGET_OPTIONS.map(opt => (
                <div
                  key={opt.id}
                  style={{
                    ...styles.budgetCard,
                    ...(budget === opt.id ? styles.budgetCardActive : {})
                  }}
                  onClick={() => setBudget(opt.id)}
                >
                  <div style={styles.budgetTitle}>{opt.name}</div>
                  <div style={styles.budgetDesc}>{opt.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Sở thích */}
          <div style={styles.formGroup}>
            <label style={styles.label}><Heart size={14} color="#185FA5" /> Bạn muốn trải nghiệm những gì?</label>
            <div style={styles.prefsGrid}>
              {PREFERENCES.map(pref => {
                const isSelected = selectedPrefs.includes(pref.id)
                return (
                  <button
                    key={pref.id}
                    type="button"
                    style={{
                      ...styles.prefChip,
                      ...(isSelected ? styles.prefChipActive : {})
                    }}
                    onClick={() => togglePref(pref.id)}
                  >
                    {pref.name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Submit */}
          <button type="submit" style={styles.submitBtn}>
            <Sparkles size={16} /> Lên lịch trình ngay với AI
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f2f0ea', padding: '40px 24px' },
  container: { maxWidth: '640px', margin: '0 auto' },
  backBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    backgroundColor: 'transparent', border: 'none',
    color: '#666', fontSize: '13px', fontWeight: '500',
    cursor: 'pointer', fontFamily: 'inherit', marginBottom: '20px',
  },
  header: { textAlign: 'center', marginBottom: '32px' },
  title: { fontSize: '28px', fontWeight: '800', color: '#1a1a18', marginBottom: '8px' },
  subtitle: { fontSize: '14px', color: '#666', lineHeight: 1.5 },
  formCard: {
    backgroundColor: '#fff', borderRadius: '16px',
    border: '1px solid #e8e7e1', padding: '32px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.03)',
    display: 'flex', flexDirection: 'column', gap: '24px',
  },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  label: {
    fontSize: '13px', fontWeight: '600', color: '#333',
    display: 'flex', alignItems: 'center', gap: '6px',
  },
  input: {
    width: '100%', boxSizing: 'border-box',
    padding: '12px 16px', borderRadius: '10px',
    border: '1px solid #ddd', fontSize: '14px',
    outline: 'none', fontFamily: 'inherit', color: '#333',
  },
  budgetGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' },
  budgetCard: {
    border: '1px solid #ddd', borderRadius: '10px',
    padding: '14px 10px', textAlign: 'center', cursor: 'pointer',
    transition: 'all 0.2s', backgroundColor: '#fff',
  },
  budgetCardActive: {
    borderColor: '#185FA5', backgroundColor: '#F0F6FC',
    boxShadow: '0 0 0 2px rgba(24,95,165,0.15)',
  },
  budgetTitle: { fontSize: '14px', fontWeight: '700', color: '#1a1a18', marginBottom: '4px' },
  budgetDesc: { fontSize: '10px', color: '#888', lineHeight: 1.3 },
  prefsGrid: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  prefChip: {
    fontSize: '13px', padding: '8px 16px', borderRadius: '20px',
    border: '1px solid #ddd', backgroundColor: '#fff',
    color: '#555', cursor: 'pointer', fontFamily: 'inherit',
    transition: 'all 0.2s',
  },
  prefChipActive: {
    backgroundColor: '#185FA5', color: '#fff',
    borderColor: '#185FA5', fontWeight: '500',
  },
  submitBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    padding: '14px', borderRadius: '10px', border: 'none',
    backgroundColor: '#185FA5', color: '#fff', fontSize: '15px',
    fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit',
    boxShadow: '0 4px 12px rgba(24,95,165,0.25)',
    marginTop: '10px', transition: 'all 0.2s',
  },

  // Loading Screen Styles
  loadingPage: {
    minHeight: '100vh', backgroundColor: '#f2f0ea',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '24px',
  },
  loadingCard: {
    backgroundColor: '#fff', borderRadius: '20px',
    border: '1px solid #e8e7e1', padding: '40px 32px',
    maxWidth: '440px', width: '100%', textAlign: 'center',
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  loadingTitleRow: {
    display: 'flex', alignItems: 'center', gap: '8px',
    marginTop: '20px', marginBottom: '10px',
  },
  loadingTitle: { fontSize: '18px', fontWeight: '800', color: '#1a1a18' },
  loadingMsg: { fontSize: '14px', color: '#854F0B', fontWeight: '500', marginBottom: '16px', minHeight: '20px' },
  loadingSub: { fontSize: '11px', color: '#aaa' },
}

export default CreateTrip