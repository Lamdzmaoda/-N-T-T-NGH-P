import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { MoreHorizontal } from "lucide-react"

// Dữ liệu mẫu cơ cấu chi tiêu chuẩn Figma
const expenseData = [
  { name: "Ăn uống", value: 32, amount: "5.880.000 ₫", color: "#F97316" }, // Cam
  { name: "Nhà cửa", value: 24, amount: "4.420.000 ₫", color: "#3B82F6" }, // Xanh dương
  { name: "Di chuyển", value: 18, amount: "3.310.000 ₫", color: "#8B5CF6" }, // Tím
  { name: "Khác", value: 26, amount: "4.810.000 ₫", color: "#10B981" },     // Xanh ngọc
]

export function ExpenseStructureChart() {
  const currentMonthYear = new Date().toLocaleDateString('vi-VN', { 
    month: '2-digit', 
    year: 'numeric' 
  })

  return (
    <Card className="col-span-1 lg:col-span-4 border border-slate-200/80 shadow-xs rounded-2xl bg-white p-2 sm:p-4 flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between pb-0">
        <div>
          <CardTitle className="text-base font-bold text-slate-900">
            Cơ cấu chi tiêu
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-0.5">
            {currentMonthYear}
          </CardDescription>
        </div>
        <button
          type="button"
          className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </CardHeader>

      <CardContent className="pt-2 pb-0 flex flex-col items-center">
        {/* Vòng tròn Donut Chart kèm Text ở giữa tâm */}
        <div className="relative w-full h-75 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                formatter={(value: any, name: any) => [`${value}%`, name]}
                contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0", fontSize: "12px" }}
              />
              <Pie
                data={expenseData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={78}
                paddingAngle={4}
                dataKey="value"
                strokeWidth={0}
              >
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Chữ hiển thị ở chính giữa Donut Chart */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-black text-slate-900 leading-tight">
              18,4tr
            </span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Tổng chi
            </span>
          </div>
        </div>

        {/* Chú giải danh mục tỉ lệ % ở dưới (Grid 2 cột) */}
        <div className="w-full grid grid-cols-2 gap-x-4 gap-y-2.5 pt-3 border-t border-slate-100">
          {expenseData.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="font-medium text-slate-600 truncate max-w-17.5">
                  {item.name}
                </span>
              </div>
              <span className="font-bold text-slate-900">{item.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default ExpenseStructureChart