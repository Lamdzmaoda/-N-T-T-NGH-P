package org.example.backend.dto.request.wallet;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.example.backend.enums.WalletType;
import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WalletCreationRequest {
    @NotBlank(message = "Tên ví không được để trống")
    @Size(max = 100, message = "Tên ví tối đa 100 ký tự")
    String name;
    @NotNull(message = "Loại ví không được để trống")
    WalletType type;
    // Số dư ban đầu khi tạo ví (mặc định là 0 nếu không nhập)
    @DecimalMin(value = "0.0", message = "Số dư ban đầu không được âm")
    BigDecimal initialBalance;
    // Có tính vào tổng tài sản trên màn hình chính không (mặc định true)
    Boolean includeInTotal;
}
