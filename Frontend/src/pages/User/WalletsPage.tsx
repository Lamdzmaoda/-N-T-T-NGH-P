import { useEffect, useState, useMemo } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWalletStore } from "@/stores/useWalletStore";
import { WalletCard } from "@/components/wallet/content/WalletCard";
import { WalletCreateDialog } from "@/components/wallet/dialog/WalletCreateDialog";

import { WalletDeleteDialog } from "@/components/wallet/dialog/WalletDeleteDialog";
import type { Wallet, WalletType } from "@/types/wallet";
import { cn } from "@/lib/utils";
import { 
  Plus, 
  Wallet as WalletIcon, 
  Layers, 
  TrendingUp 
} from "lucide-react";
import { WalletEditDialog } from "@/components/wallet/dialog/WalletEditDialog";

type FilterTab = "ALL" | WalletType;

const TABS: { id: FilterTab; label: string }[] = [
  { id: "ALL", label: "Tất cả" },
  { id: "CASH", label: "Tiền mặt" },
  { id: "BANK", label: "Ngân hàng" },
  { id: "E_WALLET", label: "Ví điện tử" },
  { id: "SAVING", label: "Tiết kiệm" },
  { id: "CREDIT", label: "Tín dụng" },
];

const WalletsPage = () => {
  const { 
    wallets, 
    totalBalance, 
    loading, 
    fetchMyWallets, 
    fetchTotalBalance,
    toggleIncludeInTotal 
  } = useWalletStore();
  
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [deletingWallet, setDeletingWallet] = useState<Wallet | null>(null);

  useEffect(() => {
    fetchMyWallets();
    fetchTotalBalance();
  }, [fetchMyWallets, fetchTotalBalance]);

  const filteredWallets = useMemo(() => {
    if (activeTab === "ALL") return wallets;
    return wallets.filter((w) => w.type === activeTab);
  }, [wallets, activeTab]);

  const formattedTotal = useMemo(() => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: totalBalance?.currency || "VND",
    }).format(totalBalance?.totalBalance || 0);
  }, [totalBalance]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="h-screen overflow-hidden flex flex-col bg-slate-50/60">
        <DashboardHeader />

        <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto flex flex-col gap-6">
            
            {/* Header thanh công cụ & Nút Thêm ví màu xanh dương nổi bật */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Ví của tôi</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Quản lý tài khoản ngân hàng, ví điện tử và dòng tiền thanh toán cá nhân.
                </p>
              </div>
              <Button 
                onClick={() => setCreateOpen(true)} 
                className="gap-2 shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-xs shadow-blue-500/20"
              >
                <Plus className="size-4" /> Thêm ví mới
              </Button>
            </div>

            {/* Thẻ Thống kê Tổng quan (Summary Cards tông sáng cao cấp) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="border border-blue-200/80 bg-linear-to-br from-blue-50/60 to-white shadow-xs">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                    Tổng tài sản khả dụng
                  </span>
                  <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600">
                    <TrendingUp className="size-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-44" />
                  ) : (
                    <div className="text-2xl font-black text-slate-900">{formattedTotal}</div>
                  )}
                  <p className="text-[11px] text-slate-500 mt-1">
                    Chỉ tính từ các ví có bật "Tính vào tổng"
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-slate-200/80 bg-white shadow-xs">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Số lượng ví quản lý
                  </span>
                  <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                    <WalletIcon className="size-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-black text-slate-900">
                      {totalBalance?.totalWallets ?? wallets.length}
                    </div>
                  )}
                  <p className="text-[11px] text-slate-500 mt-1">
                    Đang hoạt động trên hệ thống
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-slate-200/80 bg-white shadow-xs">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Phân loại nguồn tiền
                  </span>
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                    <Layers className="size-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black text-slate-900">
                    {new Set(wallets.map((w) => w.type)).size}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Loại nguồn tiền đang sử dụng
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Thanh Tabs Lọc loại ví - Active tông xanh dương FinFlow */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                const count = tab.id === "ALL" 
                  ? wallets.length 
                  : wallets.filter((w) => w.type === tab.id).length;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer",
                      isActive
                        ? "bg-blue-600 text-white font-semibold shadow-xs"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={cn(
                        "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                        isActive ? "bg-white/25 text-white" : "bg-slate-100 text-slate-600"
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Danh sách lưới các Thẻ ví */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((n) => (
                  <Skeleton key={n} className="h-44 rounded-2xl bg-slate-200/60" />
                ))}
              </div>
            ) : filteredWallets.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-300 rounded-2xl bg-white">
                <div className="p-3 rounded-full bg-slate-50 text-slate-400 mb-3 border border-slate-200">
                  <WalletIcon className="size-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Chưa có ví nào</h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  {activeTab === "ALL"
                    ? "Bạn chưa tạo ví tài chính nào. Hãy thêm ví đầu tiên để bắt đầu ghi chép chi tiêu!"
                    : "Không tìm thấy ví nào thuộc phân loại này."}
                </p>
                <Button 
                  onClick={() => setCreateOpen(true)} 
                  size="sm" 
                  className="mt-4 gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="size-4" /> Thêm ví mới
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredWallets.map((wallet) => (
                  <WalletCard
                    key={wallet.id}
                    wallet={wallet}
                    onEdit={(w) => setEditingWallet(w)}
                    onDelete={(w) => setDeletingWallet(w)}
                    onToggleIncludeInTotal={toggleIncludeInTotal}
                  />
                ))}
              </div>
            )}

          </div>
        </div>
      </SidebarInset>

      {/* Các Dialog Thao tác */}
      <WalletCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
      <WalletEditDialog
        wallet={editingWallet}
        open={!!editingWallet}
        onOpenChange={(open) => !open && setEditingWallet(null)}
      />
      <WalletDeleteDialog
        wallet={deletingWallet}
        open={!!deletingWallet}
        onOpenChange={(open) => !open && setDeletingWallet(null)}
      />
    </SidebarProvider>
  );
};

export default WalletsPage;