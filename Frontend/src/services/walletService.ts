import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { TotalBalanceResponse, Wallet } from "@/types/wallet";

export const walletService = {
    getTotalBalance: async (): Promise<TotalBalanceResponse> =>{
        const res = await api.get<ApiResponse<TotalBalanceResponse>>("/wallets/total-balance");
        return res.data.result!;
    },
    getMyWallet: async (): Promise<Wallet[]> =>{
        const res = await api.get<ApiResponse<Wallet[]>>("/wallets");
        return res.data.result!;
    }
}