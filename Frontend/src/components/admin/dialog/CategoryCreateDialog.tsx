import React from "react";
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

interface CategoryCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CategoryCreateDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: CategoryCreateDialogProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      type: "EXPENSE",
      icon: "utensils",
      color: "#FF5722",
    },
  });

  const selectedIcon = watch("icon");
  const selectedColor = watch("color");
  const selectedType = watch("type");

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      await categoryService.createAdminCategory(data);
      toast.success(`Đã thêm danh mục: ${data.name}`);
      reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error(error);
      toast.error(getErrorMessage(error) || "Không thể tạo danh mục");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">Thêm danh mục hệ thống</DialogTitle>
          <DialogDescription>
            Tạo danh mục chi tiêu mẫu dùng chung cho toàn bộ người dùng FinFlow.
          </DialogDescription>
        </DialogHeader>

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
                {watch("name") || "Tên danh mục mẫu"}
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
              placeholder="vd: Du lịch, Cà phê, Tiền điện..."
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
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? "Đang tạo..." : "Xác nhận tạo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};