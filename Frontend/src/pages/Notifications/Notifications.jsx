import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckSquare, Trash2, ArrowLeft, Loader2, Info, Calendar, DollarSign, Award } from 'lucide-react'
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
      // Cập nhật local state
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

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'BOOKING': return <Calendar size={16} color="#185FA5" />
      case 'PAYMENT': return <DollarSign size={16} color="#3B6D11" />
      case 'SYSTEM': return <Award size={16} color="#854F0B" />
      default: return <Info size={16} color="#555" />
    }
  }

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <Loader2 size={36} color="#185FA5" className="animate-spin" />
        <p style={{ marginTop: '12px', color: '#666' }}>Đang tải thông báo từ hệ thống...</p>
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

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}><Bell size={24} color="#185FA5" /> Thông báo hệ thống</h1>
            <p style={styles.subtitle}>Cập nhật thông tin chi tiết về các giao dịch đặt phòng, thanh toán và lịch trình của bạn</p>
          </div>
          {notifications.some(n => !n.isRead) && (
            <button style={styles.markAllBtn} onClick={handleMarkAllAsRead}>
              <CheckSquare size={14} /> Đọc tất cả
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div style={styles.listCard}>
          {notifications.length === 0 ? (
            <div style={styles.emptyState}>
              <Bell size={40} color="#ccc" style={{ marginBottom: '12px' }} />
              <p>Bạn chưa nhận được thông báo nào từ TravelAI.</p>
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                style={{
                  ...styles.notiItem,
                  ...(!n.isRead ? styles.notiItemUnread : {})
                }}
                onClick={() => !n.isRead && handleMarkAsRead(n.id)}
              >
                <div style={{
                  ...styles.notiIcon,
                  ...(!n.isRead ? styles.notiIconUnread : {})
                }}>
                  {getNotificationIcon(n.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={styles.notiTitleRow}>
                    <h4 style={{
                      ...styles.notiTitle,
                      ...(!n.isRead ? styles.notiTitleUnreadText : {})
                    }}>
                      {n.title}
                    </h4>
                    <span style={styles.notiTime}>
                      {new Date(n.createAt || n.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                    </span>
                  </div>
                  <p style={styles.notiBody}>{n.body}</p>
                </div>
                {!n.isRead && <div style={styles.unreadDot} />}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f2f0ea', padding: '40px 24px' },
  container: { maxWidth: '720px', margin: '0 auto' },
  backBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    backgroundColor: 'transparent', border: 'none',
    color: '#666', fontSize: '13px', fontWeight: '500',
    cursor: 'pointer', fontFamily: 'inherit', marginBottom: '20px',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '24px', flexWrap: 'wrap', gap: '12px',
  },
  title: {
    fontSize: '24px', fontWeight: '800', color: '#1a1a18',
    display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px',
  },
  subtitle: { fontSize: '13px', color: '#666', lineHeight: 1.5 },
  markAllBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '8px 14px', backgroundColor: '#fff', border: '1px solid #ddd',
    borderRadius: '8px', fontSize: '13px', fontWeight: '600',
    color: '#185FA5', cursor: 'pointer', fontFamily: 'inherit',
    transition: 'all 0.2s',
  },
  listCard: {
    backgroundColor: '#fff', borderRadius: '16px',
    border: '1px solid #e8e7e1', boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
    overflow: 'hidden', display: 'flex', flexDirection: 'column',
  },
  notiItem: {
    display: 'flex', gap: '16px', padding: '16px 20px',
    borderBottom: '1px solid #eee', cursor: 'pointer',
    position: 'relative', transition: 'all 0.2s',
    alignItems: 'flex-start',
  },
  notiItemUnread: { backgroundColor: '#F4F8FC' },
  notiIcon: {
    width: '36px', height: '36px', borderRadius: '50%',
    backgroundColor: '#f5f5f5', display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  notiIconUnread: { backgroundColor: '#E6F1FB' },
  notiTitleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', gap: '10px' },
  notiTitle: { fontSize: '14px', fontWeight: '650', color: '#555' },
  notiTitleUnreadText: { color: '#1a1a18', fontWeight: '750' },
  notiTime: { fontSize: '11px', color: '#aaa' },
  notiBody: { fontSize: '13px', color: '#666', lineHeight: 1.5 },
  unreadDot: {
    width: '8px', height: '8px', borderRadius: '50%',
    backgroundColor: '#185FA5', position: 'absolute',
    right: '20px', top: '50%', transform: 'translateY(-50%)',
  },
  emptyState: { textAlign: 'center', padding: '60px 20px', color: '#999', fontSize: '14px' },
  loadingPage: {
    minHeight: '100vh', backgroundColor: '#f2f0ea',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  },
}

export default Notifications
