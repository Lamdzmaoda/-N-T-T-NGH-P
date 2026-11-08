import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
} from "lucide-react";
import { useWalletStore } from "@/stores/useWalletStore";
import { useAnalyticsStore } from "@/stores/useAnalyticsStore";

export function StatCards() {
  const { totalBalance, fetchTotalBalance, loading } = useWalletStore();
  const { summary, fetchDashboardSummary} = useAnalyticsStore();


  useEffect(() => {
    fetchTotalBalance();
    fetchDashboardSummary()
  }, [fetchTotalBalance, fetchDashboardSummary]);

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return "0";
    return new Intl.NumberFormat("vi-VN").format(val);
  };

  const formatRate = (rate?: number) => {
    if(rate === undefined || rate === null) return "--%";

    const sign = rate > 0 ? "+" : "";
    return `${sign}${rate.toFixed(1).replace(".",",")}%`
  };

  
    // 1. Kiểm tra tăng / giảm thực tế dựa theo tỉ lệ tăng trưởng %
  const isNetWorthUp = (summary?.netWorthGrowthRate ?? 0) >= 0;
  const isIncomeUp = (summary?.incomeGrowthRate ?? 0) >= 0;
  const isExpenseUp = (summary?.expenseGrowthRate ?? 0) >= 0;
  const isSavingsPositive = (summary?.totalSavings ?? 0) >= 0;

  const stats = [
    {
      title: "Tổng tài sản",
      amount: formatCurrency(totalBalance?.totalBalance),
      currency: `${totalBalance?.currency ?? "VND"}`,
      badge: `${totalBalance?.totalWallets ?? 0} ví`,
      change: formatRate(summary?.netWorthGrowthRate),
      trend: isNetWorthUp ? "up" : "down",
      trendColor: isNetWorthUp ? "text-emerald-600" : "text-rose-600",
      subtext: "so với tháng trước",
      icon: Wallet,
      iconBg: "bg-blue-50 text-blue-600",
    },
    {
      title: "Thu nhập tháng này",
      amount: formatCurrency(summary?.totalIncome),
      currency: "₫",
      change: formatRate(summary?.incomeGrowthRate),
      trend: isIncomeUp ? "up" : "down" ,
      trendColor: isIncomeUp ? "text-emerald-600" : "text-rose-600",
      subtext: "so với tháng trước",
      icon: isIncomeUp ? ArrowUpRight : ArrowDownRight,
      iconBg: isIncomeUp? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600",
    },
    {
      title: "Chi tiêu tháng này",
      amount: formatCurrency(summary?.totalExpense),
      currency: "₫",
      change: formatRate(summary?.expenseGrowthRate),
      trend: isExpenseUp ? "up" : "down",
      trendColor: isExpenseUp ? "text-rose-600" : "text-emerald-600",
      subtext: "so với tháng trước",
      icon: isExpenseUp ? ArrowUpRight : ArrowDownRight,
      iconBg: isExpenseUp ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Tiết kiệm",
      amount: formatCurrency(summary?.totalSavings),
      currency: "₫",
      change: isSavingsPositive ? "Dương" : "âm",
      trend: isSavingsPositive ? "up" : "down",
      trendColor: isSavingsPositive ? "text-emerald-600" : "text-rose-600",
      subtext: "so với tháng trước",
      icon: PiggyBank,
      iconBg: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        const isUp = stat.trend === "up";

        return (
          <Card
            key={idx}
            className="border border-slate-200/80 shadow-xs hover:shadow-md transition-all rounded-2xl bg-white p-5"
          >
            <CardContent className="p-0">
              {/* Header của Card: Icon + Dấu 3 chấm */}
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconBg}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <button
                  type="button"
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-md http://localhost:5173/transition"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>

              {/* Tên chỉ số */}
              <div className="mt-3.5 ">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">
                    {stat.title}
                  </span>
                  {stat.badge && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-100">
                      {stat.badge}
                    </span>
                  )}
                </div>

                {/* Con số tiền lớn */}
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900 tracking-tight">
                    {stat.amount}
                  </span>
                  <span className="text-sm font-bold text-slate-500">
                    {stat.currency}
                  </span>
                </div>
              </div>

              {/* Phần trăm tăng / giảm */}
              <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium">
                <span
                  className={`inline-flex items-center gap-0.5 font-bold ${stat.trendColor}`}>
                  {isUp ? (
                    <TrendingUp className="h-3.5 w-3.5" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5" />
                  )}
                  {stat.change}
                </span>
                <span className="text-slate-400">{stat.subtext}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default StatCards;
