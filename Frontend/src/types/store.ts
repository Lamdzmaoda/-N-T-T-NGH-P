import type { Category } from "./category";
import type { Transaction, TransactionRequest, TransferRequest } from "./transaction";
import type { User } from "./User";
import type { TotalBalanceResponse, Wallet } from "./wallet";

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
}
/**
 * Interface định nghĩa State & Actions cho WalletStore (Quản lý ví và số dư)
 */
export interface WalletState {
  wallets: Wallet[];                          // Danh sách ví của user
  totalBalance: TotalBalanceResponse | null;  // Tổng số dư toàn bộ ví
  loading: boolean;                           // Trạng thái đang gọi API
  fetchTotalBalance: () => Promise<void>;     // Hàm gọi API lấy tổng số dư
  fetchMyWallets: () => Promise<void>;        // Hàm gọi API lấy danh sách ví
}
/**
 * Interface định nghĩa State & Actions cho TransactionStore (Quản lý giao dịch)
 */
export interface TransactionState {
  recentTransactions: Transaction[];          // Danh sách 5 giao dịch gần đây cho Dashboard
  loading: boolean;                           // Trạng thái đang tải dữ liệu
  fetchRecentTransactions: () => Promise<void>; // Lấy 5 giao dịch gần nhất
  createTransaction: (data: TransactionRequest) => Promise<void>; // Tạo thu/chi mới
  transferMoney: (data: TransferRequest) => Promise<void>;         // Chuyển tiền
}
export interface CategoryState {
  categories: Category[];
  loading: boolean;
  fetchAllCategories: () => Promise<void>;
}