package org.example.backend.service.place;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.dto.request.place.PlaceCategoryRequest;
import org.example.backend.dto.request.place.PlaceRequest;
import org.example.backend.dto.response.place.PlaceCategoryResponse;
import org.example.backend.dto.response.place.PlaceResponse;
import org.example.backend.entity.Engagement.PlaceLike;
import org.example.backend.entity.Places.Place;
import org.example.backend.entity.Places.PlaceCategory;
import org.example.backend.entity.User.User;
import org.example.backend.enums.PlaceType;
import org.example.backend.exception.AppException;
import org.example.backend.exception.ErrorCode;
import org.example.backend.mapper.place.PlaceCategoryMapper;
import org.example.backend.mapper.place.PlaceMapper;
import org.example.backend.repository.auth.UserRepository;
import org.example.backend.repository.place.PlaceCategoryRepository;
import org.example.backend.repository.place.PlaceLikeRepository;
import org.example.backend.repository.place.PlaceRepository;
import org.example.backend.service.auth.AuthenticationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.List;

@Service // Đánh dấu là tầng Service, nơi xử lý logic nghiệp vụ
@RequiredArgsConstructor // Tự động Inject các Repository, Mapper, Encoder qua Constructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PlaceService {
    PlaceCategoryRepository placeCategoryRepository;
    PlaceMapper placeMapper;
    PlaceRepository placeRepository;
    PlaceLikeRepository placeLikeRepository;
    AuthenticationService  authenticationService;
    UserRepository userRepository;

    @PreAuthorize("hasRole('ADMIN')")
    public PlaceResponse create(PlaceRequest request) {
        var place = placeMapper.toPlace(request);

        if(request.getCategoryId() != null && !request.getCategoryId().isEmpty()) {
            var category = placeCategoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
            place.setCategory(category);
        }
        place.setAvg_rating(0.0); // hoặc place.setAvgRating(0.0);
        return placeMapper.toPlaceResponse(placeRepository.save(place));
    }
    public Page<PlaceResponse> findAll(int page, int size, String search, PlaceType type, String categoryId) {

        // 1. Dùng "create_at" khớp với tên biến trong Entity
        Pageable pageable = PageRequest.of(page, size, Sort.by("create_at").descending());

        // 2. Lấy dữ liệu đã lọc và phân trang từ Repository
        Page<Place> placePage = placeRepository.findPlacesWithFilters(search, type, categoryId, pageable);

        // 3. Sử dụng hàm .map() của đối tượng Page để chuyển đổi Entity -> DTO tự động
        return placePage.map(place -> {
            PlaceResponse placeResponse = placeMapper.toPlaceResponse(place);
            placeResponse.setLiked(checkIsPlaceLiked(place.getId()));
            return placeResponse;
        });
    }
    public PlaceResponse findById(String id) {
        var place = placeRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.PLACE_NOT_FOUND));
        PlaceResponse placeResponse = placeMapper.toPlaceResponse(place);
        placeResponse.setLiked(checkIsPlaceLiked(place.getId()));
        return placeResponse;
    }
    @PreAuthorize("hasRole('ADMIN')")
    public PlaceResponse update(PlaceRequest request,String id) {
        var place = placeRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.PLACE_NOT_FOUND));

        if(request.getCategoryId() != null && !request.getCategoryId().isEmpty()) {
            var category = placeCategoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
            place.setCategory(category);
        }else {
            place.setCategory(null);
        }
        placeMapper.updatePlace(request, place);

        return placeMapper.toPlaceResponse(placeRepository.save(place));
    }
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(String id) {
        placeRepository.deleteById(id);
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public void likePlace(String placeId){
        User user = authenticationService.getUserByContext();

        var place = placeRepository.findById(placeId).orElseThrow(() -> new AppException(ErrorCode.PLACE_NOT_FOUND));
        boolean check = placeLikeRepository.existsByUserAndPlaceId(user, placeId);
        if(check) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }
        else {
            PlaceLike placeLike = PlaceLike.builder()
                    .user(user)
                    .place(place)
                    .build();
            placeLikeRepository.save(placeLike);
        }
    }
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public void unlikePlace(String placeId){
        User user = authenticationService.getUserByContext();
        boolean check = placeLikeRepository.existsByUserAndPlaceId(user, placeId);
        if(!check) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }
        else {
            var like = placeLikeRepository.findByUserAndPlaceId(user, placeId).orElseThrow(() -> new AppException(ErrorCode.INVALID_KEY));
            placeLikeRepository.delete(like);
        }
    }
    private boolean checkIsPlaceLiked(String placeId) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();

        if(authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            return false;
        }
        var user = userRepository.findByUsername(authentication.getName()).orElse(null);
        if(user == null) {
            return false;
        }
        return placeLikeRepository.existsByUserAndPlaceId(user, placeId);
    }
}
