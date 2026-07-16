package org.example.backend.service.AI;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import lombok.extern.slf4j.Slf4j;
import org.example.backend.configuration.AiConfig;
import org.example.backend.dto.request.trip.TripGenerateRequest;
import org.example.backend.dto.response.Trip.TripAiResponse;
import org.example.backend.entity.Places.Place;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.converter.BeanOutputConverter;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import org.springframework.security.access.prepost.PreAuthorize;

import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
public class GeminiService {
    ChatModel chatModel;
    ChatClient chatClient;
    AiConfig aiConfig;
    public String generateText(String prompt) {
        try {
            return chatModel.call(prompt);
        } catch (Exception e) {
            return "Lỗi kết nối Gemini: " + e.getMessage();
        }
    }
    public String chatWithAssistant(String chatId, String message) {
        return chatClient.prompt()
                .user(message)
                // ✅ Gắn bộ nhớ thủ công chỉ riêng cho cuộc gọi chat này
                .advisors(MessageChatMemoryAdvisor.builder(aiConfig.chatMemory()).build())
                .advisors(a -> a.param("chat_memory_conversation_id", chatId))
                .call()
                .content();
    }
    public Flux<String> chatStreamWithItinerary(String tripId, String systemPromptContext, String message) {
        try {
            return chatClient.prompt()
                    .system(systemPromptContext)
                    .user(message)
                    .advisors(a -> a.param("chat_memory_conversation_id", tripId))
                    // Gọi hàm .stream() để nhận chữ chạy về liên tục
                    .stream()
                    .content()
                    .onErrorResume(e -> {
                        log.error("Lỗi stream chatbot Gemini: {}", e.getMessage(), e);
                        String friendlyError = "⚠️ Trợ lý AI hiện đang bận hoặc quá tải. Vui lòng thử lại sau giây lát!";
                        if (hasExceptionCauseContaining(e, "429") || hasExceptionCauseContaining(e, "quota")) {
                            friendlyError = "⚠️ Hạn mức API Gemini của tài khoản đã hết (Lỗi 429). Vui lòng thử lại sau!";
                        } else if (hasExceptionCauseContaining(e, "503") || hasExceptionCauseContaining(e, "high demand")) {
                            friendlyError = "⚠️ Máy chủ Google AI đang bị quá tải (Lỗi 503). Vui lòng thử lại sau!";
                        }
                        return Flux.just(friendlyError);
                    });
        } catch (Exception e) {
            log.error("Lỗi khởi tạo chatbot Gemini: {}", e.getMessage(), e);
            return Flux.just("⚠️ Không thể khởi động chatbot AI lúc này: " + e.getMessage());
        }
    }

    public TripAiResponse generateTripAiResponse(TripGenerateRequest request, List<Place> dbPlaces) {
        // 1. Biến danh sách Place thành chuỗi văn bản gửi cho AI đọc
        StringBuilder placesText = new StringBuilder();
        for (Place p : dbPlaces) {
            placesText.append(String.format("- ID: %s, Tên: %s, Loại: %s, Địa chỉ: %s, Mô tả: %s\n",
                    p.getId(), p.getName(), p.getType(), p.getAddress(), p.getDescription()));
        }
        // 2. Tính số ngày đi du lịch
        long dayCount = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
        // 3. Viết Prompt nghiệp vụ ngắn gọn (Không cần viết hướng dẫn JSON nữa!)
        String systemPrompt = String.format("""
                Bạn là một trợ lý ảo thiết kế lịch trình du lịch chuyên nghiệp.
                Nhiệm vụ của bạn là thiết kế một chuyến đi đến %s trong vòng %d ngày.
                Sở thích của người dùng: %s.
                
                Dưới đây là danh sách các địa điểm có sẵn trong cơ sở dữ liệu của tôi:
                %s
                
                Hướng dẫn chọn địa điểm:
                1. Hãy ưu tiên chọn các địa điểm trong danh sách có sẵn trên. Nếu chọn điểm có sẵn, hãy điền 'placeId' tương ứng và gán 'isNewPlace' = false.
                2. Nếu các địa điểm trên chưa đủ phong phú hoặc thiếu, bạn hãy tự tìm kiếm các địa điểm thật, nổi tiếng và chính xác tại %s bằng công cụ Google Search.
                3. Với địa điểm tự tìm bên ngoài, hãy gán 'placeId' = null, 'isNewPlace' = true và cung cấp đầy đủ thông tin chi tiết của địa điểm đó.
                
                Trả về:
                newPlaceType: Bắt buộc chọn 1 trong 3 kiểu: HOTEL, RESTAURANT, hoặc ATTRACTION.
                """,
                request.getDestination(),
                dayCount,
                request.getPreferences().toString(),
                placesText.toString(),
                request.getDestination()
        );
        // 4. Gọi ChatClient và ép kiểu dữ liệu trả về trực tiếp
        log.info("Đang gọi Gemini sinh lịch trình cấu trúc...");

        try {
            return chatClient.prompt()
                    .system(systemPrompt)
                    .user("Hãy lập lịch trình chi tiết.")
                    // ✅ Ép kiểu dữ liệu gốc (Native Structured Output)
                    .call()
                    .entity(TripAiResponse.class);
        } catch (Exception e) {
            log.error("Lỗi gọi Gemini sinh lịch trình: {}", e.getMessage(), e);
            if (hasExceptionCauseContaining(e, "429") || hasExceptionCauseContaining(e, "quota")) {
                throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.TOO_MANY_REQUESTS,
                        "Yêu cầu tạo lịch trình bằng AI đang bị quá tải hoặc vượt quá giới hạn lượt gọi (Rate Limit) của Google Gemini API. Vui lòng đợi khoảng 15-30 giây và thử lại!");
            }
            if (hasExceptionCauseContaining(e, "503") || hasExceptionCauseContaining(e, "high demand") || hasExceptionCauseContaining(e, "temporary")) {
                throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE,
                        "Hệ thống máy chủ Google Gemini đang bị quá tải (lỗi 503 - High Demand). Vui lòng thử lại sau giây lát!");
            }
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR,
                    "Không thể tạo lịch trình bằng AI lúc này. Chi tiết: " + e.getMessage());
        }
    }
    private boolean hasExceptionCauseContaining(Throwable e, String term) {
        Throwable current = e;
        while (current != null) {
            if (current.getMessage() != null && current.getMessage().toLowerCase().contains(term.toLowerCase())) {
                return true;
            }
            current = current.getCause();
        }
        return false;
    }
    private String systemPrompt(){
        return """
                Bạn là một trợ lý ảo thiết kế lịch trình du lịch chuyên nghiệp.
                BẮT BUỘC phải viết đúng chính xác tên các trường JSON dưới dạng camelCase (như dayNumber, placeId, isNewPlace, newPlaceName...). TUYỆT ĐỐI KHÔNG được tự ý viết dưới dạng snake_case (như day_number, place_id).
                Đầu ra BẮT BUỘC phải là một đối tượng JSON (JSON Object) duy nhất, bắt đầu bằng dấu ngoặc nhọn { và kết thúc bằng dấu ngoặc nhọn }. TUYỆT ĐỐI KHÔNG được bọc ngoài cùng bằng dấu ngoặc vuông [ (JSON Array) hoặc trả về dạng danh sách mảng ở ngoài cùng.
                - startTime : Phải là để thời gian chứ không để là buổi sáng chiều tối trưa được.
                                  Nhiệm vụ của bạn là thiết kế một chuyến đi đến %s trong vòng %d ngày.
                                  Sở thích của người dùng: %s.
                
                                  Dưới đây là danh sách các địa điểm có sẵn trong cơ sở dữ liệu của tôi:
                                  %s
                                  Hướng dẫn chọn địa điểm:
                                  1. Hãy ưu tiên chọn các địa điểm trong danh sách có sẵn trên. Nếu chọn điểm có sẵn, hãy điền 'placeId' tương ứng và gán 'isNewPlace' = false.
                                  2. Nếu các địa điểm trên chưa đủ phong phú hoặc thiếu, bạn hãy tự tìm kiếm các địa điểm thật, nổi tiếng và chính xác tại %s bằng công cụ Google Search.
                                  3. Với địa điểm tự tìm bên ngoài, hãy gán 'placeId' = null, 'isNewPlace' = true và bắt buộc cung cấp đầy đủ thông tin chi tiết:
                                     - newPlaceName: Tên địa điểm thật.
                                     - newPlaceType: Bắt buộc chọn 1 trong 3 kiểu: HOTEL, RESTAURANT, hoặc ATTRACTION.
                                     - newPlaceAddress: Địa chỉ cụ thể.
                                     - newPlaceLat & newPlaceLng: Tọa độ kinh/vĩ độ chính xác để vẽ bản đồ.
                                     - newPlaceDescription: Mô tả ngắn gọn về địa điểm.
                                     - newPlacePriceRange: Tầm giá ($, $$, $$$, $$$$).
                                     - newPlaceRating: Điểm đánh giá trung bình thực tế của địa điểm đó trên Google Maps hoặc internet (chữ số thập phân từ 1.0 đến 5.0, ví dụ: 4.6).
                                     - newPlaceMaxSlots: Hãy ước lượng số lượng chỗ/phòng có thể đặt tối đa tại một thời điểm của địa điểm đó (Ví dụ: Khách sạn lớn: 150-250, Nhà hàng trung bình: 40-60, Quán cafe nhỏ: 20-30).
                                     - newPlaceGooglePlaceId: BẮT BUỘC tra cứu và điền mã Google Place ID của địa điểm đó trên Google Maps (Mã này luôn bắt đầu bằng chữ 'ChI').
                                  %s
                """;
    }
}
