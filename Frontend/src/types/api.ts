// src/types/api.ts

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  result?: T;
}

// Bảng map mã lỗi từ ErrorCode.java của Backend sang Tiếng Việt thân thiện
export const ERROR_MESSAGES: Record<number, string> = {
  1000: "Dữ liệu không hợp lệ",
  1001: "Tên đăng nhập hoặc email đã tồn tại trong hệ thống",
  1002: "Tên người dùng phải có ít nhất 3 ký tự",
  1003: "Mật khẩu phải có ít nhất 8 ký tự",
  1005: "Tài khoản không tồn tại trên hệ thống",
  1006: "Tài khoản hoặc mật khẩu không chính xác",
  1007: "Bạn không có quyền thực hiện thao tác này",
  1008: "Bạn phải đủ 18 tuổi trở lên",
  1012: "Bạn đã vượt quá giới hạn lượt tạo (tối đa 3 lần/phút)",
   // Lỗi Đổi mật khẩu
  1017: "Mật khẩu hiện tại không chính xác",
  1018: "Mật khẩu mới không được trùng với mật khẩu cũ",
  1019: "Mật khẩu xác nhận không khớp",
  // Lỗi Danh mục
  1010: "Không tìm thấy danh mục",
  1015: "Tên danh mục này đã tồn tại",
  // Lỗi Ví tiền
  1013: "Tên ví này đã tồn tại, vui lòng chọn tên khác",
  1014: "Không tìm thấy ví được chọn",
  1020: "Vui lòng chọn ví thực hiện giao dịch",
  // Lỗi Giao dịch (Thu / Chi / Chuyển khoản)
  1021: "Vui lòng nhập số tiền giao dịch",
  1022: "Số tiền giao dịch phải lớn hơn 0",
  1023: "Loại giao dịch không hợp lệ",
  1024: "Không tìm thấy giao dịch",
  1025: "Số dư trong ví không đủ để thực hiện giao dịch này!", // 👈 Mã 1025 của bạn đây!
  1026: "Vui lòng chọn ví nhận tiền",
  1027: "Ví chuyển và ví nhận tiền không được trùng nhau",
  1028: "Vui lòng chọn danh mục cho giao dịch",
  1029: "Loại giao dịch không hợp lệ",
  9999: "Lỗi hệ thống! Vui lòng thử lại sau",
};