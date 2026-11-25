import { useEffect, useRef, useState } from "react";
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
import { useTransactionStore } from "@/stores/useTransactionStore";
import { useWalletStore } from "@/stores/useWalletStore";
import { useCategoryStore } from "@/stores/useCategoryStore";
import { transactionService } from "@/services/transactionService";
import type { Transaction } from "@/types/transaction";
import { toast } from "sonner";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";

const editTransactionSchema = z
  .object({
    isTransfer: z.boolean(),
    amount: z
      .number({ message: "Số tiền phải là con số hợp lệ" })
      .gt(0, "Số tiền phải lớn hơn 0"),
    walletId: z.string(),
    destinationWalletId: z.string(),
    categoryId: z.string(),
    transactionDate: z.string().min(1, "Vui lòng chọn thời gian giao dịch"),
    note: z.string().max(255, "Ghi chú tối đa 255 ký tự"),
    imageUrl: z.string(),
  })
  .superRefine((data, ctx) => {
    if (!data.walletId) {
      ctx.addIssue({
        code: "custom",
        path: ["walletId"],
        message: "Vui lòng chọn ví",
      });
    }
    if (data.isTransfer) {
      if (!data.destinationWalletId) {
        ctx.addIssue({
          code: "custom",
          path: ["destinationWalletId"],
          message: "Vui lòng chọn ví nhận",
        });
      }
      if (data.walletId && data.walletId === data.destinationWalletId) {
        ctx.addIssue({
          code: "custom",
          path: ["destinationWalletId"],
          message: "Ví chuyển và ví nhận không được trùng nhau",
        });
      }
    } else if (!data.categoryId) {
      ctx.addIssue({
        code: "custom",
        path: ["categoryId"],
        message: "Vui lòng chọn danh mục",
      });
    }
  });

type EditTransactionFormValues = z.infer<typeof editTransactionSchema>;

interface TransactionEditDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const toLocalDatetimeInput = (dateStr?: string) => {
  if (!dateStr) return "";
  return dateStr.slice(0, 16);
};

export const TransactionEditDialog = ({
  transaction,
  open,
  onOpenChange,
}: TransactionEditDialogProps) => {
  const { updateTransaction, updateTransfer, submitting } = useTransactionStore();
  const { wallets } = useWalletStore();
  const { categories } = useCategoryStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const isTransfer = transaction?.type === "TRANSFER";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EditTransactionFormValues>({
    resolver: zodResolver(editTransactionSchema),
    defaultValues: {
      isTransfer: false,
      amount: 0,
      walletId: "",
      destinationWalletId: "",
      categoryId: "",
      transactionDate: "",
      note: "",
      imageUrl: "",
    },
  });

  useEffect(() => {
    if (transaction && open) {
      reset({
        isTransfer: transaction.type === "TRANSFER",
        amount: transaction.amount,
        walletId: transaction.walletId || "",
        destinationWalletId: transaction.destinationWalletId || "",
        categoryId: transaction.categoryId || "",
        transactionDate: toLocalDatetimeInput(transaction.transactionDate),
        note: transaction.note || "",
        imageUrl: transaction.imageUrl || "",
      });
    }
  }, [transaction, open, reset]);

  const currentImageUrl = watch("imageUrl");

  const filteredCategories = categories.filter(
    (c) => c.type === transaction?.type
  );

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const url = await transactionService.uploadInvoice(file);
      setValue("imageUrl", url, { shouldDirty: true });
      toast.success("Đã tải ảnh hóa đơn lên thành công");
    } catch {
      toast.error("Không thể tải ảnh hóa đơn");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (values: EditTransactionFormValues) => {
    if (!transaction) return;
    const formattedDate =
      values.transactionDate.length === 16
        ? `${values.transactionDate}:00`
        : values.transactionDate;

    let success = false;
    if (values.isTransfer) {
      success = await updateTransfer(transaction.id, {
        sourceWalletId: values.walletId,
        destinationWalletId: values.destinationWalletId,
        amount: values.amount,
        transactionDate: formattedDate,
        note: values.note.trim() || undefined,
      });
    } else {
      success = await updateTransaction(transaction.id, {
        walletId: values.walletId,
        categoryId: values.categoryId,
        amount: values.amount,
        transactionDate: formattedDate,
        note: values.note.trim() || undefined,
        imageUrl: values.imageUrl || undefined,
      });
    }

    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-white border-slate-200 max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900">
            {isTransfer ? "Cập nhật chuyển tiền" : "Chỉnh sửa giao dịch"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Số dư ví liên quan sẽ tự động được hoàn tác và tính lại chính xác.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto flex flex-col gap-4 py-2 pr-1"
        >
          {/* Số tiền */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-amount" className="text-xs font-semibold text-slate-700">
              Số tiền (VNĐ) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-amount"
              type="number"
              className="border-slate-200 focus-visible:ring-blue-600 font-bold"
              {...register("amount", { valueAsNumber: true })}
              aria-invalid={!!errors.amount}
            />
            {errors.amount && (
              <span className="text-xs text-destructive">{errors.amount.message}</span>
            )}
          </div>

          {/* Ví nguồn / Ví thanh toán */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-wallet" className="text-xs font-semibold text-slate-700">
                {isTransfer ? "Từ ví" : "Ví thanh toán"}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <select
                id="edit-wallet"
                {...register("walletId")}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              >
                <option value="">-- Chọn ví --</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
              {errors.walletId && (
                <span className="text-xs text-destructive">{errors.walletId.message}</span>
              )}
            </div>

            {isTransfer ? (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-dest-wallet" className="text-xs font-semibold text-slate-700">
                  Đến ví <span className="text-destructive">*</span>
                </Label>
                <select
                  id="edit-dest-wallet"
                  {...register("destinationWalletId")}
                  className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                >
                  <option value="">-- Chọn ví nhận --</option>
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
                {errors.destinationWalletId && (
                  <span className="text-xs text-destructive">
                    {errors.destinationWalletId.message}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-category" className="text-xs font-semibold text-slate-700">
                  Danh mục <span className="text-destructive">*</span>
                </Label>
                <select
                  id="edit-category"
                  {...register("categoryId")}
                  className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                >
                  <option value="">-- Chọn danh mục --</option>
                  {filteredCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <span className="text-xs text-destructive">{errors.categoryId.message}</span>
                )}
              </div>
            )}
          </div>

          {/* Thời gian */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-date" className="text-xs font-semibold text-slate-700">
              Thời gian giao dịch <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-date"
              type="datetime-local"
              className="border-slate-200 focus-visible:ring-blue-600"
              {...register("transactionDate")}
              aria-invalid={!!errors.transactionDate}
            />
            {errors.transactionDate && (
              <span className="text-xs text-destructive">
                {errors.transactionDate.message}
              </span>
            )}
          </div>

          {/* Ghi chú */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-note" className="text-xs font-semibold text-slate-700">
              Ghi chú
            </Label>
            <Input
              id="edit-note"
              placeholder="Nhập ghi chú..."
              className="border-slate-200 focus-visible:ring-blue-600"
              {...register("note")}
              aria-invalid={!!errors.note}
            />
            {errors.note && (
              <span className="text-xs text-destructive">{errors.note.message}</span>
            )}
          </div>

          {/* Upload / Thay thế ảnh hóa đơn (chỉ cho Thu/Chi) */}
          {!isTransfer && (
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-semibold text-slate-700">
                Ảnh hóa đơn đính kèm
              </Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {currentImageUrl ? (
                <div className="relative rounded-xl border border-slate-200 p-2 bg-slate-50 flex items-center justify-between gap-3">
                  <img
                    src={currentImageUrl}
                    alt="Hóa đơn"
                    className="h-16 w-16 object-cover rounded-lg border border-slate-200"
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs h-8 border-slate-200"
                    >
                      {uploadingImage ? (
                        <Loader2 className="size-3.5 animate-spin mr-1" />
                      ) : null}
                      Đổi ảnh
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setValue("imageUrl", "")}
                      className="text-xs h-8 text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={uploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-300 text-xs text-slate-600 hover:bg-slate-50 hover:border-blue-400 transition-colors cursor-pointer"
                >
                  {uploadingImage ? (
                    <Loader2 className="size-4 animate-spin text-blue-600" />
                  ) : (
                    <ImagePlus className="size-4 text-blue-600" />
                  )}
                  <span>
                    {uploadingImage ? "Đang tải ảnh lên..." : "Nhấn để tải ảnh hóa đơn"}
                  </span>
                </button>
              )}
            </div>
          )}

          <DialogFooter className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting || uploadingImage}
              className="border-slate-200 text-slate-700"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={submitting || uploadingImage}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {submitting ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};