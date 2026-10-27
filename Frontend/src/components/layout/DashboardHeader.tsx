import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Search, Bell, Plus } from "lucide-react"
import { useAuthStore } from "@/stores/useAuthStore"
const DashboardHeader = () => {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-4 lg:px-6">
      {/* 1. Bên trái: Nút SidebarTrigger & Thanh Tìm Kiếm */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <SidebarTrigger className="-ml-1 text-slate-600 hover:text-slate-900" />
        
        {/* Thanh tìm kiếm mô phỏng chuẩn Figma */}
        <div className="relative w-full hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm giao dịch, ví, danh mục..."
            className="w-full h-9 pl-9 pr-12 text-xs rounded-lg border border-slate-200 bg-slate-50/50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-slate-200 bg-slate-100 px-1.5 font-mono text-[10px] font-medium text-slate-500">
            <span>⌘</span>
          </kbd>
        </div>
      </div>
      {/* 2. Bên phải: Chuông thông báo, User Profile & Nút Thêm giao dịch */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Nút chuông thông báo */}
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>
        {/* User Badge Profile */}
        <div className="flex items-center gap-2 pl-1 sm:border-l sm:border-slate-200 sm:pl-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xs ring-2 ring-blue-50">
            {/* {initials} */}
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-900 leading-tight">
              {/* {displayName} */}
            </span>
            <span className="text-[10px] font-medium text-slate-400">
              Tài khoản cá nhân
            </span>
          </div>
        </div>
        
      </div>
    </header>
  )
}

export default DashboardHeader
