package org.example.backend.repository.categories;

import org.example.backend.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, String> {
    // Kiểm tra xem đã có danh mục mặc định nào trong hệ thống chưa
    boolean existsByIsDefaultTrue();

    @Query("SELECT c FROM Category c WHERE (c.isDefault = true OR c.user.id = :userId) AND (c.isActive IS NULL OR c.isActive = true)")
    List<Category> findAllAvailableCategories(@Param("userId") String userId);

    boolean existsByIdAndIsDefaultFalseAndUserId(String categoryId, String userId);

    boolean existsByUserIdAndNameIgnoreCase(String userId, String name);

    Optional<Category> findByIdAndUserIdAndIsDefaultFalse(String id, String id1);

    List<Category> findByIsDefaultTrueOrderByTypeAscNameAsc();

    boolean existsByIsDefaultTrueAndNameIgnoreCase(String name);
}
