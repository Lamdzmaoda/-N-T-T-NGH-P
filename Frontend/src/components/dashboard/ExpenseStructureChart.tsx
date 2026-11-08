import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
// Dòng 9: PieChart của thư viện vẽ biểu đồ recharts
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

// Dòng 10: Import thêm 'PieChart as PieIcon' từ lucide-react
import { Loader2, MoreHorizontal, PieChart as PieIcon } from "lucide-react";
import { useAnalyticsStore } from "@/stores/useAnalyticsStore";

const DEFAULT_COLORS = [
  "#3B82F6",
  "#F97316",
  "#10B981",
  "#8B5CF6",
  "#EC4899",
  "#F59E0B",
  "#06B6D4",
];

export function ExpenseStructureChart() {
  const [filterType, setFilterType] = useState<"month" | "today">("month");

  const { categoryExpenses, isCategoryExpensesLoading, fetchCategoryExpenses } =
    useAnalyticsStore();

  const today = useMemo(() => new Date(), []);
  const currentDay = today.getDate();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  useEffect(() => {
    if (filterType === "today") {
      fetchCategoryExpenses(currentDay, currentMonth, currentYear);
    } else {
      fetchCategoryExpenses(undefined, currentMonth, currentYear);
    }
  }, [
    filterType,
    currentDay,
    currentMonth,
    currentYear,
    fetchCategoryExpenses,
  ]);

  const totalExpense = useMemo(() => {
    return categoryExpenses.reduce((sum, item) => sum + item.amount, 0);
  }, [categoryExpenses]);

  const formatCenterAmount = (val: number) => {
    if (val === 0) return "0 đ";
    if (val >= 1_000_000_000)
      return `${(val / 1_000_000_000).toFixed(1).replace(/\.0$/, "")} tỷ`;
    if (val >= 1_000_000)
      return `${(val / 1_000_000).toFixed(1).replace(/\.0$/, "")}tr`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(0)}k`;
    return `${val} đ`;
  };

  const chartData = useMemo(() => {
    return categoryExpenses.map((item, idx) => ({
      name: item.categoryName,
      value: item.percentage,
      amout: item.amount,
      color: item.categoryColor || DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
    }));
  }, [categoryExpenses]);

  return (
    <Card className="col-span-1 lg:col-span-4 border border-slate-200/80 shadow-xs rounded-2xl bg-white p-2 sm:p-4 flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between pb-0">
        <div>
          <CardTitle className="text-base font-bold text-slate-900">
            Cơ cấu chi tiêu
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-0.5">
            {filterType === "today"
              ? `Hôm nay, ${currentDay}/${currentMonth}/${currentYear}`
              : `Tháng ${currentMonth}/${currentYear}`}
          </CardDescription>
        </div>
        <div className="flex item-center bg-state-100 p-0.5 rounded-lg text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => setFilterType("month")}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer 
              ${filterType === "month" ? "bg-white text-blue-600 shadow-xs" : "text-slate-500 hover:text-slate-700"}`}
          >
            Tháng này
          </button>
          <button
            type="button"
            onClick={() => setFilterType("today")}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer 
              ${filterType === "today" ? "bg-white text-blue-600 shadow-xs" : "text-slate-500 hover:text-slate-700"}`}
          >
            Hôm nay
          </button>
        </div>
      </CardHeader>

      <CardContent className="pt-2 pb-0 flex flex-col items-center">
        {isCategoryExpensesLoading ? (
          <div className="h-75 w-full flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-xs">Đang tải cơ cấu...</span>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-75 w-full flex flex-col items-center justify-center text-slate-400 gap-2">
            <PieIcon className="w-10 h-10 stroke-[1.5] text-slate-300" />
            <span className="text-xs font-medium">
              Chưa có chi tiêu trong thời gian này
            </span>
          </div>
        ) : (
          <>
            {/* Vòng tròn Donut Chart kèm Text ở giữa tâm */}
            <div className="relative w-full h-75 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    formatter={(value: any, name: any) => [`${value}%`, name]}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #E2E8F0",
                      fontSize: "12px",
                    }}
                  />
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={78}
                    paddingAngle={4}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Chữ hiển thị ở chính giữa Donut Chart */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-slate-900 leading-tight">
                  {formatCenterAmount(totalExpense)}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Tổng chi
                </span>
              </div>
            </div>

            {/* Chú giải danh mục tỉ lệ % ở dưới (Grid 2 cột) */}
            <div className="w-full grid grid-cols-2 gap-x-4 gap-y-2.5 pt-3 border-t border-slate-100">
              {chartData.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-slate-600 truncate max-w-17.5">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-bold text-slate-900">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default ExpenseStructureChart;
