import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { TotalBalanceResponse, Wallet, WalletCreationRequest, WalletUpdateRequest } from "@/types/wallet";

export const walletService = {
    getTotalBalance: async (): Promise<TotalBalanceResponse> =>{
        const res = await api.get<ApiResponse<TotalBalanceResponse>>("/wallets/total-balance");
        return res.data.result!;
    },
    getMyWallet: async (): Promise<Wallet[]> =>{
        const res = await api.get<ApiResponse<Wallet[]>>("/wallets");
        return res.data.result!;
    },
    getWalletById: async (id: string): Promise<Wallet> =>{
        const res = await api.get<ApiResponse<Wallet>>(`/wallets/${id}`);
        return res.data.result!;
    },
    createWallet: async (data: WalletCreationRequest) : Promise<Wallet> =>{
        const res = await api.post<ApiResponse<Wallet>>("/wallets", data);
        return res.data.result!;
    },
    updateWallet: async(data: WalletUpdateRequest, id: string) : Promise<Wallet> =>{
        const res = await api.put<ApiResponse<Wallet>>(`/wallets/${id}`,data);
        return res.data.result!;
    },
    transferState: async(id: string): Promise<void> => {
        const res = await api.patch<ApiResponse<void>>(`/wallets/${id}/transferState`);
    },
    deleteWallet: async(id : string): Promise<void> => {
        await api.delete<ApiResponse<void>>(`/wallets/${id}`);
    }
}