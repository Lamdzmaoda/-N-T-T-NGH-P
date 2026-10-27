import React from "react";
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
} from "lucide-react";

// Dữ liệu mẫu chuẩn xác theo Figma PFT
const recentTransactions = [
  {
    id: "tx-1",
    name: "WinMart+",
    category: "Ăn uống",
    wallet: "Vietcombank",
    time: "Hôm nay, 09:42",
    amount: "-485.000 ₫",
    type: "EXPENSE",
    icon: ShoppingBag,
    iconBg: "bg-orange-50 text-orange-600",
  },
  {
    id: "tx-2",
    name: "Lương tháng 10",
    category: "Tiền lương",
    wallet: "Techcombank",
    time: "Hôm nay, 08:15",
    amount: "+28.500.000 ₫",
    type: "INCOME",
    icon: Landmark,
    iconBg: "bg-emerald-50 text-emerald-600",
  },
  {
    id: "tx-3",
    name: "Grab",
    category: "Di chuyển",
    wallet: "MoMo",
    time: "Hôm qua, 18:30",
    amount: "-92.000 ₫",
    type: "EXPENSE",
    icon: Car,
    iconBg: "bg-blue-50 text-blue-600",
  },
  {
    id: "tx-4",
    name: "Highlands Coffee",
    category: "Ăn uống",
    wallet: "MoMo",
    time: "12/10/2026, 14:20",
    amount: "-65.000 ₫",
    type: "EXPENSE",
    icon: Coffee,
    iconBg: "bg-amber-50 text-amber-700",
  },
  {
    id: "tx-5",
    name: "Tiền điện tháng 10",
    category: "Hóa đơn & Tiện ích",
    wallet: "Vietcombank",
    time: "10/10/2026, 10:00",
    amount: "-450.000 ₫",
    type: "EXPENSE",
    icon: Zap,
    iconBg: "bg-purple-50 text-purple-600",
  },
];
const RecentTransactions = () => {
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
        {recentTransactions.map((tx) => {
          const Icon = tx.icon;
          const isIncome = tx.type === "INCOME";
          return (
            <div
              key={tx.id}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
            >
              {/* Bên trái: Icon + Tên giao dịch & Ví */}
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tx.iconBg}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                    {tx.name}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5">
                    {tx.category} • {tx.wallet}
                  </span>
                </div>
              </div>
              {/* Bên phải: Thời gian & Số tiền */}
              <div className="flex flex-col items-end">
                <span
                  className={`text-xs sm:text-sm font-black tracking-tight ${
                    isIncome ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {tx.amount}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  {tx.time}
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default RecentTransactions
