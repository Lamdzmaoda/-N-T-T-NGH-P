
import type { CashFlowResponse, CategoryExpenseResponse, DashboardSummaryResponse } from "./analytics";
import type { BudgetProgressResponse, BudgetRequest } from "./budget";
import type { Category } from "./category";
import type { NotificationResponse } from "./notification";
import type { Transaction, TransactionFilterParams, TransactionRequest, TransactionUpdateRequest, TransferRequest, TransferUpdateRequest } from "./transaction";
import type { AdminUserFilterParams, PageResponse, User, UserUpdateRequest } from "./User";
import type { TotalBalanceResponse, Wallet, WalletCreationRequest, WalletUpdateRequest } from "./wallet";

export interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;

  setAccessToken: (accessToken: string) => void;
  clearState: () => void

  signUp: (
    username: string,
    password: string,
    email: string,
    phone: string,
    full_name: string,
  ) => Promise<void>;

  signIn: (
    username: string,
    password: string,
  ) => Promise<void>;

  signOut: () => Promise<void>;
  fetchMe: () => Promise<void>;
  refresh: () => Promise<void>;
  loginWithGoogle: (code: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  updateProfile: (data: UserUpdateRequest) => Promise<void>;
}
export interface AdminUserState {
  userPage: PageResponse<User> | null;
  loading: boolean;
  filters: AdminUserFilterParams;
  // Actions
  setFilters: (newFilters: Partial<AdminUserFilterParams>) => void;
  resetFilters: () => void;
  fetchUsers: (pageOverride?: number) => Promise<void>;
  toggleUserStatus: (userId: string) => Promise<void>;
}
/**
 * Interface định nghĩa State & Actions cho WalletStore (Quản lý ví và số dư)
 */
export interface WalletState {
  wallets: Wallet[];
  totalBalance: TotalBalanceResponse | null;
  loading: boolean;
  submitting: boolean;
  fetchTotalBalance: () => Promise<void>;
  fetchMyWallets: () => Promise<void>;
  createWallet: (data: WalletCreationRequest) => Promise<boolean>;
  updateWallet: (id: string, data: WalletUpdateRequest) => Promise<boolean>;
  deleteWallet: (id: string) => Promise<boolean>;
  toggleIncludeInTotal: (wallet: Wallet) => Promise<boolean>;
}
/**
 * Interface định nghĩa State & Actions cho TransactionStore (Quản lý giao dịch)
 */
export interface TransactionState {
  recentTransactions: Transaction[];
  transactionPage: PageResponse<Transaction> | null;
  trashTransactions: Transaction[];
  filters: TransactionFilterParams;
  loading: boolean;
  submitting: boolean;
  exporting: boolean;
  setFilters: (newFilters: Partial<TransactionFilterParams>) => void;
  resetFilters: () => void;
  fetchRecentTransactions: () => Promise<void>;
  fetchTransactions: (pageOverride?: number) => Promise<void>;
  createTransaction: (data: TransactionRequest) => Promise<void>;
  transferMoney: (data: TransferRequest) => Promise<void>;
  updateTransaction: (id: string, data: TransactionUpdateRequest) => Promise<boolean>;
  updateTransfer: (id: string, data: TransferUpdateRequest) => Promise<boolean>;
  deleteTransaction: (id: string) => Promise<boolean>;
  fetchTrashTransactions: () => Promise<void>;
  restoreTransaction: (id: string) => Promise<boolean>;
  permanentDeleteTransaction: (id: string) => Promise<boolean>;
  exportExcel: () => Promise<void>;
}
export interface CategoryState {
  categories: Category[];
  loading: boolean;
  fetchAllCategories: () => Promise<void>;
}

export interface AnalyticsState {
  summary: DashboardSummaryResponse | null;
  cashFlow: CashFlowResponse[];
  categoryExpenses: CategoryExpenseResponse[];
  loading: boolean;
  isCashFlowLoading: boolean;
  isCategoryExpensesLoading: boolean;
  fetchDashboardSummary: (month?: number, year?: number) => Promise<void>;
  fetchCashFlow: (year?: number) => Promise<void>;
  fetchCategoryExpenses: (day?: number, month?: number, year?: number) => Promise<void>;
}

export interface BudgetState {
  budgets: BudgetProgressResponse[];
  loading: boolean;
  fetchBudgetProgress: (month?: number, year?: number) => Promise<void>;
  createBudget: (data: BudgetRequest) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
}

export interface NotificationState {
  notifications: NotificationResponse[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addRealtimeNotification: (notification: NotificationResponse) => void;
}