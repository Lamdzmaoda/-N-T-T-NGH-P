import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  TrendingUp,
  BarChart3,
  Loader2,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router";
import { useState } from "react";

// Schema validate form đăng nhập
const signInSchema = z.object({
  username_or_email: z
    .string()
    .min(1, "Vui lòng nhập email hoặc tên đăng nhập"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
  remember: z.boolean().optional(),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export function SigninForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signIn } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      remember: true,
    },
  });

  const onSubmit = async (data: SignInFormValues) => {
    try {
      const { username_or_email, password } = data;
      await signIn(username_or_email, password);
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={cn("w-full max-w-5xl mx-auto", className)} {...props}>
      <Card className="overflow-hidden rounded-3xl border border-slate-200/80 shadow-2xl p-0 bg-white">
        <CardContent className="grid p-0 md:grid-cols-12 min-h-[660px]">
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

            {/* Middle Section: Tagline & Floating Telemetry Card */}
            <div className="relative z-10 my-auto py-8">
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

              {/* Glassmorphism Metric Card (Đồng bộ trực tiếp từ Dashboard) */}
              <div className="mt-8 rounded-2xl bg-white/12 backdrop-blur-xl p-4 border border-white/20 shadow-xl shadow-blue-950/20">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-blue-200">
                    Tổng tài sản mô phỏng
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/25 px-2 py-0.5 text-[10px] font-bold text-emerald-200 border border-emerald-300/30">
                    <TrendingUp className="h-3 w-3" />
                    +8,2%
                  </span>
                </div>
                <div className="mt-1.5 text-2xl font-black tracking-tight text-white">
                  72.530.000 <span className="text-lg font-bold text-blue-200">₫</span>
                </div>
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-blue-100">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                    Trợ lý PFT AI sẵn sàng
                  </span>
                  <span className="font-semibold text-amber-300">Quét hóa đơn 3s</span>
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

          {/* CỘT PHẢI - FORM ĐĂNG NHẬP (7 cols) */}
          <div className="md:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-center bg-white">
            <div className="max-w-md w-full mx-auto">
              {/* Heading */}
              <div className="mb-8">
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                  Chào mừng trở lại
                </h2>
                <p className="text-sm text-slate-500 mt-2 font-medium">
                  Đăng nhập để tiếp tục quản lý tài chính của bạn.
                </p>
              </div>

              {/* Form Input */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Email / Username */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="username_or_email"
                    className="text-xs font-bold text-slate-700 tracking-wide uppercase"
                  >
                    Tên đăng nhập hoặc Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="username_or_email"
                      {...register("username_or_email")}
                      type="text"
                      placeholder="minh@email.com hoặc username"
                      className="pl-10 h-11 text-sm rounded-xl border-slate-200 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-transparent transition-all"
                    />
                  </div>
                  {errors.username_or_email && (
                    <p className="text-xs font-semibold text-rose-500 mt-1">
                      {errors.username_or_email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="password"
                      className="text-xs font-bold text-slate-700 tracking-wide uppercase"
                    >
                      Mật khẩu
                    </Label>
                    <a
                      href="/forgot-password"
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline transition"
                    >
                      Quên mật khẩu?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      {...register("password")}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-11 text-sm rounded-xl border-slate-200 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer transition p-1"
                      aria-label="Ẩn hiện mật khẩu"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs font-semibold text-rose-500 mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="remember"
                    {...register("remember")}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <Label
                    htmlFor="remember"
                    className="text-xs font-medium text-slate-600 cursor-pointer select-none"
                  >
                    Ghi nhớ đăng nhập
                  </Label>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <>
                      <span>Đăng nhập</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Social Login Divider */}
              <div className="relative my-6 text-center">
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
                className="w-full h-11 text-sm border-slate-200 hover:bg-slate-50 font-semibold text-slate-700 rounded-xl flex items-center justify-center gap-2.5 transition cursor-pointer"
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
              <p className="mt-8 text-center text-xs font-medium text-slate-500">
                Chưa có tài khoản?{" "}
                <a
                  href="/signup"
                  className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition"
                >
                  Đăng ký ngay
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
