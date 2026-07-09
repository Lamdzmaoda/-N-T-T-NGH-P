import { useState } from 'react'
import { MapPin, Layers, Users } from 'lucide-react'
import PlaceTab from './components/PlaceTab'
import CategoryTab from './components/CategoryTab'
import UserTab from './components/UserTab'

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('places') // 'places', 'categories' hoặc 'users'

  return (
    <div style={styles.container}>
      {/* SIDEBAR TABS */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <span style={styles.sidebarLogoIcon}>🛠️</span>
          <span style={styles.sidebarLogoText}>Admin Panel</span>
        </div>
        <div style={styles.sidebarMenu}>
          <button
            style={{ ...styles.menuItem, ...(activeTab === 'places' ? styles.menuItemActive : {}) }}
            onClick={() => setActiveTab('places')}
          >
            <MapPin size={18} /> Quản lý Địa điểm
          </button>
          <button
            style={{ ...styles.menuItem, ...(activeTab === 'categories' ? styles.menuItemActive : {}) }}
            onClick={() => setActiveTab('categories')}
          >
            <Layers size={18} /> Quản lý Danh mục
          </button>
          <button
            style={{ ...styles.menuItem, ...(activeTab === 'users' ? styles.menuItemActive : {}) }}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} /> Quản lý Thành viên
          </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div style={styles.content}>
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
    backgroundColor: '#F7F6F0',
  },
  sidebar: {
    width: '240px',
    backgroundColor: '#2A2925',
    color: '#fff',
    padding: '24px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  sidebarHeader: {
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  sidebarLogoIcon: { fontSize: '20px' },
  sidebarLogoText: { fontSize: '18px', fontWeight: '700', letterSpacing: '0.03em' },
  sidebarMenu: { display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 12px' },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#aaa',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
  },
  menuItemActive: {
    backgroundColor: '#185FA5',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: '32px 40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    overflowY: 'auto',
  },
}

export default Dashboard