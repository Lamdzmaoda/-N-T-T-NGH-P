import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useTransactionStore } from "@/stores/useTransactionStore";
import { renderCategoryIcon } from "@/components/admin/content/CategoryTable";
import type { Transaction } from "@/types/transaction";
import { cn } from "@/lib/utils";
import {
  ArrowLeftRight,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Eye,
  Paperclip,
  Pencil,
  ReceiptText,
  Trash2,
} from "lucide-react";

interface TransactionTableProps {
  onViewDetail: (tx: Transaction) => void;
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
}

export const TransactionTable = ({
  onViewDetail,
  onEdit,
  onDelete,
}: TransactionTableProps) => {
  const { transactionPage, loading, filters, setFilters, fetchTransactions } =
    useTransactionStore();

  const transactions = transactionPage?.content || [];
  const totalElements = transactionPage?.totalElements || 0;
  const totalPages = transactionPage?.totalPages || 1;
  const currentPage = filters.page ?? 0;
  const pageSize = filters.size ?? 10;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return (
      d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }) +
      " • " +
      d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    );
  };

  return (
    <Card className="flex-1 min-h-0 flex flex-col border border-slate-200/80 bg-white shadow-xs rounded-2xl overflow-hidden">
      {/* Vùng cuộn duy nhất cho bảng dữ liệu (Tuân thủ Rule 2 AGENTS.md) */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <table className="w-full caption-bottom text-xs">
          <TableHeader className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200">
            <TableRow className="hover:bg-slate-50">
              <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider w-[28%]">
                Giao dịch
              </TableHead>
              <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider w-[15%]">
                Danh mục
              </TableHead>
              <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider w-[19%]">
                Ví thanh toán
              </TableHead>
              <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider w-[14%]">
                Thời gian
              </TableHead>
              <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right w-[14%]">
                Số tiền & Số dư
              </TableHead>
              <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right w-[10%]">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-11 w-full rounded-lg bg-slate-100" />
                  </TableCell>
                </TableRow>
              ))
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-60 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                    <ReceiptText className="size-10 text-slate-300" />
                    <p className="text-sm font-semibold text-slate-700">
                      Không tìm thấy giao dịch nào
                    </p>
                    <p className="text-xs text-slate-500">
                      Thử thay đổi bộ lọc hoặc bấm "Thêm giao dịch" để tạo mới.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((tx) => {
                const isIncome = tx.type === "INCOME";
                const isTransfer = tx.type === "TRANSFER";

                return (
                  <TableRow
                    key={tx.id}
                    className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-b-0"
                  >
                    {/* Cột 1: Giao dịch (Icon + Ghi chú + Đính kèm hóa đơn) */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "p-2 rounded-xl border shrink-0",
                            isTransfer
                              ? "bg-blue-50 text-blue-600 border-blue-100"
                              : isIncome
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : "bg-rose-50 text-rose-600 border-rose-100"
                          )}
                        >
                          {isTransfer ? (
                            <ArrowLeftRight className="size-4" />
                          ) : (
                            renderCategoryIcon(tx.categoryIcon, "size-4")
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              onClick={() => onViewDetail(tx)}
                              className="text-xs font-bold text-slate-900 truncate cursor-pointer hover:text-blue-600 transition-colors"
                            >
                              {tx.note ||
                                (isTransfer
                                  ? "Chuyển tiền nội bộ"
                                  : tx.categoryName || "Giao dịch")}
                            </span>
                            {tx.imageUrl && (
                              <button
                                type="button"
                                onClick={() => onViewDetail(tx)}
                                title="Có đính kèm ảnh hóa đơn — Nhấn để xem"
                                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-medium hover:bg-blue-100 cursor-pointer shrink-0"
                              >
                                <Paperclip className="size-2.5" />
                                <span>Hóa đơn</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Cột 2: Danh mục */}
                    <TableCell>
                      {isTransfer ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          Chuyển khoản
                        </span>
                      ) : (
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border",
                            isIncome
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                          )}
                        >
                          {tx.categoryName || "Chưa phân loại"}
                        </span>
                      )}
                    </TableCell>

                    {/* Cột 3: Ví thanh toán */}
                    <TableCell>
                      {isTransfer ? (
                        <div className="flex items-center gap-1 text-xs font-medium text-slate-700">
                          <span className="truncate max-w-24">{tx.walletName}</span>
                          <ArrowRight className="size-3 text-blue-500 shrink-0" />
                          <span className="truncate max-w-24 text-blue-700 font-semibold">
                            {tx.destinationWalletName || "Ví đích"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-slate-700">
                          {tx.walletName}
                        </span>
                      )}
                    </TableCell>

                    {/* Cột 4: Thời gian */}
                    <TableCell className="text-xs text-slate-500">
                      {formatDateTime(tx.transactionDate)}
                    </TableCell>

                    {/* Cột 5: Số tiền & Số dư sau giao dịch */}
                    <TableCell className="text-right">
                      <div
                        className={cn(
                          "text-xs font-extrabold",
                          isTransfer
                            ? "text-blue-600"
                            : isIncome
                            ? "text-emerald-600"
                            : "text-rose-600"
                        )}
                      >
                        {isIncome ? "+" : isTransfer ? "" : "-"}
                        {formatCurrency(tx.amount)}
                      </div>
                      {tx.balanceAfter !== undefined && tx.balanceAfter !== null && (
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Số dư: {formatCurrency(tx.balanceAfter)}
                        </div>
                      )}
                    </TableCell>

                    {/* Cột 6: Thao tác */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewDetail(tx)}
                          title="Xem chi tiết"
                          className="size-7 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <Eye className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(tx)}
                          title="Chỉnh sửa"
                          className="size-7 p-0 text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(tx)}
                          title="Xóa vào thùng rác"
                          className="size-7 p-0 text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </table>
      </div>

      {/* Footer Phân trang ghim cố định ở đáy (shrink-0) */}
      <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span>Hiển thị</span>
          <select
            value={pageSize}
            onChange={(e) => {
              const newSize = Number(e.target.value);
              setFilters({ size: newSize, page: 0 });
              fetchTransactions(0);
            }}
            className="h-7 px-2 border border-slate-200 rounded-md bg-white text-xs font-semibold cursor-pointer outline-none focus:border-blue-600"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>
            trong tổng số <strong className="text-slate-900">{totalElements}</strong> giao dịch
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage <= 0 || loading}
            onClick={() => fetchTransactions(currentPage - 1)}
            className="h-7 px-2.5 text-xs border-slate-200"
          >
            <ChevronLeft className="size-3.5 mr-1" />
            Trước
          </Button>
          <span className="px-2 text-xs font-semibold text-slate-700">
            Trang {currentPage + 1} / {Math.max(totalPages, 1)}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage + 1 >= totalPages || loading}
            onClick={() => fetchTransactions(currentPage + 1)}
            className="h-7 px-2.5 text-xs border-slate-200"
          >
            Sau
            <ChevronRight className="size-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </Card>
  );
};