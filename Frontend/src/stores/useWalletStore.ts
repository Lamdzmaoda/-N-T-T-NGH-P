import { getErrorMessage } from "@/lib/errorHandler";
import { walletService } from "@/services/walletService";
import type { WalletState } from "@/types/store";
import type {
  Wallet,
  WalletCreationRequest,
  WalletUpdateRequest,
} from "@/types/wallet";
import { toast } from "sonner";
import { boolean } from "zod";
import { create } from "zustand";

export const useWalletStore = create<WalletState>((set, get) => ({
  wallets: [],
  totalBalance: null,
  loading: false,
  submitting: false,

  fetchTotalBalance: async () => {
    try {
      set({ loading: true });
      const totalBalance = await walletService.getTotalBalance();
      set({ totalBalance });
    } catch (error) {
      console.error("Lỗi lấy tổng số dư: ", error);
      toast.error(getErrorMessage(error, "Không thể tải tổng tài sản"));
    } finally {
      set({ loading: false });
    }
  },
  fetchMyWallets: async () => {
    try {
      set({ loading: true });
      const wallets = await walletService.getMyWallet();
      set({ wallets });
    } catch (error) {
      console.error("lỗi lấy danh sách ví: ", error);
      toast.error(getErrorMessage(error, "Không thể tải danh sách ví"));
    } finally {
      set({ loading: false });
    }
  },
  createWallet: async (data: WalletCreationRequest) => {
    try {
      set({ submitting: true });
      await walletService.createWallet(data);
      toast.success("Tạo ví mới thành công");
      await Promise.all([get().fetchMyWallets(), get().fetchTotalBalance()]);
      return true;
    } catch (error) {
      console.error("Lỗi tạo ví:", error);
      toast.error(getErrorMessage(error, "Không thể tạo ví mới"));
      return false;
    } finally {
      set({ submitting: false });
    }
  },
  updateWallet: async (id: string, data: WalletUpdateRequest) => {
    try {
      set({ submitting: true });
      await walletService.updateWallet(data, id);
      toast.success("Cập nhập thông tin ví thành công");
      await Promise.all([get().fetchMyWallets(), get().fetchTotalBalance()]);
      return true;
    } catch (error) {
      console.error("Lỗi cập nhật ví:", error);
      toast.error(getErrorMessage(error, "Không thể cập nhật ví"));
      return false;
    } finally {
      set({ submitting: false });
    }
  },
  toggleIncludeInTotal: async (wallet: Wallet) => {
    try {
      await walletService.transferState(wallet.id);

      const newStatus = wallet.includeInTotal;
      toast.success(
          newStatus
          ? `Đã tính ví "${wallet.name}" vào tổng tài sản`
          : `Đã loại ví "${wallet.name}" khỏi tổng tài sản`
      );
      await Promise.all([get().fetchMyWallets(), get().fetchTotalBalance()]);
      return true;
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái tính tổng:", error);
      toast.error(getErrorMessage(error, "Không thể cập nhật trạng thái ví"));
      return false;
    }
  },
  deleteWallet: async (id: string) => {
    try {
      set({ submitting: true });
      await walletService.deleteWallet(id);
      toast.success("Đã xóa ví thành công");
      await Promise.all([get().fetchMyWallets(), get().fetchTotalBalance()]);
      return true;
    } catch (error) {
      console.error("Lỗi xóa ví:", error);
      toast.error(getErrorMessage(error, "Không thể xóa ví"));
      return false;
    } finally{
        set({ submitting: false });
    }
  },
}));
