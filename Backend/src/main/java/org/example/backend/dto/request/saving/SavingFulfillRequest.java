package org.example.backend.dto.request.saving;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SavingFulfillRequest {
    @NotBlank(message = "Vui lòng chọn danh mục chi tiêu cho khoản mua sắm này")
    String categoryId;
    String note;
}