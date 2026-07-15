package org.example.backend.service.Trip;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.dto.request.booking.TransportSelectionRequest;
import org.example.backend.dto.request.trip.ItineraryCreateRequest;
import org.example.backend.dto.request.trip.ItineraryUpdateRequest;
import org.example.backend.dto.request.trip.TripGenerateRequest;
import org.example.backend.dto.response.Trip.ItineraryItemResponse;
import org.example.backend.dto.response.Trip.TripAiResponse;
import org.example.backend.dto.response.Trip.TripNavigationResponse;
import org.example.backend.dto.response.Trip.TripResponse;
import org.example.backend.dto.response.booking.TransportOptionsResponse;
import org.example.backend.entity.Places.Place;
import org.example.backend.entity.Trips.AiSuggestion;
import org.example.backend.entity.Trips.Trip;
import org.example.backend.entity.Trips.TripItinerary;
import org.example.backend.entity.Trips.TripTransport;
import org.example.backend.entity.User.User;
import org.example.backend.enums.PlaceType;
import org.example.backend.enums.TripStatus;
import org.example.backend.exception.AppException;
import org.example.backend.exception.ErrorCode;
import org.example.backend.mapper.Trip.TripMapper;
import org.example.backend.repository.Ai.AiSuggestionRepository;
import org.example.backend.repository.Trip.TripItineraryRepository;
import org.example.backend.repository.Trip.TripRepository;
import org.example.backend.repository.Trip.TripTransportRepository;
import org.example.backend.repository.place.PlaceRepository;
import org.example.backend.service.AI.GeminiService;
import org.example.backend.service.AI.RateLimiterService;
import org.example.backend.service.auth.AuthenticationService;
import org.example.backend.service.booking.TransportService;
import org.example.backend.service.mail.EmailService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service // Đánh dấu là tầng Service, nơi xử lý logic nghiệp vụ
@RequiredArgsConstructor // Tự động Inject các Repository, Mapper, Encoder qua Constructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
public class TripService {
    PlaceRepository placeRepository;
    TripRepository tripRepository;
    TripItineraryRepository tripItineraryRepository;
    AiSuggestionRepository aiSuggestionRepository;
    GeminiService geminiService;
    AuthenticationService authenticationService;
    ObjectMapper objectMapper;
    TripMapper tripMapper;
    TransportService transportService;
    TripTransportRepository tripTransportRepository;
    EmailService emailService;
    RateLimiterService rateLimiterService;

    public TripResponse generateTrip(TripGenerateRequest request){
        User user = authenticationService.getUserByContext();
        if (!rateLimiterService.isAllowed(user.getId())) {
            throw new AppException(ErrorCode.RATE_LIMIT_EXCEEDED);
        }

        List<Place> dbPlaces = placeRepository.findByAddressContaining(request.getDestination());

        TripAiResponse aiResponse = geminiService.generateTripAiResponse(request, dbPlaces);

        Trip trip = Trip.builder()
                .user(user)
                .title(aiResponse.getTripName())
                .start_date(request.getStartDate())
                .end_date(request.getEndDate())
                .is_favorite(false)
                .status(TripStatus.PLANNING)
                .build();
        Trip savedTrip = tripRepository.save(trip);

        List<TripItinerary> savedItineraries = new ArrayList<>();

        // 1. Lưu toàn bộ các điểm dừng chân của tất cả các ngày vào DB trước
        for(TripAiResponse.DayItinerary day : aiResponse.getItinerary()){
            List<TripAiResponse.ItineraryItem> items = day.getActivities();
            for(int i = 0; i < items.size(); i++){
                TripAiResponse.ItineraryItem item = items.get(i);
                Place place = getOrCreatePlace(item);
                if(place != null){
                    TripItinerary tripItinerary = TripItinerary.builder()
                            .trip(savedTrip)
                            .place(place)
                            .day_number(day.getDayNumber())
                            .order_index(i)
                            .start_time(item.getStartTime())
                            .note(item.getDescription())
                            .build();

                    // Lưu và add vào list
                    savedItineraries.add(tripItineraryRepository.save(tripItinerary));
                }
            }
        }
        // 2. Gọi AI sinh phương tiện di chuyển mặc định duy nhất 1 lần cho toàn bộ chuyến đi
        try {
            TransportOptionsResponse options = transportService.getTransportOptions(
                    savedTrip.getId(),
                    request.getUserLat(),
                    request.getUserLng(),
                    request.getDeparturePlace()
            );
            List<TransportSelectionRequest.SelectionItem> selections = new ArrayList<>();

            // A. Chọn chặng bay/tàu dài mặc định (Chọn hãng đầu tiên AI đề xuất làm gợi ý)
            if (options.getLongDistanceRoutes() != null) {
                for (TransportOptionsResponse.LongDistanceRoute route : options.getLongDistanceRoutes()) {
                    if (route.getOptions() != null && !route.getOptions().isEmpty()) {
                        TransportOptionsResponse.ServiceOption bestOption = route.getOptions().get(0);
                        selections.add(TransportSelectionRequest.SelectionItem.builder()
                                .isLongDistance(true)
                                .departurePlace(route.getDeparturePlace())
                                .destinationPlace(route.getDestinationPlace())
                                .providerName(bestOption.getProviderName())
                                .vehicleType(bestOption.getVehicleType())
                                .price(bestOption.getPrice())
                                .distanceKm(null)
                                .durationMinutes(bestOption.getDurationMinutes())
                                .build());
                    }
                }
            }

            // B. Chọn xe di chuyển nội đô & trung chuyển mặc định (Chọn Grab/XanhSM đầu tiên làm gợi ý)
            if (options.getLocalRoutes() != null) {
                for (TransportOptionsResponse.LocalRoute route : options.getLocalRoutes()) {
                    if (route.getOptions() != null && !route.getOptions().isEmpty()) {
                        TransportOptionsResponse.ServiceOption bestOption = route.getOptions().get(0);
                        selections.add(TransportSelectionRequest.SelectionItem.builder()
                                .isLongDistance(false)
                                .fromItineraryId(route.getFromItineraryId())
                                .toItineraryId(route.getToItineraryId())
                                .providerName(bestOption.getProviderName())
                                .vehicleType(bestOption.getVehicleType())
                                .price(bestOption.getPrice())
                                .distanceKm(route.getDistanceKm())
                                .durationMinutes(bestOption.getDurationMinutes())
                                .build());
                    }
                }
            }

            // C. Lưu tất cả phương tiện mặc định vào Database
            if (!selections.isEmpty()) {
                TransportSelectionRequest selectionRequest = new TransportSelectionRequest(selections);
                transportService.saveSelections(savedTrip.getId(), selectionRequest);
            }
        } catch (Exception e) {
            log.error("Lỗi tự động cấu hình phương tiện di chuyển mặc định: ", e);
        }

        // 3. Lưu nhật ký AI gợi ý
        try{
            String jsonResponse = objectMapper.writeValueAsString(aiResponse);
            AiSuggestion aiSuggestion = AiSuggestion.builder()
                    .trip(savedTrip)
                    .prompt("Yêu cầu sinh lịch trình đi " + request.getDestination())
                    .response(jsonResponse)
                    .build();
            aiSuggestionRepository.save(aiSuggestion);
        }catch(Exception e){
            log.error("Không thể lưu nhật ký AI Suggestion: {}", e.getMessage());
        }

        TripResponse response = tripMapper.toTripResponse(savedTrip);
        response.setItineraries(tripMapper.toItineraryList(savedItineraries));
        return response;
    }
    public String getItineraryContextPrompt(String tripId) {
        User user = authenticationService.getUserByContext();
        // 1. Tìm chuyến đi
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new AppException(ErrorCode.PLACE_NOT_FOUND)); // Hoặc lỗi TRIP_NOT_FOUND nếu bạn có
        if(!trip.getUser().getId().equals(user.getId())){
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        // 2. Lấy danh sách hoạt động chi tiết của chuyến đi đó
        List<TripItinerary> itineraries = tripItineraryRepository.findByTripId(tripId);
        // 3. Nối thành đoạn văn bản mô tả để AI đọc hiểu ngữ cảnh
        StringBuilder context = new StringBuilder();
        context.append(String.format("Đây là thông tin lịch trình của chuyến đi '%s'.\n", trip.getTitle()));
        context.append(String.format("Ngày đi: %s, Ngày về: %s.\n", trip.getStart_date(), trip.getEnd_date()));
        context.append("Chi tiết các hoạt động đã được lên lịch:\n");
        for (TripItinerary item : itineraries) {
            context.append(String.format("- Ngày %d | Lúc: %s | Tại địa điểm: %s (Địa chỉ: %s) | Ghi chú: %s\n",
                    item.getDay_number(),
                    item.getStart_time(),
                    item.getPlace().getName(),
                    item.getPlace().getAddress(),
                    item.getNote()
            ));
        }
        return context.toString();
    }
    public ItineraryItemResponse addItineraryItem(ItineraryCreateRequest request) {
        User user = authenticationService.getUserByContext();

        var trip = tripRepository.findById(request.getTripId()).orElseThrow(() -> new AppException(ErrorCode.PLACE_NOT_FOUND));

        if(!trip.getUser().getId().equals(user.getId())){
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        long totalDays = ChronoUnit.DAYS.between(trip.getStart_date(), trip.getEnd_date()) + 1;
        if(request.getDayNumber() < 1 || request.getDayNumber() > totalDays){
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Ngày hoạt động (" + request.getDayNumber() + ") không hợp lệ cho chuyến đi dài " + totalDays + " ngày!"
            );
        }
        var place = placeRepository.findById(request.getPlaceId()).orElseThrow(() -> new AppException(ErrorCode.PLACE_NOT_FOUND));

        List<TripItinerary> itineraries = tripItineraryRepository.findByTripId(trip.getId())
                .stream().filter(item -> item.getDay_number().equals(request.getDayNumber())).toList();
        int nextOrderIndex = itineraries.size();

        TripItinerary itinerary = TripItinerary.builder()
                .trip(trip)
                .place(place)
                .day_number(request.getDayNumber())
                .order_index(nextOrderIndex)
                .start_time(request.getStartTime())
                .note(request.getNote())
                .build();
        return tripMapper.toItineraryItemResponse(tripItineraryRepository.save(itinerary));
    }
    public ItineraryItemResponse updateItineraryItem(ItineraryUpdateRequest request,String itineraryId) {
        User user = authenticationService.getUserByContext();

        TripItinerary itinerary = tripItineraryRepository.findById(itineraryId).orElseThrow(() -> new AppException(ErrorCode.PLACE_NOT_FOUND));

        if(!itinerary.getTrip().getUser().getId().equals(user.getId())){
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        itinerary.setStart_time(request.getStartTime());
        itinerary.setNote(request.getNote());
        return tripMapper.toItineraryItemResponse(tripItineraryRepository.save(itinerary));
    }
    public List<TripResponse> getTrip(){
        User user = authenticationService.getUserByContext();
        var trip = tripRepository.findByUserId(user.getId());
        return trip.stream().map(tripMapper :: toTripResponse).toList();
    }
    public org.springframework.data.domain.Page<TripResponse> getTripsPaged(int page, int size, String filter) {
        User user = authenticationService.getUserByContext();
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(
                page, size, org.springframework.data.domain.Sort.by("start_date").descending()
        );
        
        org.springframework.data.domain.Page<Trip> tripPage;
        if ("FAVORITE".equalsIgnoreCase(filter)) {
            tripPage = tripRepository.findByUserIdAndIsFavorite(user.getId(), true, pageable);
        } else if ("PLANNING".equalsIgnoreCase(filter) || "ONGOING".equalsIgnoreCase(filter) || "COMPLETED".equalsIgnoreCase(filter)) {
            TripStatus status = TripStatus.valueOf(filter.toUpperCase());
            tripPage = tripRepository.findByUserIdAndStatus(user.getId(), status, pageable);
        } else {
            tripPage = tripRepository.findByUserId(user.getId(), pageable);
        }
        
        return tripPage.map(tripMapper::toTripResponse);
    }
    public TripResponse getTripById(String tripId){
        User user = authenticationService.getUserByContext();
        var trip = tripRepository.findById(tripId).orElseThrow(() -> new AppException(ErrorCode.PLACE_NOT_FOUND));
        if(!trip.getUser().getId().equals(user.getId())){
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        List<TripItinerary> itineraries = tripItineraryRepository.findByTripId(tripId);

        TripResponse  response = tripMapper.toTripResponse(trip);
        response.setItineraries(tripMapper.toItineraryList(itineraries));
        return response;
    }
    public void deleteItineraryItem(String itineraryId) {
        User user = authenticationService.getUserByContext();

        TripItinerary itinerary = tripItineraryRepository.findById(itineraryId).orElseThrow(()
                -> new AppException(ErrorCode.PLACE_NOT_FOUND));
        if(!itinerary.getTrip().getUser().getId().equals(user.getId())){
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        tripItineraryRepository.delete(itinerary);
    }
    private Place getOrCreatePlace(TripAiResponse.ItineraryItem item){

        if(Boolean.TRUE.equals(item.getIsNewPlace())){
            Optional<Place> existingPlace = placeRepository.findByName(item.getNewPlaceName());
            if (item.getNewPlaceGooglePlaceId() != null && !item.getNewPlaceGooglePlaceId().isEmpty()) {
                existingPlace = placeRepository.searchByGooglePlaceId(item.getNewPlaceGooglePlaceId());
            }
            // 2. Nếu không tìm thấy bằng Google Place ID, kiểm tra dự phòng bằng Tên
            if (existingPlace.isEmpty()) {
                existingPlace = placeRepository.findByName(item.getNewPlaceName());
            }
            if (existingPlace.isPresent()) {
                return existingPlace.get();
            }
            // 2. Nếu chưa có, tạo mới và lưu vào bảng places
            Place newPlace = Place.builder()
                    .name(item.getNewPlaceName())
                    .type(PlaceType.valueOf(item.getNewPlaceType().toUpperCase().trim()))
                    .google_place_id(item.getNewPlaceGooglePlaceId())
                    .address(item.getNewPlaceAddress())
                    .lat(item.getNewPlaceLat())
                    .lng(item.getNewPlaceLng())
                    .description(item.getNewPlaceDescription())
                    .price_range(item.getNewPlacePriceRange())
                    // Lấy trực tiếp thông tin slots và rating do AI cào về, nếu null thì gán mặc định
                    .max_slots(item.getNewPlaceMaxSlots() != null ? item.getNewPlaceMaxSlots() : 50)
                    .avg_rating(item.getNewPlaceRating() != null ? item.getNewPlaceRating() : 4.0)
                    .is_visible(true)
                    .build();
            return placeRepository.save(newPlace);
        } else {
            if (item.getPlaceId() == null || item.getPlaceId().trim().isEmpty()) {
                return null;
            }
            return placeRepository.findById(item.getPlaceId()).orElse(null);
        }
    }
    @Transactional
    public TripResponse startTrip(String tripId){
        User user = authenticationService.getUserByContext();
        Trip trip = tripRepository.findById(tripId).orElseThrow(() -> new AppException(ErrorCode.PLACE_NOT_FOUND));
        if(!trip.getUser().getId().equals(user.getId())){
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        trip.setStatus(TripStatus.ONGOING);
        Trip updatedTrip = tripRepository.save(trip);
        log.info("Chuyến đi '{}' ({}) đã chính thức bắt đầu hành trình!", trip.getTitle(), tripId);

        List<TripItinerary> itineraries = tripItineraryRepository.findByTripId(tripId);
        TripResponse  response = tripMapper.toTripResponse(trip);
        response.setItineraries(tripMapper.toItineraryList(itineraries));
        return response;
    }
    public TripNavigationResponse getTripNavigation(String tripId) {
        User user = authenticationService.getUserByContext();
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy chuyến đi!"));

        if (!trip.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền truy cập bản đồ chuyến đi này!");
        }

        List<TripTransport> selections = tripTransportRepository.findByTripId(tripId);
        List<TripItinerary> itineraries = tripItineraryRepository.findByTripId(tripId);

        // Ánh xạ ID Itinerary sang thứ tự hoạt động (order_index) để sắp xếp chặng đi
        Map<String, Integer> itineraryOrderMap = itineraries.stream()
                .collect(Collectors.toMap(TripItinerary::getId, TripItinerary::getOrder_index, (a, b) -> a));

        Map<Integer, List<TripNavigationResponse.NavigationStep>> dayStepsMap = new HashMap<>();

        for (TripTransport selection : selections) {
            if (Boolean.TRUE.equals(selection.getIsLongDistance())) {
                List<TripNavigationResponse.NavigationStep> steps = dayStepsMap.computeIfAbsent(1, k -> new ArrayList<>());

                String googleMapsUrl = String.format("https://www.google.com/maps/dir/?api=1&destination=%s",
                        selection.getDestinationPlace());

                steps.add(TripNavigationResponse.NavigationStep.builder()
                        .fromPlaceName(selection.getDeparturePlace())
                        .toPlaceName(selection.getDestinationPlace())
                        .distanceKm(selection.getDistanceKm())
                        .durationMinutes(selection.getDurationMinutes())
                        .providerName(selection.getProviderName())
                        .vehicleType(selection.getVehicleType())
                        .price(selection.getPrice())
                        .googleMapsUrl(googleMapsUrl)
                        .navigationInstruction(String.format("Khởi hành chặng dài từ %s đến cổng đón %s bằng %s (%s). Thời gian dự kiến: %.0f phút.",
                                selection.getDeparturePlace(), selection.getDestinationPlace(), selection.getProviderName(), selection.getVehicleType(), selection.getDurationMinutes()))
                        .isLongDistance(true)
                        .fromItineraryId("LONG_DISTANCE")
                        .build());
                continue;
            }

            String fromName = "Điểm xuất phát";
            String toName = "Điểm đến tiếp theo";
            Integer dayNumber = 1;
            Double fromLat = null;
            Double fromLng = null;
            Double toLat = null;
            Double toLng = null;

            if ("USER_CURRENT_LOCATION".equals(selection.getFromItineraryId())) {
                fromName = "Vị trí hiện tại của bạn";
                if (selection.getToItineraryId() != null) {
                    Optional<TripItinerary> toItin = tripItineraryRepository.findById(selection.getToItineraryId());
                    if (toItin.isPresent() && toItin.get().getPlace() != null) {
                        toName = toItin.get().getPlace().getName();
                        toLat = toItin.get().getPlace().getLat();
                        toLng = toItin.get().getPlace().getLng();
                        dayNumber = toItin.get().getDay_number();
                    }
                }
            } else {
                if (selection.getFromItineraryId() != null) {
                    Optional<TripItinerary> fromItin = tripItineraryRepository.findById(selection.getFromItineraryId());
                    if (fromItin.isPresent() && fromItin.get().getPlace() != null) {
                        fromName = fromItin.get().getPlace().getName();
                        fromLat = fromItin.get().getPlace().getLat();
                        fromLng = fromItin.get().getPlace().getLng();
                        dayNumber = fromItin.get().getDay_number();
                    }
                }
                if (selection.getToItineraryId() != null) {
                    Optional<TripItinerary> toItin = tripItineraryRepository.findById(selection.getToItineraryId());
                    if (toItin.isPresent() && toItin.get().getPlace() != null) {
                        toName = toItin.get().getPlace().getName();
                        toLat = toItin.get().getPlace().getLat();
                        toLng = toItin.get().getPlace().getLng();
                    }
                }
            }

            // 🛡️ Kiểm tra phòng vệ: Tránh lỗi tọa độ 0.0 (chỉ ra biển châu Phi)
            boolean isFromCoordsValid = fromLat != null && fromLng != null && fromLat != 0.0 && fromLng != 0.0;
            boolean isToCoordsValid = toLat != null && toLng != null && toLat != 0.0 && toLng != 0.0;

            String travelMode = (selection.getProviderName() != null && selection.getProviderName().equals("Tự túc")) ? "walking" : "driving";
            String googleMapsUrl;

            if (isFromCoordsValid && isToCoordsValid) {
                googleMapsUrl = String.format("https://www.google.com/maps/dir/?api=1&origin=%f,%f&destination=%f,%f&travelmode=%s",
                        fromLat, fromLng, toLat, toLng, travelMode);
            } else if (isToCoordsValid) {
                googleMapsUrl = String.format("https://www.google.com/maps/dir/?api=1&destination=%f,%f&travelmode=%s",
                        toLat, toLng, travelMode);
            } else {
                // Nếu tọa độ không hợp lệ, tìm đường dựa trên tên địa điểm du lịch
                googleMapsUrl = String.format("https://www.google.com/maps/dir/?api=1&destination=%s",
                        java.net.URLEncoder.encode(toName, java.nio.charset.StandardCharsets.UTF_8));
            }

            String instruction = String.format("Di chuyển từ '%s' đến '%s'. Quãng đường: %.2f km. Đi bằng %s (%s). Thời gian đi xe: %.0f phút. Chi phí dự kiến: %,.0f VNĐ.",
                    fromName, toName, selection.getDistanceKm(), selection.getProviderName(), selection.getVehicleType(), selection.getDurationMinutes(), selection.getPrice());

            List<TripNavigationResponse.NavigationStep> steps = dayStepsMap.computeIfAbsent(dayNumber, k -> new ArrayList<>());
            steps.add(TripNavigationResponse.NavigationStep.builder()
                    .fromPlaceName(fromName)
                    .toPlaceName(toName)
                    .distanceKm(selection.getDistanceKm())
                    .durationMinutes(selection.getDurationMinutes())
                    .providerName(selection.getProviderName())
                    .vehicleType(selection.getVehicleType())
                    .price(selection.getPrice())
                    .googleMapsUrl(googleMapsUrl)
                    .navigationInstruction(instruction)
                    .isLongDistance(false)
                    .fromItineraryId(selection.getFromItineraryId())
                    .build());
        }

        // Tạo cấu trúc ngày và SẮP XẾP thứ tự các chặng di chuyển theo thời gian lịch trình
        List<TripNavigationResponse.NavigationDay> days = new ArrayList<>();
        for (Map.Entry<Integer, List<TripNavigationResponse.NavigationStep>> entry : dayStepsMap.entrySet()) {
            List<TripNavigationResponse.NavigationStep> steps = entry.getValue();

            // Sắp xếp các chặng đi dựa trên trọng số
            steps.sort(Comparator.comparingDouble(step -> {
                if (Boolean.TRUE.equals(step.getIsLongDistance())) {
                    return -2.0; // Máy bay/tàu dài đi Hà Giang luôn ở đầu tiên của ngày 1
                }
                if ("USER_CURRENT_LOCATION".equals(step.getFromItineraryId()) ||
                        "AIRPORT_STATION_TRANSIT".equals(step.getFromItineraryId())) {
                    return -1.0; // Xe trung chuyển về khách sạn ở vị trí thứ hai
                }

                // Các chặng nội đô sắp xếp theo thứ tự địa điểm trong lịch trình
                Integer order = itineraryOrderMap.get(step.getFromItineraryId());
                return order != null ? order.doubleValue() : 999.0;
            }));

            days.add(new TripNavigationResponse.NavigationDay(entry.getKey(), steps));
        }
        days.sort(Comparator.comparing(TripNavigationResponse.NavigationDay::getDayNumber));

        return TripNavigationResponse.builder()
                .tripId(trip.getId())
                .tripTitle(trip.getTitle())
                .status(trip.getStatus().name())
                .days(days)
                .build();
    }

    @Transactional
    public TripResponse toggleFavorite(String tripId) {
        User user = authenticationService.getUserByContext();
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy chuyến đi!"));
        if (!trip.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền chỉnh sửa chuyến đi này!");
        }
        
        trip.setIs_favorite(!Boolean.TRUE.equals(trip.getIs_favorite()));
        Trip updatedTrip = tripRepository.save(trip);
        
        List<TripItinerary> itineraries = tripItineraryRepository.findByTripId(tripId);
        TripResponse response = tripMapper.toTripResponse(updatedTrip);
        response.setItineraries(tripMapper.toItineraryList(itineraries));
        return response;
    }

    public List<TripResponse> getFavoriteTrips() {
        User user = authenticationService.getUserByContext();
        List<Trip> favoriteTrips = tripRepository.findByUserIdAndIsFavorite(user.getId(), true);
        
        return favoriteTrips.stream().map(trip -> {
            List<TripItinerary> itineraries = tripItineraryRepository.findByTripId(trip.getId());
            TripResponse response = tripMapper.toTripResponse(trip);
            response.setItineraries(tripMapper.toItineraryList(itineraries));
            return response;
        }).collect(Collectors.toList());
    }

    public void sendItineraryEmail(String tripId) {
        User user = authenticationService.getUserByContext();
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy chuyến đi!"));
        if (!trip.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền chia sẻ chuyến đi này!");
        }
        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tài khoản của bạn chưa cấu hình địa chỉ Email!");
        }

        List<TripItinerary> itineraries = tripItineraryRepository.findByTripId(tripId);
        TripNavigationResponse timeline = getTripNavigation(tripId);
        emailService.sendItineraryEmail(user.getEmail(), trip.getTitle(), itineraries, timeline);
    }
}
