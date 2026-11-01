import { getErrorMessage } from "@/lib/errorHandler";
import { walletService } from "@/services/walletService";
import type { WalletState } from "@/types/store";
import { toast } from "sonner";
import { create } from "zustand";

export const useWalletStore = create<WalletState>((set,get) =>({
    wallets: [],
    totalBalance: null,
    loading: false,

    fetchTotalBalance: async () =>{
        try{
            set({ loading: true});
            const totalBalance = await walletService.getTotalBalance();
            set({totalBalance});
        }catch(error){
            console.error("Lỗi lấy tổng số dư: ", error);
            toast.error(getErrorMessage(error, "Không thể tải tổng tài sản"));
        }finally{
            set({ loading: false});
        }
    },
    fetchMyWallets: async () =>{
        try{
            set({ loading: true});
            const wallets = await walletService.getMyWallet();
            set({ wallets});
        } catch (error){
            console.error("lỗi lấy danh sách ví: ", error);
            toast.error(getErrorMessage(error, "Không thể tải danh sách ví"));
        }
        finally{
            set({ loading: false});
        }
    }
}))