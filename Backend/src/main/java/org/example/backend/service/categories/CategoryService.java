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
    public CategoryResponse createCategory(CategoryRequest request){
        var user = authenticationService.getUserByContext();
        if(categoryRepository.existsByUserIdAndNameIgnoreCase(user.getId(),request.name())){
            throw new AppException(ErrorCode.CATEGORY_EXISTED);
        }
        var category = categoryMapper.toCategory(request);
        category.setUser(user);
        category.setIsDefault(false);
        categoryRepository.save(category);

        return categoryMapper.toCategoryResponse(category);
    }
    public List<CategoryResponse> getAllCategories(){
        var user = authenticationService.getUserByContext();
        return categoryRepository.findAllAvailableCategories(user.getId()).stream().map(categoryMapper::toCategoryResponse).toList();
    }
    public CategoryResponse updateCategory(CategoryRequest request,String id){
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
    public void deleteCategory(String id){
        var user = authenticationService.getUserByContext();
        if(!categoryRepository.existsByIdAndIsDefaultFalseAndUserId(id, user.getId())){
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        var category = categoryRepository.findByIdAndUserIdAndIsDefaultFalse(id, user.getId());
        if(category.isEmpty()){
            throw new AppException(ErrorCode.CATEGORY_NOT_FOUND);
        }
        categoryRepository.deleteById(id);
    }

}
