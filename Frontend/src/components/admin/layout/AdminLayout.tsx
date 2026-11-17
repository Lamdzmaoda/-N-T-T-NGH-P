import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import {
  Users,
  Settings,
  BookOpen,
  FolderTree,
  Mail,
  BarChart3,
  ChevronDown,
  ChevronRight,
  LogOut,
  Home,
  ShieldAlert,
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const [openUserMenu, setOpenUserMenu] = useState(true);

  const isAdmin = user?.roles?.some(
    (r) => r.name === "ADMIN" || r.name === "ROLE_ADMIN",
  );

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <ShieldAlert className="size-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-foreground">
          Quyền truy cập bị từ chối
        </h1>
        <p className="text-muted-foreground mt-2 max-w-md text-sm">
          Trang quản trị này chỉ dành riêng cho tài khoản có quyền Quản trị viên
          (ROLE_ADMIN).
        </p>
        <Button onClick={() => navigate("/")} className="mt-6">
          Trở về Dashboard
        </Button>
      </div>
    );
  }

  const isUserListActive =
    location.pathname === "/admin/users" ||
    location.pathname === "/admin/user/list";

  return (
    <div className="min-h-screen flex bg-muted/30 font-sans text-foreground">
      {/* 1. SIDEBAR TRÁI */}
      <aside className="w-64 bg-card border-r border-border flex flex-col shrink-0">
        {/* Header Sidebar / Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="font-black text-lg tracking-wider text-primary">FINFLOW</span>
            <Badge variant="secondary" className="text-[10px] uppercase font-bold">
              ADMIN
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground">Đang online: 1</span>
        </div>
        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
          {/* Nhóm Tài Khoản */}
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => setOpenUserMenu(!openUserMenu)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-foreground hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Users className="size-4 text-primary" />
                <span>Tài khoản</span>
              </div>
              {openUserMenu ? (
                <ChevronDown className="size-3.5 text-muted-foreground" />
              ) : (
                <ChevronRight className="size-3.5 text-muted-foreground" />
              )}
            </button>
            {openUserMenu && (
              <div className="ml-6 flex flex-col gap-1 border-l-2 border-border pl-2">
                <Link
                  to="/admin/users"
                  className={cn(
                    "block px-3 py-1.5 rounded-md text-xs transition-colors",
                    isUserListActive
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  Tất cả tài khoản
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors">
            <Settings className="size-4" />
            <span>Hệ thống</span>
          </div>
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors">
            <BookOpen className="size-4" />
            <span>Bài viết</span>
          </div>
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors">
            <FolderTree className="size-4" />
            <span>Danh mục</span>
          </div>
          <div className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors">
            <div className="flex items-center gap-2.5">
              <Mail className="size-4" />
              <span>Liên hệ</span>
            </div>
            <Badge variant="destructive" className="h-4 px-1.5 text-[10px] leading-none">
              0
            </Badge>
          </div>
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors">
            <BarChart3 className="size-4" />
            <span>Thống kê</span>
          </div>
        </nav>
        {/* Footer Sidebar */}
        <div className="p-3 border-t border-border flex flex-col gap-1">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Home className="size-4" />
            <span>Về App FinFlow</span>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              signOut();
              navigate("/signin");
            }}
            className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="size-4" />
            <span>Đăng xuất</span>
          </Button>
        </div>
      </aside>
      {/* 2. KHU VỰC NỘI DUNG CHÍNH */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shrink-0">
          <span className="text-xs font-medium text-muted-foreground">
            Hệ thống Quản trị / Quản lý người dùng
          </span>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
              {user?.full_name?.charAt(0) || "A"}
            </div>
            <span className="text-xs font-semibold text-foreground">
              {user?.full_name || "Admin"}
            </span>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
