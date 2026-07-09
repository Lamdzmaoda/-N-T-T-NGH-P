import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Star, Heart, MapPin, Filter, Loader2 } from 'lucide-react'
import placeService from '../../services/placeService'

const CITIES = ['Tất cả', 'Hà Nội', 'Đà Nẵng', 'Đà Lạt', 'Hội An', 'Sapa']

const PlaceList = () => {
  const navigate = useNavigate()
  const [places, setPlaces] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)

  // Filters state
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('Tất cả')
  const [category, setCategory] = useState('Tất cả') // Sẽ lưu 'Tất cả' hoặc category.id

  // 1. Tải danh mục thực tế từ Database
  const loadCategories = async () => {
    try {
      const res = await placeService.getCategories()
      setCategories(res.data.result || [])
    } catch (err) {
      console.error('Lỗi tải danh mục:', err)
    }
  }

  // 2. Tải danh sách địa điểm thực tế từ Database
  const loadPlaces = async () => {
    setLoading(true)
    try {
      const params = {
        page: 0,
        size: 50, // Lấy nhiều địa điểm để lọc thành phố cục bộ ở Client
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

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPlaces()
    }, 300) // Debounce 300ms để tránh spam API khi gõ ô tìm kiếm
    return () => clearTimeout(timer)
  }, [search, category])

  // 3. Xử lý yêu thích địa điểm (Thích / Bỏ thích)
  const toggleLike = async (e, placeId, isCurrentlyLiked) => {
    e.stopPropagation()
    try {
      if (isCurrentlyLiked) {
        await placeService.unlikePlace(placeId)
      } else {
        await placeService.likePlace(placeId)
      }
      loadPlaces() // Tải lại danh sách để cập nhật icon trái tim đỏ
    } catch (err) {
      console.error('Lỗi yêu thích:', err)
      alert('Vui lòng đăng nhập để sử dụng tính năng yêu thích địa điểm!')
    }
  }

  // 4. Lọc thành phố cục bộ dựa vào tên thành phố xuất hiện trong trường address
  const filteredPlaces = places.filter(p => {
    if (city === 'Tất cả') return true
    const addressLower = (p.address || '').toLowerCase()
    return addressLower.includes(city.toLowerCase())
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
          {/* Lọc Thành phố */}
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

          {/* Lọc Danh mục */}
          <div style={styles.filterGroup}>
            <span style={styles.filterLabel}><Filter size={13} /> Danh mục</span>
            <div style={styles.filterChips}>
              <button
                style={{ ...styles.chip, ...(category === 'Tất cả' ? styles.chipActive : {}) }}
                onClick={() => setCategory('Tất cả')}
              >
                Tất cả
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  style={{ ...styles.chip, ...(category === cat.id ? styles.chipActive : {}) }}
                  onClick={() => setCategory(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RESULTS COUNT */}
        <div style={styles.results}>
          <span style={styles.resultCount}>
            {filteredPlaces.length} địa điểm được tìm thấy
          </span>
        </div>

        {/* GRID hiển thị danh sách địa điểm */}
        {loading ? (
          <div style={styles.loadingWrap}>
            <Loader2 size={36} color="#185FA5" className="animate-spin" />
            <p style={{ marginTop: '12px', color: '#666' }}>Đang tìm kiếm địa điểm du lịch...</p>
          </div>
        ) : filteredPlaces.length === 0 ? (
          <div style={styles.empty}>
            <Search size={32} color="#ccc" />
            <p>Không tìm thấy địa điểm nào khớp với bộ lọc</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {filteredPlaces.map(place => {
              const isPlaceLiked = place.liked || place.isLiked || false
              return (
                <div
                  key={place.id}
                  style={styles.card}
                  onClick={() => navigate(`/places/${place.id}`)}
                >
                  {/* Ảnh đại diện */}
                  <div style={styles.imgWrap}>
                    <img
                      src={place.photos || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&q=80'}
                      alt={place.name}
                      style={styles.img}
                      onError={e => e.target.src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&q=80'}
                    />
                    {/* Nút yêu thích */}
                    <button
                      style={{
                        ...styles.likeBtn,
                        ...(isPlaceLiked ? styles.likeBtnActive : {})
                      }}
                      onClick={e => toggleLike(e, place.id, isPlaceLiked)}
                    >
                      <Heart
                        size={15}
                        fill={isPlaceLiked ? '#A32D2D' : 'none'}
                        color={isPlaceLiked ? '#A32D2D' : '#fff'}
                      />
                    </button>
                    {/* Badge Danh mục */}
                    <span style={styles.catBadge}>{place.placeCategory?.name || 'Du lịch'}</span>
                  </div>

                  {/* Thông tin chi tiết */}
                  <div style={styles.info}>
                    <h3 style={styles.placeName}>{place.name}</h3>
                    <p style={styles.placeAddr}>
                      <MapPin size={11} color="#aaa" /> {place.address}
                    </p>
                    <p style={styles.placeDesc}>{place.description}</p>
                    <div style={styles.placeMeta}>
                      <span style={styles.rating}>
                        <Star size={12} fill="#854F0B" color="#854F0B" />
                        {place.avg_rating ? place.avg_rating.toFixed(1) : '5.0'} Đánh giá
                      </span>
                      <span style={styles.price}>{place.price_range || 'Liên hệ'}</span>
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

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f2f0ea', paddingBottom: '40px' },
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
  loadingWrap: {
    textAlign: 'center',
    padding: '60px 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
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
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '340px',
    '&:hover': {
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
    }
  },
  imgWrap: { position: 'relative', height: '180px', overflow: 'hidden', backgroundColor: '#f9f9f9' },
  img: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  likeBtn: {
    position: 'absolute', top: '10px', right: '10px',
    width: '32px', height: '32px', borderRadius: '50%',
    border: 'none', backgroundColor: 'rgba(0,0,0,0.35)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  likeBtnActive: { backgroundColor: '#FCEBEB' },
  catBadge: {
    position: 'absolute', bottom: '10px', left: '10px',
    fontSize: '11px', padding: '3px 8px', borderRadius: '20px',
    backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', fontWeight: '500',
  },
  info: { padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  placeName: { fontSize: '15px', fontWeight: '600', marginBottom: '4px', color: '#1a1a18' },
  placeAddr: {
    fontSize: '11px', color: '#888', marginBottom: '6px',
    display: 'flex', alignItems: 'center', gap: '3px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  placeDesc: {
    fontSize: '12px', color: '#777', lineHeight: 1.5,
    marginBottom: '10px',
    display: '-webkit-box', WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical', overflow: 'hidden',
    height: '36px',
  },
  placeMeta: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' },
  rating: {
    fontSize: '12px', color: '#854F0B',
    display: 'flex', alignItems: 'center', gap: '4px',
  },
  price: { fontSize: '12px', color: '#e07a5f', fontWeight: '600' },
}

export default PlaceList