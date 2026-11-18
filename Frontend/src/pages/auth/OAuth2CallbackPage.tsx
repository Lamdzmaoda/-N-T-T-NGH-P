import { useAuthStore } from "@/stores/useAuthStore";
import { Loader2 } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";

const OAuth2CallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuthStore();
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      toast.error("Bạn đã hủy hoặc đăng nhập Google thất bại!");
      navigate("/signin", { replace: true });
      return;
    }
    if (!code) {
      toast.error("Không tìm thấy mã xác thực từ Google");
      navigate("/signin", { replace: true });
      return;
    }

    const processLogin = async () => {
      try {
        await loginWithGoogle(code);
        navigate("/", { replace: true });
      } catch (error) {
        navigate("/signin", { replace: true });
      }
    };
    processLogin();
  }, [searchParams, loginWithGoogle, navigate]);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground gap-3">
      <Loader2 className="size-8 animate-spin text-primary" />
      <p className="text-sm font-medium text-muted-foreground animate-pulse">
        Đang xác thực tài khoản Google với FinFlow...
      </p>
    </div>
  );
};

export default OAuth2CallbackPage;
