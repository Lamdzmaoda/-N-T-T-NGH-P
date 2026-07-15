import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Plane, MapPin, Calendar, Bell, LogOut, Settings, Compass, Menu, X, List } from 'lucide-react'
import notificationService from '../../services/notificationService'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [unreadCount, setUnreadCount] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Detect scroll để thay đổi navbar style
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Đóng mobile menu khi chuyển trang
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  // 1. Tải số thông báo chưa đọc khi chuyển trang hoặc đổi user
  useEffect(() => {
    if (!user) {
      setUnreadCount(0)
      return
    }
    const fetchUnreadCount = async () => {
      try {
        const res = await notificationService.getUnreadCount()
        setUnreadCount(res.data.result || 0)
      } catch (err) {
        console.warn('Lỗi lấy số thông báo chưa đọc')
      }
    }
    fetchUnreadCount()
  }, [user, location.pathname])

  // 2. Duy trì kết nối SSE thời gian thực để lắng nghe thông báo mới
  useEffect(() => {
    if (!user) return

    const eventSource = new EventSource('/travel-ai-planner/notifications/subscribe', {
      withCredentials: true,
    })

    eventSource.addEventListener('NOTIFICATION', () => {
      // Khi nhận thông báo mới, gọi API cập nhật số lượng badge
      notificationService.getUnreadCount()
        .then((res) => setUnreadCount(res.data.result || 0))
        .catch(() => setUnreadCount((prev) => prev + 1))
    })

    eventSource.onerror = () => {
      console.warn('Kết nối SSE gặp sự cố, EventSource đang thử kết nối lại...')
    }

    return () => {
      eventSource.close()
    }
  }, [user])



  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isActive = (path) => {
    if (path === '/trips') return location.pathname === '/trips'
    return location.pathname === path
  }

  const navLinks = [
    { to: '/', label: 'Trang chủ', icon: null },
    { to: '/places', label: 'Địa điểm', icon: <MapPin size={13} /> },
    ...(user ? [{ to: '/trips', label: 'Chuyến đi của tôi', icon: <List size={13} /> }] : []),
    ...(user ? [{ to: '/trips/create', label: 'Tạo lịch trình', icon: <Calendar size={13} /> }] : []),
    ...(user?.roles?.some(r => r.name === 'ADMIN') ? [{ to: '/admin', label: 'Quản trị', icon: <Settings size={13} /> }] : []),
  ]

  return (
    <>
      <nav style={{ ...s.nav, ...(scrolled ? s.navScrolled : {}) }}>
        <div style={s.inner}>

          {/* Logo */}
          <Link to="/" style={s.logo}>
            <div style={s.logoIcon}>
              <Plane size={16} color="#0A0F1E" />
            </div>
            <span style={s.logoText}>
              Travel<span style={s.logoAccent}>AI</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div style={s.links}>
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                style={{ ...s.link, ...(isActive(link.to) ? s.linkActive : {}) }}
              >
                {link.icon && <span style={s.linkIcon}>{link.icon}</span>}
                {link.label}
                {isActive(link.to) && <span style={s.linkDot} />}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div style={s.right}>
            {user ? (
              <>
                {/* Bell */}
                <Link to="/notifications" style={s.iconBtn} title="Thông báo">
                  <Bell size={17} />
                  {unreadCount > 0 && (
                    <span style={s.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                  )}
                </Link>

                {/* User */}
                <Link to="/profile" style={s.userBtn}>
                  <div style={s.avatar}>
                    {user.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span style={s.userName}>{user.full_name?.split(' ').pop()}</span>
                </Link>

                {/* Logout */}
                <button onClick={handleLogout} style={s.iconBtn} title="Đăng xuất">
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={s.loginBtn}>Đăng nhập</Link>
                <Link to="/register" style={s.registerBtn}>
                  Đăng ký
                  <span style={s.registerArrow}>→</span>
                </Link>
              </>
            )}

            {/* Mobile menu toggle */}
            <button style={s.menuBtn} onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div style={s.mobileMenu}>
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} style={{ ...s.mobileLink, ...(isActive(link.to) ? s.mobileLinkActive : {}) }}>
                {link.icon && link.icon}
                {link.label}
              </Link>
            ))}
            {!user && (
              <div style={s.mobileDivider}>
                <Link to="/login" style={s.mobileLink}>Đăng nhập</Link>
                <Link to="/register" style={{ ...s.mobileLink, color: 'var(--accent-blue)' }}>Đăng ký</Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Gradient underline for active page */}
      <style>{`
        @media (max-width: 768px) {
          .nav-desktop-links { display: none !important; }
          .nav-mobile-btn { display: flex !important; }
        }
        @media (min-width: 769px) {
          .nav-mobile-btn { display: none !important; }
          .nav-mobile-menu { display: none !important; }
        }
      `}</style>
    </>
  )
}

const s = {
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    background: 'rgba(10,15,30,0.7)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
  },
  navScrolled: {
    background: 'rgba(10,15,30,0.95)',
    borderBottom: '1px solid rgba(56,189,248,0.12)',
    boxShadow: '0 4px 32px rgba(0,0,0,0.4)',
  },
  inner: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '20px',
  },

  // Logo
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
    flexShrink: 0,
  },
  logoIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #38BDF8, #818CF8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 16px rgba(56,189,248,0.4)',
  },
  logoText: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: '-0.3px',
  },
  logoAccent: {
    background: 'linear-gradient(135deg, #38BDF8, #818CF8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },

  // Nav links
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    flex: 1,
    justifyContent: 'center',
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '7px 13px',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '500',
    color: 'rgba(248,250,252,0.65)',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    position: 'relative',
    whiteSpace: 'nowrap',
  },
  linkActive: {
    color: '#38BDF8',
    background: 'rgba(56,189,248,0.1)',
    fontWeight: '600',
  },
  linkIcon: {
    display: 'flex',
    alignItems: 'center',
    opacity: 0.8,
  },
  linkDot: {
    position: 'absolute',
    bottom: '4px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '3px',
    height: '3px',
    borderRadius: '50%',
    background: '#38BDF8',
  },

  // Right section
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexShrink: 0,
  },

  iconBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(248,250,252,0.65)',
    textDecoration: 'none',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.08)',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.2s ease',
  },

  badge: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    background: 'linear-gradient(135deg, #EF4444, #DC2626)',
    color: '#fff',
    fontSize: '9px',
    fontWeight: '700',
    borderRadius: '50%',
    width: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #0A0F1E',
  },

  userBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 12px 4px 4px',
    borderRadius: '20px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.08)',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
  },
  avatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #38BDF8, #818CF8)',
    color: '#0A0F1E',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '700',
    flexShrink: 0,
  },
  userName: {
    fontSize: '13px',
    fontWeight: '500',
    color: 'rgba(248,250,252,0.9)',
  },

  loginBtn: {
    fontSize: '13px',
    fontWeight: '500',
    color: 'rgba(248,250,252,0.7)',
    textDecoration: 'none',
    padding: '7px 14px',
    borderRadius: '10px',
    transition: 'color 0.2s ease',
  },

  registerBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#0A0F1E',
    textDecoration: 'none',
    padding: '8px 16px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #38BDF8, #818CF8)',
    boxShadow: '0 0 16px rgba(56,189,248,0.3)',
    transition: 'all 0.2s ease',
  },
  registerArrow: {
    fontSize: '14px',
  },

  menuBtn: {
    display: 'none',
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: 'rgba(248,250,252,0.8)',
    cursor: 'pointer',
  },

  // Mobile menu
  mobileMenu: {
    padding: '12px 24px 16px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  mobileLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '500',
    color: 'rgba(248,250,252,0.7)',
    textDecoration: 'none',
    transition: 'all 0.2s',
  },
  mobileLinkActive: {
    color: '#38BDF8',
    background: 'rgba(56,189,248,0.08)',
  },
  mobileDivider: {
    borderTop: '1px solid rgba(255,255,255,0.06)',
    marginTop: '8px',
    paddingTop: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
}

export default Navbar