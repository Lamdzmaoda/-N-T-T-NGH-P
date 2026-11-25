package org.example.backend.service.transaction;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.dto.request.transaction.*;
import org.example.backend.dto.response.transcation.TransactionResponse;
import org.example.backend.entity.Category;
import org.example.backend.entity.Transaction;
import org.example.backend.entity.User.User;
import org.example.backend.entity.Wallet;
import org.example.backend.enums.TransactionType;
import org.example.backend.event.createEvent.TransactionCreatedEvent;
import org.example.backend.exception.AppException;
import org.example.backend.exception.ErrorCode;
import org.example.backend.mapper.transaction.TransactionMapper;
import org.example.backend.repository.categories.CategoryRepository;
import org.example.backend.repository.transaction.TransactionRepository;
import org.example.backend.repository.wallet.WalletRepository;
import org.example.backend.service.auth.AuthenticationService;
import org.example.backend.service.report.ExcelExportService;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service // Đánh dấu là tầng Service, nơi xử lý logic nghiệp vụ
@RequiredArgsConstructor // Tự động Inject các Repository, Mapper, Encoder qua Constructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class TransactionService {
    TransactionRepository transactionRepository;
    WalletRepository walletRepository;
    CategoryRepository categoryRepository;
    AuthenticationService authenticationService;
    TransactionMapper transactionMapper;
    ApplicationEventPublisher eventPublisher;
    ExcelExportService excelExportService;

    @Transactional
    public TransactionResponse createTransaction(TransactionRequest request) {
        var user = authenticationService.getUserByContext();

        if (request.getType() == TransactionType.TRANSFER) {
            throw new AppException(ErrorCode.INVALID_TRANSACTION_TYPE);
        }
        Wallet wallet = walletRepository.findByIdAndUserIdAndIsActiveTrue(request.getWalletId(), user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.WALLET_NOT_FOUND));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        BigDecimal amount = request.getAmount();
        BigDecimal balanceAfter;

        if (request.getType() == TransactionType.EXPENSE) {
            wallet.debit(amount); // Tự kiểm tra số dư và tự trừ tiền!
        } else {
            wallet.credit(amount); // Tự cộng tiền!
        }
        walletRepository.save(wallet);
        balanceAfter = wallet.getBalance();

        Transaction transaction = transactionMapper.toTransaction(request);
        transaction.setUser(user);
        transaction.setWallet(wallet);
        transaction.setCategory(category);
        transaction.setBalanceAfter(balanceAfter);
        if (transaction.getTransactionDate() == null) {
            transaction.setTransactionDate(LocalDateTime.now());
        }
        Transaction saved = transactionRepository.save(transaction);
        if (saved.getType() == TransactionType.EXPENSE && saved.getCategory() != null) {
            eventPublisher.publishEvent(new TransactionCreatedEvent(this, saved));
        }
        return transactionMapper.toTransactionResponse(saved);
    }

    @Transactional
    public TransactionResponse transferMoney(TransferRequest request) {
        var user = authenticationService.getUserByContext();

        if (request.getSourceWalletId().equals(request.getDestinationWalletId())) {
            throw new AppException(ErrorCode.SAME_WALLET_TRANSFER);
        }
        Wallet sourceWallet = walletRepository.findByIdAndUserIdAndIsActiveTrue(request.getSourceWalletId(), user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.WALLET_NOT_FOUND));
        Wallet destWallet = walletRepository.findByIdAndUserIdAndIsActiveTrue(request.getDestinationWalletId(), user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.WALLET_NOT_FOUND));

        BigDecimal amount = request.getAmount();
        sourceWallet.debit(amount); // Ví nguồn trừ tiền
        destWallet.credit(amount);  // Ví đích nhận tiền

        walletRepository.save(sourceWallet);
        walletRepository.save(destWallet);

        Transaction transaction = Transaction.builder()
                .user(user)
                .wallet(sourceWallet)
                .destinationWallet(destWallet)
                .amount(amount)
                .type(TransactionType.TRANSFER)
                .balanceAfter(sourceWallet.getBalance())
                .transactionDate(request.getTransactionDate() != null ? request.getTransactionDate() : LocalDateTime.now())
                .note(request.getNote())
                .build();

        Transaction saved = transactionRepository.save(transaction);
        if (saved.getType() == TransactionType.EXPENSE && saved.getCategory() != null) {
            eventPublisher.publishEvent(new TransactionCreatedEvent(this, saved));
        }
        return transactionMapper.toTransactionResponse(saved);
    }

    @Transactional
    public void deleteTransaction(String id) {
        User user = authenticationService.getUserByContext();
        Transaction transaction = transactionRepository.findByIdAndUserIdAndIsDeletedFalse(id, user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.TRANSACTION_NOT_FOUND));

        Wallet wallet = transaction.getWallet();
        BigDecimal amount = transaction.getAmount();

        if (transaction.getType() == TransactionType.EXPENSE) {
            wallet.credit(amount); // Hoàn lại tiền chi
        } else if (transaction.getType() == TransactionType.INCOME) {
            wallet.debit(amount);  // Thu hồi tiền thu
        } else if (transaction.getType() == TransactionType.TRANSFER) {
            wallet.credit(amount); // Hoàn lại ví nguồn
            Wallet destWallet = transaction.getDestinationWallet();
            if (destWallet != null) {
                destWallet.debit(amount); // Thu hồi từ ví đích
                walletRepository.save(destWallet);
            }
        }
        walletRepository.save(wallet);
        transaction.setIsDeleted(true);
        transaction.setDeletedAt(LocalDateTime.now());
        transactionRepository.save(transaction);
    }

    @Transactional
    public TransactionResponse restoreTransaction(String id) {
        User user = authenticationService.getUserByContext();
        Transaction transaction = transactionRepository.findById(id)
                .filter(t -> t.getUser().equals(user.getId()) &&
                        Boolean.TRUE.equals(t.getIsDeleted()))
                .orElseThrow(() -> new AppException(ErrorCode.TRANSACTION_NOT_FOUND));
        Wallet wallet = transaction.getWallet();
        BigDecimal amount = transaction.getAmount();

        if (transaction.getType() == TransactionType.EXPENSE) {
            wallet.debit(amount);
        } else if (transaction.getType() == TransactionType.INCOME) {
            wallet.credit(amount);
        }
        walletRepository.save(wallet);

        transaction.setIsDeleted(false);
        transaction.setIsDeleted(null);

        return transactionMapper.toTransactionResponse(transactionRepository.save(transaction));

    }

    // 3. Xóa vĩnh viễn khỏi Database
    @Transactional
    public void permanentDeleteTransaction(String id) {
        User user = authenticationService.getUserByContext();
        Transaction transaction = transactionRepository.findById(id)
                .filter(t -> t.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new AppException(ErrorCode.TRANSACTION_NOT_FOUND));
        transactionRepository.delete(transaction);
    }

    // 4. Lấy danh sách giao dịch trong thùng rác
    public List<TransactionResponse> getTrashTransactions() {
        User user = authenticationService.getUserByContext();
        return transactionRepository.findByUserIdAndIsDeletedTrueOrderByDeletedAtDesc(user.getId())
                .stream().map(transactionMapper::toTransactionResponse).toList();
    }

    @Transactional
    public TransactionResponse updateTransaction(String id, TransactionUpdateRequest request) {
        User user = authenticationService.getUserByContext();
        Transaction transaction = transactionRepository.findByIdAndUserIdAndIsDeletedFalse(id, user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.TRANSACTION_NOT_FOUND));

        if (transaction.getType() == TransactionType.TRANSFER) {
            throw new AppException(ErrorCode.SAME_WALLET_TRANSFER);
        }
        Wallet oldWallet = transaction.getWallet();
        BigDecimal oldAmount = transaction.getAmount();
        TransactionType type = transaction.getType();
        if (type == TransactionType.EXPENSE) {
            oldWallet.setBalance(oldWallet.getBalance().add(oldAmount)); // Trả lại tiền chi
        } else {
            oldWallet.setBalance(oldWallet.getBalance().subtract(oldAmount)); // Thu hồi tiền thu
        }

        BigDecimal newAmount = request.getAmount() != null ? request.getAmount() : oldAmount;

        Wallet newWallet = oldWallet;

        if (request.getWalletId() != null && !request.getWalletId().equals(oldWallet.getId())) {
            newWallet = walletRepository.findByIdAndUserIdAndIsActiveTrue(request.getWalletId(), user.getId())
                    .orElseThrow(() -> new AppException(ErrorCode.WALLET_NOT_FOUND));
        }
        if (type == TransactionType.EXPENSE) {
            if (newWallet.getBalance().compareTo(newAmount) < 0) {
                throw new AppException(ErrorCode.INSUFFICIENT_BALANCE);
            }
            newWallet.setBalance(newWallet.getBalance().subtract(newAmount));
        } else if (type == TransactionType.INCOME) {
            newWallet.setBalance(newWallet.getBalance().add(newAmount));

        }
        if (request.getCategoryId() != null) {
            Category newCategory = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
            transaction.setCategory(newCategory);
        }
        walletRepository.save(newWallet);
        if (!oldWallet.getId().equals(newWallet.getId())) {
            walletRepository.save(oldWallet);
        }

        transaction.setWallet(newWallet);
        transaction.setAmount(newAmount);
        transaction.setBalanceAfter(newWallet.getBalance());

        if (request.getTransactionDate() != null) {
            transaction.setTransactionDate(request.getTransactionDate());
        }
        if (request.getNote() != null) {
            transaction.setNote(request.getNote());
        }
        if (request.getImageUrl() != null) {
            transaction.setImageUrl(request.getImageUrl());
        }
        Transaction updatedTransaction = transactionRepository.save(transaction);
        log.info("User {} updated transaction {}", user.getUsername(), updatedTransaction.getId());
        return transactionMapper.toTransactionResponse(updatedTransaction);
    }

    @Transactional
    public TransactionResponse updateTransfer(String id, TransferUpdateRequest request) {
        User user = authenticationService.getUserByContext();

        Transaction transaction = transactionRepository.findByIdAndUserIdAndIsDeletedFalse(id, user.getId()).orElseThrow(() -> new AppException(ErrorCode.TRANSACTION_NOT_FOUND));

        if (transaction.getType() != TransactionType.TRANSFER) {
            throw new AppException(ErrorCode.INVALID_TRANSACTION_TYPE);
        }
        Wallet oldSourceWallet = transaction.getWallet();
        Wallet oldDestWallet = transaction.getDestinationWallet();
        BigDecimal oldAmount = transaction.getAmount();

        oldSourceWallet.setBalance(oldSourceWallet.getBalance().add(oldAmount));
        if (oldDestWallet != null) {
            oldDestWallet.setBalance(oldDestWallet.getBalance().subtract(oldAmount));
        }

        BigDecimal newAmount = request.getAmount() != null ? request.getAmount() : oldAmount;

        Wallet newSourceWallet = oldSourceWallet;

        if (request.getSourceWalletId() != null && (oldDestWallet == null || !request.getDestinationWalletId().equals(oldDestWallet.getId()))) {
            newSourceWallet = walletRepository.findByIdAndUserIdAndIsActiveTrue(request.getSourceWalletId(), user.getId())
                    .orElseThrow(() -> new AppException(ErrorCode.WALLET_NOT_FOUND));
        }
        Wallet newDestWallet = oldDestWallet;
        if (request.getDestinationWalletId() != null && !request.getSourceWalletId().equals(oldSourceWallet.getId())) {
            newDestWallet = walletRepository.findByIdAndUserIdAndIsActiveTrue(request.getDestinationWalletId(), user.getId())
                    .orElseThrow(() -> new AppException(ErrorCode.WALLET_NOT_FOUND));
        }
        if (newSourceWallet.getId().equals(newDestWallet.getId())) {
            throw new AppException(ErrorCode.SAME_WALLET_TRANSFER);
        }

        newSourceWallet.debit(newAmount); // Trừ tiền ví nguồn mới (tự kiểm tra đủ tiền)
        newDestWallet.credit(newAmount);  // Cộng tiền ví đích mới

        walletRepository.save(newSourceWallet);
        walletRepository.save(newDestWallet);

        if (!oldSourceWallet.getId().equals(newSourceWallet.getId()) && !oldSourceWallet.getId().equals(newDestWallet.getId())) {
            walletRepository.save(oldSourceWallet);
        }
        if (oldDestWallet != null && !oldDestWallet.getId().equals(newSourceWallet.getId()) && !oldDestWallet.getId().equals(newDestWallet.getId())) {
            walletRepository.save(oldDestWallet);
        }
        // 4. Cập nhật transaction
        transaction.setWallet(newSourceWallet);
        transaction.setDestinationWallet(newDestWallet);
        transaction.setAmount(newAmount);
        transaction.setBalanceAfter(newSourceWallet.getBalance());
        if (request.getTransactionDate() != null) {
            transaction.setTransactionDate(request.getTransactionDate());
        }
        if (request.getNote() != null) {
            transaction.setNote(request.getNote());
        }
        Transaction updated = transactionRepository.save(transaction);
        log.info("User {} updated transfer transaction {}", user.getUsername(), updated.getId());
        return transactionMapper.toTransactionResponse(updated);

    }

    public List<TransactionResponse> getRecentTransaction() {
        User user = authenticationService.getUserByContext();
        return transactionRepository.findTop5ByUserIdAndIsDeletedIsFalseOrderByTransactionDateDesc(user.getId())
                .stream()
                .map(transactionMapper::toTransactionResponse)
                .toList();
    }

    public Page<TransactionResponse> getTransaction(Pageable page) {
        User user = authenticationService.getUserByContext();
        return transactionRepository.findByUserIdAndIsDeletedFalseOrderByTransactionDateDesc(user.getId(), page)
                .map(transactionMapper::toTransactionResponse);
    }

    public Page<TransactionResponse> getTransactionsWithFilter(TransactionFilterRequest filter, Pageable pageable) {
        User user = authenticationService.getUserByContext();

        LocalDateTime startDateTime = filter.getStartDate() != null ? filter.getStartDate().atStartOfDay() : null;
        LocalDateTime endDateTime = filter.getEndDate() != null ? filter.getEndDate().atTime(23, 59, 59, 999999999) : null;
        String keyword = filter.getKeyword() != null && !filter.getKeyword().isBlank() ? filter.getKeyword().trim() : null;
        String walletId = filter.getWalletId() != null && !filter.getWalletId().isBlank() ? filter.getWalletId().trim() : null;
        String categoryId = filter.getCategoryId() != null && !filter.getCategoryId().isBlank() ? filter.getCategoryId().trim() : null;

        return transactionRepository.findTransactionsWithFilters(
                user.getId(),
                walletId,
                categoryId,
                filter.getType(),
                startDateTime,
                endDateTime,
                filter.getMinAmount(),
                filter.getMaxAmount(),
                keyword,
                pageable
        ).map(transactionMapper::toTransactionResponse);
    }

    public byte[] exportTransactionsToExcel(TransactionFilterRequest filter) throws IOException {
        User user = authenticationService.getUserByContext();
        LocalDateTime startDateTime = filter.getStartDate() != null ? filter.getStartDate().atStartOfDay() : null;
        LocalDateTime endDateTime = filter.getEndDate() != null ? filter.getEndDate().atTime(23, 59, 59, 999999999) : null;
        String keyword = filter.getKeyword() != null && !filter.getKeyword().isBlank() ? filter.getKeyword().trim() : null;
        String walletId = filter.getWalletId() != null && !filter.getWalletId().isBlank() ? filter.getWalletId().trim() : null;
        String categoryId = filter.getCategoryId() != null && !filter.getCategoryId().isBlank() ? filter.getCategoryId().trim() : null;
        // Lấy toàn bộ giao dịch thỏa mãn bộ lọc (tối đa 10,000 dòng để xuất báo cáo)
        Pageable unpaged = org.springframework.data.domain.PageRequest.of(0, 10000, org.springframework.data.domain.Sort.by("transactionDate").descending());
        List<Transaction> transactions = transactionRepository.findTransactionsWithFilters(
                user.getId(), walletId, categoryId, filter.getType(),
                startDateTime, endDateTime, filter.getMinAmount(), filter.getMaxAmount(), keyword, unpaged
        ).getContent();
        return excelExportService.exportTransactions(transactions, user.getUsername());
    }


}
