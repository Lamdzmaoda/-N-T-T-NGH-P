import React from "react";
import { Search, RotateCcw, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminUserStore } from "@/stores/useAdminUserStore";

interface UserFilterBarProps {
  onOpenAdd: () => void;
}

export const UserFilterBar = ({ onOpenAdd }: UserFilterBarProps) => {
  const { filters, setFilters, resetFilters, fetchUsers } = useAdminUserStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(0);
  };

  return (
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
            onChange={(e) => {
              setFilters({ role: e.target.value, page: 0 });
              fetchUsers(0);
            }}
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
            onClick={onOpenAdd}
            className="ml-auto"
            title="Thêm tài khoản mới"
          >
            <Plus className="size-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};