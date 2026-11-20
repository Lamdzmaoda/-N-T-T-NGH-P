import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/useAuthStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

export const profileSchema = z.object({
  full_name: z.string().min(1, "Họ và tên không được để trống"),
  phone: z
    .string()
    .min(10, "Số điện thoại phải có ít nhất 10 số")
    .regex(/^[0-9]+$/, "Số điện thoại chỉ được chứa các chữ số"),
  dob: z.string().optional(),
  bio: z.string().max(255, "Tiểu sử không được vượt quá 255 ký tự").optional(),
});
type ProfileFormValues = z.infer<typeof profileSchema>;
const ProfileInfoForm = () => {
  const { user, updateProfile } = useAuthStore();
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
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
  const onSubmit = async (data: ProfileFormValues) => {
    await updateProfile({
      full_name: data.full_name,
      phone: data.phone,
      dob: data.dob || undefined,
      bio: data.bio || undefined,
    });
  };
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg text-foreground">
          Thông tin cá nhân
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Cập nhật các thông tin cơ bản gắn liền với tài khoản của bạn.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">
                Họ và tên <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="Nguyễn Văn A"
                {...register("full_name")}
                className="bg-background"
              />
              {errors.full_name && (
                <p className="text-xs text-destructive">
                  {errors.full_name.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">
                Email
              </Label>
              <Input
                value={user?.email || ""}
                disabled
                className="bg-muted text-muted-foreground cursor-not-allowed"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">
                Số điện thoại <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="0912345678"
                {...register("phone")}
                className="bg-background"
              />
              {errors.phone && (
                <p className="text-xs text-destructive">
                  {errors.phone.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">
                Ngày sinh
              </Label>
              <Input
                type="date"
                {...register("dob")}
                className="bg-background"
              />
              {errors.dob && (
                <p className="text-xs text-destructive">{errors.dob.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              Tiểu sử
            </Label>
            <Input
              placeholder="Giới thiệu ngắn về bản thân..."
              {...register("bio")}
              className="bg-background"
            />
            {errors.bio && (
              <p className="text-xs text-destructive">{errors.bio.message}</p>
            )}
          </div>
          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              disabled={isUpdating}
              className="gap-2 cursor-pointer bg-primary text-primary-foreground hover:opacity-90"
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileInfoForm;
