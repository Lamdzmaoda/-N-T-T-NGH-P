export interface DashboardSummaryResponse {
  totalIncome: number;          // Tổng thu nhập tháng này
  totalExpense: number;         // Tổng chi tiêu tháng này
  totalSavings: number;         // Tiền tiết kiệm (Thu - Chi)
  incomeGrowthRate: number;     // % biến động thu nhập so với tháng trước
  expenseGrowthRate: number;    // % biến động chi tiêu so với tháng trước
  netWorthGrowthRate: number;
}
export interface CashFlowResponse {
  month: string;          // "T1", "T2", ..., "T12"
  monthValue: number;    // 1 đến 12
  income: number;        // Tổng thu nhập VND
  expense: number;       // Tổng chi tiêu VND
}
export interface CategoryExpenseResponse {
  categoryId: string;
  categoryName: string;
  categoryColor?: string;
  categoryIcon?: string;
  amount: number;       // Số tiền đã chi
  percentage: number;   // Tỉ lệ % (ví dụ: 35.5)
}