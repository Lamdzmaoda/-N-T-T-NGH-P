import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { renderCategoryIcon } from "@/components/admin/content/CategoryTable";
import type { Transaction } from "@/types/transaction";
import { cn } from "@/lib/utils";
import {
  ArrowLeftRight,
  ArrowRight,
  Calendar,
  ExternalLink,
  Image as ImageIcon,
  Pencil,
  Wallet,
} from "lucide-react";

interface TransactionDetailDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (tx: Transaction) => void;
}

export const TransactionDetailDialog = ({
  transaction,
  open,
  onOpenChange,
  onEdit,
}: TransactionDetailDialogProps) => {
  if (!transaction) return null;

  const isIncome = transaction.type === "INCOME";
  const isTransfer = transaction.type === "TRANSFER";

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
      " lúc " +
      d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-white border-slate-200 max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900">
            Chi tiết giao dịch
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Thông tin đối soát số dư và chứng từ hóa đơn đính kèm.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto flex flex-col gap-4 py-2 pr-1">
          {/* Header số tiền nổi bật */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "p-3 rounded-xl border",
                  isTransfer
                    ? "bg-blue-50 text-blue-600 border-blue-200"
                    : isIncome
                    ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                    : "bg-rose-50 text-rose-600 border-rose-200"
                )}
              >
                {isTransfer ? (
                  <ArrowLeftRight className="size-5" />
                ) : (
                  renderCategoryIcon(transaction.categoryIcon, "size-5")
                )}
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500">
                  {isTransfer
                    ? "Chuyển tiền nội bộ"
                    : transaction.categoryName || "Giao dịch"}
                </div>
                <div
                  className={cn(
                    "text-xl font-black mt-0.5",
                    isTransfer
                      ? "text-blue-600"
                      : isIncome
                      ? "text-emerald-600"
                      : "text-rose-600"
                  )}
                >
                  {isIncome ? "+" : isTransfer ? "" : "-"}
                  {formatCurrency(transaction.amount)}
                </div>
              </div>
            </div>

            <span
              className={cn(
                "px-2.5 py-1 rounded-full text-[11px] font-bold border",
                isTransfer
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : isIncome
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-rose-50 text-rose-700 border-rose-200"
              )}
            >
              {isTransfer ? "Chuyển khoản" : isIncome ? "Thu nhập" : "Chi tiêu"}
            </span>
          </div>

          {/* Thông tin chi tiết */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl border border-slate-100 bg-white flex flex-col gap-1">
              <span className="text-slate-400 flex items-center gap-1">
                <Wallet className="size-3.5" /> Ví thực hiện
              </span>
              {isTransfer ? (
                <div className="font-semibold text-slate-800 flex items-center gap-1 flex-wrap">
                  <span>{transaction.walletName}</span>
                  <ArrowRight className="size-3 text-blue-500" />
                  <span className="text-blue-700">
                    {transaction.destinationWalletName}
                  </span>
                </div>
              ) : (
                <span className="font-semibold text-slate-800">
                  {transaction.walletName}
                </span>
              )}
            </div>

            <div className="p-3 rounded-xl border border-slate-100 bg-white flex flex-col gap-1">
              <span className="text-slate-400 flex items-center gap-1">
                <Calendar className="size-3.5" /> Thời gian giao dịch
              </span>
              <span className="font-semibold text-slate-800">
                {formatDateTime(transaction.transactionDate)}
              </span>
            </div>

            <div className="p-3 rounded-xl border border-slate-100 bg-white flex flex-col gap-1">
              <span className="text-slate-400">Số dư ví sau giao dịch</span>
              <span className="font-bold text-slate-900">
                {formatCurrency(transaction.balanceAfter)}
              </span>
            </div>

            <div className="p-3 rounded-xl border border-slate-100 bg-white flex flex-col gap-1">
              <span className="text-slate-400">Ghi chú</span>
              <span className="font-medium text-slate-800">
                {transaction.note || "Không có ghi chú"}
              </span>
            </div>
          </div>

          {/* Ảnh hóa đơn Cloudinary (nếu có) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <ImageIcon className="size-4 text-blue-600" /> Ảnh hóa đơn / Chứng từ
              </span>
              {transaction.imageUrl && (
                <a
                  href={transaction.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1"
                >
                  Mở ảnh gốc <ExternalLink className="size-3" />
                </a>
              )}
            </div>

            {transaction.imageUrl ? (
              <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center max-h-64">
                <img
                  src={transaction.imageUrl}
                  alt="Hóa đơn giao dịch"
                  className="max-h-64 w-auto object-contain"
                />
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                Giao dịch này không có ảnh hóa đơn đính kèm.
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-slate-200 text-slate-700"
          >
            Đóng
          </Button>
          <Button
            type="button"
            onClick={() => {
              onOpenChange(false);
              onEdit(transaction);
            }}
            className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Pencil className="size-3.5" /> Chỉnh sửa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};