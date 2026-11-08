# ĐẶC TẢ KỸ THUẬT & LUỒNG NGHIỆP VỤ: SỔ GHI NỢ & CHO VAY (DEBT & LOAN TRACKING)

> **Dự án**: Smart Personal Finance Tracker (PFT)  
> **Phiên bản kiến trúc**: 2.0 (Hỗ trợ P2P Two-way Confirmation, Anti-Spam Cooldown & Event-Driven Architecture)  
> **Công nghệ áp dụng**: Spring Boot 3.4 / Java 21 / Spring Data JPA / WebSocket STOMP / Napas 247 VietQR / Swagger OpenAPI 3.0  

---

## 1. TỔNG QUAN & NGUYÊN TẮC THIẾT KẾ (DESIGN PRINCIPLES)

Module **Sổ Ghi Nợ & Cho Vay** được xây dựng nhằm giải quyết bài toán theo dõi các khoản phải thu (cho vay) và các khoản phải trả (đi vay) trong đời sống cá nhân, với các nguyên tắc cốt lõi:

1. **Độc lập với Ví số dư (Wallet Decoupled)**:  
   Module hoạt động như một cuốn sổ ghi chép công nợ thông minh. Việc tạo nợ hoặc trả nợ không tự ý cộng/trừ số dư trong các ví tiền hiện có, nhằm tránh làm sai lệch tiền mặt thực tế khi ghi nhận các khoản nợ cũ hoặc giao dịch ngoài đời thực.
2. **Bảo toàn dữ liệu (Soft Delete Only)**:  
   Không bao giờ thực hiện xóa cứng (`DELETE`) bản ghi công nợ để bảo vệ dữ liệu đối soát tài chính. Mọi thao tác xóa đều dùng cờ `isActive = false`.
3. **Xác nhận song phương (P2P Two-Way Confirmation)**:  
   Khi người dùng A ghi nợ một người dùng B cũng sử dụng app (`partnerUser = B`), khoản nợ bắt buộc phải qua bước xác nhận của B (`PENDING_CONFIRMATION ➔ ACTIVE`). Tránh tuyệt đối việc tự ý tạo nợ khống.
4. **Sổ nợ đối ứng tự động (Mirror Debt & Auto-Sync)**:  
   Khi B xác nhận nợ của A, hệ thống tự động sinh một bản ghi nợ đối ứng bên tài khoản của B với loại nợ đảo ngược (`LOAN` ➔ `DEBT`), kết nối qua `linkedDebtLoanId`. Khi một bên ghi nhận thanh toán, hệ thống tự động gạch nợ cho cả hai bên.
5. **Chống Spam quấy rối (Anti-Spam & Rate Limiting)**:  
   - Chặn gửi yêu cầu mới nếu đang có khoản nợ chờ đối tác duyệt (`PENDING_DEBT_EXISTS`).
   - Cooldown 5 giây chống Double-click (`CREATION_TOO_FREQUENT`).
   - Cooldown 24 giờ cho mỗi lần bấm nút nhắc nợ (`DEBT_REMINDER_COOLDOWN`).
6. **Kiến trúc hướng sự kiện (Event-Driven Architecture - EDA)**:  
   Tách rời logic gửi thông báo và WebSocket ra khỏi Service chính. Toàn bộ thông báo được kích hoạt qua `DebtLoanEvent` và xử lý tại `DebtLoanNotificationListener` ở pha `AFTER_COMMIT` của Database Transaction.

---

## 2. KIẾN TRÚC CƠ SỞ DỮ LIỆU (DATABASE SCHEMA)

### 2.1. Bảng `debt_loans` (Sổ nợ chính)

| Cột | Kiểu dữ liệu | Ràng buộc | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | PK, UUID | Khóa chính của khoản nợ |
| `user_id` | `VARCHAR(36)` | FK -> `users(id)`, NOT NULL | Người dùng sở hữu bản ghi sổ nợ này |
| `person_name` | `VARCHAR(100)` | NOT NULL | Tên đối tác (ví dụ: "Bạn Nam", "Bác Ba") |
| `phone` | `VARCHAR(20)` | NULL | Số điện thoại đối tác (tùy chọn) |
| `partner_user_id` | `VARCHAR(36)` | FK -> `users(id)`, NULL | ID tài khoản app của đối tác (nếu có) |
| `amount` | `DECIMAL(19,4)` | NOT NULL | Số tiền nợ gốc ban đầu |
| `remaining_amount`| `DECIMAL(19,4)` | NOT NULL | Số tiền nợ còn lại (giảm dần khi trả nợ) |
| `type` | `VARCHAR(20)` | NOT NULL | `LOAN` (Cho vay) hoặc `DEBT` (Đi vay) |
| `status` | `VARCHAR(30)` | NOT NULL | `ACTIVE`, `PAID`, `OVERDUE`, `PENDING_CONFIRMATION`, `REJECTED` |
| `due_date` | `DATE` | NULL | Ngày hẹn thanh toán nợ |
| `note` | `TEXT` | NULL | Ghi chú lý do vay/nợ |
| `bank_name` | `VARCHAR(50)` | NULL | Tên ngân hàng nhận tiền (để sinh VietQR) |
| `bank_account` | `VARCHAR(50)` | NULL | Số tài khoản ngân hàng |
| `bank_account_name` | `VARCHAR(100)` | NULL | Tên chủ tài khoản in hoa không dấu |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT TRUE | Cờ xóa mềm (FALSE: Ẩn khỏi danh sách) |
| `last_reminded_at`| `DATETIME` | NULL | Thời điểm gần nhất bấm nút nhắc nợ (tính cooldown 24h) |
| `linked_debt_loan_id` | `VARCHAR(36)` | NULL | ID của khoản nợ đối ứng bên tài khoản đối tác |
| `created_at` | `DATETIME` | NOT NULL, Updatable=False | Thời điểm tạo khoản nợ |
| `updated_at` | `DATETIME` | NULL | Thời điểm cập nhật gần nhất |

### 2.2. Bảng `debt_repayments` (Lịch sử trả nợ từng phần)

| Cột | Kiểu dữ liệu | Ràng buộc | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | PK, UUID | Khóa chính của đợt thanh toán |
| `debt_loan_id` | `VARCHAR(36)` | FK -> `debt_loans(id)`, NOT NULL | Thuộc khoản nợ nào |
| `amount` | `DECIMAL(19,4)` | NOT NULL | Số tiền trả trong đợt này |
| `repayment_date`| `DATETIME` | NOT NULL | Thời điểm trả nợ |
| `payment_method`| `VARCHAR(50)` | DEFAULT 'CASH' | Hình thức: `CASH`, `BANK_TRANSFER`... |
| `note` | `TEXT` | NULL | Ghi chú đợt trả (ví dụ: "Trả đợt 1") |
| `created_at` | `DATETIME` | NOT NULL, Updatable=False | Thời điểm ghi nhận vào hệ thống |

---

## 3. SƠ ĐỒ LUỒNG HOẠT ĐỘNG TOÀN DIỆN (SYSTEM WORKFLOW)

```mermaid
flowchart TD
    %% KHỞI TẠO NỢ & CHỐT CHẶN
    subgraph Phase1 ["1. TẠO KHOẢN NỢ & CHỐT CHẶN CHỐNG SPAM (POST /debtLoan)"]
        Start([User A tạo khoản nợ]) --> CheckSpam1{Tạo cách lần trước < 5 giây?}
        CheckSpam1 -->|Đúng| ErrSpam1[Báo lỗi 1042: Thao tác quá nhanh!]
        CheckSpam1 -->|Hợp lệ| CheckPartner{Đối tác B có tài khoản trên app không?}

        CheckPartner -->|B KHÔNG DÙNG APP| BranchOffline[status = ACTIVE ngay lập tức<br/>Sổ ghi nợ cá nhân của A]
        
        CheckPartner -->|B CÓ DÙNG APP| CheckSpam2{Đang có nợ chờ B duyệt?}
        CheckSpam2 -->|Đang có nợ chờ| ErrSpam2[Báo lỗi 1041: Đã có yêu cầu đang chờ B duyệt!]
        CheckSpam2 -->|Chưa có| BranchOnline[status = PENDING_CONFIRMATION<br/>A chưa thể nhắc nợ]
    end

    %% SỰ KIỆN EDA & DUYỆT NỢ
    subgraph Phase2 ["2. KIẾN TRÚC HƯỚNG SỰ KIỆN (EDA) & DUYỆT NỢ 2 CHIỀU"]
        BranchOnline --> PubRequest[Bắn DebtLoanEvent: REQUEST_CONFIRMATION]
        PubRequest --> Listener1[DebtLoanNotificationListener<br/>Lắng nghe AFTER_COMMIT]
        Listener1 --> PushWS1[Lưu DB Notification & Bắn WebSocket STOMP tới B]

        PushWS1 --> BChoice{User B đưa ra quyết định}
        
        BChoice -->|POST /{id}/reject| RejectFlow[status của A = REJECTED]
        RejectFlow --> PubReject[Bắn DebtLoanEvent: REJECTED]
        PubReject --> Listener2[Listener bắn WebSocket báo A: B đã từ chối]

        BChoice -->|POST /{id}/confirm| ConfirmFlow[status của A = ACTIVE]
        ConfirmFlow --> CreateMirror[Tự sinh Khoản nợ đối ứng cho B<br/>Đảo Type: LOAN <-> DEBT<br/>status = ACTIVE]
        CreateMirror --> LinkTwoSide[Gán linkedDebtLoanId kết nối 2 sổ nợ]
        LinkTwoSide --> PubConfirm[Bắn DebtLoanEvent: CONFIRMED]
        PubConfirm --> Listener3[Listener bắn WebSocket báo A: B đã xác nhận]
    end

    %% TRẢ NỢ & ĐỒNG BỘ 2 CHIỀU
    subgraph Phase3 ["3. TRẢ NỢ & TỰ ĐỘNG ĐỒNG BỘ 2 CHIỀU (POST /{id}/repayments)"]
        PayAction([A hoặc B trả nợ]) --> CheckPay{payAmount <= remaining?}
        CheckPay -->|Vượt quá| ErrPay[Báo lỗi 1033: Trả quá số nợ]
        CheckPay -->|Hợp lệ| DeductSelf[Trừ remainingAmount của người trả<br/>Nếu về 0 -> chuyển PAID]
        DeductSelf --> HasLinked{Có linkedDebtLoanId không?}
        HasLinked -->|Không| SaveSelfRepay[Lưu DebtRepayment cá nhân]
        HasLinked -->|Có| SyncMirror[TỰ ĐỘNG TÌM SỔ ĐỐI TÁC:<br/>1. Trừ remainingAmount bên đối tác<br/>2. Tự động lưu 1 DebtRepayment đồng bộ<br/>3. Nếu về 0 -> tự chuyển PAID cùng lúc!]
    end

    %% NHẮC NỢ COOLDOWN 24H
    subgraph Phase4 ["4. NHẮC NỢ QUA WEBSOCKET & COOLDOWN 24H (POST /{id}/remind)"]
        RemindAction([A bấm nút Nhắc nợ]) --> CheckRemindType{Khoản nợ hợp lệ?}
        CheckRemindType -->|B không có app| ErrNoApp[Báo lỗi 1035: Đối tác không dùng app]
        CheckRemindType -->|Chưa ACTIVE| ErrNotActive[Báo lỗi 1040: Nợ chưa xác nhận]
        CheckRemindType -->|Đi vay DEBT| ErrWrongType[Báo lỗi 1036: Không thể đòi nợ mình đi vay]
        CheckRemindType -->|Hợp lệ| CheckCooldown{Lần nhắc gần nhất < 24 giờ?}
        CheckCooldown -->|Chưa đủ 24h| ErrCooldown[Báo lỗi 1037: Chỉ được nhắc 1 lần / 24h!]
        CheckCooldown -->|Đã qua 24h| PubRemind[Bắn DebtLoanEvent: REMINDED]
        PubRemind --> Listener4[Listener bắn WebSocket nhắc nợ tới B<br/>Cập nhật lastRemindedAt = now]
    end

    %% TIỆN ÍCH QR & THỐNG KÊ
    subgraph Phase5 ["5. XEM CHI TIẾT & BẢNG ĐIỀU KHIỂN"]
        GetDetail[GET /debtLoan/{id}] --> GenQR{Có STK & còn nợ > 0?}
        GenQR -->|Có| GenVietQR[Tự sinh link VietQR Napas 247<br/>với noteText được URL-Encode chuẩn]
        GenQR -->|Không| NoQR[vietQrUrl = null]

        GetSummary[GET /debtLoan/summary] --> FilterDebts[Bỏ qua PENDING_CONFIRMATION và REJECTED]
        FilterDebts --> CalcMetrics[Tính 4 chỉ số vàng & Quá hạn:<br/>totalLent, remainingLent, totalBorrowed, remainingBorrowed, netBalance, overdueCount]
    end
```

---

## 4. QUY TẮC NGHIỆP VỤ CHI TIẾT THEO TỪNG LUỒNG

### 4.1. Luồng Tạo nợ & Chống Spam
- **Chốt chặn 1 (Anti Double-Click)**: Truy vấn khoản nợ gần nhất của User. Nếu `lastCreatedAt + 5 giây > now` ➔ Ném `CREATION_TOO_FREQUENT` (HTTP 429).
- **Chốt chặn 2 (Pending Duplicate Check)**: Nếu `partnerUserId != null`, kiểm tra xem có bản ghi nào giữa 2 user đang ở trạng thái `PENDING_CONFIRMATION` không. Nếu có ➔ Ném `PENDING_DEBT_EXISTS` (HTTP 400).
- **Phân nhánh đối tác**:
  - `partnerUser == null`: Đặt `status = ACTIVE` ngay.
  - `partnerUser != null`: Đặt `status = PENDING_CONFIRMATION`, phát sự kiện `DebtLoanEvent(REQUEST_CONFIRMATION)`.

### 4.2. Luồng Duyệt nợ song phương (Confirm / Reject)
- **Kiểm tra quyền**: Chỉ user có `currentUser.id == debt.partnerUser.id` mới được quyền duyệt. Nếu không ➔ Ném `UNAUTHORIZED_DEBT_ACTION` (HTTP 403).
- **Trạng thái hợp lệ**: Bản ghi phải đang ở `PENDING_CONFIRMATION`. Nếu không ➔ Ném `DEBT_NOT_PENDING_CONFIRMATION` (HTTP 400).
- **Khi B bấm Confirm**:
  - Bản ghi của A chuyển `status = ACTIVE`.
  - Sinh bản ghi Mirror cho B: `user = B`, `partnerUser = A`, `type = Đảo ngược` (`LOAN` ➔ `DEBT`), `status = ACTIVE`, `linkedDebtLoanId = id_của_A`.
  - Cập nhật lại `linkedDebtLoanId` của A trỏ sang B.
  - Phát sự kiện `DebtLoanEvent(CONFIRMED)` báo lại cho A.
- **Khi B bấm Reject**:
  - Chuyển `status = REJECTED`.
  - Phát sự kiện `DebtLoanEvent(REJECTED)` báo lại cho A.

### 4.3. Luồng Trả nợ & Đồng bộ 2 chiều (Repayment Sync)
- **Kiểm tra**:
  - Nợ đã `PAID` ➔ Ném `DEBT_LOAN_ALREADY_PAID`.
  - `payAmount > remainingAmount` ➔ Ném `INVALID_REPAYMENT_AMOUNT`.
  - `newRemaining = remainingAmount - payAmount`. Nếu `newRemaining == 0` ➔ `status = PAID`.
- **Đồng bộ đối ứng**:
  - Nếu `linkedDebtLoanId != null`: Tìm bản ghi đối tác.
  - Trừ `remainingAmount` bên đối tác đúng bằng `payAmount` (nếu về 0 cũng chuyển `PAID`).
  - Tự động insert một bản ghi `DebtRepayment` đồng bộ cho bên đối tác với ghi chú `[Đồng bộ] ...`.

### 4.4. Luồng Nhắc nợ & Cooldown 24h
- **Điều kiện cho phép nhắc**:
  1. `partnerUser != null` (Bắt buộc đối tác phải có tài khoản).
  2. `type == LOAN` (Chỉ người cho vay mới có quyền đòi nợ).
  3. `status == ACTIVE` (Khoản nợ phải đã được duyệt và chưa thanh toán xong).
  4. `lastRemindedAt == null || lastRemindedAt + 24h <= now` (Cooldown 24 giờ).
- Nếu vi phạm Cooldown ➔ Ném `DEBT_REMINDER_COOLDOWN` (HTTP 400).
- Nếu hợp lệ ➔ Phát sự kiện `DebtLoanEvent(REMINDED)` và cập nhật `lastRemindedAt = now`.

### 4.5. Cơ chế sinh mã VietQR Napas 247 on-the-fly
Mã VietQR **không lưu URL vào DB** mà được tính toán động khi gọi `GET /debtLoan/{id}`:
- **Điều kiện sinh QR**:
  - `status == ACTIVE`
  - `remainingAmount > 0`
  - Có đầy đủ `bankName` và `bankAccount`.
- **Cú pháp URL Napas 247**:
  ```
  https://img.vietqr.io/image/{bankName}-{bankAccount}-compact2.png?amount={remainingAmount}&addInfo={noteText}&accountName={bankAccountName}
  ```
- **Xử lý nội dung chuyển khoản thông minh (`noteText`)**:
  - Nếu `LOAN`: `"Tra no: " + personName` (Người vay quét trả chủ nợ).
  - Nếu `DEBT`: `"Tra no cho " + personName` (Chủ nợ nhận tiền).
  - Bắt buộc phải qua `URLEncoder.encode(noteText, StandardCharsets.UTF_8)` để không bị lỗi ký tự tiếng Việt và khoảng trắng.

### 4.6. Bảng điều khiển & 4 Chỉ số vàng
Hàm `getDebtLoanSummary()` tính toán các chỉ số:
- **`totalLent`**: Tổng số tiền đã cho vay (`type == LOAN`).
- **`remainingLent`**: Số tiền người khác CÒN NỢ MÌNH (Chờ thu hồi).
- **`totalBorrowed`**: Tổng số tiền mình đã đi vay (`type == DEBT`).
- **`remainingBorrowed`**: Số tiền MÌNH CÒN NỢ người khác (Chờ trả).
- **`netBalance`**: Công nợ ròng = `remainingLent - remainingBorrowed` (+: Vị thế an toàn, -: Cần cảnh giác).
- **`overdueCount`**: Số khoản nợ bị quá hạn (`today > dueDate` và chưa `PAID`).
> **Quy tắc lọc**: Tự động bỏ qua các khoản nợ có `status == PENDING_CONFIRMATION` hoặc `REJECTED` để không làm sai lệch số liệu tài chính.

---

## 5. DANH MỤC REST API & SWAGGER SPECIFICATION

**Base URL**: `/api/debtLoan`  
**Swagger Tag**: `Debt & Loan Management`  

| STT | Method | Endpoint | Mô tả nghiệp vụ | Response DTO |
| :---: | :---: | :--- | :--- | :--- |
| 1 | `POST` | `/debtLoan` | Tạo khoản nợ/vay mới (có chốt chặn anti-spam) | `DebtLoanResponse` |
| 2 | `GET` | `/debtLoan/summary` | Lấy 4 chỉ số vàng tổng quan công nợ | `DebtLoanSummaryResponse` |
| 3 | `GET` | `/debtLoan/pending-requests` | Lấy danh sách nợ đang chờ user hiện tại duyệt | `List<DebtLoanResponse>` |
| 4 | `GET` | `/debtLoan` | Lấy danh sách sổ nợ kèm bộ lọc (`type`, `status`, `search`) | `List<DebtLoanResponse>` |
| 5 | `GET` | `/debtLoan/{id}` | Xem chi tiết nợ, toàn bộ lịch sử trả & link VietQR | `DebtLoanDetailResponse` |
| 6 | `PUT` | `/debtLoan/{id}` | Cập nhật thông tin nợ / bổ sung tài khoản ngân hàng | `DebtLoanResponse` |
| 7 | `POST` | `/debtLoan/{id}/confirm` | Đối tác xác nhận nợ ➔ Kích hoạt & sinh nợ đối ứng | `DebtLoanResponse` |
| 8 | `POST` | `/debtLoan/{id}/reject` | Đối tác từ chối khoản nợ | `String` |
| 9 | `POST` | `/debtLoan/{id}/repayments` | Trả nợ từng phần / tất toán (Tự đồng bộ 2 bên) | `DebtRepaymentResponse` |
| 10 | `POST` | `/debtLoan/{id}/remind` | Nhắc nợ đối tác qua WebSocket (Cooldown 24h) | `String` |
| 11 | `DELETE` | `/debtLoan/{id}` | Xóa mềm nợ (`isActive = false`) | `Void` |

---

## 6. DANH MỤC MÃ LỖI NGHIỆP VỤ (ERROR CODES)

| Code | Tên Enum | Http Status | Thông báo lỗi (English) | Dịch hiển thị Frontend |
| :---: | :--- | :---: | :--- | :--- |
| `1032` | `DEBT_LOAN_NOT_FOUND` | 404 | Debt loan not found | Không tìm thấy khoản công nợ |
| `1033` | `INVALID_REPAYMENT_AMOUNT` | 400 | Repayment amount exceeds remaining debt | Số tiền trả vượt quá số nợ còn lại |
| `1034` | `DEBT_LOAN_ALREADY_PAID` | 400 | Debt loan is already fully paid | Khoản nợ này đã được thanh toán hết |
| `1035` | `PARTNER_NOT_REGISTERED` | 400 | Partner does not have an app account | Đối tác chưa có tài khoản app để nhận thông báo |
| `1036` | `CANNOT_REMIND_BORROWED_DEBT`| 400 | Cannot send reminder for money you borrowed | Không thể gửi lời nhắc nợ cho khoản tiền bạn đi vay |
| `1037` | `DEBT_REMINDER_COOLDOWN` | 400 | You can only send one reminder every 24 hours | Bạn chỉ có thể gửi lời nhắc nợ 1 lần mỗi 24 giờ |
| `1038` | `DEBT_NOT_PENDING_CONFIRMATION`| 400 | Debt is not in pending confirmation status | Khoản nợ không ở trạng thái chờ duyệt |
| `1039` | `UNAUTHORIZED_DEBT_ACTION` | 403 | You are not authorized to perform this action | Bạn không có quyền thao tác trên khoản nợ này |
| `1040` | `CANNOT_REMIND_UNCONFIRMED_DEBT`| 400| Cannot send reminders for unconfirmed debt | Không thể nhắc nợ khoản nợ chưa được xác nhận |
| `1041` | `PENDING_DEBT_EXISTS` | 400 | You already have a pending debt with this partner | Bạn đang có khoản nợ chờ đối tác này xác nhận |
| `1042` | `CREATION_TOO_FREQUENT` | 429 | Action too fast. Please wait a few seconds | Thao tác quá nhanh, vui lòng chờ vài giây |
