import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWalletStore } from "@/stores/useWalletStore";
import type { Wallet, WalletType } from "@/types/wallet";
import { cn } from "@/lib/utils";
import { 
  Banknote, 
  Landmark, 
  Smartphone, 
  CreditCard, 
  PiggyBank,
  Check
} from "lucide-react";

// Chỉ gồm 5 loại ví được Backend hỗ trợ
const WALLET_TYPE_OPTIONS: { type: WalletType; label: string; desc: string; icon: typeof Banknote }[] = [
  { type: "CASH", label: "Tiền mặt", desc: "Tiền trong túi, ví cá nhân", icon: Banknote },
  { type: "BANK", label: "Tài khoản ngân hàng", desc: "Vietcombank, MB, Techcombank...", icon: Landmark },
  { type: "E_WALLET", label: "Ví điện tử", desc: "MoMo, ZaloPay, Viettel Money...", icon: Smartphone },
  { type: "SAVING", label: "Sổ tiết kiệm", desc: "Quỹ tích lũy định kỳ", icon: PiggyBank },
  { type: "CREDIT", label: "Thẻ tín dụng", desc: "Thẻ chi tiêu trước trả sau", icon: CreditCard },
];

const walletUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Tên ví không được để trống")
    .max(100, "Tên ví tối đa 100 ký tự"),
  type: z.enum(["CASH", "BANK", "E_WALLET", "CREDIT", "SAVING"], {
    message: "Vui lòng chọn loại ví",
  }),
  includeInTotal: z.boolean(),
});

type WalletUpdateFormValues = z.infer<typeof walletUpdateSchema>;

interface WalletEditDialogProps {
  wallet: Wallet | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WalletEditDialog = ({ wallet, open, onOpenChange }: WalletEditDialogProps) => {
  const { updateWallet, submitting } = useWalletStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<WalletUpdateFormValues>({
    resolver: zodResolver(walletUpdateSchema),
    defaultValues: {
      name: "",
      type: "CASH",
      includeInTotal: true,
    },
  });

  useEffect(() => {
    if (wallet) {
      reset({
        name: wallet.name,
        type: wallet.type,
        includeInTotal: wallet.includeInTotal,
      });
    }
  }, [wallet, reset]);

  const selectedType = watch("type");
  const includeInTotal = watch("includeInTotal");

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const onSubmit = async (values: WalletUpdateFormValues) => {
    if (!wallet) return;
    const success = await updateWallet(wallet.id, values);
    if (success) {
      handleClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-white border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900">Cập nhật ví</DialogTitle>
          <DialogDescription className="text-slate-500 text-xs">
            Chỉnh sửa tên hiển thị hoặc trạng thái tính vào tổng tài sản.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 py-2">
          {/* Tên ví */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-name" className="text-xs font-semibold text-slate-700">
              Tên ví <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="edit-name"
              placeholder="VD: Ví chính, MB Bank..."
              className="border-slate-200 focus-visible:ring-blue-600"
              {...register("name")}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <span className="text-xs text-rose-500 font-medium">{errors.name.message}</span>
            )}
          </div>

          {/* Chọn Loại ví trực quan */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-semibold text-slate-700">
              Loại ví <span className="text-rose-500">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-2.5">
              {WALLET_TYPE_OPTIONS.map((item) => {
                const IconComponent = item.icon;
                const isSelected = selectedType === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setValue("type", item.type, { shouldValidate: true })}
                    className={cn(
                      "flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer",
                      isSelected
                        ? "border-blue-600 bg-blue-50/70 text-blue-900 shadow-xs ring-1 ring-blue-600/30"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:border-slate-300"
                    )}
                  >
                    <div
                      className={cn(
                        "p-2 rounded-lg shrink-0 transition-colors",
                        isSelected 
                          ? "bg-blue-600 text-white shadow-xs" 
                          : "bg-slate-100 text-slate-500"
                      )}
                    >
                      <IconComponent className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold truncate">{item.label}</span>
                        {isSelected && <Check className="size-3.5 text-blue-600" />}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">{item.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.type && (
              <span className="text-xs text-rose-500 font-medium">{errors.type.message}</span>
            )}
          </div>

          {/* Tính vào tổng tài sản - Nút gạt xanh sáng */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/70">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold text-slate-800">Tính vào tổng tài sản</span>
              <span className="text-[11px] text-slate-500">
                Bao gồm số dư ví này vào tổng tài sản hiển thị ở Dashboard
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={includeInTotal}
              onClick={() => setValue("includeInTotal", !includeInTotal)}
              className={cn(
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors",
                includeInTotal ? "bg-blue-600" : "bg-slate-300"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none block size-4 rounded-full bg-white shadow-xs transition-transform",
                  includeInTotal ? "translate-x-4" : "translate-x-0.5"
                )}
              />
            </button>
          </div>

          <DialogFooter className="mt-2 flex items-center justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose} 
              disabled={submitting}
              className="border-slate-200 text-slate-700 hover:bg-slate-100"
            >
              Hủy
            </Button>
            <Button 
              type="submit" 
              disabled={submitting} 
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-xs shadow-blue-500/20"
            >
              {submitting ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};