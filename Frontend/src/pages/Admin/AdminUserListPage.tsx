import { useEffect, useState } from "react";

import { useAdminUserStore } from "@/stores/useAdminUserStore";
import type { User } from "@/types/User";
import { UserFilterBar } from "@/components/admin/sidebar/UserFilterBar";
import { UserTable } from "@/components/admin/content/UserTable";
import { toast } from "sonner";
import UserDetailDialog from "@/components/admin/dialog/UserDetailDialog";
import UserCreateDialog from "@/components/admin/dialog/UserCreateDialog";
import UserEditDialog from "@/components/admin/dialog/UserEditDialog";

const AdminUserListPage = () => {
  const { fetchUsers } = useAdminUserStore();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false)
  useEffect(() => {
    fetchUsers(0);
  }, [fetchUsers]);
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-black text-foreground tracking-tight">
        Quản lý Tài Khoản
      </h1>
      {/* 1. Khối bộ lọc */}
      <UserFilterBar onOpenAdd={() => setIsAddOpen(true)} />
      {/* 2. Bảng dữ liệu người dùng */}
      <UserTable
        onViewUser={(user) => {
          setSelectedUser(user);
          setIsViewOpen(true);
        }}
        onEditUser={(user) => {
          setEditingUser(user);
          setIsEditOpen(true);
        }}
      />
      {/* 3. Modal xem chi tiết */}
      <UserDetailDialog
        user={selectedUser}
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
      />
      {/* 4. Modal tạo tài khoản mới */}
      <UserCreateDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSuccess={() => fetchUsers(0)}
      />
      <UserEditDialog
        user={editingUser}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSuccess={() => fetchUsers()}
      />
    </div>
  );
};

export default AdminUserListPage;
