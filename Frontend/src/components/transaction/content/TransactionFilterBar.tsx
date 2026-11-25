import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTransactionStore } from "@/stores/useTransactionStore";
import { useWalletStore } from "@/stores/useWalletStore";
import { useCategoryStore } from "@/stores/useCategoryStore";
import type { TransactionType } from "@/types/transaction";
import { cn } from "@/lib/utils";
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  Calendar,
} from "lucide-react";

type TypeTab = "" | TransactionType;

const TYPE_TABS: { id: TypeTab; label: string }[] = [
  { id: "", label: "Tất cả" },
  { id: "EXPENSE", label: "Chi tiêu" },
  { id: "INCOME", label: "Thu nhập" },
  { id: "TRANSFER", label: "Chuyển tiền" },
];

export const TransactionFilterBar = () => {
  const { filters, setFilters, resetFilters, fetchTransactions } =
    useTransactionStore();
  const { wallets, fetchMyWallets } = useWalletStore();
  const { categories, fetchAllCategories } = useCategoryStore();

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [keywordInput, setKeywordInput] = useState(filters.keyword || "");

  useEffect(() => {
    if (wallets.length === 0) fetchMyWallets();
    if (categories.length === 0) fetchAllCategories();
  }, [wallets.length, categories.length, fetchMyWallets, fetchAllCategories]);

  // Debounce tìm kiếm theo từ khóa 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if ((filters.keyword || "") !== keywordInput) {
        setFilters({ keyword: keywordInput, page: 0 });
        fetchTransactions(0);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [keywordInput, filters.keyword, setFilters, fetchTransactions]);

  const handleTypeChange = (type: TypeTab) => {
    setFilters({ type, page: 0 });
    fetchTransactions(0);
  };

  const handleFilterChange = (
    key: "walletId" | "categoryId" | "startDate" | "endDate" | "minAmount" | "maxAmount",
    value: string
  ) => {
    setFilters({ [key]: value, page: 0 });
    if (key !== "minAmount" && key !== "maxAmount") {
      fetchTransactions(0);
    }
  };

  const handleReset = () => {
    setKeywordInput("");
    resetFilters();
  };

  const hasActiveFilters = Boolean(
    filters.walletId ||
      filters.categoryId ||
      filters.type ||
      filters.startDate ||
      filters.endDate ||
      filters.minAmount ||
      filters.maxAmount ||
      filters.keyword
  );

  return (
    <div className="shrink-0 bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-xs flex flex-col gap-3">
      {/* Hàng 1: Tabs lọc nhanh loại giao dịch + Tìm kiếm + Nút Bộ lọc nâng cao */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Tabs loại giao dịch */}
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl w-fit shrink-0">
          {TYPE_TABS.map((tab) => {
            const isActive = (filters.type || "") === tab.id;
            return (
              <button
                key={tab.id || "ALL"}
                type="button"
                onClick={() => handleTypeChange(tab.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
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

        {/* Tìm kiếm + Nút Bộ lọc nâng cao + Reset */}
        <div className="flex flex-wrap items-center gap-2 flex-1 lg:justify-end">
          <div className="relative flex-1 min-w-52 lg:max-w-xs">
            <Search className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              placeholder="Tìm theo ghi chú..."
              className="pl-9 h-9 text-xs border-slate-200 focus-visible:ring-blue-600 bg-slate-50/50"
            />
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced((prev) => !prev)}
            className={cn(
              "h-9 gap-1.5 text-xs border-slate-200",
              showAdvanced
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "text-slate-700 hover:bg-slate-50"
            )}
          >
            <SlidersHorizontal className="size-3.5" />
            Bộ lọc
          </Button>

          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-9 gap-1 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            >
              <RotateCcw className="size-3.5" />
              Xóa lọc
            </Button>
          )}
        </div>
      </div>

      {/* Hàng 2: Bộ lọc Ví, Danh mục, Khoảng ngày */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100">
        {/* Select Ví */}
        <select
          value={filters.walletId || ""}
          onChange={(e) => handleFilterChange("walletId", e.target.value)}
          className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 cursor-pointer"
        >
          <option value="">Tất cả ví</option>
          {wallets.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>

        {/* Select Danh mục */}
        <select
          value={filters.categoryId || ""}
          onChange={(e) => handleFilterChange("categoryId", e.target.value)}
          className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 cursor-pointer"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.type === "INCOME" ? "Thu" : "Chi"})
            </option>
          ))}
        </select>

        {/* Từ ngày */}
        <div className="relative flex items-center">
          <Calendar className="size-3.5 text-slate-400 absolute left-3 pointer-events-none" />
          <Input
            type="date"
            value={filters.startDate || ""}
            onChange={(e) => handleFilterChange("startDate", e.target.value)}
            title="Từ ngày"
            className="h-9 pl-8 text-xs border-slate-200 text-slate-700"
          />
        </div>

        {/* Đến ngày */}
        <div className="relative flex items-center">
          <Calendar className="size-3.5 text-slate-400 absolute left-3 pointer-events-none" />
          <Input
            type="date"
            value={filters.endDate || ""}
            onChange={(e) => handleFilterChange("endDate", e.target.value)}
            title="Đến ngày"
            className="h-9 pl-8 text-xs border-slate-200 text-slate-700"
          />
        </div>
      </div>

      {/* Hàng 3 (Mở rộng): Khoảng tiền minAmount - maxAmount */}
      {showAdvanced && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 pt-2 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-600 shrink-0">
            Khoảng tiền (VNĐ):
          </span>
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Input
              type="number"
              placeholder="Số tiền tối thiểu"
              value={filters.minAmount || ""}
              onChange={(e) => handleFilterChange("minAmount", e.target.value)}
              className="h-8 text-xs border-slate-200"
            />
            <span className="text-slate-400 text-xs">-</span>
            <Input
              type="number"
              placeholder="Số tiền tối đa"
              value={filters.maxAmount || ""}
              onChange={(e) => handleFilterChange("maxAmount", e.target.value)}
              className="h-8 text-xs border-slate-200"
            />
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => fetchTransactions(0)}
            className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white shrink-0"
          >
            Áp dụng mức tiền
          </Button>
        </div>
      )}
    </div>
  );
};