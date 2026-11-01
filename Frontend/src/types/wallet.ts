export type WalletType = "CASH" | "BANK" | "E_WALLET" | "CREDIT" | "CARD" | "SAVING";

export interface Wallet {
  id: string;
  name: string;
  balance: number;
  currency: string;
  type: WalletType;
  includeInTotal: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TotalBalanceResponse {
  totalBalance: number;
  currency: string;
  totalWallets: number;
}