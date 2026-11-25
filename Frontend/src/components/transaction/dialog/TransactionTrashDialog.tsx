import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTransactionStore } from "@/stores/useTransactionStore";
import { cn } from "@/lib/utils";
import { ArrowLeftRight, Inbox, RotateCcw, Trash2 } from "lucide-react";

interface TransactionTrashDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TransactionTrashDialog = ({
  open,
  onOpenChange,
}: TransactionTrashDialogProps) => {
  const {
    trashTransactions,
    submitting,
    fetchTrashTransactions,
    restoreTransaction,
    permanentDeleteTransaction,
  } = useTransactionStore();

  useEffect(() => {
    if (open) {
      fetchTrashTransactions();
    }
  }, [open, fetchTrashTransactions]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);

  const handlePermanentDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Xóa vĩnh viễn giao dịch này? Dữ liệu sẽ không thể khôi phục lại!"
    );
    if (!confirmed) return;
    await permanentDeleteTransaction(id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-white border-slate-200 max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900">
            Thùng rác giao dịch
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Khôi phục giao dịch đã xóa (tự động cập nhật lại số dư ví) hoặc xóa vĩnh viễn.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto py-2 flex flex-col gap-2.5 pr-1">
          {trashTransactions.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400">
              <Inbox className="size-10 text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">Thùng rác trống</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Không có giao dịch nào đang nằm trong thùng rác.
              </p>
            </div>
          ) : (
            trashTransactions.map((tx) => {
              const isIncome = tx.type === "INCOME";
              const isTransfer = tx.type === "TRANSFER";

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50"
                >
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      {isTransfer && (
                        <ArrowLeftRight className="size-3.5 text-blue-600 shrink-0" />
                      )}
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {tx.note || tx.categoryName || "Giao dịch đã xóa"}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-0.5">
                      {tx.walletName} •{" "}
                      {new Date(tx.transactionDate).toLocaleDateString("vi-VN")}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
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
                    </span>

                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={submitting}
                        onClick={() => restoreTransaction(tx.id)}
                        title="Khôi phục"
                        className="h-7 px-2 text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <RotateCcw className="size-3 mr-1" /> Khôi phục
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={submitting}
                        onClick={() => handlePermanentDelete(tx.id)}
                        title="Xóa vĩnh viễn"
                        className="h-7 w-7 p-0 text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <DialogFooter className="pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-slate-200 text-slate-700"
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};