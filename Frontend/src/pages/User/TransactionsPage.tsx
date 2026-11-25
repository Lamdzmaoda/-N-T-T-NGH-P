import { useEffect, useMemo, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTransactionStore } from "@/stores/useTransactionStore";
import { TransactionFilterBar } from "@/components/transaction/content/TransactionFilterBar";
import { TransactionTable } from "@/components/transaction/content/TransactionTable";
import AddTransactionModal from "@/components/transaction/dialog/AddTransactionModal";
import type { Transaction } from "@/types/transaction";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  FileSpreadsheet,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { TransactionDetailDialog } from "@/components/transaction/dialog/TransactionDetailDialog";
import { TransactionEditDialog } from "@/components/transaction/dialog/TransactionEditDialog";
import { TransactionTrashDialog } from "@/components/transaction/dialog/TransactionTrashDialog";

const TransactionsPage = () => {
  const {
    transactionPage,
    exporting,
    fetchTransactions,
    deleteTransaction,
    exportExcel,
  } = useTransactionStore();

  const [addOpen, setAddOpen] = useState(false);
  const [trashOpen, setTrashOpen] = useState(false);
  const [detailTx, setDetailTx] = useState<Transaction | null>(null);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  useEffect(() => {
    fetchTransactions(0);
  }, [fetchTransactions]);

  // Tính nhanh tổng thu/chi của danh sách đang hiển thị trên trang hiện tại
  const pageStats = useMemo(() => {
    const items = transactionPage?.content || [];
    let income = 0;
    let expense = 0;
    for (const tx of items) {
      if (tx.type === "INCOME") income += tx.amount;
      else if (tx.type === "EXPENSE") expense += tx.amount;
    }
    return {
      income,
      expense,
      net: income - expense,
    };
  }, [transactionPage]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);

  const handleDelete = async (tx: Transaction) => {
    const confirmed = window.confirm(
      `Bạn muốn chuyển giao dịch "${tx.note || tx.categoryName || "này"}" vào thùng rác và hoàn lại số dư ví?`
    );
    if (!confirmed) return;
    await deleteTransaction(tx.id);
  };

  const handleViewDetail = (tx: Transaction) => {
    setDetailTx(tx);
  };

  const handleEdit = (tx: Transaction) => {
    setEditingTx(tx);
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="h-screen overflow-hidden flex flex-col bg-slate-50/60">
        <DashboardHeader />

        {/* Container cố định chiều cao màn hình, chỉ Table rows cuộn bên trong */}
        <div className="flex-1 min-h-0 flex flex-col p-4 md:p-6 gap-4 max-w-7xl w-full mx-auto">
          {/* 1. Header trang (ghim cố định) */}
          <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Giao dịch
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Theo dõi, lọc đa tiêu chí, đối soát số dư và xuất sao kê Excel mọi khoản thu chi.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setTrashOpen(true)}
                className="h-9 gap-1.5 text-xs border-slate-200 text-slate-700 hover:bg-slate-100"
              >
                <Trash2 className="size-3.5 text-slate-500" />
                Thùng rác
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={exporting}
                onClick={exportExcel}
                className="h-9 gap-1.5 text-xs border-emerald-200 bg-emerald-50/70 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
              >
                {exporting ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <FileSpreadsheet className="size-3.5" />
                )}
                Xuất Excel
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={() => setAddOpen(true)}
                className="h-9 gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-xs shadow-blue-500/20"
              >
                <Plus className="size-4" />
                Thêm giao dịch
              </Button>
            </div>
          </div>

          {/* 2. Thanh Summary 3 ô (ghim cố định) */}
          <div className="shrink-0 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card className="p-3.5 border border-slate-200/80 bg-white shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500">
                Tổng thu (trang hiện tại)
              </span>
              <div className="text-lg font-extrabold text-emerald-600 mt-0.5">
                +{formatCurrency(pageStats.income)}
              </div>
            </Card>

            <Card className="p-3.5 border border-slate-200/80 bg-white shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500">
                Tổng chi (trang hiện tại)
              </span>
              <div className="text-lg font-extrabold text-rose-600 mt-0.5">
                -{formatCurrency(pageStats.expense)}
              </div>
            </Card>

            <Card className="p-3.5 border border-slate-200/80 bg-white shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500">
                Chênh lệch dòng tiền
              </span>
              <div
                className={cn(
                  "text-lg font-extrabold mt-0.5",
                  pageStats.net >= 0 ? "text-blue-600" : "text-rose-600"
                )}
              >
                {pageStats.net >= 0 ? "+" : ""}
                {formatCurrency(pageStats.net)}
              </div>
            </Card>
          </div>

          {/* 3. Thanh Bộ lọc đa tiêu chí (ghim cố định) */}
          <TransactionFilterBar />

          {/* 4. Bảng dữ liệu 6 cột (cuộn độc lập phần thân) */}
          <TransactionTable
            onViewDetail={handleViewDetail}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </SidebarInset>

      {/* Modal Thêm giao dịch */}
      <AddTransactionModal open={addOpen} onOpenChange={setAddOpen} />
      <TransactionDetailDialog
        transaction={detailTx}
        open={!!detailTx}
        onOpenChange={(open) => !open && setDetailTx(null)}
        onEdit={(tx) => setEditingTx(tx)}
      />
      <TransactionEditDialog
        transaction={editingTx}
        open={!!editingTx}
        onOpenChange={(open) => !open && setEditingTx(null)}
      />
      <TransactionTrashDialog
        open={trashOpen}
        onOpenChange={setTrashOpen}
      />
    </SidebarProvider>
  );
};

export default TransactionsPage;