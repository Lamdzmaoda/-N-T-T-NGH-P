import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Star, Heart, MapPin, Filter } from 'lucide-react'

const MOCK_PLACES = [
  {
    id: '1', name: 'Hồ Gươm', type: 'attraction',
    category: 'Văn hóa', city: 'Hà Nội',
    address: 'Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội',
    description: 'Hồ nước nằm giữa trung tâm thành phố Hà Nội, gắn liền với nhiều sự kiện lịch sử.',
    avg_rating: 4.9, review_count: 312, price_range: 'Miễn phí',
    opening_hours: '6:00 – 22:00', is_visible: true,
    photos: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=500&q=80',
  },
  {
    id: '2', name: 'Phở Bát Đàn', type: 'restaurant',
    category: 'Ẩm thực', city: 'Hà Nội',
    address: '49 Bát Đàn, Hoàn Kiếm, Hà Nội',
    description: 'Quán phở bò nổi tiếng bậc nhất Hà Nội, xếp hàng từ sáng sớm.',
    avg_rating: 4.7, review_count: 189, price_range: '40k – 80k',
    opening_hours: '6:00 – 10:00', is_visible: true,
    photos: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=500&q=80',
  },
  {
    id: '3', name: 'Văn Miếu – Quốc Tử Giám', type: 'attraction',
    category: 'Lịch sử', city: 'Hà Nội',
    address: '58 Quốc Tử Giám, Đống Đa, Hà Nội',
    description: 'Trường đại học đầu tiên của Việt Nam, di tích lịch sử quan trọng.',
    avg_rating: 4.8, review_count: 241, price_range: '30k/người',
    opening_hours: '8:00 – 17:00', is_visible: true,
    photos: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=500&q=80',
  },
  {
    id: '4', name: 'Bãi biển Mỹ Khê', type: 'attraction',
    category: 'Thiên nhiên', city: 'Đà Nẵng',
    address: 'Sơn Trà, Đà Nẵng',
    description: 'Một trong những bãi biển đẹp nhất Việt Nam, cát trắng nước trong.',
    avg_rating: 4.8, review_count: 276, price_range: 'Miễn phí',
    opening_hours: '24/7', is_visible: true,
    photos: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=500&q=80',
  },
  {
    id: '5', name: 'Bà Nà Hills', type: 'attraction',
    category: 'Check-in', city: 'Đà Nẵng',
    address: 'Hòa Ninh, Hòa Vang, Đà Nẵng',
    description: 'Khu du lịch nổi tiếng với cầu Vàng và khí hậu mát mẻ quanh năm.',
    avg_rating: 4.6, review_count: 334, price_range: '750k/người',
    opening_hours: '7:00 – 22:00', is_visible: true,
    photos: 'https://images.unsplash.com/photo-1528702748617-c64d49f918af?w=500&q=80',
  },
  {
    id: '6', name: 'Phố cổ Hội An', type: 'attraction',
    category: 'Văn hóa', city: 'Hội An',
    address: 'Minh An, Hội An, Quảng Nam',
    description: 'Di sản văn hóa thế giới UNESCO với những con phố đèn lồng rực rỡ.',
    avg_rating: 4.9, review_count: 298, price_range: '120k/người',
    opening_hours: '24/7', is_visible: true,
    photos: 'https://images.unsplash.com/photo-1540779691674-b4e9db1a3e63?w=500&q=80',
  },
  {
    id: '7', name: 'Ruộng bậc thang Mù Cang Chải', type: 'attraction',
    category: 'Thiên nhiên', city: 'Sapa',
    address: 'Mù Cang Chải, Yên Bái',
    description: 'Cảnh quan ruộng bậc thang tuyệt đẹp, đặc biệt vào mùa lúa chín tháng 9-10.',
    avg_rating: 4.7, review_count: 156, price_range: 'Miễn phí',
    opening_hours: '24/7', is_visible: true,
    photos: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&q=80',
  },
  {
    id: '8', name: 'Khách sạn Metropole Hà Nội', type: 'hotel',
    category: 'Lưu trú', city: 'Hà Nội',
    address: '15 Ngô Quyền, Hoàn Kiếm, Hà Nội',
    description: 'Khách sạn 5 sao lịch sử lâu đời nhất Hà Nội, xây dựng từ năm 1901.',
    avg_rating: 4.9, review_count: 423, price_range: '5tr – 20tr/đêm',
    opening_hours: '24/7', is_visible: true,
    photos: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80',
  },
  {
    id: '9', name: 'Chả Cá Lã Vọng', type: 'restaurant',
    category: 'Ẩm thực', city: 'Hà Nội',
    address: '14 Chả Cá, Hoàn Kiếm, Hà Nội',
    description: 'Nhà hàng chuyên chả cá Hà Nội nổi tiếng hơn 100 năm tuổi.',
    avg_rating: 4.6, review_count: 167, price_range: '150k – 250k',
    opening_hours: '11:00 – 22:00', is_visible: true,
    photos: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&q=80',
  },
]

const CATEGORIES = ['Tất cả', 'Văn hóa', 'Ẩm thực', 'Thiên nhiên', 'Check-in', 'Lịch sử', 'Lưu trú']
const CITIES = ['Tất cả', 'Hà Nội', 'Đà Nẵng', 'Đà Lạt', 'Hội An', 'Sapa']

const PlaceList = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('Tất cả')
  const [category, setCategory] = useState('Tất cả')
  const [liked, setLiked] = useState([])

  const toggleLike = (e, id) => {
    e.stopPropagation()
    setLiked(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const filtered = MOCK_PLACES.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.address.toLowerCase().includes(search.toLowerCase())
    const matchCity = city === 'Tất cả' || p.city === city
    const matchCat = category === 'Tất cả' || p.category === category
    return matchSearch && matchCity && matchCat
  })

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Khám phá địa điểm</h1>
        <p style={styles.headerSub}>Tìm kiếm nhà hàng, khách sạn và địa điểm tham quan</p>

        {/* Search */}
        <div style={styles.searchWrap}>
          <Search size={16} color="#aaa" style={{ flexShrink: 0 }} />
          <input
            style={styles.searchInput}
            placeholder="Tìm tên địa điểm, địa chỉ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div style={styles.body}>

        {/* FILTERS */}
        <div style={styles.filterBar}>

          {/* City */}
          <div style={styles.filterGroup}>
            <span style={styles.filterLabel}><MapPin size={13} /> Thành phố</span>
            <div style={styles.filterChips}>
              {CITIES.map(c => (
                <button
                  key={c}
                  style={{ ...styles.chip, ...(city === c ? styles.chipActive : {}) }}
                  onClick={() => setCity(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div style={styles.filterGroup}>
            <span style={styles.filterLabel}><Filter size={13} /> Loại</span>
            <div style={styles.filterChips}>
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  style={{ ...styles.chip, ...(category === c ? styles.chipActive : {}) }}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* RESULTS */}
        <div style={styles.results}>
          <span style={styles.resultCount}>
            {filtered.length} địa điểm
          </span>
        </div>

        {/* GRID */}
        {filtered.length === 0 ? (
          <div style={styles.empty}>
            <Search size={32} color="#ccc" />
            <p>Không tìm thấy địa điểm nào</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {filtered.map(place => (
              <div
                key={place.id}
                style={styles.card}
                onClick={() => navigate(`/places/${place.id}`)}
              >
                {/* Ảnh */}
                <div style={styles.imgWrap}>
                  <img
                    src={place.photos}
                    alt={place.name}
                    style={styles.img}
                    onError={e => e.target.src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&q=80'}
                  />
                  {/* Like button */}
                  <button
                    style={{
                      ...styles.likeBtn,
                      ...(liked.includes(place.id) ? styles.likeBtnActive : {})
                    }}
                    onClick={e => toggleLike(e, place.id)}
                  >
                    <Heart
                      size={15}
                      fill={liked.includes(place.id) ? '#A32D2D' : 'none'}
                      color={liked.includes(place.id) ? '#A32D2D' : '#fff'}
                    />
                  </button>
                  {/* Category badge */}
                  <span style={styles.catBadge}>{place.category}</span>
                </div>

                {/* Info */}
                <div style={styles.info}>
                  <h3 style={styles.placeName}>{place.name}</h3>
                  <p style={styles.placeAddr}>
                    <MapPin size={11} color="#aaa" /> {place.city}
                  </p>
                  <p style={styles.placeDesc}>{place.description}</p>
                  <div style={styles.placeMeta}>
                    <span style={styles.rating}>
                      <Star size={12} fill="#854F0B" color="#854F0B" />
                      {place.avg_rating} · {place.review_count} đánh giá
                    </span>
                    <span style={styles.price}>{place.price_range}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f2f0ea' },
  header: {
    backgroundColor: '#fff',
    borderBottom: '1px solid #eee',
    padding: '32px 24px 24px',
    textAlign: 'center',
  },
  headerTitle: { fontSize: '26px', fontWeight: '700', marginBottom: '6px', color: '#1a1a18' },
  headerSub: { fontSize: '14px', color: '#888', marginBottom: '20px' },
  searchWrap: {
    maxWidth: '500px', margin: '0 auto',
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 14px',
    border: '1px solid #ddd', borderRadius: '10px',
    backgroundColor: '#f7f6f2',
  },
  searchInput: {
    flex: 1, border: 'none', outline: 'none',
    fontSize: '14px', backgroundColor: 'transparent',
    color: '#1a1a18', fontFamily: 'inherit',
  },
  body: { maxWidth: '1200px', margin: '0 auto', padding: '24px' },
  filterBar: {
    backgroundColor: '#fff', borderRadius: '12px',
    border: '1px solid #eee', padding: '16px 20px',
    marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px',
  },
  filterGroup: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  filterLabel: {
    fontSize: '12px', fontWeight: '600', color: '#888',
    display: 'flex', alignItems: 'center', gap: '4px',
    minWidth: '80px',
  },
  filterChips: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  chip: {
    fontSize: '12px', padding: '4px 12px', borderRadius: '20px',
    border: '1px solid #eee', backgroundColor: '#fff',
    color: '#555', cursor: 'pointer', fontFamily: 'inherit',
  },
  chipActive: {
    backgroundColor: '#185FA5', color: '#fff',
    border: '1px solid #185FA5', fontWeight: '500',
  },
  results: { marginBottom: '14px' },
  resultCount: { fontSize: '13px', color: '#888', fontWeight: '500' },
  empty: {
    textAlign: 'center', padding: '60px',
    color: '#aaa', display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '12px', fontSize: '14px',
  },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px',
  },
  card: {
    backgroundColor: '#fff', borderRadius: '14px',
    border: '1px solid #eee', overflow: 'hidden',
    cursor: 'pointer', transition: 'box-shadow 0.2s',
  },
  imgWrap: { position: 'relative', height: '180px', overflow: 'hidden' },
  img: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  likeBtn: {
    position: 'absolute', top: '10px', right: '10px',
    width: '32px', height: '32px', borderRadius: '50%',
    border: 'none', backgroundColor: 'rgba(0,0,0,0.35)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
  },
  likeBtnActive: { backgroundColor: '#FCEBEB' },
  catBadge: {
    position: 'absolute', bottom: '10px', left: '10px',
    fontSize: '11px', padding: '3px 8px', borderRadius: '20px',
    backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff', fontWeight: '500',
  },
  info: { padding: '14px' },
  placeName: { fontSize: '15px', fontWeight: '600', marginBottom: '4px', color: '#1a1a18' },
  placeAddr: {
    fontSize: '12px', color: '#aaa', marginBottom: '6px',
    display: 'flex', alignItems: 'center', gap: '3px',
  },
  placeDesc: {
    fontSize: '12px', color: '#888', lineHeight: 1.5,
    marginBottom: '10px',
    display: '-webkit-box', WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical', overflow: 'hidden',
  },
  placeMeta: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  rating: {
    fontSize: '12px', color: '#854F0B',
    display: 'flex', alignItems: 'center', gap: '4px',
  },
  price: { fontSize: '12px', color: '#aaa', fontWeight: '500' },
}

export default PlaceList