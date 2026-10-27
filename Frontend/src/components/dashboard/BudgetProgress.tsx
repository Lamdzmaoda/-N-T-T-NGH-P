import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Link } from "react-router"
import { ArrowRight } from "lucide-react"
// Dữ liệu ngân sách chuẩn Figma
const budgets = [
  {
    category: "Ăn uống",
    spent: "4.250.000",
    limit: "5.000.000",
    percent: 85,
    barColor: "bg-orange-500", // Cam cảnh báo
  },
  {
    category: "Di chuyển",
    spent: "1.820.000",
    limit: "3.000.000",
    percent: 61,
    barColor: "bg-blue-600", // Xanh an toàn
  },
  {
    category: "Mua sắm",
    spent: "2.180.000",
    limit: "2.000.000",
    percent: 109,
    barColor: "bg-rose-500", // Đỏ vượt hạn mức!
  },
  {
    category: "Giải trí",
    spent: "750.000",
    limit: "1.500.000",
    percent: 50,
    barColor: "bg-purple-600",
  },
]
const BudgetProgress = () => {
   return (
    <Card className="col-span-1 lg:col-span-4 border border-slate-200/80 shadow-xs rounded-2xl bg-white p-2 sm:p-4 flex flex-col justify-start">
      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-bold text-slate-900">
            Ngân sách tháng
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-0.5">
            4 ngân sách đang theo dõi
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
        {budgets.map((b, idx) => (
          <div key={idx} className="space-y-1.5">
            {/* Tên danh mục & Con số */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">{b.category}</span>
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
      </CardContent>
    </Card>
  )
}
    

export default BudgetProgress;
