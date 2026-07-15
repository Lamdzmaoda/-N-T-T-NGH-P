import { useState, useEffect } from 'react'
import { TrendingUp, DollarSign, Users, Plane, CheckCircle, BarChart2 } from 'lucide-react'
import dashboardService from '../../../services/dashboardService'

const StatisticsTab = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardService.getAdminDashboard()
        setStats(res.data.result)
      } catch (err) {
        console.error('Lỗi khi tải thống kê Admin:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div style={styles.loading}>
        <p>Đang tải dữ liệu báo cáo hệ thống...</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div style={styles.error}>
        <p>⚠️ Không thể tải dữ liệu báo cáo thống kê.</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Báo cáo & Thống kê hệ thống</h2>
      <p style={styles.subtitle}>Dữ liệu tổng hợp thời gian thực từ hệ thống du lịch Travel AI</p>

      {/* STAT CARDS */}
      <div style={styles.gridCards}>
        <div style={styles.card}>
          <div style={{ ...styles.iconBox, backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <DollarSign size={20} color="#10B981" />
          </div>
          <div>
            <div style={styles.cardVal}>{stats.totalRevenue ? `${stats.totalRevenue.toLocaleString('vi-VN')}đ` : '0đ'}</div>
            <div style={styles.cardLbl}>Tổng doanh thu dịch vụ</div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={{ ...styles.iconBox, backgroundColor: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)' }}>
            <Users size={20} color="#38BDF8" />
          </div>
          <div>
            <div style={styles.cardVal}>{stats.totalUsers || 0}</div>
            <div style={styles.cardLbl}>Thành viên đăng ký</div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={{ ...styles.iconBox, backgroundColor: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <Plane size={20} color="#F59E0B" />
          </div>
          <div>
            <div style={styles.cardVal}>{stats.totalTrips || 0}</div>
            <div style={styles.cardLbl}>Chuyến đi đã lập lịch</div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={{ ...styles.iconBox, backgroundColor: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)' }}>
            <CheckCircle size={20} color="#F43F5E" />
          </div>
          <div>
            <div style={styles.cardVal}>{stats.totalBookings || 0}</div>
            <div style={styles.cardLbl}>Giao dịch đặt chỗ</div>
          </div>
        </div>
      </div>

      {/* DETAILS ROW */}
      <div style={styles.row}>
        {/* POPULAR DESTINATIONS */}
        <div style={styles.sectionCard}>
          <h3 style={styles.sectionTitle}>📍 Thành phố phổ biến nhất</h3>
          <p style={styles.sectionDesc}>Xếp hạng dựa trên các yêu cầu lập lịch trình của người dùng</p>
          <div style={styles.destList}>
            {stats.popularDestinations && Object.keys(stats.popularDestinations).length > 0 ? (
              Object.entries(stats.popularDestinations)
                .sort((a, b) => b[1] - a[1])
                .map(([city, count], idx) => (
                  <div key={city} style={styles.destItem}>
                    <span style={styles.destIndex}>{idx + 1}</span>
                    <span style={styles.destName}>{city}</span>
                    <span style={styles.destBadge}>{count} chuyến đi</span>
                  </div>
                ))
            ) : (
              <p style={styles.emptyText}>Chưa có dữ liệu thống kê điểm đến.</p>
            )}
          </div>
        </div>

        {/* TRIP STATUS RATIO */}
        <div style={styles.sectionCard}>
          <h3 style={styles.sectionTitle}>📈 Trạng thái chuyến đi</h3>
          <p style={styles.sectionDesc}>Tỷ lệ các lịch trình hiện có trên hệ thống</p>
          <div style={styles.ratioList}>
            {stats.tripStatusRatio && Object.keys(stats.tripStatusRatio).length > 0 ? (
              Object.entries(stats.tripStatusRatio).map(([status, count]) => {
                const total = Object.values(stats.tripStatusRatio).reduce((a, b) => a + b, 0)
                const percent = total > 0 ? Math.round((count / total) * 100) : 0
                return (
                  <div key={status} style={styles.ratioItem}>
                    <div style={styles.ratioMeta}>
                      <span style={styles.ratioStatus}>
                        {status === 'PLANNING' ? '📝 Đang lên kế hoạch' : status === 'ONGOING' ? '🚀 Đang đi' : '✅ Hoàn thành'}
                      </span>
                      <span style={styles.ratioCount}>{count} ({percent}%)</span>
                    </div>
                    <div style={styles.progressBar}>
                      <div 
                        style={{ 
                          ...styles.progressFill, 
                          width: `${percent}%`,
                          backgroundColor: status === 'PLANNING' ? '#38BDF8' : status === 'ONGOING' ? '#F59E0B' : '#10B981'
                        }} 
                      />
                    </div>
                  </div>
                )
              })
            ) : (
              <p style={styles.emptyText}>Chưa có dữ liệu thống kê trạng thái.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '8px' },
  title: { fontSize: '20px', fontWeight: '800', color: '#F8FAFC', margin: 0, letterSpacing: '-0.5px' },
  subtitle: { fontSize: '13px', color: '#64748B', margin: '0 0 16px 0' },
  gridCards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' },
  card: { display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: 'var(--bg-surface)', padding: '20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' },
  iconBox: { width: '42px', height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardVal: { fontSize: '18px', fontWeight: '800', color: '#F8FAFC' },
  cardLbl: { fontSize: '11px', color: '#64748B', fontWeight: '500', marginTop: '2px' },
  row: { display: 'flex', flexWrap: 'wrap', gap: '24px' },
  sectionCard: { flex: 1, minWidth: '300px', backgroundColor: 'var(--bg-surface)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' },
  sectionTitle: { fontSize: '15px', fontWeight: '700', color: '#F8FAFC', margin: 0 },
  sectionDesc: { fontSize: '12px', color: '#64748B', margin: '4px 0 20px 0' },
  destList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  destItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  destIndex: { width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', color: '#94A3B8', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  destName: { flex: 1, fontSize: '13px', fontWeight: '600', color: '#F8FAFC' },
  destBadge: { backgroundColor: 'rgba(56,189,248,0.1)', color: '#38BDF8', fontSize: '12px', fontWeight: '600', padding: '2px 8px', borderRadius: '12px', border: '1px solid rgba(56,189,248,0.15)' },
  ratioList: { display: 'flex', flexDirection: 'column', gap: '20px' },
  ratioItem: { display: 'flex', flexDirection: 'column', gap: '6px' },
  ratioMeta: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '500' },
  ratioStatus: { color: '#F8FAFC' },
  ratioCount: { color: '#64748B' },
  progressBar: { height: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: '4px', transition: 'width 0.6s ease' },
  emptyText: { color: '#64748B', fontSize: '13px', textAlign: 'center', padding: '20px 0' },
  loading: { padding: '40px 0', textAlign: 'center', color: '#64748B', fontSize: '14px' },
  error: { padding: '40px 0', textAlign: 'center', color: '#F43F5E', fontSize: '14px' },
}

export default StatisticsTab
