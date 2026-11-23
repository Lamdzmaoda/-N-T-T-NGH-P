package org.example.backend.repository.transaction;

import org.example.backend.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, String> {

    Optional<Transaction> findByIdAndUserIdAndIsDeletedFalse(String id, String userId);
    // Phân trang danh sách giao dịch của user
    Page<Transaction>  findByUserIdAndIsDeletedFalseOrderByTransactionDateDesc(String userId, Pageable pageable);
    // Lấy top 5 giao dịch mới nhất (phục vụ RecentTransactions trên Dashboard)
    List<Transaction> findTop5ByUserIdAndIsDeletedIsFalseOrderByTransactionDateDesc(String userId);
    // Lấy giao dịch theo khoảng ngày (phục vụ biểu đồ CashFlow, ExpenseStructure và thống kê tháng)
    List<Transaction> findByUserIdAndIsDeletedIsFalseAndTransactionDateBetweenOrderByTransactionDateDesc(
            String userId, LocalDateTime startDate, LocalDateTime endDate
    );
    // Lấy lịch sử giao dịch của 1 ví cụ thể
    Page<Transaction> findByUserIdAndIsDeletedIsFalseAndWalletIdOrderByTransactionDateDesc(
            String userId, String walletId, Pageable pageable
    );
    List<Transaction> findByUserIdAndIsDeletedTrueOrderByDeletedAtDesc(String  userId);

    // Truy vấn lọc giao dịch đa tiêu chí tuân thủ Rule 3 (isDeleted = false, ngoặc đơn bao bọc)
    @Query("""
        SELECT t FROM Transaction t
        WHERE t.user.id = :userId
          AND (t.isDeleted IS NULL OR t.isDeleted = false)
          AND (:walletId IS NULL OR :walletId = '' OR t.wallet.id = :walletId OR t.destinationWallet.id = :walletId)
          AND (:categoryId IS NULL OR :categoryId = '' OR t.category.id = :categoryId)
          AND (:type IS NULL OR t.type = :type)
          AND (:startDate IS NULL OR t.transactionDate >= :startDate)
          AND (:endDate IS NULL OR t.transactionDate <= :endDate)
          AND (:minAmount IS NULL OR t.amount >= :minAmount)
          AND (:maxAmount IS NULL OR t.amount <= :maxAmount)
          AND (:keyword IS NULL OR :keyword = '' OR LOWER(t.note) LIKE LOWER(CONCAT('%', :keyword, '%')))
        ORDER BY t.transactionDate DESC
    """)
    Page<Transaction> findTransactionsWithFilters(
            @Param("userId") String userId,
            @Param("walletId") String walletId,
            @Param("categoryId") String categoryId,
            @Param("type") org.example.backend.enums.TransactionType type,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("minAmount") java.math.BigDecimal minAmount,
            @Param("maxAmount") java.math.BigDecimal maxAmount,
            @Param("keyword") String keyword,
            Pageable pageable
    );
}