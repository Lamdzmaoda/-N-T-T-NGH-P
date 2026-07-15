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

    // Lỗi khi tìm kiếm hoặc cập nhật một người dùng không có trong DB
    USER_NOT_EXISTED(1005, "user not exists", HttpStatus.NOT_FOUND),

    UNAUTHENTICATED(1006, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "You do not have permission", HttpStatus.FORBIDDEN),
    INVALID_DOB(1008, "your age must be at least {min}", HttpStatus.BAD_REQUEST),
    CATEGORY_NOT_FOUND(1009, "category not found", HttpStatus.NOT_FOUND),
    PLACE_NOT_FOUND(1010, "place not found", HttpStatus.NOT_FOUND),
    NOT_FOUND(1011, "not found", HttpStatus.NOT_FOUND),
    RATE_LIMIT_EXCEEDED(1012, "Bạn đã vượt quá giới hạn lượt gọi tạo lịch trình (tối đa 3 lần/phút). Vui lòng thử lại sau!", HttpStatus.TOO_MANY_REQUESTS),
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
