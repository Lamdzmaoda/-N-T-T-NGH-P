package org.example.backend.service.place;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.dto.request.place.ReviewRequest;
import org.example.backend.dto.response.place.ReviewResponse;
import org.example.backend.entity.Engagement.Review;
import org.example.backend.entity.User.User;
import org.example.backend.exception.AppException;
import org.example.backend.exception.ErrorCode;
import org.example.backend.mapper.place.ReviewMapper;
import org.example.backend.repository.place.PlaceRepository;
import org.example.backend.repository.place.ReviewRepository;
import org.example.backend.service.auth.AuthenticationService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.List;

@Service // Đánh dấu là tầng Service, nơi xử lý logic nghiệp vụ
@RequiredArgsConstructor // Tự động Inject các Repository, Mapper, Encoder qua Constructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ReviewService {
    ReviewRepository reviewRepository;
    ReviewMapper reviewMapper;
    PlaceRepository placeRepository;
    AuthenticationService authenticationService;
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ReviewResponse createReview(ReviewRequest reviewRequest) {
        User user = authenticationService.getUserByContext();
        var review = reviewMapper.toReview(reviewRequest);

        if(reviewRequest.getPlaceId() != null && !reviewRequest.getPlaceId().isEmpty()){
            var place = placeRepository.findById(reviewRequest.getPlaceId()).orElseThrow(() -> new AppException(ErrorCode.PLACE_NOT_FOUND));
            review.setPlace(place);
        }
        review.setUser(user);
        reviewRepository.save(review);
        Double avgRating = reviewRepository.calculateAvgRating(reviewRequest.getPlaceId());
        var place = review.getPlace();
        place.setAvg_rating(avgRating);
        placeRepository.save(place);
        return reviewMapper.toReviewResponse(review);
    }
    public List<ReviewResponse> getReviews(String placeId) {
        List<Review> reviews = reviewRepository.findByPlaceId(placeId);
        return reviews.stream().map(reviewMapper :: toReviewResponse).toList();
    }
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ReviewResponse updateReview(ReviewRequest reviewRequest, String id) {
        User user = authenticationService.getUserByContext();
        var review = reviewRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.PLACE_NOT_FOUND));
        if(!user.getUsername().equals(review.getUser().getUsername())){
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        if(reviewRequest.getPlaceId() != null && !reviewRequest.getPlaceId().isEmpty()){
            var place = placeRepository.findById(reviewRequest.getPlaceId()).orElseThrow(() -> new AppException(ErrorCode.PLACE_NOT_FOUND));
            review.setPlace(place);
        }else {
            review.setPlace(null);
        }
        reviewRepository.calculateAvgRating(reviewRequest.getPlaceId());
        reviewMapper.updateReview(reviewRequest, review);
        Double avgRating = reviewRepository.calculateAvgRating(reviewRequest.getPlaceId());
        var place = review.getPlace();
        place.setAvg_rating(avgRating != null ? avgRating : 0.0);
        placeRepository.save(place);
        return reviewMapper.toReviewResponse(reviewRepository.save(review));
    }
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public void deleteReview(String id) {
        User user = authenticationService.getUserByContext();
        var  review = reviewRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.PLACE_NOT_FOUND));
        if(!user.getUsername().equals(review.getUser().getUsername())){
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        reviewRepository.calculateAvgRating(review.getPlace().getId());
        reviewRepository.deleteById(id);
        Double avgRating = reviewRepository.calculateAvgRating(review.getPlace().getId());
        var place = review.getPlace();
        place.setAvg_rating(avgRating != null ? avgRating : 0.0);
        placeRepository.save(place);
    }
}
