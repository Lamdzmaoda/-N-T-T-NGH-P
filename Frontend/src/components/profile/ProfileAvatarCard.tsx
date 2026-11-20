import { useAuthStore } from "@/stores/useAuthStore";
import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "../ui/card";
import { Camera, Loader2 } from "lucide-react";
import { UserAvatar } from "../auth/UserAvatar";

const ProfileAvatarCard = () => {
  const { user, uploadAvatar } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Dung lượng ảnh tối đa là 5MB!");
      return;
    }
    try {
      setIsUploading(true);
      await uploadAvatar(file);
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardContent className="pt-6 flex flex-col items-center text-center">
        <div className="relative group">
          <UserAvatar
            src={user?.avatarUrl}
            name={user?.full_name}
            size="xl"
            className="border-2 shadow-sm"
          />
          {isUploading && (
            <div className="absolute inset-0 bg-background/70 backdrop-blur-xs rounded-full flex items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            aria-label="Đổi ảnh đại diện"
            className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-md hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
          >
            <Camera className="h-4 w-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
        <h2 className="mt-4 font-semibold text-base text-foreground">
          {user?.full_name || "Chưa đặt tên"}
        </h2>
        <p className="text-xs text-muted-foreground">{user?.email}</p>
        <div className="mt-4 w-full pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>Loại tài khoản</span>
          <span className="font-medium text-foreground uppercase">
            {user?.provider || "NORMAL"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileAvatarCard;
