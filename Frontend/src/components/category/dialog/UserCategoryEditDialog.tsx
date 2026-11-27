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
import { useCategoryStore } from "@/stores/useCategoryStore";
import { renderCategoryIcon } from "@/components/admin/content/CategoryTable";
import type { Category } from "@/types/category";
import { cn } from "@/lib/utils";

const PRESET_ICONS = [
  "utensils",
  "shopping-bag",
  "car",
  "file-invoice",
  "gamepad",
  "heart-pulse",
  "graduation-cap",
  "wallet",
  "gift",
  "trending-up",
  "coins",
  "tag",
];

const PRESET_COLORS = [
  "#2563EB",
  "#10B981",
  "#F43F5E",
  "#F59E0B",
  "#8B5CF6",
  "#06B6D4",
  "#EC4899",
  "#6366F1",
  "#14B8A6",
  "#64748B",
];

const userCategoryEditSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Tên danh mục phải có ít nhất 2 ký tự")
    .max(50, "Tên danh mục tối đa 50 ký tự"),
  type: z.enum(["EXPENSE", "INCOME"], {
    message: "Vui lòng chọn loại danh mục",
  }),
  icon: z.string().min(1, "Vui lòng chọn biểu tượng"),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Mã màu phải đúng định dạng HEX (VD: #2563EB)"),
});

type UserCategoryEditValues = z.infer<typeof userCategoryEditSchema>;

interface UserCategoryEditDialogProps {
  category: Category | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserCategoryEditDialog = ({
  category,
  open,
  onOpenChange,
}: UserCategoryEditDialogProps) => {
  const { updateCategory, submitting } = useCategoryStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UserCategoryEditValues>({
    resolver: zodResolver(userCategoryEditSchema),
    defaultValues: {
      name: "",
      type: "EXPENSE",
      icon: "utensils",
      color: "#2563EB",
    },
  });

  useEffect(() => {
    if (category && open) {
      reset({
        name: category.name,
        type: category.type,
        icon: category.icon || "tag",
        color: category.color || "#2563EB",
      });
    }
  }, [category, open, reset]);

  const selectedIcon = watch("icon");
  const selectedColor = watch("color");
  const selectedType = watch("type");
  const previewName = watch("name");

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const onSubmit = async (values: UserCategoryEditValues) => {
    if (!category) return;
    const success = await updateCategory(category.id, values);
    if (success) {
      handleClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900">
            Cập nhật danh mục
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Chỉnh sửa tên, biểu tượng hoặc màu sắc của danh mục cá nhân.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 py-1">
          {/* Xem trước Live Preview */}
          <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/70">
            <div
              className="size-10 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0"
              style={{ backgroundColor: selectedColor || "#2563EB" }}
            >
              {renderCategoryIcon(selectedIcon, "size-5")}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-slate-900 truncate">
                {previewName?.trim() || "Tên danh mục"}
              </span>
              <span
                className={cn(
                  "text-[11px] font-semibold",
                  selectedType === "EXPENSE" ? "text-rose-600" : "text-emerald-600"
                )}
              >
                {selectedType === "EXPENSE" ? "Khoản chi tiêu" : "Khoản thu nhập"}
              </span>
            </div>
          </div>

          {/* Tên danh mục */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-cat-name" className="text-xs font-semibold text-slate-700">
              Tên danh mục <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-cat-name"
              className="border-slate-200 focus-visible:ring-blue-600 text-xs"
              {...register("name")}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <span className="text-xs text-destructive">{errors.name.message}</span>
            )}
          </div>

          {/* Loại danh mục */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold text-slate-700">Loại danh mục</Label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setValue("type", "EXPENSE", { shouldValidate: true })}
                className={cn(
                  "py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                  selectedType === "EXPENSE"
                    ? "border-rose-500 bg-rose-50 text-rose-700 shadow-xs"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                )}
              >
                Khoản chi tiêu
              </button>
              <button
                type="button"
                onClick={() => setValue("type", "INCOME", { shouldValidate: true })}
                className={cn(
                  "py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                  selectedType === "INCOME"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-xs"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                )}
              >
                Khoản thu nhập
              </button>
            </div>
          </div>

          {/* Chọn Icon */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold text-slate-700">Biểu tượng</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setValue("icon", icon)}
                  className={cn(
                    "size-8 rounded-lg flex items-center justify-center border transition-all cursor-pointer",
                    selectedIcon === icon
                      ? "border-blue-600 bg-blue-50 text-blue-600 scale-105 shadow-xs"
                      : "border-slate-200 text-slate-500 hover:bg-slate-50"
                  )}
                >
                  {renderCategoryIcon(icon, "size-4")}
                </button>
              ))}
            </div>
          </div>

          {/* Chọn Màu sắc */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold text-slate-700">Màu sắc nhận diện</Label>
            <div className="flex flex-wrap items-center gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setValue("color", c, { shouldValidate: true })}
                  className={cn(
                    "size-6 rounded-full border-2 transition-transform cursor-pointer",
                    selectedColor === c ? "border-slate-900 scale-110" : "border-transparent"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
              <Input
                type="text"
                placeholder="#2563EB"
                {...register("color")}
                className="w-24 h-7 text-xs ml-auto font-mono border-slate-200"
              />
            </div>
            {errors.color && (
              <span className="text-xs text-destructive">{errors.color.message}</span>
            )}
          </div>

          <DialogFooter className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
              className="border-slate-200 text-slate-700"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {submitting ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};