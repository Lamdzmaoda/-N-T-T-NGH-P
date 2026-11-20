import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Search, Bell, Plus } from "lucide-react"
import { useAuthStore } from "@/stores/useAuthStore"
import { NotificationDropdown } from "./NotificationDropdown"
import { useNavigate } from "react-router"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
const DashboardHeader = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const displayName = user?.full_name || user?.username || "Người dùng";
  const initials = displayName.charAt(0).toUpperCase();
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
      {/* 1. Bên trái: Nút SidebarTrigger & Thanh Tìm Kiếm */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
        
        {/* Thanh tìm kiếm */}
        <div className="relative w-full hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm giao dịch, ví, danh mục..."
            className="w-full h-9 pl-9 pr-12 text-xs rounded-lg border border-border bg-muted/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:bg-background transition-all"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span>⌘</span>
          </kbd>
        </div>
      </div>
      {/* 2. Bên phải: Chuông thông báo & User Profile Badge */}
      <div className="flex items-center gap-3 sm:gap-4">
        <NotificationDropdown />
        {/* User Badge: Bấm vào điều hướng sang /profile */}
        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2.5 pl-1 sm:border-l sm:border-border sm:pl-3 hover:opacity-80 transition-opacity cursor-pointer text-left"
        >
          <Avatar className="h-8 w-8 border border-border">
            <AvatarImage src={user?.avatarUrl || undefined} alt={displayName} className="object-cover" />
            <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-semibold text-foreground leading-tight">
              {displayName}
            </span>
            <span className="text-[10px] font-medium text-muted-foreground">
              {user?.provider === "GOOGLE" ? "Google Account" : "Tài khoản cá nhân"}
            </span>
          </div>
        </button>
      </div>
    </header>
  )
}

export default DashboardHeader
