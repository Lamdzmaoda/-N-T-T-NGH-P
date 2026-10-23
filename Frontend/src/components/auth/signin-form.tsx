import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Compass,
  Mail,
  Lock,
  Eye,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  Zap,
  EyeOff,
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
    .min(1, "Tên đăng nhập hoặc Email không được để trống"),
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

      navigate("/"); // ✅ Chỉ chạy khi đăng nhập thành công
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden rounded-2xl border-0 shadow-2xl p-0 bg-white">
        <CardContent className="grid p-0 md:grid-cols-12 ">
          {/* CỘT TRÁI - HERO SHOWCASE & SOCIAL PROOF (5 cols) */}
          <div className="relative hidden md:flex md:col-span-5 flex-col justify-between p-8 text-white overflow-hidden">
            {/* Background Image & Overlay */}
            <img
              src="https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1200&auto=format&fit=crop"
              alt="Vietnam Travel Landscape"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-b from-slate-950/85 via-slate-900/80 to-slate-950/90" />

            {/* Content Top */}
            <div className="relative z-10 flex flex-col gap-6">
              {/* Header Badges */}
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/80 backdrop-blur-md px-3 py-1 text-[11px] font-medium text-emerald-300 border border-emerald-500/30">
                  <Sparkles className="h-3 w-3 text-emerald-400" />
                  AI ITINERARY ENGINE 3.4
                </div>
                <div className="rounded-full bg-white/10 backdrop-blur-md px-3 py-1 text-[11px] font-medium text-slate-200">
                  Hệ thống trực tuyến
                </div>
              </div>

              {/* Quote Section */}
              <div className="mt-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  KHAI PHÁ VIỆT NAM
                </span>
                <h2 className="text-2xl font-bold leading-snug text-white mt-2">
                  “Mọi chuyến đi vĩ đại đều bắt đầu từ một kế hoạch thông minh.”
                </h2>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  — Travel AI Planner • Tối ưu từng cung đường, tiết kiệm tới
                  35% ngân sách du lịch tự túc.
                </p>
              </div>

              {/* Glassmorphism Stat Card */}
              <div className="rounded-2xl bg-white/10 backdrop-blur-md p-4 border border-white/15 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-400/20 text-emerald-300 mt-0.5">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">
                        Hơn 10,000+ Lịch trình Thông minh
                      </h4>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        Đã tối ưu điểm đến, thời gian & chi phí chi tiết
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-amber-300">
                      ★ 4.9
                    </span>
                    <p className="text-[10px] text-slate-300">1.2k+ đánh giá</p>
                  </div>
                </div>

                <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between">
                  {/* User avatars */}
                  <div className="flex -space-x-1.5 items-center">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white ring-2 ring-slate-900">
                      LH
                    </span>
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-600 text-[10px] font-bold text-white ring-2 ring-slate-900">
                      TN
                    </span>
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white ring-2 ring-slate-900">
                      MD
                    </span>
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[9px] font-semibold text-slate-300 ring-2 ring-slate-900">
                      +9k
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-emerald-300 flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Tạo lịch trình chỉ trong 12s
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Security Badge */}
            <div className="relative z-10 mt-6 rounded-xl bg-slate-900/80 backdrop-blur-md px-3.5 py-2.5 border border-white/10 flex items-center gap-2 text-[11px] text-slate-300">
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>
                Bảo mật QR Voucher 256-bit chuẩn PCI-DSS & phát hành vé điện tử
                tức thì.
              </span>
            </div>
          </div>

          {/* CỘT PHẢI - FORM ĐĂNG NHẬP (7 cols) */}
          <div className="md:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center bg-white">
            {/* Top Bar: Brand & Link Trang chủ */}
            <div className="flex items-center justify-between pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-800 text-white shadow-sm">
                  <Compass className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 leading-tight">
                    Travel AI Planner
                  </h3>
                  <p className="text-[9px] font-semibold text-teal-700 uppercase tracking-wider">
                    HÀNH TRÌNH THÔNG MINH
                  </p>
                </div>
              </div>
              <a
                href="/"
                className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 transition"
              >
                <span>Trang chủ</span>
                <ArrowRight className="h-3 w-3" />
              </a>
            </div>

            {/* Greeting Header */}
            <div className="mt-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                Chào mừng trở lại! 👋
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Đăng nhập để tiếp tục quản lý chuyến đi, vé dịch vụ và voucher
                thông minh của bạn.
              </p>
            </div>

            {/* Notice Banner */}
            <div className="mt-4 rounded-xl bg-sky-50 border border-sky-100 p-3 flex items-start gap-2.5 text-xs text-sky-900">
              <Sparkles className="h-4 w-4 shrink-0 text-sky-600 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                <strong className="font-semibold text-sky-950">
                  Cổng đăng nhập hợp nhất:
                </strong>{" "}
                Áp dụng cho cả Du khách (Traveler) và Hộ kinh doanh / Nhà xe đối
                tác (Business).
              </p>
            </div>

            {/* Form Fields có tích hợp Zod + React Hook Form */}
            <form className="mt-5 space-y-4" onSubmit={handleSubmit(onSubmit)}>
              {/* Tên đăng nhập hoặc Email */}
              <div className="space-y-1">
                <Label
                  htmlFor="username_or_email"
                  className="text-xs font-semibold text-slate-700"
                >
                  Tên đăng nhập hoặc Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="username_or_email"
                    {...register("username_or_email")}
                    type="text"
                    placeholder="demo.traveler@vietnamtrip.ai"
                    className="pl-9 h-10 text-xs rounded-lg border-slate-200 focus-visible:ring-teal-600"
                  />
                </div>
                {errors.username_or_email && (
                  <p className="text-xs font-medium text-rose-500">
                    {errors.username_or_email.message}
                  </p>
                )}
              </div>

              {/* Mật khẩu */}
              <div className="space-y-1">
                <Label
                  htmlFor="password"
                  className="text-xs font-semibold text-slate-700"
                >
                  Mật khẩu
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    className="pl-9 pr-9 h-10 text-xs rounded-lg border-slate-200 focus-visible:ring-teal-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs font-medium text-rose-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Ghi nhớ & Quên mật khẩu */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("remember")}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-[11px] text-slate-600 font-medium">
                    Ghi nhớ đăng nhập trên thiết bị này
                  </span>
                </label>
                <a
                  href="/forgot-password"
                  className="text-[11px] font-semibold text-teal-700 hover:underline"
                >
                  Quên mật khẩu?
                </a>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-teal-800 hover:bg-teal-900 text-white font-medium text-xs rounded-lg flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all mt-2"
              >
                <span>Đăng nhập ngay</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </form>

            {/* Social Divider */}
            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <span className="relative bg-white px-3 text-[11px] text-slate-400 uppercase tracking-wider">
                Hoặc tiếp tục với
              </span>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-9 text-xs border-slate-200 font-medium flex items-center justify-center gap-2 hover:bg-slate-50"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
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
                <span>Google</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                className="h-9 text-xs border-slate-200 font-medium flex items-center justify-center gap-2 hover:bg-slate-50"
              >
                <svg className="h-4 w-4 fill-[#1877F2]" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Facebook</span>
              </Button>
            </div>

            {/* Quick Demo Button (tiện lợi cho chấm đồ án) */}
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition"
              >
                <KeyRound className="h-3 w-3 text-slate-500" />
                <span>Dùng thử tài khoản Demo khách du lịch</span>
              </button>
            </div>

            {/* Footer Sign Up Link */}
            <p className="mt-3 text-center text-xs text-slate-600">
              Chưa có tài khoản Travel AI?{" "}
              <a
                href="/signup"
                className="font-semibold text-teal-700 hover:underline"
              >
                Đăng ký ngay →
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
