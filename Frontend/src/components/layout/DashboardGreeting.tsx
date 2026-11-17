import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useAuthStore } from "@/stores/useAuthStore"
import AddTransactionModal from '../dashboard/dialog/AddTransactionModal'
export function DashboardGreeting() {
  const user = useAuthStore((s) => s.user)
  const username = user?.username || "Minh"
  
  // 3. State quản lý đóng/mở Modal
  const [openAddModal, setOpenAddModal] = useState(false);
  // Tự động lấy tháng và năm hiện tại (VD: tháng 10/2026)
  const currentMonthYear = new Date().toLocaleDateString('vi-VN', { 
    month: '2-digit', 
    year: 'numeric' 
  })
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-sm lg:text-xl text-slate-900 tracking-tight">
          Chào buổi sáng, {username}!
        </h1>
        <p className="text-xs lg:text-sm text-slate-500 mt-1 font-medium">
          Đây là tổng quan tài chính của bạn trong {currentMonthYear}.
        </p>
      </div>
      {/* Nút hành động chính: + Thêm giao dịch */}
      <Button onClick={() => setOpenAddModal(true)} className="h-10 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer transition-all self-start sm:self-auto">
        <Plus className="h-4 w-4" />
        <span>Thêm giao dịch</span>
      </Button>

      <AddTransactionModal onOpenChange={setOpenAddModal} open={openAddModal}/>
    </div>
  )
}
export default DashboardGreeting