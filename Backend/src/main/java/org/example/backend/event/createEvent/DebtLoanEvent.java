package org.example.backend.event.createEvent;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.experimental.FieldDefaults;
import org.example.backend.entity.User.User;
import org.example.backend.entity.debt.DebtLoan;
/**
 * Sự kiện phát sinh khi có tương tác công nợ giữa 2 người dùng.
 */
@Getter
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DebtLoanEvent {
    DebtLoan debtLoan;       // Khoản nợ phát sinh sự kiện
    User actor;              // Người thực hiện hành động (Người tạo / Người duyệt / Người nhắc)
    DebtLoanAction action;   // Loại hành động

    public enum DebtLoanAction {
        REQUEST_CONFIRMATION, // A tạo nợ -> Yêu cầu B xác nhận
        CONFIRMED,            // B bấm xác nhận -> Báo cho A
        REJECTED,             // B bấm từ chối -> Báo cho A
        REMINDED              // A bấm nhắc nợ -> Báo cho B
    }


}
