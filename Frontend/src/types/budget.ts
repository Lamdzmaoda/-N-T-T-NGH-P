export interface BudgetRequest {
  categoryId: string;
  amount: number;
  month?: number;
  year?: number;
}

export interface BudgetProgressResponse {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryColor?: string;
  categoryIcon?: string;
  spent: number;        // Số tiền thực tế đã chi (VND)
  limit: number;        // Hạn mức đã đặt (VND)
  percent: number;      // % đã tiêu (ví dụ: 85.0)
  barColor: string;     // Mã màu class tailwind ("bg-blue-600", "bg-orange-500", "bg-rose-500")
  isExceeded: boolean;  // Đã vượt hạn mức (>= 100%) chưa
}