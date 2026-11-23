import React from "react";
import {
  Eye,
  Pencil,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import type { User } from "@/types/User";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { useAdminUserStore } from "@/stores/useAdminUserStore";
import { toast } from "sonner";

interface UserTableProps {
  onViewUser: (user: User) => void;
  onEditUser?: (user: User) => void;
}

export const UserTable = ({ onViewUser, onEditUser }: UserTableProps) => {
  const {
    userPage,
    loading,
    filters,
    setFilters,
    fetchUsers,
    toggleUserStatus,
  } = useAdminUserStore();

  const handleToggleStatus = async (user: User) => {
    const isLocking = user.isActive !== false;
    const confirmMsg = isLocking
      ? `Bạn có chắc chắn muốn KHÓA tài khoản ${user.email}?`
      : `Mở khóa cho tài khoản ${user.email}?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await toggleUserStatus(user.id);
      toast.success(
        isLocking ? "Đã khóa tài khoản thành công" : "Đã mở khóa tài khoản thành công"
      );
    } catch {
      toast.error("Thao tác thất bại");
    }
  };

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

  const users = userPage?.content || [];
  const totalElements = userPage?.totalElements || 0;
  const totalPages = userPage?.totalPages || 1;
  const currentPage = filters.page ?? 0;
  const pageSize = filters.size ?? 5;

  return (
    <Card>
      {/* Header số lượng bản ghi */}
      <div className="p-3 border-b border-border flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Showing</span>
          <select
            value={pageSize}
            onChange={(e) => {
              const newSize = Number(e.target.value);
              setFilters({ size: newSize, page: 0 });
              fetchUsers(0);
            }}
            className="h-7 px-2 border border-input rounded bg-transparent text-xs font-semibold cursor-pointer outline-none"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Tổng: {totalElements}</Badge>
          <Badge variant="secondary">Đang hiển thị: {users.length}</Badge>
        </div>
      </div>

      {/* Table shadcn */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12 text-center">STT</TableHead>
            <TableHead className="w-20">ID</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Họ tên</TableHead>
            <TableHead>Số điện thoại</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead className="text-center">Quyền</TableHead>
            <TableHead className="text-center">Loại TK</TableHead>
            <TableHead className="text-center">Trạng thái</TableHead>
            <TableHead className="text-center w-28">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={10} className="py-12 text-center text-muted-foreground">
                <Loader2 className="size-5 animate-spin mx-auto text-primary mb-2" />
                <span>Đang tải danh sách người dùng...</span>
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="py-12 text-center text-muted-foreground">
                Không tìm thấy tài khoản nào
              </TableCell>
            </TableRow>
          ) : (
            users.map((u, idx) => {
              const roleName = u.roles?.[0]?.name || "USER";
              const isAccountActive = u.isActive !== false;
              return (
                <TableRow key={u.id}>
                  <TableCell className="text-center font-medium text-muted-foreground">
                    {currentPage * pageSize + idx + 1}
                  </TableCell>
                  <TableCell className="font-mono text-[11px] text-muted-foreground truncate" title={u.id}>
                    {u.id.substring(0, 8)}...
                  </TableCell>
                  <TableCell className="font-semibold text-foreground">{u.email}</TableCell>
                  <TableCell className="font-medium">{u.full_name || u.username}</TableCell>
                  <TableCell className="text-muted-foreground">{u.phone || "-"}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDateTime(u.create_at)}</TableCell>
                  {/* Quyền */}
                  <TableCell className="text-center">
                    <Badge
                      variant={roleName.includes("ADMIN") ? "default" : "secondary"}
                      className="text-[10px]"
                    >
                      {roleName}
                    </Badge>
                  </TableCell>
                  {/* Loại TK */}
                  <TableCell className="text-center">
                    <Badge variant="outline" className="text-[10px]">
                      {u.provider || "NORMAL"}
                    </Badge>
                  </TableCell>
                  {/* Trạng thái */}
                  <TableCell className="text-center">
                    <Badge
                      variant={isAccountActive ? "secondary" : "destructive"}
                      className="text-[10px]"
                    >
                      {isAccountActive ? "Đang hoạt động" : "Đã khóa"}
                    </Badge>
                  </TableCell>
                  {/* Hành động */}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        type="button"
                        onClick={() => onViewUser(u)}
                        title="Xem chi tiết"
                      >
                        <Eye className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        type="button"
                        onClick={() => onEditUser?.(u)}
                        title="Chỉnh sửa"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant={isAccountActive ? "destructive" : "secondary"}
                        size="icon-xs"
                        type="button"
                        onClick={() => handleToggleStatus(u)}
                        title={isAccountActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                      >
                        {isAccountActive ? (
                          <Lock className="size-3.5" />
                        ) : (
                          <Unlock className="size-3.5" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Phân trang */}
      <div className="p-3 border-t border-border flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="icon-xs"
          disabled={currentPage === 0 || loading}
          onClick={() => fetchUsers(currentPage - 1)}
        >
          <ChevronLeft className="size-4" />
        </Button>
        {Array.from({ length: totalPages }, (_, i) => (
          <Button
            key={i}
            variant={currentPage === i ? "default" : "outline"}
            size="icon-xs"
            onClick={() => fetchUsers(i)}
            className="text-xs font-bold"
          >
            {i + 1}
          </Button>
        ))}
        <Button
          variant="outline"
          size="icon-xs"
          disabled={currentPage >= totalPages - 1 || loading}
          onClick={() => fetchUsers(currentPage + 1)}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </Card>
  );
};