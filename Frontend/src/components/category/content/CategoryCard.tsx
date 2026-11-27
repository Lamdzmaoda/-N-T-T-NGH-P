import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { renderCategoryIcon } from "@/components/admin/content/CategoryTable";
import type { Category } from "@/types/category";
import { cn } from "@/lib/utils";
import { Lock as LockIcon, Pencil, Trash2, User as UserIcon } from "lucide-react";

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export const CategoryCard = ({
  category,
  onEdit,
  onDelete,
}: CategoryCardProps) => {
  const isIncome = category.type === "INCOME";
  const isSystem = Boolean(category.isDefault);

  return (
    <Card className="flex flex-row items-center 
    justify-between gap-3 py-3.5 px-4 rounded-2xl 
    border border-slate-200/80 bg-white shadow-xs
     hover:border-blue-200 hover:shadow-md transition-all">
      {/* Trái: Icon màu + Tên + Badges */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="size-11 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0"
          style={{ backgroundColor: category.color || "#2563EB" }}
        >
          {renderCategoryIcon(category.icon, "size-5")}
        </div>

        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-slate-900 truncate">
            {category.name}
          </span>

          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span
              className={cn(
                "text-[10px] font-semibold px-2 py-0.5 rounded-md border",
                isIncome
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-rose-50 text-rose-700 border-rose-200"
              )}
            >
              {isIncome ? "Thu nhập" : "Chi tiêu"}
            </span>

            {isSystem ? (
              <span
                title="Danh mục mặc định của hệ thống — không thể chỉnh sửa"
                className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200"
              >
                <LockIcon className="size-2.5" />
                Mặc định
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                <UserIcon className="size-2.5" />
                Cá nhân
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Phải: Nút Sửa / Xóa (chỉ hiện với danh mục Cá nhân) */}
      {!isSystem && (
        <div className="flex items-center gap-1 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEdit(category)}
            title="Chỉnh sửa danh mục"
            className="size-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onDelete(category)}
            title="Xóa danh mục"
            className="size-8 p-0 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      )}
    </Card>
  );
};