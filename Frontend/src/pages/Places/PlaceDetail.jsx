import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Star, MapPin, Clock, Ticket, Heart, Share2, Plus, Trash2, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import placeService from '../../services/placeService'

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

  // 1. Tải thông tin chi tiết địa điểm và đánh giá từ Database
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

  useEffect(() => {
    loadPlaceData()
  }, [id])

  // 2. Xử lý yêu thích địa điểm
  const handleLike = async () => {
    try {
      if (liked) {
        await placeService.unlikePlace(id)
        setLiked(false)
      } else {
        await placeService.likePlace(id)
        setLiked(true)
      }
    } catch (err) {
      console.error(err)
      alert('Vui lòng đăng nhập để thực hiện chức năng yêu thích địa điểm!')
    }
  }

  // 3. Xử lý gửi đánh giá
  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!reviewText.trim()) return
    try {
      const payload = {
        placeId: id,
        rating,
        comment: reviewText,
        photos: ''
      }
      await placeService.createReview(payload)
      setReviewText('')
      setRating(5)

      // Load lại thông tin địa điểm (để lấy avg_rating mới) và reviews
      const placeRes = await placeService.getPlaceById(id)
      setPlace(placeRes.data.result)
      const reviewsRes = await placeService.getReviews(id)
      setReviews(reviewsRes.data.result || [])
    } catch (err) {
      console.error(err)
      alert('Gửi đánh giá thất bại. Vui lòng đăng nhập và thử lại!')
    }
  }

  // 4. Xử lý xóa đánh giá của chính mình
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return
    try {
      await placeService.deleteReview(reviewId)
      
      // Load lại dữ liệu mới nhất
      const placeRes = await placeService.getPlaceById(id)
      setPlace(placeRes.data.result)
      const reviewsRes = await placeService.getReviews(id)
      setReviews(reviewsRes.data.result || [])
    } catch (err) {
      console.error(err)
      alert('Xóa đánh giá thất bại.')
    }
  }

  if (loading) return (
    <div style={styles.loadingWrap}>
      <Loader2 size={36} color="#185FA5" className="animate-spin" />
      <p style={{ marginTop: '12px', color: '#666' }}>Đang tải thông tin chi tiết địa điểm...</p>
    </div>
  )

  if (!place) return (
    <div style={styles.notFound}>
      <p>Không tìm thấy địa điểm hoặc đã bị ẩn.</p>
      <button style={styles.backBtnPlain} onClick={() => navigate('/places')}>Quay lại</button>
    </div>
  )

  const mapsUrl = 'https://maps.google.com/?q=' + encodeURIComponent(place.address)

  return (
    <div style={styles.page}>
      {/* HERO IMAGE BANNER */}
      <div style={styles.heroWrap}>
        <img
          src={place.photos || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80'}
          alt={place.name}
          style={styles.heroImg}
          onError={e => e.target.src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80'}
        />
        <div style={styles.heroOverlay} />
        <button style={styles.backBtn} onClick={() => navigate('/places')}>
          <ArrowLeft size={16} /> Quay lại
        </button>
        <div style={styles.heroActions}>
          <button
            style={{ ...styles.actionBtn, ...(liked ? styles.actionBtnLiked : {}) }}
            onClick={handleLike}
          >
            <Heart size={16} fill={liked ? '#A32D2D' : 'none'} color={liked ? '#A32D2D' : '#555'} />
          </button>
          <button style={styles.actionBtn}>
            <Share2 size={16} color="#555" />
          </button>
        </div>
      </div>

      <div style={styles.body}>
        <div style={styles.main}>
          {/* PLACE INFO CARD */}
          <div style={styles.infoCard}>
            <div style={styles.infoTop}>
              <div>
                <span style={styles.catBadge}>{place.placeCategory?.name || 'Du lịch'}</span>
                <h1 style={styles.name}>{place.name}</h1>
                <p style={styles.addr}><MapPin size={13} color="#aaa" /> {place.address}</p>
              </div>
              <button
                style={styles.addBtn}
                onClick={() => navigate(user ? '/trips/create' : '/login')}
              >
                <Plus size={16} /> Thêm vào lịch trình
              </button>
            </div>

            <div style={styles.statsRow}>
              <div style={styles.statItem}>
                <div style={styles.statNum}>{place.avg_rating ? place.avg_rating.toFixed(1) : '5.0'}</div>
                <div style={styles.statLbl}>Điểm đánh giá</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statNum}>{reviews.length}</div>
                <div style={styles.statLbl}>Đánh giá</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statNum}>{place.max_slots !== null ? place.max_slots : 'Vô hạn'}</div>
                <div style={styles.statLbl}>Slots booking</div>
              </div>
            </div>

            <div style={styles.detailRow}>
              <div style={styles.detailItem}>
                <Clock size={14} color="#888" />
                <div>
                  <div style={styles.detailLabel}>Giờ mở cửa</div>
                  <div style={styles.detailVal}>{place.opening_hours || 'Cả ngày'}</div>
                </div>
              </div>
              <div style={styles.detailItem}>
                <Ticket size={14} color="#888" />
                <div>
                  <div style={styles.detailLabel}>Tầm giá</div>
                  <div style={styles.detailVal}>{place.price_range || 'Liên hệ'}</div>
                </div>
              </div>
            </div>

            <p style={styles.desc}>{place.description || 'Không có mô tả chi tiết cho địa điểm này.'}</p>
          </div>

          {/* REVIEWS SECTION */}
          <div style={styles.reviewCard}>
            <h3 style={styles.reviewTitle}>Đánh giá ({reviews.length})</h3>

            {/* Form viết review (chỉ hiện khi đã đăng nhập) */}
            {user ? (
              <form onSubmit={handleReviewSubmit} style={styles.reviewForm}>
                <div style={styles.ratingRow}>
                  <span style={styles.ratingLabel}>Chọn số sao đánh giá:</span>
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star
                      key={s} size={20}
                      fill={s <= rating ? '#854F0B' : 'none'}
                      color={s <= rating ? '#854F0B' : '#ccc'}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setRating(s)}
                    />
                  ))}
                </div>
                <textarea
                  style={styles.reviewInput}
                  placeholder="Chia sẻ trải nghiệm thực tế của bạn về địa điểm này..."
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  rows={3}
                  required
                />
                <button type="submit" style={styles.reviewSubmit}>Gửi đánh giá</button>
              </form>
            ) : (
              <div style={styles.loginPrompt}>
                <span>Đăng nhập để viết đánh giá cho địa điểm này.</span>
                <button style={styles.loginBtn} onClick={() => navigate('/login')}>Đăng nhập</button>
              </div>
            )}

            {/* Danh sách review */}
            {reviews.length === 0 ? (
              <p style={styles.noReview}>Chưa có đánh giá nào. Hãy là người đầu tiên chia sẻ cảm nghĩ của bạn!</p>
            ) : (
              <div style={styles.reviewList}>
                {reviews.map(r => {
                  const isReviewOwner = user && r.user?.username === user.username
                  return (
                    <div key={r.id} style={styles.reviewItem}>
                      <div style={styles.reviewHeader}>
                        <div style={styles.avatar}>
                          {r.user?.full_name ? r.user.full_name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={styles.reviewerName}>{r.user?.full_name || r.user?.username || 'Thành viên'}</div>
                            {isReviewOwner && (
                              <button
                                style={styles.deleteReviewBtn}
                                onClick={() => handleDeleteReview(r.id)}
                                title="Xóa đánh giá của bạn"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                          <div style={styles.reviewMeta}>
                            <div style={styles.stars}>
                              {[1, 2, 3, 4, 5].map(s => (
                                <Star key={s} size={12}
                                  fill={s <= r.rating ? '#854F0B' : 'none'}
                                  color={s <= r.rating ? '#854F0B' : '#ccc'}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <p style={styles.reviewContent}>{r.comment}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* MAP SIDEBAR COLUMN */}
        <div style={styles.sidebar}>
          <div style={styles.mapBox}>
            <iframe
              width="100%"
              height="180"
              style={{ border: 0, display: 'block' }}
              loading="lazy"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(place.address)}&output=embed`}
              title="Google Maps"
            />
            <div style={styles.mapFooter}>
              <MapPin size={13} color="#185FA5" style={{ flexShrink: 0 }} />
              <a href={mapsUrl} target="_blank" rel="noreferrer" style={styles.mapLink}>
                Mở Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f2f0ea', paddingBottom: '40px' },
  loadingWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
  },
  notFound: { textAlign: 'center', padding: '60px', color: '#888' },
  backBtnPlain: { padding: '8px 16px', borderRadius: '8px', border: '1px solid #ddd', cursor: 'pointer', fontFamily: 'inherit' },

  heroWrap: { position: 'relative', height: '320px', overflow: 'hidden' },
  heroImg: { width: '100%', height: '100%', objectFit: 'cover' },
  heroOverlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 50%)',
  },
  backBtn: {
    position: 'absolute', top: '16px', left: '16px',
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '7px 14px', borderRadius: '8px',
    backgroundColor: 'rgba(255,255,255,0.9)',
    border: 'none', cursor: 'pointer',
    fontSize: '13px', fontWeight: '500', fontFamily: 'inherit',
  },
  heroActions: {
    position: 'absolute', top: '16px', right: '16px',
    display: 'flex', gap: '8px',
  },
  actionBtn: {
    width: '36px', height: '36px', borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  actionBtnLiked: { backgroundColor: '#FCEBEB' },

  body: {
    maxWidth: '1200px', margin: '0 auto',
    padding: '24px', display: 'grid',
    gridTemplateColumns: '1fr 280px', gap: '20px',
  },
  main: { display: 'flex', flexDirection: 'column', gap: '16px' },

  infoCard: {
    backgroundColor: '#fff', borderRadius: '14px',
    border: '1px solid #eee', padding: '20px',
  },
  infoTop: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '16px', gap: '12px',
  },
  catBadge: {
    display: 'inline-block',
    fontSize: '11px', padding: '3px 10px', borderRadius: '20px',
    backgroundColor: '#E6F1FB', color: '#185FA5',
    fontWeight: '500', marginBottom: '8px',
  },
  name: { fontSize: '22px', fontWeight: '700', marginBottom: '6px', color: '#1a1a18' },
  addr: {
    fontSize: '13px', color: '#aaa',
    display: 'flex', alignItems: 'center', gap: '4px',
  },
  addBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '8px 16px', borderRadius: '8px',
    backgroundColor: '#185FA5', color: '#fff',
    border: 'none', cursor: 'pointer',
    fontSize: '13px', fontWeight: '500',
    whiteSpace: 'nowrap', fontFamily: 'inherit',
  },
  statsRow: {
    display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
    borderTop: '1px solid #eee', borderBottom: '1px solid #eee',
    margin: '0 0 16px', padding: '12px 0',
  },
  statItem: { textAlign: 'center' },
  statNum: { fontSize: '20px', fontWeight: '700', color: '#185FA5', marginBottom: '2px' },
  statLbl: { fontSize: '11px', color: '#aaa' },
  detailRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' },
  detailItem: {
    display: 'flex', gap: '8px', alignItems: 'flex-start',
    padding: '10px', backgroundColor: '#f7f6f2', borderRadius: '8px',
  },
  detailLabel: { fontSize: '11px', color: '#aaa', marginBottom: '2px' },
  detailVal: { fontSize: '13px', fontWeight: '500', color: '#1a1a18' },
  desc: { fontSize: '14px', color: '#555', lineHeight: 1.7 },

  reviewCard: {
    backgroundColor: '#fff', borderRadius: '14px',
    border: '1px solid #eee', padding: '20px',
  },
  reviewTitle: { fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#1a1a18' },
  reviewForm: { marginBottom: '24px', borderBottom: '1px solid #eee', paddingBottom: '20px' },
  ratingRow: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' },
  ratingLabel: { fontSize: '13px', color: '#555', marginRight: '4px' },
  reviewInput: {
    width: '100%', padding: '10px 12px',
    border: '1px solid #ddd', borderRadius: '8px',
    fontSize: '13px', resize: 'vertical',
    fontFamily: 'inherit', marginBottom: '10px',
    boxSizing: 'border-box', color: '#1a1a18',
  },
  reviewSubmit: {
    padding: '8px 20px', borderRadius: '8px',
    backgroundColor: '#185FA5', color: '#fff',
    border: 'none', cursor: 'pointer',
    fontSize: '13px', fontWeight: '500', fontFamily: 'inherit',
  },
  loginPrompt: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px', backgroundColor: '#f7f6f2',
    borderRadius: '8px', marginBottom: '16px',
    fontSize: '13px', color: '#555',
  },
  loginBtn: {
    padding: '6px 14px', borderRadius: '6px',
    backgroundColor: '#185FA5', color: '#fff',
    border: 'none', cursor: 'pointer',
    fontSize: '12px', fontFamily: 'inherit',
  },
  noReview: { fontSize: '13px', color: '#aaa', textAlign: 'center', padding: '20px' },
  reviewList: { display: 'flex', flexDirection: 'column', gap: '14px' },
  reviewItem: { padding: '12px', backgroundColor: '#f7f6f2', borderRadius: '10px' },
  reviewHeader: { display: 'flex', gap: '10px', marginBottom: '8px' },
  avatar: {
    width: '32px', height: '32px', borderRadius: '50%',
    backgroundColor: '#185FA5', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '13px', fontWeight: '600', flexShrink: 0,
  },
  reviewerName: { fontSize: '13px', fontWeight: '600', color: '#1a1a18' },
  reviewMeta: { display: 'flex', alignItems: 'center', gap: '8px' },
  stars: { display: 'flex', gap: '2px' },
  reviewContent: { fontSize: '13px', color: '#555', lineHeight: 1.6 },

  deleteReviewBtn: {
    border: 'none',
    backgroundColor: 'transparent',
    color: '#A32D2D',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: '#FCEBEB',
    }
  },

  sidebar: { display: 'flex', flexDirection: 'column', gap: '12px' },
  mapBox: {
    backgroundColor: '#fff', borderRadius: '14px',
    border: '1px solid #eee', overflow: 'hidden',
  },
  mapFooter: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '10px 12px',
    borderTop: '1px solid #eee',
    backgroundColor: '#fff',
  },
  mapLink: {
    fontSize: '12px', color: '#185FA5',
    textDecoration: 'none', fontWeight: '500',
  },
}

export default PlaceDetail