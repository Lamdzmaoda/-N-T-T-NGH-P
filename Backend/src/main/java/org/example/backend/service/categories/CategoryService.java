package org.example.backend.service.categories;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.dto.request.categories.CategoryRequest;
import org.example.backend.dto.response.categories.CategoryResponse;
import org.example.backend.entity.Category;
import org.example.backend.entity.User.User;
import org.example.backend.exception.AppException;
import org.example.backend.exception.ErrorCode;
import org.example.backend.mapper.categories.CategoryMapper;
import org.example.backend.repository.auth.UserRepository;
import org.example.backend.repository.categories.CategoryRepository;
import org.example.backend.service.auth.AuthenticationService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service // Đánh dấu là tầng Service, nơi xử lý logic nghiệp vụ
@RequiredArgsConstructor // Tự động Inject các Repository, Mapper, Encoder qua Constructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CategoryService {
    CategoryRepository categoryRepository;
    CategoryMapper categoryMapper;
    AuthenticationService authenticationService;

    public CategoryResponse createCategory(CategoryRequest request) {
        var user = authenticationService.getUserByContext();
        if (categoryRepository.existsByUserIdAndNameIgnoreCase(user.getId(), request.name())) {
            throw new AppException(ErrorCode.CATEGORY_EXISTED);
        }
        var category = categoryMapper.toCategory(request);
        category.setUser(user);
        category.setIsDefault(false);
        categoryRepository.save(category);

        return categoryMapper.toCategoryResponse(category);
    }

    public List<CategoryResponse> getAllCategories() {
        var user = authenticationService.getUserByContext();
        return categoryRepository.findAllAvailableCategories(user.getId()).stream().map(categoryMapper::toCategoryResponse).toList();
    }

    public CategoryResponse updateCategory(CategoryRequest request, String id) {
        var user = authenticationService.getUserByContext();
        // 1. Tìm đúng danh mục của User đó (và không phải danh mục mặc định của hệ thống)
        var category = categoryRepository.findByIdAndUserIdAndIsDefaultFalse(id, user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        // 2. Kiểm tra nếu đổi tên thì tên mới có bị trùng với danh mục khác không
        if (!category.getName().equalsIgnoreCase(request.name()) &&
                categoryRepository.existsByUserIdAndNameIgnoreCase(user.getId(), request.name())) {
            throw new AppException(ErrorCode.CATEGORY_EXISTED);
        }
        category.setName(request.name().trim());
        category.setType(request.type());
        category.setIcon(request.icon());
        category.setColor(request.color());
        Category updatedCategory = categoryRepository.save(category);

        return categoryMapper.toCategoryResponse(updatedCategory);
    }


    @PreAuthorize("hasRole('ADMIN')")
    public List<CategoryResponse> getAllCategoriesForAdmin() {
        return categoryRepository.findByIsDefaultTrueOrderByTypeAscNameAsc()
                .stream().map(categoryMapper::toCategoryResponse).toList();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public CategoryResponse createSystemCategory(CategoryRequest request) {
        if (categoryRepository.existsByIsDefaultTrueAndNameIgnoreCase(request.name().trim())) {
            throw new AppException(ErrorCode.CATEGORY_EXISTED);
        }

        Category category = Category.builder()
                .name(request.name().trim())
                .type(request.type())
                .icon(request.icon())
                .color(request.color())
                .isDefault(true)
                .user(null)
                .build();

        return categoryMapper.toCategoryResponse(categoryRepository.save(category));
    }
    @PreAuthorize("hasRole('ADMIN')")
    public CategoryResponse updateSystemCategory(CategoryRequest request, String id) {
        var category = categoryRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        if (!category.getName().equalsIgnoreCase(request.name().trim()) &&
                categoryRepository.existsByIsDefaultTrueAndNameIgnoreCase(request.name().trim())) {
            throw new AppException(ErrorCode.CATEGORY_EXISTED);
        }

        category.setName(request.name().trim());
        category.setType(request.type());
        category.setIcon(request.icon());
        category.setColor(request.color());

        return  categoryMapper.toCategoryResponse(categoryRepository.save(category));
    }
    // 1. User Xóa mềm (Ẩn danh mục)
    public void deleteCategory(String id) {
        var user = authenticationService.getUserByContext();
        var category = categoryRepository.findByIdAndUserIdAndIsDefaultFalse(id, user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        category.setIsActive(false);
        categoryRepository.save(category);
    }
    // 2. User Khôi phục danh mục đã ẩn
    public void restoreCategory(String id) {
        var user = authenticationService.getUserByContext();
        var category = categoryRepository.findByIdAndUserIdAndIsDefaultFalse(id, user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        category.setIsActive(true);
        categoryRepository.save(category);
    }

    // 3. Admin Ẩn/Hiện danh mục hệ thống
    @PreAuthorize("hasRole('ADMIN')")
    public CategoryResponse toggleSystemCategoryStatus(String id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        boolean current = category.getIsActive() != null ? category.getIsActive() : true;
        category.setIsActive(!current);
        return categoryMapper.toCategoryResponse(categoryRepository.save(category));
    }
    // 4. Admin Xóa vĩnh viễn danh mục hệ thống
    @PreAuthorize("hasRole('ADMIN')")
    public void permanentDeleteSystemCategory(String id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        categoryRepository.delete(category);
    }

}
