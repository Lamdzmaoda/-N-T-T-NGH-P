import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Plus, MapPin, Calendar, Clock, Heart, Star, Sparkles, Compass,
  Plane, CheckCircle, Filter, ChevronRight, Trash2, Loader2
} from 'lucide-react'
import tripService from '../../services/tripService'

const STATUS_CONFIG = {
  PLANNING: {
    label: 'Đang lên kế hoạch',
    icon: <Clock size={12} />,
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.3)',
  },
  ONGOING: {
    label: 'Đang diễn ra',
    icon: <Compass size={12} />,
    color: '#38BDF8',
    bg: 'rgba(56,189,248,0.12)',
    border: 'rgba(56,189,248,0.3)',
    pulse: true,
  },
  COMPLETED: {
    label: 'Đã hoàn thành',
    icon: <CheckCircle size={12} />,
    color: '#2DD4BF',
    bg: 'rgba(45,212,191,0.12)',
    border: 'rgba(45,212,191,0.3)',
  },
}

const FILTERS = [
  { key: 'ALL',       label: 'Tất cả' },
  { key: 'ONGOING',   label: '🧭 Đang diễn ra' },
  { key: 'PLANNING',  label: '📅 Lên kế hoạch' },
  { key: 'COMPLETED', label: '✅ Hoàn thành' },
  { key: 'FAVORITE',  label: '❤️ Yêu thích' },
]

const MyTrips = () => {
  const navigate = useNavigate()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [ongoingTrip, setOngoingTrip] = useState(null)
  const [hoveredId, setHoveredId] = useState(null)

  const loadOngoingTrip = async () => {
    try {
      const res = await tripService.getTrips({ page: 0, size: 1, filter: 'ONGOING' })
      const list = res.data.result?.content || []
      if (list.length > 0) {
        setOngoingTrip(list[0])
      } else {
        setOngoingTrip(null)
      }
    } catch (err) {
      console.error('Lỗi tải chuyến đi đang diễn ra:', err)
    }
  }

  useEffect(() => {
    loadOngoingTrip()
  }, [])

  useEffect(() => {
    loadTrips(page, filter)
  }, [page, filter])

  const loadTrips = async (pageNum, filterVal) => {
    setLoading(true)
    try {
      const res = await tripService.getTrips({ page: pageNum, size: 6, filter: filterVal })
      setTrips(res.data.result?.content || [])
      setTotalPages(res.data.result?.totalPages || 0)
      setTotalElements(res.data.result?.totalElements || 0)
    } catch (err) {
      console.error('Lỗi tải danh sách chuyến đi:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleFavorite = async (e, tripId) => {
    e.stopPropagation()
    try {
      const res = await tripService.toggleFavorite(tripId)
      if (filter === 'FAVORITE') {
        loadTrips(page, filter)
      } else {
        setTrips(prev => prev.map(t =>
          t.id === tripId ? { ...t, is_favorite: res.data.result.is_favorite } : t
        ))
      }
    } catch (err) {
      console.error('Lỗi cập nhật yêu thích:', err)
    }
  }

  const filteredTrips = trips

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const getDaysCount = (start, end) => {
    if (!start || !end) return 0
    const diff = new Date(end) - new Date(start)
    return Math.round(diff / (1000 * 60 * 60 * 24)) + 1
  }

  const getDestination = (trip) => {
    if (trip.title) {
      const match = trip.title.match(/['"]([^'"]+)['"]/)
      if (match) return match[1]
    }
    return trip.title || 'Chuyến đi'
  }

  // Loading state
  if (loading) {
    return (
      <div style={s.loadingPage}>
        <div style={s.loadingBg} />
        <div style={s.loadingContent}>
          <div style={s.loadingIconWrap} className="animate-pulse-glow">
            <Loader2 size={32} color="#38BDF8" className="animate-spin" />
          </div>
          <p style={s.loadingText}>Đang tải chuyến đi của bạn...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={s.page}>
      <div style={s.bgMesh} />

      <div style={s.container}>
        {/* Header */}
        <div style={s.header} className="animate-fade-in-up">
          <div>
            <div style={s.headerEyebrow}>✈️ Hành trình của bạn</div>
            <h1 style={s.headerTitle}>Chuyến đi của tôi</h1>
            <p style={s.headerSub}>
              {trips.length > 0
                ? `${trips.length} chuyến đi · ${trips.filter(t => t.status === 'ONGOING').length} đang diễn ra`
                : 'Hãy bắt đầu hành trình đầu tiên của bạn!'}
            </p>
          </div>
          <button style={s.createBtn} onClick={() => navigate('/trips/create')}>
            <Plus size={16} />
            Tạo chuyến đi mới
          </button>
        </div>

        {/* ONGOING BANNER (nếu có) */}
        {ongoingTrip && (
          <div
            style={s.ongoingBanner}
            className="animate-fade-in-up delay-100"
            onClick={() => navigate(`/trips/${ongoingTrip.id}`)}
          >
            <div style={s.ongoingPulse} />
            <div style={s.ongoingLeft}>
              <div style={s.ongoingIconWrap}>
                <Compass size={22} color="#38BDF8" />
              </div>
              <div>
                <div style={s.ongoingBadge}>
                  <span style={s.ongoingDot} />
                  ĐANG DIỄN RA
                </div>
                <div style={s.ongoingTitle}>{getDestination(ongoingTrip)}</div>
                <div style={s.ongoingMeta}>
                  <Calendar size={12} />
                  {formatDate(ongoingTrip.start_date)} — {formatDate(ongoingTrip.end_date)}
                  <span style={s.ongoingDivider}>·</span>
                  {getDaysCount(ongoingTrip.start_date, ongoingTrip.end_date)} ngày
                </div>
              </div>
            </div>
            <div style={s.ongoingRight}>
              <span style={s.ongoingCta}>Xem lịch trình</span>
              <ChevronRight size={18} color="#38BDF8" />
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div style={s.filterRow} className="animate-fade-in-up delay-200">
          {FILTERS.map(f => (
            <button
              key={f.key}
              style={{
                ...s.filterBtn,
                ...(filter === f.key ? s.filterBtnActive : {}),
              }}
              onClick={() => { setFilter(f.key); setPage(0); }}
            >
              {f.label}
              {filter === f.key && totalElements > 0 && (
                <span style={{
                  ...s.filterCount,
                  ...s.filterCountActive,
                }}>
                  {totalElements}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Empty state */}
        {trips.length === 0 && (
          <div style={s.emptyState} className="animate-scale-in">
            <div style={s.emptyIconWrap} className="animate-float">
              <span style={{ fontSize: '52px' }}>✈️</span>
            </div>
            <h2 style={s.emptyTitle}>Chưa có chuyến đi nào</h2>
            <p style={s.emptySub}>
              Hãy để AI lên kế hoạch cho hành trình đầu tiên của bạn!
            </p>
            <button style={s.emptyBtn} onClick={() => navigate('/trips/create')}>
              <Sparkles size={16} />
              Tạo lịch trình với AI
            </button>
          </div>
        )}

        {/* Empty filtered state */}
        {trips.length > 0 && filteredTrips.length === 0 && (
          <div style={s.emptyFiltered}>
            <span style={{ fontSize: '32px' }}>🔍</span>
            <p style={s.emptyFilteredText}>Không có chuyến đi nào trong mục này</p>
          </div>
        )}

        {/* Trip grid */}
        {filteredTrips.length > 0 && (
          <div style={s.tripGrid}>
            {filteredTrips.map((trip, i) => {
              const cfg = STATUS_CONFIG[trip.status] || STATUS_CONFIG.PLANNING
              const days = getDaysCount(trip.start_date, trip.end_date)
              const isHovered = hoveredId === trip.id
              const dest = getDestination(trip)

              return (
                <div
                  key={trip.id}
                  style={{
                    ...s.tripCard,
                    ...(isHovered ? s.tripCardHover : {}),
                    ...(trip.status === 'ONGOING' ? { borderColor: 'rgba(56,189,248,0.2)' } : {}),
                    animationDelay: `${i * 0.06}s`,
                  }}
                  className="animate-fade-in-up"
                  onClick={() => navigate(`/trips/${trip.id}`)}
                  onMouseEnter={() => setHoveredId(trip.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Card top: gradient banner */}
                  <div style={{
                    ...s.cardBanner,
                    background: trip.status === 'ONGOING'
                      ? 'linear-gradient(135deg, rgba(56,189,248,0.18), rgba(129,140,248,0.18))'
                      : trip.status === 'COMPLETED'
                        ? 'linear-gradient(135deg, rgba(45,212,191,0.12), rgba(56,189,248,0.08))'
                        : 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(251,191,36,0.06))',
                  }}>
                    {/* Destination initial */}
                    <div style={s.cardInitialWrap}>
                      <div style={{
                        ...s.cardInitial,
                        background: trip.status === 'ONGOING'
                          ? 'linear-gradient(135deg, #38BDF8, #818CF8)'
                          : trip.status === 'COMPLETED'
                            ? 'linear-gradient(135deg, #2DD4BF, #38BDF8)'
                            : 'linear-gradient(135deg, #F59E0B, #FBBF24)',
                      }}>
                        {dest.charAt(0).toUpperCase()}
                      </div>
                      <div style={s.cardDest}>{dest}</div>
                    </div>

                    {/* Status badge */}
                    <div style={{ ...s.statusBadge, background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}>
                      {cfg.pulse && <span style={s.statusPulse} />}
                      {cfg.icon}
                      {cfg.label}
                    </div>

                    {/* Favorite btn */}
                    <button
                      style={s.favBtn}
                      onClick={(e) => handleToggleFavorite(e, trip.id)}
                      title={trip.is_favorite ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
                    >
                      <Heart
                        size={16}
                        fill={trip.is_favorite ? '#EF4444' : 'none'}
                        color={trip.is_favorite ? '#EF4444' : 'rgba(248,250,252,0.4)'}
                      />
                    </button>
                  </div>

                  {/* Card body */}
                  <div style={s.cardBody}>
                    <h3 style={s.cardTitle}>{trip.title || dest}</h3>

                    <div style={s.cardMeta}>
                      <div style={s.cardMetaItem}>
                        <Calendar size={13} color="#64748B" />
                        <span>{formatDate(trip.start_date)} — {formatDate(trip.end_date)}</span>
                      </div>
                      <div style={s.cardMetaItem}>
                        <Clock size={13} color="#64748B" />
                        <span>{days} ngày {days - 1} đêm</span>
                      </div>
                    </div>

                    {/* Itinerary preview */}
                    {trip.itineraries && trip.itineraries.length > 0 && (
                      <div style={s.itiPreview}>
                        <MapPin size={11} color="#64748B" />
                        <span style={s.itiText}>
                          {trip.itineraries[0]?.place?.name || 'Nhiều địa điểm'}
                          {trip.itineraries.length > 1 && ` +${trip.itineraries.length - 1} địa điểm khác`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card footer */}
                  <div style={{
                    ...s.cardFooter,
                    borderColor: isHovered ? cfg.border : 'rgba(255,255,255,0.06)',
                  }}>
                    {trip.is_favorite && (
                      <span style={s.favLabel}><Heart size={11} fill="#EF4444" color="#EF4444" /> Yêu thích</span>
                    )}
                    <span style={{ ...s.viewBtn, color: cfg.color }}>
                      {trip.status === 'ONGOING' ? 'Tiếp tục hành trình' : 'Xem lịch trình'}
                      <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              )
            })}

            {/* Create new card */}
            <div
              style={{ ...s.createCard, ...(hoveredId === 'create' ? s.createCardHover : {}) }}
              onClick={() => navigate('/trips/create')}
              onMouseEnter={() => setHoveredId('create')}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div style={s.createCardIcon} className="animate-float">
                <Sparkles size={28} color="#818CF8" />
              </div>
              <div style={s.createCardText}>Tạo chuyến đi mới</div>
              <div style={s.createCardSub}>Để AI lên kế hoạch giúp bạn</div>
            </div>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div style={s.pagination}>
            <button
              style={{ ...s.btnPage, ...(page === 0 ? s.btnPageDisabled : {}) }}
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              ← Trước
            </button>
            <span style={s.pageIndicator}>
              Trang {page + 1} / {totalPages}
            </span>
            <button
              style={{ ...s.btnPage, ...(page >= totalPages - 1 ? s.btnPageDisabled : {}) }}
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
            >
              Sau →
            </button>
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
    padding: '40px 24px 60px',
    position: 'relative',
  },
  bgMesh: {
    position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
    backgroundImage: `radial-gradient(ellipse at 10% 30%, rgba(56,189,248,0.06) 0%, transparent 50%),
                      radial-gradient(ellipse at 90% 70%, rgba(129,140,248,0.06) 0%, transparent 50%)`,
  },
  container: {
    maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1,
  },

  // Header
  header: {
    display: 'flex', alignItems: 'flex-start',
    justifyContent: 'space-between', marginBottom: '28px', gap: '16px',
  },
  headerEyebrow: {
    fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em',
    color: '#38BDF8', marginBottom: '6px', textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: '30px', fontWeight: '900', color: '#F8FAFC',
    letterSpacing: '-0.5px', marginBottom: '6px',
  },
  headerSub: { fontSize: '14px', color: '#64748B' },
  createBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '12px 22px', borderRadius: '12px', border: 'none',
    background: 'linear-gradient(135deg, #38BDF8, #818CF8)',
    color: '#0A0F1E', fontSize: '14px', fontWeight: '700',
    cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0,
    boxShadow: '0 0 20px rgba(56,189,248,0.3)',
    transition: 'all 0.2s ease',
  },

  // Ongoing banner
  ongoingBanner: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '18px 24px',
    background: 'linear-gradient(135deg, rgba(56,189,248,0.1), rgba(129,140,248,0.1))',
    border: '1px solid rgba(56,189,248,0.25)',
    borderRadius: '16px', marginBottom: '24px', cursor: 'pointer',
    position: 'relative', overflow: 'hidden',
    transition: 'all 0.25s ease',
  },
  ongoingPulse: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(135deg, rgba(56,189,248,0.04), transparent)',
    animation: 'gradientShift 4s ease infinite',
    backgroundSize: '200% 200%',
    pointerEvents: 'none',
  },
  ongoingLeft: { display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 1 },
  ongoingIconWrap: {
    width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
    background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    animation: 'float 4s ease-in-out infinite',
  },
  ongoingBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    fontSize: '10px', fontWeight: '800', color: '#38BDF8', letterSpacing: '0.1em',
    marginBottom: '4px',
  },
  ongoingDot: {
    width: '6px', height: '6px', borderRadius: '50%', background: '#38BDF8',
    boxShadow: '0 0 6px #38BDF8',
    animation: 'pulse-glow 2s ease-in-out infinite',
    display: 'inline-block',
  },
  ongoingTitle: { fontSize: '17px', fontWeight: '700', color: '#F8FAFC', marginBottom: '5px' },
  ongoingMeta: {
    display: 'flex', alignItems: 'center', gap: '6px',
    fontSize: '12px', color: '#64748B',
  },
  ongoingDivider: { color: '#334155' },
  ongoingRight: {
    display: 'flex', alignItems: 'center', gap: '6px',
    position: 'relative', zIndex: 1,
  },
  ongoingCta: { fontSize: '13px', fontWeight: '600', color: '#38BDF8' },

  // Filters
  filterRow: {
    display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px',
  },
  filterBtn: {
    display: 'flex', alignItems: 'center', gap: '7px',
    padding: '8px 16px', borderRadius: '10px',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    color: '#64748B', fontSize: '13px', fontWeight: '500',
    cursor: 'pointer', fontFamily: 'inherit',
    transition: 'all 0.2s ease',
  },
  filterBtnActive: {
    background: 'rgba(56,189,248,0.1)', borderColor: 'rgba(56,189,248,0.3)',
    color: '#38BDF8', fontWeight: '600',
  },
  filterCount: {
    background: 'rgba(255,255,255,0.08)', color: '#64748B',
    fontSize: '11px', fontWeight: '700', borderRadius: '20px',
    padding: '1px 7px', minWidth: '20px', textAlign: 'center',
  },
  filterCountActive: {
    background: 'rgba(56,189,248,0.2)', color: '#38BDF8',
  },

  // Empty state
  emptyState: {
    textAlign: 'center', padding: '80px 24px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
  },
  emptyIconWrap: {
    width: '96px', height: '96px', borderRadius: '24px',
    background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.15)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  emptyTitle: { fontSize: '22px', fontWeight: '800', color: '#F8FAFC' },
  emptySub: { fontSize: '14px', color: '#64748B', maxWidth: '320px', lineHeight: 1.6 },
  emptyBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '13px 24px', borderRadius: '12px', border: 'none',
    background: 'linear-gradient(135deg, #38BDF8, #818CF8)',
    color: '#0A0F1E', fontSize: '14px', fontWeight: '700',
    cursor: 'pointer', fontFamily: 'inherit',
    boxShadow: '0 0 24px rgba(56,189,248,0.3)',
    marginTop: '8px',
  },
  emptyFiltered: {
    textAlign: 'center', padding: '60px 24px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
  },
  emptyFilteredText: { fontSize: '14px', color: '#64748B' },

  // Trip grid
  tripGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '18px',
  },
  tripCard: {
    background: 'var(--bg-surface)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '18px', overflow: 'hidden', cursor: 'pointer',
    transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s, border-color 0.3s',
    display: 'flex', flexDirection: 'column',
  },
  tripCardHover: {
    transform: 'translateY(-6px)',
    boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
  },

  // Card banner (top colored area)
  cardBanner: {
    padding: '18px 18px 14px',
    position: 'relative', display: 'flex',
    flexDirection: 'column', gap: '10px',
  },
  cardInitialWrap: { display: 'flex', alignItems: 'center', gap: '12px' },
  cardInitial: {
    width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '20px', fontWeight: '900', color: '#0A0F1E',
    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
  },
  cardDest: { fontSize: '18px', fontWeight: '800', color: '#F8FAFC' },
  statusBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    padding: '4px 10px', borderRadius: '8px',
    fontSize: '11px', fontWeight: '700', alignSelf: 'flex-start',
    letterSpacing: '0.02em',
  },
  statusPulse: {
    width: '6px', height: '6px', borderRadius: '50%', background: '#38BDF8',
    display: 'inline-block', flexShrink: 0,
    animation: 'pulse-glow 2s ease-in-out infinite',
    boxShadow: '0 0 6px #38BDF8',
  },
  favBtn: {
    position: 'absolute', top: '14px', right: '14px',
    background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px', width: '32px', height: '32px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'all 0.2s ease',
  },

  // Card body
  cardBody: { padding: '14px 18px', flex: 1 },
  cardTitle: {
    fontSize: '14px', fontWeight: '600', color: '#F8FAFC',
    marginBottom: '10px', lineHeight: 1.4,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  cardMeta: { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' },
  cardMetaItem: {
    display: 'flex', alignItems: 'center', gap: '7px',
    fontSize: '12px', color: '#64748B',
  },
  itiPreview: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '7px 10px', borderRadius: '8px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  itiText: {
    fontSize: '12px', color: '#64748B',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },

  // Card footer
  cardFooter: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 18px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    transition: 'border-color 0.3s',
  },
  favLabel: {
    display: 'flex', alignItems: 'center', gap: '4px',
    fontSize: '11px', color: '#EF4444', fontWeight: '600',
  },
  viewBtn: {
    display: 'flex', alignItems: 'center', gap: '4px',
    fontSize: '12px', fontWeight: '700', marginLeft: 'auto',
    transition: 'gap 0.2s',
  },

  // Create card
  createCard: {
    background: 'rgba(129,140,248,0.04)',
    border: '2px dashed rgba(129,140,248,0.2)',
    borderRadius: '18px', cursor: 'pointer',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    gap: '10px', padding: '40px 24px',
    minHeight: '220px',
    transition: 'all 0.3s ease',
  },
  createCardHover: {
    background: 'rgba(129,140,248,0.08)',
    borderColor: 'rgba(129,140,248,0.4)',
    transform: 'translateY(-4px)',
  },
  createCardIcon: {
    width: '64px', height: '64px', borderRadius: '16px',
    background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  createCardText: { fontSize: '15px', fontWeight: '700', color: '#818CF8' },
  createCardSub: { fontSize: '12px', color: '#64748B' },

  // Loading
  loadingPage: {
    minHeight: '100vh', background: 'var(--bg-dark)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  loadingBg: {
    position: 'absolute', inset: 0,
    backgroundImage: `radial-gradient(ellipse at 50% 50%, rgba(56,189,248,0.08) 0%, transparent 60%)`,
  },
  loadingContent: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
    position: 'relative', zIndex: 1,
  },
  loadingIconWrap: {
    width: '72px', height: '72px', borderRadius: '50%',
    background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  loadingText: { fontSize: '15px', color: '#64748B', fontWeight: '500' },

  // Pagination
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    marginTop: '36px',
    position: 'relative',
    zIndex: 10,
  },
  btnPage: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '8px 16px',
    backgroundColor: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#F8FAFC',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
  },
  btnPageDisabled: { opacity: 0.3, cursor: 'not-allowed' },
  pageIndicator: { fontSize: '13px', color: '#64748B', fontWeight: '500' },
}

export default MyTrips
