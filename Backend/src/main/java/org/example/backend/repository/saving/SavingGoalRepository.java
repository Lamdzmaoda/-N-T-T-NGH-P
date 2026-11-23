package org.example.backend.repository.saving;

import org.example.backend.entity.SavingGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavingGoalRepository extends JpaRepository<SavingGoal, String> {
    // Lấy tất cả mục tiêu của người dùng (loại trừ các mục tiêu đã xóa mềm)
    List<SavingGoal> findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(String userId);
    // Tìm mục tiêu theo ID và thuộc về đúng User đang đăng nhập (Bảo mật IDOR)
    Optional<SavingGoal> findByIdAndUserIdAndIsDeletedFalse(String id, String userId);
    // Kiểm tra tên mục tiêu đã tồn tại chưa để tránh tạo trùng
    boolean existsByUserIdAndNameIgnoreCaseAndIsDeletedFalse(String userId, String name);
}
