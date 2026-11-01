import React, { useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Link } from "react-router";
import {
  ShoppingBag,
  Landmark,
  Car,
  Coffee,
  Zap,
  ArrowRight,
  ReceiptText,
  ArrowUpRight,
  ArrowLeftRight,
  ArrowDownLeft,
} from "lucide-react";
import { useTransactionStore } from "@/stores/useTransactionStore";

const RecentTransactions = () => {
  const { recentTransactions, fetchRecentTransactions, loading } =
    useTransactionStore();

  useEffect(() => {
    fetchRecentTransactions();
  }, [fetchRecentTransactions]);

  // 3. Hàm format ngày giờ đẹp (VD: 30/10/2026 15:30)
  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN").format(val);
  };
  return (
    <Card className="col-span-1 lg:col-span-8 border border-slate-200/80 shadow-xs rounded-2xl bg-white p-2 sm:p-4">
      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-bold text-slate-900">
            Giao dịch gần đây
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-0.5">
            Cập nhật theo thời gian thực
          </CardDescription>
        </div>
        {/* Link chuyển sang trang Giao dịch toàn bộ */}
        <Link
          to="/transactions"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition"
        >
          <span>Xem tất cả</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      {/* Danh sách giao dịch */}
      <CardContent className="pt-1 px-2 space-y-1">
        {recentTransactions.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <ReceiptText className="mx-auto h-8 text-slate-300 mb-2" />
            <p className="text-xs">Chưa có giao dịch nào gần đây</p>
          </div>
        ) : (
          recentTransactions.map((tx) => {
            const isIncome = tx.type === "INCOME";
            const isTransfer = tx.type === "TRANSFER";

            // Chọn icon và màu sắc tương ứng với từng loại giao dịch
            const iconBg = isIncome
              ? "bg-emerald-50 text-emerald-600"
              : isTransfer
                ? "bg-blue-50 text-blue-600"
                : "bg-rose-50 text-rose-600";

            const Icon = isIncome
              ? ArrowUpRight
              : isTransfer
                ? ArrowLeftRight
                : ArrowDownLeft;

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
              >
                {/* Bên trái: Icon + Tên giao dịch & Ví */}
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                      {isTransfer
                        ? "Chuyển tiền"
                        : tx.categoryName || "Giao dịch"}
                    </span>
                    <span className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[200px] sm:max-w-[320px]">
                      {isTransfer
                        ? `${tx.walletName} ➔ ${tx.destinationWalletName} 
                        ${tx.note && tx.note !== "string" ? `• ${tx.note}` : ""}`
                        : // Nếu là thu/chi: Ghi chú (nếu có) • Tên ví
                          `${tx.note && tx.note !== "string" ? `${tx.note} • ` : ""}${tx.walletName}`}
                    </span>
                  </div>
                </div>
                {/* Bên phải: Thời gian & Số tiền */}
                <div className="flex flex-col items-end">
                  <span
                    className={`text-xs sm:text-sm font-black tracking-tight ${
                      isIncome
                        ? "text-emerald-600"
                        : isTransfer
                          ? "text-blue-600"
                          : "text-rose-600"
                    }`}
                  >
                    {isIncome ? "+" : isTransfer ? "" : "-"}
                    {formatCurrency(tx.amount)} ₫
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    {formatDateTime(tx.transactionDate)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
