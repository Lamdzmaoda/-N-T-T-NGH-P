package org.example.backend.repository.budget;

import org.example.backend.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget,String> {
    @Query("SELECT b from Budget b JOIN FETCH b.category WHERE b.user.id = :userId and b.month = :month AND b.year = :year And (b.isDeleted IS NULL OR b.isDeleted = false)")
    List<Budget> findByUserIdAndMonthAndYear(@Param("userId") String userId, @Param("month") int month, @Param("year") int year);

    Optional<Budget> findByIdAndUserIdAndIsDeletedFalse(String id, String UserId);
    Optional<Budget> findByUserIdAndCategoryIdAndIsDeletedFalseAndMonthAndYear(String user_id, String category_Id, Integer month, Integer year);

    boolean existsByUserIdAndCategoryIdAndIsDeletedFalseAndMonthAndYear(String user_id, String category_id, Integer month, Integer year);

    boolean existsByCategoryId(String categoryId);

    List<Budget> findByUserIdAndIsDeletedTrueOrderByDeletedAtDesc(String userId);
}
