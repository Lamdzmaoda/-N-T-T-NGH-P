package org.example.backend.controller.trip;


import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.backend.dto.ApiResponse;
import org.example.backend.dto.request.trip.ItineraryCreateRequest;
import org.example.backend.dto.request.trip.ItineraryUpdateRequest;
import org.example.backend.dto.request.trip.TripGenerateRequest;
import org.example.backend.dto.response.Trip.ItineraryItemResponse;
import org.example.backend.dto.response.Trip.TripNavigationResponse;
import org.example.backend.dto.response.Trip.TripResponse;
import org.example.backend.service.AI.GeminiService;
import org.example.backend.service.Trip.TripService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.List;

@RestController
@RequestMapping("/trips")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TripController {
    TripService tripService;
    GeminiService geminiService;

    @PostMapping("/generate")
    public ApiResponse<TripResponse> generateTrip(@RequestBody TripGenerateRequest request) {
        return ApiResponse.<TripResponse>builder()
                .result(tripService.generateTrip(request))
                .build();
    }
    @PostMapping("/itinerary")
    public ApiResponse<ItineraryItemResponse> addItineraryItem(@RequestBody ItineraryCreateRequest request) {
        return ApiResponse.<ItineraryItemResponse>builder()
                .result(tripService.addItineraryItem(request))
                .build();
    }
    @PutMapping("/itinerary/{id}")
    public ApiResponse<ItineraryItemResponse> updateItineraryItem(@RequestBody ItineraryUpdateRequest request,@PathVariable String id) {
        return ApiResponse.<ItineraryItemResponse>builder()
                .result(tripService.updateItineraryItem(request,id))
                .build();
    }
    @GetMapping
    public ApiResponse<org.springframework.data.domain.Page<TripResponse>> getTrips(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size,
            @RequestParam(required = false, defaultValue = "ALL") String filter
    ) {
        return ApiResponse.<org.springframework.data.domain.Page<TripResponse>>builder()
                .result(tripService.getTripsPaged(page, size, filter))
                .build();
    }
    @GetMapping("/{id}")
    public ApiResponse<TripResponse> getTrip(@PathVariable String id) {
        return ApiResponse.<TripResponse>builder().result(tripService.getTripById(id)).build();
    }
    @DeleteMapping("/itinerary/{id}")
    public ApiResponse<Void> deleteItineraryItem(@PathVariable String id) {
        tripService.deleteItineraryItem(id);
        return ApiResponse.<Void>builder().message("Xóa thành công").build();
    }

    @PostMapping(value = "/{tripId}/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> chatWithTripContext(
            @PathVariable String tripId,
            @RequestParam String message) {

        // 1. Dựng prompt hệ thống chứa thông tin lịch trình thật lấy từ DB
        String systemPromptContext = "Bạn là trợ lý ảo đồng hành cùng người dùng trong chuyến đi này. " +
                "Hãy trả lời các câu hỏi và hỗ trợ họ. " +
                "Dưới đây là lịch trình thực tế hiện tại của chuyến đi:\n" +
                tripService.getItineraryContextPrompt(tripId);

        // 2. Trả về luồng chat streaming chữ chạy từ từ
        return geminiService.chatStreamWithItinerary(tripId, systemPromptContext, message);
    }
    @PutMapping("/{tripId}/start")
    public ApiResponse<TripResponse> startTrip(@PathVariable String tripId) {
        return ApiResponse.<TripResponse>builder()
                .result(tripService.startTrip(tripId))
                .build();
    }
    /**
     * 2. API Lấy thông tin bản đồ, chỉ đường Google Maps chi tiết cho chuyến đi đang diễn ra
     */
    @GetMapping("/{tripId}/navigation")
    public ApiResponse<TripNavigationResponse> getTripNavigation(@PathVariable String tripId) {
        return ApiResponse.<TripNavigationResponse>builder()
                .result(tripService.getTripNavigation(tripId))
                .build();
    }

    @PutMapping("/{tripId}/favorite")
    public ApiResponse<TripResponse> toggleFavorite(@PathVariable String tripId) {
        return ApiResponse.<TripResponse>builder()
                .result(tripService.toggleFavorite(tripId))
                .build();
    }

    @GetMapping("/favorites")
    public ApiResponse<List<TripResponse>> getFavoriteTrips() {
        return ApiResponse.<List<TripResponse>>builder()
                .result(tripService.getFavoriteTrips())
                .build();
    }

    @PostMapping("/{tripId}/send-email")
    public ApiResponse<String> sendItineraryEmail(@PathVariable String tripId) {
        tripService.sendItineraryEmail(tripId);
        return ApiResponse.<String>builder()
                .result("Gửi email lịch trình thành công!")
                .build();
    }
}
