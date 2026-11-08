import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useAnalyticsStore } from "@/stores/useAnalyticsStore";
import { Loader2 } from "lucide-react";



const chartConfig = {
  income: {
    label: "Thu nhập",
    color: "#2563EB", // Xanh dương đậm chuẩn Figma
  },
  expense: {
    label: "Chi tiêu",
    color: "#93C5FD", // Xanh nhạt chuẩn Figma
  },
};

export function CashFlowChart() {
  const currentYear = new Date().getFullYear().toString();
  const [selectedYear, setSelectedYear] = useState<string>(currentYear);

  const { cashFlow, isCashFlowLoading, fetchCashFlow } = useAnalyticsStore();

  useEffect(() => {
    fetchCashFlow(Number(selectedYear));
  }, [selectedYear, fetchCashFlow]);

  const formatYAxis = (val: number) => {
    if (val == 0) return "0";
    if (val >= 1_000_000_000)
      return `${(val / 1_000_000_000).toFixed(1).replace(/\.0$/, "")} tỷ`;
    if (val >= 1_000_000)
      return `${(val / 1_000_000).toFixed(1).replace(/\.0$/, "")}tr`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(0)}k`;
    return `${val}`;
  };

  return (
    <Card className="col-span-1 lg:col-span-8 border border-slate-200/80 shadow-xs rounded-2xl bg-white p-2 sm:p-4">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-base font-bold text-slate-900">
            Dòng tiền
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-0.5">
            Thu nhập và chi tiêu 12 tháng năm {selectedYear}
          </CardDescription>
        </div>

        {/* Legend chú giải & Bộ lọc năm */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
              <span>Thu nhập</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-300" />
              <span>Chi tiêu</span>
            </div>
          </div>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="h-8 px-2.5 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="2026">Năm 2026</option>
            <option value="2025">Năm 2025</option>
          </select>
        </div>
      </CardHeader>

      <CardContent className="px-2 pt-2">
        {isCashFlowLoading && cashFlow.length === 0 ? (
          <div className="h-55 w-full flex items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-xs">Đang tải dữ liệu dòng tiền...</span>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-\[260px\] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={cashFlow}
                margin={{ top: 10, right: 10, left: 5, bottom: 0 }}
                barGap={2}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#F1F5F9"
                />
                <XAxis
                  dataKey="month"
                  stroke="#94A3B8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  width={70}
                  tickFormatter={formatYAxis}
                />
                <ChartTooltip
                  cursor={{ fill: "rgba(241, 245, 249, 0.6)" }}
                  content={
                    <ChartTooltipContent
                      indicator="dashed"
                      formatter={(value) =>
                        `${Number(value).toLocaleString("vi-VN")} đ`
                      }
                    />
                  }
                />
                {/* 2 Cột: Thu nhập (xanh đậm) & Chi tiêu (xanh nhạt) bo góc đầu cột */}
                <Bar
                  dataKey="income"
                  fill="#2563EB"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={16}
                />
                <Bar
                  dataKey="expense"
                  fill="#93C5FD"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={16}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

export default CashFlowChart;
