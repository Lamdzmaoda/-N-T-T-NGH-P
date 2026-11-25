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
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWalletStore } from "@/stores/useWalletStore";
import { useTransactionStore } from "@/stores/useTransactionStore";
import { useCategoryStore } from "@/stores/useCategoryStore";
import { transactionService } from "@/services/transactionService";
import { toast } from "sonner";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  ImagePlus,
  Loader2,
  Trash2,
} from "lucide-react";

type TabType = "EXPENSE" | "INCOME" | "TRANSFER";

const addTransactionSchema = z
  .object({
    tabType: z.enum(["EXPENSE", "INCOME", "TRANSFER"]),
    amount: z
      .number({ message: "Vui lòng nhập số tiền hợp lệ" })
      .gt(0, "Số tiền phải lớn hơn 0"),
    walletId: z.string(),
    destinationWalletId: z.string(),
    categoryId: z.string(),
    transactionDate: z.string().min(1, "Vui lòng chọn thời gian"),
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
    if (data.tabType === "TRANSFER") {
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

type AddTransactionFormValues = z.infer<typeof addTransactionSchema>;

interface AddTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getLocalDatetimeString = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
};

const AddTransactionModal = ({ open, onOpenChange }: AddTransactionModalProps) => {
  const { wallets, fetchMyWallets } = useWalletStore();
  const { categories, fetchAllCategories } = useCategoryStore();
  const { createTransaction, transferMoney, submitting } = useTransactionStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AddTransactionFormValues>({
    resolver: zodResolver(addTransactionSchema),
    defaultValues: {
      tabType: "EXPENSE",
      amount: 0,
      walletId: "",
      destinationWalletId: "",
      categoryId: "",
      transactionDate: getLocalDatetimeString(),
      note: "",
      imageUrl: "",
    },
  });

  const activeTab = watch("tabType");
  const currentWalletId = watch("walletId");
  const currentDestWalletId = watch("destinationWalletId");
  const currentImageUrl = watch("imageUrl");

  useEffect(() => {
    if (open) {
      fetchMyWallets();
      fetchAllCategories();
      setValue("transactionDate", getLocalDatetimeString());
    }
  }, [open, fetchMyWallets, fetchAllCategories, setValue]);

  useEffect(() => {
    if (wallets.length > 0 && !currentWalletId) {
      setValue("walletId", wallets[0].id);
      if (wallets.length > 1 && !currentDestWalletId) {
        setValue("destinationWalletId", wallets[1].id);
      }
    }
  }, [wallets, currentWalletId, currentDestWalletId, setValue]);

  const filteredCategories = categories.filter((c) => c.type === activeTab);

  const handleClose = () => {
    reset({
      tabType: "EXPENSE",
      amount: 0,
      walletId: wallets[0]?.id || "",
      destinationWalletId: wallets[1]?.id || "",
      categoryId: "",
      transactionDate: getLocalDatetimeString(),
      note: "",
      imageUrl: "",
    });
    onOpenChange(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const url = await transactionService.uploadInvoice(file);
      setValue("imageUrl", url);
      toast.success("Đã đính kèm ảnh hóa đơn");
    } catch {
      toast.error("Tải ảnh hóa đơn thất bại");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (values: AddTransactionFormValues) => {
    const formattedDate =
      values.transactionDate.length === 16
        ? `${values.transactionDate}:00`
        : values.transactionDate;

    try {
      if (values.tabType === "TRANSFER") {
        await transferMoney({
          sourceWalletId: values.walletId,
          destinationWalletId: values.destinationWalletId,
          amount: values.amount,
          transactionDate: formattedDate,
          note: values.note.trim() || undefined,
        });
      } else {
        await createTransaction({
          walletId: values.walletId,
          categoryId: values.categoryId,
          amount: values.amount,
          type: values.tabType,
          transactionDate: formattedDate,
          note: values.note.trim() || undefined,
          imageUrl: values.imageUrl || undefined,
        });
      }
      handleClose();
    } catch {
      // Lỗi đã được toast ở Store
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg p-6 rounded-2xl bg-white border-slate-200 max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900">
            Thêm giao dịch mới
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Ghi chép thu chi hàng ngày hoặc chuyển tiền nội bộ giữa các ví.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(val) => {
            setValue("tabType", val as TabType);
            setValue("categoryId", "");
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 h-10 p-1 rounded-xl bg-slate-100">
            <TabsTrigger value="EXPENSE" className="text-xs gap-1.5 rounded-lg">
              <ArrowDownLeft className="size-3.5 text-rose-500" /> Chi tiêu
            </TabsTrigger>
            <TabsTrigger value="INCOME" className="text-xs gap-1.5 rounded-lg">
              <ArrowUpRight className="size-3.5 text-emerald-500" /> Thu nhập
            </TabsTrigger>
            <TabsTrigger value="TRANSFER" className="text-xs gap-1.5 rounded-lg">
              <ArrowLeftRight className="size-3.5 text-blue-500" /> Chuyển tiền
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto flex flex-col gap-4 py-1 pr-1"
        >
          {/* Số tiền */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="add-amount" className="text-xs font-semibold text-slate-700">
              Số tiền (VNĐ) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="add-amount"
              type="number"
              placeholder="0"
              className="border-slate-200 focus-visible:ring-blue-600 text-base font-bold"
              {...register("amount", { valueAsNumber: true })}
              aria-invalid={!!errors.amount}
            />
            {errors.amount && (
              <span className="text-xs text-destructive">{errors.amount.message}</span>
            )}
          </div>

          {/* Ví & Danh mục / Ví nhận */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="add-wallet" className="text-xs font-semibold text-slate-700">
                {activeTab === "TRANSFER" ? "Từ ví" : "Ví thanh toán"}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <select
                id="add-wallet"
                {...register("walletId")}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              >
                <option value="">-- Chọn ví --</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({new Intl.NumberFormat("vi-VN").format(w.balance)} đ)
                  </option>
                ))}
              </select>
              {errors.walletId && (
                <span className="text-xs text-destructive">{errors.walletId.message}</span>
              )}
            </div>

            {activeTab === "TRANSFER" ? (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="add-dest-wallet" className="text-xs font-semibold text-slate-700">
                  Đến ví <span className="text-destructive">*</span>
                </Label>
                <select
                  id="add-dest-wallet"
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
                <Label htmlFor="add-category" className="text-xs font-semibold text-slate-700">
                  Danh mục <span className="text-destructive">*</span>
                </Label>
                <select
                  id="add-category"
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

          {/* Thời gian & Ghi chú */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="add-date" className="text-xs font-semibold text-slate-700">
                Thời gian <span className="text-destructive">*</span>
              </Label>
              <Input
                id="add-date"
                type="datetime-local"
                className="border-slate-200 focus-visible:ring-blue-600 text-xs"
                {...register("transactionDate")}
                aria-invalid={!!errors.transactionDate}
              />
              {errors.transactionDate && (
                <span className="text-xs text-destructive">
                  {errors.transactionDate.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="add-note" className="text-xs font-semibold text-slate-700">
                Ghi chú
              </Label>
              <Input
                id="add-note"
                placeholder="VD: Ăn trưa, Tiền điện..."
                className="border-slate-200 focus-visible:ring-blue-600 text-xs"
                {...register("note")}
                aria-invalid={!!errors.note}
              />
              {errors.note && (
                <span className="text-xs text-destructive">{errors.note.message}</span>
              )}
            </div>
          </div>

          {/* Upload Ảnh Hóa đơn Cloudinary */}
          {activeTab !== "TRANSFER" && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Đính kèm ảnh hóa đơn (tùy chọn)
              </Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {currentImageUrl ? (
                <div className="flex items-center justify-between p-2 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={currentImageUrl}
                      alt="Hóa đơn"
                      className="size-12 rounded-lg object-cover border border-slate-200"
                    />
                    <span className="text-xs font-medium text-emerald-700">
                      Đã đính kèm ảnh hóa đơn
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setValue("imageUrl", "")}
                    className="h-8 text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={uploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-slate-300 text-xs text-slate-600 hover:bg-slate-50 hover:border-blue-400 transition-colors cursor-pointer"
                >
                  {uploadingImage ? (
                    <Loader2 className="size-4 animate-spin text-blue-600" />
                  ) : (
                    <ImagePlus className="size-4 text-blue-600" />
                  )}
                  <span>
                    {uploadingImage ? "Đang tải lên Cloudinary..." : "Chọn ảnh hóa đơn"}
                  </span>
                </button>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitting || uploadingImage}
              className="border-slate-200 text-slate-700"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={submitting || uploadingImage}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-1.5" /> Đang lưu...
                </>
              ) : (
                "Lưu giao dịch"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTransactionModal;