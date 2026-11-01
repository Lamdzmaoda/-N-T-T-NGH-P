# Smart Personal Finance Tracker (PFT)

Ứng dụng quản lý tài chính cá nhân thông minh, theo dõi dòng tiền, ngân sách và phân tích tài chính với sự hỗ trợ của AI.

## Language

### Tài khoản & Người dùng

**User**:
Chủ thể xác thực và sở hữu toàn bộ dữ liệu tài chính (ví, giao dịch, danh mục, ngân sách).
_Avoid_: Account, Customer, Client, Member

**Profile**:
Thông tin cá nhân bổ trợ của User (họ tên, ảnh đại diện, tiểu sử, ngày sinh).
_Avoid_: UserInfo, Detail

### Tiền tệ & Ví

**Wallet**:
Một nguồn lưu trữ tiền tệ cụ thể của người dùng (ví dụ: Tiền mặt, Tài khoản Vietcombank, Ví MoMo).
_Avoid_: Account, BankAccount, MoneyBag, Purse

**Wallet Type**:
Phân loại bản chất của ví (`CASH`, `BANK`, `E_WALLET`, `CREDIT`, `CARD`, `SAVING`).
_Avoid_: WalletCategory, AccountType

**Total Balance**:
Tổng số tiền cộng gộp từ tất cả các ví đang hoạt động có bật cờ tính vào tài sản (`includeInTotal = true`).
_Avoid_: TotalMoney, NetWorth, Balance

**Include In Total**:
Cờ xác định số dư của một ví có được cộng vào Tổng tài sản chung hay không.
_Avoid_: IsSum, CountInTotal

### Sổ cái & Giao dịch

**Transaction**:
Bản ghi sổ cái ghi nhận sự biến động tiền bạc của một ví tại một thời điểm cụ thể.
_Avoid_: Log, History, Record, Order, Payment

**Expense**:
Khoản chi tiêu làm giảm số dư của ví và giảm Tổng tài sản, bắt buộc gán vào một Danh mục chi tiêu.
_Avoid_: Spending, Payout, Cost, Outflow

**Income**:
Khoản thu nhập làm tăng số dư của ví và tăng Tổng tài sản, bắt buộc gán vào một Danh mục thu nhập.
_Avoid_: Earning, Revenue, Inflow, Deposit

**Transfer**:
Hành động chuyển tiền nội bộ giữa Ví nguồn và Ví đích của cùng một người dùng, không làm thay đổi Tổng tài sản.
_Avoid_: MoveMoney, SendMoney, Exchange

**Balance After**:
Ảnh chụp số dư của ví ngay sau khi hoàn thành giao dịch (phục vụ đối soát và vẽ biểu đồ dòng tiền).
_Avoid_: CurrentBalance, NewBalance, Remaining

### Phân loại & Giới hạn

**Category**:
Nhãn phân loại mục đích của dòng tiền (ví dụ: Ăn uống, Tiền lương). Luôn thuộc một trong hai loại: EXPENSE hoặc INCOME.
_Avoid_: Group, Tag, Label, Type

**Budget**:
Hạn mức chi tiêu tối đa được đặt cho một Danh mục cụ thể trong một khoảng thời gian (thường là theo tháng).
_Avoid_: Limit, Cap, Plan
