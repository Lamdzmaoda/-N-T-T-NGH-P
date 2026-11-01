import { getErrorMessage } from "@/lib/errorHandler";
import { transactionService } from "@/services/transactionService";
import type { TransactionState } from "@/types/store";
import { toast } from "sonner";
import { create } from "zustand";

export const useTransactionStore = create<TransactionState>((set, get) => ({
    recentTransactions: [],
    loading: false,

    fetchRecentTransactions: async () =>{
        try{
            set({ loading: true});
            const recentTransactions = await transactionService.getRecentTransaction();
            set({ recentTransactions});
        }catch (error){
            console.error("Lỗi lấy giao dịch gần đây: ", error);
            toast.error(getErrorMessage(error,"Không thể tải giao dịch gần đây"));
        }finally{
            set({ loading: false});
        }
    },
    createTransaction: async( data) =>{
        try{
            set({ loading: true});
            await transactionService.createTransaction(data);
            toast.success("Thêm giao dịch thành công");
            await get().fetchRecentTransactions();
        }catch(error){
            console.error("Lỗi tạo giao dịch: ", error);
            toast.error(getErrorMessage(error,"Không thể tạo giao dịch"));
        }finally{
            set({ loading: false});
        }
    },
    transferMoney: async(data) =>{
        try{
            set({ loading: true});
            await transactionService.transferMoney(data);
            toast.success("Chuyển tiền giữa 2 ví thành công");
            await get().fetchRecentTransactions();
        }catch(error){
            console.error("Lỗi chuyển tiền giữa 2 ví: ", error);
            toast.error(getErrorMessage(error,"Không thể chuyển tiền giữa 2 ví"));
        }finally{
            set({ loading: false});
        }
    }
}))