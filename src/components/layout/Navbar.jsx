import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Plane, MapPin, Calendar, Bell, LogOut } from 'lucide-react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>

        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <Plane size={20} color="#185FA5" />
          <span>Travel<span style={{ color: '#185FA5' }}>AI</span></span>
        </Link>

        {/* Links giữa */}
        <div style={styles.links}>
          <Link to="/" style={{ ...styles.link, ...(isActive('/') ? styles.linkActive : {}) }}>
            Trang chủ
          </Link>
          <Link to="/places" style={{ ...styles.link, ...(isActive('/places') ? styles.linkActive : {}) }}>
            <MapPin size={14} /> Địa điểm
          </Link>
          {user && (
            <Link to="/trips/create" style={{ ...styles.link, ...(isActive('/trips/create') ? styles.linkActive : {}) }}>
              <Calendar size={14} /> Tạo lịch trình
            </Link>
          )}
        </div>

        {/* Phải */}
        <div style={styles.right}>
          {user ? (
            <>
              <Link to="/notifications" style={styles.iconBtn}>
                <Bell size={18} color="#555" />
              </Link>
              <Link to="/profile" style={styles.userBtn}>
                <div style={styles.avatar}>
                  {user.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span style={styles.userName}>
                  {user.full_name?.split(' ').pop()}
                </span>
              </Link>
              <button onClick={handleLogout} style={styles.logoutBtn} title="Đăng xuất">
                <LogOut size={16} color="#888" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.loginBtn}>Đăng nhập</Link>
              <Link to="/register" style={styles.registerBtn}>Đăng ký</Link>
            </>
          )}
        </div>

      </div>
    </nav>
  )
}

const styles = {
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backgroundColor: '#fff',
    borderBottom: '1px solid #eee',
    boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
  },
  inner: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '24px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a18',
    textDecoration: 'none',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    flex: 1,
    justifyContent: 'center',
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#555',
    textDecoration: 'none',
  },
  linkActive: {
    backgroundColor: '#E6F1FB',
    color: '#185FA5',
    fontWeight: '500',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  iconBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    backgroundColor: '#f5f5f5',
  },
  userBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    padding: '4px 10px 4px 4px',
    borderRadius: '20px',
    backgroundColor: '#f5f5f5',
    textDecoration: 'none',
  },
  avatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#185FA5',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '600',
  },
  userName: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#333',
  },
  logoutBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#f5f5f5',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtn: {
    fontSize: '13px',
    color: '#555',
    textDecoration: 'none',
    padding: '6px 12px',
  },
  registerBtn: {
    fontSize: '13px',
    backgroundColor: '#185FA5',
    color: '#fff',
    textDecoration: 'none',
    padding: '7px 16px',
    borderRadius: '8px',
    fontWeight: '500',
  },
}

export default Navbar