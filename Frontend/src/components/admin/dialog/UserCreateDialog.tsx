import React, { useState } from "react";
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
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getErrorMessage } from "@/lib/errorHandler";

const createUserSchema = z.object({
  username: z
    .string()
    .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Tên đăng nhập chỉ gồm chữ cái, số và dấu gạch dưới",
    ),
  email: z.string().email("Địa chỉ email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu phải có tối thiểu 8 ký tự"),
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
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

interface UserCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const UserCreateDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: UserCreateDialogProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      full_name: "",
      phone: "",
      dob: "",
    },
  });
  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const onSubmit = async (data: CreateUserFormValues) => {
    try {
      await adminService.createUser({
        ...data,
        dob: data.dob ? data.dob : undefined,
      });
      toast.success(`Đã tạo tài khoản ${data.username} thành công!`);
      reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Lỗi tạo user:", error);
      toast.error(getErrorMessage(error, "Không thể tạo tài khoản"));
    }
  };
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            Thêm tài khoản mới
          </DialogTitle>
          <DialogDescription>
            Tạo tài khoản người dùng mới vào hệ thống FinFlow.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-3 py-2 text-xs"
        >
          {/* Username */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-foreground">
              Tên đăng nhập (Username){" "}
              <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="vd: nguyenvana"
              {...register("username")}
              className="h-8 text-xs"
            />
            {errors.username && (
              <span className="text-[11px] font-medium text-destructive">
                {errors.username.message}
              </span>
            )}
          </div>
          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-foreground">
              Email <span className="text-destructive">*</span>
            </label>
            <Input
              type="email"
              placeholder="vd: vana@gmail.com"
              {...register("email")}
              className="h-8 text-xs"
            />
            {errors.email && (
              <span className="text-[11px] font-medium text-destructive">
                {errors.email.message}
              </span>
            )}
          </div>
          {/* Password */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-foreground">
              Mật khẩu <span className="text-destructive">*</span>
            </label>
            <Input
              type="password"
              placeholder="Tối thiểu 8 ký tự"
              {...register("password")}
              className="h-8 text-xs"
            />
            {errors.password && (
              <span className="text-[11px] font-medium text-destructive">
                {errors.password.message}
              </span>
            )}
          </div>
          {/* Họ tên & SĐT */}
          <div className="grid grid-cols-2 gap-2">
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
          </div>
          {/* Ngày sinh */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-foreground">
              Ngày sinh (Tùy chọn, yêu cầu $\ge$ 18 tuổi)
            </label>
            <Input type="date" {...register("dob")} className="h-8 text-xs" />
            {errors.dob && (
              <span className="text-[11px] font-medium text-destructive">
                {errors.dob.message}
              </span>
            )}
          </div>
          {/* Actions Footer */}
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

export default UserCreateDialog;
