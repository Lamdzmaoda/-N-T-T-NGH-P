import api from './api'

const bookingService = {
  // --- BOOKING API ---
  createBooking: (data) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings'),
  cancelBooking: (bookingId) => api.post(`/bookings/${bookingId}/cancel`),

  // --- PAYMENT API ---
  processPayment: (data) => api.post('/payments', data),
  getPaymentByBooking: (bookingId) => api.get(`/payments/booking/${bookingId}`),

  // --- TRANSPORT API ---
  getTransportOptions: (tripId, params) => api.get(`/trips/${tripId}/transports/options`, { params }),
  saveTransportSelections: (tripId, data) => api.post(`/trips/${tripId}/transports/select`, data),
  getTransportSummary: (tripId) => api.get(`/trips/${tripId}/transports/summary`),
}

export default bookingService
