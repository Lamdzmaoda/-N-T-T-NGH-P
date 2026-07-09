import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { MapPin, Calendar, Star, ArrowRight, Sparkles, Bot, Cloud, Heart, Save } from 'lucide-react'

const DESTINATIONS = [
  {
    id: 1, name: 'Hà Nội',
    description: 'Phố cổ · Ẩm thực · Lịch sử',
    img: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=500&q=80',
    rating: 4.9, reviews: 312, price: 'từ 800k/ngày', city: 'Hà Nội',
  },
  {
    id: 2, name: 'Đà Nẵng',
    description: 'Biển đẹp · Check-in · Hải sản',
    img: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=500&q=80',
    rating: 4.8, reviews: 241, price: 'từ 1.2tr/ngày', city: 'Đà Nẵng',
  },
  {
    id: 3, name: 'Đà Lạt',
    description: 'Thiên nhiên · Café · Mát mẻ',
    img: 'https://images.unsplash.com/photo-1528702748617-c64d49f918af?w=500&q=80',
    rating: 4.7, reviews: 198, price: 'từ 700k/ngày', city: 'Đà Lạt',
  },
  {
    id: 4, name: 'Hội An',
    description: 'Phố cổ · Đèn lồng · Ẩm thực',
    img: 'https://images.unsplash.com/photo-1540779691674-b4e9db1a3e63?w=500&q=80',
    rating: 4.8, reviews: 276, price: 'từ 900k/ngày', city: 'Hội An',
  },
  {
    id: 5, name: 'Phú Quốc',
    description: 'Biển xanh · Nghỉ dưỡng · Sunset',
    img: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=500&q=80',
    rating: 4.9, reviews: 334, price: 'từ 1.5tr/ngày', city: 'Phú Quốc',
  },
  {
    id: 6, name: 'Sapa',
    description: 'Núi rừng · Ruộng bậc thang · Trekking',
    img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&q=80',
    rating: 4.7, reviews: 189, price: 'từ 600k/ngày', city: 'Sapa',
  },
]

const FEATURES = [
  { icon: <Bot size={22} color="#185FA5" />, bg: '#E6F1FB', title: 'Lịch trình cá nhân hóa', desc: 'AI tự động sắp xếp địa điểm gần nhau theo ngày, tối ưu thời gian di chuyển' },
  { icon: <Cloud size={22} color="#3B6D11" />, bg: '#EAF3DE', title: 'Thời tiết thực tế', desc: 'Tự động điều chỉnh hoạt động ngoài trời theo dự báo thời tiết từng ngày' },
  { icon: <Star size={22} color="#854F0B" />, bg: '#FAEEDA', title: 'Đánh giá từ cộng đồng', desc: 'Hơn 5.800 đánh giá thật từ người đi thật, không quảng cáo' },
  { icon: <Save size={22} color="#534AB7" />, bg: '#EEEDFE', title: 'Lưu & chia sẻ dễ dàng', desc: 'Lưu lịch trình yêu thích, chỉnh sửa và chia sẻ với bạn bè' },
]

const Home = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div style={styles.page}>

      {/* HERO */}
      <section style={styles.hero}>
        <div style={styles.heroOverlay} />
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>
            Khám phá Việt Nam<br />
            theo cách của <span style={styles.heroAccent}>bạn</span>
          </h1>
          <p style={styles.heroSub}>
            Nhập điểm đến, số ngày và sở thích — AI tạo lịch trình<br />
            cá nhân hóa hoàn toàn chỉ trong vài giây.
          </p>
          <div style={styles.searchBox}>
            <div style={styles.searchRow}>
              <div style={styles.searchField}>
                <span style={styles.searchLabel}><MapPin size={11} /> ĐIỂM ĐẾN</span>
                <span style={styles.searchVal}>Hà Nội, Đà Nẵng, Đà Lạt...</span>
              </div>
              <div style={styles.searchDivider} />
              <div style={styles.searchField}>
                <span style={styles.searchLabel}><Calendar size={11} /> SỐ NGÀY</span>
                <span style={styles.searchVal}>2, 3, 5 ngày...</span>
              </div>
            </div>
            <button
              style={styles.searchBtn}
              onClick={() => navigate(user ? '/trips/create' : '/login')}
            >
              <Sparkles size={16} /> Lên lịch trình ngay
            </button>
          </div>
          <p style={styles.heroNote}>Đã có hơn 3.400 lịch trình được tạo tuần này</p>
        </div>
      </section>

      {/* STATS */}
      <section style={styles.stats}>
        <div style={styles.statItem}>
          <div style={styles.statNum}>248</div>
          <div style={styles.statLbl}>Địa điểm được kiểm duyệt</div>
        </div>
        <div style={{ ...styles.statItem, borderLeft: '1px solid #eee', borderRight: '1px solid #eee' }}>
          <div style={styles.statNum}>1.2k</div>
          <div style={styles.statLbl}>Người dùng tin tưởng</div>
        </div>
        <div style={styles.statItem}>
          <div style={styles.statNum}>63</div>
          <div style={styles.statLbl}>Tỉnh thành phủ sóng</div>
        </div>
      </section>

      {/* DESTINATIONS */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTitle}>Điểm đến phổ biến</span>
          <Link to="/places" style={styles.seeAll}>Xem tất cả <ArrowRight size={14} /></Link>
        </div>
        <div style={styles.destGrid}>
          {DESTINATIONS.map(dest => (
            <div
              key={dest.id}
              style={styles.destCard}
              onClick={() => navigate(`/places?city=${dest.city}`)}
            >
              <div style={styles.destImgWrap}>
                <img
                  src={dest.img}
                  alt={dest.name}
                  style={styles.destImg}
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.parentNode.style.background = '#E6F1FB'
                  }}
                />
                <div style={styles.destImgOverlay} />
                <span style={styles.destBadge}>{dest.name}</span>
              </div>
              <div style={styles.destBody}>
                <p style={styles.destDesc}>{dest.description}</p>
                <div style={styles.destMeta}>
                  <span style={styles.destRating}>
                    <Star size={11} fill="#854F0B" color="#854F0B" />
                    {dest.rating} · {dest.reviews} đánh giá
                  </span>
                  <span style={styles.destPrice}>{dest.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={styles.featureSection}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTitle}>Tại sao chọn TravelAI?</span>
        </div>
        <div style={styles.featGrid}>
          {FEATURES.map((f, i) => (
            <div key={i} style={styles.featCard}>
              <div style={{ ...styles.featIconWrap, background: f.bg }}>
                {f.icon}
              </div>
              <div>
                <h4 style={styles.featTitle}>{f.title}</h4>
                <p style={styles.featDesc}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI STRIP */}
      <section style={styles.aiStrip}>
        <div style={styles.aiStripLeft}>
          <div style={styles.aiStripIconWrap}><Sparkles size={22} color="#534AB7" /></div>
          <div>
            <h4 style={styles.aiStripTitle}>Gợi ý lịch trình bằng AI</h4>
            <p style={styles.aiStripSub}>Nhập yêu cầu, AI phân tích sở thích và tạo lịch trình tối ưu chỉ trong vài giây</p>
          </div>
        </div>
        <button
          style={styles.aiStripBtn}
          onClick={() => navigate(user ? '/trips/create' : '/login')}
        >
          Thử ngay →
        </button>
      </section>

    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f2f0ea', fontFamily: 'inherit' },

  // HERO với ảnh nền
  hero: {
    position: 'relative',
    minHeight: '480px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundImage: 'url(https://images.unsplash.com/photo-1557750255-c76072a7aad1?w=1400&q=80)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.6) 100%)',
  },
  heroContent: {
    position: 'relative',
    zIndex: 1,
    textAlign: 'center',
    padding: '60px 24px 48px',
    width: '100%',
    maxWidth: '700px',
  },
  heroTitle: {
    fontSize: '38px',
    fontWeight: '700',
    lineHeight: 1.25,
    marginBottom: '14px',
    color: '#fff',
    textShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  heroAccent: { color: '#7BC8F6' },
  heroSub: {
    fontSize: '15px',
    color: 'rgba(255,255,255,0.88)',
    lineHeight: 1.7,
    marginBottom: '28px',
  },
  searchBox: {
    maxWidth: '500px',
    margin: '0 auto 14px',
    backgroundColor: '#fff',
    borderRadius: '14px',
    padding: '14px 16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  },
  searchRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1px 1fr',
    gap: '12px',
    marginBottom: '12px',
    alignItems: 'center',
  },
  searchDivider: { width: '1px', height: '32px', backgroundColor: '#eee', margin: '0 auto' },
  searchField: { display: 'flex', flexDirection: 'column', gap: '4px' },
  searchLabel: {
    fontSize: '10px', color: '#999', fontWeight: '600',
    letterSpacing: '.05em', display: 'flex', alignItems: 'center', gap: '3px',
  },
  searchVal: { fontSize: '13px', color: '#555' },
  searchBtn: {
    width: '100%', padding: '11px',
    backgroundColor: '#185FA5', color: '#fff',
    border: 'none', borderRadius: '8px',
    fontSize: '14px', fontWeight: '600', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    fontFamily: 'inherit',
  },
  heroNote: { fontSize: '12px', color: 'rgba(255,255,255,0.65)' },

  // STATS
  stats: {
    display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
    backgroundColor: '#fff', borderBottom: '1px solid #eee',
  },
  statItem: { padding: '18px', textAlign: 'center' },
  statNum: { fontSize: '24px', fontWeight: '700', marginBottom: '3px', color: '#185FA5' },
  statLbl: { fontSize: '12px', color: '#999' },

  // DESTINATIONS
  section: { padding: '36px 24px', maxWidth: '1200px', margin: '0 auto' },
  sectionHeader: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: '16px',
  },
  sectionTitle: { fontSize: '18px', fontWeight: '700', color: '#1a1a18' },
  seeAll: {
    fontSize: '13px', color: '#185FA5', textDecoration: 'none',
    display: 'flex', alignItems: 'center', gap: '4px',
  },
  destGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' },
  destCard: {
    backgroundColor: '#fff', border: '1px solid #eee',
    borderRadius: '14px', overflow: 'hidden', cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  destImgWrap: { position: 'relative', height: '160px', overflow: 'hidden' },
  destImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  destImgOverlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)',
  },
  destBadge: {
    position: 'absolute', bottom: '10px', left: '12px',
    color: '#fff', fontSize: '16px', fontWeight: '700',
    textShadow: '0 1px 4px rgba(0,0,0,0.5)',
  },
  destBody: { padding: '12px 14px' },
  destDesc: { fontSize: '12px', color: '#888', marginBottom: '8px' },
  destMeta: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  destRating: {
    fontSize: '12px', color: '#854F0B',
    display: 'flex', alignItems: 'center', gap: '4px',
  },
  destPrice: { fontSize: '11px', color: '#aaa' },

  // FEATURES
  featureSection: {
    padding: '36px 24px',
    backgroundColor: '#fff',
    borderTop: '1px solid #eee',
    borderBottom: '1px solid #eee',
  },
  featGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(2,1fr)',
    gap: '14px', maxWidth: '1200px', margin: '0 auto',
  },
  featCard: {
    border: '1px solid #eee', borderRadius: '12px',
    padding: '16px', display: 'flex', gap: '14px', alignItems: 'flex-start',
  },
  featIconWrap: {
    width: '44px', height: '44px', borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  featTitle: { fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: '#1a1a18' },
  featDesc: { fontSize: '12px', color: '#888', lineHeight: 1.6 },

  // AI STRIP
  aiStrip: {
    margin: '24px auto',
    maxWidth: '1152px',
    padding: '0 24px',
  },
  aiStripLeft: { display: 'flex', alignItems: 'center', gap: '14px' },
  aiStripIconWrap: {
    width: '44px', height: '44px', borderRadius: '10px',
    background: '#EEEDFE', display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexShrink: 0,
  },
  aiStripTitle: { fontSize: '14px', fontWeight: '600', marginBottom: '3px', color: '#1a1a18' },
  aiStripSub: { fontSize: '12px', color: '#888' },
  aiStripBtn: {
    fontSize: '13px', padding: '8px 20px', borderRadius: '8px',
    border: '1px solid #185FA5', color: '#185FA5', backgroundColor: '#E6F1FB',
    cursor: 'pointer', fontWeight: '500', whiteSpace: 'nowrap', fontFamily: 'inherit',
  },
}

export default Home