package org.example.backend.service.mail;

import jakarta.mail.internet.MimeMessage;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.dto.response.Trip.TripNavigationResponse;
import org.example.backend.entity.Places.Place;
import org.example.backend.entity.Trips.TripItinerary;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class EmailService {
    JavaMailSender mailSender;

    public void sendItineraryEmail(String toEmail, String tripTitle, List<TripItinerary> itineraries, TripNavigationResponse timeline) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(toEmail);
            helper.setSubject("Lịch trình du lịch chi tiết: " + tripTitle);
            
            StringBuilder html = new StringBuilder();
            html.append("<html><body style='font-family: \"Segoe UI\", Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6;'>");
            html.append("<div style='max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);'>");
            
            // Header Banner
            html.append("<div style='background: linear-gradient(135deg, #4F46E5, #3B82F6); padding: 25px; text-align: center; color: white;'>");
            html.append("<h1 style='margin: 0; font-size: 24px; font-weight: 700;'>Travel AI Planner</h1>");
            html.append("<p style='margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;'>Hành trình du lịch tự động của bạn</p>");
            html.append("</div>");
            
            html.append("<div style='padding: 25px;'>");
            html.append("<p>Xin chào!</p>");
            html.append("<p>Dưới đây là chi tiết hành trình chuyến đi <strong>").append(tripTitle).append("</strong> được thiết kế tối ưu và đồng bộ bởi Travel AI:</p>");
            
            // Group itineraries by day_number
            Map<Integer, List<TripItinerary>> groupedItin = itineraries.stream()
                    .collect(Collectors.groupingBy(TripItinerary::getDay_number));
            
            List<Integer> sortedDays = groupedItin.keySet().stream().sorted().collect(Collectors.toList());
            
            for (Integer dayNum : sortedDays) {
                html.append("<h3 style='color: #1E293B; border-left: 4px solid #3B82F6; padding-left: 10px; margin-top: 30px; margin-bottom: 15px; font-size: 18px;'>Ngày ")
                    .append(dayNum).append("</h3>");
                
                html.append("<div style='margin-left: 5px; border-left: 2px dashed #E2E8F0; padding-left: 15px;'>");
                
                List<TripItinerary> dayItins = groupedItin.get(dayNum);
                dayItins.sort(Comparator.comparing(TripItinerary::getOrder_index));
                
                for (int i = 0; i < dayItins.size(); i++) {
                    TripItinerary cur = dayItins.get(i);
                    Place place = cur.getPlace();
                    
                    if (place == null) continue;
                    
                    // Render Visit Place
                    String typeBadgeColor = "#3B82F6"; // Blue for Attraction
                    String typeText = "ĐIỂM ĐẾN";
                    if ("RESTAURANT".equals(place.getType().name())) {
                        typeBadgeColor = "#10B981"; // Green for Restaurant
                        typeText = "ẨM THỰC";
                    } else if ("HOTEL".equals(place.getType().name())) {
                        typeBadgeColor = "#F59E0B"; // Orange for Hotel
                        typeText = "LƯU TRÚ";
                    }
                    
                    html.append("<div style='background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px; margin-bottom: 12px;'>");
                    html.append("<span style='display: inline-block; background-color: ").append(typeBadgeColor)
                        .append("; color: white; font-size: 11px; font-weight: bold; padding: 2px 6px; border-radius: 4px; margin-bottom: 5px;'>").append(typeText).append("</span> ");
                    
                    html.append("<strong style='font-size: 13px; color: #475569;'>").append(cur.getStart_time()).append("</strong><br/>");
                    html.append("<span style='font-size: 16px; font-weight: bold; color: #1E293B;'>").append(place.getName()).append("</span><br/>");
                    html.append("<span style='font-size: 13px; color: #64748B;'>Địa chỉ: ").append(place.getAddress()).append("</span><br/>");
                    if (cur.getNote() != null && !cur.getNote().isEmpty()) {
                        html.append("<div style='margin-top: 5px; background-color: #FFFBEB; border-left: 3px solid #F59E0B; padding: 5px; font-size: 13px; color: #78350F; font-style: italic;'>Ghi chú: ").append(cur.getNote()).append("</div>");
                    }
                    html.append("</div>");
                    
                    // Render Transit if available
                    final String curItinId = cur.getId();
                    // Look for a step in the timeline
                    TripNavigationResponse.NavigationStep matchedStep = null;
                    if (timeline != null && timeline.getDays() != null) {
                        for (TripNavigationResponse.NavigationDay navDay : timeline.getDays()) {
                            if (navDay.getSteps() != null) {
                                matchedStep = navDay.getSteps().stream()
                                        .filter(s -> curItinId.equals(s.getFromItineraryId()))
                                        .findFirst().orElse(null);
                                if (matchedStep != null) break;
                            }
                        }
                    }
                    
                    if (matchedStep != null) {
                        html.append("<div style='background-color: #F8FAFC; border: 1px dashed #CBD5E1; border-radius: 8px; padding: 12px; margin-bottom: 12px;'>");
                        html.append("<span style='display: inline-block; background-color: #64748B; color: white; font-size: 11px; font-weight: bold; padding: 2px 6px; border-radius: 4px; margin-bottom: 5px;'>DI CHUYỂN BẰNG ").append(matchedStep.getVehicleType()).append("</span><br/>");
                        html.append("<span style='font-size: 14px; color: #334155;'>").append(matchedStep.getNavigationInstruction()).append("</span><br/>");
                        if (matchedStep.getGoogleMapsUrl() != null) {
                            html.append("<div style='margin-top: 5px;'><a href='").append(matchedStep.getGoogleMapsUrl())
                                .append("' style='color: #2563EB; font-size: 13px; text-decoration: none; font-weight: 600;'>🗺️ Mở Google Maps chỉ đường</a></div>");
                        }
                        html.append("</div>");
                    }
                }
                
                html.append("</div>");
            }
            
            html.append("<p style='margin-top: 25px;'>Chúc bạn có một chuyến đi thật vui vẻ và an toàn!</p>");
            html.append("<p>Trân trọng,<br/>Đội ngũ phát triển Travel AI Planner</p>");
            html.append("</div>");
            
            // Footer
            html.append("<div style='background-color: #F1F5F9; padding: 15px; text-align: center; font-size: 11px; color: #94A3B8;'>");
            html.append("Email được gửi tự động từ Travel AI Planner. Vui lòng không trả lời thư này.");
            html.append("</div>");
            
            html.append("</div></body></html>");
            
            helper.setText(html.toString(), true);
            mailSender.send(message);
            log.info("Đã gửi email lịch trình thành công tới: {}", toEmail);
        } catch (Exception e) {
            log.error("Lỗi khi gửi email lịch trình: ", e);
            throw new RuntimeException("Không thể gửi email lịch trình: " + e.getMessage());
        }
    }
}
