package org.example.backend.service.analytics;

import org.example.backend.dto.response.analytics.DashboardSummaryResponse;
import org.example.backend.entity.Transaction;
import org.example.backend.entity.User.User;
import org.example.backend.enums.TransactionType;
import org.example.backend.repository.transaction.TransactionRepository;
import org.example.backend.service.auth.AuthenticationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock
    TransactionRepository transactionRepository;

    @Mock
    AuthenticationService authenticationService;

    @InjectMocks
    AnalyticsService analyticsService;

    User mockUser;

    @BeforeEach
    void setUp() {
        mockUser = User.builder().id("user-1").username("testuser").build();
        when(authenticationService.getUserByContext()).thenReturn(mockUser);
    }

    @Test
    @DisplayName("Tính đúng tổng thu, chi, tiết kiệm và tỷ lệ tăng trưởng so với tháng trước")
    void getDashboardSummary_success() {
        // Given: Dữ liệu giao dịch tháng 11 (tháng hiện tại)
        Transaction currentIncome = Transaction.builder()
                .amount(new BigDecimal("30000000"))
                .type(TransactionType.INCOME)
                .transactionDate(LocalDateTime.of(2026, 11, 5, 10, 0))
                .build();

        Transaction currentExpense = Transaction.builder()
                .amount(new BigDecimal("15000000"))
                .type(TransactionType.EXPENSE)
                .transactionDate(LocalDateTime.of(2026, 11, 10, 12, 0))
                .build();

        Transaction currentTransfer = Transaction.builder()
                .amount(new BigDecimal("5000000"))
                .type(TransactionType.TRANSFER)
                .transactionDate(LocalDateTime.of(2026, 11, 15, 9, 0))
                .build();

        // Giao dịch tháng 10 (tháng trước)
        Transaction prevIncome = Transaction.builder()
                .amount(new BigDecimal("20000000"))
                .type(TransactionType.INCOME)
                .transactionDate(LocalDateTime.of(2026, 10, 5, 10, 0))
                .build();

        Transaction prevExpense = Transaction.builder()
                .amount(new BigDecimal("10000000"))
                .type(TransactionType.EXPENSE)
                .transactionDate(LocalDateTime.of(2026, 10, 10, 12, 0))
                .build();

        // Mock repository trả về danh sách giao dịch tương ứng
        when(transactionRepository.findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(
                eq("user-1"),
                eq(LocalDateTime.of(2026, 11, 1, 0, 0, 0)),
                any(LocalDateTime.class)
        )).thenReturn(List.of(currentIncome, currentExpense, currentTransfer));

        when(transactionRepository.findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(
                eq("user-1"),
                eq(LocalDateTime.of(2026, 10, 1, 0, 0, 0)),
                any(LocalDateTime.class)
        )).thenReturn(List.of(prevIncome, prevExpense));

        // When: Gọi hàm tính toán
        DashboardSummaryResponse summary = analyticsService.getDashboardSummary(11, 2026);

        // Then: Kiểm tra kết quả
        assertNotNull(summary);
        assertEquals(new BigDecimal("30000000"), summary.getTotalIncome());
        assertEquals(new BigDecimal("15000000"), summary.getTotalExpense());
        assertEquals(new BigDecimal("15000000"), summary.getTotalSavings()); // 30tr - 15tr = 15tr

        // Biến động chi: (15tr - 10tr) / 10tr = +50.0%
        assertEquals(50.0, summary.getExpenseGrowthRate());

        // Biến động thu: (30tr - 20tr) / 20tr = +50.0%
        assertEquals(50.0, summary.getIncomeGrowthRate());
    }
}