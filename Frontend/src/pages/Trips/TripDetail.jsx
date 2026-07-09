import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Calendar, DollarSign, Clock, MapPin, Trash2, Edit, Plus,
  Send, Sparkles, Loader2, MessageSquare, AlertCircle, X
} from 'lucide-react'
import tripService from '../../services/tripService'
import placeService from '../../services/placeService'

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

  // 1. TẢI DỮ LIỆU CHUYẾN ĐI VÀ DANH SÁCH ĐỊA ĐIỂM
  const loadTripData = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await tripService.getTripById(id)
      setTrip(res.data.result)

      const placesRes = await placeService.getPlaces({ page: 0, size: 100 })
      setDbPlaces(placesRes.data.result?.content || [])
    } catch (err) {
      console.error(err)
      setError('Không thể tải thông tin chi tiết lịch trình du lịch.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTripData()
  }, [id])

  // Cuộn khung chat xuống cuối khi có tin nhắn mới
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

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
            <div>
              <span style={styles.tripStatusBadge}>✨ AI Generated Itinerary</span>
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
          </div>
        </div>

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
                      dayItems.map((item, idx) => (
                        <div key={item.id} style={styles.timelineItem}>
                          {/* Trục chỉ thời gian */}
                          <div style={styles.timelineIndicator}>
                            <div style={styles.timelineDot} />
                            {idx !== dayItems.length - 1 && <div style={styles.timelineLine} />}
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
                      ))
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
}

export default TripDetail