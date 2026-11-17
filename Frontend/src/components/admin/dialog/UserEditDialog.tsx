import React, { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { User } from "@/types/User";
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
import { adminService } from "@/services/adminService";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errorHandler";
// Schema validate dữ liệu cập nhật
const editUserSchema = z.object({
  full_name: z.string().optional(),
  phone: z
    .string()
    .min(10, "Số điện thoại phải có ít nhất 10 số")
    .regex(/^[0-9]+$/, "Số điện thoại chỉ được chứa chữ số"),
  dob: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const birthDate = new Date(val);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 18;
    }, "Người dùng phải từ đủ 18 tuổi trở lên"),
  bio: z.string().optional(),
});
type EditUserFormValues = z.infer<typeof editUserSchema>;
interface UserEditDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const UserEditDialog = ({
  user,
  open,
  onOpenChange,
  onSuccess,
}: UserEditDialogProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      dob: "",
      bio: "",
    },
  });
  useEffect(() => {
    if (user) {
      reset({
        full_name: user.full_name || "",
        phone: user.phone || "",
        dob: user.dob || "",
        bio: user.bio || "",
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: EditUserFormValues) => {
    if (!user) return;
    try {
      await adminService.updateUser(user.id, {
        ...data,
        dob: data.dob ? data.dob : undefined,
      });
      toast.success(
        `Cập nhật thông tin tài khoản ${user.username} thành công!`,
      );
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Lỗi cập nhật user:", error);
      toast.error(getErrorMessage(error || "Không thể cập nhật tài khoản"));
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            Chỉnh sửa tài khoản
          </DialogTitle>
          <DialogDescription>
            Cập nhật thông tin người dùng trong hệ thống FinFlow.
          </DialogDescription>
        </DialogHeader>
        {user && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-3 py-2 text-xs"
          >
            {/* Thông tin cố định chỉ đọc */}
            <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-muted/30 border border-border">
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">
                  Username
                </span>
                <span className="font-semibold text-foreground text-xs">
                  {user.username}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">
                  Email
                </span>
                <span
                  className="font-semibold text-foreground text-xs truncate"
                  title={user.email}
                >
                  {user.email}
                </span>
              </div>
            </div>
            {/* Họ và tên */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-foreground">Họ và tên</label>
              <Input
                placeholder="vd: Nguyễn Văn A"
                {...register("full_name")}
                className="h-8 text-xs"
              />
              {errors.full_name && (
                <span className="text-[11px] font-medium text-destructive">
                  {errors.full_name.message}
                </span>
              )}
            </div>
            {/* Số điện thoại */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-foreground">
                Số điện thoại <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="vd: 0987654321"
                {...register("phone")}
                className="h-8 text-xs"
              />
              {errors.phone && (
                <span className="text-[11px] font-medium text-destructive">
                  {errors.phone.message}
                </span>
              )}
            </div>
            {/* Ngày sinh */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-foreground">
                Ngày sinh (Yêu cầu $\ge$ 18 tuổi nếu nhập)
              </label>
              <Input type="date" {...register("dob")} className="h-8 text-xs" />
              {errors.dob && (
                <span className="text-[11px] font-medium text-destructive">
                  {errors.dob.message}
                </span>
              )}
            </div>
            {/* Tiểu sử (Bio) */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-foreground">
                Tiểu sử (Bio)
              </label>
              <Input
                placeholder="Nhập ghi chú hoặc tiểu sử..."
                {...register("bio")}
                className="h-8 text-xs"
              />
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

export default UserEditDialog;
