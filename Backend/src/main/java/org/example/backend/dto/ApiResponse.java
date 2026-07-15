package org.example.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;


@Data // Tự động tạo Getter, Setter, toString, equals và hashCode
@Builder // Hỗ trợ khởi tạo đối tượng theo pattern Builder (ví dụ:
// ApiResponse.builder().code(1000).build())
@NoArgsConstructor // Tạo constructor không tham số (cần thiết cho Jackson để chuyển JSON sang
// Object)
@AllArgsConstructor // Tạo constructor đầy đủ tham số
@FieldDefaults(level = AccessLevel.PRIVATE) // Tự động đặt tất cả các field là 'private'
@JsonInclude(
        JsonInclude.Include
                .NON_NULL) // Chỉ render ra JSON những trường nào có giá trị (trường null sẽ bị ẩn đi)
public class ApiResponse <T>{
    private int code = 2000;
    private String message;
    private T result;


    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public T getResult() {
        return result;
    }

    public void setResult(T result) {
        this.result = result;
    }

}
