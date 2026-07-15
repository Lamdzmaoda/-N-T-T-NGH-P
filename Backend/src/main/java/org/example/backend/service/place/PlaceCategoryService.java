package org.example.backend.service.place;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.dto.request.place.PlaceCategoryRequest;
import org.example.backend.dto.response.place.PlaceCategoryResponse;
import org.example.backend.exception.AppException;
import org.example.backend.exception.ErrorCode;
import org.example.backend.mapper.place.PlaceCategoryMapper;
import org.example.backend.repository.place.PlaceCategoryRepository;
import org.springframework.stereotype.Service;

import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@Service // Đánh dấu là tầng Service, nơi xử lý logic nghiệp vụ
@RequiredArgsConstructor // Tự động Inject các Repository, Mapper, Encoder qua Constructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PlaceCategoryService {
    PlaceCategoryRepository placeCategoryRepository;
    PlaceCategoryMapper placeCategoryMapper;

    @PreAuthorize("hasRole('ADMIN')")
    public PlaceCategoryResponse create(PlaceCategoryRequest request) {
        var category = placeCategoryMapper.toPlaceCategory(request);

        if(request.getParentId() != null && !request.getParentId().isEmpty()) {
            var parent = placeCategoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
            category.setParent(parent);
        }
        return placeCategoryMapper.toPlaceCategoryResponse(placeCategoryRepository.save(category));
    }
    public List<PlaceCategoryResponse> findAll() {
        return placeCategoryRepository.findAll()
                .stream().map(placeCategoryMapper :: toPlaceCategoryResponse).toList();
    }
    @PreAuthorize("hasRole('ADMIN')")
    public PlaceCategoryResponse update(PlaceCategoryRequest request,String id) {
        var category = placeCategoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        category.setName(request.getName());

        if(request.getParentId() != null && !request.getParentId().isEmpty()) {
            var parent = placeCategoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
            category.setParent(parent);
        }else {
            category.setParent(null);
        }
        return placeCategoryMapper.toPlaceCategoryResponse(placeCategoryRepository.save(category));
    }
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(String id) {
        placeCategoryRepository.deleteById(id);
    }
}
