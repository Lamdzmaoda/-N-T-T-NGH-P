import React, { useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Link } from "react-router";
import { ArrowRight, Loader2, Target } from "lucide-react";
import { useBudgetStore } from "@/stores/useBudgetStore";

const BudgetProgress = () => {
  const { budgets, loading, fetchBudgetProgress } = useBudgetStore();

  const today = useMemo(() => new Date(), []);
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  useEffect(() => {
    fetchBudgetProgress(currentMonth, currentYear);
  }, [currentMonth, currentYear, fetchBudgetProgress]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN").format(val);
  };

  const displayBudgets = budgets.slice(0, 4);
  return (
    <Card className="col-span-1 lg:col-span-4 border border-slate-200/80 shadow-xs rounded-2xl bg-white p-2 sm:p-4 flex flex-col justify-start">
      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-bold text-slate-900">
            Ngân sách tháng
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-0.5">
            {budgets.length > 0
              ? `${budgets.length} Ngân sách theo dõi`
              : `Tháng ${currentMonth}/${currentYear}`}
          </CardDescription>
        </div>
        <Link
          to="/budgets"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition"
        >
          <span>Chi tiết</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      {/* Danh sách thanh tiến độ Progress bar */}
      <CardContent className="pt-3 px-2 space-y-4">
        {loading && budgets.length === 0 ? (
          <div className="h-40 w-full flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-xs">Đang tải tiến độ ngân sách...</span>
          </div>
        ) : displayBudgets.length === 0 ? (
          <div className="h-40 w-full flex flex-col items-center justify-center text-slate-400 gap-2">
            <Target className="w-8 h-8 stroke-[1.5] text-slate-300" />
            <span className="text-xs font-medium">
              Chưa thiết lập ngân sách tháng này
            </span>
            <Link
              to="/budgets"
              className="text-xs font-semibold text-blue-600 hover:underline mt-1"
            >
              + Thiết lập ngay
            </Link>
          </div>
        ) : (
          <>
            {displayBudgets.map((b) => (
              <div key={b.id} className="space-y-1.5">
                {/* Tên danh mục & Con số */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">
                    {b.categoryName}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 text-[11px]">
                      {b.spent} / {b.limit} ₫
                    </span>
                    <span
                      className={`font-black text-xs ${
                        b.percent >= 100 ? "text-rose-600" : "text-slate-700"
                      }`}
                    >
                      {b.percent}%
                    </span>
                  </div>
                </div>
                {/* Thanh Progress bar */}
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${b.barColor}`}
                    style={{ width: `${Math.min(b.percent, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetProgress;
