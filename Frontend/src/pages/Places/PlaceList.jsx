import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Search, Star, Heart, MapPin, Filter, Loader2, SlidersHorizontal, X, ChevronRight } from 'lucide-react'
import placeService from '../../services/placeService'

const CITIES = ['Tất cả', 'Hà Nội', 'Đà Nẵng', 'Đà Lạt', 'Hội An', 'Sapa', 'Phú Quốc']

const FALLBACK_IMGS = [
  'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&q=80',
  'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&q=80',
  'https://images.unsplash.com/photo-1528702748617-c64d49f918af?w=600&q=80',
  'https://images.unsplash.com/photo-1540779691674-b4e9db1a3e63?w=600&q=80',
  'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=600&q=80',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
]

const PlaceList = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [places, setPlaces] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [hoveredId, setHoveredId] = useState(null)

  const [search, setSearch] = useState('')
  const [city, setCity] = useState(() => {
    const params = new URLSearchParams(location.search)
    return params.get('city') || 'Tất cả'
  })
  const [category, setCategory] = useState('Tất cả')

  const loadCategories = async () => {
    try {
      const res = await placeService.getCategories()
      setCategories(res.data.result || [])
    } catch (err) {
      console.error('Lỗi tải danh mục:', err)
    }
  }

  const loadPlaces = async () => {
    setLoading(true)
    try {
      const params = {
        page: 0, size: 50,
        search: search.trim() || undefined,
        categoryId: category === 'Tất cả' ? undefined : category
      }
      const res = await placeService.getPlaces(params)
      setPlaces(res.data.result?.content || [])
    } catch (err) {
      console.error('Lỗi tải địa điểm:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadCategories() }, [])

  useEffect(() => {
    const timer = setTimeout(() => loadPlaces(), 300)
    return () => clearTimeout(timer)
  }, [search, category])

  const toggleLike = async (e, placeId, isCurrentlyLiked) => {
    e.stopPropagation()
    try {
      if (isCurrentlyLiked) {
        await placeService.unlikePlace(placeId)
      } else {
        await placeService.likePlace(placeId)
      }
      loadPlaces()
    } catch (err) {
      console.error('Lỗi yêu thích:', err)
      alert('Vui lòng đăng nhập để sử dụng tính năng yêu thích!')
    }
  }

  const filteredPlaces = places.filter(p => {
    if (city === 'Tất cả') return true
    return (p.address || '').toLowerCase().includes(city.toLowerCase())
  })

  const getImg = (place, idx) =>
    place.photos || FALLBACK_IMGS[idx % FALLBACK_IMGS.length]

  return (
    <div style={s.page}>
      <div style={s.bgMesh} />

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div style={s.header}>
        <div style={s.headerContent}>
          <div style={s.headerBadge}>
            <MapPin size={12} color="#38BDF8" />
            Khám phá địa điểm
          </div>
          <h1 style={s.headerTitle}>
            Tìm điểm đến <span style={s.titleAccent}>hoàn hảo</span>
          </h1>
          <p style={s.headerSub}>
            Nhà hàng, khách sạn, danh lam thắng cảnh — được cộng đồng đánh giá thực tế
          </p>

          {/* Search bar */}
          <div style={s.searchWrap}>
            <Search size={16} color="#64748B" style={{ flexShrink: 0 }} />
            <input
              style={s.searchInput}
              placeholder="Tìm tên địa điểm, địa chỉ..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button style={s.clearBtn} onClick={() => setSearch('')}>
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={s.body}>
        {/* ── FILTER BAR ─────────────────────────────────────── */}
        <div style={s.filterBar} className="animate-fade-in-up">
          {/* City */}
          <div style={s.filterGroup}>
            <div style={s.filterLabelRow}>
              <MapPin size={12} color="#64748B" />
              <span style={s.filterLabel}>Thành phố</span>
            </div>
            <div style={s.chips}>
              {CITIES.map(c => (
                <button
                  key={c}
                  style={{ ...s.chip, ...(city === c ? s.chipActive : {}) }}
                  onClick={() => setCity(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div style={s.filterDivider} />

          {/* Category */}
          <div style={s.filterGroup}>
            <div style={s.filterLabelRow}>
              <SlidersHorizontal size={12} color="#64748B" />
              <span style={s.filterLabel}>Danh mục</span>
            </div>
            <div style={s.chips}>
              <button
                style={{ ...s.chip, ...(category === 'Tất cả' ? s.chipActive : {}) }}
                onClick={() => setCategory('Tất cả')}
              >
                Tất cả
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  style={{ ...s.chip, ...(category === cat.id ? s.chipActive : {}) }}
                  onClick={() => setCategory(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── RESULT BAR ─────────────────────────────────────── */}
        <div style={s.resultBar}>
          <span style={s.resultCount}>
            {loading ? 'Đang tìm kiếm...' : `${filteredPlaces.length} địa điểm`}
          </span>
          {(city !== 'Tất cả' || category !== 'Tất cả' || search) && (
            <button style={s.clearFilterBtn} onClick={() => { setCity('Tất cả'); setCategory('Tất cả'); setSearch('') }}>
              <X size={12} /> Xóa bộ lọc
            </button>
          )}
        </div>

        {/* ── LOADING ────────────────────────────────────────── */}
        {loading && (
          <div style={s.loadingWrap}>
            <div style={s.loadingIconWrap} className="animate-pulse-glow">
              <Loader2 size={28} color="#38BDF8" className="animate-spin" />
            </div>
            <p style={s.loadingText}>Đang tìm kiếm địa điểm du lịch...</p>
          </div>
        )}

        {/* ── EMPTY ──────────────────────────────────────────── */}
        {!loading && filteredPlaces.length === 0 && (
          <div style={s.emptyWrap}>
            <div style={s.emptyIconWrap} className="animate-float">
              <Search size={28} color="#38BDF8" />
            </div>
            <p style={s.emptyTitle}>Không tìm thấy địa điểm nào</p>
            <p style={s.emptySub}>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        )}

        {/* ── GRID ───────────────────────────────────────────── */}
        {!loading && filteredPlaces.length > 0 && (
          <div style={s.grid}>
            {filteredPlaces.map((place, i) => {
              const isLiked = place.liked || place.isLiked || false
              const isHovered = hoveredId === place.id
              const img = getImg(place, i)

              return (
                <div
                  key={place.id}
                  style={{
                    ...s.card,
                    ...(isHovered ? s.cardHover : {}),
                    animationDelay: `${i * 0.05}s`,
                  }}
                  className="animate-fade-in-up"
                  onClick={() => navigate(`/places/${place.id}`)}
                  onMouseEnter={() => setHoveredId(place.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Image */}
                  <div style={s.imgWrap}>
                    <img
                      src={img}
                      alt={place.name}
                      style={{
                        ...s.img,
                        transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                      }}
                      onError={e => { e.target.src = FALLBACK_IMGS[i % FALLBACK_IMGS.length] }}
                    />
                    <div style={s.imgOverlay} />

                    {/* Category badge */}
                    <span style={s.catBadge}>{place.placeCategory?.name || 'Du lịch'}</span>

                    {/* Like button */}
                    <button
                      style={{ ...s.likeBtn, ...(isLiked ? s.likeBtnActive : {}) }}
                      onClick={e => toggleLike(e, place.id, isLiked)}
                    >
                      <Heart
                        size={14}
                        fill={isLiked ? '#EF4444' : 'none'}
                        color={isLiked ? '#EF4444' : 'rgba(248,250,252,0.9)'}
                      />
                    </button>

                    {/* Rating overlay */}
                    <div style={s.ratingOverlay}>
                      <Star size={11} fill="#F59E0B" color="#F59E0B" />
                      <span style={s.ratingNum}>{place.avg_rating ? place.avg_rating.toFixed(1) : '5.0'}</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div style={s.cardBody}>
                    <h3 style={s.placeName}>{place.name}</h3>
                    <div style={s.placeAddr}>
                      <MapPin size={11} color="#64748B" style={{ flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {place.address}
                      </span>
                    </div>
                    <p style={s.placeDesc}>{place.description}</p>

                    <div style={s.cardFooter}>
                      <span style={s.priceTag}>{place.price_range || 'Liên hệ'}</span>
                      <span style={{
                        ...s.viewMore,
                        opacity: isHovered ? 1 : 0,
                        transform: isHovered ? 'translateX(0)' : 'translateX(-6px)',
                      }}>
                        Xem chi tiết <ChevronRight size={12} />
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const s = {
  page: {
    minHeight: '100vh',
    background: 'var(--bg-dark)',
    paddingBottom: '60px',
    position: 'relative',
  },
  bgMesh: {
    position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
    backgroundImage: `radial-gradient(ellipse at 15% 20%, rgba(56,189,248,0.06) 0%, transparent 50%),
                      radial-gradient(ellipse at 85% 60%, rgba(129,140,248,0.06) 0%, transparent 50%)`,
  },

  // Header
  header: {
    background: 'rgba(10,15,30,0.8)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    padding: '48px 24px 36px',
    position: 'relative',
    zIndex: 1,
    textAlign: 'center',
  },
  headerContent: { maxWidth: '600px', margin: '0 auto' },
  headerBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    fontSize: '11px', fontWeight: '700', color: '#38BDF8',
    letterSpacing: '0.08em', textTransform: 'uppercase',
    background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)',
    padding: '5px 14px', borderRadius: '20px', marginBottom: '16px',
  },
  headerTitle: {
    fontSize: '36px', fontWeight: '900', color: '#F8FAFC',
    letterSpacing: '-0.5px', marginBottom: '10px', lineHeight: 1.2,
  },
  titleAccent: {
    background: 'linear-gradient(135deg, #38BDF8, #818CF8)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
  },
  headerSub: { fontSize: '14px', color: '#64748B', marginBottom: '24px', lineHeight: 1.6 },

  // Search
  searchWrap: {
    display: 'flex', alignItems: 'center', gap: '10px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '14px', padding: '13px 18px',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  searchInput: {
    flex: 1, border: 'none', outline: 'none',
    fontSize: '14px', background: 'transparent',
    color: '#F8FAFC', fontFamily: 'inherit',
  },
  clearBtn: {
    background: 'none', border: 'none',
    color: '#64748B', cursor: 'pointer',
    display: 'flex', alignItems: 'center', padding: '2px',
    borderRadius: '4px', transition: 'color 0.2s',
  },

  // Body
  body: {
    maxWidth: '1200px', margin: '0 auto',
    padding: '24px 24px', position: 'relative', zIndex: 1,
  },

  // Filter bar
  filterBar: {
    background: 'var(--bg-surface)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px', padding: '18px 22px',
    marginBottom: '20px',
    display: 'flex', flexDirection: 'column', gap: '14px',
  },
  filterGroup: { display: 'flex', alignItems: 'flex-start', gap: '14px', flexWrap: 'wrap' },
  filterLabelRow: {
    display: 'flex', alignItems: 'center', gap: '5px',
    minWidth: '90px', paddingTop: '6px',
  },
  filterLabel: { fontSize: '11px', fontWeight: '700', color: '#64748B', letterSpacing: '0.05em', textTransform: 'uppercase' },
  filterDivider: { height: '1px', background: 'rgba(255,255,255,0.06)' },
  chips: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  chip: {
    fontSize: '12px', padding: '6px 14px', borderRadius: '20px',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    color: '#94A3B8', cursor: 'pointer', fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  },
  chipActive: {
    background: 'rgba(56,189,248,0.12)', borderColor: 'rgba(56,189,248,0.35)',
    color: '#38BDF8', fontWeight: '600',
  },

  // Result bar
  resultBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '18px',
  },
  resultCount: { fontSize: '13px', color: '#64748B', fontWeight: '500' },
  clearFilterBtn: {
    display: 'flex', alignItems: 'center', gap: '5px',
    fontSize: '12px', color: '#38BDF8', fontWeight: '600',
    background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
    padding: '4px 8px', borderRadius: '6px',
    transition: 'background 0.2s',
  },

  // Loading
  loadingWrap: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', gap: '16px', padding: '80px 0',
  },
  loadingIconWrap: {
    width: '64px', height: '64px', borderRadius: '50%',
    background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  loadingText: { fontSize: '14px', color: '#64748B' },

  // Empty
  emptyWrap: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: '12px', padding: '80px 0', textAlign: 'center',
  },
  emptyIconWrap: {
    width: '72px', height: '72px', borderRadius: '18px',
    background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.15)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  emptyTitle: { fontSize: '18px', fontWeight: '700', color: '#F8FAFC' },
  emptySub: { fontSize: '13px', color: '#64748B' },

  // Grid
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '18px',
  },
  card: {
    background: 'var(--bg-surface)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px', overflow: 'hidden',
    cursor: 'pointer',
    transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s, border-color 0.3s',
    display: 'flex', flexDirection: 'column',
  },
  cardHover: {
    transform: 'translateY(-6px)',
    boxShadow: '0 20px 48px rgba(0,0,0,0.4)',
    borderColor: 'rgba(56,189,248,0.2)',
  },
  imgWrap: { position: 'relative', height: '196px', overflow: 'hidden' },
  img: {
    width: '100%', height: '100%', objectFit: 'cover', display: 'block',
    transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1)',
  },
  imgOverlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)',
  },
  catBadge: {
    position: 'absolute', top: '12px', left: '12px',
    fontSize: '10px', fontWeight: '700',
    background: 'rgba(10,15,30,0.75)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: 'rgba(248,250,252,0.9)',
    padding: '4px 10px', borderRadius: '6px',
    letterSpacing: '0.04em',
  },
  likeBtn: {
    position: 'absolute', top: '10px', right: '10px',
    width: '34px', height: '34px', borderRadius: '50%',
    background: 'rgba(10,15,30,0.65)', backdropFilter: 'blur(6px)',
    border: '1px solid rgba(255,255,255,0.1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'all 0.2s ease',
  },
  likeBtnActive: { background: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.4)' },
  ratingOverlay: {
    position: 'absolute', bottom: '10px', right: '12px',
    display: 'flex', alignItems: 'center', gap: '4px',
    background: 'rgba(10,15,30,0.7)', backdropFilter: 'blur(6px)',
    border: '1px solid rgba(245,158,11,0.2)',
    padding: '3px 8px', borderRadius: '6px',
  },
  ratingNum: { fontSize: '12px', fontWeight: '700', color: '#F59E0B' },

  // Card body
  cardBody: { padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' },
  placeName: {
    fontSize: '16px', fontWeight: '700', color: '#F8FAFC',
    marginBottom: '6px', lineHeight: 1.35,
  },
  placeAddr: {
    display: 'flex', alignItems: 'center', gap: '5px',
    fontSize: '12px', color: '#64748B',
    marginBottom: '8px', overflow: 'hidden',
  },
  placeDesc: {
    fontSize: '12px', color: '#64748B', lineHeight: 1.6,
    display: '-webkit-box', WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical', overflow: 'hidden',
    marginBottom: '14px', flex: 1,
  },
  cardFooter: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)',
    marginTop: 'auto',
  },
  priceTag: {
    fontSize: '13px', fontWeight: '600', color: '#38BDF8',
  },
  viewMore: {
    display: 'flex', alignItems: 'center', gap: '3px',
    fontSize: '12px', fontWeight: '600', color: '#818CF8',
    transition: 'opacity 0.3s, transform 0.3s',
  },
}

export default PlaceList