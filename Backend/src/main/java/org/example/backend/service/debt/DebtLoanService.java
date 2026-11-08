package org.example.backend.service.debt;


import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.dto.request.debt.DebtLoanRequest;
import org.example.backend.dto.request.debt.DebtLoanUpdateRequest;
import org.example.backend.dto.request.debt.DebtRepaymentRequest;
import org.example.backend.dto.response.debt.DebtLoanDetailResponse;
import org.example.backend.dto.response.debt.DebtLoanResponse;
import org.example.backend.dto.response.debt.DebtLoanSummaryResponse;
import org.example.backend.dto.response.debt.DebtRepaymentResponse;
import org.example.backend.entity.User.User;
import org.example.backend.entity.debt.DebtLoan;
import org.example.backend.entity.debt.DebtRepayment;
import org.example.backend.enums.DebtLoanStatus;
import org.example.backend.enums.DebtLoanType;
import org.example.backend.event.createEvent.DebtLoanEvent;
import org.example.backend.exception.AppException;
import org.example.backend.exception.ErrorCode;
import org.example.backend.mapper.debt.DebtLoanMapper;
import org.example.backend.repository.auth.UserRepository;
import org.example.backend.repository.debt.DebtLoanRepository;
import org.example.backend.repository.debt.DebtRepaymentRepository;
import org.example.backend.service.auth.AuthenticationService;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DebtLoanService {

    DebtLoanRepository debtLoanRepository;
    UserRepository userRepository;
    AuthenticationService authenticationService;
    DebtRepaymentRepository debtRepaymentRepository;
    DebtLoanMapper debtLoanMapper;
    ApplicationEventPublisher eventPublisher;

    @Transactional
    public DebtLoanResponse createDebtLoan(DebtLoanRequest request) {
        User currentUser = authenticationService.getUserByContext();

        // CHỐT CHẶN 1: Nếu gán cho đối tác có app, kiểm tra xem có khoản nợ nào đang chờ duyệt không
        if (request.getPartnerUserId() != null) {
            boolean hasPending = debtLoanRepository.existsByUserIdAndPartnerUserIdAndStatusAndIsActiveTrue(
                    currentUser.getId(), request.getPartnerUserId(), DebtLoanStatus.PENDING_CONFIRMATION
            );
            if (hasPending) {
                throw new AppException(ErrorCode.PENDING_DEBT_EXISTS);
            }
        }
        List<DebtLoan> recentDebts = debtLoanRepository.findByUserIdAndIsActiveTrueOrderByCreatedAtDesc(currentUser.getId());
        if (!recentDebts.isEmpty()) {
            LocalDateTime lastCreatedAt = recentDebts.getFirst().getCreatedAt();
            if (lastCreatedAt != null && lastCreatedAt.plusSeconds(5).isAfter(LocalDateTime.now())) {
                throw new AppException(ErrorCode.CREATION_TOO_FREQUENT);
            }
        }
        User partnerUser = null;
        if (request.getPartnerUserId() != null && !request.getPartnerUserId().equals(currentUser.getId())) {
            partnerUser = userRepository.findById(request.getPartnerUserId()).orElseThrow(() -> new AppException(ErrorCode.USER_EXISTED));
        }

        DebtLoan debtLoan = debtLoanMapper.toDebtLoan(request);
        debtLoan.setUser(currentUser);
        debtLoan.setPartnerUser(partnerUser);
        debtLoan.setRemainingAmount(request.getAmount()); // Khởi tạo số tiền nợ còn lại = nợ gốc
        debtLoan.setStatus(DebtLoanStatus.ACTIVE);       // Trạng thái ban đầu luôn là ACTIVE

        if (partnerUser == null) {
            debtLoan.setStatus(DebtLoanStatus.ACTIVE);
        } else {
            debtLoan.setStatus(DebtLoanStatus.PENDING_CONFIRMATION);
        }

        DebtLoan saveDebt = debtLoanRepository.save(debtLoan);

        if (partnerUser != null) {
            eventPublisher.publishEvent(new DebtLoanEvent(saveDebt, currentUser, DebtLoanEvent.DebtLoanAction.REQUEST_CONFIRMATION));
        }
        return debtLoanMapper.toDebtLoanResponse(debtLoan);
    }

    @Transactional
    public DebtLoanResponse confirmDebtLoan(String id){
        ConfirmationContext result = confirm(id);
        DebtLoan originalDebt = result.originalDebt();
        User currentUser = result.currentUser();

        originalDebt.setStatus(DebtLoanStatus.ACTIVE);

        User creator = originalDebt.getUser();
        String  creatorName = (creator.getFull_name() != null && !creator.getFull_name().isBlank())
                ? creator.getFull_name() : creator.getUsername();

        DebtLoanType mirrorType = (originalDebt.getType() == DebtLoanType.LOAN)
                ? DebtLoanType.DEBT
                : DebtLoanType.LOAN;

        DebtLoan mirrorDebt = DebtLoan.builder()
                .user(currentUser)
                .personName(creatorName)
                .phone(creator.getPhone())
                .partnerUser(creator)
                .amount(originalDebt.getAmount())
                .remainingAmount(originalDebt.getRemainingAmount())
                .type(mirrorType)
                .status(DebtLoanStatus.ACTIVE)
                .dueDate(originalDebt.getDueDate())
                .note(originalDebt.getNote())
                .linkedDebtLoanId(originalDebt.getId())
                .isActive(true)
                .build();

        DebtLoan savedMirror = debtLoanRepository.save(mirrorDebt);

        originalDebt.setLinkedDebtLoanId(savedMirror.getId());
        debtLoanRepository.save(originalDebt);

        eventPublisher.publishEvent(new DebtLoanEvent(originalDebt, currentUser, DebtLoanEvent.DebtLoanAction.CONFIRMED));
        return debtLoanMapper.toDebtLoanResponse(savedMirror);
    }
    @Transactional
    public void rejectDebtLoan(String id){
        ConfirmationContext result = confirm(id);
        DebtLoan originalDebt = result.originalDebt();
        User currentUser = result.currentUser();

        originalDebt.setStatus(DebtLoanStatus.REJECTED);
        debtLoanRepository.save(originalDebt);
        eventPublisher.publishEvent(new DebtLoanEvent(originalDebt, currentUser, DebtLoanEvent.DebtLoanAction.REJECTED));

    }
    public List<DebtLoanResponse> getPendingRequests() {
        User currentUser = authenticationService.getUserByContext();
        return debtLoanRepository.findByPartnerUserIdAndStatusAndIsActiveTrueOrderByCreatedAtDesc(
                        currentUser.getId(), DebtLoanStatus.PENDING_CONFIRMATION)
                .stream()
                .map(debtLoanMapper::toDebtLoanResponse)
                .toList();
    }
    @Transactional
    public DebtRepaymentResponse recordRepayment(String debtLoanId, DebtRepaymentRequest request) {
        User currentUser = authenticationService.getUserByContext();

        DebtLoan debtLoan = debtLoanRepository.findByIdAndUserIdAndIsActiveTrue(debtLoanId, currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.DEBT_LOAN_NOT_FOUND));

        if (debtLoan.getStatus() == DebtLoanStatus.PAID) {
            throw new AppException(ErrorCode.DEBT_LOAN_ALREADY_PAID);
        }
        BigDecimal payAmount = request.getAmount();

        if (payAmount.compareTo(debtLoan.getRemainingAmount()) > 0) {
            throw new AppException(ErrorCode.INVALID_REPAYMENT_AMOUNT);
        }

        BigDecimal newRemaining = debtLoan.getRemainingAmount().subtract(payAmount);
        debtLoan.setRemainingAmount(newRemaining);

        if (newRemaining.compareTo(BigDecimal.ZERO) == 0) {
            debtLoan.setStatus(DebtLoanStatus.PAID);
        }

        String method = (request.getPaymentMethod() != null && !request.getPaymentMethod().isBlank())
                ? request.getPaymentMethod()
                : "CASH";
        LocalDateTime repDate = request.getRepaymentDate() != null ? request.getRepaymentDate() : LocalDateTime.now();

        DebtRepayment repayment = DebtRepayment.builder()
                .debtLoan(debtLoan)
                .amount(payAmount)
                .repaymentDate(repDate)
                .paymentMethod(method)
                .note(request.getNote())
                .build();

        DebtRepayment savedRepayment = debtRepaymentRepository.save(repayment);
        debtLoanRepository.save(debtLoan);
        if(debtLoan.getLinkedDebtLoanId() != null) {
            debtLoanRepository.findById(debtLoan.getLinkedDebtLoanId()).ifPresent(linkedDebt -> {
                BigDecimal linkedNewRemaining = linkedDebt.getRemainingAmount().subtract(payAmount);
                if(linkedNewRemaining.compareTo(BigDecimal.ZERO) < 0){
                    linkedNewRemaining = BigDecimal.ZERO;
                }
                linkedDebt.setRemainingAmount(linkedNewRemaining);
                if(linkedNewRemaining.compareTo(BigDecimal.ZERO) == 0){
                    linkedDebt.setStatus(DebtLoanStatus.PAID);
                }
                debtLoanRepository.save(linkedDebt);
                DebtRepayment linkedRepayment = DebtRepayment.builder()
                        .debtLoan(linkedDebt)
                        .amount(payAmount)
                        .repaymentDate(repDate)
                        .paymentMethod(method)
                        .note("[Đồng bộ] " + (request.getNote() != null ? request.getNote() : ""))
                        .build();
                debtRepaymentRepository.save(linkedRepayment);
            });
        }

        return DebtRepaymentResponse.builder()
                .id(savedRepayment.getId())
                .debtLoanId(debtLoan.getId())
                .amount(savedRepayment.getAmount())
                .remainingAmountAfter(newRemaining)
                .paymentMethod(savedRepayment.getPaymentMethod())
                .repaymentDate(savedRepayment.getRepaymentDate())
                .note(savedRepayment.getNote())
                .createdAt(savedRepayment.getCreatedAt())
                .build();

    }

    public DebtLoanSummaryResponse getDebtLoanSummary() {
        User currentUser = authenticationService.getUserByContext();

        List<DebtLoan> debtLoanList = debtLoanRepository.findByUserIdAndIsActiveTrueOrderByCreatedAtDesc(currentUser.getId());

        BigDecimal totalLent = BigDecimal.ZERO;
        BigDecimal remainingLent = BigDecimal.ZERO;
        BigDecimal totalBorrowed = BigDecimal.ZERO;
        BigDecimal remainingBorrowed = BigDecimal.ZERO;

        long overdueCount = 0;
        LocalDate today = LocalDate.now();

        for (DebtLoan d : debtLoanList) {
            if(d.getStatus() == DebtLoanStatus.REJECTED || d.getStatus() == DebtLoanStatus.PENDING_CONFIRMATION){
                continue;
            }
            boolean isOverdue = d.getDueDate() != null && today.isAfter(d.getDueDate()) && d.getStatus() != DebtLoanStatus.PAID;
            if (isOverdue) {
                overdueCount++;
            }
            if (d.getType() == DebtLoanType.LOAN) {
                totalLent = totalLent.add(d.getAmount());
                remainingLent = remainingLent.add(d.getRemainingAmount());
            } else if (d.getType() == DebtLoanType.DEBT) {
                totalBorrowed = totalBorrowed.add(d.getAmount());
                remainingBorrowed = remainingBorrowed.add(d.getRemainingAmount());
            }
        }

        BigDecimal netBalance = remainingLent.subtract(remainingBorrowed);

        return DebtLoanSummaryResponse.builder()
                .totalLent(totalLent)
                .remainingLent(remainingLent)
                .totalBorrowed(totalBorrowed)
                .remainingBorrowed(remainingBorrowed)
                .netBalance(netBalance)
                .overdueCount(overdueCount)
                .build();

    }

    public List<DebtLoanResponse> getMyDebtLoans(DebtLoanType type, DebtLoanStatus status, String search) {
        User currentUser = authenticationService.getUserByContext();
        List<DebtLoan> debtLoanList = debtLoanRepository.findByUserIdAndIsActiveTrueOrderByCreatedAtDesc(currentUser.getId());

        LocalDate today = LocalDate.now();

        return debtLoanList.stream()
                .filter(d -> type == null || d.getType() == type)
                .filter(d -> {
                    if (status == null) return true;
                    boolean isOverdue = d.getDueDate() != null && today.isAfter(d.getDueDate())
                            && d.getStatus() != DebtLoanStatus.PAID;
                    DebtLoanStatus actualStatus = isOverdue ? DebtLoanStatus.OVERDUE : d.getStatus();
                    return actualStatus == status;
                })
                .filter(d -> {
                    if (search == null || search.isBlank()) return true;
                    return d.getPersonName().toLowerCase().contains(search.toLowerCase());
                })
                .map(debtLoanMapper::toDebtLoanResponse)
                .toList();
    }

    public DebtLoanDetailResponse getDebtLoanDetail(String id) {
        User currentUser = authenticationService.getUserByContext();
        DebtLoan debt = debtLoanRepository.findByIdAndUserIdAndIsActiveTrue(id, currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.DEBT_LOAN_NOT_FOUND));

        List<DebtRepaymentResponse> repayments = debtRepaymentRepository.findByDebtLoanIdOrderByRepaymentDateDesc(id)
                .stream()
                .map(r -> DebtRepaymentResponse.builder()
                        .id(r.getId())
                        .debtLoanId(debt.getId())
                        .amount(r.getAmount())
                        .paymentMethod(r.getPaymentMethod())
                        .repaymentDate(r.getRepaymentDate())
                        .note(r.getNote())
                        .createdAt(r.getCreatedAt())
                        .build())
                .toList();
        String vietQrUrl = null;
        if (debt.getBankName() != null && !debt.getBankName().isBlank() &&
                debt.getBankAccount() != null && !debt.getBankAccount().isBlank()
                && debt.getRemainingAmount().compareTo(BigDecimal.ZERO) > 0) {

            String noteText;
            if (debt.getType() == DebtLoanType.LOAN) {
                // Người khác trả cho mình: "Nam tra no [Tên mình]"
                noteText = debt.getPersonName() + " tra no " + currentUser.getFull_name();
            } else {
                // Mình trả cho chủ nợ: "[Tên mình] tra no Bác Ba"
                noteText = currentUser.getFull_name() + " tra no " + debt.getPersonName();
            }
            String encodedNote = URLEncoder.encode(noteText, StandardCharsets.UTF_8);
            String encodedName = debt.getBankAccountName() != null ? URLEncoder.encode(debt.getBankAccountName(), StandardCharsets.UTF_8) : "";

            vietQrUrl = String.format("https://img.vietqr.io/image/%s-%s-compact2.png?amount=%s&addInfo=%s&accountName=%s",
                    debt.getBankName().trim(),
                    debt.getBankAccount().trim(),
                    debt.getRemainingAmount().toBigInteger().toString(),
                    encodedNote,
                    encodedName);


        }
        return DebtLoanDetailResponse.builder()
                .debtLoanResponse(debtLoanMapper.toDebtLoanResponse(debt))
                .repayments(repayments)
                .vietQrUrl(vietQrUrl)
                .build();
    }

    @Transactional
    public DebtLoanResponse updateDebtLoan(String id, DebtLoanUpdateRequest request) {
        User currentUser = authenticationService.getUserByContext();
        DebtLoan debtLoan = debtLoanRepository.findByIdAndUserIdAndIsActiveTrue(id, currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.DEBT_LOAN_NOT_FOUND));

        if (request.getPersonName() != null && !request.getPersonName().isBlank()) {
            debtLoan.setPersonName(request.getPersonName());
        }
        if (request.getPhone() != null) {
            debtLoan.setPhone(request.getPhone());
        }
        if (request.getDueDate() != null) {
            debtLoan.setDueDate(request.getDueDate());
        }
        if (request.getNote() != null) {
            debtLoan.setNote(request.getNote());
        }
        // Cho phép bổ sung/sửa đổi thông tin ngân hàng bất cứ lúc nào
        if (request.getBankName() != null) {
            debtLoan.setBankName(request.getBankName());
        }
        if (request.getBankAccount() != null) {
            debtLoan.setBankAccount(request.getBankAccount());
        }
        if (request.getBankAccountName() != null) {
            debtLoan.setBankAccountName(request.getBankAccountName());
        }
        DebtLoan saved = debtLoanRepository.save(debtLoan);
        return debtLoanMapper.toDebtLoanResponse(saved);
    }

    @Transactional
    public void deleteDebtLoan(String id) {
        User currentUser = authenticationService.getUserByContext();
        DebtLoan debt = debtLoanRepository.findByIdAndUserIdAndIsActiveTrue(id, currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.DEBT_LOAN_NOT_FOUND));

        debt.setIsActive(false);
        debtLoanRepository.save(debt);
    }

    @Transactional
    public void remindDebt(String id) {
        User currentUser = authenticationService.getUserByContext();

        DebtLoan debt = debtLoanRepository.findByIdAndUserIdAndIsActiveTrue(id, currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.DEBT_LOAN_NOT_FOUND));
        if (debt.getLastRemindedAt() != null && debt.getLastRemindedAt().plusHours(24).isAfter(LocalDateTime.now())) {
            throw new AppException(ErrorCode.DEBT_REMINDER_COOLDOWN);
        }
        if (debt.getPartnerUser() == null) {
            throw new AppException(ErrorCode.PARTNER_NOT_REGISTERED);
        }
        if (debt.getType() != DebtLoanType.LOAN) {
            throw new AppException(ErrorCode.INVALID_TRANSACTION_TYPE);
        }
        if (debt.getStatus() != DebtLoanStatus.ACTIVE) {
            throw new AppException(ErrorCode.CANNOT_REMIND_UNCONFIRMED_DEBT);
        }
        User debtor = debt.getPartnerUser();
        eventPublisher.publishEvent(new DebtLoanEvent(debt, currentUser, DebtLoanEvent.DebtLoanAction.REMINDED));
        debt.setLastRemindedAt(LocalDateTime.now());
        debtLoanRepository.save(debt);
        log.info("Đã gửi thông báo nhắc nợ tới User: {}", debtor.getUsername());

    }
    private ConfirmationContext confirm(String id){
        User currentUser = authenticationService.getUserByContext();
        DebtLoan originalDebt = debtLoanRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.DEBT_LOAN_NOT_FOUND));

        if(!originalDebt.getIsActive()){
            throw new AppException(ErrorCode.DEBT_LOAN_NOT_FOUND);
        }
        if(originalDebt.getPartnerUser() == null || !originalDebt.getPartnerUser().getId().equals(currentUser.getId())){
            throw new AppException(ErrorCode.UNAUTHORIZED_DEBT_ACTION);
        }
        if(originalDebt.getStatus() != DebtLoanStatus.PENDING_CONFIRMATION){
            throw new AppException(ErrorCode.DEBT_NOT_PENDING_CONFIRMATION);
        }

        return new ConfirmationContext(originalDebt, currentUser);
    }
    private record ConfirmationContext(DebtLoan originalDebt, User currentUser) {}
}