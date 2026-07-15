import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Star, MapPin, Clock, Ticket, Heart, Share2,
  Plus, Trash2, Loader2, Calendar, CreditCard, ExternalLink,
  CheckCircle, X, Sparkles
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import placeService from '../../services/placeService'
import bookingService from '../../services/bookingService'

const PAYMENT_METHODS = [
  { id: 'MOMO',  name: 'Ví MoMo',      icon: '🌸', color: 'rgba(166,29,110,0.15)', border: 'rgba(166,29,110,0.35)' },
  { id: 'VNPAY', name: 'Cổng VNPAY',   icon: '💎', color: 'rgba(56,189,248,0.1)',   border: 'rgba(56,189,248,0.3)' },
  { id: 'CARD',  name: 'Thẻ Quốc tế',  icon: '💳', color: 'rgba(129,140,248,0.1)',  border: 'rgba(129,140,248,0.3)' },
]

const PlaceDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [place, setPlace] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)

  const [reviewText, setReviewText] = useState('')
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)

  // Booking & Payment state
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [bookingNote, setBookingNote] = useState('')
  const [isBookingLoading, setIsBookingLoading] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [createdBooking, setCreatedBooking] = useState(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('MOMO')
  const [isPaymentLoading, setIsPaymentLoading] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [paymentResult, setPaymentResult] = useState(null)

  const loadPlaceData = async () => {
    try {
      setLoading(true)
      const placeRes = await placeService.getPlaceById(id)
      setPlace(placeRes.data.result)
      setLiked(placeRes.data.result?.liked || placeRes.data.result?.isLiked || false)
      const reviewsRes = await placeService.getReviews(id)
      setReviews(reviewsRes.data.result || [])
    } catch (err) {
      console.error('Lỗi tải thông tin chi tiết:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadPlaceData() }, [id])

  const handleLike = async () => {
    try {
      if (liked) { await placeService.unlikePlace(id); setLiked(false) }
      else { await placeService.likePlace(id); setLiked(true) }
    } catch (err) {
      console.error(err)
      alert('Vui lòng đăng nhập để thực hiện chức năng yêu thích!')
    }
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!reviewText.trim()) return
    try {
      await placeService.createReview({ placeId: id, rating, comment: reviewText, photos: '' })
      setReviewText(''); setRating(5)
      const placeRes = await placeService.getPlaceById(id)
      setPlace(placeRes.data.result)
      const reviewsRes = await placeService.getReviews(id)
      setReviews(reviewsRes.data.result || [])
    } catch (err) {
      console.error(err)
      alert('Gửi đánh giá thất bại. Vui lòng đăng nhập và thử lại!')
    }
  }

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return
    try {
      await placeService.deleteReview(reviewId)
      const placeRes = await placeService.getPlaceById(id)
      setPlace(placeRes.data.result)
      const reviewsRes = await placeService.getReviews(id)
      setReviews(reviewsRes.data.result || [])
    } catch (err) {
      console.error(err); alert('Xóa đánh giá thất bại.')
    }
  }

  const getBasePrice = () => {
    if (!place?.price_range) return 250000
    const numbers = place.price_range.replace(/[^0-9]/g, '')
    if (numbers) {
      const parsed = parseInt(numbers, 10)
      if (parsed > 1000) return parsed
      return parsed * 100000
    }
    return 250000
  }

  const handleBookingSubmit = async (e) => {
    e.preventDefault()
    if (!user) { alert('Vui lòng đăng nhập để thực hiện đặt chỗ!'); navigate('/login'); return }
    if (!checkIn || !checkOut) { alert('Vui lòng chọn đầy đủ ngày nhận và ngày trả!'); return }
    if (new Date(checkIn) > new Date(checkOut)) { alert('Ngày nhận không thể sau ngày trả!'); return }
    setIsBookingLoading(true)
    try {
      const days = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)) || 1
      const total = getBasePrice() * days
      const res = await bookingService.createBooking({ placeId: id, checkIn, checkOut, totalPrice: total, note: bookingNote })
      setCreatedBooking(res.data.result)
      setPaymentSuccess(false)
      setShowPaymentModal(true)
    } catch (err) {
      console.error(err); alert(err.response?.data?.message || 'Có lỗi xảy ra khi tạo đặt chỗ!')
    } finally {
      setIsBookingLoading(false)
    }
  }

  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    if (!createdBooking) return
    setIsPaymentLoading(true)
    try {
      const res = await bookingService.processPayment({ bookingId: createdBooking.id, method: selectedPaymentMethod })
      setPaymentResult(res.data.result)
      setPaymentSuccess(true)
      loadPlaceData()
    } catch (err) {
      console.error(err); alert(err.response?.data?.message || 'Thanh toán thất bại, vui lòng thử lại!')
    } finally {
      setIsPaymentLoading(false)
    }
  }

  const days = checkIn && checkOut && new Date(checkIn) <= new Date(checkOut)
    ? Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)) || 1
    : 0

  // ── Loading ────────────────────────────────────────────
  if (loading) return (
    <div style={s.loadingPage}>
      <div style={s.loadingBg} />
      <div style={s.loadingContent}>
        <div style={s.loadingIconWrap} className="animate-pulse-glow">
          <Loader2 size={28} color="#38BDF8" className="animate-spin" />
        </div>
        <p style={s.loadingText}>Đang tải thông tin địa điểm...</p>
      </div>
    </div>
  )

  if (!place) return (
    <div style={s.notFoundPage}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
      <h2 style={{ color: '#F8FAFC', marginBottom: '8px' }}>Không tìm thấy địa điểm</h2>
      <p style={{ color: '#64748B', marginBottom: '24px' }}>Địa điểm này không tồn tại hoặc đã bị ẩn.</p>
      <button style={s.backBtnPlain} onClick={() => navigate('/places')}>← Quay lại danh sách</button>
    </div>
  )

  const mapsUrl = 'https://maps.google.com/?q=' + encodeURIComponent(place.address)

  return (
    <div style={s.page}>
      {/* ── HERO IMAGE ─────────────────────────────────────── */}
      <div style={s.heroWrap}>
        <img
          src={place.photos || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80'}
          alt={place.name}
          style={s.heroImg}
          onError={e => e.target.src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80'}
        />
        <div style={s.heroOverlay} />
        <div style={s.heroMesh} />

        {/* Back button */}
        <button style={s.backBtn} onClick={() => navigate('/places')}>
          <ArrowLeft size={15} /> Địa điểm
        </button>

        {/* Hero actions */}
        <div style={s.heroActions}>
          <button
            style={{ ...s.actionBtn, ...(liked ? s.actionBtnLiked : {}) }}
            onClick={handleLike}
            title={liked ? 'Bỏ yêu thích' : 'Yêu thích'}
          >
            <Heart size={16} fill={liked ? '#EF4444' : 'none'} color={liked ? '#EF4444' : 'rgba(248,250,252,0.9)'} />
          </button>
          <button style={s.actionBtn} title="Chia sẻ">
            <Share2 size={16} color="rgba(248,250,252,0.9)" />
          </button>
        </div>

        {/* Hero title overlay */}
        <div style={s.heroTitleWrap}>
          <span style={s.heroCatBadge}>{place.placeCategory?.name || 'Du lịch'}</span>
          <h1 style={s.heroName}>{place.name}</h1>
          <div style={s.heroAddr}>
            <MapPin size={13} color="rgba(248,250,252,0.7)" />
            <span>{place.address}</span>
          </div>
        </div>
      </div>

      {/* ── BODY ───────────────────────────────────────────── */}
      <div style={s.body}>

        {/* ── MAIN COLUMN ──────────────────────────────────── */}
        <div style={s.main}>

          {/* Info card */}
          <div style={s.card} className="animate-fade-in-up">
            {/* Actions row */}
            <div style={s.infoTopRow}>
              <div style={s.statsRow}>
                <div style={s.statItem}>
                  <div style={s.statNum}>{place.avg_rating ? place.avg_rating.toFixed(1) : '5.0'}</div>
                  <div style={s.statLabel}>⭐ Điểm đánh giá</div>
                </div>
                <div style={s.statDivider} />
                <div style={s.statItem}>
                  <div style={s.statNum}>{reviews.length}</div>
                  <div style={s.statLabel}>💬 Đánh giá</div>
                </div>
                <div style={s.statDivider} />
                <div style={s.statItem}>
                  <div style={s.statNum}>{place.max_slots !== null ? place.max_slots : '∞'}</div>
                  <div style={s.statLabel}>🎟️ Slot khả dụng</div>
                </div>
              </div>
              <button
                style={s.addToTripBtn}
                onClick={() => navigate(user ? '/trips/create' : '/login')}
              >
                <Sparkles size={14} />
                Thêm vào lịch trình
              </button>
            </div>

            {/* Detail items */}
            <div style={s.detailsRow}>
              <div style={s.detailItem}>
                <div style={s.detailIcon}><Clock size={16} color="#38BDF8" /></div>
                <div>
                  <div style={s.detailLabel}>Giờ mở cửa</div>
                  <div style={s.detailVal}>{place.opening_hours || 'Cả ngày'}</div>
                </div>
              </div>
              <div style={s.detailItem}>
                <div style={s.detailIcon}><Ticket size={16} color="#F59E0B" /></div>
                <div>
                  <div style={s.detailLabel}>Tầm giá</div>
                  <div style={s.detailVal}>{place.price_range || 'Liên hệ'}</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <p style={s.description}>{place.description || 'Không có mô tả chi tiết cho địa điểm này.'}</p>
          </div>

          {/* Reviews section */}
          <div style={s.card} className="animate-fade-in-up delay-100">
            <div style={s.reviewHeader}>
              <h3 style={s.reviewTitle}>Đánh giá <span style={s.reviewCount}>({reviews.length})</span></h3>
            </div>

            {/* Write review */}
            {user ? (
              <form onSubmit={handleReviewSubmit} style={s.reviewForm}>
                <div style={s.reviewFormHeader}>
                  <div style={s.reviewAvatar}>
                    {user.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={s.starPickerRow}>
                      <span style={s.starPickerLabel}>Đánh giá của bạn:</span>
                      {[1,2,3,4,5].map(s_idx => (
                        <Star
                          key={s_idx} size={22}
                          fill={(hoverRating || rating) >= s_idx ? '#F59E0B' : 'none'}
                          color={(hoverRating || rating) >= s_idx ? '#F59E0B' : 'rgba(255,255,255,0.2)'}
                          style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                          onClick={() => setRating(s_idx)}
                          onMouseEnter={() => setHoverRating(s_idx)}
                          onMouseLeave={() => setHoverRating(0)}
                        />
                      ))}
                    </div>
                    <textarea
                      style={s.reviewTextarea}
                      placeholder="Chia sẻ trải nghiệm thực tế của bạn..."
                      value={reviewText}
                      onChange={e => setReviewText(e.target.value)}
                      rows={3}
                      required
                    />
                    <button type="submit" style={s.reviewSubmitBtn}>Gửi đánh giá</button>
                  </div>
                </div>
              </form>
            ) : (
              <div style={s.loginPrompt}>
                <span style={s.loginPromptText}>Đăng nhập để viết đánh giá cho địa điểm này</span>
                <button style={s.loginPromptBtn} onClick={() => navigate('/login')}>Đăng nhập</button>
              </div>
            )}

            {/* Review list */}
            {reviews.length === 0 ? (
              <div style={s.noReview}>
                <span style={{ fontSize: '28px' }}>💬</span>
                <p>Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
              </div>
            ) : (
              <div style={s.reviewList}>
                {reviews.map(r => {
                  const isOwner = user && r.user?.username === user.username
                  return (
                    <div key={r.id} style={s.reviewItem}>
                      <div style={s.reviewItemHeader}>
                        <div style={s.reviewerAvatar}>
                          {r.user?.full_name ? r.user.full_name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={s.reviewerTopRow}>
                            <span style={s.reviewerName}>{r.user?.full_name || r.user?.username || 'Thành viên'}</span>
                            {isOwner && (
                              <button
                                style={s.deleteReviewBtn}
                                onClick={() => handleDeleteReview(r.id)}
                                title="Xóa đánh giá"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                          <div style={s.starsRow}>
                            {[1,2,3,4,5].map(s_idx => (
                              <Star key={s_idx} size={12}
                                fill={s_idx <= r.rating ? '#F59E0B' : 'none'}
                                color={s_idx <= r.rating ? '#F59E0B' : 'rgba(255,255,255,0.15)'}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p style={s.reviewComment}>{r.comment}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── SIDEBAR ──────────────────────────────────────── */}
        <div style={s.sidebar}>

          {/* Booking card */}
          <div style={s.sideCard} className="animate-fade-in-up delay-200">
            <div style={s.sideCardHeader}>
              <h3 style={s.sideCardTitle}>Đặt chỗ</h3>
              {place.max_slots !== null && (
                <span style={s.slotsTag}>
                  🎟️ {place.max_slots} slot
                </span>
              )}
            </div>

            <form onSubmit={handleBookingSubmit} style={s.bookingForm}>
              <div style={s.bookingField}>
                <label style={s.bookingLabel}><Calendar size={12} /> Ngày nhận</label>
                <input
                  type="date" style={s.bookingInput} className="input-premium"
                  value={checkIn} onChange={e => setCheckIn(e.target.value)} required
                />
              </div>
              <div style={s.bookingField}>
                <label style={s.bookingLabel}><Calendar size={12} /> Ngày trả</label>
                <input
                  type="date" style={s.bookingInput} className="input-premium"
                  value={checkOut} onChange={e => setCheckOut(e.target.value)} required
                />
              </div>
              <div style={s.bookingField}>
                <label style={s.bookingLabel}>Yêu cầu đặc biệt</label>
                <textarea
                  style={s.bookingTextarea} className="input-premium"
                  placeholder="Ghi chú (phòng tầng cao, view đẹp...)"
                  value={bookingNote} onChange={e => setBookingNote(e.target.value)}
                  rows={2}
                />
              </div>

              {days > 0 && (
                <div style={s.pricePreview}>
                  <span style={s.pricePreviewLabel}>Tạm tính ({days} ngày)</span>
                  <span style={s.pricePreviewVal}>
                    {(days * getBasePrice()).toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
              )}

              <button type="submit" style={s.bookingBtn} disabled={isBookingLoading}>
                {isBookingLoading ? (
                  <><Loader2 size={14} className="animate-spin" /> Đang xử lý...</>
                ) : (
                  <><CreditCard size={14} /> Tiến hành đặt chỗ</>
                )}
              </button>
            </form>
          </div>

          {/* Map card */}
          <div style={s.sideCard} className="animate-fade-in-up delay-300">
            <h3 style={s.sideCardTitle}>Vị trí trên bản đồ</h3>
            <div style={s.mapWrap}>
              <iframe
                width="100%" height="200"
                style={{ border: 0, display: 'block', borderRadius: '10px' }}
                loading="lazy"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(place.address)}&output=embed`}
                title="Google Maps"
              />
            </div>
            <a href={mapsUrl} target="_blank" rel="noreferrer" style={s.mapLink}>
              <MapPin size={13} color="#38BDF8" />
              Mở Google Maps
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>

      {/* ── PAYMENT MODAL ─────────────────────────────────── */}
      {showPaymentModal && createdBooking && (
        <div style={s.modalOverlay} className="animate-fade-in">
          <div style={s.modalCard} className="animate-scale-in">
            {/* Modal header */}
            <div style={s.modalHeader}>
              <h3 style={s.modalTitle}>
                {paymentSuccess ? '✅ Thanh toán thành công' : '💳 Thanh toán hóa đơn'}
              </h3>
              {!paymentSuccess && (
                <button style={s.modalCloseBtn} onClick={() => setShowPaymentModal(false)}>
                  <X size={18} />
                </button>
              )}
            </div>

            {!paymentSuccess ? (
              <form onSubmit={handlePaymentSubmit}>
                {/* Summary */}
                <div style={s.summaryCard}>
                  <div style={s.summaryRow}>
                    <span>Địa điểm</span>
                    <strong style={s.summaryVal}>{place.name}</strong>
                  </div>
                  <div style={s.summaryRow}>
                    <span>Thời gian</span>
                    <span style={s.summaryVal}>{createdBooking.checkIn} → {createdBooking.checkOut}</span>
                  </div>
                  <div style={{ ...s.summaryRow, ...s.summaryTotalRow }}>
                    <span>Tổng thanh toán</span>
                    <strong style={s.totalPrice}>{createdBooking.totalPrice?.toLocaleString('vi-VN')} VNĐ</strong>
                  </div>
                </div>

                {/* Payment method */}
                <div style={s.payMethodSection}>
                  <p style={s.payMethodLabel}>Chọn phương thức thanh toán</p>
                  <div style={s.payMethodGrid}>
                    {PAYMENT_METHODS.map(m => (
                      <div
                        key={m.id}
                        style={{
                          ...s.payMethodCard,
                          ...(selectedPaymentMethod === m.id ? {
                            background: m.color,
                            borderColor: m.border.replace('0.3', '0.6'),
                            boxShadow: `0 0 12px ${m.border}`,
                          } : {}),
                        }}
                        onClick={() => setSelectedPaymentMethod(m.id)}
                      >
                        <span style={s.payMethodIcon}>{m.icon}</span>
                        <span style={s.payMethodName}>{m.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button type="submit" style={s.confirmBtn} disabled={isPaymentLoading}>
                  {isPaymentLoading ? (
                    <><Loader2 size={15} className="animate-spin" /> Đang kết nối cổng thanh toán...</>
                  ) : (
                    <>Xác nhận thanh toán</>
                  )}
                </button>
              </form>
            ) : (
              /* Success state */
              <div style={s.successWrap}>
                <div style={s.successIcon}>
                  <CheckCircle size={36} color="#2DD4BF" />
                </div>
                <h4 style={s.successTitle}>Đặt chỗ thành công!</h4>
                <p style={s.successSub}>Giao dịch của bạn đã được xác nhận.</p>
                <div style={s.successDetails}>
                  {[
                    ['Mã hóa đơn', `${paymentResult?.id?.substring(0,8)}...`],
                    ['Mã giao dịch', paymentResult?.transactionId || 'MOCK-TXN-12345'],
                    ['Phương thức', paymentResult?.method],
                    ['Số tiền', `${paymentResult?.amount?.toLocaleString('vi-VN')} VNĐ`],
                  ].map(([label, val]) => (
                    <div key={label} style={s.successRow}>
                      <span style={s.successLabel}>{label}</span>
                      <strong style={{ color: '#F8FAFC', fontSize: '13px' }}>{val}</strong>
                    </div>
                  ))}
                </div>
                <button
                  style={s.doneBtn}
                  onClick={() => { setShowPaymentModal(false); setCheckIn(''); setCheckOut(''); setBookingNote('') }}
                >
                  <CheckCircle size={15} /> Hoàn tất
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const s = {
  // Loading
  loadingPage: {
    minHeight: '100vh', background: 'var(--bg-dark)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  loadingBg: {
    position: 'absolute', inset: 0,
    backgroundImage: `radial-gradient(ellipse at 50% 50%, rgba(56,189,248,0.06) 0%, transparent 60%)`,
  },
  loadingContent: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
    position: 'relative', zIndex: 1,
  },
  loadingIconWrap: {
    width: '68px', height: '68px', borderRadius: '50%',
    background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  loadingText: { fontSize: '14px', color: '#64748B' },

  notFoundPage: {
    minHeight: '100vh', background: 'var(--bg-dark)',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px',
  },
  backBtnPlain: {
    padding: '10px 20px', borderRadius: '10px',
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#F8FAFC', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit',
  },

  // Page
  page: { minHeight: '100vh', background: 'var(--bg-dark)' },

  // Hero
  heroWrap: { position: 'relative', height: '380px', overflow: 'hidden' },
  heroImg: { width: '100%', height: '100%', objectFit: 'cover' },
  heroOverlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(to top, rgba(10,15,30,0.95) 0%, rgba(10,15,30,0.4) 40%, rgba(10,15,30,0.5) 100%)',
  },
  heroMesh: {
    position: 'absolute', inset: 0,
    backgroundImage: `radial-gradient(ellipse at 20% 80%, rgba(56,189,248,0.08) 0%, transparent 40%)`,
    pointerEvents: 'none',
  },
  backBtn: {
    position: 'absolute', top: '20px', left: '20px', zIndex: 2,
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '8px 16px', borderRadius: '10px',
    background: 'rgba(10,15,30,0.65)', backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: 'rgba(248,250,252,0.9)', fontSize: '13px', fontWeight: '500',
    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
  },
  heroActions: {
    position: 'absolute', top: '20px', right: '20px', zIndex: 2,
    display: 'flex', gap: '8px',
  },
  actionBtn: {
    width: '40px', height: '40px', borderRadius: '50%',
    background: 'rgba(10,15,30,0.65)', backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.12)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'all 0.2s',
  },
  actionBtnLiked: { background: 'rgba(239,68,68,0.2)', borderColor: 'rgba(239,68,68,0.4)' },
  heroTitleWrap: {
    position: 'absolute', bottom: '28px', left: '28px', right: '28px', zIndex: 2,
  },
  heroCatBadge: {
    display: 'inline-block', fontSize: '11px', fontWeight: '700',
    padding: '4px 12px', borderRadius: '6px', marginBottom: '10px',
    background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.3)',
    color: '#38BDF8', letterSpacing: '0.05em',
  },
  heroName: {
    fontSize: '32px', fontWeight: '900', color: '#F8FAFC',
    letterSpacing: '-0.5px', marginBottom: '8px', lineHeight: 1.2,
    textShadow: '0 2px 12px rgba(0,0,0,0.5)',
  },
  heroAddr: {
    display: 'flex', alignItems: 'center', gap: '6px',
    fontSize: '13px', color: 'rgba(248,250,252,0.7)',
  },

  // Body layout
  body: {
    maxWidth: '1200px', margin: '0 auto',
    padding: '28px 24px 60px',
    display: 'grid', gridTemplateColumns: '1fr 300px', gap: '22px',
  },
  main: { display: 'flex', flexDirection: 'column', gap: '18px' },
  sidebar: { display: 'flex', flexDirection: 'column', gap: '16px' },

  // Card (main)
  card: {
    background: 'var(--bg-surface)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '18px', padding: '22px',
  },

  // Info top
  infoTopRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: '16px', marginBottom: '20px',
    flexWrap: 'wrap',
  },
  statsRow: { display: 'flex', alignItems: 'center', gap: '0' },
  statItem: { textAlign: 'center', padding: '0 20px' },
  statNum: {
    fontSize: '22px', fontWeight: '800',
    background: 'linear-gradient(135deg, #38BDF8, #818CF8)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
    marginBottom: '3px',
  },
  statLabel: { fontSize: '11px', color: '#64748B' },
  statDivider: {
    width: '1px', height: '36px',
    background: 'rgba(255,255,255,0.06)',
  },
  addToTripBtn: {
    display: 'flex', alignItems: 'center', gap: '7px',
    padding: '10px 18px', borderRadius: '10px', border: 'none',
    background: 'linear-gradient(135deg, #38BDF8, #818CF8)',
    color: '#0A0F1E', fontSize: '13px', fontWeight: '700',
    cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
    boxShadow: '0 0 16px rgba(56,189,248,0.3)',
    transition: 'all 0.2s ease',
  },

  // Detail items
  detailsRow: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px',
  },
  detailItem: {
    display: 'flex', gap: '12px', alignItems: 'center',
    padding: '14px 16px', borderRadius: '12px',
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
  },
  detailIcon: {
    width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
    background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.15)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  detailLabel: { fontSize: '11px', color: '#64748B', marginBottom: '3px', fontWeight: '500' },
  detailVal: { fontSize: '14px', fontWeight: '600', color: '#F8FAFC' },
  description: { fontSize: '14px', color: '#94A3B8', lineHeight: 1.75 },

  // Reviews
  reviewHeader: { marginBottom: '20px' },
  reviewTitle: { fontSize: '17px', fontWeight: '700', color: '#F8FAFC' },
  reviewCount: { color: '#64748B', fontWeight: '400' },
  reviewForm: {
    marginBottom: '24px', paddingBottom: '20px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  reviewFormHeader: { display: 'flex', gap: '14px' },
  reviewAvatar: {
    width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
    background: 'linear-gradient(135deg, #38BDF8, #818CF8)',
    color: '#0A0F1E', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '15px', fontWeight: '700',
  },
  starPickerRow: {
    display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px',
  },
  starPickerLabel: { fontSize: '13px', color: '#64748B', marginRight: '4px' },
  reviewTextarea: {
    width: '100%', boxSizing: 'border-box',
    padding: '10px 14px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px', fontSize: '13px',
    color: '#F8FAFC', fontFamily: 'inherit',
    resize: 'vertical', outline: 'none',
    marginBottom: '10px',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  reviewSubmitBtn: {
    display: 'flex', alignItems: 'center', gap: '7px',
    padding: '9px 20px', borderRadius: '8px', border: 'none',
    background: 'linear-gradient(135deg, #38BDF8, #818CF8)',
    color: '#0A0F1E', fontSize: '13px', fontWeight: '700',
    cursor: 'pointer', fontFamily: 'inherit',
  },
  loginPrompt: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 16px', borderRadius: '10px',
    background: 'rgba(56,189,248,0.05)', border: '1px solid rgba(56,189,248,0.15)',
    marginBottom: '20px', gap: '12px',
  },
  loginPromptText: { fontSize: '13px', color: '#64748B' },
  loginPromptBtn: {
    padding: '7px 16px', borderRadius: '8px', border: 'none',
    background: 'linear-gradient(135deg, #38BDF8, #818CF8)',
    color: '#0A0F1E', fontSize: '12px', fontWeight: '700',
    cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
  },
  noReview: {
    textAlign: 'center', padding: '32px', color: '#64748B',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
    fontSize: '13px',
  },
  reviewList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  reviewItem: {
    padding: '14px 16px', borderRadius: '12px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  reviewItemHeader: { display: 'flex', gap: '12px', marginBottom: '10px' },
  reviewerAvatar: {
    width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
    background: 'rgba(129,140,248,0.15)', border: '1px solid rgba(129,140,248,0.25)',
    color: '#818CF8', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '13px', fontWeight: '700',
  },
  reviewerTopRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' },
  reviewerName: { fontSize: '13px', fontWeight: '600', color: '#F8FAFC' },
  deleteReviewBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#EF4444', padding: '3px 6px', borderRadius: '6px',
    display: 'flex', alignItems: 'center', transition: 'all 0.2s',
  },
  starsRow: { display: 'flex', gap: '2px' },
  reviewComment: { fontSize: '13px', color: '#94A3B8', lineHeight: 1.65 },

  // Sidebar cards
  sideCard: {
    background: 'var(--bg-surface)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px', padding: '18px',
  },
  sideCardHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px',
  },
  sideCardTitle: { fontSize: '15px', fontWeight: '700', color: '#F8FAFC' },
  slotsTag: {
    fontSize: '11px', fontWeight: '600', color: '#F59E0B',
    background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
    padding: '3px 10px', borderRadius: '6px',
  },

  // Booking form
  bookingForm: { display: 'flex', flexDirection: 'column', gap: '12px' },
  bookingField: { display: 'flex', flexDirection: 'column', gap: '6px' },
  bookingLabel: {
    display: 'flex', alignItems: 'center', gap: '5px',
    fontSize: '11px', fontWeight: '600', color: '#64748B', letterSpacing: '0.03em',
  },
  bookingInput: {
    width: '100%', boxSizing: 'border-box',
    padding: '10px 12px', borderRadius: '10px',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
    color: '#F8FAFC', fontSize: '13px', fontFamily: 'inherit', outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  bookingTextarea: {
    width: '100%', boxSizing: 'border-box',
    padding: '10px 12px', borderRadius: '10px',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
    color: '#F8FAFC', fontSize: '13px', fontFamily: 'inherit', outline: 'none',
    resize: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  pricePreview: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 14px', borderRadius: '10px',
    background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.15)',
    fontSize: '12px',
  },
  pricePreviewLabel: { color: '#64748B' },
  pricePreviewVal: { color: '#38BDF8', fontWeight: '700', fontSize: '14px' },
  bookingBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    padding: '12px', borderRadius: '10px', border: 'none',
    background: 'linear-gradient(135deg, #38BDF8, #818CF8)',
    color: '#0A0F1E', fontSize: '13px', fontWeight: '700',
    cursor: 'pointer', fontFamily: 'inherit',
    boxShadow: '0 0 16px rgba(56,189,248,0.3)',
    transition: 'all 0.2s ease',
  },

  // Map
  mapWrap: { marginBottom: '12px', borderRadius: '10px', overflow: 'hidden' },
  mapLink: {
    display: 'flex', alignItems: 'center', gap: '6px',
    fontSize: '13px', color: '#38BDF8', fontWeight: '600',
    textDecoration: 'none', padding: '4px 0',
    transition: 'gap 0.2s',
  },

  // Modal
  modalOverlay: {
    position: 'fixed', inset: 0, zIndex: 1000,
    background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
  },
  modalCard: {
    background: 'var(--bg-surface)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px', width: '100%', maxWidth: '460px',
    padding: '28px', boxSizing: 'border-box',
    boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
  },
  modalHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '20px', paddingBottom: '16px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  modalTitle: { fontSize: '17px', fontWeight: '700', color: '#F8FAFC' },
  modalCloseBtn: {
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px', width: '34px', height: '34px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: '#64748B', transition: 'all 0.2s',
  },

  // Summary
  summaryCard: {
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px', padding: '14px 16px',
    display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px',
  },
  summaryRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    fontSize: '13px', color: '#64748B',
  },
  summaryVal: { color: '#F8FAFC', fontSize: '13px' },
  summaryTotalRow: {
    borderTop: '1px solid rgba(255,255,255,0.06)',
    paddingTop: '10px', marginTop: '4px',
  },
  totalPrice: { color: '#38BDF8', fontSize: '16px', fontWeight: '800' },

  // Payment methods
  payMethodSection: { marginBottom: '20px' },
  payMethodLabel: { fontSize: '12px', fontWeight: '600', color: '#64748B', marginBottom: '10px' },
  payMethodGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' },
  payMethodCard: {
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px', padding: '14px 8px',
    textAlign: 'center', cursor: 'pointer',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
    background: 'rgba(255,255,255,0.03)',
    transition: 'all 0.2s ease',
  },
  payMethodIcon: { fontSize: '22px' },
  payMethodName: { fontSize: '11px', fontWeight: '600', color: '#94A3B8' },
  confirmBtn: {
    width: '100%', padding: '13px', borderRadius: '12px', border: 'none',
    background: 'linear-gradient(135deg, #38BDF8, #818CF8)',
    color: '#0A0F1E', fontSize: '14px', fontWeight: '700',
    cursor: 'pointer', fontFamily: 'inherit',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    boxShadow: '0 0 24px rgba(56,189,248,0.3)',
    transition: 'all 0.2s',
  },

  // Success
  successWrap: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: '12px', textAlign: 'center',
  },
  successIcon: {
    width: '72px', height: '72px', borderRadius: '50%',
    background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.25)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  successTitle: { fontSize: '18px', fontWeight: '800', color: '#F8FAFC' },
  successSub: { fontSize: '13px', color: '#64748B' },
  successDetails: {
    width: '100%', background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px',
    padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px',
  },
  successRow: {
    display: 'flex', justifyContent: 'space-between',
    fontSize: '12px', color: '#64748B',
  },
  successLabel: { fontSize: '12px' },
  doneBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    width: '100%', padding: '12px', borderRadius: '12px', border: 'none',
    background: 'linear-gradient(135deg, #2DD4BF, #38BDF8)',
    color: '#0A0F1E', fontSize: '14px', fontWeight: '700',
    cursor: 'pointer', fontFamily: 'inherit',
  },
}

export default PlaceDetail