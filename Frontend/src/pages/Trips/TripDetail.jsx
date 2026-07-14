import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Calendar, DollarSign, Clock, MapPin, Trash2, Edit, Plus,
  Send, Sparkles, Loader2, MessageSquare, AlertCircle, X, Navigation
} from 'lucide-react'
import tripService from '../../services/tripService'
import placeService from '../../services/placeService'
import bookingService from '../../services/bookingService'

const TripDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const chatEndRef = useRef(null)

  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // ----- STATE CHO ITINERARY CRUD -----
  const [dbPlaces, setDbPlaces] = useState([])
  const [addModal, setAddModal] = useState({ open: false, dayNumber: 1 })
  const [editModal, setEditModal] = useState({ open: false, item: null })
  
  const [addForm, setAddForm] = useState({
    placeId: '',
    startTime: '08:00',
    note: ''
  })
  const [editForm, setEditForm] = useState({
    startTime: '',
    note: ''
  })

  // ----- STATE CHO AI CHATBOT -----
  const [chatInput, setChatInput] = useState('')
  const [chatHistory, setChatHistory] = useState([
    { sender: 'bot', text: 'Xin chào! Tôi là trợ lý du lịch AI của bạn. Tôi đã nắm rõ lịch trình của bạn. Hãy hỏi tôi bất kỳ câu hỏi nào về các điểm tham quan, ẩm thực, thời tiết hoặc yêu cầu tôi gợi ý thay đổi lịch trình nhé!' }
  ])
  const [isChatLoading, setIsChatLoading] = useState(false)

  // ----- STATE CHO PHƯƠNG TIỆN DI CHUYỂN (TRANSPORT) -----
  const [showTransportModal, setShowTransportModal] = useState(false)
  const [departurePlace, setDeparturePlace] = useState('Hà Nội')
  const [isTransportLoading, setIsTransportLoading] = useState(false)
  const [transportOptions, setTransportOptions] = useState(null)
  const [selectedLongDistance, setSelectedLongDistance] = useState(null)
  const [selectedLocalRoutes, setSelectedLocalRoutes] = useState({})
  const [transportSummary, setTransportSummary] = useState(null)
  const [userCoords, setUserCoords] = useState(null)
  const [navigationData, setNavigationData] = useState(null)
  const [isStarting, setIsStarting] = useState(false)
  const [mapModal, setMapModal] = useState({
    open: false,
    routeTitle: '',
    providerName: '',
    vehicleType: '',
    price: 0,
    durationMinutes: 0,
    distanceKm: null,
    mapUrl: '',
    googleMapsLink: '',
    instruction: ''
  })

  // 1. TẢI DỮ LIỆU CHUYẾN ĐI VÀ DANH SÁCH ĐỊA ĐIỂM
  const loadTripData = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await tripService.getTripById(id)
      const tripObj = res.data.result
      setTrip(tripObj)

      const placesRes = await placeService.getPlaces({ page: 0, size: 100 })
      setDbPlaces(placesRes.data.result?.content || [])

      // Tải tổng kết di chuyển nếu có
      await loadTransportSummary()

      // Tải thông tin định vị chỉ đường từ API mới nếu chuyến đi đang diễn ra
      if (tripObj?.status === 'ONGOING') {
        try {
          const navRes = await tripService.getTripNavigation(id)
          setNavigationData(navRes.data.result)
        } catch (navErr) {
          console.warn('Lỗi khi lấy định vị chỉ đường:', navErr)
        }
      } else {
        setNavigationData(null)
      }
    } catch (err) {
      console.error(err)
      setError('Không thể tải thông tin chi tiết lịch trình du lịch.')
    } finally {
      setLoading(false)
    }
  }

  // --- TẢI TỔNG KẾT PHƯƠNG TIỆN DI CHUYỂN ---
  const loadTransportSummary = async () => {
    try {
      const res = await bookingService.getTransportSummary(id)
      setTransportSummary(res.data.result)
    } catch (err) {
      console.warn('Không thể tải tóm tắt phương tiện di chuyển')
    }
  }

  // --- LẤY DANH SÁCH CÁC LỰA CHỌN PHƯƠNG TIỆN TỪ AI ---
  const fetchTransportOptions = async (customDeparture = null) => {
    setIsTransportLoading(true)
    try {
      const activeDeparture = customDeparture !== null ? customDeparture : departurePlace
      const params = { departurePlace: activeDeparture }
      
      // Gọi định vị trình duyệt GPS để lấy tọa độ thực
      if (customDeparture === null && navigator.geolocation) {
        await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              params.userLat = pos.coords.latitude
              params.userLng = pos.coords.longitude
              setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
              
              // Gọi Nominatim để chuyển đổi GPS thành tên Tỉnh/Thành phố
              try {
                const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json&accept-language=vi`)
                const geoData = await geoRes.json()
                if (geoData && geoData.address) {
                  const city = geoData.address.city || geoData.address.town || geoData.address.state || geoData.address.province || geoData.address.county
                  if (city) {
                    const cleanedCity = city.replace(/Thành phố|Tỉnh|Tỉnh\s+|Thành\s+phố\s+/g, '').trim()
                    params.departurePlace = cleanedCity
                    setDeparturePlace(cleanedCity)
                  }
                }
              } catch (geoErr) {
                console.warn('Lỗi phân tích địa danh từ GPS:', geoErr)
              }
              resolve()
            },
            () => {
              // Điểm mặc định nếu từ chối quyền định vị
              params.userLat = 21.0185
              params.userLng = 105.8078
              resolve()
            },
            { timeout: 5000 }
          )
        })
      } else {
        params.userLat = 21.0185
        params.userLng = 105.8078
      }

      const res = await bookingService.getTransportOptions(id, params)
      setTransportOptions(res.data.result)

      // Tự động chọn lựa chọn đầu tiên cho chặng dài
      if (res.data.result?.longDistanceRoutes?.[0]?.options?.[0]) {
        const route = res.data.result.longDistanceRoutes[0]
        const opt = route.options[0]
        setSelectedLongDistance({
          departurePlace: route.departurePlace,
          destinationPlace: route.destinationPlace,
          providerName: opt.providerName,
          vehicleType: opt.vehicleType,
          price: opt.price,
          durationMinutes: opt.durationMinutes,
          isLongDistance: true
        })
      } else {
        setSelectedLongDistance(null)
      }

      // Tự động chọn lựa chọn đầu tiên cho các chặng ngắn
      const locals = {}
      res.data.result?.localRoutes?.forEach(route => {
        if (route.options?.[0]) {
          const key = `${route.fromItineraryId}_${route.toItineraryId}`
          locals[key] = {
            fromItineraryId: route.fromItineraryId,
            toItineraryId: route.toItineraryId,
            providerName: route.options[0].providerName,
            vehicleType: route.options[0].vehicleType,
            price: route.options[0].price,
            distanceKm: route.distanceKm,
            durationMinutes: route.options[0].durationMinutes,
            isLongDistance: false
          }
        }
      })
      setSelectedLocalRoutes(locals)
    } catch (err) {
      console.error(err)
      alert('Phân tích phương tiện thất bại. Hãy chắc chắn Backend của bạn đang chạy!')
    } finally {
      setIsTransportLoading(false)
    }
  }

  // --- LƯU CẤU HÌNH LỰA CHỌN DI CHUYỂN ---
  const handleSaveTransportSelections = async (e) => {
    e.preventDefault()
    const selections = []
    if (selectedLongDistance) {
      selections.push(selectedLongDistance)
    }
    Object.values(selectedLocalRoutes).forEach(item => {
      selections.push(item)
    })

    if (selections.length === 0) {
      alert('Vui lòng chọn ít nhất một phương tiện!')
      return
    }

    setIsTransportLoading(true)
    try {
      await bookingService.saveTransportSelections(id, { selections })
      alert('Lưu các lựa chọn phương tiện thành công!');
      await loadTransportSummary()
      setShowTransportModal(false)
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Lưu lựa chọn phương tiện thất bại.')
    } finally {
      setIsTransportLoading(false)
    }
  }

  // --- MỞ MODAL XEM CHI TIẾT BẢN ĐỒ CHẶNG DI CHUYỂN ---
  const handleOpenMapModal = (detail, startPlace = null, endPlace = null) => {
    if (trip?.status !== 'ONGOING') {
      alert('Vui lòng kích hoạt lịch trình bằng cách nhấn "🚀 Bắt đầu hành trình" ở trên để xem bản đồ chỉ dẫn chi tiết và lộ trình định vị GPS!')
      return
    }

    let saddr = ''
    let daddr = ''
    let originStr = ''
    let destStr = ''

    if (detail.isLongDistance) {
      saddr = detail.departurePlace || 'Hà Nội'
      daddr = detail.destinationPlace || 'Đà Nẵng'
      originStr = encodeURIComponent(saddr)
      destStr = encodeURIComponent(daddr)
    } else {
      // Chặng GPS hoặc chặng local giữa các địa điểm
      const startLat = startPlace?.lat || userCoords?.lat || 21.0185
      const startLng = startPlace?.lng || userCoords?.lng || 105.8078
      const endLat = endPlace?.lat || 21.0368
      const endLng = endPlace?.lng || 105.8344
      
      saddr = `${startLat},${startLng}`
      daddr = `${endLat},${endLng}`
      originStr = `${startLat},${startLng}`
      destStr = `${endLat},${endLng}`
    }

    // Ánh xạ phương tiện sang chế độ di chuyển của Google Maps (driving, walking, bicycling, transit)
    let mode = 'driving'
    if (detail.vehicleType) {
      const vt = detail.vehicleType.toUpperCase()
      if (vt.includes('WALK')) mode = 'walking'
      else if (vt.includes('BIKE') || vt.includes('CYCL')) mode = 'bicycling'
      else if (vt.includes('BUS') || vt.includes('TRAIN') || vt.includes('TRANSIT')) mode = 'transit'
    }

    // Kiểm tra và sử dụng khóa Google Maps API chính thức nếu được thiết lập
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.replace(/['"]/g, '').trim()
    let embedUrl = ''
    if (apiKey) {
      embedUrl = `https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${originStr}&destination=${destStr}&mode=${mode}`
    } else {
      embedUrl = `https://maps.google.com/maps?saddr=${saddr}&daddr=${daddr}&t=&z=14&ie=UTF8&iwloc=&output=embed`
    }
    
    let linkUrl = `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${destStr}`
    let customInstruction = ''

    // Tra cứu thông tin chỉ dẫn chi tiết từ API Backend
    if (navigationData?.days) {
      let foundStep = null
      for (const d of navigationData.days) {
        foundStep = d.steps?.find(s => {
          if (detail.isLongDistance) {
            return s.isLongDistance === true
          }
          if (detail.fromItineraryId === 'USER_CURRENT_LOCATION') {
            return s.fromItineraryId === 'USER_CURRENT_LOCATION'
          }
          // So khớp id hoặc tên địa điểm
          return s.fromItineraryId === detail.fromItineraryId
        })
        if (foundStep) break
      }
      if (foundStep) {
        customInstruction = foundStep.navigationInstruction
        if (foundStep.googleMapsUrl) {
          linkUrl = foundStep.googleMapsUrl
        }
      }
    }

    setMapModal({
      open: true,
      routeTitle: detail.route || `${startPlace?.name || 'Vị trí hiện tại'} ➔ ${endPlace?.name || 'Điểm đến'}`,
      providerName: detail.providerName,
      vehicleType: detail.vehicleType,
      price: detail.price,
      durationMinutes: detail.durationMinutes,
      distanceKm: detail.distanceKm,
      mapUrl: embedUrl,
      googleMapsLink: linkUrl,
      instruction: customInstruction
    })
  }

  // --- MỞ BẢN ĐỒ TỪ KHUNG TỔNG KẾT TÓM TẮT DI CHUYỂN ---
  const handleOpenMapFromSummary = (detail) => {
    let startPlace = null
    let endPlace = null
    
    if (!detail.isLongDistance) {
      if (detail.fromItineraryId && detail.fromItineraryId !== "USER_CURRENT_LOCATION" && detail.fromItineraryId !== "start_gps_location_id") {
        const found = trip.itineraries?.find(item => item.id === detail.fromItineraryId)
        if (found) startPlace = found.place
      }
      if (detail.toItineraryId) {
        const found = trip.itineraries?.find(item => item.id === detail.toItineraryId)
        if (found) endPlace = found.place
      }
    }
    
    handleOpenMapModal(detail, startPlace, endPlace)
  }

  // --- KÍCH HOẠT BẮT ĐẦU CHUYẾN ĐI ---
  const handleStartTrip = async () => {
    setIsStarting(true)
    try {
      await tripService.startTrip(id)
      alert('🚀 Kích hoạt lịch trình thành công! Chuyến đi đã bắt đầu hành trình của bạn.')
      await loadTripData()
    } catch (err) {
      console.error('Lỗi khi bắt đầu chuyến đi:', err)
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi kích hoạt hành trình.')
    } finally {
      setIsStarting(false)
    }
  }

  useEffect(() => {
    loadTripData()
  }, [id])

  // Cuộn khung chat xuống cuối khi có tin nhắn mới
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  // Tự động gọi phân tích phương tiện bằng GPS khi mở modal
  useEffect(() => {
    if (showTransportModal) {
      fetchTransportOptions()
    }
  }, [showTransportModal])

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <Loader2 size={36} color="#185FA5" className="animate-spin" />
        <p style={{ marginTop: '12px', color: '#666' }}>Đang tải lịch trình du lịch của bạn...</p>
      </div>
    )
  }

  if (error || !trip) {
    return (
      <div style={styles.errorPage}>
        <AlertCircle size={40} color="#A32D2D" />
        <p style={{ marginTop: '12px', color: '#333', fontWeight: '600' }}>{error || 'Không tìm thấy chuyến đi'}</p>
        <button style={styles.backBtnPlain} onClick={() => navigate('/places')}>Quay lại</button>
      </div>
    )
  }

  // Nhóm các hoạt động theo ngày du lịch
  const groupedItineraries = {}
  trip.itineraries?.forEach(item => {
    const day = item.day_number || 1
    if (!groupedItineraries[day]) {
      groupedItineraries[day] = []
    }
    groupedItineraries[day].push(item)
  })

  // Sắp xếp các hoạt động trong ngày theo thời gian bắt đầu
  Object.keys(groupedItineraries).forEach(day => {
    groupedItineraries[day].sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))
  })

  const dayNumbers = Object.keys(groupedItineraries).map(Number).sort((a, b) => a - b)
  // Nếu chưa có ngày nào hoặc muốn hiển thị số ngày tối đa của chuyến đi
  const totalDays = Math.max(
    dayNumbers.length,
    Math.ceil((new Date(trip.end_date) - new Date(trip.start_date)) / (1000 * 60 * 60 * 24)) + 1
  )

  const allDaysList = Array.from({ length: totalDays }, (_, i) => i + 1)

  // ----- XỬ LÝ ITINERARY CRUD -----
  const handleOpenAddModal = (dayNumber) => {
    setAddModal({ open: true, dayNumber })
    setAddForm({
      placeId: dbPlaces[0]?.id || '',
      startTime: '09:00',
      note: ''
    })
  }

  const handleCloseAddModal = () => setAddModal({ open: false, dayNumber: 1 })

  const handleAddItineraryItem = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        tripId: id,
        placeId: addForm.placeId,
        dayNumber: addModal.dayNumber,
        startTime: addForm.startTime,
        note: addForm.note
      }
      await tripService.addItineraryItem(payload)
      loadTripData()
      handleCloseAddModal()
    } catch (err) {
      alert(err.response?.data?.message || 'Thêm hoạt động thất bại')
    }
  }

  const handleOpenEditModal = (item) => {
    setEditModal({ open: true, item })
    setEditForm({
      startTime: item.start_time || '',
      note: item.note || ''
    })
  }

  const handleCloseEditModal = () => setEditModal({ open: false, item: null })

  const handleUpdateItineraryItem = async (e) => {
    e.preventDefault()
    try {
      await tripService.updateItineraryItem(editModal.item.id, editForm)
      loadTripData()
      handleCloseEditModal()
    } catch (err) {
      alert(err.response?.data?.message || 'Cập nhật hoạt động thất bại')
    }
  }

  const handleDeleteItineraryItem = async (itemId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa hoạt động này khỏi lịch trình?')) return
    try {
      await tripService.deleteItineraryItem(itemId)
      loadTripData()
    } catch (err) {
      alert(err.response?.data?.message || 'Xóa hoạt động thất bại')
    }
  }

  // ----- XỬ LÝ AI CHATBOT (STREAMING CHỮ CHẠY) -----
  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!chatInput.trim() || isChatLoading) return

    const userMsg = chatInput.trim()
    setChatInput('')

    // 1. Thêm tin nhắn của User vào khung chat
    setChatHistory(prev => [...prev, { sender: 'user', text: userMsg }])
    setIsChatLoading(true)

    // 2. Thêm một bong bóng chat trống của Bot để chuẩn bị nhận luồng text
    setChatHistory(prev => [...prev, { sender: 'bot', text: '', isStreaming: true }])

    try {
      // Gọi fetch API kết nối với endpoint stream WebFlux của Backend
      const response = await fetch(`http://localhost:8080/travel-ai-planner/trips/${id}/chat?message=${encodeURIComponent(userMsg)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      })

      if (!response.ok) {
        throw new Error('Lỗi kết nối từ API chatbot')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let done = false
      let botResponseText = ''

      // 3. Đọc dữ liệu stream trả về liên tục từng chunk
      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        const chunk = decoder.decode(value, { stream: true })
        
        // Phân tích định dạng Server-Sent Events (SSE): "data: content\n\n"
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data:')) {
            botResponseText += line.substring(5) // Lấy text sau "data:" và giữ nguyên khoảng trắng
          } else if (line.trim() && !line.includes('data:')) {
            // Trường hợp stream thô không có tag "data:"
            botResponseText += line
          }
        }

        // Cập nhật tin nhắn cuối cùng (Bot) trong danh sách hiển thị
        setChatHistory(prev => {
          const updated = [...prev]
          const lastItem = updated[updated.length - 1]
          if (lastItem && lastItem.sender === 'bot') {
            lastItem.text = botResponseText
          }
          return updated
        })
      }

      // Đánh dấu hoàn thành luồng stream
      setChatHistory(prev => {
        const updated = [...prev]
        const lastItem = updated[updated.length - 1]
        if (lastItem && lastItem.sender === 'bot') {
          lastItem.isStreaming = false
        }
        return updated
      })

    } catch (err) {
      console.error(err)
      // Cập nhật báo lỗi vào bong bóng chat cuối cùng
      setChatHistory(prev => {
        const updated = [...prev]
        const lastItem = updated[updated.length - 1]
        if (lastItem && lastItem.sender === 'bot') {
          lastItem.text = '⚠️ Đã xảy ra lỗi khi kết nối với AI Assistant. Vui lòng thử lại!'
          lastItem.isStreaming = false
        }
        return updated
      })
    } finally {
      setIsChatLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* HEADER VÀ TỔNG QUAN */}
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => navigate('/places')}>
            <ArrowLeft size={16} /> Danh sách địa điểm
          </button>
          <div style={styles.titleCard}>
            <div style={styles.titleCardFlex}>
              <div>
                {trip?.status === 'PLANNING' && (
                  <span style={{ ...styles.tripStatusBadge, color: '#854F0B', backgroundColor: '#FDF2E2' }}>📝 Đang lập kế hoạch</span>
                )}
                {trip?.status === 'ONGOING' && (
                  <span style={{ ...styles.tripStatusBadge, color: '#185FA5', backgroundColor: '#E5F1FA' }}>🚀 Chuyến đi đang diễn ra</span>
                )}
                {trip?.status === 'COMPLETED' && (
                  <span style={{ ...styles.tripStatusBadge, color: '#1B5E20', backgroundColor: '#E8F5E9' }}>✅ Đã hoàn thành</span>
                )}
                {!['PLANNING', 'ONGOING', 'COMPLETED'].includes(trip?.status) && (
                  <span style={styles.tripStatusBadge}>✨ AI Generated Itinerary</span>
                )}
                <h1 style={styles.tripTitle}>{trip.title || `Hành trình khám phá`}</h1>
                <div style={styles.tripMetaRow}>
                  <div style={styles.metaItem}>
                    <Calendar size={14} color="#888" />
                    <span>{trip.start_date} đến {trip.end_date}</span>
                  </div>
                  <div style={styles.metaItem}>
                    <DollarSign size={14} color="#888" />
                    <span>Ngân sách: Thích hợp</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button style={styles.btnTransport} onClick={() => {
                  setShowTransportModal(true)
                  setTransportOptions(null)
                  setSelectedLongDistance(null)
                  setSelectedLocalRoutes({})
                }}>
                  <Navigation size={14} /> Thiết lập di chuyển
                </button>
                
                {trip?.status === 'PLANNING' && (
                  <button 
                    style={{
                      ...styles.btnTransport,
                      backgroundColor: '#1B5E20',
                      borderColor: '#1B5E20',
                      color: '#fff',
                    }}
                    onClick={handleStartTrip}
                    disabled={isStarting}
                  >
                    {isStarting ? 'Đang kích hoạt...' : '🚀 Bắt đầu hành trình'}
                  </button>
                )}
              </div>
            </div>

            {/* Khung tổng hợp chi phí di chuyển */}
            {transportSummary && transportSummary.totalTransportCost > 0 && (
              <div style={styles.transportSummaryBox}>
                <div style={styles.transportSummaryTitle}>🚗 Chi phí di chuyển đã chọn:</div>
                <div style={styles.transportSummaryDetails}>
                  <div>Số chặng di chuyển: <strong>{transportSummary.selectionsCount}</strong></div>
                  <div>Tổng cộng: <strong style={{ color: '#A32D2D' }}>{transportSummary.totalTransportCost?.toLocaleString('vi-VN')} VNĐ</strong></div>
                </div>
                {transportSummary.details?.length > 0 && (
                  <div style={styles.transportSummaryList}>
                    {transportSummary.details.map((detail, idx) => (
                      <div 
                        key={detail.id || idx} 
                        style={{ ...styles.transportSummaryItem, cursor: trip?.status === 'ONGOING' ? 'pointer' : 'not-allowed', opacity: trip?.status === 'ONGOING' ? 1 : 0.7 }}
                        onClick={() => handleOpenMapFromSummary(detail)}
                        title={trip?.status === 'ONGOING' ? "Click để xem bản đồ chỉ đường chi tiết" : "Kích hoạt hành trình để mở khóa bản đồ"}
                      >
                        <span style={styles.summaryItemRoute}>📍 {detail.route}:</span>
                        <span style={styles.summaryItemVal}>
                          <strong>{detail.providerName}</strong> ({detail.vehicleType}) - <strong style={{ color: '#A32D2D' }}>{detail.price?.toLocaleString('vi-VN')} VNĐ</strong>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {trip?.status === 'PLANNING' && (
          <div style={{
            backgroundColor: '#FFFDE7',
            border: '1px solid #FFF59D',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}>
            <div style={{ fontSize: '13px', color: '#5D4037', lineHeight: '1.5' }}>
              🚩 <strong>Chuyến đi chưa bắt đầu:</strong> Lịch trình này đang ở chế độ lập kế hoạch. Bạn hãy dùng tính năng <strong>"Thiết lập di chuyển"</strong> để chọn máy bay/taxi, sau đó bấm <strong>"Bắt đầu hành trình"</strong> để kích hoạt chỉ đường GPS chi tiết!
            </div>
            <button 
              style={{
                padding: '10px 16px',
                backgroundColor: '#1B5E20',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 6px rgba(27,94,32,0.2)'
              }}
              onClick={handleStartTrip}
              disabled={isStarting}
            >
              {isStarting ? 'Đang kích hoạt...' : '🚀 Bắt đầu ngay'}
            </button>
          </div>
        )}

        {trip?.status === 'ONGOING' && (
          <div style={{
            backgroundColor: '#E5F1FA',
            border: '1px solid #bcd4ec',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <div style={{ fontSize: '13px', color: '#185FA5', lineHeight: '1.5' }}>
              🌟 <strong>Lộ trình đang diễn ra:</strong> Bản đồ GPS và hướng dẫn chi tiết của các chặng đã được kích hoạt. Hãy click vào các chặng xe/máy bay dưới đây để xem bản đồ dẫn đường chi tiết.
            </div>
          </div>
        )}

        {/* PHÂN CỘT NỘI DUNG CHÍNH */}
        <div style={styles.mainLayout}>
          {/* CỘT TRÁI: DÒNG THỜI GIAN LỊCH TRÌNH */}
          <div style={styles.itineraryColumn}>
            {allDaysList.map(dayNum => {
              const dayItems = groupedItineraries[dayNum] || []
              return (
                <div key={dayNum} style={styles.dayCard}>
                  <div style={styles.dayHeader}>
                    <h3 style={styles.dayTitle}>Ngày {dayNum}</h3>
                    <button style={styles.btnAddActivity} onClick={() => handleOpenAddModal(dayNum)}>
                      <Plus size={14} /> Thêm hoạt động
                    </button>
                  </div>

                  <div style={styles.timeline}>
                    {dayItems.length === 0 ? (
                      <p style={styles.emptyDayText}>Chưa có hoạt động nào được thêm cho ngày này.</p>
                    ) : (
                      dayItems.map((item, idx) => {
                        // Tìm chặng di chuyển từ điểm này đến điểm tiếp theo (nếu có)
                        const nextItem = dayItems[idx + 1]
                        const transportToNext = nextItem
                          ? transportSummary?.details?.find(
                              d => d.fromItineraryId === item.id && d.toItineraryId === nextItem.id
                            )
                          : null

                        // Tìm chặng GPS từ vị trí hiện tại đến điểm đầu tiên của ngày đầu tiên (nếu có)
                        const transportFromGPS = (idx === 0 && dayNum === 1)
                          ? transportSummary?.details?.find(
                              d => (d.fromItineraryId === "USER_CURRENT_LOCATION" || d.fromItineraryId === "start_gps_location_id") && d.toItineraryId === item.id
                            )
                          : null

                        // Tìm chặng bay/chặng xe dài đến địa điểm du lịch (nếu có)
                        const transportLongDistance = (idx === 0 && dayNum === 1)
                          ? transportSummary?.details?.find(d => d.isLongDistance === true)
                          : null

                        return (
                          <div key={item.id}>
                            {/* Chặng dài liên tỉnh (máy bay / tàu hỏa / xe khách chặng dài) */}
                            {transportLongDistance && (
                              <div style={styles.timelineTransportRow}>
                                <div style={styles.timelineTransportIndicator}>
                                  <div style={{ ...styles.timelineTransportDotGPS, backgroundColor: '#185FA5', borderColor: '#E5F1FA' }} />
                                  <div style={styles.timelineTransportLine} />
                                </div>
                                <div 
                                  style={{ 
                                    ...styles.timelineTransportCard, 
                                    backgroundColor: '#F0F6FC', 
                                    borderColor: '#bcd4ec',
                                    cursor: trip?.status === 'ONGOING' ? 'pointer' : 'not-allowed',
                                    opacity: trip?.status === 'ONGOING' ? 1 : 0.7
                                  }}
                                  onClick={() => handleOpenMapModal(transportLongDistance)}
                                  title={trip?.status === 'ONGOING' ? "Click để xem bản đồ chỉ đường chi tiết" : "Kích hoạt hành trình để mở khóa bản đồ"}
                                >
                                  ✈️ <strong>Chặng dài ({transportLongDistance.route})</strong>: {transportLongDistance.providerName} ({transportLongDistance.vehicleType}) - <span style={{color:'#A32D2D', fontWeight:'650'}}>{transportLongDistance.price?.toLocaleString('vi-VN')} VNĐ</span> ({transportLongDistance.durationMinutes} phút)
                                </div>
                              </div>
                            )}

                            {/* Chặng đi từ GPS định vị ban đầu */}
                            {transportFromGPS && (
                              <div style={styles.timelineTransportRow}>
                                <div style={styles.timelineTransportIndicator}>
                                  <div style={styles.timelineTransportDotGPS} />
                                  <div style={styles.timelineTransportLine} />
                                </div>
                                <div 
                                  style={{
                                    ...styles.timelineTransportCard,
                                    cursor: trip?.status === 'ONGOING' ? 'pointer' : 'not-allowed',
                                    opacity: trip?.status === 'ONGOING' ? 1 : 0.7
                                  }}
                                  onClick={() => handleOpenMapModal(transportFromGPS, null, item.place)}
                                  title={trip?.status === 'ONGOING' ? "Click để xem bản đồ chỉ đường chi tiết" : "Kích hoạt hành trình để mở khóa bản đồ"}
                                >
                                  🚗 Bắt đầu từ <strong>Vị trí của bạn</strong>: {transportFromGPS.providerName} ({transportFromGPS.vehicleType}) - <span style={{color:'#A32D2D', fontWeight:'600'}}>{transportFromGPS.price?.toLocaleString('vi-VN')} VNĐ</span> ({transportFromGPS.durationMinutes} phút)
                                </div>
                              </div>
                            )}

                            <div style={styles.timelineItem}>
                              {/* Trục chỉ thời gian */}
                              <div style={styles.timelineIndicator}>
                                <div style={styles.timelineDot} />
                                <div style={styles.timelineLine} />
                              </div>

                              {/* Thẻ nội dung hoạt động */}
                              <div style={styles.activityCard}>
                                <div style={styles.activityHeader}>
                                  <span style={styles.timeBadge}>
                                    <Clock size={12} /> {item.start_time}
                                  </span>
                                  <div style={styles.activityActions}>
                                    <button style={styles.btnActionEdit} onClick={() => handleOpenEditModal(item)} title="Sửa">
                                      <Edit size={12} />
                                    </button>
                                    <button style={styles.btnActionDelete} onClick={() => handleDeleteItineraryItem(item.id)} title="Xóa">
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                                <h4 style={styles.placeName}>{item.place?.name || 'Điểm tham quan tự do'}</h4>
                                <p style={styles.placeAddress}>
                                  <MapPin size={11} color="#bbb" /> {item.place?.address || 'Địa chỉ đang cập nhật'}
                                </p>
                                {item.note && <p style={styles.activityNote}>{item.note}</p>}
                              </div>
                            </div>

                            {/* Chặng đi tới điểm tiếp theo trong ngày */}
                            {transportToNext && (
                              <div style={styles.timelineTransportRow}>
                                <div style={styles.timelineTransportIndicator}>
                                  <div style={styles.timelineTransportDotLink} />
                                  <div style={styles.timelineTransportLine} />
                                </div>
                                <div 
                                  style={{
                                    ...styles.timelineTransportCard,
                                    cursor: trip?.status === 'ONGOING' ? 'pointer' : 'not-allowed',
                                    opacity: trip?.status === 'ONGOING' ? 1 : 0.7
                                  }}
                                  onClick={() => handleOpenMapModal(transportToNext, item.place, nextItem.place)}
                                  title={trip?.status === 'ONGOING' ? "Click để xem bản đồ chỉ đường chi tiết" : "Kích hoạt hành trình để mở khóa bản đồ"}
                                >
                                  🚖 Di chuyển chặng tiếp: <strong>{transportToNext.providerName}</strong> ({transportToNext.vehicleType}) - <span style={{color:'#A32D2D', fontWeight:'650'}}>{transportToNext.price?.toLocaleString('vi-VN')} VNĐ</span> ({transportToNext.durationMinutes} phút)
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* CỘT PHẢI: AI TRAVEL ASSISTANT CHATBOT */}
          <div style={styles.chatColumn}>
            <div style={styles.chatCard}>
              <div style={styles.chatHeader}>
                <MessageSquare size={16} />
                <span>Trợ lý ảo AI Companion</span>
              </div>
              <div style={styles.chatBody}>
                {chatHistory.map((chat, index) => (
                  <div
                    key={index}
                    style={{
                      ...styles.chatMessageRow,
                      justifyContent: chat.sender === 'user' ? 'flex-end' : 'flex-start'
                    }}
                  >
                    {chat.sender === 'bot' && (
                      <div style={styles.botAvatar}>🤖</div>
                    )}
                    <div
                      style={{
                        ...styles.chatBubble,
                        ...(chat.sender === 'user' ? styles.userBubble : styles.botBubble)
                      }}
                    >
                      {chat.text}
                      {chat.isStreaming && <span style={styles.streamingIndicator}>|</span>}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={handleSendMessage} style={styles.chatFooter}>
                <input
                  style={styles.chatInput}
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Hỏi AI về lịch trình, gợi ý quán ngon..."
                  disabled={isChatLoading}
                />
                <button
                  type="submit"
                  style={{
                    ...styles.btnSendChat,
                    ...(isChatLoading ? styles.btnSendChatDisabled : {})
                  }}
                  disabled={isChatLoading}
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* -------------------- MODAL: THÊM HOẠT ĐỘNG -------------------- */}
      {addModal.open && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h3>Thêm hoạt động - Ngày {addModal.dayNumber}</h3>
              <button style={styles.btnCloseModal} onClick={handleCloseAddModal}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddItineraryItem}>
              <div style={styles.formGroup}>
                <label style={styles.modalLabel}>Chọn địa điểm</label>
                <select
                  style={styles.modalSelect}
                  value={addForm.placeId}
                  onChange={e => setAddForm({ ...addForm, placeId: e.target.value })}
                  required
                >
                  {dbPlaces.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.address?.substring(0,25)}...)</option>
                  ))}
                  {dbPlaces.length === 0 && (
                    <option value="">Không có địa điểm nào khả dụng</option>
                  )}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.modalLabel}>Giờ bắt đầu</label>
                <input
                  style={styles.modalInput}
                  type="time"
                  value={addForm.startTime}
                  onChange={e => setAddForm({ ...addForm, startTime: e.target.value })}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.modalLabel}>Ghi chú hoạt động</label>
                <textarea
                  style={styles.modalTextarea}
                  value={addForm.note}
                  onChange={e => setAddForm({ ...addForm, note: e.target.value })}
                  placeholder="Ví dụ: Ăn trưa thưởng thức ẩm thực đặc sản địa phương..."
                  rows="3"
                />
              </div>

              <div style={styles.modalActions}>
                <button type="button" style={styles.btnCancel} onClick={handleCloseAddModal}>Hủy</button>
                <button type="submit" style={styles.btnConfirm}>Thêm vào</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- MODAL: CHỈNH SỬA HOẠT ĐỘNG -------------------- */}
      {editModal.open && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h3>Chỉnh sửa hoạt động</h3>
              <button style={styles.btnCloseModal} onClick={handleCloseEditModal}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleUpdateItineraryItem}>
              <div style={styles.formGroup}>
                <label style={styles.modalLabel}>Giờ bắt đầu</label>
                <input
                  style={styles.modalInput}
                  type="time"
                  value={editForm.startTime}
                  onChange={e => setEditForm({ ...editForm, startTime: e.target.value })}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.modalLabel}>Ghi chú hoạt động</label>
                <textarea
                  style={styles.modalTextarea}
                  value={editForm.note}
                  onChange={e => setEditForm({ ...editForm, note: e.target.value })}
                  rows="3"
                  required
                />
              </div>

              <div style={styles.modalActions}>
                <button type="button" style={styles.btnCancel} onClick={handleCloseEditModal}>Hủy</button>
                <button type="submit" style={styles.btnConfirm}>Cập nhật</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* -------------------- PHƯƠNG TIỆN DI CHUYỂN MODAL -------------------- */}
      {showTransportModal && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalCard, maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>🚗 Lựa chọn Phương tiện di chuyển (AI Phân tích)</h3>
              <button style={styles.btnCloseModal} onClick={() => setShowTransportModal(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Khung tìm điểm xuất phát */}
            <div style={styles.transportSearchRow}>
              <div style={{ ...styles.formGroup, flex: 1, marginBottom: 0 }}>
                <label style={styles.modalLabel}>Điểm xuất phát:</label>
                <input
                  style={styles.modalInput}
                  placeholder="Ví dụ: Hà Nội, Sài Gòn..."
                  value={departurePlace}
                  onChange={e => setDeparturePlace(e.target.value)}
                />
              </div>
              <button
                type="button"
                style={styles.btnTransportSearch}
                onClick={() => fetchTransportOptions(departurePlace)}
                disabled={isTransportLoading}
              >
                {isTransportLoading ? 'Đang phân tích...' : 'AI Phân tích'}
              </button>
            </div>

            {isTransportLoading ? (
              <div style={styles.transportLoadingWrap}>
                <Loader2 size={36} color="#185FA5" className="animate-spin" />
                <p style={{ marginTop: '12px', fontSize: '13px', color: '#666' }}>AI đang so sánh chi phí di chuyển...</p>
              </div>
            ) : transportOptions ? (
              <form onSubmit={handleSaveTransportSelections} style={styles.transportForm}>
                
                {/* 1. CHẶNG DÀI */}
                {transportOptions.longDistanceRoutes?.length > 0 && (
                  <div style={styles.transportSection}>
                    <h4 style={styles.transportSectionTitle}>✈️ Chặng dài ({transportOptions.longDistanceRoutes[0].departurePlace} ➔ {transportOptions.longDistanceRoutes[0].destinationPlace})</h4>
                    <div style={styles.optionsList}>
                      {transportOptions.longDistanceRoutes[0].options?.map((opt, oIdx) => {
                        const isSelected = selectedLongDistance?.providerName === opt.providerName && selectedLongDistance?.vehicleType === opt.vehicleType
                        return (
                          <div
                            key={oIdx}
                            style={{
                              ...styles.optionCard,
                              ...(isSelected ? styles.optionCardActive : {})
                            }}
                            onClick={() => setSelectedLongDistance({
                              departurePlace: transportOptions.longDistanceRoutes[0].departurePlace,
                              destinationPlace: transportOptions.longDistanceRoutes[0].destinationPlace,
                              providerName: opt.providerName,
                              vehicleType: opt.vehicleType,
                              price: opt.price,
                              durationMinutes: opt.durationMinutes,
                              isLongDistance: true
                            })}
                          >
                            <div style={styles.optionHeader}>
                              <strong>{opt.providerName}</strong>
                              <span>{opt.vehicleType}</span>
                            </div>
                            <div style={styles.optionBody}>
                              <div>Thời gian: {opt.durationMinutes} phút</div>
                              <div style={{ color: '#A32D2D', fontWeight: '700' }}>{opt.price?.toLocaleString('vi-VN')} VNĐ</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* 2. CÁC CHẶNG NỘI ĐÔ (LOCAL) */}
                {transportOptions.localRoutes?.length > 0 && (
                  <div style={styles.transportSection}>
                    <h4 style={styles.transportSectionTitle}>🚖 Di chuyển nội đô giữa các địa điểm du lịch</h4>
                    {transportOptions.localRoutes.map((route, rIdx) => {
                      const key = `${route.fromItineraryId}_${route.toItineraryId}`
                      const currentSelect = selectedLocalRoutes[key]
                      return (
                        <div key={rIdx} style={styles.localRouteRow}>
                          <div style={styles.localRouteInfo}>
                            <span>Chặng {rIdx + 1}: </span>
                            <strong>{route.fromPlaceName}</strong> ➔ <strong>{route.toPlaceName}</strong>
                            <span style={styles.localRouteDist}> ({route.distanceKm?.toFixed(1)} km)</span>
                          </div>
                          
                          <div style={styles.optionsListGrid}>
                            {route.options?.map((opt, oIdx) => {
                              const isSelected = currentSelect?.providerName === opt.providerName && currentSelect?.vehicleType === opt.vehicleType
                              return (
                                <div
                                  key={oIdx}
                                  style={{
                                    ...styles.optionMiniCard,
                                    ...(isSelected ? styles.optionMiniCardActive : {})
                                  }}
                                  onClick={() => setSelectedLocalRoutes(prev => ({
                                    ...prev,
                                    [key]: {
                                      fromItineraryId: route.fromItineraryId,
                                      toItineraryId: route.toItineraryId,
                                      providerName: opt.providerName,
                                      vehicleType: opt.vehicleType,
                                      price: opt.price,
                                      distanceKm: route.distanceKm,
                                      durationMinutes: opt.durationMinutes,
                                      isLongDistance: false
                                    }
                                  }))}
                                >
                                  <strong>{opt.providerName}</strong> ({opt.vehicleType})
                                  <div style={{ color: '#A32D2D', fontSize: '11px', fontWeight: '700' }}>
                                    {opt.price?.toLocaleString('vi-VN')} VNĐ
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                <button type="submit" style={styles.btnSaveTransport} disabled={isTransportLoading}>
                  Lưu cấu hình di chuyển
                </button>
              </form>
            ) : (
              <div style={styles.transportEmptyState}>
                Hãy gõ điểm xuất phát và nhấn <strong>AI Phân tích</strong> để xem bảng giá vé máy bay chặng dài và taxi local!
              </div>
            )}
          </div>
        </div>
      )}

      {/* -------------------- MODAL: CHI TIẾT BẢN ĐỒ CHẶNG DI CHUYỂN -------------------- */}
      {mapModal.open && (
        <div style={styles.modalOverlay} onClick={() => setMapModal(prev => ({ ...prev, open: false }))}>
          <div style={{ ...styles.modalCard, maxWidth: '680px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>🗺️ Bản đồ chỉ đường</h3>
              <button style={styles.btnCloseModal} onClick={() => setMapModal(prev => ({ ...prev, open: false }))}>
                <X size={18} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px 0' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#185FA5', margin: 0 }}>
                📍 {mapModal.routeTitle}
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', fontSize: '13px', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
                <div>Hãng vận chuyển: <strong>{mapModal.providerName}</strong> ({mapModal.vehicleType})</div>
                {mapModal.distanceKm && <div>Khoảng cách: <strong>{mapModal.distanceKm.toFixed(1)} km</strong></div>}
                <div>Thời gian: <strong>{mapModal.durationMinutes} phút</strong></div>
                <div style={{ color: '#A32D2D', fontWeight: '700' }}>Giá dự tính: {mapModal.price?.toLocaleString('vi-VN')} VNĐ</div>
              </div>

              {mapModal.instruction && (
                <div style={{ backgroundColor: '#F0F6FC', borderLeft: '4px solid #185FA5', padding: '12px', borderRadius: '4px', fontSize: '13px', color: '#1a1a18', lineHeight: '1.5' }}>
                  ℹ️ <strong>Chỉ dẫn chi tiết:</strong> {mapModal.instruction}
                </div>
              )}

              {/* Nhúng Google Map Iframe chỉ đường */}
              <div style={{ position: 'relative', width: '100%', height: '360px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #ddd' }}>
                <iframe
                  title="Google Map Directions"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={mapModal.mapUrl}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <a
                  href={mapModal.googleMapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    backgroundColor: '#185FA5',
                    color: '#fff',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: '700',
                    boxShadow: '0 2px 6px rgba(24,95,165,0.2)'
                  }}
                >
                  <MapPin size={14} /> Mở bản đồ lớn (GPS chỉ đường)
                </a>
                <button
                  type="button"
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}
                  onClick={() => setMapModal(prev => ({ ...prev, open: false }))}
                >
                  Đóng lại
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f2f0ea', paddingBottom: '60px' },
  loadingPage: {
    minHeight: '100vh', backgroundColor: '#f2f0ea',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  },
  errorPage: {
    minHeight: '100vh', backgroundColor: '#f2f0ea',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  },
  backBtnPlain: { padding: '8px 16px', borderRadius: '8px', border: '1px solid #ddd', cursor: 'pointer', marginTop: '12px' },
  
  container: { maxWidth: '1200px', margin: '0 auto', padding: '24px' },
  header: { marginBottom: '24px' },
  backBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    backgroundColor: 'transparent', border: 'none',
    color: '#666', fontSize: '13px', fontWeight: '500',
    cursor: 'pointer', fontFamily: 'inherit', marginBottom: '16px',
  },
  titleCard: {
    backgroundColor: '#fff', borderRadius: '16px',
    border: '1px solid #e8e7e1', padding: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
  },
  tripStatusBadge: {
    display: 'inline-block', fontSize: '11px', fontWeight: '600',
    color: '#854F0B', backgroundColor: '#FDF2E2',
    padding: '4px 10px', borderRadius: '20px', marginBottom: '8px',
  },
  tripTitle: { fontSize: '24px', fontWeight: '800', color: '#1a1a18', marginBottom: '8px' },
  tripMetaRow: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  metaItem: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#666' },

  mainLayout: { display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' },
  
  // ITINERARY TIMELINE
  itineraryColumn: { display: 'flex', flexDirection: 'column', gap: '24px' },
  dayCard: {
    backgroundColor: '#fff', borderRadius: '16px',
    border: '1px solid #e8e7e1', padding: '20px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
  },
  dayHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    borderBottom: '1px solid #eee', paddingBottom: '12px', marginBottom: '20px',
  },
  dayTitle: { fontSize: '18px', fontWeight: '700', color: '#1a1a18' },
  btnAddActivity: {
    display: 'flex', alignItems: 'center', gap: '4px',
    padding: '6px 12px', backgroundColor: '#F0F6FC', color: '#185FA5',
    border: '1px solid #c9d8e9', borderRadius: '6px', fontSize: '12px',
    fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit',
  },
  emptyDayText: { fontSize: '13px', color: '#999', fontStyle: 'italic', padding: '10px 0' },
  
  timeline: { display: 'flex', flexDirection: 'column' },
  timelineItem: { display: 'flex', gap: '16px' },
  timelineIndicator: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    width: '16px', flexShrink: 0,
  },
  timelineDot: {
    width: '8px', height: '8px', borderRadius: '50%',
    backgroundColor: '#185FA5', border: '4px solid #F0F6FC',
    marginTop: '20px', zIndex: 2,
  },
  timelineLine: {
    width: '2px', flex: 1, backgroundColor: '#e2e8f0',
    marginTop: '4px', marginBottom: '-20px', zIndex: 1,
  },

  activityCard: {
    flex: 1, backgroundColor: '#fcfbfa', border: '1px solid #eee',
    borderRadius: '12px', padding: '16px', marginBottom: '20px',
    transition: 'all 0.2s',
  },
  activityHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '8px',
  },
  timeBadge: {
    display: 'flex', alignItems: 'center', gap: '4px',
    fontSize: '11px', fontWeight: '600', color: '#185FA5',
    backgroundColor: '#E6F1FB', padding: '3px 8px', borderRadius: '6px',
  },
  activityActions: { display: 'flex', gap: '6px' },
  btnActionEdit: {
    border: 'none', backgroundColor: '#e2e8f0', color: '#4a5568',
    padding: '4px', borderRadius: '4px', cursor: 'pointer',
    display: 'flex', alignItems: 'center',
  },
  btnActionDelete: {
    border: 'none', backgroundColor: '#fed7d7', color: '#9b2c2c',
    padding: '4px', borderRadius: '4px', cursor: 'pointer',
    display: 'flex', alignItems: 'center',
  },
  placeName: { fontSize: '15px', fontWeight: '700', color: '#1a1a18', marginBottom: '4px' },
  placeAddress: {
    fontSize: '11px', color: '#888', display: 'flex',
    alignItems: 'center', gap: '4px', marginBottom: '8px',
  },
  activityNote: { fontSize: '13px', color: '#555', lineHeight: 1.5 },

  // CHATBOT COLUMN
  chatColumn: { position: 'sticky', top: '80px' },
  chatCard: {
    backgroundColor: '#fff', borderRadius: '16px',
    border: '1px solid #e8e7e1', boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
    height: '500px', display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
  },
  chatHeader: {
    backgroundColor: '#2A2925', color: '#fff',
    padding: '14px 16px', display: 'flex', alignItems: 'center',
    gap: '8px', fontSize: '14px', fontWeight: '600',
  },
  chatBody: {
    flex: 1, padding: '16px', overflowY: 'auto',
    display: 'flex', flexDirection: 'column', gap: '12px',
    backgroundColor: '#fbfaf8',
  },
  chatMessageRow: { display: 'flex', gap: '8px', alignItems: 'flex-start' },
  botAvatar: {
    width: '28px', height: '28px', borderRadius: '50%',
    backgroundColor: '#185FA5', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '12px', flexShrink: 0,
  },
  chatBubble: {
    maxWidth: '80%', padding: '10px 14px', borderRadius: '14px',
    fontSize: '13px', lineHeight: 1.5, wordBreak: 'break-word',
  },
  botBubble: {
    backgroundColor: '#fff', color: '#333',
    border: '1px solid #eee', borderTopLeftRadius: '2px',
  },
  userBubble: {
    backgroundColor: '#185FA5', color: '#fff',
    borderTopRightRadius: '2px',
  },
  streamingIndicator: {
    fontWeight: 'bold', display: 'inline-block',
    animation: 'blink 1s step-end infinite',
  },
  chatFooter: {
    display: 'flex', gap: '8px', padding: '12px',
    borderTop: '1px solid #eee', backgroundColor: '#fff',
  },
  chatInput: {
    flex: 1, padding: '10px 12px', borderRadius: '8px',
    border: '1px solid #ddd', fontSize: '13px',
    outline: 'none', fontFamily: 'inherit',
  },
  btnSendChat: {
    width: '36px', height: '36px', borderRadius: '8px',
    border: 'none', backgroundColor: '#185FA5', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', flexShrink: 0,
  },
  btnSendChatDisabled: { opacity: 0.5, cursor: 'not-allowed' },

  // MODAL STYLES
  modalOverlay: {
    position: 'fixed', inset: 0, zIndex: 1000,
    backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '24px',
  },
  modalCard: {
    backgroundColor: '#fff', borderRadius: '16px',
    width: '100%', maxWidth: '400px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
    padding: '24px', boxSizing: 'border-box',
  },
  modalHeader: {
    display: 'flex', alignItems: 'center', justifyItems: 'space-between',
    borderBottom: '1px solid #f2f2f2', paddingBottom: '12px',
    marginBottom: '16px', justifyContent: 'space-between',
  },
  btnCloseModal: {
    border: 'none', background: 'none', cursor: 'pointer',
    color: '#888', padding: '4px', borderRadius: '50%',
    display: 'flex', alignItems: 'center',
  },
  formGroup: {
    display: 'flex', flexDirection: 'column', gap: '6px',
    marginBottom: '14px', width: '100%', boxSizing: 'border-box',
  },
  modalLabel: { fontSize: '12px', fontWeight: '600', color: '#444' },
  modalSelect: {
    width: '100%', boxSizing: 'border-box',
    padding: '10px 12px', borderRadius: '8px',
    border: '1px solid #ddd', fontSize: '13px',
    outline: 'none', fontFamily: 'inherit',
    backgroundColor: '#fff', color: '#333',
  },
  modalInput: {
    width: '100%', boxSizing: 'border-box',
    padding: '10px 12px', borderRadius: '8px',
    border: '1px solid #ddd', fontSize: '13px',
    outline: 'none', fontFamily: 'inherit',
  },
  modalTextarea: {
    width: '100%', boxSizing: 'border-box',
    padding: '10px 12px', borderRadius: '8px',
    border: '1px solid #ddd', fontSize: '13px',
    outline: 'none', fontFamily: 'inherit', resize: 'vertical',
  },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' },
  btnCancel: {
    padding: '8px 16px', border: '1px solid #ddd',
    borderRadius: '6px', backgroundColor: '#fff', color: '#666',
    cursor: 'pointer', fontSize: '12px', fontWeight: '600',
    fontFamily: 'inherit',
  },
  btnConfirm: {
    padding: '8px 16px', border: 'none',
    borderRadius: '6px', backgroundColor: '#185FA5', color: '#fff',
    cursor: 'pointer', fontSize: '12px', fontWeight: '600',
    fontFamily: 'inherit',
  },

  // --- TRANSPORT STYLES ---
  titleCardFlex: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' },
  btnTransport: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '8px 14px', backgroundColor: '#185FA5', color: '#fff',
    border: 'none', borderRadius: '8px', fontSize: '13px',
    fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit',
    boxShadow: '0 4px 10px rgba(24,95,165,0.2)',
  },
  transportSummaryBox: {
    marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #eee',
    display: 'flex', flexDirection: 'column', gap: '6px',
  },
  transportSummaryTitle: { fontSize: '13px', fontWeight: '700', color: '#333' },
  transportSummaryDetails: { display: 'flex', gap: '24px', fontSize: '12px', color: '#666' },
  
  transportSearchRow: { display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '20px' },
  btnTransportSearch: {
    padding: '10px 16px', backgroundColor: '#2A2925', color: '#fff',
    border: 'none', borderRadius: '8px', fontSize: '13px',
    fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit',
    height: '40px', display: 'flex', alignItems: 'center',
  },
  transportLoadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' },
  transportForm: { display: 'flex', flexDirection: 'column', gap: '20px' },
  transportSection: { display: 'flex', flexDirection: 'column', gap: '12px' },
  transportSectionTitle: { fontSize: '14px', fontWeight: '700', color: '#1a1a18', borderBottom: '1px solid #eee', paddingBottom: '6px' },
  optionsList: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  optionCard: {
    border: '1px solid #ddd', borderRadius: '10px', padding: '12px',
    cursor: 'pointer', backgroundColor: '#fff', transition: 'all 0.2s',
  },
  optionCardActive: {
    borderColor: '#185FA5', backgroundColor: '#F0F6FC',
    boxShadow: '0 0 0 2px rgba(24,95,165,0.15)',
  },
  optionHeader: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#333', marginBottom: '6px' },
  optionBody: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#666' },
  
  localRouteRow: { backgroundColor: '#fcfbfa', border: '1px solid #eee', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' },
  localRouteInfo: { fontSize: '12px', color: '#555' },
  localRouteDist: { color: '#888', fontStyle: 'italic' },
  optionsListGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' },
  optionMiniCard: {
    border: '1px solid #ddd', borderRadius: '6px', padding: '8px',
    textAlign: 'center', cursor: 'pointer', backgroundColor: '#fff',
    fontSize: '10px', display: 'flex', flexDirection: 'column', gap: '2px',
  },
  optionMiniCardActive: {
    borderColor: '#185FA5', backgroundColor: '#F0F6FC',
    boxShadow: '0 0 0 2px rgba(24,95,165,0.15)',
  },
  btnSaveTransport: {
    width: '100%', padding: '12px', borderRadius: '8px', border: 'none',
    backgroundColor: '#185FA5', color: '#fff', fontSize: '14px',
    fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit',
    marginTop: '10px',
  },
  transportEmptyState: { textAlign: 'center', color: '#888', padding: '30px 10px', fontSize: '13px', fontStyle: 'italic' },
  transportSummaryList: {
    marginTop: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    borderTop: '1px dashed #eee',
    paddingTop: '10px',
  },
  transportSummaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    color: '#555',
  },
  summaryItemRoute: {
    fontWeight: '550',
    color: '#333',
  },
  summaryItemVal: {
    color: '#854F0B',
  },
  timelineTransportRow: {
    display: 'flex',
    gap: '16px',
    margin: '4px 0',
    alignItems: 'center',
  },
  timelineTransportIndicator: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '16px',
    flexShrink: 0,
  },
  timelineTransportDotGPS: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#3B6D11',
    border: '3px solid #EAF3DE',
    zIndex: 2,
  },
  timelineTransportDotLink: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#854F0B',
    border: '3px solid #FDF2E2',
    zIndex: 2,
  },
  timelineTransportLine: {
    width: '2px',
    height: '16px',
    backgroundColor: '#e2e8f0',
    zIndex: 1,
  },
  timelineTransportCard: {
    flex: 1,
    backgroundColor: '#fdfbf7',
    border: '1px dashed #ddd',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '11px',
    color: '#666',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.01)',
  },
}

export default TripDetail