package org.example.backend.dto.response.wallet;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.example.backend.enums.WalletType;
import java.math.BigDecimal;
import java.time.LocalDateTime;
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WalletResponse {
    String id;
    String name;
    BigDecimal balance;
    String currency;
    WalletType type;
    Boolean includeInTotal;
    LocalDateTime createdAt;
}
