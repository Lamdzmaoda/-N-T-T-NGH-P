import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  Edit, Lock, Plane, Heart, Star, MapPin,
  Calendar, Mail, Phone, Save, X
} from 'lucide-react'

// Mock data lịch sử chuyến đi — sau này thay bằng GET /api/trips
const MOCK_TRIPS = [
  { id: 't1', title: 'Hà Nội 3 ngày 2 đêm', start_date: '2026-07-15', end_date: '2026-07-17', status: 'planning', budget: 'Trung bình' },
  { id: 't2', title: 'Đà Nẵng 4 ngày 3 đêm', start_date: '2026-06-01', end_date: '2026-06-04', status: 'completed', budget: 'Cao' },
  { id: 't3', title: 'Đà Lạt 2 ngày 1 đêm', start_date: '2026-08-20', end_date: '2026-08-21', status: 'planning', budget: 'Thấp' },
]

// Mock data địa điểm đã thích — sau này thay bằng GET /api/users/likes
const MOCK_LIKED = [
  { id: 'p1', name: 'Hồ Gươm', city: 'Hà Nội', category: 'Văn hóa' },
  { id: 'p2', name: 'Phở Bát Đàn', city: 'Hà Nội', category: 'Ẩm thực' },
  { id: 'p3', name: 'Bãi biển Mỹ Khê', city: 'Đà Nẵng', category: 'Thiên nhiên' },
]

const STATUS_LABEL = {
  planning: { text: 'Đang lên kế hoạch', bg: '#E6F1FB', color: '#185FA5' },
  ongoing: { text: 'Đang đi', bg: '#FAEEDA', color: '#854F0B' },
  completed: { text: 'Hoàn thành', bg: '#EAF3DE', color: '#3B6D11' },
}

const Profile = () => {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [changingPw, setChangingPw] = useState(false)

  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
  })

  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm: '' })
  const [pwError, setPwError] = useState('')

  const handleSaveProfile = (e) => {
    e.preventDefault()
    // --- MOCK: cập nhật local, sau này gọi PUT /api/users/profile ---
    const updated = { ...user, ...form }
    localStorage.setItem('mockUser', JSON.stringify(updated))
    if (setUser) setUser(updated)
    setEditing(false)
    // --- HẾT MOCK ---
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
    // --- MOCK: sau này gọi PATCH /api/users/password ---
    alert('Đổi mật khẩu thành công (mock)')
    setChangingPw(false)
    setPwForm({ old_password: '', new_password: '', confirm: '' })
    // --- HẾT MOCK ---
  }

  if (!user) return null

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* HEADER PROFILE */}
        <div style={styles.headerCard}>
          <div style={styles.avatar}>
            {user.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>

          <div style={{ flex: 1 }}>
            {!editing ? (
              <>
                <h2 style={styles.name}>{user.full_name}</h2>
                <div style={styles.metaRow}>
                  <span style={styles.metaItem}><Mail size={13} /> {user.email}</span>
                  {user.phone && <span style={styles.metaItem}><Phone size={13} /> {user.phone}</span>}
                </div>
                {user.bio && <p style={styles.bio}>{user.bio}</p>}
                <div style={styles.actions}>
                  <button style={styles.editBtn} onClick={() => setEditing(true)}>
                    <Edit size={14} /> Chỉnh sửa
                  </button>
                  <button style={styles.pwBtn} onClick={() => setChangingPw(true)}>
                    <Lock size={14} /> Đổi mật khẩu
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleSaveProfile} style={styles.editForm}>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Họ và tên</label>
                    <input
                      style={styles.input}
                      value={form.full_name}
                      onChange={e => setForm({ ...form, full_name: e.target.value })}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Số điện thoại</label>
                    <input
                      style={styles.input}
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Giới thiệu bản thân</label>
                  <textarea
                    style={styles.textarea}
                    rows={2}
                    placeholder="Viết vài dòng về bạn..."
                    value={form.bio}
                    onChange={e => setForm({ ...form, bio: e.target.value })}
                  />
                </div>
                <div style={styles.formActions}>
                  <button type="submit" style={styles.saveBtn}><Save size={14} /> Lưu</button>
                  <button type="button" style={styles.cancelBtn} onClick={() => setEditing(false)}>
                    <X size={14} /> Hủy
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* ĐỔI MẬT KHẨU MODAL INLINE */}
        {changingPw && (
          <div style={styles.pwCard}>
            <h3 style={styles.pwTitle}>Đổi mật khẩu</h3>
            <form onSubmit={handleChangePassword}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Mật khẩu hiện tại</label>
                <input
                  type="password"
                  style={styles.input}
                  value={pwForm.old_password}
                  onChange={e => setPwForm({ ...pwForm, old_password: e.target.value })}
                />
              </div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Mật khẩu mới</label>
                  <input
                    type="password"
                    style={styles.input}
                    value={pwForm.new_password}
                    onChange={e => setPwForm({ ...pwForm, new_password: e.target.value })}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    style={styles.input}
                    value={pwForm.confirm}
                    onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })}
                  />
                </div>
              </div>
              {pwError && <div style={styles.error}>{pwError}</div>}
              <div style={styles.formActions}>
                <button type="submit" style={styles.saveBtn}>Cập nhật</button>
                <button type="button" style={styles.cancelBtn} onClick={() => setChangingPw(false)}>Hủy</button>
              </div>
            </form>
          </div>
        )}

        {/* COUNTERS */}
        <div style={styles.counters}>
          <div style={styles.counterItem}>
            <div style={{ ...styles.counterNum, color: '#185FA5' }}>{MOCK_TRIPS.length}</div>
            <div style={styles.counterLbl}>Chuyến đi</div>
          </div>
          <div style={styles.counterItem}>
            <div style={{ ...styles.counterNum, color: '#A32D2D' }}>{MOCK_LIKED.length}</div>
            <div style={styles.counterLbl}>Yêu thích</div>
          </div>
          <div style={styles.counterItem}>
            <div style={{ ...styles.counterNum, color: '#854F0B' }}>2</div>
            <div style={styles.counterLbl}>Đánh giá</div>
          </div>
        </div>

        {/* BODY 2 COLUMN */}
        <div style={styles.body}>

          {/* TRIPS */}
          <div style={styles.col}>
            <div style={styles.colHeader}>
              <span style={styles.colTitle}>Chuyến đi gần đây</span>
              <button style={styles.seeAllBtn} onClick={() => navigate('/trips/create')}>
                + Tạo mới
              </button>
            </div>
            {MOCK_TRIPS.map(trip => {
              const st = STATUS_LABEL[trip.status]
              return (
                <div
                  key={trip.id}
                  style={styles.tripItem}
                  onClick={() => navigate(`/trips/${trip.id}`)}
                >
                  <div style={styles.tripIcon}><Plane size={16} color="#185FA5" /></div>
                  <div style={{ flex: 1 }}>
                    <div style={styles.tripTitle}>{trip.title}</div>
                    <div style={styles.tripMeta}>
                      <Calendar size={11} /> {trip.start_date} - {trip.end_date} · {trip.budget}
                    </div>
                  </div>
                  <span style={{ ...styles.statusBadge, backgroundColor: st.bg, color: st.color }}>
                    {st.text}
                  </span>
                </div>
              )
            })}
          </div>

          {/* LIKED PLACES */}
          <div style={styles.col}>
            <div style={styles.colHeader}>
              <span style={styles.colTitle}>Địa điểm đã thích</span>
            </div>
            {MOCK_LIKED.map(place => (
              <div
                key={place.id}
                style={styles.likeItem}
                onClick={() => navigate(`/places/${place.id}`)}
              >
                <div style={styles.likeIcon}><MapPin size={14} color="#185FA5" /></div>
                <div style={{ flex: 1 }}>
                  <div style={styles.likeName}>{place.name}</div>
                  <div style={styles.likeMeta}>{place.city} · {place.category}</div>
                </div>
                <Heart size={14} fill="#A32D2D" color="#A32D2D" />
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f2f0ea', padding: '24px' },
  container: { maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' },

  headerCard: {
    backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #eee',
    padding: '24px', display: 'flex', gap: '20px', alignItems: 'flex-start',
  },
  avatar: {
    width: '72px', height: '72px', borderRadius: '50%',
    backgroundColor: '#185FA5', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '26px', fontWeight: '600', flexShrink: 0,
  },
  name: { fontSize: '19px', fontWeight: '700', marginBottom: '6px', color: '#1a1a18' },
  metaRow: { display: 'flex', gap: '14px', marginBottom: '8px', flexWrap: 'wrap' },
  metaItem: {
    fontSize: '12px', color: '#888',
    display: 'flex', alignItems: 'center', gap: '4px',
  },
  bio: { fontSize: '13px', color: '#666', marginBottom: '12px', lineHeight: 1.6 },
  actions: { display: 'flex', gap: '8px' },
  editBtn: {
    display: 'flex', alignItems: 'center', gap: '5px',
    fontSize: '12px', padding: '6px 14px', borderRadius: '8px',
    border: '1px solid #185FA5', color: '#185FA5', backgroundColor: '#E6F1FB',
    cursor: 'pointer', fontFamily: 'inherit',
  },
  pwBtn: {
    display: 'flex', alignItems: 'center', gap: '5px',
    fontSize: '12px', padding: '6px 14px', borderRadius: '8px',
    border: '1px solid #ddd', color: '#555', backgroundColor: '#fff',
    cursor: 'pointer', fontFamily: 'inherit',
  },

  editForm: { display: 'flex', flexDirection: 'column', gap: '10px' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { fontSize: '12px', fontWeight: '500', color: '#666' },
  input: {
    padding: '8px 10px', border: '1px solid #ddd', borderRadius: '8px',
    fontSize: '13px', fontFamily: 'inherit', color: '#1a1a18',
  },
  textarea: {
    padding: '8px 10px', border: '1px solid #ddd', borderRadius: '8px',
    fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', color: '#1a1a18',
  },
  formActions: { display: 'flex', gap: '8px', marginTop: '4px' },
  saveBtn: {
    display: 'flex', alignItems: 'center', gap: '5px',
    fontSize: '12px', padding: '7px 16px', borderRadius: '8px',
    border: 'none', color: '#fff', backgroundColor: '#185FA5',
    cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500',
  },
  cancelBtn: {
    display: 'flex', alignItems: 'center', gap: '5px',
    fontSize: '12px', padding: '7px 16px', borderRadius: '8px',
    border: '1px solid #ddd', color: '#666', backgroundColor: '#fff',
    cursor: 'pointer', fontFamily: 'inherit',
  },

  pwCard: {
    backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #eee',
    padding: '20px',
  },
  pwTitle: { fontSize: '15px', fontWeight: '600', marginBottom: '14px', color: '#1a1a18' },
  error: {
    backgroundColor: '#FCEBEB', color: '#A32D2D',
    padding: '8px 12px', borderRadius: '8px',
    fontSize: '12px', marginBottom: '8px',
  },

  counters: {
    display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
    backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #eee',
  },
  counterItem: { textAlign: 'center', padding: '16px', borderRight: '1px solid #eee' },
  counterNum: { fontSize: '22px', fontWeight: '700', marginBottom: '3px' },
  counterLbl: { fontSize: '11px', color: '#999' },

  body: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  col: {
    backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #eee',
    padding: '16px',
  },
  colHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '12px',
  },
  colTitle: { fontSize: '14px', fontWeight: '600', color: '#1a1a18' },
  seeAllBtn: {
    fontSize: '11px', padding: '4px 10px', borderRadius: '6px',
    border: '1px solid #185FA5', color: '#185FA5', backgroundColor: '#fff',
    cursor: 'pointer', fontFamily: 'inherit',
  },

  tripItem: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px', backgroundColor: '#f7f6f2', borderRadius: '10px',
    marginBottom: '8px', cursor: 'pointer',
  },
  tripIcon: {
    width: '34px', height: '34px', borderRadius: '8px',
    backgroundColor: '#E6F1FB', display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  tripTitle: { fontSize: '12px', fontWeight: '600', marginBottom: '2px', color: '#1a1a18' },
  tripMeta: {
    fontSize: '10px', color: '#999',
    display: 'flex', alignItems: 'center', gap: '4px',
  },
  statusBadge: { fontSize: '10px', padding: '3px 8px', borderRadius: '20px', fontWeight: '500', whiteSpace: 'nowrap' },

  likeItem: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '9px', backgroundColor: '#f7f6f2', borderRadius: '10px',
    marginBottom: '8px', cursor: 'pointer',
  },
  likeIcon: {
    width: '30px', height: '30px', borderRadius: '8px',
    backgroundColor: '#E6F1FB', display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  likeName: { fontSize: '12px', fontWeight: '600', marginBottom: '2px', color: '#1a1a18' },
  likeMeta: { fontSize: '10px', color: '#999' },
}

export default Profile