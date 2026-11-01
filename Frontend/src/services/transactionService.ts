import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { Transaction, TransactionRequest, TransferRequest } from "@/types/transaction";


export const transactionService = {
    getRecentTransaction: async (): Promise<Transaction[]> =>{
        const res = await api.get<ApiResponse<Transaction[]>>("/transactions/recent");
        return res.data.result!;
    },
    createTransaction: async (data: TransactionRequest): Promise<Transaction> => {
        const res = await api.post<ApiResponse<Transaction>>("/transactions", data);
        return res.data.result!;
    },
    transferMoney: async (data: TransferRequest): Promise<Transaction> => {
        const res = await api.post<ApiResponse<Transaction>>("/transactions/transfer", data);
        return res.data.result!;
    },
    deleteTransaction: async (id: string): Promise<void> => {
        await api.delete(`/transaction/${id}`);
    }
}