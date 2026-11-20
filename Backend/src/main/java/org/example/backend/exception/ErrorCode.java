package org.example.backend.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    // Lỗi hệ thống hoặc lỗi chưa xác định (thường dùng mã 9999)
    UNAUTHORIZED_EXCEPTION(9999, "Unauthorized", HttpStatus.INTERNAL_SERVER_ERROR),

    // Lỗi khi tạo người dùng nhưng tên đăng nhập đã có trong hệ thống
    USER_EXISTED(1001, "user exists", HttpStatus.BAD_REQUEST),

    // Lỗi khi một khóa (key) truyền vào không hợp lệ hoặc không tìm thấy
    INVALID_KEY(1000, "invalid message key", HttpStatus.BAD_REQUEST),

    // Lỗi Validation: Tên người dùng không đủ độ dài yêu cầu
    USER_INVALID(1002, "username must be at least {min} characters", HttpStatus.BAD_REQUEST),

    // Lỗi Validation: Mật khẩu quá ngắn
    PASSWORD_INVALID(1003, "password must be at least {min} characters", HttpStatus.BAD_REQUEST),
    PHONE_INVALID(1004, "phone must be at least {min} characters", HttpStatus.BAD_REQUEST),
    // Lỗi khi tìm kiếm hoặc cập nhật một người dùng không có trong DB
    USER_NOT_EXISTED(1005, "user not exists", HttpStatus.NOT_FOUND),

    UNAUTHENTICATED(1006, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "You do not have permission", HttpStatus.FORBIDDEN),
    INVALID_DOB(1008, "your age must be at least {min}", HttpStatus.BAD_REQUEST),
    USER_LOCKED(1009, "Tài khoản của bạn đã bị khóa bởi quản trị viên", HttpStatus.FORBIDDEN),

    CATEGORY_NOT_FOUND(1010, "category not found", HttpStatus.NOT_FOUND),
    NOT_FOUND(1011, "not found", HttpStatus.NOT_FOUND),
    RATE_LIMIT_EXCEEDED(1012, "Bạn đã vượt quá giới hạn lượt gọi tạo lịch trình (tối đa 3 lần/phút). Vui lòng thử lại sau!", HttpStatus.TOO_MANY_REQUESTS),
    WALLET_NAME_EXISTED(1013, "Wallet exists", HttpStatus.BAD_REQUEST),
    WALLET_NOT_FOUND(1014,"wallet not exists", HttpStatus.NOT_FOUND),
    CATEGORY_EXISTED(1015, "category extsts", HttpStatus.BAD_REQUEST),
    OLD_PASSWORD_INCORRECT(1017, "Old password is incorrect", HttpStatus.BAD_REQUEST),
    PASSWORD_SAME_AS_OLD(1018, "New password cannot be the same as the old password", HttpStatus.BAD_REQUEST),
    PASSWORD_NOT_MATCH(1019, "Confirm password does not match", HttpStatus.BAD_REQUEST),
    WALLET_REQUIRED(1020, "Wallet is required", HttpStatus.BAD_REQUEST),
    AMOUNT_REQUIRED(1021, "Amount is required", HttpStatus.BAD_REQUEST),
    AMOUNT_MUST_BE_GREATER_THAN_ZERO(1022, "Amount must be greater than 0", HttpStatus.BAD_REQUEST),
    TRANSACTION_TYPE_REQUIRED(1023, "Transaction type is required", HttpStatus.BAD_REQUEST),
    TRANSACTION_NOT_FOUND(1024, "Transaction not found", HttpStatus.NOT_FOUND),
    INSUFFICIENT_BALANCE(1025, "Insufficient wallet balance", HttpStatus.BAD_REQUEST),
    DESTINATION_WALLET_REQUIRED(1026, "Destination wallet is required for transfer", HttpStatus.BAD_REQUEST),
    SAME_WALLET_TRANSFER(1027, "Source and destination wallets must be different", HttpStatus.BAD_REQUEST),
    CATEGORY_REQUIRED(1028, "Category is required for expense or income", HttpStatus.BAD_REQUEST),
    INVALID_TRANSACTION_TYPE(1029, "Transcaction type invalid", HttpStatus.BAD_REQUEST),
    // Ngân sách (Budget)
    BUDGET_ALREADY_EXISTS(1030, "Budget for this category in the month already exists", HttpStatus.BAD_REQUEST),
    BUDGET_NOT_FOUND(1031, "Budget not found", HttpStatus.NOT_FOUND),
    INVALID_OTP(1033, "Mã OTP không chính xác hoặc đã hết hạn", HttpStatus.BAD_REQUEST),
    EMAIL_NOT_VERIFIED(1034, "Tài khoản chưa được kích hoạt qua email. Vui lòng xác thực mã OTP!", HttpStatus.FORBIDDEN),
    EMAIL_EXISTED(1035, "Email này đã được sử dụng trong hệ thống", HttpStatus.BAD_REQUEST),
    ;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    private int code;
    private String message;
    private HttpStatusCode statusCode;


}
