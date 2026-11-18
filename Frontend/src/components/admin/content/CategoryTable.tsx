import React, { useEffect, useState } from "react";
import {
  Pencil,
  Eye,
  EyeOff,
  Trash2,
  Loader2,
  Utensils,
  ShoppingBag,
  Car,
  FileText,
  Gamepad2,
  HeartPulse,
  GraduationCap,
  Wallet,
  Gift,
  TrendingUp,
  Coins,
  Tag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Category } from "@/types/category";
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

export const renderCategoryIcon = (iconName?: string, className = "size-4") => {
  switch (iconName?.toLowerCase()) {
    case "utensils": return <Utensils className={className} />;
    case "shopping-bag": return <ShoppingBag className={className} />;
    case "car": return <Car className={className} />;
    case "file-invoice":
    case "file-text": return <FileText className={className} />;
    case "gamepad": return <Gamepad2 className={className} />;
    case "heart-pulse": return <HeartPulse className={className} />;
    case "graduation-cap": return <GraduationCap className={className} />;
    case "wallet": return <Wallet className={className} />;
    case "gift": return <Gift className={className} />;
    case "chart-line":
    case "trending-up": return <TrendingUp className={className} />;
    case "coins": return <Coins className={className} />;
    default: return <Tag className={className} />;
  }
};

interface CategoryTableProps {
  categories: Category[];
  loading: boolean;
  onEdit: (cat: Category) => void;
  onToggleStatus: (cat: Category) => void;
  onPermanentDelete: (cat: Category) => void;
}

export const CategoryTable = ({
  categories,
  loading,
  onEdit,
  onToggleStatus,
  onPermanentDelete,
}: CategoryTableProps) => {
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        setCurrentPage(0);
    }, [categories]);

    const totalPages = Math.ceil(categories.length / pageSize) || 1;

    const paginatedCategories = categories.slice(
        currentPage * pageSize,
        (currentPage + 1) * pageSize
    );

  return (
    <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* Header số lượng bản ghi & chọn pageSize */}
      <div className="p-3 border-b border-border flex items-center justify-between text-xs text-muted-foreground shrink-0">
        <div className="flex items-center gap-2">
          <span>Hiển thị</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(0);
            }}
            className="h-7 px-2 border border-input rounded bg-transparent text-xs font-semibold cursor-pointer outline-none"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
          <span>danh mục / trang</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Tổng: {categories.length}</Badge>
          <Badge variant="secondary">Trang {currentPage + 1} / {totalPages}</Badge>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12 text-center">STT</TableHead>
            <TableHead className="w-16 text-center">Icon</TableHead>
            <TableHead>Tên danh mục</TableHead>
            <TableHead className="text-center">Loại danh mục</TableHead>
            <TableHead className="text-center">Màu sắc</TableHead>
            <TableHead className="text-center">Trạng thái</TableHead>
            <TableHead className="text-center w-32">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                <Loader2 className="size-5 animate-spin mx-auto text-primary mb-2" />
                <span>Đang tải danh mục...</span>
              </TableCell>
            </TableRow>
          ) : categories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                Không tìm thấy danh mục nào phù hợp
              </TableCell>
            </TableRow>
          ) : (
            paginatedCategories.map((cat, idx) => {
              const isExpense = cat.type === "EXPENSE";
              const isActive = cat.isActive !== false;
              return (
                <TableRow key={cat.id}>
                  <TableCell className="text-center font-medium text-muted-foreground">
                    {currentPage * pageSize + idx + 1}
                  </TableCell>
                  <TableCell className="text-center">
                    <div
                      className="size-8 rounded-lg flex items-center justify-center mx-auto text-white shadow-xs"
                      style={{ backgroundColor: cat.color || "#3b82f6" }}
                    >
                      {renderCategoryIcon(cat.icon, "size-4")}
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-foreground">
                    {cat.name}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={isExpense ? "destructive" : "default"}
                      className="text-[10px]"
                    >
                      {isExpense ? "Khoản chi" : "Khoản thu"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-mono text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="size-3 rounded-full border border-border"
                        style={{ backgroundColor: cat.color || "#3b82f6" }}
                      />
                      {cat.color || "#3b82f6"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={isActive ? "secondary" : "destructive"}
                      className="text-[10px]"
                    >
                      {isActive ? "Đang hoạt động" : "Đã ẩn"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        type="button"
                        onClick={() => onEdit(cat)}
                        title="Chỉnh sửa"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant={isActive ? "outline" : "secondary"}
                        size="icon-xs"
                        type="button"
                        onClick={() => onToggleStatus(cat)}
                        title={isActive ? "Ẩn danh mục" : "Hiện lại danh mục"}
                      >
                        {isActive ? (
                          <EyeOff className="size-3.5 text-muted-foreground" />
                        ) : (
                          <Eye className="size-3.5 text-primary" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        type="button"
                        onClick={() => onPermanentDelete(cat)}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        title="Xóa vĩnh viễn"
                      >
                        <Trash2 className="size-3.5" />
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
      {totalPages > 1 && (
        <div className="p-3 border-t border-border flex items-center justify-center gap-2 shrink-0 bg-card">
          <Button
            variant="outline"
            size="icon-xs"
            disabled={currentPage === 0 || loading}
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i}
              variant={currentPage === i ? "default" : "outline"}
              size="icon-xs"
              onClick={() => setCurrentPage(i)}
              className="text-xs font-bold"
            >
              {i + 1}
            </Button>
          ))}
          <Button
            variant="outline"
            size="icon-xs"
            disabled={currentPage >= totalPages - 1 || loading}
            onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </Card>
  );
};