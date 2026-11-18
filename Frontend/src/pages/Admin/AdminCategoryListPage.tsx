import React, { useEffect, useState, useMemo } from "react";
import { Plus, RotateCcw } from "lucide-react";
import type { Category, CategoryType } from "@/types/category";
import { categoryService } from "@/services/categoryService";
import { CategoryTable } from "@/components/admin/content/CategoryTable";
import { CategoryCreateDialog } from "@/components/admin/dialog/CategoryCreateDialog";
import { CategoryEditDialog } from "@/components/admin/dialog/CategoryEditDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CategoryFilterBar } from "@/components/admin/sidebar/CategoryFilterBar";

const AdminCategoryListPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | CategoryType>("ALL");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAdminCategories();
      setCategories(data);
    } catch (error) {
      console.error("Lỗi tải danh mục:", error);
      toast.error("Không thể tải danh sách danh mục");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Ẩn hoặc Hiện danh mục (Xóa mềm)
  const handleToggleStatus = async (cat: Category) => {
    const isHiding = cat.isActive !== false;
    const msg = isHiding
      ? `Ẩn danh mục "${cat.name}" khỏi người dùng?`
      : `Hiện lại danh mục "${cat.name}"?`;
    if (!window.confirm(msg)) return;

    try {
      await categoryService.toggleAdminCategoryStatus(cat.id);
      toast.success(isHiding ? "Đã ẩn danh mục thành công" : "Đã hiện lại danh mục");
      fetchCategories();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Thao tác thất bại");
    }
  };

  // Xóa vĩnh viễn khỏi Database
  const handlePermanentDelete = async (cat: Category) => {
    if (!window.confirm(`CẢNH BÁO: Xóa vĩnh viễn danh mục "${cat.name}" khỏi cơ sở dữ liệu?`)) {
      return;
    }
    try {
      await categoryService.permanentDeleteAdminCategory(cat.id);
      toast.success(`Đã xóa vĩnh viễn danh mục ${cat.name}`);
      fetchCategories();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Không thể xóa danh mục");
    }
  };

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchKeyword =
        !keyword.trim() ||
        cat.name.toLowerCase().includes(keyword.trim().toLowerCase());
      const matchType = typeFilter === "ALL" || cat.type === typeFilter;
      return matchKeyword && matchType;
    });
  }, [categories, keyword, typeFilter]);

  const expenseCount = categories.filter((c) => c.type === "EXPENSE").length;
  const incomeCount = categories.filter((c) => c.type === "INCOME").length;

  return (
    <div className="flex flex-col gap-4 h-full min-h-8">
       <div className="shrink-0">
        <h1 className="text-2xl font-black text-foreground tracking-tight">
          Quản lý Danh mục Hệ thống
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Cấu hình các danh mục chi tiêu & thu nhập mặc định có sẵn cho toàn bộ người dùng FinFlow.
        </p>
      </div>

      {/* Thanh Lọc */}
      <CategoryFilterBar
        keyword={keyword}
        onKeywordChange={setKeyword}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        totalCount={categories.length}
        expenseCount={expenseCount}
        incomeCount={incomeCount}
        onReset={() => {
          setKeyword("");
          setTypeFilter("ALL");
        }}
        onOpenCreate={() => setIsCreateOpen(true)}
      />

      {/* Bảng Danh mục */}
      <CategoryTable
        categories={filteredCategories}
        loading={loading}
        onEdit={(cat) => {
          setEditingCategory(cat);
          setIsEditOpen(true);
        }}
        onToggleStatus={handleToggleStatus}
        onPermanentDelete={handlePermanentDelete}
      />

      {/* Modal Thêm */}
      <CategoryCreateDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={fetchCategories}
      />

      {/* Modal Sửa */}
      <CategoryEditDialog
        category={editingCategory}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSuccess={fetchCategories}
      />
    </div>
  );
};

export default AdminCategoryListPage;