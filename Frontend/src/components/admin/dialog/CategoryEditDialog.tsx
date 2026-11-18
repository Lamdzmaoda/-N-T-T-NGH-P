import React, { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Category } from "@/types/category";
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
import { categoryService } from "@/services/categoryService";
import { renderCategoryIcon } from "../content/CategoryTable";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errorHandler";

const PRESET_ICONS = [
  "utensils", "shopping-bag", "car", "file-invoice", "gamepad",
  "heart-pulse", "graduation-cap", "wallet", "gift", "trending-up", "coins"
];

const PRESET_COLORS = [
  "#FF5722", "#E91E63", "#2196F3", "#FF9800", "#9C27B0",
  "#4CAF50", "#00BCD4", "#FFC107", "#3F51B5", "#009688"
];

const categorySchema = z.object({
  name: z.string().min(2, "Tên danh mục phải có ít nhất 2 ký tự"),
  type: z.enum(["EXPENSE", "INCOME"]),
  icon: z.string().min(1, "Vui lòng chọn icon"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Mã màu phải ở định dạng HEX (vd: #FF5722)"),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryEditDialogProps {
  category: Category | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CategoryEditDialog = ({
  category,
  open,
  onOpenChange,
  onSuccess,
}: CategoryEditDialogProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
  });

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        type: category.type,
        icon: category.icon || "utensils",
        color: category.color || "#FF5722",
      });
    }
  }, [category, reset]);

  const selectedIcon = watch("icon");
  const selectedColor = watch("color");
  const selectedType = watch("type");

  const onSubmit = async (data: CategoryFormValues) => {
    if (!category) return;
    try {
      await categoryService.updateAdminCategory(category.id, data);
      toast.success(`Đã cập nhật danh mục: ${data.name}`);
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error(error);
      toast.error(getErrorMessage(error)  || "Không thể cập nhật danh mục");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">Chỉnh sửa danh mục hệ thống</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin danh mục mẫu dùng chung.
          </DialogDescription>
        </DialogHeader>

        {category && (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 py-2 text-xs">
            <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg border border-border">
              <div
                className="size-10 rounded-lg flex items-center justify-center text-white shadow-xs"
                style={{ backgroundColor: selectedColor || "#3b82f6" }}
              >
                {renderCategoryIcon(selectedIcon, "size-5")}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-foreground">
                  {watch("name") || category.name}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {selectedType === "EXPENSE" ? "Khoản chi tiêu" : "Khoản thu nhập"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-foreground">
                Tên danh mục <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="vd: Du lịch, Cà phê..."
                {...register("name")}
                className="h-8 text-xs"
              />
              {errors.name && (
                <span className="text-[11px] font-medium text-destructive">
                  {errors.name.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-foreground">Loại danh mục</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={selectedType === "EXPENSE" ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => setValue("type", "EXPENSE")}
                >
                  Khoản chi
                </Button>
                <Button
                  type="button"
                  variant={selectedType === "INCOME" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setValue("type", "INCOME")}
                >
                  Khoản thu
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-foreground">Chọn Icon</label>
              <div className="flex flex-wrap gap-2">
                {PRESET_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setValue("icon", icon)}
                    className={`size-8 rounded-md flex items-center justify-center border transition-all ${
                      selectedIcon === icon
                        ? "border-primary bg-primary/10 text-primary scale-105"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {renderCategoryIcon(icon, "size-4")}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-foreground">Chọn Màu sắc</label>
              <div className="flex flex-wrap gap-2 items-center">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setValue("color", c)}
                    className={`size-6 rounded-full border-2 transition-all ${
                      selectedColor === c ? "border-foreground scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
                <Input
                  type="text"
                  placeholder="#FF5722"
                  {...register("color")}
                  className="w-24 h-7 text-xs ml-auto font-mono"
                />
              </div>
            </div>

            <DialogFooter className="mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};