import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Dữ liệu mẫu 12 tháng (Thu nhập vs Chi tiêu)
const monthlyData = [
  { month: "T1", income: 28, expense: 19 },
  { month: "T2", income: 35, expense: 22 },
  { month: "T3", income: 30, expense: 18 },
  { month: "T4", income: 42, expense: 25 },
  { month: "T5", income: 38, expense: 20 },
  { month: "T6", income: 45, expense: 28 },
  { month: "T7", income: 40, expense: 22 },
  { month: "T8", income: 48, expense: 30 },
  { month: "T9", income: 36, expense: 24 },
  { month: "T10", income: 52, expense: 32 },
  { month: "T11", income: 46, expense: 26 },
  { month: "T12", income: 55, expense: 35 },
]

const chartConfig = {
  income: {
    label: "Thu nhập",
    color: "#2563EB", // Xanh dương đậm chuẩn Figma
  },
  expense: {
    label: "Chi tiêu",
    color: "#93C5FD", // Xanh nhạt chuẩn Figma
  },
}

export function CashFlowChart() {
  const [selectedYear, setSelectedYear] = useState("2026")

  return (
    <Card className="col-span-1 lg:col-span-8 border border-slate-200/80 shadow-xs rounded-2xl bg-white p-2 sm:p-4">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-base font-bold text-slate-900">
            Dòng tiền
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-0.5">
            Thu nhập và chi tiêu 12 tháng gần nhất
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
        <ChartContainer config={chartConfig} className="h-\[220px\] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
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
                tickFormatter={(value) => `${value}tr`}
              />
              <ChartTooltip
                cursor={{ fill: "rgba(241, 245, 249, 0.6)" }}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              {/* 2 Cột: Thu nhập (xanh đậm) & Chi tiêu (xanh nhạt) bo góc đầu cột */}
              <Bar dataKey="income" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={10} />
              <Bar dataKey="expense" fill="#93C5FD" radius={[4, 4, 0, 0]} maxBarSize={10} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default CashFlowChart