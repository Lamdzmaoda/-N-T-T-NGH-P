package org.example.backend.service.analytics;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.backend.dto.response.analytics.CashFlowResponse;
import org.example.backend.dto.response.analytics.CategoryExpenseResponse;
import org.example.backend.dto.response.analytics.DashboardSummaryResponse;
import org.example.backend.entity.Category;
import org.example.backend.entity.Transaction;
import org.example.backend.entity.User.User;
import org.example.backend.entity.Wallet;
import org.example.backend.enums.TransactionType;
import org.example.backend.repository.transaction.TransactionRepository;
import org.example.backend.repository.wallet.WalletRepository;
import org.example.backend.service.auth.AuthenticationService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AnalyticsService {

    TransactionRepository transactionRepository;
    AuthenticationService authenticationService;
    WalletRepository walletRepository;

    public DashboardSummaryResponse getDashboardSummary(int month, int year) {
        User user = authenticationService.getUserByContext();

        YearMonth currentYearMonth = YearMonth.of(year, month);
        LocalDateTime currentStart = currentYearMonth.atDay(1).atStartOfDay();
        LocalDateTime currentEnd = currentYearMonth.atEndOfMonth().atTime(23, 59, 59, 999999999);

        YearMonth prevYearMonth = currentYearMonth.minusMonths(1);
        LocalDateTime prevStart = prevYearMonth.atDay(1).atStartOfDay();
        LocalDateTime prevEnd = prevYearMonth.atEndOfMonth().atTime(23, 59, 59, 999999999);

        List<Transaction> currentTxs = transactionRepository
                .findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(user.getId(), currentStart, currentEnd);
        List<Transaction> prevTsx = transactionRepository
                .findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(user.getId(), prevStart, prevEnd);

        BigDecimal currentIncome = calculateTotal(currentTxs, TransactionType.INCOME);
        BigDecimal currentExpense = calculateTotal(currentTxs, TransactionType.EXPENSE);
        BigDecimal currentSavings = currentIncome.subtract(currentExpense);

        BigDecimal prevIncome = calculateTotal(prevTsx, TransactionType.INCOME);
        BigDecimal prevExpense = calculateTotal(prevTsx, TransactionType.EXPENSE);

        Double incomeGrowthRate = calculateGrowthRate(prevIncome, currentIncome);
        Double expenseGrowthRate = calculateGrowthRate(prevExpense, currentExpense);

        BigDecimal currentTotalBalance = walletRepository.findByUserIdAndIsActiveTrue(user.getId())
                .stream()
                .filter(Wallet::getIncludeInTotal)
                .map(Wallet::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal nextChangeThisMonth = currentIncome.subtract(currentExpense);
        BigDecimal prevMonthTotalBalance = currentTotalBalance.subtract(nextChangeThisMonth);

        Double nextWorthGrowthRate = calculateGrowthRate(prevMonthTotalBalance, currentTotalBalance);

        return DashboardSummaryResponse.builder()
                .totalExpense(currentExpense)
                .totalIncome(currentIncome)
                .totalSavings(currentSavings)
                .incomeGrowthRate(incomeGrowthRate)
                .expenseGrowthRate(expenseGrowthRate)
                .netWorthGrowthRate(nextWorthGrowthRate)
                .build();
    }

    public List<CashFlowResponse> getCashFlow(int year) {
        User user = authenticationService.getUserByContext();

        LocalDateTime currentStart = LocalDateTime.of(year, 1, 1, 0, 0, 0);
        LocalDateTime currentEnd = LocalDateTime.of(year, 12, 31, 23, 59, 59, 999999999);

        List<Transaction> yearTxs = transactionRepository.findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(user.getId(), currentStart, currentEnd);

        List<CashFlowResponse> result = new ArrayList<>();

        for (int m = 1; m <= 12; m++) {
            final int currentMonth = m;

            List<Transaction> monthTx = yearTxs.stream()
                    .filter(tx -> tx.getTransactionDate().getMonthValue() == currentMonth)
                    .toList();

            BigDecimal income = calculateTotal(monthTx, TransactionType.INCOME);
            BigDecimal expense = calculateTotal(monthTx, TransactionType.EXPENSE);

            result.add(CashFlowResponse.builder()
                    .month("T" + m)
                    .monthValue(m)
                    .income(income)
                    .expense(expense)
                    .build());
        }
        return result;
    }

    public List<CategoryExpenseResponse> getCategoryExpenses(Integer day, Integer month, Integer year) {
        User user = authenticationService.getUserByContext();

        LocalDate now = LocalDate.now();
        int queryYear = (year != null) ? year : now.getYear();

        LocalDateTime start;
        LocalDateTime end;

        if (day != null) {
            int queryMonth = (month != null) ? month : now.getMonthValue();
            LocalDate targetDate = LocalDate.of(queryYear, queryMonth, day);
            start = targetDate.atStartOfDay();
            end = targetDate.atTime(23, 59, 59);
        } else if (month != null) {
            YearMonth ym = YearMonth.of(queryYear, month);
            start = ym.atDay(1).atStartOfDay();
            end = ym.atEndOfMonth().atTime(23, 59, 59, 999999999);
        } else {
            start = LocalDateTime.of(queryYear, 1, 1, 0, 0, 0);
            end = LocalDateTime.of(queryYear, 12, 31, 23, 59, 59, 999999999);
        }

        List<Transaction> transactions = transactionRepository.findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(user.getId(), start, end);

        List<Transaction> expenseTxs = transactions.stream()
                .filter(tx -> tx.getType() == TransactionType.EXPENSE && tx.getCategory() != null).toList();
        BigDecimal totalExpense = expenseTxs.stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalExpense.compareTo(BigDecimal.ZERO) == 0) {
            return new ArrayList<>();
        }

        Map<Category, BigDecimal> categoryMap = new LinkedHashMap<>();
        for (Transaction tx : expenseTxs) {
            categoryMap.merge(tx.getCategory(), tx.getAmount(), BigDecimal::add);
        }
        List<CategoryExpenseResponse> result = new ArrayList<>();

        for (Map.Entry<Category, BigDecimal> entry : categoryMap.entrySet()) {
            Category cat = entry.getKey();
            BigDecimal amount = entry.getValue();

            Double percentage = amount.divide(totalExpense, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(1, RoundingMode.HALF_UP)
                    .doubleValue();

            result.add(CategoryExpenseResponse.builder()
                    .categoryId(cat.getId())
                    .categoryName(cat.getName())
                    .categoryColor(cat.getColor())
                    .categoryIcon(cat.getIcon())
                    .amount(amount)
                    .percentage(percentage)
                    .build());
        }
        result.sort((a,b) -> b.getAmount().compareTo(a.getAmount()));

        return result;
    }

    private BigDecimal calculateTotal(List<Transaction> transactions, TransactionType type) {
        return transactions.stream()
                .filter(tx -> tx.getType() == type)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private Double calculateGrowthRate(BigDecimal prev, BigDecimal current) {
        if (prev == null || prev.compareTo(BigDecimal.ZERO) == 0) {
            return current.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0;
        }

        BigDecimal diff = current.subtract(prev);
        BigDecimal rate = diff.divide(prev, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));

        return rate.setScale(1, RoundingMode.HALF_UP).doubleValue();
    }
}