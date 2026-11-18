import React from "react";
import { Plus, RotateCcw } from "lucide-react";
import type { CategoryType } from "@/types/category";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CategoryFilterBarProps {
  keyword: string;
  onKeywordChange: (val: string) => void;
  typeFilter: "ALL" | CategoryType;
  onTypeFilterChange: (val: "ALL" | CategoryType) => void;
  totalCount: number;
  expenseCount: number;
  incomeCount: number;
  onReset: () => void;
  onOpenCreate: () => void;
}

export const CategoryFilterBar = ({
  keyword,
  onKeywordChange,
  typeFilter,
  onTypeFilterChange,
  totalCount,
  expenseCount,
  incomeCount,
  onReset,
  onOpenCreate,
}: CategoryFilterBarProps) => {
  return (
    <Card>
      <CardContent className="p-4 flex flex-wrap items-center gap-3">
        {/* Lọc theo Loại Thu / Chi */}
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border">
          <Button
            type="button"
            variant={typeFilter === "ALL" ? "default" : "ghost"}
            size="xs"
            onClick={() => onTypeFilterChange("ALL")}
            className="text-xs font-semibold"
          >
            Tất cả ({totalCount})
          </Button>
          <Button
            type="button"
            variant={typeFilter === "EXPENSE" ? "destructive" : "ghost"}
            size="xs"
            onClick={() => onTypeFilterChange("EXPENSE")}
            className="text-xs font-semibold"
          >
            Khoản chi ({expenseCount})
          </Button>
          <Button
            type="button"
            variant={typeFilter === "INCOME" ? "default" : "ghost"}
            size="xs"
            onClick={() => onTypeFilterChange("INCOME")}
            className="text-xs font-semibold"
          >
            Khoản thu ({incomeCount})
          </Button>
        </div>

        {/* Ô tìm kiếm theo tên */}
        <div className="flex-1 min-w-48">
          <Input
            type="text"
            placeholder="Tìm kiếm tên danh mục..."
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            className="h-8 text-xs"
          />
        </div>

        {/* Nút reset */}
        <Button
          type="button"
          variant="secondary"
          size="icon-sm"
          onClick={onReset}
          title="Làm mới bộ lọc"
        >
          <RotateCcw className="size-4" />
        </Button>

        {/* Nút thêm mới */}
        <Button
          type="button"
          size="sm"
          onClick={onOpenCreate}
          className="ml-auto flex items-center gap-1.5"
        >
          <Plus className="size-4" />
          <span>Thêm danh mục</span>
        </Button>
      </CardContent>
    </Card>
  );
};