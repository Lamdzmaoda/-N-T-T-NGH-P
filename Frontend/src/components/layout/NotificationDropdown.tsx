import React, { useState, useRef, useEffect } from "react"
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  AlertOctagon,
  Users,
  MessageSquare,
  Receipt,
  Info,
  Clock,
} from "lucide-react"
import { useNavigate } from "react-router"
import { useNotificationStore } from "@/stores/useNotificationStore"
import type { NotificationType } from "@/types/notification"

/**
 * Dropdown thông báo thời gian thực gắn trên Header Dashboard.
 * Hiển thị số lượng chưa đọc dạng badge đỏ, danh sách thông báo và tự động cập nhật khi WebSocket bắn tin.
 */
export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false); // Quản lý mở/đóng popover
  const dropdownRef = useRef<HTMLDivElement>(null); // Ref tham chiếu để bắt sự kiện click outside
  const navigate = useNavigate();

  // Lấy dữ liệu và các hàm thao tác từ Zustand store
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();

  // Tải danh sách thông báo ban đầu khi component được render
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Lắng nghe sự kiện click chuột bên ngoài dropdown để tự động đóng menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [])

  // Xử lý khi nhấn vào 1 thông báo: Đánh dấu đã đọc và chuyển hướng đến trang liên quan
  const handleItemClick = (id: string, actionUrl?: string) => {
    markAsRead(id)
    setIsOpen(false)
    if (actionUrl) {
      navigate(actionUrl)
    }
  }

  // Đánh dấu tất cả thông báo là đã đọc
  const handleMarkAllAsRead = () => {
    markAllAsRead();
    setIsOpen(false)
  }

  // Render icon và màu sắc phù hợp cho từng loại thông báo
  const renderIcon = (type: NotificationType) => {
    switch (type) {
      case "BUDGET_WARNING":
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-100">
            <AlertTriangle className="h-4 w-4" />
          </div>
        )
      case "BUDGET_EXCEEDED":
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-rose-100">
            <AlertOctagon className="h-4 w-4" />
          </div>
        )
      case "GROUP_EXPENSE_ADDED":
      case "SETTLEMENT_REMINDER":
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
            <Receipt className="h-4 w-4" />
          </div>
        )
      case "CHAT_MESSAGE":
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 ring-1 ring-purple-100">
            <MessageSquare className="h-4 w-4" />
          </div>
        )
      default:
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
            <Info className="h-4 w-4" />
          </div>
        )
    }
  }

  // Định dạng thời gian hiển thị thân thiện (giờ:phút ngày-tháng, fallback "Vừa xong")
  const formatTime = (isoString?: string) => {
    if (!isoString) return "Vừa xong"
    try {
      const date = new Date(isoString)
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
      })
    } catch {
      return "Vừa xong"
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Nút Chuông có Badge đếm số */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition shadow-2xs cursor-pointer focus:outline-none"
        aria-label="Thông báo"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white ring-2 ring-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Danh Sách Thông Báo chuẩn shadcn/ui */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-84 sm:w-96 rounded-2xl border border-slate-200/90 bg-white shadow-xl shadow-slate-900/5 z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">Thông báo</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                  {unreadCount} chưa đọc
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer transition"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span>Đọc tất cả</span>
              </button>
            )}
          </div>

          {/* Danh sách thông báo */}
          <div className="max-h-95 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Bell className="h-8 w-8 stroke-[1.2] text-slate-300" />
                <span className="text-xs font-medium">Bạn chưa có thông báo nào</span>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item.id, item.actionUrl)}
                  className={`flex items-start gap-3 p-3.5 text-left transition cursor-pointer hover:bg-slate-50/80 ${
                    !item.isRead ? "bg-blue-50/30" : "bg-white"
                  }`}
                >
                  {renderIcon(item.type)}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {item.title}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
                        <Clock className="h-2.5 w-2.5" />
                        <span>{formatTime(item.createdAt)}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed font-normal">
                      {item.message}
                    </p>
                  </div>

                  {/* Chấm tròn xanh báo hiệu chưa đọc */}
                  {!item.isRead && (
                    <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-slate-100 bg-slate-50/40 text-center">
            <span className="text-[10px] font-medium text-slate-400">
              Nhấn vào thông báo để chuyển đến nội dung
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
