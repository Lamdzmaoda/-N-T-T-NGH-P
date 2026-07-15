import { useState } from 'react'
import { MapPin, Layers, Users, BarChart2 } from 'lucide-react'
import PlaceTab from './components/PlaceTab'
import CategoryTab from './components/CategoryTab'
import UserTab from './components/UserTab'
import StatisticsTab from './components/StatisticsTab'

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('statistics') // 'statistics', 'places', 'categories' hoặc 'users'

  return (
    <div style={styles.container}>
      <div style={styles.mesh} />
      
      {/* SIDEBAR TABS */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <span style={styles.sidebarLogoIcon}>🛠️</span>
          <span style={styles.sidebarLogoText}>Admin Panel</span>
        </div>
        <div style={styles.sidebarMenu}>
          <button
            style={{ ...styles.menuItem, ...(activeTab === 'statistics' ? styles.menuItemActive : {}) }}
            onClick={() => setActiveTab('statistics')}
          >
            <BarChart2 size={16} /> Báo cáo & Thống kê
          </button>
          <button
            style={{ ...styles.menuItem, ...(activeTab === 'places' ? styles.menuItemActive : {}) }}
            onClick={() => setActiveTab('places')}
          >
            <MapPin size={16} /> Quản lý Địa điểm
          </button>
          <button
            style={{ ...styles.menuItem, ...(activeTab === 'categories' ? styles.menuItemActive : {}) }}
            onClick={() => setActiveTab('categories')}
          >
            <Layers size={16} /> Quản lý Danh mục
          </button>
          <button
            style={{ ...styles.menuItem, ...(activeTab === 'users' ? styles.menuItemActive : {}) }}
            onClick={() => setActiveTab('users')}
          >
            <Users size={16} /> Quản lý Thành viên
          </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div style={styles.content}>
        {activeTab === 'statistics' && <StatisticsTab />}
        {activeTab === 'places' && <PlaceTab />}
        {activeTab === 'categories' && <CategoryTab />}
        {activeTab === 'users' && <UserTab />}
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    minHeight: 'calc(100vh - 60px)',
    background: 'var(--bg-dark)',
    position: 'relative',
    overflow: 'hidden',
  },
  mesh: {
    position: 'absolute', inset: 0,
    backgroundImage: `radial-gradient(ellipse at 50% 15%, rgba(56,189,248,0.05) 0%, transparent 60%)`,
    pointerEvents: 'none',
  },
  sidebar: {
    width: '240px',
    background: 'var(--bg-surface)',
    borderRight: '1px solid rgba(255,255,255,0.07)',
    color: '#F8FAFC',
    padding: '32px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
    position: 'relative',
    zIndex: 2,
  },
  sidebarHeader: {
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  sidebarLogoIcon: { fontSize: '20px' },
  sidebarLogoText: { fontSize: '16px', fontWeight: '800', letterSpacing: '0.05em', color: '#F8FAFC' },
  sidebarMenu: { display: 'flex', flexDirection: 'column', gap: '6px', padding: '0 14px' },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#64748B',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
  },
  menuItemActive: {
    background: 'linear-gradient(135deg, #38BDF8, #818CF8)',
    color: '#0A0F1E',
    boxShadow: '0 0 16px rgba(56,189,248,0.25)',
  },
  content: {
    flex: 1,
    padding: '36px 40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
    overflowY: 'auto',
    position: 'relative',
    zIndex: 1,
    maxHeight: 'calc(100vh - 60px)',
  },
}

export default Dashboard