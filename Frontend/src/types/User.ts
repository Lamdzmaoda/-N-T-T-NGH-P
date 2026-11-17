export interface Role {
  name: string;
  description?: string;
  permissions?: {
    name: string;
    description?: string;
  }[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string | null;
  full_name?: string | null;
  dob?: string | null;       // Chuỗi ngày nhận từ API (ISO format hoặc dd/MM/yyyy)
  avatarUrl?: string | null; // Cần cho hiển thị avatar trên header / profile
  bio?: string | null;
  roles?: Role[];            // Cần cho việc phân quyền (ADMIN, USER, ...)
  isActive?: boolean;     // Trạng thái tài khoản (true: hoạt động, false: đã khóa)
  provider?: string;      // NORMAL hoặc GOOGLE
  create_at?: string;     // Ngày tạo
}
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;         // Trang hiện tại (0-indexed)
  first: boolean;
  last: boolean;
  empty: boolean;
}
export interface AdminUserFilterParams{
  keyword?: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}
