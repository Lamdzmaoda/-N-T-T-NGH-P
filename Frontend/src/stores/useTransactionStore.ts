import { getErrorMessage } from "@/lib/errorHandler";
import { transactionService } from "@/services/transactionService";
import type { TransactionState } from "@/types/store";
import type { TransactionFilterParams } from "@/types/transaction";
import { toast } from "sonner";
import { create } from "zustand";
import { useWalletStore } from "./useWalletStore";

const defaultFilters: TransactionFilterParams = {
  walletId: "",
  categoryId: "",
  type: "",
  startDate: "",
  endDate: "",
  minAmount: "",
  maxAmount: "",
  keyword: "",
  page: 0,
  size: 10,
};
const syncWalletAndTransactions = async (
  fetchTransactions: () => Promise<void>,
  fetchRecentTransactions: () => Promise<void>
) => {
  await Promise.all([
    fetchTransactions(),
    fetchRecentTransactions(),
    useWalletStore.getState().fetchMyWallets(),
    useWalletStore.getState().fetchTotalBalance(),
  ]);
};
export const useTransactionStore = create<TransactionState>((set, get) => ({
    recentTransactions: [],
    transactionPage: null,
    trashTransactions: [],
    filters: defaultFilters,
    loading: false,
    submitting: false,
    exporting: false,

    setFilters: (newFilters) =>{
        set((state) => ({
            filters: { ...state.filters, ...newFilters},
        }));
    },
    resetFilters: () => {
        set({ filters: defaultFilters });
        get().fetchTransactions(0);
    },


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

    fetchTransactions: async (pageOverride) => {
        try {
            set({ loading: true });
            const currentFilters = get().filters;
            const targetPage = pageOverride !== undefined ? pageOverride : (currentFilters.page ?? 0);

            const params: TransactionFilterParams = {
                ...currentFilters, page: targetPage,
            }
            const data = await transactionService.getTransactions(params);
            set({
                transactionPage: data,
                filters: { ...currentFilters, page: targetPage},
            })
        } catch (error) {
      console.error("Lỗi tải danh sách giao dịch:", error);
      toast.error(getErrorMessage(error, "Không thể tải danh sách giao dịch"));
    } finally {
      set({ loading: false });
    }
    },
    createTransaction: async( data) =>{
        try{
            set({ loading: true});
            await transactionService.createTransaction(data);
            toast.success("Thêm giao dịch thành công");
            await syncWalletAndTransactions(
                () => get().fetchTransactions(),
                get().fetchRecentTransactions
            ); 
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
            await syncWalletAndTransactions(
                () => get().fetchTransactions(),
                get().fetchRecentTransactions
            ); 
        }catch(error){
            console.error("Lỗi chuyển tiền giữa 2 ví: ", error);
            toast.error(getErrorMessage(error,"Không thể chuyển tiền giữa 2 ví"));
        }finally{
            set({ loading: false});
        }
    },
    updateTransaction: async(id, data) => {
        try {
            set({submitting: true});
            await transactionService.updateTransaction(id, data);
            toast.success('Cập nhập giao dịch thành công');
            await syncWalletAndTransactions(
                () => get().fetchTransactions(),
                get().fetchRecentTransactions
            );                      
            return true;
        } catch (error) {
            console.error("Lỗi cập nhật giao dịch:", error);
      toast.error(getErrorMessage(error, "Không thể cập nhật giao dịch"));
      return false;
    } finally {
      set({ submitting: false });
    }
  },
  updateTransfer: async(id, data) => {
        try {
            set({submitting: true});
            await transactionService.updateTransfer(id, data);
            toast.success('Cập nhập giao dịch thành công');
            await syncWalletAndTransactions(
                () => get().fetchTransactions(),
                get().fetchRecentTransactions
            );                      
            return true;
        } catch (error) {
            console.error("Lỗi cập nhật giao dịch:", error);
      toast.error(getErrorMessage(error, "Không thể cập nhật giao dịch"));
      return false;
    } finally {
      set({ submitting: false });
    }
 },
 deleteTransaction: async(id) => {
    try {
        set({submitting: true});
        await transactionService.deleteTransaction(id);
        toast.success("Đã chuyển giao dịch vào thùng rác và hoàn trả số dư");
        await syncWalletAndTransactions(
        () => get().fetchTransactions(),
        get().fetchRecentTransactions
      );
      return true;
    } catch (error) {
      console.error("Lỗi xóa giao dịch:", error);
      toast.error(getErrorMessage(error, "Không thể xóa giao dịch"));
      return false;
    } finally {
      set({ submitting: false });
    }
 },
 fetchTrashTransactions: async () => {
    try {
      const trashTransactions = await transactionService.getTrashTransactions();
      set({ trashTransactions });
    } catch (error) {
      console.error("Lỗi lấy thùng rác:", error);
      toast.error(getErrorMessage(error, "Không thể tải thùng rác"));
    }
  },
 restoreTransaction: async (id) =>{
    try {
        set({submitting: true});
        await transactionService.restoreTransaction(id);
        toast.success("Đã khôi phục giao dịch thành công");
      await Promise.all([
        get().fetchTrashTransactions(),
        syncWalletAndTransactions(
          () => get().fetchTransactions(),
          get().fetchRecentTransactions
        ),
      ]);
      return true;
    } catch (error) {
      console.error("Lỗi khôi phục giao dịch:", error);
      toast.error(getErrorMessage(error, "Không thể khôi phục giao dịch"));
      return false;
    } finally {
      set({ submitting: false });
    }
  },
  permanentDeleteTransaction: async (id) => {
    try {
      set({ submitting: true });
      await transactionService.permanentDeleteTransaction(id);
      toast.success("Đã xóa vĩnh viễn giao dịch");
      await get().fetchTrashTransactions();
      return true;
    } catch (error) {
      console.error("Lỗi xóa vĩnh viễn:", error);
      toast.error(getErrorMessage(error, "Không thể xóa vĩnh viễn"));
      return false;
    } finally {
      set({ submitting: false });
    }
  },
  exportExcel: async() => {
    try {
        set({exporting: true});
        await transactionService.exportToExcel(get().filters);
        toast.success("Đã xuất báo cáo Excel thành công");
    } catch (error) {
        console.error("Lỗi xuất Excel:", error);
      toast.error(getErrorMessage(error, "Không thể xuất file Excel"));
    } finally {
      set({ exporting: false });
    }
  },
}));