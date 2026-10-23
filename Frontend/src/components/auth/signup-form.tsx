import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Sparkles,
  Wallet,
  QrCode,
  MessagesSquare,
  Compass,
  Store,
  CheckCircle2,
  User,
  AtSign,
  Phone,
  Mail,
  Lock,
  ShieldCheck,
  Eye,
  ArrowRight,
  Shield,
  Zap,
} from "lucide-react"
import { z} from 'zod';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod'
import { useAuthStore } from "@/stores/useAuthStore"
import { useNavigate } from "react-router"

const signUpSchema = z.object({
  full_name: z.string().min(1, 'Tên bắt buộc phải có'),
  username: z.string().min(3,"Tên đăng nhập phải có 3 ký tự"),
  phone: z.string().min(10, "Số điện thoại không hợp lệ"),
  email: z.email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
  confirm_password: z.string().min(1, 'Vui lòng xác nhận lại mật khẩu'),
  terms: z.boolean().refine((val) => val === true, {
      message: 'Bạn phải đồng ý với điều khoản dịch vụ để tiếp tục',
    }),
})
 .refine((data) => data.password === data.confirm_password,{
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirm_password'], // Báo lỗi đỏ ngay tại ô confirm_password trên giao diện
 });

 type SignupFormValues = z.infer<typeof signUpSchema>
export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const {signUp} = useAuthStore();
  const navigate = useNavigate();
  const {register, handleSubmit, formState: {errors, isSubmitting}} = useForm<SignupFormValues>({
    resolver: zodResolver(signUpSchema)
  });

  const onSubmit = async (data: SignupFormValues)=>{
    try {
      const {full_name, username, email, phone, password} = data;

      await signUp(username, password, email, phone, full_name);

      navigate("/signin");
    } catch (error) {
      console.error(error);
    }
    
  }
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden rounded-2xl border-0 shadow-2xl p-0 bg-white">
        <CardContent className="grid p-0 md:grid-cols-12 min-h-175">
          
          {/* CỘT TRÁI - HERO SHOWCASE & TESTIMONIAL (5 cols) */}
          <div className="relative hidden md:flex md:col-span-5 flex-col justify-between p-8 text-white overflow-hidden">
            {/* Background image & gradient overlay */}
            <img
              src="https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1200&auto=format&fit=crop"
              alt="Vietnam Travel"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-b from-slate-950/80 via-slate-900/75 to-slate-950/90" />

            {/* Content trên nền overlay */}
            <div className="relative z-10 flex flex-col gap-6">
              {/* Header Badges */}
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 backdrop-blur-md px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/30">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Travel AI Planner
                </div>
                <div className="rounded-full bg-white/10 backdrop-blur-md px-3 py-1 text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Phiên bản 2.4
                </div>
              </div>

              {/* Tagline */}
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/20 backdrop-blur-md px-3 py-1 text-xs font-medium text-teal-300 border border-teal-500/30 mb-3">
                  <Sparkles className="h-3.5 w-3.5" />
                  Trí tuệ nhân tạo du lịch thế hệ mới
                </div>
                <h2 className="text-xl font-bold leading-tight text-white">
                  Bắt đầu trải nghiệm du lịch số hóa hoàn toàn mới
                </h2>
              </div>

              {/* 3 Feature Glass Cards */}
              <div className="flex flex-col gap-3">
                {/* Feature 1 */}
                <div className="flex items-start gap-3 rounded-xl bg-white/10 backdrop-blur-md p-3.5 border border-white/10 shadow-sm transition hover:bg-white/15">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-400/20 text-teal-300">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-white">
                      Chính xác từng đồng ngân sách
                    </h3>
                    <p className="text-[11px] leading-relaxed text-slate-300 mt-0.5">
                      AI tự động phân bổ chi phí, phòng nghỉ, ăn uống và vé tham quan thông minh.
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex items-start gap-3 rounded-xl bg-white/10 backdrop-blur-md p-3.5 border border-white/10 shadow-sm transition hover:bg-white/15">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-400/20 text-cyan-300">
                    <QrCode className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-white">
                      Vé xe & QR minh bạch
                    </h3>
                    <p className="text-[11px] leading-relaxed text-slate-300 mt-0.5">
                      Nhận vé xe và voucher QR bảo mật mã hóa, hoàn toàn không lo ép giá hay vé ảo.
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex items-start gap-3 rounded-xl bg-white/10 backdrop-blur-md p-3.5 border border-white/10 shadow-sm transition hover:bg-white/15">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-400/20 text-amber-300">
                    <MessagesSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-white">
                      Hỗ trợ bản địa 1:1
                    </h3>
                    <p className="text-[11px] leading-relaxed text-slate-300 mt-0.5">
                      Kết nối trò chuyện trực tiếp với nhà xe, chủ tour và hướng dẫn viên địa phương.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial Card dưới cùng */}
            <div className="relative z-10 mt-6 rounded-2xl bg-slate-900/80 backdrop-blur-md p-3.5 border border-white/15">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
                  alt="Minh Anh"
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-400/60"
                />
                <div>
                  <p className="text-[11px] italic text-slate-200 leading-snug">
                    “Travel AI Planner đã giúp nhóm mình tiết kiệm hơn 3 triệu cho chuyến đi Đà Lạt vừa rồi!”
                  </p>
                  <p className="text-[10px] font-semibold text-emerald-400 mt-1">
                    Minh Anh — Du khách từ Hà Nội
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI - FORM ĐĂNG KÝ (7 cols) */}
          <div className="md:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center bg-white">
            {/* Form Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-600">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-600" />
                Đăng ký nhanh chóng
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-2">
                Tạo tài khoản mới 🚀
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Bắt đầu chuyến hành trình thông minh ngay hôm nay trong 30 giây.
              </p>
            </div>

            {/* Chọn vai trò tham gia */}
            {/* <div className="mt-5">
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Chọn vai trò tham gia của bạn <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                <div
                  className="relative cursor-pointer rounded-xl p-3.5 border border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600 shadow-sm transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                      <Compass className="h-4 w-4" />
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 fill-emerald-100" />
                  </div>
                  <div className="mt-2.5">
                    <span className="text-[11px] font-medium text-slate-500">Du khách</span>
                    <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                      TRAVELER
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-tight mt-1">
                      Lập lịch trình tự động, quản lý ngân sách và lưu vé QR bảo mật.
                    </p>
                  </div>
                </div>

                
                <div
                  className="relative cursor-pointer rounded-xl p-3.5 border border-slate-200 bg-white hover:border-slate-300 transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                      <Store className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-2.5">
                    <span className="text-[11px] font-medium text-slate-500">Đối tác kinh doanh</span>
                    <h4 className="text-xs font-bold text-sky-800 uppercase tracking-wide">
                      MERCHANT / NHÀ XE
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-tight mt-1">
                      Đăng tải dịch vụ xe, tour, tiếp nhận khách và quét mã vé QR tại chỗ.
                    </p>
                  </div>
                </div>
              </div>
            </div> */}

            {/* Form Fields - Giao diện thuần túy, không có logic can thiệp */}
            <form className="mt-5 space-y-3.5" onSubmit={handleSubmit(onSubmit)}>
              {/* Họ và tên đầy đủ */}
              <div className="space-y-1">
                <Label htmlFor="full_name" className="text-xs font-semibold text-slate-700">
                  Họ và tên đầy đủ
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="full_name"
                    type="text"
                    placeholder="Nguyễn Văn An"
                    className="pl-9 h-10 text-xs rounded-lg border-slate-200 focus-visible:ring-teal-600"
                    {...register("full_name")}
                  />
                </div>
                {errors.full_name && (
                  <p className="text-xs font-medium text-rose-500">
                    {errors.full_name.message}
                  </p>
                )}
              </div>

              {/* Tên đăng nhập & Số điện thoại (2 cột) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="username" className="text-xs font-semibold text-slate-700">
                    Tên đăng nhập
                  </Label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="username"
                      {...register("username")}
                      type="text"
                      placeholder="an.nguyen24"
                      className="pl-9 h-10 text-xs rounded-lg border-slate-200 focus-visible:ring-teal-600"
                    />
                  </div>
                  {errors.username && (
                    <p className="text-xs font-medium text-rose-500">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="phone" className="text-xs font-semibold text-slate-700">
                    Số điện thoại liên hệ
                  </Label>
                  <div className="relative flex">
                    <span className="inline-flex items-center px-2.5 rounded-l-lg border border-r-0 border-slate-200 bg-slate-50 text-[11px] font-medium text-slate-600">
                      VN +84
                    </span>
                    <Input
                      id="phone"
                      {...register("phone")}
                      type="tel"
                      placeholder="912 345 678"
                      className="rounded-l-none h-10 text-xs rounded-r-lg border-slate-200 focus-visible:ring-teal-600"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs font-medium text-rose-500">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Địa chỉ Email */}
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                  Địa chỉ Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    {...register("email")}
                    type="email"
                    placeholder="an.nguyen@example.com"
                    className="pl-9 h-10 text-xs rounded-lg border-slate-200 focus-visible:ring-teal-600"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs font-medium text-rose-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Mật khẩu */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
                    Mật khẩu
                  </Label>
                  <span className="text-[10px] font-medium text-slate-400">
                    Độ mạnh: Chưa nhập
                  </span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    {...register("password")}
                    type="password"
                    placeholder="••••••••••••"
                    className="pl-9 pr-9 h-10 text-xs rounded-lg border-slate-200 focus-visible:ring-teal-600"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Eye className="h-4 w-4" />
                  </span>
                </div>
                {errors.password ? (
                  <p className="text-xs font-medium text-rose-500">
                    {errors.password.message}
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <span>ℹ</span> Ít nhất 8 ký tự, bao gồm số và chữ hoa
                  </p>
                )}
              </div>

              {/* Xác nhận mật khẩu */}
              <div className="space-y-1">
                <Label htmlFor="confirm_password" className="text-xs font-semibold text-slate-700">
                  Xác nhận mật khẩu
                </Label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="confirm_password"
                    {...register("confirm_password")}
                    type="password"
                    placeholder="••••••••••••"
                    className="pl-9 h-10 text-xs rounded-lg border-slate-200 focus-visible:ring-teal-600"
                  />
                </div>
                {errors.confirm_password && (
                  <p className="text-xs font-medium text-rose-500">
                    {errors.confirm_password.message}
                  </p>
                )}
              </div>

              {/* Checkbox điều khoản */}
              <div className="space-y-1 pt-1">
                <div className="flex items-start gap-2">
                  <input
                    id="terms"
                    type="checkbox"
                    {...register("terms")}
                    className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <label htmlFor="terms" className="text-[11px] leading-tight text-slate-600 cursor-pointer">
                    Tôi đồng ý với{" "}
                    <a href="#" className="font-semibold text-teal-700 hover:underline">
                      Điều khoản dịch vụ
                    </a>{" "}
                    và{" "}
                    <a href="#" className="font-semibold text-teal-700 hover:underline">
                      Chính sách bảo mật
                    </a>{" "}
                    của Travel AI Planner.
                  </label>
                </div>
                {/* 👉 Dòng hiển thị lỗi khi chưa tích */}
                {errors.terms && (
                  <p className="text-xs font-medium text-rose-500">
                    {errors.terms.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-teal-800 hover:bg-teal-900 text-white font-medium text-xs rounded-lg flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <span>Tạo tài khoản miễn phí</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </form>

            {/* Footer Trust Badges */}
            <div className="mt-5 flex items-center justify-center gap-6 text-[10px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-slate-400" />
                <span>Bảo mật 256-bit SSL</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-teal-600" />
                <span>Xác thực OTP nhanh chóng</span>
              </div>
            </div>

            {/* Đăng nhập link */}
            <p className="mt-4 text-center text-xs text-slate-600">
              Đã có tài khoản Travel AI Planner?{" "}
              <a href="/signin" className="font-semibold text-teal-700 hover:underline">
                Đăng nhập ngay
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
