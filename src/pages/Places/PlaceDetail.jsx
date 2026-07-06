import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Star, MapPin, Clock, Ticket, Heart, Share2, Plus } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const MOCK_PLACES = [
  {
    id: '1', name: 'Hồ Gươm', type: 'attraction',
    category: 'Văn hóa', city: 'Hà Nội',
    address: 'Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội',
    description: 'Hồ Gươm (Hồ Hoàn Kiếm) là hồ nước nằm giữa trung tâm thành phố Hà Nội. Đây là thắng cảnh nổi tiếng gắn liền với nhiều sự kiện lịch sử và truyền thuyết của người Việt.',
    avg_rating: 4.9, review_count: 312, price_range: 'Miễn phí',
    opening_hours: '6:00 - 22:00', is_visible: true,
    photos: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&q=80',
    reviews: [
      { id: 'r1', user: { full_name: 'Trần Bảo' }, rating: 5, content: 'Cảnh đẹp, không khí trong lành buổi sáng.', create_at: '2025-07-01' },
      { id: 'r2', user: { full_name: 'Lê Hương' }, rphotos: 'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?w=800&q=80',ating: 4, content: 'Địa điểm check-in lý tưởng, rất ý nghĩa về lịch sử.', create_at: '2025-06-28' },
    ],
  },
  {
    id: '2', name: 'Phở Bát Đàn', type: 'restaurant',
    category: 'Ẩm thực', city: 'Hà Nội',
    address: '49 Bát Đàn, Hoàn Kiếm, Hà Nội',
    description: 'Quán phở bò nổi tiếng bậc nhất Hà Nội với hơn 60 năm lịch sử.',
    avg_rating: 4.7, review_count: 189, price_range: '40k - 80k',
    opening_hours: '6:00 - 10:00', is_visible: true,
    photos: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&q=80',
    reviews: [
      { id: 'r1', user: { full_name: 'Phạm Lan' }, rating: 5, content: 'Phở ngon nhất Hà Nội!', create_at: '2025-07-01' },
    ],
  },
  {
    id: '3', name: 'Văn Miếu - Quốc Tử Giám', type: 'attraction',
    category: 'Lịch sử', city: 'Hà Nội',
    address: '58 Quốc Tử Giám, Đống Đa, Hà Nội',
    description: 'Trường đại học đầu tiên của Việt Nam, được xây dựng từ năm 1070.',
    avg_rating: 4.8, review_count: 241, price_range: '30k/người',
    opening_hours: '8:00 - 17:00', is_visible: true,
    photos: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&q=80',
    reviews: [],
  },
  {
    id: '4', name: 'Bãi biển Mỹ Khê', type: 'attraction',
    category: 'Thiên nhiên', city: 'Đà Nẵng',
    address: 'Sơn Trà, Đà Nẵng',
    description: 'Một trong những bãi biển đẹp nhất Việt Nam, cát trắng nước trong.',
    avg_rating: 4.8, review_count: 276, price_range: 'Miễn phí',
    opening_hours: '24/7', is_visible: true,
    photos: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80',
    reviews: [],
  },
  {
    id: '5', name: 'Bà Nà Hills', type: 'attraction',
    category: 'Check-in', city: 'Đà Nẵng',
    address: 'Hòa Ninh, Hòa Vang, Đà Nẵng',
    description: 'Khu du lịch nổi tiếng với cầu Vàng và khí hậu mát mẻ quanh năm.',
    avg_rating: 4.6, review_count: 334, price_range: '750k/người',
    opening_hours: '7:00 - 22:00', is_visible: true,
    photos: 'https://images.unsplash.com/photo-1528702748617-c64d49f918af?w=800&q=80',
    reviews: [],
  },
  {
    id: '6', name: 'Phố cổ Hội An', type: 'attraction',
    category: 'Văn hóa', city: 'Hội An',
    address: 'Minh An, Hội An, Quảng Nam',
    description: 'Di sản văn hóa thế giới UNESCO với những con phố đèn lồng rực rỡ.',
    avg_rating: 4.9, review_count: 298, price_range: '120k/người',
    opening_hours: '24/7', is_visible: true,
    photos: 'https://images.unsplash.com/photo-1540779691674-b4e9db1a3e63?w=800&q=80',
    reviews: [],
  },
  {
    id: '7', name: 'Ruộng bậc thang Mù Cang Chải', type: 'attraction',
    category: 'Thiên nhiên', city: 'Sapa',
    address: 'Mù Cang Chải, Yên Bái',
    description: 'Cảnh quan ruộng bậc thang tuyệt đẹp, đặc biệt vào mùa lúa chín.',
    avg_rating: 4.7, review_count: 156, price_range: 'Miễn phí',
    opening_hours: '24/7', is_visible: true,
    photos: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    reviews: [],
  },
  {
    id: '8', name: 'Khách sạn Metropole Hà Nội', type: 'hotel',
    category: 'Lưu trú', city: 'Hà Nội',
    address: '15 Ngô Quyền, Hoàn Kiếm, Hà Nội',
    description: 'Khách sạn 5 sao lịch sử lâu đời nhất Hà Nội, xây dựng từ năm 1901.',
    avg_rating: 4.9, review_count: 423, price_range: '5tr - 20tr/đêm',
    opening_hours: '24/7', is_visible: true,
    photos: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    reviews: [],
  },
  {
    id: '9', name: 'Chả Cá Lã Vọng', type: 'restaurant',
    category: 'Ẩm thực', city: 'Hà Nội',
    address: '14 Chả Cá, Hoàn Kiếm, Hà Nội',
    description: 'Nhà hàng chuyên chả cá Hà Nội nổi tiếng hơn 100 năm tuổi.',
    avg_rating: 4.6, review_count: 167, price_range: '150k - 250k',
    opening_hours: '11:00 - 22:00', is_visible: true,
    photos: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80',
    reviews: [],
  },
]

const PlaceDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [liked, setLiked] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const [rating, setRating] = useState(5)
  const [reviews, setReviews] = useState(null)

  const place = MOCK_PLACES.find(p => p.id === id)

  if (!place) return (
    <div style={styles.notFound}>
      <p>Không tìm thấy địa điểm</p>
      <button style={styles.backBtnPlain} onClick={() => navigate('/places')}>Quay lại</button>
    </div>
  )

  const placeReviews = reviews || place.reviews

  const handleReview = (e) => {
    e.preventDefault()
    if (!reviewText.trim()) return
    const newReview = {
      id: 'new-' + Date.now(),
      user: { full_name: user?.full_name || 'Bạn' },
      rating,
      content: reviewText,
      create_at: new Date().toISOString().split('T')[0],
    }
    setReviews([newReview, ...placeReviews])
    setReviewText('')
    setRating(5)
  }

  const mapsUrl = 'https://maps.google.com/?q=' + encodeURIComponent(place.address)

  return (
    <div style={styles.page}>

      <div style={styles.heroWrap}>
        <img src={place.photos} alt={place.name} style={styles.heroImg} />
        <div style={styles.heroOverlay} />
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Quay lại
        </button>
        <div style={styles.heroActions}>
          <button
            style={{ ...styles.actionBtn, ...(liked ? styles.actionBtnLiked : {}) }}
            onClick={() => setLiked(!liked)}
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

          <div style={styles.infoCard}>
            <div style={styles.infoTop}>
              <div>
                <span style={styles.catBadge}>{place.category}</span>
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
                <div style={styles.statNum}>{place.avg_rating}</div>
                <div style={styles.statLbl}>Điểm đánh giá</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statNum}>{place.review_count}</div>
                <div style={styles.statLbl}>Đánh giá</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statNum}>{liked ? '1k+' : '999'}</div>
                <div style={styles.statLbl}>Yêu thích</div>
              </div>
            </div>

            <div style={styles.detailRow}>
              <div style={styles.detailItem}>
                <Clock size={14} color="#888" />
                <div>
                  <div style={styles.detailLabel}>Giờ mở cửa</div>
                  <div style={styles.detailVal}>{place.opening_hours}</div>
                </div>
              </div>
              <div style={styles.detailItem}>
                <Ticket size={14} color="#888" />
                <div>
                  <div style={styles.detailLabel}>Giá vé</div>
                  <div style={styles.detailVal}>{place.price_range}</div>
                </div>
              </div>
            </div>

            <p style={styles.desc}>{place.description}</p>
          </div>

          <div style={styles.reviewCard}>
            <h3 style={styles.reviewTitle}>Đánh giá ({placeReviews.length})</h3>

            {user ? (
              <form onSubmit={handleReview} style={styles.reviewForm}>
                <div style={styles.ratingRow}>
                  <span style={styles.ratingLabel}>Điểm của bạn:</span>
                  {[1,2,3,4,5].map(s => (
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
                  placeholder="Chia sẻ trải nghiệm của bạn..."
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  rows={3}
                />
                <button type="submit" style={styles.reviewSubmit}>Gửi đánh giá</button>
              </form>
            ) : (
              <div style={styles.loginPrompt}>
                <span>Đăng nhập để viết đánh giá</span>
                <button style={styles.loginBtn} onClick={() => navigate('/login')}>Đăng nhập</button>
              </div>
            )}

            {placeReviews.length === 0 ? (
              <p style={styles.noReview}>Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
            ) : (
              <div style={styles.reviewList}>
                {placeReviews.map(r => (
                  <div key={r.id} style={styles.reviewItem}>
                    <div style={styles.reviewHeader}>
                      <div style={styles.avatar}>{r.user.full_name.charAt(0)}</div>
                      <div style={{ flex: 1 }}>
                        <div style={styles.reviewerName}>{r.user.full_name}</div>
                        <div style={styles.reviewMeta}>
                          <div style={styles.stars}>
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} size={12}
                                fill={s <= r.rating ? '#854F0B' : 'none'}
                                color={s <= r.rating ? '#854F0B' : '#ccc'}
                              />
                            ))}
                          </div>
                          <span style={styles.reviewDate}>{r.create_at}</span>
                        </div>
                      </div>
                    </div>
                    <p style={styles.reviewContent}>{r.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

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
                <MapPin size={13} color="#185FA5" />
                <a href={mapsUrl} target="_blank" rel="noreferrer" style={styles.mapLink}>
                Mở Google Maps
                </a>
            </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f2f0ea' },
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
  reviewForm: { marginBottom: '20px' },
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
  reviewerName: { fontSize: '13px', fontWeight: '600', marginBottom: '3px', color: '#1a1a18' },
  reviewMeta: { display: 'flex', alignItems: 'center', gap: '8px' },
  stars: { display: 'flex', gap: '2px' },
  reviewDate: { fontSize: '11px', color: '#aaa' },
  reviewContent: { fontSize: '13px', color: '#555', lineHeight: 1.6 },

  sidebar: { display: 'flex', flexDirection: 'column', gap: '12px' },
  mapBox: {
    backgroundColor: '#fff', borderRadius: '14px',
    border: '1px solid #eee', overflow: 'hidden',
  },
  addBtnFull: {
    width: '100%', padding: '11px',
    backgroundColor: '#185FA5', color: '#fff',
    border: 'none', borderRadius: '10px',
    fontSize: '14px', fontWeight: '600',
    cursor: 'pointer', fontFamily: 'inherit',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: '8px',
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