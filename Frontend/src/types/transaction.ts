export type TransactionType = "EXPENSE" | "INCOME" | "TRANSFER";

export interface Transaction {
  id: string;
  walletId: string;
  walletName: string;
  destinationWalletId?: string;
  destinationWalletName?: string;
  categoryId?: string;
  categoryName?: string;
  categoryIcon?: string;
  categoryColor?: string;
  amount: number;
  type: TransactionType;
  transactionDate: string;
  note?: string;
  balanceAfter: number;
  imageUrl?: string;
  createdAt: string;
}

export interface TransactionRequest {
  walletId: string;
  categoryId: string;
  amount: number;
  type: "EXPENSE" | "INCOME";
  transactionDate?: string;
  note?: string;
  imageUrl?: string;
}

export interface TransferRequest {
  sourceWalletId: string;
  destinationWalletId: string;
  amount: number;
  transactionDate?: string;
  note?: string;
}
export interface TransactionUpdateRequest {
  categoryId?: string;
  transactionDate?: string;
  note?: string;
  imageUrl?: string;
  walletId?: string;
  amount?: number;
}
export interface TransferUpdateRequest {
  sourceWalletId?: string;
  destinationWalletId?: string;
  amount?: number;
  transactionDate?: string;
  note?: string;
}
export interface TransactionFilterParams {
  walletId?: string;
  categoryId?: string;
  type?: TransactionType | "";
  startDate?: string;
  endDate?: string;
  minAmount?: string;
  maxAmount?: string;
  keyword?: string;
  page?: number;
  size?: number;
}