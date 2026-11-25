export type WalletType = "CASH" | "BANK" | "E_WALLET" | "CREDIT" | "SAVING";

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
export interface WalletCreationRequest {
  name: string;
  type: WalletType;
  initialBalance?: number;
  includeInTotal?: boolean;
}
export interface WalletUpdateRequest {
  name: string;
  type: WalletType;
  includeInTotal?: boolean;
}