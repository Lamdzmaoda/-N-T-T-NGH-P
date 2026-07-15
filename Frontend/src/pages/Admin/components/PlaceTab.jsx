import { useState, useEffect } from 'react'
import { Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react'
import placeService from '../../../services/placeService'

const PlaceTab = () => {
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [placeModal, setPlaceModal] = useState({ open: false, mode: 'create', data: null })
  const [categories, setCategories] = useState([])
  
  // ----- STATE CHO LEAFLET MAP -----
  const [leafletLoaded, setLeafletLoaded] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [hoveredIdx, setHoveredIdx] = useState(null)

  // Form state cho Place
  const [placeForm, setPlaceForm] = useState({
    name: '',
    type: 'ATTRACTION',
    photos: '',
    opening_hours: '',
    price_range: '',
    max_slots: '',
    is_visible: true,
    address: '',
    lat: '',
    lng: '',
    description: '',
    categoryId: '',
    google_place_id: ''
  })

  // ----- 1. TẢI THƯ VIỆN LEAFLET DỰ PHÒNG -----
  useEffect(() => {
    if (window.L) {
      setLeafletLoaded(true)
      return
    }

    const linkId = 'leaflet-css'
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link')
      link.id = linkId
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    const scriptId = 'leaflet-js'
    let script = document.getElementById(scriptId)
    if (!script) {
      script = document.createElement('script')
      script.id = scriptId
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.async = true
      script.onload = () => setLeafletLoaded(true)
      document.head.appendChild(script)
    } else {
      script.addEventListener('load', () => setLeafletLoaded(true))
    }
  }, [])

  // ----- 2. LOAD DATA -----
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
      const res = await placeService.getPlaces({
        page,
        size: 8,
        search: search || undefined
      })
      setPlaces(res.data.result?.content || [])
      setTotalPages(res.data.result?.totalPages || 0)
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
    }, 0)
    return () => clearTimeout(timer)
  }, [page, search])

  // ----- 3. KHỞI TẠO BẢN ĐỒ LEAFLET KHI MỞ MODAL -----
  useEffect(() => {
    if (!placeModal.open || !window.L || !leafletLoaded) return

    // Sửa lỗi hiển thị Marker Icon mặc định
    delete window.L.Icon.Default.prototype._getIconUrl
    window.L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
    })

    const defaultLat = parseFloat(placeForm.lat) || 21.0285
    const defaultLng = parseFloat(placeForm.lng) || 105.8542

    const mapElement = document.getElementById('admin-map')
    if (mapElement) {
      if (window.adminMapInstance) {
        window.adminMapInstance.remove()
      }

      const map = window.L.map(mapElement).setView([defaultLat, defaultLng], 15)
      window.adminMapInstance = map

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map)

      const marker = window.L.marker([defaultLat, defaultLng], {
        draggable: true
      }).addTo(map)
      window.adminMarkerInstance = marker

      map.on('click', (e) => {
        const { lat, lng } = e.latlng
        marker.setLatLng([lat, lng])
        updateCoords(lat, lng)
      })

      marker.on('dragend', () => {
        const { lat, lng } = marker.getLatLng()
        updateCoords(lat, lng)
      })

      const updateCoords = (latitude, longitude) => {
        setPlaceForm(prev => ({
          ...prev,
          lat: latitude.toFixed(6),
          lng: longitude.toFixed(6)
        }))

        // Geocoding ngược Nominatim
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=vi`)
          .then(res => res.json())
          .then(data => {
            if (data && data.display_name) {
              setPlaceForm(prev => ({
                ...prev,
                address: data.display_name
              }))
            }
          })
          .catch(err => console.error('Lỗi reverse geocoding:', err))
      }
    }

    return () => {
      if (window.adminMapInstance) {
        window.adminMapInstance.remove()
        window.adminMapInstance = null
        window.adminMarkerInstance = null
      }
    }
  }, [placeModal.open, leafletLoaded])

  // ----- 4. TÌM KIẾM ĐỊA CHỈ AUTOCOMPLETE -----
  const handleAddressSearch = async (query) => {
    setPlaceForm(prev => ({ ...prev, address: query }))
    
    if (query.trim().length < 3) {
      setSuggestions([])
      return
    }

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&accept-language=vi`)
      const data = await res.json()
      setSuggestions(data || [])
      setShowSuggestions(true)
    } catch (err) {
      console.error('Lỗi lấy gợi ý địa chỉ:', err)
    }
  }

  const handleSelectSuggestion = (item) => {
    const lat = parseFloat(item.lat)
    const lon = parseFloat(item.lon)

    setPlaceForm(prev => ({
      ...prev,
      name: item.name || prev.name,
      address: item.display_name,
      lat: lat.toFixed(6),
      lng: lon.toFixed(6),
      google_place_id: `osm-${item.osm_id}`
    }))

    if (window.adminMapInstance && window.adminMarkerInstance) {
      window.adminMapInstance.setView([lat, lon], 15)
      window.adminMarkerInstance.setLatLng([lat, lon])
    }

    setSuggestions([])
    setShowSuggestions(false)
  }

  // ----- 5. ACTION ĐỊA ĐIỂM -----
  const handleOpenPlaceModal = (mode, data = null) => {
    setPlaceModal({ open: true, mode, data })
    if (data) {
      setPlaceForm({
        name: data.name || '',
        type: data.type || 'ATTRACTION',
        photos: data.photos || '',
        opening_hours: data.opening_hours || '',
        price_range: data.price_range || '',
        max_slots: data.max_slots !== null ? data.max_slots.toString() : '',
        is_visible: data.is_visible !== undefined ? data.is_visible : true,
        address: data.address || '',
        lat: data.lat !== null ? data.lat.toString() : '',
        lng: data.lng !== null ? data.lng.toString() : '',
        description: data.description || '',
        categoryId: data.placeCategory?.id || '',
        google_place_id: data.google_place_id || ''
      })
    } else {
      setPlaceForm({
        name: '',
        type: 'ATTRACTION',
        photos: '',
        opening_hours: '',
        price_range: '',
        max_slots: '',
        is_visible: true,
        address: '',
        lat: '',
        lng: '',
        description: '',
        categoryId: categories[0]?.id || '',
        google_place_id: ''
      })
    }
  }

  const handleClosePlaceModal = () => {
    setPlaceModal({ open: false, mode: 'create', data: null })
  }

  const handlePlaceFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setPlaceForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSavePlace = async (e) => {
    e.preventDefault()
    if (!placeForm.name || !placeForm.address) {
      alert('Vui lòng nhập Tên và Địa chỉ địa điểm')
      return
    }

    const payload = {
      ...placeForm,
      max_slots: placeForm.max_slots ? parseInt(placeForm.max_slots) : null,
      lat: placeForm.lat ? parseFloat(placeForm.lat) : null,
      lng: placeForm.lng ? parseFloat(placeForm.lng) : null,
    }

    try {
      if (placeModal.mode === 'create') {
        await placeService.createPlace(payload)
      } else {
        await placeService.updatePlace(placeModal.data.id, payload)
      }
      loadPlaces()
      handleClosePlaceModal()
    } catch (err) {
      alert(err.response?.data?.message || 'Lưu địa điểm thất bại')
    }
  }

  const handleDeletePlace = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa địa điểm này?')) return
    try {
      await placeService.deletePlace(id)
      loadPlaces()
    } catch (err) {
      alert(err.response?.data?.message || 'Xóa địa điểm thất bại')
    }
  }

  return (
    <div>
      <div style={styles.tabHeader}>
        <h2 style={styles.tabTitle}>Danh sách Địa điểm</h2>
        <button style={styles.btnAdd} onClick={() => handleOpenPlaceModal('create')}>
          <Plus size={16} /> Thêm Địa điểm
        </button>
      </div>

      <div style={styles.card}>
        <div style={styles.searchBar}>
          <Search size={16} color="#aaa" />
          <input
            style={styles.searchInput}
            placeholder="Tìm theo tên địa điểm..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          />
        </div>

        {loading ? (
          <div style={styles.loaderWrap}>
            <Loader2 size={36} color="#185FA5" className="animate-spin" />
            <span style={{ fontSize: '14px', color: '#666', marginTop: '12px' }}>Đang tải địa điểm...</span>
          </div>
        ) : (
          <>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Ảnh</th>
                  <th style={styles.th}>Tên địa điểm</th>
                  <th style={styles.th}>Loại</th>
                  <th style={styles.th}>Danh mục</th>
                  <th style={styles.th}>Tầm giá</th>
                  <th style={styles.th}>Slots</th>
                  <th style={styles.th}>Trạng thái</th>
                  <th style={styles.th}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {places.map((place) => (
                  <tr key={place.id} style={styles.tr}>
                    <td style={styles.td}>
                      <img
                        src={place.photos || 'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?w=100&q=80'}
                        alt={place.name}
                        style={styles.tableImg}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?w=100&q=80'
                        }}
                      />
                    </td>
                    <td style={styles.td}>
                      <div style={styles.placeNameCell}>{place.name}</div>
                      <div style={styles.placeAddressCell}>{place.address}</div>
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, ...styles[`badge_${place.type}`] }}>
                        {place.type === 'HOTEL' ? '🏨 Khách sạn' : place.type === 'RESTAURANT' ? '🍴 Nhà hàng' : '🗼 Tham quan'}
                      </span>
                    </td>
                    <td style={styles.td}>{place.placeCategory?.name || 'Chưa phân loại'}</td>
                    <td style={styles.td}>{place.price_range || '-'}</td>
                    <td style={styles.td}>{place.max_slots !== null ? place.max_slots : 'Vô hạn'}</td>
                    <td style={styles.td}>
                      {place.is_visible ? (
                        <span style={styles.statusActive}>Hiển thị</span>
                      ) : (
                        <span style={styles.statusHidden}>Ẩn</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionsCell}>
                        <button style={styles.btnActionEdit} onClick={() => handleOpenPlaceModal('edit', place)} title="Sửa">
                          <Edit size={14} />
                        </button>
                        <button style={styles.btnActionDelete} onClick={() => handleDeletePlace(place.id)} title="Xóa">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {places.length === 0 && (
                  <tr>
                    <td colSpan="8" style={styles.tdEmpty}>Không tìm thấy địa điểm nào.</td>
                  </tr>
                )}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div style={styles.pagination}>
                <button
                  style={{ ...styles.btnPage, ...(page === 0 ? styles.btnPageDisabled : {}) }}
                  disabled={page === 0}
                  onClick={() => setPage(prev => prev - 1)}
                >
                  <ChevronLeft size={16} /> Trước
                </button>
                <span style={styles.pageIndicator}>Trang {page + 1} / {totalPages}</span>
                <button
                  style={{ ...styles.btnPage, ...(page >= totalPages - 1 ? styles.btnPageDisabled : {}) }}
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(prev => prev + 1)}
                >
                  Sau <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL PLACE */}
      {placeModal.open && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalCard, maxWidth: '780px' }}>
            <div style={styles.modalHeader}>
              <h3>{placeModal.mode === 'create' ? 'Thêm Địa điểm mới' : 'Sửa Địa điểm'}</h3>
              <button style={styles.btnCloseModal} onClick={handleClosePlaceModal}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSavePlace} style={styles.placeFormLayout}>
              <div style={styles.placeFormCol}>
                <div style={styles.formGroup}>
                  <label style={styles.modalLabel}>Tên địa điểm</label>
                  <input
                    style={styles.modalInput}
                    required
                    name="name"
                    value={placeForm.name}
                    onChange={handlePlaceFormChange}
                    placeholder="Khách sạn Melia Hà Nội"
                  />
                </div>

                <div style={styles.formRow2}>
                  <div style={styles.formGroup}>
                    <label style={styles.modalLabel}>Loại địa điểm</label>
                    <select
                      style={styles.modalSelect}
                      name="type"
                      value={placeForm.type}
                      onChange={handlePlaceFormChange}
                    >
                      <option value="ATTRACTION">🗼 Điểm tham quan</option>
                      <option value="HOTEL">🏨 Khách sạn</option>
                      <option value="RESTAURANT">🍴 Nhà hàng</option>
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.modalLabel}>Danh mục</label>
                    <select
                      style={styles.modalSelect}
                      name="categoryId"
                      value={placeForm.categoryId}
                      onChange={handlePlaceFormChange}
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ ...styles.formGroup, position: 'relative' }}>
                  <label style={styles.modalLabel}>Địa chỉ chi tiết (Chọn từ gợi ý)</label>
                  <input
                    style={styles.modalInput}
                    required
                    name="address"
                    value={placeForm.address}
                    onChange={(e) => handleAddressSearch(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Nhập địa chỉ hoặc tên địa điểm..."
                    autoComplete="off"
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <div style={styles.suggestionsDropdown}>
                      {suggestions.map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            ...styles.suggestionItem,
                            backgroundColor: hoveredIdx === idx ? '#f5f5f5' : '#fff'
                          }}
                          onMouseEnter={() => setHoveredIdx(idx)}
                          onMouseLeave={() => setHoveredIdx(null)}
                          onClick={() => handleSelectSuggestion(item)}
                        >
                          {item.display_name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.modalLabel}>Bản đồ vị trí (Kéo ghim hoặc click để định vị)</label>
                  <div id="admin-map" style={styles.mapContainer} />
                </div>
              </div>

              <div style={styles.placeFormCol}>
                <div style={styles.formGroup}>
                  <label style={styles.modalLabel}>Link ảnh đại diện</label>
                  <input
                    style={styles.modalInput}
                    name="photos"
                    value={placeForm.photos}
                    onChange={handlePlaceFormChange}
                    placeholder="URL hình ảnh (Unsplash, Imgur...)"
                  />
                </div>

                <div style={styles.formRow2}>
                  <div style={styles.formGroup}>
                    <label style={styles.modalLabel}>Số slots tối đa (Booking)</label>
                    <input
                      style={styles.modalInput}
                      type="number"
                      name="max_slots"
                      value={placeForm.max_slots}
                      onChange={handlePlaceFormChange}
                      placeholder="15 (Bỏ trống = Vô hạn)"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.modalLabel}>Google Place ID</label>
                    <input
                      style={styles.modalInput}
                      name="google_place_id"
                      value={placeForm.google_place_id}
                      onChange={handlePlaceFormChange}
                      placeholder="Google Map API ID"
                      readOnly
                    />
                  </div>
                </div>

                <div style={styles.formRow2}>
                  <div style={styles.formGroup}>
                    <label style={styles.modalLabel}>Kinh độ (Latitude)</label>
                    <input
                      style={styles.modalInput}
                      type="number"
                      step="any"
                      name="lat"
                      value={placeForm.lat}
                      onChange={handlePlaceFormChange}
                      placeholder="21.0285"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.modalLabel}>Vĩ độ (Longitude)</label>
                    <input
                      style={styles.modalInput}
                      type="number"
                      step="any"
                      name="lng"
                      value={placeForm.lng}
                      onChange={handlePlaceFormChange}
                      placeholder="105.8542"
                    />
                  </div>
                </div>

                <div style={styles.formRow2}>
                  <div style={styles.formGroup}>
                    <label style={styles.modalLabel}>Giờ hoạt động</label>
                    <input
                      style={styles.modalInput}
                      name="opening_hours"
                      value={placeForm.opening_hours}
                      onChange={handlePlaceFormChange}
                      placeholder="08:00 - 22:00"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.modalLabel}>Tầm giá</label>
                    <input
                      style={styles.modalInput}
                      name="price_range"
                      value={placeForm.price_range}
                      onChange={handlePlaceFormChange}
                      placeholder="1tr - 3tr/đêm hoặc $$"
                    />
                  </div>
                </div>

                <div style={styles.formGroupCheckbox}>
                  <input
                    type="checkbox"
                    id="is_visible"
                    name="is_visible"
                    checked={placeForm.is_visible}
                    onChange={handlePlaceFormChange}
                  />
                  <label htmlFor="is_visible" style={styles.checkboxLabel}>Hiển thị địa điểm trên ứng dụng</label>
                </div>
              </div>

              <div style={{ ...styles.formGroup, gridColumn: 'span 2', marginBottom: '0px' }}>
                <label style={styles.modalLabel}>Mô tả địa điểm</label>
                <textarea
                  style={styles.modalTextarea}
                  name="description"
                  value={placeForm.description}
                  onChange={handlePlaceFormChange}
                  rows="3"
                  placeholder="Mô tả chi tiết về địa điểm du lịch, khách sạn hay nhà hàng của bạn..."
                />
              </div>

              <div style={{ ...styles.modalActions, gridColumn: 'span 2', marginTop: '16px' }}>
                <button type="button" style={styles.btnCancel} onClick={handleClosePlaceModal}>Hủy</button>
                <button type="submit" style={styles.btnConfirm}>Lưu lại</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  tabHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
  },
  tabTitle: { fontSize: '20px', fontWeight: '800', color: '#F8FAFC', letterSpacing: '-0.5px' },
  btnAdd: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 18px',
    background: 'linear-gradient(135deg, #38BDF8, #818CF8)',
    color: '#0A0F1E',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 0 16px rgba(56,189,248,0.25)',
    transition: 'all 0.2s',
  },
  card: {
    backgroundColor: 'var(--bg-surface)',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    border: '1px solid rgba(255,255,255,0.07)',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 16px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    maxWidth: '320px',
    marginBottom: '20px',
    color: '#F8FAFC',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    width: '100%',
    fontSize: '13px',
    color: '#F8FAFC',
    backgroundColor: 'transparent',
    fontFamily: 'inherit',
  },
  loaderWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 0',
  },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: {
    padding: '12px 16px',
    borderBottom: '2px solid rgba(255,255,255,0.08)',
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  tr: { borderBottom: '1px solid rgba(255,255,255,0.05)' },
  td: { padding: '16px', fontSize: '13px', color: '#94A3B8', verticalAlign: 'middle' },
  tdEmpty: { padding: '40px', textAlign: 'center', color: '#64748B', fontSize: '14px' },
  tableImg: {
    width: '48px',
    height: '48px',
    borderRadius: '6px',
    objectFit: 'cover',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  placeNameCell: { fontWeight: '750', color: '#F8FAFC', fontSize: '14px', marginBottom: '3px' },
  placeAddressCell: { fontSize: '11px', color: '#64748B' },
  badge: {
    fontSize: '10px',
    padding: '3px 8px',
    borderRadius: '20px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  badge_HOTEL: { backgroundColor: 'rgba(56,189,248,0.1)', color: '#38BDF8', border: '1px solid rgba(56,189,248,0.2)' },
  badge_RESTAURANT: { backgroundColor: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' },
  badge_ATTRACTION: { backgroundColor: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' },
  statusActive: { color: '#10B981', fontWeight: '600' },
  statusHidden: { color: '#64748B', fontWeight: '500' },
  actionsCell: { display: 'flex', gap: '8px' },
  btnActionEdit: {
    border: '1px solid rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    color: '#F8FAFC',
    padding: '6px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s',
  },
  btnActionDelete: {
    border: '1px solid rgba(244,63,94,0.15)',
    backgroundColor: 'rgba(244,63,94,0.1)',
    color: '#F43F5E',
    padding: '6px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s',
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    marginTop: '24px',
  },
  btnPage: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 14px',
    backgroundColor: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#F8FAFC',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  btnPageDisabled: { opacity: 0.3, cursor: 'not-allowed' },
  pageIndicator: { fontSize: '13px', color: '#64748B' },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 1000,
    backgroundColor: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  modalCard: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '680px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
    padding: '28px',
    boxSizing: 'border-box',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    paddingBottom: '14px',
    marginBottom: '18px',
  },
  btnCloseModal: {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: '#64748B',
    padding: '4px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '14px',
    width: '100%',
    boxSizing: 'border-box',
  },
  modalLabel: { fontSize: '11px', fontWeight: '600', color: '#64748B', letterSpacing: '0.03em' },
  modalInput: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '10px 12px',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    fontSize: '13px',
    color: '#F8FAFC',
    outline: 'none',
    fontFamily: 'inherit',
  },
  modalSelect: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '10px 12px',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    fontSize: '13px',
    color: '#F8FAFC',
    outline: 'none',
    fontFamily: 'inherit',
  },
  modalTextarea: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '10px 12px',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    fontSize: '13px',
    color: '#F8FAFC',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  formRow2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    width: '100%',
    boxSizing: 'border-box'
  },
  formGroupCheckbox: { display: 'flex', alignItems: 'center', gap: '8px', margin: '14px 0' },
  checkboxLabel: { fontSize: '13px', color: '#94A3B8', userSelect: 'none', cursor: 'pointer' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' },
  btnCancel: {
    padding: '8px 18px',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    backgroundColor: 'rgba(255,255,255,0.04)',
    color: '#94A3B8',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    fontFamily: 'inherit',
  },
  btnConfirm: {
    padding: '8px 18px',
    border: 'none',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #38BDF8, #818CF8)',
    color: '#0A0F1E',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
    fontFamily: 'inherit',
    boxShadow: '0 0 16px rgba(56,189,248,0.2)',
  },
  placeFormLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px 24px',
    width: '100%',
    boxSizing: 'border-box',
  },
  placeFormCol: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    boxSizing: 'border-box'
  },
  mapContainer: {
    width: '100%',
    height: '180px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.08)',
    marginTop: '6px',
    backgroundColor: '#1E293B',
    position: 'relative',
    zIndex: 1,
  },
  suggestionsDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    zIndex: 1010,
    maxHeight: '180px',
    overflowY: 'auto',
    marginTop: '4px',
  },
  suggestionItem: {
    padding: '8px 12px',
    fontSize: '12px',
    color: '#333',
    cursor: 'pointer',
    borderBottom: '1px solid #eee',
    transition: 'background-color 0.15s',
  }
}

export default PlaceTab
