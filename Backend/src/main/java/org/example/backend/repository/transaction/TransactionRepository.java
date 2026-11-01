package org.example.backend.repository.transaction;

import org.example.backend.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, String> {

    Optional<Transaction> findByIdAndUserId(String id, String userId);
    // Phân trang danh sách giao dịch của user
    Page<Transaction> findByUserIdOrderByTransactionDateDesc(String userId, Pageable pageable);
    // Lấy top 5 giao dịch mới nhất (phục vụ RecentTransactions trên Dashboard)
    List<Transaction> findTop5ByUserIdOrderByTransactionDateDesc(String userId);
    // Lấy giao dịch theo khoảng ngày (phục vụ biểu đồ CashFlow, ExpenseStructure và thống kê tháng)
    List<Transaction> findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(
            String userId, LocalDateTime startDate, LocalDateTime endDate
    );
    // Lấy lịch sử giao dịch của 1 ví cụ thể
    Page<Transaction> findByUserIdAndWalletIdOrderByTransactionDateDesc(
            String userId, String walletId, Pageable pageable
    );
}