import { useEffect, useMemo, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategoryStore } from "@/stores/useCategoryStore";
import { CategoryCard } from "@/components/category/content/CategoryCard";
import { UserCategoryCreateDialog } from "@/components/category/dialog/UserCategoryCreateDialog";
import { UserCategoryEditDialog } from "@/components/category/dialog/UserCategoryEditDialog";
import type { Category, CategoryType } from "@/types/category";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  Plus,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

type FilterTab = "ALL" | CategoryType | "PERSONAL" | "SYSTEM";

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: "ALL", label: "Tất cả" },
  { id: "EXPENSE", label: "Chi tiêu" },
  { id: "INCOME", label: "Thu nhập" },
  { id: "PERSONAL", label: "Cá nhân" },
  { id: "SYSTEM", label: "Mặc định" },
];

const CategoriesPage = () => {
  const { categories, loading, fetchAllCategories, deleteCategory } =
    useCategoryStore();

  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(12);

  const [createOpen, setCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    fetchAllCategories();
  }, [fetchAllCategories]);

  // Lọc Client-side tức thì (Zero-latency UX)
  const filteredCategories = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    return categories.filter((cat) => {
      const matchKeyword =
        !normalizedKeyword ||
        cat.name.toLowerCase().includes(normalizedKeyword);

      let matchTab = true;
      if (activeTab === "EXPENSE" || activeTab === "INCOME") {
        matchTab = cat.type === activeTab;
      } else if (activeTab === "PERSONAL") {
        matchTab = !cat.isDefault;
      } else if (activeTab === "SYSTEM") {
        matchTab = Boolean(cat.isDefault);
      }

      return matchKeyword && matchTab;
    });
  }, [categories, keyword, activeTab]);

  // Phân trang Client-side
  const totalElements = filteredCategories.length;
  const totalPages = Math.max(Math.ceil(totalElements / pageSize), 1);
  const safePage = Math.min(currentPage, totalPages - 1);

  const paginatedCategories = useMemo(() => {
    const start = safePage * pageSize;
    return filteredCategories.slice(start, start + pageSize);
  }, [filteredCategories, safePage, pageSize]);

  // Thống kê nhanh
  const stats = useMemo(() => {
    const expenseCount = categories.filter((c) => c.type === "EXPENSE").length;
    const incomeCount = categories.filter((c) => c.type === "INCOME").length;
    const personalCount = categories.filter((c) => !c.isDefault).length;
    return { expenseCount, incomeCount, personalCount };
  }, [categories]);

  const handleTabChange = (tab: FilterTab) => {
    setActiveTab(tab);
    setCurrentPage(0);
  };

  const handleKeywordChange = (value: string) => {
    setKeyword(value);
    setCurrentPage(0);
  };

  const handleDelete = async (cat: Category) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa danh mục cá nhân "${cat.name}"? Các giao dịch cũ vẫn sẽ được giữ nguyên.`
    );
    if (!confirmed) return;
    await deleteCategory(cat.id);
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="h-screen overflow-hidden flex flex-col bg-slate-50/60">
        <DashboardHeader />

        <div className="flex-1 min-h-0 flex flex-col p-4 md:p-6 gap-4 max-w-6xl w-full mx-auto">
          {/* 1. Header trang (ghim cố định) */}
          <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Danh mục
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Quản lý danh mục thu chi cá nhân và sử dụng các danh mục mặc định từ FinFlow.
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={() => setCreateOpen(true)}
              className="h-9 gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-xs shadow-blue-500/20 shrink-0"
            >
              <Plus className="size-4" />
              Thêm danh mục
            </Button>
          </div>

          {/* 2. Summary Cards (ghim cố định) */}
          <div className="shrink-0 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card className="p-3.5 border border-slate-200/80 bg-white shadow-xs flex flex-row items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-500">
                  Tổng danh mục khả dụng
                </span>
                <div className="text-xl font-black text-slate-900 mt-0.5">
                  {categories.length}{" "}
                  <span className="text-xs font-medium text-slate-400">
                    ({stats.personalCount} cá nhân)
                  </span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                <FolderKanban className="size-4" />
              </div>
            </Card>

            <Card className="p-3.5 border border-slate-200/80 bg-white shadow-xs flex flex-row items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-500">
                  Danh mục Chi tiêu
                </span>
                <div className="text-xl font-black text-rose-600 mt-0.5">
                  {stats.expenseCount}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
                <TrendingDown className="size-4" />
              </div>
            </Card>

            <Card className="p-3.5 border border-slate-200/80 bg-white shadow-xs flex flex-row items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-500">
                  Danh mục Thu nhập
                </span>
                <div className="text-xl font-black text-emerald-600 mt-0.5">
                  {stats.incomeCount}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                <TrendingUp className="size-4" />
              </div>
            </Card>
          </div>

          {/* 3. Thanh Lọc Tabs + Instant Search (ghim cố định) */}
          <div className="shrink-0 bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-1 overflow-x-auto bg-slate-100/80 p-1 rounded-xl w-fit">
              {FILTER_TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabChange(tab.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer",
                      isActive
                        ? "bg-blue-600 text-white font-semibold shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                    )}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                value={keyword}
                onChange={(e) => handleKeywordChange(e.target.value)}
                placeholder="Tìm nhanh theo tên danh mục..."
                className="pl-9 h-9 text-xs border-slate-200 focus-visible:ring-blue-600 bg-slate-50/50"
              />
            </div>
          </div>

          {/* 4. Vùng cuộn lưới Thẻ Danh mục (chỉ vùng này cuộn) */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-2xl bg-slate-200/60" />
                ))}
              </div>
            ) : paginatedCategories.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-300 rounded-2xl bg-white">
                <FolderKanban className="size-10 text-slate-300 mb-2" />
                <h3 className="text-sm font-bold text-slate-800">
                  Không tìm thấy danh mục nào
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  {activeTab === "PERSONAL"
                    ? "Bạn chưa tự tạo danh mục cá nhân nào. Hãy tạo danh mục riêng đầu tiên!"
                    : "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc phía trên."}
                </p>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setCreateOpen(true)}
                  className="mt-4 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                >
                  <Plus className="size-3.5" /> Thêm danh mục mới
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pb-1">
                {paginatedCategories.map((cat) => (
                  <CategoryCard
                    key={cat.id}
                    category={cat}
                    onEdit={(c) => setEditingCategory(c)}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 5. Footer Phân trang Client-side (ghim cố định ở đáy) */}
          <div className="shrink-0 bg-white border border-slate-200/80 rounded-2xl px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600 shadow-xs">
            <div className="flex items-center gap-2">
              <span>Hiển thị</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(0);
                }}
                className="h-7 px-2 border border-slate-200 rounded-md bg-white text-xs font-semibold cursor-pointer outline-none focus:border-blue-600"
              >
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
              </select>
              <span>
                trong tổng số{" "}
                <strong className="text-slate-900">{totalElements}</strong> danh mục
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={safePage <= 0}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 0))}
                className="h-7 px-2.5 text-xs border-slate-200"
              >
                <ChevronLeft className="size-3.5 mr-1" />
                Trước
              </Button>
              <span className="px-2 text-xs font-semibold text-slate-700">
                Trang {safePage + 1} / {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={safePage + 1 >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="h-7 px-2.5 text-xs border-slate-200"
              >
                Sau
                <ChevronRight className="size-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Modals Tạo & Sửa danh mục cá nhân */}
      <UserCategoryCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
      <UserCategoryEditDialog
        category={editingCategory}
        open={!!editingCategory}
        onOpenChange={(open) => !open && setEditingCategory(null)}
      />
    </SidebarProvider>
  );
};

export default CategoriesPage;