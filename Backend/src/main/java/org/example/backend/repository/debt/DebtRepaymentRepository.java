package org.example.backend.repository.debt;

import org.example.backend.entity.debt.DebtRepayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DebtRepaymentRepository extends JpaRepository<DebtRepayment, String> {
    List<DebtRepayment> findByDebtLoanIdOrderByRepaymentDateDesc(String debtLoanId);
}