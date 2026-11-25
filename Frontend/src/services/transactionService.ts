import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { Transaction, TransactionFilterParams, TransactionRequest, TransactionUpdateRequest, TransferRequest, TransferUpdateRequest } from "@/types/transaction";
import type { PageResponse } from "@/types/User";


const buildFilterQuery = (params: TransactionFilterParams): string => {
  const query = new URLSearchParams();
  if (params.walletId) query.append("walletId", params.walletId);
  if (params.categoryId) query.append("categoryId", params.categoryId);
  if (params.type) query.append("type", params.type);
  if (params.startDate) query.append("startDate", params.startDate);
  if (params.endDate) query.append("endDate", params.endDate);
  if (params.minAmount) query.append("minAmount", params.minAmount);
  if (params.maxAmount) query.append("maxAmount", params.maxAmount);
  if (params.keyword) query.append("keyword", params.keyword);
  if (params.page !== undefined) query.append("page", params.page.toString());
  if (params.size !== undefined) query.append("size", params.size.toString());
  const qs = query.toString();
  return qs ? `?${qs}` : "";
};

export const transactionService = {
    getRecentTransaction: async (): Promise<Transaction[]> =>{
        const res = await api.get<ApiResponse<Transaction[]>>("/transactions/recent");
        return res.data.result!;
    },
    getTransactions: async (params: TransactionFilterParams): Promise<PageResponse<Transaction>> =>{
        const queryString = buildFilterQuery(params);
        const res = await api.get<ApiResponse<PageResponse<Transaction>>>(`/transactions${queryString}`);
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
    updateTransaction: async (id: string, data: TransactionUpdateRequest): Promise<Transaction> =>{
        const res = await api.put<ApiResponse<Transaction>>(`/transactions/${id}`,data);
        return res.data.result!;
    },
    updateTransfer: async (id: string, data: TransferUpdateRequest): Promise<Transaction> =>{
        const res = await api.put<ApiResponse<Transaction>>(`/transactions/${id}`,data);
        return res.data.result!;
    },
    deleteTransaction: async (id: string): Promise<void> => {
        await api.delete(`/transactions/${id}`);
    },
    getTrashTransactions: async() : Promise<Transaction[]> =>{
        const res = await api.get<ApiResponse<Transaction[]>>("/transactions/trash")
        return res.data.result!;
    },
    restoreTransaction: async (id: string): Promise<Transaction> => {
        const res = await api.put<ApiResponse<Transaction>>(
            `/transactions/trash/${id}/restore`
        );
        return res.data.result!;
    },
    permanentDeleteTransaction: async(id: string): Promise<void> =>{
        await api.delete(`/transactions/trash/${id}`);
    },
    uploadInvoice: async(file: File): Promise<string> => {
        const formData = new FormData();
        formData.append("file", file);
        const res = await api.post<ApiResponse<{ url: string}>>
        (
            "/upload/invoice",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return res.data.result!.url;
    },
    exportToExcel: async(params: TransactionFilterParams): Promise<void> =>{
        const exportParams = { ...params, page: undefined, size: undefined};
        const queryString = buildFilterQuery(exportParams);
        const res = await api.get(`/transactions/export${queryString}`, {
            responseType: "blob",
        });
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "sao_ke_giao_dich_finflow.xlsx");
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    }
}