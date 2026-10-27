import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  User,
  AtSign,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  TrendingUp,
  BarChart3,
  Loader2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router";
import { useState } from "react";

const signUpSchema = z
  .object({
    full_name: z.string().min(1, "Họ và tên bắt buộc phải có"),
    username: z
      .string()
      .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự")
      .regex(/^[a-zA-Z0-9_]+$/, "Tên đăng nhập chỉ gồm chữ, số và dấu gạch dưới"),
    email: z.string().email("Địa chỉ email không hợp lệ"),
    phone: z
      .string()
      .min(10, "Số điện thoại phải có ít nhất 10 số")
      .regex(/^[0-9]+$/, "Số điện thoại chỉ được chứa chữ số"),
    password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
    confirm_password: z.string().min(1, "Vui lòng xác nhận lại mật khẩu"),
    terms: z.boolean().refine((val) => val === true, {
      message: "Bạn phải đồng ý với điều khoản dịch vụ để tiếp tục",
    }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirm_password"],
  });

type SignupFormValues = z.infer<typeof signUpSchema>;

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signUp } = useAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      terms: true,
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    try {
      const { full_name, username, email, phone, password } = data;
      await signUp(username, password, email, phone, full_name);
      navigate("/signin");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={cn("w-full max-w-5xl mx-auto", className)} {...props}>
      <Card className="overflow-hidden rounded-3xl border border-slate-200/80 shadow-2xl p-0 bg-white">
        <CardContent className="grid p-0 md:grid-cols-12 min-h-[700px]">
          {/* CỘT TRÁI - BRAND SHOWCASE NÂNG CẤP (5 cols) */}
          <div className="relative hidden md:flex md:col-span-5 flex-col justify-between p-10 text-white overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900">
            {/* Hiệu ứng Radial Rings & Glow Mesh */}
            <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-indigo-500/30 blur-3xl pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.12),transparent_70%)] pointer-events-none" />

            {/* Vòng cung trang trí SVG */}
            <svg
              className="absolute -right-20 top-1/4 w-80 h-80 opacity-15 text-white pointer-events-none"
              viewBox="0 0 200 200"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="100" cy="100" r="80" strokeWidth="1.5" />
              <circle cx="100" cy="100" r="60" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx="100" cy="100" r="40" strokeWidth="1" />
            </svg>

            {/* Header: Logo PFT */}
            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md border border-white/25 shadow-lg shadow-blue-900/30">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-wider text-white leading-none">
                    PFT
                  </h2>
                  <p className="text-[10px] font-semibold tracking-widest text-blue-200 uppercase mt-0.5">
                    SMART FINANCE
                  </p>
                </div>
              </div>
            </div>

            {/* Middle Section: Tagline & Security Card */}
            <div className="relative z-10 my-auto py-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md px-3.5 py-1 text-[11px] font-semibold text-blue-100 border border-white/20 mb-5 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span>TÀI CHÍNH THÔNG MINH</span>
              </div>

              <h1 className="text-3xl font-extrabold leading-tight text-white tracking-tight">
                Làm chủ tài chính.
                <br />
                <span className="text-blue-100">Kiến tạo tương lai.</span>
              </h1>

              <p className="text-sm text-blue-100/90 mt-4 leading-relaxed max-w-sm">
                Theo dõi chi tiêu, xây dựng thói quen tốt và đạt mục tiêu nhanh hơn với sức mạnh của AI.
              </p>

              {/* Security & Feature Card */}
              <div className="mt-8 rounded-2xl bg-white/12 backdrop-blur-xl p-4 border border-white/20 shadow-xl shadow-blue-950/20 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-400/25 text-emerald-200 mt-0.5">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      Bảo mật chuẩn tài chính
                    </h4>
                    <p className="text-[11px] text-blue-100/80 mt-0.5 leading-relaxed">
                      Mã hóa dữ liệu 2 lớp JWT Rotation & cô lập sổ cái riêng biệt.
                    </p>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-blue-100">
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-300" />
                    Báo cáo tài chính chi tiết
                  </span>
                  <span className="font-semibold text-amber-300">Miễn phí 100%</span>
                </div>
              </div>
            </div>

            {/* Bottom Stats: Social Proof */}
            <div className="relative z-10 pt-4 border-t border-white/15 grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-black text-white tracking-tight">
                  15.000+
                </div>
                <div className="text-[11px] font-medium text-blue-200 mt-0.5">
                  Người dùng tin tưởng
                </div>
              </div>
              <div>
                <div className="text-2xl font-black text-amber-300 tracking-tight flex items-center gap-1">
                  4,9<span className="text-base text-white/80 font-bold">/5</span>
                </div>
                <div className="text-[11px] font-medium text-blue-200 mt-0.5">
                  Đánh giá trung bình
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI - FORM ĐĂNG KÝ (7 cols) */}
          <div className="md:col-span-7 p-8 sm:p-10 lg:p-12 flex flex-col justify-center bg-white">
            <div className="max-w-lg w-full mx-auto">
              {/* Heading */}
              <div className="mb-6">
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                  Tạo tài khoản
                </h2>
                <p className="text-sm text-slate-500 mt-1 font-medium">
                  Bắt đầu hành trình tài chính thông minh cùng PFT.
                </p>
              </div>

              {/* Form Input với Grid 2 Cột */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Hàng 1: Họ tên & Tên đăng nhập */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Họ và tên */}
                  <div className="space-y-1">
                    <Label
                      htmlFor="full_name"
                      className="text-xs font-bold text-slate-700 tracking-wide uppercase"
                    >
                      Họ và tên
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="full_name"
                        {...register("full_name")}
                        type="text"
                        placeholder="Nguyễn Văn Minh"
                        className="pl-10 h-10 text-sm rounded-xl border-slate-200 focus-visible:ring-2 focus-visible:ring-blue-600 transition-all"
                      />
                    </div>
                    {errors.full_name && (
                      <p className="text-[11px] font-semibold text-rose-500 mt-0.5">
                        {errors.full_name.message}
                      </p>
                    )}
                  </div>

                  {/* Tên đăng nhập */}
                  <div className="space-y-1">
                    <Label
                      htmlFor="username"
                      className="text-xs font-bold text-slate-700 tracking-wide uppercase"
                    >
                      Tên đăng nhập
                    </Label>
                    <div className="relative">
                      <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="username"
                        {...register("username")}
                        type="text"
                        placeholder="vanminh123"
                        className="pl-10 h-10 text-sm rounded-xl border-slate-200 focus-visible:ring-2 focus-visible:ring-blue-600 transition-all"
                      />
                    </div>
                    {errors.username && (
                      <p className="text-[11px] font-semibold text-rose-500 mt-0.5">
                        {errors.username.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Hàng 2: Email & Số điện thoại */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Email */}
                  <div className="space-y-1">
                    <Label
                      htmlFor="email"
                      className="text-xs font-bold text-slate-700 tracking-wide uppercase"
                    >
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        {...register("email")}
                        type="email"
                        placeholder="minh@email.com"
                        className="pl-10 h-10 text-sm rounded-xl border-slate-200 focus-visible:ring-2 focus-visible:ring-blue-600 transition-all"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-[11px] font-semibold text-rose-500 mt-0.5">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Số điện thoại */}
                  <div className="space-y-1">
                    <Label
                      htmlFor="phone"
                      className="text-xs font-bold text-slate-700 tracking-wide uppercase"
                    >
                      Số điện thoại
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="phone"
                        {...register("phone")}
                        type="tel"
                        placeholder="0912345678"
                        className="pl-10 h-10 text-sm rounded-xl border-slate-200 focus-visible:ring-2 focus-visible:ring-blue-600 transition-all"
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-[11px] font-semibold text-rose-500 mt-0.5">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Hàng 3: Mật khẩu & Xác nhận mật khẩu */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Mật khẩu */}
                  <div className="space-y-1">
                    <Label
                      htmlFor="password"
                      className="text-xs font-bold text-slate-700 tracking-wide uppercase"
                    >
                      Mật khẩu
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="password"
                        {...register("password")}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-9 h-10 text-sm rounded-xl border-slate-200 focus-visible:ring-2 focus-visible:ring-blue-600 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                      >
                        {showPassword ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-[11px] font-semibold text-rose-500 mt-0.5">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Xác nhận mật khẩu */}
                  <div className="space-y-1">
                    <Label
                      htmlFor="confirm_password"
                      className="text-xs font-bold text-slate-700 tracking-wide uppercase"
                    >
                      Xác nhận mật khẩu
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="confirm_password"
                        {...register("confirm_password")}
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-9 h-10 text-sm rounded-xl border-slate-200 focus-visible:ring-2 focus-visible:ring-blue-600 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                    {errors.confirm_password && (
                      <p className="text-[11px] font-semibold text-rose-500 mt-0.5">
                        {errors.confirm_password.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Điều khoản dịch vụ */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="terms"
                      {...register("terms")}
                      className="h-4 w-4 mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <Label
                      htmlFor="terms"
                      className="text-xs font-normal text-slate-600 leading-tight cursor-pointer select-none"
                    >
                      Tôi đồng ý với{" "}
                      <span className="font-semibold text-blue-600 hover:underline">
                        Điều khoản dịch vụ
                      </span>{" "}
                      và{" "}
                      <span className="font-semibold text-blue-600 hover:underline">
                        Chính sách bảo mật
                      </span>{" "}
                      của PFT.
                    </Label>
                  </div>
                  {errors.terms && (
                    <p className="text-[11px] font-semibold text-rose-500">
                      {errors.terms.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Đang tạo tài khoản...</span>
                    </>
                  ) : (
                    <>
                      <span>Đăng ký miễn phí</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Social Login Divider */}
              <div className="relative my-5 text-center">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <span className="relative bg-white px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  hoặc
                </span>
              </div>

              {/* Google Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-10 text-sm border-slate-200 hover:bg-slate-50 font-semibold text-slate-700 rounded-xl flex items-center justify-center gap-2.5 transition cursor-pointer"
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Tiếp tục với Google</span>
              </Button>

              {/* Footer Switch */}
              <p className="mt-5 text-center text-xs font-medium text-slate-500">
                Đã có tài khoản?{" "}
                <a
                  href="/signin"
                  className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition"
                >
                  Đăng nhập
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
