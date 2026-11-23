package org.example.backend.service.saving;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.dto.request.saving.*;
import org.example.backend.dto.response.saving.SavingGoalResponse;
import org.example.backend.entity.Category;
import org.example.backend.entity.SavingGoal;
import org.example.backend.entity.Transaction;
import org.example.backend.entity.User.User;
import org.example.backend.entity.Wallet;
import org.example.backend.enums.SavingGoalStatus;
import org.example.backend.enums.TransactionType;
import org.example.backend.enums.WalletType;
import org.example.backend.exception.AppException;
import org.example.backend.exception.ErrorCode;
import org.example.backend.repository.categories.CategoryRepository;
import org.example.backend.repository.saving.SavingGoalRepository;
import org.example.backend.repository.transaction.TransactionRepository;
import org.example.backend.repository.wallet.WalletRepository;
import org.example.backend.service.auth.AuthenticationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SavingGoalService {
    SavingGoalRepository savingGoalRepository;
    WalletRepository walletRepository;
    TransactionRepository transactionRepository;
    CategoryRepository categoryRepository;
    AuthenticationService authenticationService;


    @Transactional
    public SavingGoalResponse createGoal(SavingGoalRequest request){
        User user = authenticationService.getUserByContext();

        if(savingGoalRepository.existsByUserIdAndNameIgnoreCaseAndIsDeletedFalse(user.getId(), request.getName().trim()))
            throw new AppException(ErrorCode.SAVING_GOAL_NAME_EXISTED);

        Wallet savingWallet = Wallet.builder()
                .user(user)
                .name(request.getName().trim())
                .type(WalletType.SAVING)
                .balance(BigDecimal.ZERO)
                .currency("VND")
                .includeInTotal(true)
                .isActive(true)
                .build();
        savingWallet = walletRepository.save(savingWallet);

        SavingGoal goal = SavingGoal.builder()
                .user(user)
                .wallet(savingWallet)
                .name(request.getName().trim())
                .targetAmount(request.getTargetAmount())
                .targetDate(request.getTargetDate())
                .color(request.getColor() != null && !request.getColor().isBlank() ? request.getColor() : "#10B981")
                .icon(request.getIcon() != null && !request.getIcon().isBlank() ? request.getIcon() : "piggy-bank")
                .status(SavingGoalStatus.IN_PROGRESS)
                .isDeleted(false)
                .build();

        goal = savingGoalRepository.save(goal);

        if(request.getSourceWalletId() != null && request.getInitialAmount() != null && request.getInitialAmount().compareTo(BigDecimal.ZERO) > 0){
            executeTransfer(user, request.getSourceWalletId(), savingWallet, request.getInitialAmount(),"Nạp tiền khởi điểm mục tiêu: " + goal.getName());

            if(savingWallet.getBalance().compareTo(goal.getTargetAmount()) >= 0){
                goal.setStatus(SavingGoalStatus.COMPLETED);
                goal = savingGoalRepository.save(goal);
            }
        }
        log.info("User {} created saving goal {} with wallet {}", user.getUsername(), goal.getName(), savingWallet.getId());
        return toResponse(goal);
    }
    public List<SavingGoalResponse> getMyGoals(){
        User user = authenticationService.getUserByContext();
        return savingGoalRepository.findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }
    public SavingGoalResponse getGoalById(String id){
        User user = authenticationService.getUserByContext();
        SavingGoal goal = savingGoalRepository.findByIdAndUserIdAndIsDeletedFalse(id, user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.SAVING_GOAL_NOT_FOUND));

        return toResponse(goal);
    }

    @Transactional
    public SavingGoalResponse updateGoal(String id,SavingGoalUpdateRequest request){
        User user = authenticationService.getUserByContext();
        SavingGoal goal = savingGoalRepository.findByIdAndUserIdAndIsDeletedFalse(id, user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.SAVING_GOAL_NOT_FOUND));

        if(!goal.getName().equalsIgnoreCase(request.getName().trim()) && savingGoalRepository.existsByUserIdAndNameIgnoreCaseAndIsDeletedFalse(user.getId(),  request.getName().trim())){
            throw new AppException(ErrorCode.SAVING_GOAL_NAME_EXISTED);
        }

        goal.setName(request.getName().trim());
        goal.setTargetAmount(request.getTargetAmount());
        goal.setTargetAmount(request.getTargetAmount());
        if (request.getColor() != null) goal.setColor(request.getColor());
        if (request.getIcon() != null) goal.setIcon(request.getIcon());

        if(goal.getWallet() != null){
            goal.getWallet().setName(request.getName().trim());
            walletRepository.save(goal.getWallet());
        }

        BigDecimal currentBalance = goal.getWallet() != null ? goal.getWallet().getBalance() : BigDecimal.ZERO;
        if(currentBalance.compareTo(goal.getTargetAmount()) >= 0 && goal.getStatus() == SavingGoalStatus.IN_PROGRESS){
            goal.setStatus(SavingGoalStatus.COMPLETED);
        }else if(currentBalance.compareTo(goal.getTargetAmount()) < 0 && goal.getStatus() == SavingGoalStatus.COMPLETED){
            goal.setStatus(SavingGoalStatus.IN_PROGRESS);
        }
        return toResponse(savingGoalRepository.save(goal));
    }

    @Transactional
    public SavingGoalResponse depositMoney(String goalId, SavingDepositRequest request){
        User user = authenticationService.getUserByContext();

        SavingGoal goal = savingGoalRepository.findByIdAndUserIdAndIsDeletedFalse(goalId, user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.SAVING_GOAL_NOT_FOUND));

        String note = request.getNote() != null && !request.getNote().isBlank() ? request.getNote() : "Tích lũy heo đất: " + goal.getName();

        executeTransfer(user, request.getWalletId(), goal.getWallet(), request.getAmount(), note);

        if(goal.getWallet().getBalance().compareTo(goal.getTargetAmount()) >= 0){
            goal.setStatus(SavingGoalStatus.COMPLETED);
            goal = savingGoalRepository.save(goal);
        }
        log.info("User {} deposited {} into saving goal {}", user.getUsername(), request.getAmount(), goal.getName());
        return toResponse(goal);
    }
    @Transactional
    public SavingGoalResponse withdrawMoney(String goalId, SavingWithdrawRequest request){
        User user = authenticationService.getUserByContext();

        SavingGoal goal = savingGoalRepository.findByIdAndUserIdAndIsDeletedFalse(goalId, user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.SAVING_GOAL_NOT_FOUND));

        Wallet savingWallet = goal.getWallet();

        if(savingWallet.getBalance().compareTo(goal.getTargetAmount()) < 0){
            throw  new AppException(ErrorCode.SAVING_WITHDRAW_EXCEEDED);
        }
        String note = request.getNote() != null && !request.getNote().isBlank()
                ? request.getNote()
                : "Rút tiền từ heo đất: " + goal.getName();

        executeTransfer(user, savingWallet.getId(), getActiveWallet(user.getId(), request.getWalletId()), request.getAmount(), note);

        if(goal.getStatus() == SavingGoalStatus.COMPLETED && savingWallet.getBalance().compareTo(goal.getTargetAmount()) < 0){
            goal.setStatus(SavingGoalStatus.IN_PROGRESS);
            goal = savingGoalRepository.save(goal);
        }
        log.info("User {} withdrew {} from saving goal {}", user.getUsername(), request.getAmount(), goal.getName());
        return toResponse(goal);
    }
    @Transactional
    public SavingGoalResponse fulfillGoal(String goalId, SavingFulfillRequest request){
        User user = authenticationService.getUserByContext();

        SavingGoal goal = savingGoalRepository.findByIdAndUserIdAndIsDeletedFalse(goalId, user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.SAVING_GOAL_NOT_FOUND));

        if(goal.getStatus() == SavingGoalStatus.FULFILLED){
            throw new AppException(ErrorCode.SAVING_GOAL_ALREADY_FULFILLED);
        }
        Wallet savingWallet = goal.getWallet();

        BigDecimal amountToSpend = savingWallet.getBalance();

        if(amountToSpend.compareTo(BigDecimal.ZERO) <= 0){
            throw new AppException(ErrorCode.AMOUNT_MUST_BE_GREATER_THAN_ZERO);
        }
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        savingWallet.setBalance(BigDecimal.ZERO);
        walletRepository.save(savingWallet);

        String note = request.getNote() != null && !request.getNote().isBlank()
                ? request.getNote()
                : "Hiện thực hóa mục tiêu: " + goal.getName();

        Transaction transaction = Transaction.builder()
                .user(user)
                .wallet(savingWallet)
                .category(category)
                .amount(amountToSpend)
                .type(TransactionType.EXPENSE)
                .transactionDate(LocalDateTime.now())
                .note(note)
                .balanceAfter(BigDecimal.ZERO)
                .isDeleted(false)
                .build();
        transactionRepository.save(transaction);

        goal.setStatus(SavingGoalStatus.FULFILLED);
        goal = savingGoalRepository.save(goal);

        log.info("User {} fulfilled saving goal {} with expense {}", user.getUsername(), goal.getName(), amountToSpend);
        return toResponse(goal);
    }
    @Transactional
    public void deleteGoal(String id, String destinationWalletId){
        User user = authenticationService.getUserByContext();

        SavingGoal goal = savingGoalRepository.findByIdAndUserIdAndIsDeletedFalse(id, user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.SAVING_GOAL_NOT_FOUND));

        Wallet savingWallet = goal.getWallet();

        if(savingWallet.getBalance().compareTo(BigDecimal.ZERO) > 0){
            if(destinationWalletId == null || destinationWalletId.isBlank()){
                throw new AppException(ErrorCode.DESTINATION_WALLET_REQUIRED);
            }
            Wallet destWallet = getActiveWallet(user.getId(), destinationWalletId);
            executeTransfer(user, savingWallet.getId(), destWallet, savingWallet.getBalance(),
                    "Hoàn trả tiền khi đóng mục tiêu: " + goal.getName());
        }

        savingWallet.setIsActive(false);
        walletRepository.save(savingWallet);
        goal.setIsDeleted(true);
        goal.setDeletedAt(LocalDateTime.now());
        goal.setStatus(SavingGoalStatus.CANCELLED);
        savingGoalRepository.save(goal);
        log.info("User {} deleted saving goal {}", user.getUsername(), goal.getName());
    }

    private Wallet getActiveWallet(String userId, String walletId){
        return walletRepository.findByIdAndUserIdAndIsActiveTrue(walletId, userId).orElseThrow(() -> new AppException(ErrorCode.WALLET_NOT_FOUND));
    }

    private void executeTransfer(User user, String fromWalletId, Wallet toWallet, BigDecimal amount, String note){
        Wallet fromWallet = getActiveWallet(user.getId(), fromWalletId);

        if(fromWallet.getId().equals(toWallet.getId())){
            throw new AppException(ErrorCode.SAME_WALLET_TRANSFER);
        }
        if(fromWallet.getBalance().compareTo(amount) < 0){
            throw new AppException(ErrorCode.INSUFFICIENT_BALANCE);
        }
        fromWallet.setBalance(fromWallet.getBalance().subtract(amount));
        toWallet.setBalance(toWallet.getBalance().add(amount));

        walletRepository.save(fromWallet);
        walletRepository.save(toWallet);

        Transaction transaction = Transaction.builder()
                .user(user)
                .wallet(fromWallet)
                .destinationWallet(toWallet)
                .amount(amount)
                .type(TransactionType.TRANSFER)
                .transactionDate(LocalDateTime.now())
                .note(note)
                .balanceAfter(fromWallet.getBalance())
                .isDeleted(false)
                .build();
        transactionRepository.save(transaction);
    }
    private SavingGoalResponse toResponse(SavingGoal goal){
        BigDecimal target = goal.getTargetAmount() != null &&
                goal.getTargetAmount().compareTo(BigDecimal.ZERO) > 0
                ? goal.getTargetAmount()
                : BigDecimal.ONE;
        BigDecimal current = goal.getWallet() != null && goal.getWallet().getBalance() != null
                ? goal.getWallet().getBalance()
                : BigDecimal.ZERO;

        double  percentage = current.divide(target, 4, RoundingMode.HALF_UP).doubleValue() * 100.0;
        if(percentage > 100.0) percentage = 100.0;

        BigDecimal remaining = target.subtract(current);

        if(remaining.compareTo(BigDecimal.ZERO) < 0){
            remaining = BigDecimal.ZERO;
        }
        Long daysRemaining = null;
        if(goal.getTargetDate() != null){
            daysRemaining = ChronoUnit.DAYS.between(LocalDate.now(), goal.getTargetDate());
        }
        return SavingGoalResponse.builder()
                .id(goal.getId())
                .name(goal.getName())
                .walletId(goal.getWallet() != null ? goal.getWallet().getId() : null)
                .walletName(goal.getWallet() != null ? goal.getWallet().getName() : null)
                .targetAmount(goal.getTargetAmount())
                .currentAmount(current)
                .targetDate(goal.getTargetDate())
                .color(goal.getColor())
                .icon(goal.getIcon())
                .status(goal.getStatus())
                .progressPercentage(Math.round(percentage * 100.0) / 100.0)
                .remainingAmount(remaining)
                .daysRemaining(daysRemaining)
                .isCompleted(goal.getStatus() == SavingGoalStatus.COMPLETED || goal.getStatus() == SavingGoalStatus.FULFILLED)
                .createdAt(goal.getCreatedAt() != null ? goal.getCreatedAt() : LocalDateTime.now())
                .updatedAt(goal.getUpdatedAt() != null ? goal.getUpdatedAt() : LocalDateTime.now())
                .build();
    }
}
