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
}