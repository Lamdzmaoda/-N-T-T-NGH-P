package org.example.backend.service.debt;

import org.example.backend.dto.request.debt.DebtLoanRequest;
import org.example.backend.dto.request.debt.DebtRepaymentRequest;
import org.example.backend.dto.response.debt.DebtLoanResponse;
import org.example.backend.dto.response.debt.DebtRepaymentResponse;
import org.example.backend.entity.debt.DebtLoan;
import org.example.backend.entity.debt.DebtRepayment;
import org.example.backend.entity.User.User;
import org.example.backend.enums.DebtLoanStatus;
import org.example.backend.enums.DebtLoanType;
import org.example.backend.repository.auth.UserRepository;
import org.example.backend.repository.debt.DebtLoanRepository;
import org.example.backend.repository.debt.DebtRepaymentRepository;
import org.example.backend.service.auth.AuthenticationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DebtLoanServiceTest {

    @Mock
    DebtLoanRepository debtLoanRepository;

    @Mock
    UserRepository userRepository;

    @Mock
    AuthenticationService authenticationService;
    @Mock
    DebtRepaymentRepository debtRepaymentRepository;

    @InjectMocks
    DebtLoanService debtLoanService;

    User mockUser;

    @BeforeEach
    void setUp() {
        mockUser = User.builder().id("user-1").username("testuser").build();
        when(authenticationService.getUserByContext()).thenReturn(mockUser);
    }

    @Test
    @DisplayName("Lát cắt 1: Tạo khoản cho vay LOAN thành công, remainingAmount phải bằng amount và status là ACTIVE")
    void createDebtLoan_success_initializesRemainingAmountAndActiveStatus() {
        // Given (Dữ liệu đầu vào)
        BigDecimal loanAmount = new BigDecimal("5000000");
        DebtLoanRequest request = DebtLoanRequest.builder()
                .personName("Bạn Nam")
                .amount(loanAmount)
                .type(DebtLoanType.LOAN)
                .dueDate(LocalDate.now().plusMonths(1))
                .note("Cho Nam mượn tiền đóng học phí")
                .bankName("MB Bank")
                .bankAccount("0987654321")
                .bankAccountName("NGUYEN VAN A")
                .build();

        // Giả lập lưu vào DB
        when(debtLoanRepository.save(any(DebtLoan.class))).thenAnswer(invocation -> {
            DebtLoan saved = invocation.getArgument(0);
            saved.setId("debt-id-123");
            return saved;
        });

        // When (Gọi hàm nghiệp vụ)
        DebtLoanResponse response = debtLoanService.createDebtLoan(request);

        // Then (Khẳng định tính đúng đắn)
        assertNotNull(response);
        assertEquals("Bạn Nam", response.getPersonName());
        assertEquals(loanAmount, response.getAmount());
        assertEquals(loanAmount, response.getRemainingAmount(), "Số tiền còn lại ban đầu phải bằng số tiền nợ gốc");
        assertEquals(DebtLoanStatus.ACTIVE, response.getStatus(), "Trạng thái ban đầu bắt buộc là ACTIVE");
        assertEquals(DebtLoanType.LOAN, response.getType());
        assertFalse(response.isOverdue());
    }
    @Test
    @DisplayName("Lát cắt 2: Trả nợ từng phần (2tr/5tr) -> remainingAmount giảm còn 3tr và status vẫn là ACTIVE")
    void recordRepayment_partialPayment_success() {
        // Given: Khoản nợ ban đầu 5.000.000 ₫
        DebtLoan debt = DebtLoan.builder()
                .id("debt-1")
                .user(mockUser)
                .personName("Bạn Nam")
                .amount(new BigDecimal("5000000"))
                .remainingAmount(new BigDecimal("5000000"))
                .status(DebtLoanStatus.ACTIVE)
                .type(DebtLoanType.LOAN)
                .build();

        when(debtLoanRepository.findByIdAndUserIdAndIsActiveTrue("debt-1", "user-1")).thenReturn(java.util.Optional.of(debt));
        when(debtRepaymentRepository.save(any(DebtRepayment.class))).thenAnswer(i -> {
            DebtRepayment r = i.getArgument(0);
            r.setId("rep-1");
            return r;
        });

        // When: Trả 2.000.000 ₫
        DebtRepaymentRequest request = DebtRepaymentRequest.builder()
                .amount(new BigDecimal("2000000"))
                .note("Trả đợt 1")
                .build();

        DebtRepaymentResponse response = debtLoanService.recordRepayment("debt-1", request);

        // Then: Số tiền còn lại phải là 3.000.000 ₫ và trạng thái vẫn là ACTIVE
        assertNotNull(response);
        assertEquals(new BigDecimal("2000000"), response.getAmount());
        assertEquals(new BigDecimal("3000000"), response.getRemainingAmountAfter());
        assertEquals(new BigDecimal("3000000"), debt.getRemainingAmount());
        assertEquals(DebtLoanStatus.ACTIVE, debt.getStatus());
    }

    @Test
    @DisplayName("Lát cắt 3: Trả nốt phần còn lại (3tr/3tr) -> remainingAmount về 0 và status tự chuyển sang PAID")
    void recordRepayment_fullPayment_autoTransitionsToPaid() {
        // Given: Khoản nợ đang còn 3.000.000 ₫
        DebtLoan debt = DebtLoan.builder()
                .id("debt-1")
                .user(mockUser)
                .personName("Bạn Nam")
                .amount(new BigDecimal("5000000"))
                .remainingAmount(new BigDecimal("3000000"))
                .status(DebtLoanStatus.ACTIVE)
                .type(DebtLoanType.LOAN)
                .build();

        when(debtLoanRepository.findByIdAndUserIdAndIsActiveTrue("debt-1", "user-1")).thenReturn(java.util.Optional.of(debt));
        when(debtRepaymentRepository.save(any(DebtRepayment.class))).thenAnswer(i -> i.getArgument(0));

        // When: Trả nốt 3.000.000 ₫
        DebtRepaymentRequest request = DebtRepaymentRequest.builder()
                .amount(new BigDecimal("3000000"))
                .note("Tất toán nốt")
                .build();

        DebtRepaymentResponse response = debtLoanService.recordRepayment("debt-1", request);

        // Then: remainingAmount về 0 và trạng thái tự động thành PAID
        assertEquals(BigDecimal.ZERO, response.getRemainingAmountAfter());
        assertEquals(BigDecimal.ZERO, debt.getRemainingAmount());
        assertEquals(DebtLoanStatus.PAID, debt.getStatus(), "Khoản nợ phải tự động chuyển thành PAID");
    }

    @Test
    @DisplayName("Lát cắt 4: Trả quá số nợ còn lại (nợ 1tr nhưng trả 1.5tr) -> Ném ngoại lệ INVALID_REPAYMENT_AMOUNT")
    void recordRepayment_exceedsRemaining_throwsException() {
        // Given: Nợ còn 1.000.000 ₫
        DebtLoan debt = DebtLoan.builder()
                .id("debt-1")
                .user(mockUser)
                .amount(new BigDecimal("5000000"))
                .remainingAmount(new BigDecimal("1000000"))
                .status(DebtLoanStatus.ACTIVE)
                .build();

        when(debtLoanRepository.findByIdAndUserIdAndIsActiveTrue("debt-1", "user-1")).thenReturn(Optional.ofNullable(debt));

        // When: Cố tình trả 1.500.000 ₫
        DebtRepaymentRequest request = DebtRepaymentRequest.builder()
                .amount(new BigDecimal("1500000"))
                .build();

        // Then: Bắt buộc ném AppException(INVALID_REPAYMENT_AMOUNT)
        org.example.backend.exception.AppException ex = assertThrows(
                org.example.backend.exception.AppException.class,
                () -> debtLoanService.recordRepayment("debt-1", request)
        );
        assertEquals(org.example.backend.exception.ErrorCode.INVALID_REPAYMENT_AMOUNT, ex.getErrorCode());
    }
    @Test
    @DisplayName("Lát cắt 5: Tính toán chính xác 4 chỉ số vàng tổng quan công nợ")
    void getDebtLoanSummary_success_calculatesCorrectGoldenMetrics() {
        // Given: Bộ dữ liệu công nợ đa dạng
        DebtLoan loan1 = DebtLoan.builder()
                .amount(new BigDecimal("5000000"))
                .remainingAmount(new BigDecimal("3000000"))
                .type(DebtLoanType.LOAN)
                .status(DebtLoanStatus.ACTIVE)
                .dueDate(LocalDate.now().plusDays(10)) // Chưa quá hạn
                .build();

        DebtLoan loan2 = DebtLoan.builder()
                .amount(new BigDecimal("2000000"))
                .remainingAmount(new BigDecimal("2000000"))
                .type(DebtLoanType.LOAN)
                .status(DebtLoanStatus.ACTIVE)
                .dueDate(LocalDate.now().minusDays(1)) // Đã quá hạn 1 ngày!
                .build();

        DebtLoan loan3 = DebtLoan.builder()
                .amount(new BigDecimal("1000000"))
                .remainingAmount(BigDecimal.ZERO)
                .type(DebtLoanType.LOAN)
                .status(DebtLoanStatus.PAID) // Đã trả xong
                .build();

        DebtLoan debt1 = DebtLoan.builder()
                .amount(new BigDecimal("4000000"))
                .remainingAmount(new BigDecimal("1000000"))
                .type(DebtLoanType.DEBT)
                .status(DebtLoanStatus.ACTIVE)
                .dueDate(LocalDate.now().plusDays(5))
                .build();

        when(debtLoanRepository.findByUserIdAndIsActiveTrueOrderByCreatedAtDesc("user-1"))
                .thenReturn(java.util.List.of(loan1, loan2, loan3, debt1));

        // When: Gọi hàm tính toán tổng quan
        org.example.backend.dto.response.debt.DebtLoanSummaryResponse summary = debtLoanService.getDebtLoanSummary();

        // Then: Kiểm tra từng chỉ số độc lập
        assertNotNull(summary);
        // 1. Tổng cho vay ban đầu: 5tr + 2tr + 1tr = 8.000.000 ₫
        assertEquals(new BigDecimal("8000000"), summary.getTotalLent());
        // 2. Người khác CÒN NỢ: 3tr + 2tr + 0tr = 5.000.000 ₫
        assertEquals(new BigDecimal("5000000"), summary.getRemainingLent());
        // 3. Tổng mình đi vay ban đầu: 4.000.000 ₫
        assertEquals(new BigDecimal("4000000"), summary.getTotalBorrowed());
        // 4. Mình CÒN NỢ người khác: 1.000.000 ₫
        assertEquals(new BigDecimal("1000000"), summary.getRemainingBorrowed());
        // 5. Công nợ ròng (5tr - 1tr): +4.000.000 ₫
        assertEquals(new BigDecimal("4000000"), summary.getNetBalance());
        // 6. Số khoản nợ quá hạn: đúng 1 khoản (loan2)
        assertEquals(1, summary.getOverdueCount());
    }
}
