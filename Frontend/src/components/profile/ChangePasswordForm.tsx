import { getErrorMessage } from "@/lib/errorHandler";
import { authService } from "@/services/authService";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { LockIcon } from "@phosphor-icons/react";

const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: z.string().min(8, "Mật khẩu mới phải có ít nhất 8 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận lại mật khẩu mới"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "Mật khẩu mới không được trùng với mật khẩu cũ",
    path: ["newPassword"],
  });
type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

const ChangePasswordForm = () => {
  const [isChanging, setIsChanging] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  const onSubmit = async (data: ChangePasswordFormValues) => {
    try {
      await authService.changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      toast.success("Đổi mật khẩu thành công!");
      reset();
    } catch (error) {
      toast.error(getErrorMessage(error, "Đổi mật khẩu thất bại!"));
    }
  };
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg text-foreground">Đổi mật khẩu</CardTitle>
        <CardDescription className="text-muted-foreground">
          Để bảo vệ tài khoản, không nên sử dụng mật khẩu đã từng dùng ở nơi
          khác.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              Mật khẩu hiện tại
            </Label>
            <Input
              type="password"
              placeholder="••••••••"
              {...register("oldPassword")}
              className="bg-background"
            />
            {errors.oldPassword && (
              <p className="text-xs text-destructive">
                {errors.oldPassword.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">
                Mật khẩu mới
              </Label>
              <Input
                type="password"
                placeholder="Ít nhất 8 ký tự"
                {...register("newPassword")}
                className="bg-background"
              />
              {errors.newPassword && (
                <p className="text-xs text-destructive">
                  {errors.newPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">
                Xác nhận mật khẩu mới
              </Label>
              <Input
                type="password"
                placeholder="Nhập lại mật khẩu mới"
                {...register("confirmPassword")}
                className="bg-background"
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="outline"
              disabled={isChanging}
              className="gap-2 cursor-pointer"
            >
              {isChanging ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LockIcon className="h-4 w-4" />
              )}
              Đổi mật khẩu
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChangePasswordForm;
