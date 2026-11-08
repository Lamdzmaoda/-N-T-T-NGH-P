import React, { useState, useEffect } from "react";
// Import các UI primitives chính thức từ shadcn
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Loader2,
} from "lucide-react";

// Import các Store theo đúng chuẩn kiến trúc của dự án
import { useWalletStore } from "@/stores/useWalletStore";
import { useTransactionStore } from "@/stores/useTransactionStore";
import { categoryService } from "@/services/categoryService";
import type { Category } from "@/types/category";
import { useAnalyticsStore } from "@/stores/useAnalyticsStore";
import { useBudgetStore } from "@/stores/useBudgetStore";

interface AddTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
type TabType = "EXPENSE" | "INCOME" | "TRANSFER";

const AddTransactionModal = ({
  open,
  onOpenChange,
}: AddTransactionModalProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("EXPENSE");

  const { wallets, fetchMyWallets, fetchTotalBalance } = useWalletStore();
  const { createTransaction, transferMoney } = useTransactionStore();

  const [categories, setCategories] = useState<Category[]>([]);

  const getLocalDatetimeString = () =>{
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0,16);
  }
  // 4. Các trường nhập liệu trong Form
  const [amount, setAmount] = useState<string>("");
  const [walletId, setWalletId] = useState<string>("");
  const [destinationWalletId, setDestinationWalletId] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [transactionDate, setTransactionDate] = useState<string>(
    getLocalDatetimeString()
  );
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (wallets.length > 0) {
      if (!walletId) setWalletId(wallets[0].id);
      if (wallets.length > 1 && !destinationWalletId) {
        setDestinationWalletId(wallets[1].id);
      }
    }
  }, [wallets, walletId, destinationWalletId]);
  useEffect(() =>{
    if(open) {
      categoryService.getAllCategories().then(setCategories).catch(console.error);
      fetchMyWallets();
    }
  }, [open, fetchMyWallets]);
  const filteredCategories = categories.filter(
    (cat) => cat.type === activeTab,
  );

  const handleClose = () => {
    setAmount("");
    setNote("");
    setCategoryId("");
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast.error("Vui lòng nhập số tiền hợp lệ (> 0)");
      return;
    }

    setSubmitting(true);

    try {
      if (activeTab === "TRANSFER") {
        if (!walletId || !destinationWalletId) {
          toast.error("Vui lòng chọn đầy đủ ví chuyển và ví nhận");
          return;
        }
        if (walletId === destinationWalletId) {
          toast.error("Ví chuyển và ví nhận không được trùng nhau");
          return;
        }
        await transferMoney({
          sourceWalletId: walletId,
          destinationWalletId,
          amount: numericAmount,
          transactionDate: transactionDate ? `${transactionDate}:00` : undefined,
          note: note.trim() || undefined,
        });
      } else {
        if (!walletId) {
          toast.error("Vui lòng chọn ví thanh toán");
          return;
        }
        if (!categoryId) {
          toast.error("Vui lòng chọn danh mục");
          return;
        }
        await createTransaction({
          walletId,
          categoryId,
          amount: numericAmount,
          type: activeTab,
          transactionDate: transactionDate ? `${transactionDate}:00` : undefined,
          note: note.trim() || undefined,
        });
      }
      await fetchTotalBalance();
      await useAnalyticsStore.getState().fetchDashboardSummary();
      await useBudgetStore.getState().fetchBudgetProgress()
      handleClose();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN").format(val);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-120 p-6 rounded-3xl bg-background border shadow-2xl">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
            Thêm giao dịch mới
          </DialogTitle>
        </DialogHeader>
        {/* Component Tabs chính thức của shadcn UI */}
        <Tabs
          value={activeTab}
          onValueChange={(val) => {
            setActiveTab(val as TabType);
            setCategoryId("");
          }}
          className="w-full mb-4"
        >
          <TabsList className="grid w-full grid-cols-3 h-11 p-1 rounded-2xl bg-muted">
            <TabsTrigger
              value="EXPENSE"
              className="rounded-xl text-xs font-bold gap-1.5 data-[state=active]:bg-background data-[state=active]:text-rose-600 data-[state=active]:shadow-xs transition-all"
            >
              <ArrowDownLeft className="h-4 w-4" />
              <span>Chi tiêu</span>
            </TabsTrigger>
            <TabsTrigger
              value="INCOME"
              className="rounded-xl text-xs font-bold gap-1.5 data-[state=active]:bg-background data-[state=active]:text-emerald-600 data-[state=active]:shadow-xs transition-all"
            >
              <ArrowUpRight className="h-4 w-4" />
              <span>Thu nhập</span>
            </TabsTrigger>
            <TabsTrigger
              value="TRANSFER"
              className="rounded-xl text-xs font-bold gap-1.5 data-[state=active]:bg-background data-[state=active]:text-blue-600 data-[state=active]:shadow-xs transition-all"
            >
              <ArrowLeftRight className="h-4 w-4" />
              <span>Chuyển tiền</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        {/* Form nhập liệu */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Ô nhập số tiền */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">
              Số tiền (₫)
            </Label>
            <Input
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-11 text-lg font-black rounded-xl text-foreground"
              autoFocus
              required
            />
          </div>
          {activeTab === "TRANSFER" ? (
            /* Phần chọn 2 ví khi Chuyển tiền */
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Từ ví
                </Label>
                <select
                  value={walletId}
                  onChange={(e) => setWalletId(e.target.value)}
                  className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({formatCurrency(w.balance)}₫)
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Đến ví
                </Label>
                <select
                  value={destinationWalletId}
                  onChange={(e) => setDestinationWalletId(e.target.value)}
                  className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({formatCurrency(w.balance)}₫)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            /* Phần chọn Ví và Danh mục khi Thu / Chi */
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Ví thanh toán
                </Label>
                <select
                  value={walletId}
                  onChange={(e) => setWalletId(e.target.value)}
                  className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({formatCurrency(w.balance)}₫)
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Danh mục
                </Label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                >
                  <option value="">-- Chọn danh mục --</option>
                  {filteredCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          {/* Ngày giờ giao dịch */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">
              Thời gian
            </Label>
            <Input
              type="datetime-local"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="h-10 text-xs font-medium rounded-xl"
            />
          </div>
          {/* Ghi chú */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">
              Ghi chú (tùy chọn)
            </Label>
            <Input
              type="text"
              placeholder="VD: Ăn trưa bún bò, Đổ xăng..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="h-10 text-xs font-medium rounded-xl"
            />
          </div>
          {/* Nút hành động */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
              className="h-10 text-xs font-bold rounded-xl cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className={`h-10 px-5 text-xs font-bold rounded-xl text-white shadow-md transition-all cursor-pointer ${
                activeTab === "EXPENSE"
                  ? "bg-rose-600 hover:bg-rose-700 shadow-rose-500/20"
                  : activeTab === "INCOME"
                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                    : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "Lưu giao dịch"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTransactionModal;
