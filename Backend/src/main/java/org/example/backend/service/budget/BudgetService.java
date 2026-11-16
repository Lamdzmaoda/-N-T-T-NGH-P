package org.example.backend.service.budget;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.dto.request.budget.BudgetRequest;
import org.example.backend.dto.response.budget.BudgetProgressResponse;
import org.example.backend.entity.Budget;
import org.example.backend.entity.Category;
import org.example.backend.entity.Transaction;
import org.example.backend.entity.User.User;
import org.example.backend.enums.TransactionType;
import org.example.backend.exception.AppException;
import org.example.backend.exception.ErrorCode;

import org.example.backend.repository.budget.BudgetRepository;
import org.example.backend.repository.categories.CategoryRepository;
import org.example.backend.repository.transaction.TransactionRepository;
import org.example.backend.service.auth.AuthenticationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@Service // Đánh dấu là tầng Service, nơi xử lý logic nghiệp vụ
@RequiredArgsConstructor // Tự động Inject các Repository, Mapper, Encoder qua Constructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class BudgetService {
    TransactionRepository transactionRepository;
    AuthenticationService authenticationService;
    BudgetRepository budgetRepository;
    CategoryRepository categoryRepository;


    @Transactional
    public BudgetProgressResponse createBudget(BudgetRequest request) {
        User user = authenticationService.getUserByContext();

        LocalDate now = LocalDate.now();

        int month = (request.getMonth() != null) ? request.getMonth() : now.getMonthValue();
        int year = (request.getYear() != null) ? request.getYear() : now.getYear();

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException(ErrorCode.BUDGET_NOT_FOUND));

        if (budgetRepository.existsByUserIdAndCategoryIdAndMonthAndYear(
                user.getId(), category.getId(), month, year
        )) {
            throw new AppException(ErrorCode.BUDGET_ALREADY_EXISTS);
        }
        var budget = Budget.builder()
                .user(user)
                .category(category)
                .amount(request.getAmount())
                .month(month)
                .year(year)
                .build();
        budgetRepository.save(budget);

        return calculateProgress(budget, month, year, user.getId());
    }
    public List<BudgetProgressResponse> getBudgetProgress(Integer month, Integer year){
        User user = authenticationService.getUserByContext();

        LocalDate now = LocalDate.now();
        int queryMonth = (month != null) ? month : now.getMonthValue();
        int queryYear = (year != null) ? year : now.getYear();

        List<Budget> budgets = budgetRepository.findByUserIdAndMonthAndYear(user.getId(), queryMonth, queryYear);
        if(budgets.isEmpty()){
            return new ArrayList<>();
        }

        YearMonth ym = YearMonth.of(queryYear, queryMonth);
        LocalDateTime start = ym.atDay(1).atStartOfDay();
        LocalDateTime end = ym.atEndOfMonth().atTime(23,59,59,999999999);

        List<Transaction> transactions = transactionRepository.findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(user.getId(), start, end)
                .stream()
                .filter(tx -> tx.getType() == TransactionType.EXPENSE && tx.getCategory() != null)
                .toList();

        Map<String, BigDecimal> expensesByCategory = new HashMap<>();

        for(Transaction tx : transactions){
            expensesByCategory.merge(tx.getCategory().getId(), tx.getAmount(), BigDecimal::add);
        }
        List<BudgetProgressResponse> result = new ArrayList<>();

        for(Budget b: budgets){
            BigDecimal spent = expensesByCategory.getOrDefault(b.getCategory().getId(), BigDecimal.ZERO);
            result.add(mapToProgressResponse(b, spent));
        }

        result.sort((a, b) -> Double.compare(b.getPercent(), a.getPercent()));

        return result;
    }

    @Transactional
    public BudgetProgressResponse updateBudget(String budgetId, BudgetRequest request) {
        User user = authenticationService.getUserByContext();

        Budget budget = budgetRepository.findByIdAndUserId(budgetId, user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.BUDGET_NOT_FOUND));

        budget.setAmount(request.getAmount());
        // Nếu người dùng tăng hạn mức lên, có thể xem xét reset cờ thông báo nếu chi tiêu hiện tại tụt về mức an toàn
        budget = budgetRepository.save(budget);
        return calculateProgress(budget, budget.getMonth(), budget.getYear(), user.getId());
    }
    @Transactional
    public void deleteBudget(String budgetId) {
        User user = authenticationService.getUserByContext();
        Budget budget = budgetRepository.findByIdAndUserId(budgetId, user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.BUDGET_NOT_FOUND));

        budgetRepository.delete(budget);
    }

    private BudgetProgressResponse calculateProgress(Budget budget, int month, int year, String userId) {
        YearMonth ym = YearMonth.of(year, month);
        LocalDateTime start = ym.atDay(1).atStartOfDay();
        LocalDateTime end = ym.atEndOfMonth().atTime(23, 59, 59, 999999999);

        List<Transaction> txs = transactionRepository.findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(userId, start, end);

        BigDecimal spent = txs.stream()
                .filter(tx -> tx.getType() == TransactionType.EXPENSE
                        && tx.getCategory() != null
                        && tx.getCategory().getId().equals(budget.getCategory().getId()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return mapToProgressResponse(budget, spent);
    }

    private BudgetProgressResponse mapToProgressResponse(Budget b, BigDecimal spent) {
        BigDecimal limit = b.getAmount();

        Double percent = 0.0;

        if (limit.compareTo(BigDecimal.ZERO) > 0) {
            percent = spent.divide(limit, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(1, RoundingMode.HALF_UP)
                    .doubleValue();
        }
        // Gán màu sắc chuẩn Figma
        String barColor = "bg-blue-600"; // < 80% Xanh an toàn
        if (percent >= 100.0) {
            barColor = "bg-rose-500";   // >= 100% Đỏ vượt hạn mức
        } else if (percent >= 80.0) {
            barColor = "bg-orange-500"; // >= 80% Cam cảnh báo
        }
        return BudgetProgressResponse.builder()
                .id(b.getId())
                .categoryId(b.getCategory().getId())
                .categoryName(b.getCategory().getName())
                .categoryColor(b.getCategory().getColor())
                .categoryIcon(b.getCategory().getIcon())
                .spent(spent)
                .limit(limit)
                .percent(percent)
                .barColor(barColor)
                .isExceeded(percent >= 100.0)
                .build();
    }
}

