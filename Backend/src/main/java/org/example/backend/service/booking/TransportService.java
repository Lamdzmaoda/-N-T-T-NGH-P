package org.example.backend.service.booking;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.dto.request.booking.TransportSelectionRequest;
import org.example.backend.dto.response.booking.TransportOptionsResponse;
import org.example.backend.entity.Places.Place;
import org.example.backend.entity.Trips.Trip;
import org.example.backend.entity.Trips.TripItinerary;
import org.example.backend.entity.Trips.TripTransport;
import org.example.backend.entity.User.User;
import org.example.backend.repository.Trip.TripItineraryRepository;
import org.example.backend.repository.Trip.TripRepository;
import org.example.backend.repository.Trip.TripTransportRepository;
import org.example.backend.service.auth.AuthenticationService;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class TransportService {
    TripRepository tripRepository;
    TripItineraryRepository tripItineraryRepository;
    TripTransportRepository tripTransportRepository;
    AuthenticationService authenticationService;
    ChatClient chatClient;

    public TransportOptionsResponse getTransportOptions(String tripId, Double userLat, Double userLng, String departurePlace) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy chuyến đi!"));
        List<TripItinerary> itineraries = tripItineraryRepository.findByTripId(tripId);
        if (itineraries.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chuyến đi chưa được lập lịch trình!");
        }

        // Sắp xếp lịch trình theo ngày và thứ tự hoạt động
        itineraries.sort(Comparator.comparing(TripItinerary::getDay_number).thenComparing(TripItinerary::getOrder_index));

        String departure = (departurePlace != null && !departurePlace.trim().isEmpty()) ? departurePlace : "Hồ Chí Minh";
        Place firstStop = itineraries.get(0).getPlace();

        // 1. Mô tả các chặng đi nội đô cho AI hiểu
        StringBuilder routesDescription = new StringBuilder();

        // Chặng GPS từ vị trí hiện tại đến điểm đầu tiên
        if (userLat != null && userLng != null && firstStop != null) {
            double distanceToFirst = calculateDistance(userLat, userLng, firstStop.getLat(), firstStop.getLng());
            routesDescription.append(String.format("- Chặng GPS: Từ 'Vị trí hiện tại của bạn' (tọa độ %f, %f) đến '%s' (tọa độ %f, %f), Khoảng cách: %.2f km\n",
                    userLat, userLng, firstStop.getName(), firstStop.getLat(), firstStop.getLng(), distanceToFirst));
        }

        // Các chặng di chuyển giữa các địa điểm trong toàn bộ lịch trình (bao gồm cả liên ngày)
        for (int i = 0; i < itineraries.size() - 1; i++) {
            TripItinerary cur = itineraries.get(i);
            TripItinerary next = itineraries.get(i + 1);
            if (cur.getPlace() != null && next.getPlace() != null) {
                double dist = calculateDistance(cur.getPlace().getLat(), cur.getPlace().getLng(), next.getPlace().getLat(), next.getPlace().getLng());
                if (cur.getDay_number().equals(next.getDay_number())) {
                    routesDescription.append(String.format("- Ngày %d, Chặng di chuyển từ '%s' (ID Itinerary: %s) đến '%s' (ID Itinerary: %s), Khoảng cách: %.2f km\n",
                            cur.getDay_number(), cur.getPlace().getName(), cur.getId(), next.getPlace().getName(), next.getId(), dist));
                } else {
                    routesDescription.append(String.format("- Chặng di chuyển từ cuối Ngày %d '%s' (ID Itinerary: %s) đến đầu Ngày %d '%s' (ID Itinerary: %s), Khoảng cách: %.2f km\n",
                            cur.getDay_number(), cur.getPlace().getName(), cur.getId(), next.getDay_number(), next.getPlace().getName(), next.getId(), dist));
                }
            }
        }

        // 2. Viết Prompt động 100% bằng AI để tự quyết định chặng dài (Long Distance) từ A-Z
        String systemPrompt = String.format("""
                Bạn là một chuyên gia lập kế hoạch chi phí di chuyển du lịch thực tế tại Việt Nam.
                Điểm khởi hành chuyến đi dài từ: %s.
                
                Dưới đây là mô tả danh sách địa điểm và chặng di chuyển thực tế trong chuyến đi:
                %s
                
                Nhiệm vụ của bạn (Tự động phân tích từ A-Z):
                
                1. TỰ ĐỘNG XÁC ĐỊNH ĐỊA ĐIỂM ĐẾN & ĐỀ XUẤT CHẶNG DÀI (longDistanceRoutes):
                   - Hãy đọc thông tin địa chỉ các điểm dừng chân ở trên để biết thành phố điểm đến du lịch của chuyến đi này là gì (Ví dụ: Hạ Long, Đà Nẵng, Hội An, Sapa...).
                   - So sánh Điểm khởi hành (%s) với thành phố du lịch đó:
                     * Nếu là cùng một tỉnh/thành phố (Ví dụ: Đi từ Hà Nội và đi du lịch ở Hà Nội, hoặc đi từ Quảng Ninh và du lịch Hạ Long): Bạn TUYỆT ĐỐI KHÔNG đề xuất chặng dài (trường 'longDistanceRoutes' phải là một mảng rỗng []).
                     * Nếu là khác tỉnh/thành phố (Ví dụ: Hà Nội đi Hạ Long, Hà Nội đi Đà Nẵng): Hãy đề xuất 2-3 hãng vận chuyển chặng dài thực tế đang chạy tuyến này (Máy bay nếu có sân bay như Đà Nẵng/Nội Bài; Xe khách/Limousine hoặc Tàu hỏa nếu không có sân bay như đi Sapa/Hạ Long) kèm giá vé phổ thông và thời gian đi dự kiến.
                
                2. ĐỀ XUẤT CÁC TÙY CHỌN DI CHUYỂN NỘI ĐÔ (localRoutes):
                   - Đề xuất các hãng xe công nghệ thực tế (Grab, XanhSM, Be hoặc các hãng taxi truyền thống/dịch vụ thuê xe máy của địa phương) cho các chặng ngắn.
                   - Nếu khoảng cách chặng < 1km, hãy luôn đưa thêm tùy chọn 'Đi bộ' (WALKING, giá tiền 0đ).
                   - Điền chính xác 'fromItineraryId' và 'toItineraryId' tương ứng với thông tin tôi đã cung cấp cho từng chặng.
                
                Lưu ý quan trọng:
                Phản hồi của bạn BẮT BUỘC phải là một đối tượng JSON hợp lệ 100%%. Mọi tên khóa (keys) và chuỗi chữ (values) của JSON phải được bọc trong dấu ngoặc kép kép
                đúng tiêu chuẩn của JSON, tuyệt đối không được thiếu dấu ngoặc kép hoặc viết sai cấu trúc.
                """,
                departure, routesDescription.toString(), departure
        );

        log.info("Đang gọi Gemini sinh bảng so sánh giá xe/bay từ A-Z...");

        // 3. Gọi AI và ép kiểu dữ liệu trả về trực tiếp theo DTO
        return chatClient.prompt()
                .system(systemPrompt)
                .user("Hãy sinh danh sách so sánh các hãng vận chuyển.")
                .call()
                .entity(TransportOptionsResponse.class); // ✅ Spring AI tự ép kiểu JSON sang DTO
    }
    // Các hàm saveSelections, getTransportSummary và calculateDistance giữ nguyên...
    @Transactional
    public void saveSelections(String tripId, TransportSelectionRequest request) {
        User currentUser = authenticationService.getUserByContext();
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy chuyến đi!"));
        if (!trip.getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền chỉnh sửa thông tin chuyến đi này!");
        }
        tripTransportRepository.deleteByTripId(tripId);
        List<TripTransport> newSelections = request.getSelections().stream().map(item ->
                TripTransport.builder()
                        .trip(trip)
                        .fromItineraryId(item.getFromItineraryId())
                        .toItineraryId(item.getToItineraryId())
                        .isLongDistance(item.getIsLongDistance())
                        .departurePlace(item.getDeparturePlace())
                        .destinationPlace(item.getDestinationPlace())
                        .providerName(item.getProviderName())
                        .vehicleType(item.getVehicleType())
                        .price(item.getPrice())
                        .distanceKm(item.getDistanceKm())
                        .durationMinutes(item.getDurationMinutes())
                        .build()
        ).collect(Collectors.toList());
        tripTransportRepository.saveAll(newSelections);
    }
    public Map<String, Object> getTransportSummary(String tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy chuyến đi!"));
        List<TripTransport> selections = tripTransportRepository.findByTripId(tripId);
        BigDecimal totalCost = BigDecimal.ZERO;
        List<Map<String, Object>> details = new ArrayList<>();
        for (TripTransport selection : selections) {
            totalCost = totalCost.add(selection.getPrice());
            Map<String, Object> detail = new HashMap<>();
            detail.put("id", selection.getId());
            detail.put("isLongDistance", selection.getIsLongDistance());
            detail.put("providerName", selection.getProviderName());
            detail.put("vehicleType", selection.getVehicleType());
            detail.put("price", selection.getPrice());
            detail.put("distanceKm", selection.getDistanceKm());
            detail.put("durationMinutes", selection.getDurationMinutes());
            detail.put("fromItineraryId", selection.getFromItineraryId());
            detail.put("toItineraryId", selection.getToItineraryId());
            if (Boolean.TRUE.equals(selection.getIsLongDistance())) {
                detail.put("route", selection.getDeparturePlace() + " ➔ " + selection.getDestinationPlace());
            } else {
                String fromName = "Điểm đi";
                String toName = "Điểm đến";
                if ("USER_CURRENT_LOCATION".equals(selection.getFromItineraryId())) {
                    fromName = "Vị trí hiện tại của bạn";
                } else if (selection.getFromItineraryId() != null) {
                    Optional<TripItinerary> fromItin = tripItineraryRepository.findById(selection.getFromItineraryId());
                    if (fromItin.isPresent() && fromItin.get().getPlace() != null) {
                        fromName = fromItin.get().getPlace().getName();
                    }
                }
                if (selection.getToItineraryId() != null) {
                    Optional<TripItinerary> toItin = tripItineraryRepository.findById(selection.getToItineraryId());
                    if (toItin.isPresent() && toItin.get().getPlace() != null) {
                        toName = toItin.get().getPlace().getName();
                    }
                }
                detail.put("route", fromName + " ➔ " + toName);
            }
            details.add(detail);
        }
        Map<String, Object> summary = new HashMap<>();
        summary.put("tripId", trip.getId());
        summary.put("tripTitle", trip.getTitle());
        summary.put("totalTransportCost", totalCost);
        summary.put("selectionsCount", selections.size());
        summary.put("details", details);
        return summary;
    }
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double earthRadius = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadius * c;
    }
}
