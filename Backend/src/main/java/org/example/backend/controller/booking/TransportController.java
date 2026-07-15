package org.example.backend.controller.booking;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.backend.dto.ApiResponse;
import org.example.backend.dto.request.booking.TransportSelectionRequest;
import org.example.backend.dto.response.booking.TransportOptionsResponse;
import org.example.backend.service.booking.TransportService;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@RestController
@RequestMapping("/trips/{tripId}/transports")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TransportController {
    TransportService transportService;
    /**
     * 1. API lấy bảng so sánh giá xe/bay từ AI (Nhận thêm tọa độ GPS tùy chọn từ Frontend)
     */
    @GetMapping("/options")
    public ApiResponse<TransportOptionsResponse> getOptions(
            @PathVariable String tripId,
            @RequestParam(required = false) Double userLat,
            @RequestParam(required = false) Double userLng,
            @RequestParam(required = false) String departurePlace) { // ✅ Nhận thêm địa điểm khởi hành từ Frontend

        return ApiResponse.<TransportOptionsResponse>builder()
                .result(transportService.getTransportOptions(tripId, userLat, userLng, departurePlace))
                .build();
    }
    /**
     * 2. API Lưu các lựa chọn phương tiện di chuyển của người dùng
     */
    @PostMapping("/select")
    public ApiResponse<String> saveSelections(
            @PathVariable String tripId,
            @RequestBody @Valid TransportSelectionRequest request) {

        transportService.saveSelections(tripId, request);
        return ApiResponse.<String>builder()
                .result("Lưu các lựa chọn di chuyển thành công!")
                .build();
    }
    /**
     * 3. API Xem tổng kết chi phí di chuyển đã chọn của chuyến đi
     */
    @GetMapping("/summary")
    public ApiResponse<Map<String, Object>> getSummary(@PathVariable String tripId) {
        return ApiResponse.<Map<String, Object>>builder()
                .result(transportService.getTransportSummary(tripId))
                .build();
    }
}
