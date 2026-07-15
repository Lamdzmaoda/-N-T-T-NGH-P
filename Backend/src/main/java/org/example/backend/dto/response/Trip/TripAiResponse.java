package org.example.backend.dto.response.Trip;

import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
public class TripAiResponse {
    String  tripName;
    List<DayItinerary>  itinerary;
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    @JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
    public static class DayItinerary {
        Integer dayNumber;
        List<ItineraryItem> activities;
    }
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    @JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
    public static class ItineraryItem {
        String startTime;  // Giờ hoạt động (ví dụ: "08:00")
        String placeId;    // Bắt buộc điền ID của địa điểm trong danh sách MySQL gửi sang
        String description;       // Hoạt động gợi ý
        // Thêm các trường này để AI tự điền nếu đề xuất địa điểm ngoài danh sách:
        Boolean isNewPlace; // true nếu là địa điểm AI tự tìm thấy bên ngoài
        String newPlaceName;
        String newPlaceType; // Bắt buộc là: HOTEL, RESTAURANT, hoặc ATTRACTION
        String newPlaceAddress;
        Double newPlaceLat;
        Double newPlaceLng;
        String newPlaceDescription;
        String newPlacePriceRange; // $, $$, $$$, $$$$1
        // Thêm 2 trường này vào ItineraryItem trong TripAiResponse.java
        Double newPlaceRating;    // AI lấy điểm đánh giá thực tế của địa điểm trên Google (ví dụ: 4.7 hoặc 4.2)
        Integer newPlaceMaxSlots; // AI ước lượng số chỗ ngồi/phòng có thể đặt tối đa dựa trên quy mô địa điểm
        String newPlaceGooglePlaceId;
    }
}
