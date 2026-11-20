import { AppSidebar } from "@/components/app-sidebar";
import DashboardHeader from "@/components/layout/DashboardHeader";
import ChangePasswordForm from "@/components/profile/ChangePasswordForm";
import ProfileAvatarCard from "@/components/profile/ProfileAvatarCard";
import ProfileInfoForm from "@/components/profile/ProfileInfoForm";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuthStore } from "@/stores/useAuthStore";


// 1. Schema validate Thông tin cá nhân

// 2. Schema validate Đổi mật khẩu


const ProfilePage = () => {
  const { user } = useAuthStore();
  const isGoogleAccount = user?.provider === "GOOGLE";

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="h-screen overflow-hidden flex flex-col bg-background">
        <DashboardHeader />
        <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Hồ sơ cá nhân</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Quản lý thông tin tài khoản, ảnh đại diện và tùy chọn bảo mật.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Cột trái: Avatar & Tóm tắt tài khoản */}
              <div className="space-y-6">
                <ProfileAvatarCard />
              </div>
              {/* Cột phải: Form thông tin cá nhân & Đổi mật khẩu */}
              <div className="md:col-span-2 space-y-6">
                <ProfileInfoForm />
                {!isGoogleAccount && <ChangePasswordForm />}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
   
};

export default ProfilePage;
