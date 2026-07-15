import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  Edit, Lock, Plane, Heart, MapPin,
  Calendar, Mail, Phone, Save, X, Loader2, Sparkles, Award, DollarSign
} from 'lucide-react'
import tripService from '../../services/tripService'
import placeService from '../../services/placeService'
import dashboardService from '../../services/dashboardService'

const STATUS_LABEL = {
  PLANNING: { text: 'Đang lên kế hoạch', bg: 'rgba(56,189,248,0.1)', border: 'rgba(56,189,248,0.2)', color: '#38BDF8' },
  ONGOING: { text: 'Đang di chuyển', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', color: '#F59E0B' },
  COMPLETED: { text: 'Đã hoàn thành', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', color: '#10B981' },
}

const Profile = () => {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  
  const [editing, setEditing] = useState(false)
  const [changingPw, setChangingPw] = useState(false)

  // Form State
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
  })

  // Dữ liệu thực tế từ Database
  const [trips, setTrips] = useState([])
  const [likedPlaces, setLikedPlaces] = useState([])
  const [stats, setStats] = useState(null)
  const [loadingData, setLoadingData] = useState(false)

  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm: '' })
  const [pwError, setPwError] = useState('')

  // 1. Tải danh sách chuyến đi và địa điểm đã thích của người dùng
  const loadProfileData = async () => {
    if (!user) return
    try {
      setLoadingData(true)
      
      // A. Gọi API lấy danh sách Trips phân trang (chỉ lấy 5 bản ghi gần nhất)
      const tripsRes = await tripService.getTrips({ page: 0, size: 5 })
      setTrips(tripsRes.data.result?.content || [])

      // B. Gọi API lấy tất cả địa điểm và lọc địa điểm có liked === true
      const placesRes = await placeService.getPlaces({ page: 0, size: 100 })
      const allPlaces = placesRes.data.result?.content || []
      const liked = allPlaces.filter(p => p.liked || p.isLiked)
      setLikedPlaces(liked)

      // C. Lấy thông tin thống kê cá nhân từ Dashboard API
      try {
        const statsRes = await dashboardService.getUserStats()
        setStats(statsRes.data.result || null)
      } catch (err) {
        console.error('Không thể tải thống kê cá nhân:', err)
      }

    } catch (err) {
      console.error('Lỗi tải dữ liệu cá nhân:', err)
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    loadProfileData()
  }, [user])

  const handleSaveProfile = (e) => {
    e.preventDefault()
    // --- Mock cập nhật local ---
    const updated = { ...user, ...form }
    if (setUser) setUser(updated)
    setEditing(false)
  }

  const handleChangePassword = (e) => {
    e.preventDefault()
    setPwError('')
    if (!pwForm.old_password || !pwForm.new_password || !pwForm.confirm) {
      setPwError('Vui lòng nhập đầy đủ thông tin')
      return
    }
    if (pwForm.new_password !== pwForm.confirm) {
      setPwError('Mật khẩu xác nhận không khớp')
      return
    }
    if (pwForm.new_password.length < 6) {
      setPwError('Mật khẩu mới phải có ít nhất 6 ký tự')
      return
    }
    alert('Đổi mật khẩu thành công (mock)')
    setChangingPw(false)
    setPwForm({ old_password: '', new_password: '', confirm: '' })
  }

  if (!user) return null

  return (
    <div style={s.page}>
      <div style={s.mesh} />
      <div style={s.container}>

        {/* HEADER PROFILE */}
        <div style={s.headerCard} className="animate-fade-in-up">
          <div style={s.avatar} className="animate-pulse-glow">
            {user.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>

          <div style={{ flex: 1 }}>
            {!editing ? (
              <>
                <h2 style={s.name}>{user.full_name}</h2>
                <div style={s.metaRow}>
                  <span style={s.metaItem}><Mail size={13} color="#38BDF8" /> {user.email}</span>
                  {user.phone && <span style={s.metaItem}><Phone size={13} color="#10B981" /> {user.phone}</span>}
                </div>
                {user.bio ? (
                  <p style={s.bio}>{user.bio}</p>
                ) : (
                  <p style={{ ...s.bio, fontStyle: 'italic', color: '#475569' }}>Chưa có lời giới thiệu bản thân.</p>
                )}
                <div style={s.actions}>
                  <button style={s.editBtn} onClick={() => setEditing(true)}>
                    <Edit size={13} /> Chỉnh sửa profile
                  </button>
                  <button style={s.pwBtn} onClick={() => setChangingPw(true)}>
                    <Lock size={13} /> Đổi mật khẩu
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleSaveProfile} style={s.editForm}>
                <div style={s.formRow}>
                  <div style={s.formGroup}>
                    <label style={s.label}>Họ và tên</label>
                    <input
                      style={s.input} className="input-premium"
                      value={form.full_name}
                      onChange={e => setForm({ ...form, full_name: e.target.value })}
                      required
                    />
                  </div>
                  <div style={s.formGroup}>
                    <label style={s.label}>Số điện thoại</label>
                    <input
                      style={s.input} className="input-premium"
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Giới thiệu bản thân</label>
                  <textarea
                    style={s.textarea} className="input-premium"
                    rows={2}
                    placeholder="Viết vài dòng về bạn..."
                    value={form.bio}
                    onChange={e => setForm({ ...form, bio: e.target.value })}
                  />
                </div>
                <div style={s.formActions}>
                  <button type="submit" style={s.saveBtn}><Save size={13} /> Lưu thay đổi</button>
                  <button type="button" style={s.cancelBtn} onClick={() => setEditing(false)}>
                    <X size={13} /> Hủy
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* ĐỔI MẬT KHẨU */}
        {changingPw && (
          <div style={s.pwCard} className="animate-scale-in">
            <h3 style={s.pwTitle}>🔑 Đổi mật khẩu</h3>
            <form onSubmit={handleChangePassword}>
              <div style={s.formGroup}>
                <label style={s.label}>Mật khẩu hiện tại</label>
                <input
                  type="password"
                  style={s.input} className="input-premium"
                  value={pwForm.old_password}
                  onChange={e => setPwForm({ ...pwForm, old_password: e.target.value })}
                  required
                />
              </div>
              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>Mật khẩu mới</label>
                  <input
                    type="password"
                    style={s.input} className="input-premium"
                    value={pwForm.new_password}
                    onChange={e => setPwForm({ ...pwForm, new_password: e.target.value })}
                    required
                  />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    style={s.input} className="input-premium"
                    value={pwForm.confirm}
                    onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })}
                    required
                  />
                </div>
              </div>
              {pwError && <div style={s.error}>{pwError}</div>}
              <div style={s.formActions}>
                <button type="submit" style={s.saveBtn}>Cập nhật mật khẩu</button>
                <button type="button" style={s.cancelBtn} onClick={() => setChangingPw(false)}>Hủy bỏ</button>
              </div>
            </form>
          </div>
        )}

        {/* BỘ ĐẾM THỐNG KÊ THẬT */}
        <div style={s.counters} className="animate-fade-in-up">
          <div style={s.counterItem}>
            <div style={{ ...s.counterNum, color: '#38BDF8' }}>{stats?.totalTrips ?? trips.length}</div>
            <div style={s.counterLbl}>✈️ Chuyến đi lập lịch</div>
          </div>
          <div style={s.counterItem}>
            <div style={{ ...s.counterNum, color: '#10B981' }}>{stats?.totalBookings ?? 0}</div>
            <div style={s.counterLbl}>🎟️ Địa điểm đặt trước</div>
          </div>
          <div style={s.counterItem}>
            <div style={{ ...s.counterNum, color: '#F43F5E' }}>
              {stats?.totalSpent ? `${stats.totalSpent.toLocaleString('vi-VN')}đ` : '0đ'}
            </div>
            <div style={s.counterLbl}>💳 Tổng chi tiêu</div>
          </div>
          <div style={s.counterItem}>
            <div style={{ ...s.counterNum, color: '#F59E0B' }}>
              {stats?.totalDistanceTraveledKm != null ? `${stats.totalDistanceTraveledKm} km` : '0 km'}
            </div>
            <div style={s.counterLbl}>🚗 Quãng đường di chuyển</div>
          </div>
        </div>

        {/* 2 CỘT HIỂN THỊ DỮ LIỆU */}
        {loadingData ? (
          <div style={s.loadingWrap}>
            <Loader2 size={32} color="#38BDF8" className="animate-spin" />
            <p style={{ marginTop: '12px', color: '#64748B', fontSize: '13px' }}>Đang tải lịch trình và yêu thích...</p>
          </div>
        ) : (
          <div style={s.body}>
            {/* CỘT CHUYẾN ĐI */}
            <div style={s.col} className="animate-fade-in-up delay-100">
              <div style={s.colHeader}>
                <span style={s.colTitle}>Chuyến đi của tôi</span>
                <button style={s.seeAllBtn} onClick={() => navigate('/trips/create')}>
                  <Sparkles size={11} /> Tạo chuyến đi AI
                </button>
              </div>
              {trips.length === 0 ? (
                <div style={s.emptyText}>Bạn chưa lên kế hoạch cho chuyến đi nào.</div>
              ) : (
                <div style={s.scrollList}>
                  {trips.map(trip => {
                    const statusType = trip.status || 'PLANNING'
                    const st = STATUS_LABEL[statusType] || STATUS_LABEL.PLANNING
                    return (
                      <div
                        key={trip.id}
                        style={s.tripItem}
                        onClick={() => navigate(`/trips/${trip.id}`)}
                      >
                        <div style={s.tripIcon}><Plane size={15} color="#38BDF8" /></div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={s.tripTitle}>{trip.title}</div>
                          <div style={s.tripMeta}>
                            <Calendar size={11} /> {trip.start_date} → {trip.end_date}
                          </div>
                        </div>
                        <span style={{
                          ...s.statusBadge,
                          background: st.bg,
                          border: `1px solid ${st.border}`,
                          color: st.color
                        }}>
                          {st.text}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* CỘT ĐỊA ĐIỂM ĐÃ THÍCH */}
            <div style={s.col} className="animate-fade-in-up delay-200">
              <div style={s.colHeader}>
                <span style={s.colTitle}>Địa điểm đã thích</span>
              </div>
              {likedPlaces.length === 0 ? (
                <div style={s.emptyText}>Bạn chưa đánh dấu thích địa điểm nào.</div>
              ) : (
                <div style={s.scrollList}>
                  {likedPlaces.map(place => (
                    <div
                      key={place.id}
                      style={s.likeItem}
                      onClick={() => navigate(`/places/${place.id}`)}
                    >
                      <div style={s.likeIcon}><MapPin size={13} color="#F43F5E" /></div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={s.likeName}>{place.name}</div>
                        <div style={s.likeMeta}>{place.address}</div>
                      </div>
                      <Heart size={14} fill="#F43F5E" color="#F43F5E" style={{ flexShrink: 0 }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: 'var(--bg-dark)', padding: '40px 24px 80px', position: 'relative', overflow: 'hidden' },
  mesh: {
    position: 'absolute', inset: 0,
    backgroundImage: `radial-gradient(ellipse at 50% 15%, rgba(56,189,248,0.07) 0%, transparent 60%),
                      radial-gradient(ellipse at 80% 80%, rgba(129,140,248,0.04) 0%, transparent 50%)`,
    pointerEvents: 'none',
  },
  container: { maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', zIndex: 1 },

  // HeaderCard
  headerCard: {
    background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '18px', padding: '28px 24px', display: 'flex', gap: '24px', alignItems: 'center',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)',
  },
  avatar: {
    width: '76px', height: '76px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #38BDF8, #818CF8)', color: '#0A0F1E',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '28px', fontWeight: '800', flexShrink: 0,
    boxShadow: '0 0 20px rgba(56,189,248,0.3)',
  },
  name: { fontSize: '22px', fontWeight: '850', color: '#F8FAFC', marginBottom: '6px', letterSpacing: '-0.5px' },
  metaRow: { display: 'flex', gap: '16px', marginBottom: '10px', flexWrap: 'wrap' },
  metaItem: {
    fontSize: '12px', color: '#64748B',
    display: 'flex', alignItems: 'center', gap: '5px',
  },
  bio: { fontSize: '13px', color: '#94A3B8', marginBottom: '14px', lineHeight: 1.6 },
  actions: { display: 'flex', gap: '10px' },
  editBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    fontSize: '12px', padding: '7px 16px', borderRadius: '8px',
    border: 'none', color: '#0A0F1E', background: 'linear-gradient(135deg, #38BDF8, #818CF8)',
    cursor: 'pointer', fontFamily: 'inherit', fontWeight: '750',
    transition: 'all 0.2s',
  },
  pwBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    fontSize: '12px', padding: '7px 16px', borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.1)', color: '#F8FAFC', background: 'rgba(255,255,255,0.04)',
    cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500',
    transition: 'all 0.2s',
  },

  // Edit form styles
  editForm: { display: 'flex', flexDirection: 'column', gap: '12px' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '11px', fontWeight: '600', color: '#64748B', letterSpacing: '0.03em' },
  input: {
    width: '100%', boxSizing: 'border-box',
    padding: '9px 12px', borderRadius: '8px',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
    fontSize: '13px', fontFamily: 'inherit', color: '#F8FAFC', outline: 'none',
  },
  textarea: {
    width: '100%', boxSizing: 'border-box',
    padding: '9px 12px', borderRadius: '8px',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
    fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', color: '#F8FAFC', outline: 'none',
  },
  formActions: { display: 'flex', gap: '10px', marginTop: '6px' },
  saveBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    fontSize: '12px', padding: '8px 18px', borderRadius: '8px',
    border: 'none', color: '#0A0F1E', background: 'linear-gradient(135deg, #38BDF8, #818CF8)',
    cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700',
  },
  cancelBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    fontSize: '12px', padding: '8px 18px', borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.1)', color: '#94A3B8', background: 'rgba(255,255,255,0.04)',
    cursor: 'pointer', fontFamily: 'inherit',
  },

  // Password card
  pwCard: {
    background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px', padding: '24px',
  },
  pwTitle: { fontSize: '15px', fontWeight: '700', marginBottom: '16px', color: '#F8FAFC' },
  error: {
    background: 'rgba(239,68,68,0.1)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.2)',
    padding: '10px 14px', borderRadius: '8px',
    fontSize: '12px', marginBottom: '12px',
  },

  // Counter block
  counters: {
    display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
    background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px', overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  },
  counterItem: {
    textAlign: 'center', padding: '20px 12px',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    display: 'flex', flexDirection: 'column', gap: '4px',
  },
  counterNum: { fontSize: '20px', fontWeight: '850', letterSpacing: '-0.5px' },
  counterLbl: { fontSize: '11px', color: '#64748B', fontWeight: '500' },

  // Columns & list layout
  loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', gap: '8px' },
  body: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  col: {
    background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '18px', padding: '20px', display: 'flex', flexDirection: 'column',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)',
  },
  colHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '16px',
  },
  colTitle: { fontSize: '15px', fontWeight: '700', color: '#F8FAFC' },
  seeAllBtn: {
    display: 'flex', alignItems: 'center', gap: '5px',
    fontSize: '11px', padding: '5px 12px', borderRadius: '6px',
    border: '1px solid rgba(56,189,248,0.2)', color: '#38BDF8', background: 'rgba(56,189,248,0.08)',
    cursor: 'pointer', fontFamily: 'inherit', fontWeight: '600',
    transition: 'all 0.2s',
  },
  scrollList: {
    display: 'flex', flexDirection: 'column', gap: '10px',
    maxHeight: '340px', overflowY: 'auto', paddingRight: '4px',
  },

  // Trip item styling
  tripItem: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px', background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px',
    cursor: 'pointer', transition: 'all 0.2s ease',
  },
  tripIcon: {
    width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
    background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.15)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  tripTitle: { fontSize: '13px', fontWeight: '600', marginBottom: '3px', color: '#F8FAFC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  tripMeta: {
    fontSize: '11px', color: '#64748B',
    display: 'flex', alignItems: 'center', gap: '4px',
  },
  statusBadge: { fontSize: '10px', padding: '3px 10px', borderRadius: '20px', fontWeight: '600', whiteSpace: 'nowrap' },

  // Like item styling
  likeItem: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px', background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px',
    cursor: 'pointer', transition: 'all 0.2s ease',
  },
  likeIcon: {
    width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
    background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.15)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  likeName: { fontSize: '13px', fontWeight: '600', marginBottom: '3px', color: '#F8FAFC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  likeMeta: { fontSize: '11px', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  emptyText: { fontSize: '12px', color: '#64748B', fontStyle: 'italic', padding: '32px 0', textAlign: 'center' },
}

export default Profile