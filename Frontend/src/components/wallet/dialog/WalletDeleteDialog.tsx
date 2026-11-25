import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWalletStore } from "@/stores/useWalletStore";
import type { Wallet } from "@/types/wallet";
import { AlertTriangle } from "lucide-react";

interface WalletDeleteDialogProps {
  wallet: Wallet | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WalletDeleteDialog = ({
  wallet,
  open,
  onOpenChange,
}: WalletDeleteDialogProps) => {
  const { deleteWallet, submitting } = useWalletStore();

  const handleDelete = async () => {
    if (!wallet) return;
    const success = await deleteWallet(wallet.id);
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-destructive/10 text-destructive shrink-0">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Xác nhận xóa ví</DialogTitle>
              <DialogDescription className="mt-1 text-xs">
                Hành động này sẽ ngưng kích hoạt ví và ẩn khỏi danh sách.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-2 text-xs text-muted-foreground leading-relaxed">
          Bạn có chắc chắn muốn xóa ví{" "}
          <span className="font-semibold text-foreground">"{wallet?.name}"</span>?
          Toàn bộ lịch sử các giao dịch trước đây liên quan đến ví này vẫn sẽ được lưu trữ an toàn.
        </div>

        <DialogFooter className="mt-2 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={submitting}
          >
            {submitting ? "Đang xóa..." : "Xác nhận xóa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};