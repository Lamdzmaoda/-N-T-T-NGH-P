import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { MapPin, Calendar, Star, ArrowRight, Sparkles, Bot, Cloud, Heart, Save, ChevronRight } from 'lucide-react'

const DESTINATIONS = [
  {
    id: 1, name: 'Hà Nội',
    description: 'Phố cổ · Ẩm thực · Lịch sử',
    img: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&q=80',
    rating: 4.9, reviews: 312, price: 'từ 800k/ngày', city: 'Hà Nội', tag: 'HOT',
  },
  {
    id: 2, name: 'Đà Nẵng',
    description: 'Biển đẹp · Check-in · Hải sản',
    img: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&q=80',
    rating: 4.8, reviews: 241, price: 'từ 1.2tr/ngày', city: 'Đà Nẵng', tag: 'PHỔ BIẾN',
  },
  {
    id: 3, name: 'Đà Lạt',
    description: 'Thiên nhiên · Café · Mát mẻ',
    img: 'https://images.unsplash.com/photo-1528702748617-c64d49f918af?w=600&q=80',
    rating: 4.7, reviews: 198, price: 'từ 700k/ngày', city: 'Đà Lạt', tag: null,
  },
  {
    id: 4, name: 'Hội An',
    description: 'Phố cổ · Đèn lồng · Ẩm thực',
    img: 'https://images.unsplash.com/photo-1540779691674-b4e9db1a3e63?w=600&q=80',
    rating: 4.8, reviews: 276, price: 'từ 900k/ngày', city: 'Hội An', tag: 'MỚI',
  },
  {
    id: 5, name: 'Phú Quốc',
    description: 'Biển xanh · Nghỉ dưỡng · Sunset',
    img: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=600&q=80',
    rating: 4.9, reviews: 334, price: 'từ 1.5tr/ngày', city: 'Phú Quốc', tag: 'HOT',
  },
  {
    id: 6, name: 'Sapa',
    description: 'Núi rừng · Ruộng bậc thang · Trekking',
    img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
    rating: 4.7, reviews: 189, price: 'từ 600k/ngày', city: 'Sapa', tag: null,
  },
]

const FEATURES = [
  {
    icon: '🤖', color: '#38BDF8', bg: 'rgba(56,189,248,0.08)', border: 'rgba(56,189,248,0.2)',
    title: 'Lịch trình cá nhân hóa',
    desc: 'AI tự động sắp xếp địa điểm gần nhau theo ngày, tối ưu thời gian di chuyển cho bạn.',
  },
  {
    icon: '⛅', color: '#2DD4BF', bg: 'rgba(45,212,191,0.08)', border: 'rgba(45,212,191,0.2)',
    title: 'Thời tiết thực tế',
    desc: 'Tự động điều chỉnh hoạt động ngoài trời theo dự báo thời tiết từng ngày chính xác.',
  },
  {
    icon: '⭐', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)',
    title: 'Đánh giá cộng đồng',
    desc: 'Hơn 5.800 đánh giá thực từ người đi thực — không quảng cáo, không giả mạo.',
  },
  {
    icon: '💾', color: '#818CF8', bg: 'rgba(129,140,248,0.08)', border: 'rgba(129,140,248,0.2)',
    title: 'Lưu & chia sẻ dễ dàng',
    desc: 'Lưu lịch trình yêu thích, chỉnh sửa và chia sẻ với bạn bè chỉ trong một cú click.',
  },
]

const STATS = [
  { num: '248', label: 'Địa điểm kiểm duyệt', suffix: '+' },
  { num: '1.2k', label: 'Người dùng tin tưởng', suffix: '' },
  { num: '63', label: 'Tỉnh thành phủ sóng', suffix: '' },
  { num: '3.4k', label: 'Lịch trình đã tạo', suffix: '+' },
]

// ── Floating particles for hero ─────────────────────────
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  size: Math.random() * 4 + 2,
  delay: Math.random() * 8,
  duration: Math.random() * 8 + 10,
  opacity: Math.random() * 0.4 + 0.1,
}))

const Home = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [hoveredCard, setHoveredCard] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  const tagColor = (tag) => {
    if (tag === 'HOT') return { bg: 'rgba(239,68,68,0.9)', color: '#fff' }
    if (tag === 'PHỔ BIẾN') return { bg: 'rgba(56,189,248,0.9)', color: '#fff' }
    if (tag === 'MỚI') return { bg: 'rgba(45,212,191,0.9)', color: '#0A0F1E' }
    return { bg: 'transparent', color: 'transparent' }
  }

  return (
    <div style={s.page}>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section style={s.hero}>
        {/* Background image */}
        <div style={s.heroBg} />
        {/* Dark gradient overlay */}
        <div style={s.heroOverlay} />
        {/* Animated gradient mesh */}
        <div style={s.heroMesh} />

        {/* Floating particles */}
        {PARTICLES.map(p => (
          <div key={p.id} style={{
            position: 'absolute',
            left: `${p.x}%`,
            bottom: '-10px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: '50%',
            background: p.id % 3 === 0 ? '#38BDF8' : p.id % 3 === 1 ? '#818CF8' : '#F59E0B',
            opacity: p.opacity,
            animation: `particle-drift ${p.duration}s ${p.delay}s ease-in infinite`,
            pointerEvents: 'none',
          }} />
        ))}

        {/* Hero content */}
        <div style={{ ...s.heroContent, opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(30px)', transition: 'all 0.8s cubic-bezier(0.4,0,0.2,1)' }}>
          {/* Badge */}
          <div style={s.heroBadge} className="animate-fade-in-up">
            <Sparkles size={12} color="#F59E0B" />
            <span>Powered by AI · Lên kế hoạch trong vài giây</span>
          </div>

          <h1 style={s.heroTitle} className="animate-fade-in-up delay-100">
            Khám phá Việt Nam<br />
            theo cách của{' '}
            <span style={s.heroAccent}>bạn</span>
          </h1>

          <p style={s.heroSub} className="animate-fade-in-up delay-200">
            Nhập điểm đến, số ngày và sở thích — AI tạo lịch trình<br />
            cá nhân hóa hoàn toàn chỉ trong vài giây.
          </p>

          {/* Search box */}
          <div style={s.searchBox} className="animate-fade-in-up delay-300">
            <div style={s.searchRow}>
              <div style={s.searchField}>
                <span style={s.searchLabel}><MapPin size={10} /> ĐIỂM ĐẾN</span>
                <span style={s.searchVal}>Hà Nội, Đà Nẵng, Đà Lạt...</span>
              </div>
              <div style={s.searchDivider} />
              <div style={s.searchField}>
                <span style={s.searchLabel}><Calendar size={10} /> SỐ NGÀY</span>
                <span style={s.searchVal}>2, 3, 5 ngày...</span>
              </div>
            </div>
            <button
              style={s.searchBtn}
              onClick={() => navigate(user ? '/trips/create' : '/login')}
            >
              <Sparkles size={15} />
              Lên lịch trình ngay với AI
              <ChevronRight size={15} style={{ marginLeft: 'auto' }} />
            </button>
          </div>

          <p style={s.heroNote} className="animate-fade-in-up delay-400">
            🔥 Đã có hơn <strong style={{ color: '#F59E0B' }}>3.400</strong> lịch trình được tạo tuần này
          </p>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────── */}
      <section style={s.statsSection}>
        <div style={s.statsInner}>
          {STATS.map((stat, i) => (
            <div key={i} style={s.statItem}>
              <div style={s.statNum}>
                {stat.num}<span style={s.statSuffix}>{stat.suffix}</span>
              </div>
              <div style={s.statLbl}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DESTINATIONS ─────────────────────────────────── */}
      <section style={s.section}>
        <div style={s.sectionHeader}>
          <div>
            <div style={s.sectionEyebrow}>✈️ Khám phá</div>
            <h2 style={s.sectionTitle}>Điểm đến phổ biến</h2>
          </div>
          <Link to="/places" style={s.seeAll}>
            Xem tất cả <ArrowRight size={14} />
          </Link>
        </div>

        <div style={s.destGrid}>
          {DESTINATIONS.map((dest, i) => {
            const tColor = tagColor(dest.tag)
            return (
              <div
                key={dest.id}
                style={{
                  ...s.destCard,
                  ...(hoveredCard === dest.id ? s.destCardHover : {}),
                  animationDelay: `${i * 0.08}s`,
                }}
                className="animate-fade-in-up"
                onClick={() => navigate(`/places?city=${dest.city}`)}
                onMouseEnter={() => setHoveredCard(dest.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div style={s.destImgWrap}>
                  <img
                    src={dest.img}
                    alt={dest.name}
                    style={{
                      ...s.destImg,
                      transform: hoveredCard === dest.id ? 'scale(1.08)' : 'scale(1)',
                    }}
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                  <div style={s.destImgOverlay} />
                  {dest.tag && (
                    <span style={{ ...s.destTag, background: tColor.bg, color: tColor.color }}>
                      {dest.tag}
                    </span>
                  )}
                  <div style={s.destNameOverlay}>
                    <span style={s.destName}>{dest.name}</span>
                    <span style={s.destDesc}>{dest.description}</span>
                  </div>
                </div>
                <div style={s.destBody}>
                  <div style={s.destMeta}>
                    <span style={s.destRating}>
                      <Star size={11} fill="#F59E0B" color="#F59E0B" />
                      {dest.rating} · <span style={{ color: '#64748B' }}>{dest.reviews} đánh giá</span>
                    </span>
                    <span style={s.destPrice}>{dest.price}</span>
                  </div>
                  <div style={{ ...s.destCta, opacity: hoveredCard === dest.id ? 1 : 0, marginTop: hoveredCard === dest.id ? '10px' : '0' }}>
                    <span style={s.destCtaText}>Xem địa điểm <ArrowRight size={12} /></span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section style={s.featureSection}>
        <div style={s.featureInner}>
          <div style={s.sectionHeader}>
            <div>
              <div style={{ ...s.sectionEyebrow, color: '#38BDF8' }}>💡 Tại sao chọn chúng tôi</div>
              <h2 style={s.sectionTitle}>TravelAI làm được gì?</h2>
            </div>
          </div>
          <div style={s.featGrid}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ ...s.featCard, border: `1px solid ${f.border}`, animationDelay: `${i * 0.1}s` }} className="animate-fade-in-up">
                <div style={{ ...s.featIconWrap, background: f.bg }}>
                  <span style={{ fontSize: '24px' }}>{f.icon}</span>
                </div>
                <div>
                  <h4 style={s.featTitle}>{f.title}</h4>
                  <p style={s.featDesc}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI CTA BANNER ─────────────────────────────────── */}
      <section style={s.ctaSection}>
        <div style={s.ctaInner}>
          <div style={s.ctaLeft}>
            <div style={s.ctaIconWrap}>
              <Sparkles size={28} color="#F59E0B" />
            </div>
            <div>
              <h3 style={s.ctaTitle}>Sẵn sàng lên đường chưa?</h3>
              <p style={s.ctaSub}>Nhập yêu cầu, AI phân tích sở thích và tạo lịch trình tối ưu chỉ trong vài giây</p>
            </div>
          </div>
          <button
            style={s.ctaBtn}
            onClick={() => navigate(user ? '/trips/create' : '/login')}
          >
            <Sparkles size={15} />
            Thử ngay miễn phí
          </button>
        </div>
      </section>

      {/* ── FOOTER MINI ───────────────────────────────────── */}
      <footer style={s.footer}>
        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
          © 2026 TravelAI — Lên lịch trình thông minh bằng trí tuệ nhân tạo
        </span>
      </footer>

    </div>
  )
}

const s = {
  page: {
    minHeight: '100vh',
    background: 'var(--bg-dark)',
  },

  // Hero
  hero: {
    position: 'relative',
    minHeight: '560px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroBg: {
    position: 'absolute', inset: 0,
    backgroundImage: 'url(https://images.unsplash.com/photo-1557750255-c76072a7aad1?w=1600&q=80)',
    backgroundSize: 'cover',
    backgroundPosition: 'center 30%',
    filter: 'brightness(0.35)',
  },
  heroOverlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(160deg, rgba(10,15,30,0.8) 0%, rgba(10,15,30,0.3) 50%, rgba(10,15,30,0.9) 100%)',
  },
  heroMesh: {
    position: 'absolute', inset: 0,
    backgroundImage: `radial-gradient(ellipse at 20% 80%, rgba(56,189,248,0.12) 0%, transparent 50%),
                      radial-gradient(ellipse at 80% 20%, rgba(129,140,248,0.12) 0%, transparent 50%)`,
    pointerEvents: 'none',
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
    textAlign: 'center',
    padding: '80px 24px 60px',
    width: '100%',
    maxWidth: '720px',
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: '20px',
    background: 'rgba(245,158,11,0.12)',
    border: '1px solid rgba(245,158,11,0.3)',
    fontSize: '11px',
    fontWeight: '600',
    color: '#F59E0B',
    marginBottom: '20px',
    letterSpacing: '0.02em',
  },
  heroTitle: {
    fontSize: '52px',
    fontWeight: '900',
    lineHeight: 1.15,
    marginBottom: '18px',
    color: '#F8FAFC',
    letterSpacing: '-1px',
  },
  heroAccent: {
    background: 'linear-gradient(135deg, #38BDF8, #818CF8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  heroSub: {
    fontSize: '16px',
    color: 'rgba(248,250,252,0.72)',
    lineHeight: 1.75,
    marginBottom: '36px',
  },
  searchBox: {
    maxWidth: '520px',
    margin: '0 auto 18px',
    background: 'rgba(15,23,42,0.85)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    padding: '16px 16px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(56,189,248,0.08)',
  },
  searchRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1px 1fr',
    gap: '12px',
    marginBottom: '14px',
    alignItems: 'center',
  },
  searchDivider: {
    width: '1px', height: '36px',
    background: 'rgba(255,255,255,0.08)',
    margin: '0 auto',
  },
  searchField: { display: 'flex', flexDirection: 'column', gap: '5px', padding: '0 8px' },
  searchLabel: {
    fontSize: '10px', color: '#64748B', fontWeight: '700',
    letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '4px',
    textTransform: 'uppercase',
  },
  searchVal: { fontSize: '14px', color: 'rgba(248,250,252,0.5)', fontWeight: '400' },
  searchBtn: {
    width: '100%', padding: '13px 16px',
    background: 'linear-gradient(135deg, #38BDF8, #818CF8)',
    color: '#0A0F1E', border: 'none', borderRadius: '10px',
    fontSize: '14px', fontWeight: '700', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '8px',
    fontFamily: 'inherit',
    boxShadow: '0 0 24px rgba(56,189,248,0.35)',
    transition: 'all 0.2s ease',
  },
  heroNote: {
    fontSize: '13px',
    color: 'rgba(248,250,252,0.5)',
    letterSpacing: '0.01em',
  },

  // Stats
  statsSection: {
    background: 'rgba(15,23,42,0.8)',
    backdropFilter: 'blur(16px)',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  statsInner: {
    maxWidth: '1200px', margin: '0 auto',
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
  },
  statItem: {
    padding: '28px 20px',
    textAlign: 'center',
    borderRight: '1px solid rgba(255,255,255,0.06)',
  },
  statNum: {
    fontSize: '28px', fontWeight: '800',
    background: 'linear-gradient(135deg, #38BDF8, #818CF8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '4px',
  },
  statSuffix: { fontSize: '22px', fontWeight: '700' },
  statLbl: { fontSize: '12px', color: '#64748B', fontWeight: '500' },

  // Destinations
  section: {
    padding: '56px 24px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  sectionHeader: {
    display: 'flex', alignItems: 'flex-end',
    justifyContent: 'space-between', marginBottom: '28px',
  },
  sectionEyebrow: {
    fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em',
    textTransform: 'uppercase', color: '#38BDF8', marginBottom: '6px',
  },
  sectionTitle: { fontSize: '24px', fontWeight: '800', color: '#F8FAFC' },
  seeAll: {
    display: 'flex', alignItems: 'center', gap: '5px',
    fontSize: '13px', color: '#38BDF8', fontWeight: '600',
    textDecoration: 'none', transition: 'gap 0.2s ease',
    paddingBottom: '4px',
  },
  destGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '18px',
  },
  destCard: {
    background: 'var(--bg-surface)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s, border-color 0.3s',
  },
  destCardHover: {
    transform: 'translateY(-6px)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(56,189,248,0.2)',
    borderColor: 'rgba(56,189,248,0.25)',
  },
  destImgWrap: {
    position: 'relative', height: '180px', overflow: 'hidden',
  },
  destImg: {
    width: '100%', height: '100%', objectFit: 'cover', display: 'block',
    transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1)',
  },
  destImgOverlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)',
  },
  destTag: {
    position: 'absolute', top: '10px', left: '10px',
    fontSize: '9px', fontWeight: '800', letterSpacing: '0.08em',
    padding: '3px 8px', borderRadius: '4px',
    textTransform: 'uppercase',
  },
  destNameOverlay: {
    position: 'absolute', bottom: '12px', left: '14px', right: '14px',
    display: 'flex', flexDirection: 'column', gap: '3px',
  },
  destName: {
    color: '#F8FAFC', fontSize: '18px', fontWeight: '800',
    textShadow: '0 1px 4px rgba(0,0,0,0.5)',
  },
  destDesc: {
    color: 'rgba(248,250,252,0.7)', fontSize: '11px', fontWeight: '500',
  },
  destBody: { padding: '14px 16px' },
  destMeta: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  destRating: {
    fontSize: '12px', color: '#F59E0B',
    display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600',
  },
  destPrice: {
    fontSize: '12px', color: '#38BDF8', fontWeight: '600',
  },
  destCta: {
    transition: 'opacity 0.3s, margin-top 0.3s',
  },
  destCtaText: {
    fontSize: '12px', color: '#38BDF8', fontWeight: '600',
    display: 'flex', alignItems: 'center', gap: '4px',
  },

  // Features
  featureSection: {
    background: 'rgba(15,23,42,0.5)',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    padding: '56px 24px',
  },
  featureInner: { maxWidth: '1200px', margin: '0 auto' },
  featGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  featCard: {
    background: 'var(--bg-surface)',
    borderRadius: '14px',
    padding: '22px',
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
    transition: 'transform 0.3s, box-shadow 0.3s',
    cursor: 'default',
  },
  featIconWrap: {
    width: '52px', height: '52px', borderRadius: '12px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  featTitle: { fontSize: '15px', fontWeight: '700', marginBottom: '6px', color: '#F8FAFC' },
  featDesc: { fontSize: '13px', color: '#64748B', lineHeight: 1.65 },

  // CTA Banner
  ctaSection: {
    padding: '32px 24px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  ctaInner: {
    background: 'linear-gradient(135deg, rgba(56,189,248,0.12) 0%, rgba(129,140,248,0.12) 100%)',
    border: '1px solid rgba(56,189,248,0.2)',
    borderRadius: '20px',
    padding: '28px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '24px',
    backdropFilter: 'blur(8px)',
  },
  ctaLeft: { display: 'flex', alignItems: 'center', gap: '18px' },
  ctaIconWrap: {
    width: '56px', height: '56px', borderRadius: '14px', flexShrink: 0,
    background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    animation: 'float 4s ease-in-out infinite',
  },
  ctaTitle: { fontSize: '18px', fontWeight: '800', color: '#F8FAFC', marginBottom: '4px' },
  ctaSub: { fontSize: '13px', color: '#64748B', lineHeight: 1.6 },
  ctaBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '13px 24px', borderRadius: '12px', border: 'none',
    background: 'linear-gradient(135deg, #38BDF8, #818CF8)',
    color: '#0A0F1E', fontSize: '14px', fontWeight: '700',
    cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
    boxShadow: '0 0 24px rgba(56,189,248,0.3)',
    transition: 'all 0.2s ease',
    flexShrink: 0,
  },

  // Footer
  footer: {
    textAlign: 'center',
    padding: '24px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
}

export default Home