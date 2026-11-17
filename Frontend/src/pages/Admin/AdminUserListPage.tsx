import React, { useEffect } from "react";
import {
  Search,
  RotateCcw,
  Plus,
  Eye,
  Pencil,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useAdminUserStore } from "@/stores/useAdminUserStore";
import type { User } from "@/types/User";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { toast } from "sonner";

const AdminUserListPage = () => {
  const {
    userPage,
    loading,
    filters,
    setFilters,
    resetFilters,
    fetchUsers,
    toggleUserStatus,
  } = useAdminUserStore();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(0);
  };

  const handleToggleStatus = async (user: User) => {
    const isLocking = user.isActive !== false;
    const confirmMsg = isLocking
      ? `Bạn có chắc chắn muốn KHÓA tài khoản ${user.email}?`
      : `Mở khóa cho tài khoản ${user.email}?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await toggleUserStatus(user.id);
      toast.success(
        isLocking
          ? "Đã khóa tài khoản thành công"
          : "Đã mở khóa tài khoản thành công",
      );
    } catch {
      toast.error("Thao tác thất bại");
    }
  };
  const formatDateTime = (dateStr?: string) => {
    if(!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      return (
        d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) +
        " " +
        d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
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
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-black text-foreground tracking-tight">Quản lý Tài Khoản</h1>
      {/* KHỐI BỘ LỌC TÌM KIẾM CHUẨN CARD SHADCN */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3">
            {/* Từ ngày */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Từ</span>
              <Input
                type="date"
                value={filters.startDate || ""}
                onChange={(e) => setFilters({ startDate: e.target.value })}
                className="w-36 h-8 text-xs"
              />
            </div>
            {/* Đến ngày */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">-</span>
              <Input
                type="date"
                value={filters.endDate || ""}
                onChange={(e) => setFilters({ endDate: e.target.value })}
                className="w-36 h-8 text-xs"
              />
            </div>
            {/* Lọc theo quyền */}
            <select
              value={filters.role || ""}
              onChange={(e) => setFilters({ role: e.target.value })}
              className="h-8 rounded-none border border-input bg-transparent px-2.5 text-xs text-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 outline-none cursor-pointer"
            >
              <option value="">--- Tất cả quyền ---</option>
              <option value="USER">ROLE_USER</option>
              <option value="ADMIN">ROLE_ADMIN</option>
            </select>
            {/* Ô tìm kiếm */}
            <div className="flex-1 min-w-48">
              <Input
                type="text"
                placeholder="Tìm kiếm Email, Họ tên, SĐT..."
                value={filters.keyword || ""}
                onChange={(e) => setFilters({ keyword: e.target.value })}
                className="h-8 text-xs"
              />
            </div>
            {/* Nút Tìm kiếm */}
            <Button type="submit" size="icon-sm" title="Tìm kiếm">
              <Search className="size-4" />
            </Button>
            {/* Nút Làm mới */}
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              onClick={resetFilters}
              title="Làm mới bộ lọc"
            >
              <RotateCcw className="size-4" />
            </Button>
            {/* Nút Thêm mới tài khoản */}
            <Button
              type="button"
              size="icon-sm"
              onClick={() => toast.info("Tính năng tạo tài khoản Admin đang sẵn sàng")}
              className="ml-auto"
              title="Thêm tài khoản mới"
            >
              <Plus className="size-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
      {/* KHỐI BẢNG DỮ LIỆU */}
      <Card>
        {/* Header thông tin bản ghi */}
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
        {/* Bảng Table shadcn */}
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
                  Không tìm thấy tài khoản nào phù hợp
                </TableCell>
              </TableRow>
            ) : (
              users.map((u, idx) => {
                const roleName = u.roles?.[0]?.name || "ROLE_USER";
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
                          onClick={() => toast.info(`Xem chi tiết: ${u.email}`)}
                          title="Xem chi tiết"
                        >
                          <Eye className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          type="button"
                          onClick={() => toast.info(`Sửa thông tin: ${u.email}`)}
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
        {/* Thanh Phân Trang Pagination */}
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
    </div>
  );
}

export default AdminUserListPage;
