import React from "react";
import type { User } from "@/types/User";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface UserDetailDialogProps{
    user : User | null;
    open : boolean;
    onOpenChange: (open: boolean) => void;
}
const UserDetailDialog = ({
    user, open, onOpenChange
}: UserDetailDialogProps) => {
    const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      return (
        d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) +
        " " +
        d.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      );
    } catch {
      return dateStr;
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">Chi tiết tài khoản</DialogTitle>
          <DialogDescription>
            Thông tin chi tiết của người dùng trong hệ thống FinFlow.
          </DialogDescription>
        </DialogHeader>
        {user && (
          <div className="flex flex-col gap-4 py-2">
            <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg border border-border">
              <div className="size-12 rounded-full bg-primary/10 text-primary font-bold text-base flex items-center justify-center">
                {user.full_name?.charAt(0) || user.username?.charAt(0) || "U"}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-foreground">
                  {user.full_name || user.username}
                </span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </div>
              <div className="ml-auto">
                <Badge variant={user.isActive !== false ? "secondary" : "destructive"}>
                  {user.isActive !== false ? "Hoạt động" : "Đã khóa"}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="flex flex-col gap-1 p-2 rounded bg-muted/20 border border-border">
                <span className="text-muted-foreground font-medium">Username</span>
                <span className="font-semibold text-foreground">{user.username}</span>
              </div>
              <div className="flex flex-col gap-1 p-2 rounded bg-muted/20 border border-border">
                <span className="text-muted-foreground font-medium">Số điện thoại</span>
                <span className="font-semibold text-foreground">{user.phone || "Chưa cập nhật"}</span>
              </div>
              <div className="flex flex-col gap-1 p-2 rounded bg-muted/20 border border-border">
                <span className="text-muted-foreground font-medium">Ngày sinh</span>
                <span className="font-semibold text-foreground">{user.dob || "Chưa cập nhật"}</span>
              </div>
              <div className="flex flex-col gap-1 p-2 rounded bg-muted/20 border border-border">
                <span className="text-muted-foreground font-medium">Loại tài khoản</span>
                <span className="font-semibold text-foreground">{user.provider || "NORMAL"}</span>
              </div>
              <div className="flex flex-col gap-1 p-2 rounded bg-muted/20 border border-border">
                <span className="text-muted-foreground font-medium">Vai trò</span>
                <div className="flex flex-wrap gap-1">
                  {user.roles?.map((r) => (
                    <Badge
                      key={r.name}
                      variant={r.name.includes("ADMIN") ? "default" : "secondary"}
                      className="text-[10px]"
                    >
                      {r.name}
                    </Badge>
                  )) || <Badge variant="secondary">USER</Badge>}
                </div>
              </div>
              <div className="flex flex-col gap-1 p-2 rounded bg-muted/20 border border-border">
                <span className="text-muted-foreground font-medium">Ngày tham gia</span>
                <span className="font-semibold text-foreground">{formatDateTime(user.create_at)}</span>
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default UserDetailDialog
