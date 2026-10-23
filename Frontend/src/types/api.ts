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
  9999: "Lỗi hệ thống! Vui lòng thử lại sau",
};