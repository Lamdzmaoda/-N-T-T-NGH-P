import type { Wallet, WalletType } from "@/types/wallet";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  Banknote,
  Landmark,
  Smartphone,
  CreditCard,
  PiggyBank,
  Layers,
  MoreVertical,
  Pencil,
  Trash2,
  CheckCircle2,
  EyeOff,
} from "lucide-react";

// Cấu hình bảng màu tươi sáng theo từng loại ví tài chính
const WALLET_CONFIG: Record<
  WalletType,
  {
    label: string;
    icon: typeof Banknote;
    iconColor: string;
    badgeColor: string;
    cardBorderHover: string;
  }
> = {
  BANK: {
    label: "Ngân hàng",
    icon: Landmark,
    iconColor: "bg-blue-50 text-blue-600 border-blue-100",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    cardBorderHover: "hover:border-blue-300",
  },
  CASH: {
    label: "Tiền mặt",
    icon: Banknote,
    iconColor: "bg-emerald-50 text-emerald-600 border-emerald-100",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cardBorderHover: "hover:border-emerald-300",
  },
  E_WALLET: {
    label: "Ví điện tử",
    icon: Smartphone,
    iconColor: "bg-amber-50 text-amber-600 border-amber-100",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    cardBorderHover: "hover:border-amber-300",
  },
  SAVING: {
    label: "Tiết kiệm",
    icon: PiggyBank,
    iconColor: "bg-purple-50 text-purple-600 border-purple-100",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    cardBorderHover: "hover:border-purple-300",
  },
  CREDIT: {
    label: "Tín dụng",
    icon: CreditCard,
    iconColor: "bg-rose-50 text-rose-600 border-rose-100",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    cardBorderHover: "hover:border-rose-300",
  },

};

interface WalletCardProps {
  wallet: Wallet;
  onEdit: (wallet: Wallet) => void;
  onDelete: (wallet: Wallet) => void;
  onToggleIncludeInTotal: (wallet: Wallet) => void;
}

export const WalletCard = ({
  wallet,
  onEdit,
  onDelete,
  onToggleIncludeInTotal,
}: WalletCardProps) => {
  const config = WALLET_CONFIG[wallet.type] || WALLET_CONFIG.CASH;
  const IconComponent = config.icon;

  const formattedBalance = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: wallet.currency || "VND",
  }).format(wallet.balance);

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-200 rounded-2xl border border-slate-200/80 bg-white shadow-xs hover:shadow-md",
        config.cardBorderHover
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex items-center gap-3">
          {/* Icon loại ví */}
          <div className={cn("p-2.5 rounded-xl border", config.iconColor)}>
            <IconComponent className="size-5" />
          </div>

          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-900 leading-tight truncate">
              {wallet.name}
            </span>
            <div className="flex items-center gap-2 mt-1">
              {/* Badge loại ví */}
              <span
                className={cn(
                  "text-[10px] font-semibold px-2 py-0.5 rounded-md border",
                  config.badgeColor
                )}
              >
                {config.label}
              </span>

              {/* Nút bấm chuyển trạng thái "Tính vào tổng" */}
              <button
                type="button"
                onClick={() => onToggleIncludeInTotal(wallet)}
                title={
                  wallet.includeInTotal
                    ? "Nhấp để bỏ tính ví này vào tổng tài sản"
                    : "Nhấp để tính ví này vào tổng tài sản"
                }
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border transition-all cursor-pointer select-none active:scale-95",
                  wallet.includeInTotal
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                    : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                )}
              >
                {wallet.includeInTotal ? (
                  <>
                    <CheckCircle2 className="size-3 text-emerald-600 shrink-0" />
                    <span>Tính vào tổng</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="size-3 text-slate-400 shrink-0" />
                    <span>Không tính</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown Menu thao tác Sửa / Xóa */}
        <DropdownMenu>
          <DropdownMenuTrigger >
            <Button
              variant="ghost"
              size="sm"
              className="size-8 p-0 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36 bg-white border-slate-200 shadow-md">
            <DropdownMenuItem
              onClick={() => onEdit(wallet)}
              className="gap-2 cursor-pointer text-xs text-slate-700 hover:bg-slate-50"
            >
              <Pencil className="size-3.5 text-blue-600" /> Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(wallet)}
              className="gap-2 cursor-pointer text-xs text-rose-600 hover:bg-rose-50"
            >
              <Trash2 className="size-3.5" /> Xóa ví
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="pt-2 pb-3">
        <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
          Số dư hiện tại
        </div>
        <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
          {formattedBalance}
        </div>
      </CardContent>

      <CardFooter className="pt-2 pb-3 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100">
        <span>Tiền tệ: {wallet.currency || "VND"}</span>
        <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold text-[11px]">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Đang sử dụng
        </span>
      </CardFooter>
    </Card>
  );
};