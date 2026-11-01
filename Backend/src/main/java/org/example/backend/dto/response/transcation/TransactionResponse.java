package org.example.backend.dto.response.transcation;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.example.backend.enums.TransactionType;
import java.math.BigDecimal;
import java.time.LocalDateTime;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TransactionResponse {
    String id;
    // Thông tin ví nguồn / ví chính
    String walletId;
    String walletName;
    // Thông tin ví nhận (khi type = TRANSFER)
    String destinationWalletId;
    String destinationWalletName;
    // Thông tin danh mục
    String categoryId;
    String categoryName;
    String categoryIcon;
    String categoryColor;
    BigDecimal amount;
    TransactionType type;
    LocalDateTime transactionDate;
    String note;
    BigDecimal balanceAfter;
    String imageUrl;
    LocalDateTime createdAt;
}
