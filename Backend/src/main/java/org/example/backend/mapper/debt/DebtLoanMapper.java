package org.example.backend.mapper.debt;

import org.example.backend.dto.request.debt.DebtLoanRequest;
import org.example.backend.dto.response.debt.DebtLoanResponse;
import org.example.backend.entity.debt.DebtLoan;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DebtLoanMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "partnerUser", ignore = true)
    @Mapping(target = "remainingAmount", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    DebtLoan toDebtLoan(DebtLoanRequest request);
    // Tự động lấy id từ object partnerUser ánh xạ vào partnerUserId trong response
    @Mapping(source = "partnerUser.id", target = "partnerUserId")
    // Tự động tính cờ isOverdue
    @Mapping(target = "isOverdue", expression = "java(debtLoan.getDueDate() != null && java.time.LocalDate.now().isAfter(debtLoan.getDueDate()) && debtLoan.getStatus() != org.example.backend.enums.DebtLoanStatus.PAID)")
    DebtLoanResponse toDebtLoanResponse(DebtLoan debtLoan);
}
