import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/useAuthStore";
import { Mail, ShieldCheck, ArrowLeft, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface OtpVerificationViewProps {
  email: string;
  onSuccess: () => void;
  onBack: () => void;
}

const OtpVerificationView = ({
  email,
  onSuccess,
  onBack,
}: OtpVerificationViewProps) => {
  const { verifyOtp, resendOtp, loading } = useAuthStore();
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [countDown, setCountDown] = useState(300);
  const [resendCooldown, setResendCooldown] = useState(60);

  useEffect(() => {
    inputRefs.current[0]?.focus();
    const timer = setInterval(() => {
      setCountDown((prev) => (prev > 0 ? prev-1 : 0));
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // Tự động focus sang ô tiếp theo nếu đã nhập số
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    if (/^[0-9]{6}$/.test(pasteData)) {
      const newOtp = pasteData.split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      toast.error("Vui lòng nhập đủ 6 chữ số OTP");
      return;
    }
    try {
        await verifyOtp(email, otpCode);
        onSuccess();
    } catch (error) {
        
    }
  };
  const handleResend = async () => {
    if(resendCooldown > 0) return;
    try {
        await resendOtp(email);
        setResendCooldown(60);
        setCountDown(300);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
    } catch (error) {
        
    }
  };
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };
  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="rounded-3xl border border-border shadow-xl p-6 bg-card text-card-foreground">
        <CardContent className="p-0 flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col items-center text-center gap-2">
            <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
              <Mail className="size-7" />
            </div>
            <h2 className="text-xl font-black text-foreground tracking-tight mt-2">
              Xác thực Email
            </h2>
            <p className="text-xs text-muted-foreground max-w-xs">
              Mã xác thực gồm 6 chữ số đã được gửi đến:
              <br />
              <strong className="text-foreground font-semibold">{email}</strong>
            </p>
          </div>
          {/* Form 6 ô OTP */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex justify-center gap-2 sm:gap-3">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {inputRefs.current[idx] = el}}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={handlePaste}
                  className="size-11 sm:size-12 text-center text-xl font-bold rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              ))}
            </div>
            {/* Thông tin hạn mã & Gửi lại */}
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>Hạn mã: <strong className="text-foreground">{formatTime(countDown)}</strong></span>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0}
                className="text-primary hover:underline font-semibold disabled:text-muted-foreground disabled:no-underline cursor-pointer transition flex items-center gap-1"
              >
                <RotateCcw className="size-3" />
                {resendCooldown > 0 ? `Gửi lại sau (${resendCooldown}s)` : "Gửi lại mã OTP"}
              </button>
            </div>
            {/* Nút xác nhận */}
            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                disabled={loading || otp.join("").length !== 6}
                className="w-full h-11 bg-primary text-primary-foreground font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Đang xác thực...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="size-4" />
                    <span>Xác nhận & Kích hoạt</span>
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={onBack}
                className="w-full text-xs text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-3.5 mr-1" />
                Quay lại đổi email
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OtpVerificationView;
