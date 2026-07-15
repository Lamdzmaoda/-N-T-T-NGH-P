package org.example.backend.service.dashboard;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.dto.response.dashboard.DashboardResponse;
import org.example.backend.dto.response.dashboard.UserStatsResponse;
import org.example.backend.entity.BookingPayment.Booking;
import org.example.backend.entity.BookingPayment.Payment;
import org.example.backend.entity.Trips.Trip;
import org.example.backend.entity.Trips.TripTransport;
import org.example.backend.entity.User.User;
import org.example.backend.enums.PaymentStatus;
import org.example.backend.enums.TripStatus;
import org.example.backend.repository.Trip.TripRepository;
import org.example.backend.repository.Trip.TripTransportRepository;
import org.example.backend.repository.auth.UserRepository;
import org.example.backend.repository.booking.BookingRepository;
import org.example.backend.repository.booking.PaymentRepository;
import org.example.backend.service.auth.AuthenticationService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class DashboardService {
    UserRepository userRepository;
    TripRepository tripRepository;
    BookingRepository bookingRepository;
    PaymentRepository paymentRepository;
    TripTransportRepository tripTransportRepository;
    AuthenticationService authenticationService;


    @PreAuthorize("hasRole('ADMIN')")
    public DashboardResponse getAdminDashboard() {
        Long totalUsers = userRepository.count();
        Long totalTrips = tripRepository.count();
        Long totalBookings = bookingRepository.count();

        // Tính tổng doanh thu thực tế từ các payments thành công (PAID)
        List<Payment> paidPayments = paymentRepository.findByStatus(PaymentStatus.PAID);
        BigDecimal totalRevenue = paidPayments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Tính tỷ lệ các trạng thái chuyến đi
        List<Trip> allTrips = tripRepository.findAll();
        Map<String, Long> statusRatio = allTrips.stream()
                .collect(Collectors.groupingBy(t -> t.getStatus().name(), Collectors.counting()));

        // Phân tích điểm đến phổ biến dựa trên tiêu đề chuyến đi
        Map<String, Long> popularDestinations = new HashMap<>();
        List<String> cities = List.of("Đà Nẵng", "Hạ Long", "Hội An", "Sapa", "Hà Giang", "Ninh Bình", "Nha Trang", "Phú Quốc", "Đà Lạt", "Hồ Chí Minh", "Sài Gòn", "Hà Nội");
        
        for (Trip trip : allTrips) {
            String title = trip.getTitle() != null ? trip.getTitle().toLowerCase() : "";
            for (String city : cities) {
                if (title.contains(city.toLowerCase())) {
                    popularDestinations.put(city, popularDestinations.getOrDefault(city, 0L) + 1);
                }
            }
        }
        return DashboardResponse.builder()
                .totalUsers(totalUsers)
                .totalTrips(totalTrips)
                .totalBookings(totalBookings)
                .totalRevenue(totalRevenue)
                .tripStatusRatio(statusRatio)
                .popularDestinations(popularDestinations)
                .build();
    }
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public UserStatsResponse getUserStats() {
        User currentUser = authenticationService.getUserByContext();
        String userId = currentUser.getId();

        // 1. Tổng chuyến đi
        List<Trip> userTrips = tripRepository.findByUserId(userId);
        Long totalTrips = (long) userTrips.size();

        // 2. Tổng đặt phòng
        List<Booking> userBookings = bookingRepository.findByUserId(userId);
        Long totalBookings = (long) userBookings.size();

        // 3. Tổng chi tiêu cho các booking đã thanh toán thành công
        List<Payment> userPayments = paymentRepository.findByBookingUserId(userId);
        BigDecimal totalSpent = userPayments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.PAID)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 4. Tổng quãng đường nội đô đã di chuyển
        List<TripTransport> userTransports = tripTransportRepository.findByTripUserId(userId);
        Double totalDistance = userTransports.stream()
                .filter(t -> t.getDistanceKm() != null)
                .mapToDouble(TripTransport::getDistanceKm)
                .sum();
        totalDistance = Math.round(totalDistance * 100.0) / 100.0;

        return UserStatsResponse.builder()
                .totalTrips(totalTrips)
                .totalBookings(totalBookings)
                .totalSpent(totalSpent)
                .totalDistanceTraveledKm(totalDistance)
                .build();
    }
}
