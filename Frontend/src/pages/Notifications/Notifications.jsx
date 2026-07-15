import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckSquare, ArrowLeft, Loader2, Info, Calendar, DollarSign, Award, Sparkles } from 'lucide-react'
import notificationService from '../../services/notificationService'

const Notifications = () => {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const res = await notificationService.getNotifications()
      setNotifications(res.data.result || [])
    } catch (err) {
      console.error('Lỗi tải thông báo:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id)
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      )
    } catch (err) {
      console.error(err)
    }
  }

  const handleMarkAllAsRead = async () => {
    if (notifications.filter(n => !n.isRead).length === 0) return
    try {
      await notificationService.markAllAsRead()
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      )
    } catch (err) {
      console.error(err)
    }
  }

  const getNotificationIcon = (type, isRead) => {
    const size = 15
    const color = isRead ? '#94A3B8' : '#38BDF8'
    switch (type) {
      case 'BOOKING': return <Calendar size={size} color={isRead ? '#94A3B8' : '#38BDF8'} />
      case 'PAYMENT': return <DollarSign size={size} color={isRead ? '#94A3B8' : '#10B981'} />
      case 'SYSTEM': return <Award size={size} color={isRead ? '#94A3B8' : '#F59E0B'} />
      default: return <Info size={size} color={color} />
    }
  }

  if (loading) {
    return (
      <div style={s.loadingPage}>
        <div style={s.loadingBg} />
        <div style={s.loadingContent}>
          <div style={s.loadingIconWrap} className="animate-pulse-glow">
            <Loader2 size={28} color="#38BDF8" className="animate-spin" />
          </div>
          <p style={s.loadingText}>Đang tải thông báo từ hệ thống...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={s.page}>
      <div style={s.mesh} />
      <div style={s.container}>
        {/* Back Button */}
        <button style={s.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={14} /> Quay lại
        </button>

        {/* Header */}
        <div style={s.header} className="animate-fade-in-up">
          <div>
            <h1 style={s.title}>
              <div style={s.titleIconBox}>
                <Bell size={20} color="#38BDF8" />
              </div>
              Thông báo hệ thống
            </h1>
            <p style={s.subtitle}>Cập nhật thông tin chi tiết về các giao dịch đặt phòng, thanh toán và lịch trình</p>
          </div>
          {notifications.some(n => !n.isRead) && (
            <button style={s.markAllBtn} onClick={handleMarkAllAsRead}>
              <CheckSquare size={13} /> Đọc tất cả
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div style={s.listCard} className="animate-fade-in-up delay-100">
          {notifications.length === 0 ? (
            <div style={s.emptyState}>
              <div style={s.emptyIconWrap}>
                <Bell size={32} color="#64748B" />
              </div>
              <p style={s.emptyText}>Bạn chưa nhận được thông báo nào từ TravelAI.</p>
              <button style={s.emptyBtn} onClick={() => navigate('/')}>
                <Sparkles size={13} /> Khám phá dịch vụ
              </button>
            </div>
          ) : (
            notifications.map((n, idx) => {
              const isUnread = !n.isRead
              return (
                <div
                  key={n.id}
                  style={{
                    ...s.notiItem,
                    ...(isUnread ? s.notiItemUnread : {}),
                    animationDelay: `${idx * 0.05}s`
                  }}
                  className="animate-fade-in-up"
                  onClick={() => isUnread && handleMarkAsRead(n.id)}
                >
                  <div style={{
                    ...s.notiIcon,
                    ...(isUnread ? s.notiIconUnread : {})
                  }}>
                    {getNotificationIcon(n.type, n.isRead)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={s.notiTitleRow}>
                      <h4 style={{
                        ...s.notiTitle,
                        ...(isUnread ? s.notiTitleUnreadText : {})
                      }}>
                        {n.title}
                      </h4>
                      <span style={s.notiTime}>
                        {new Date(n.createAt || n.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                      </span>
                    </div>
                    <p style={s.notiBody}>{n.body}</p>
                  </div>
                  {isUnread && <div style={s.unreadDot} />}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

const s = {
  // Loading
  loadingPage: {
    minHeight: '100vh', background: 'var(--bg-dark)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  loadingBg: {
    position: 'absolute', inset: 0,
    backgroundImage: `radial-gradient(ellipse at 50% 50%, rgba(56,189,248,0.06) 0%, transparent 60%)`,
  },
  loadingContent: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
    position: 'relative', zIndex: 1,
  },
  loadingIconWrap: {
    width: '68px', height: '68px', borderRadius: '50%',
    background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  loadingText: { fontSize: '14px', color: '#64748B' },

  // Page
  page: {
    minHeight: '100vh', background: 'var(--bg-dark)',
    padding: '40px 24px 80px', position: 'relative', overflow: 'hidden',
  },
  mesh: {
    position: 'absolute', inset: 0,
    backgroundImage: `radial-gradient(ellipse at 30% 20%, rgba(56,189,248,0.08) 0%, transparent 50%),
                      radial-gradient(ellipse at 70% 80%, rgba(129,140,248,0.05) 0%, transparent 50%)`,
    pointerEvents: 'none',
  },
  container: { maxWidth: '720px', margin: '0 auto', position: 'relative', zIndex: 1 },
  backBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '8px 16px', borderRadius: '10px',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
    color: '#94A3B8', fontSize: '13px', fontWeight: '500',
    cursor: 'pointer', fontFamily: 'inherit', marginBottom: '24px',
    transition: 'all 0.2s',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '28px', flexWrap: 'wrap', gap: '16px',
  },
  title: {
    fontSize: '24px', fontWeight: '800', color: '#F8FAFC',
    display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px',
    letterSpacing: '-0.5px',
  },
  titleIconBox: {
    width: '40px', height: '40px', borderRadius: '10px',
    background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  subtitle: { fontSize: '13px', color: '#64748B', lineHeight: 1.6 },
  markAllBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '8px 16px', borderRadius: '10px',
    background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)',
    color: '#38BDF8', fontSize: '13px', fontWeight: '600',
    cursor: 'pointer', fontFamily: 'inherit',
    transition: 'all 0.2s',
  },

  // List Card
  listCard: {
    background: 'var(--bg-surface)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '18px', overflow: 'hidden',
    display: 'flex', flexDirection: 'column',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)',
  },
  notiItem: {
    display: 'flex', gap: '18px', padding: '18px 22px',
    borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer',
    position: 'relative', transition: 'all 0.2s',
    alignItems: 'flex-start', background: 'transparent',
  },
  notiItemUnread: {
    background: 'rgba(56,189,248,0.03)',
    borderLeft: '3px solid #38BDF8',
  },
  notiIcon: {
    width: '36px', height: '36px', borderRadius: '50%',
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  notiIconUnread: {
    background: 'rgba(56,189,248,0.08)',
    border: '1px solid rgba(56,189,248,0.2)',
  },
  notiTitleRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '4px', gap: '10px',
  },
  notiTitle: { fontSize: '14px', fontWeight: '500', color: '#94A3B8' },
  notiTitleUnreadText: { color: '#F8FAFC', fontWeight: '700' },
  notiTime: { fontSize: '11px', color: '#64748B' },
  notiBody: { fontSize: '13px', color: '#64748B', lineHeight: 1.6 },
  unreadDot: {
    width: '6px', height: '6px', borderRadius: '50%',
    backgroundColor: '#38BDF8', position: 'absolute',
    right: '22px', top: '50%', transform: 'translateY(-50%)',
    boxShadow: '0 0 10px #38BDF8',
  },

  // Empty state
  emptyState: {
    textAlign: 'center', padding: '64px 20px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px',
  },
  emptyIconWrap: {
    width: '64px', height: '64px', borderRadius: '50%',
    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  emptyText: { color: '#64748B', fontSize: '14px' },
  emptyBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '9px 18px', borderRadius: '8px', border: 'none',
    background: 'linear-gradient(135deg, #38BDF8, #818CF8)',
    color: '#0A0F1E', fontSize: '12px', fontWeight: '700',
    cursor: 'pointer', fontFamily: 'inherit',
  },
}

export default Notifications
