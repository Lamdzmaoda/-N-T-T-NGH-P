package org.example.backend.repository.debt;

import org.example.backend.entity.debt.DebtLoan;
import org.example.backend.enums.DebtLoanStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DebtLoanRepository extends JpaRepository<DebtLoan, String> {
    List<DebtLoan> findByUserIdAndIsActiveTrueOrderByCreatedAtDesc(String userId);
    List<DebtLoan> findByUserIdAndStatus(String userId, DebtLoanStatus status);
    Optional<DebtLoan> findByIdAndUserIdAndIsActiveTrue(String id, String userId);
    List<DebtLoan> findByPartnerUserIdAndStatusAndIsActiveTrueOrderByCreatedAtDesc(String partnerUserId, DebtLoanStatus status);
    // Kiểm tra xem user A có khoản nợ nào gán cho partner B đang PENDING_CONFIRMATION không
    boolean existsByUserIdAndPartnerUserIdAndStatusAndIsActiveTrue(String userId, String partnerUserId, DebtLoanStatus status);
}
