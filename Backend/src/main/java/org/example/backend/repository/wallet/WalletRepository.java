package org.example.backend.repository.wallet;

import org.example.backend.entity.Wallet;
import org.example.backend.enums.WalletType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
@Repository
public interface WalletRepository extends JpaRepository<Wallet, String> {
    // Lấy tất cả ví đang hoạt động của người dùng
    List<Wallet> findByUserIdAndIsActiveTrue(String userId);
    // Lấy danh sách ví đang hoạt động của người dùng theo loại (chống đọc trộm ví của user khác)
    List<Wallet> findByUserIdAndTypeAndIsActiveTrue(String userId, WalletType type);
    // Tìm ví theo ID và thuộc về đúng User đang đăng nhập (Bảo mật IDOR)
    Optional<Wallet> findByIdAndUserIdAndIsActiveTrue(String id, String userId);
    // Kiểm tra tên ví đã tồn tại chưa để tránh user tạo trùng tên
    boolean existsByUserIdAndNameIgnoreCaseAndIsActiveTrue(String userId, String name);
}
