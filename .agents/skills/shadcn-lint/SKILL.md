---
name: shadcn-lint
description: "Agent-first design system linter and compliance rules for shadcn/ui and Tailwind CSS. Enforces semantic tokens, disallows raw colors, arbitrary values, and uncontrolled component restyling. Mandates automated verification with npm run lint."
risk: safe
source: community
date_added: "2026-03-01"
---

# shadcn-lint: Agent Design System Contract

> **Agent-First Linter & Design System Compliance Guide for shadcn/ui and Tailwind CSS.**
> Source: `https://github.com/shadcn-ui/lint` (`@shadcn/lint`)

---

## 1. Triết lý cốt lõi (Core Philosophy)

Khi AI Agent sinh mã giao diện người dùng (UI), mã phải tuân thủ nghiêm ngặt **hợp đồng hệ thống thiết kế (Design System Contract)**. Không được tự ý sáng tạo các giá trị tùy tiện, không phá vỡ cấu trúc của các component nền tảng và luôn sử dụng token ngữ nghĩa (Semantic Tokens).

Mọi vi phạm đều có thể kiểm tra tự động bằng máy thông qua `@shadcn/lint` tích hợp trong `oxlint`/`eslint`.

---

## 2. 6 Quy tắc vàng của @shadcn/lint (The 6 Golden Rules)

### Rule 1: `shadcn/no-raw-colors` — Cấm dùng màu thô & mã Hex
Tuyệt đối không sử dụng các class màu Tailwind mặc định (như `bg-blue-600`, `text-gray-500`, `border-slate-200`) hoặc mã màu Hex (`#...`). Bắt buộc dùng **Semantic Tokens** của Theme.

| ❌ Vi phạm (Raw Colors) | ✅ Hợp lệ (Semantic Tokens) | Mục đích sử dụng |
|:---|:---|:---|
| `bg-blue-600`, `bg-indigo-600` | `bg-primary text-primary-foreground` | Nền hành động chính |
| `bg-gray-100`, `bg-slate-50` | `bg-muted` hoặc `bg-secondary` | Nền thứ cấp, khối phụ |
| `bg-white`, `bg-[#ffffff]` | `bg-card` hoặc `bg-background` | Nền trang hoặc nền thẻ Card |
| `text-gray-500`, `text-slate-400` | `text-muted-foreground` | Chữ phụ, nhãn phụ, placeholder |
| `text-gray-900`, `text-black` | `text-foreground` | Chữ chính |
| `border-gray-200`, `border-slate-100` | `border-border` | Đường viền ngăn cách |
| `bg-red-500`, `text-red-600` | `bg-destructive text-destructive-foreground` | Cảnh báo, xóa, lỗi |

```tsx
// ❌ SAI:
<div className="bg-white border border-gray-200 text-gray-800">
  <p className="text-gray-500">Mô tả</p>
</div>

// ✅ ĐÚNG:
<div className="bg-card border border-border text-card-foreground">
  <p className="text-muted-foreground">Mô tả</p>
</div>
```

---

### Rule 2: `shadcn/no-arbitrary-values` — Cấm giá trị tùy tiện trong ngoặc `[...]`
Không được sử dụng ngoặc vuông để gán giá trị pixel tùy tiện (như `w-[347px]`, `p-[13px]`, `rounded-[15px]`). Luôn sử dụng tỷ lệ chuẩn của Tailwind hoặc Layout linh hoạt (`flex-1`, `w-full`, `max-w-*`).

| ❌ Vi phạm (Arbitrary Values) | ✅ Hợp lệ (Standard Scale / Utility) |
|:---|:---|
| `w-[320px]`, `w-[350px]` | `w-80` (320px), `w-full max-w-sm` |
| `h-[48px]`, `h-[40px]` | `h-12` (48px), `h-10` (40px) |
| `p-[13px]`, `p-[17px]` | `p-3` (12px), `p-4` (16px) |
| `gap-[7px]`, `gap-[11px]` | `gap-2` (8px), `gap-3` (12px) |
| `rounded-[14px]` | `rounded-xl` hoặc `rounded-2xl` |
| `text-[13px]` | `text-xs` hoặc `text-sm` |

```tsx
// ❌ SAI:
<div className="w-[380px] p-[18px] rounded-[16px] gap-[10px]">

// ✅ ĐÚNG:
<div className="w-full max-w-md p-4 rounded-2xl gap-2.5">
```

---

### Rule 3: `shadcn/no-restyle` — Không phá vỡ component nền tảng
Các component cơ sở như `Button`, `Badge`, `Card`, `Dialog` đã được thiết kế sẵn các biến thể (`variant`) và kích thước (`size`). Không được truyền các class ghi đè màu sắc hoặc cấu trúc padding trực tiếp vào `className`.

```tsx
// ❌ SAI: Ghi đè class tùy tiện lên Button
<Button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full">
  Xóa
</Button>

// ✅ ĐÚNG: Tận dụng variant và size có sẵn
<Button variant="destructive" size="lg">
  Xóa
</Button>
```

Nếu cần custom bố cục (layout) cho component, chỉ truyền các class layout như `w-full`, `mt-4`, `flex-1`.

---

### Rule 4: `shadcn/no-inline-styles` — Cấm Inline Styles
Tuyệt đối không dùng `style={{ ... }}` trừ trường hợp duy nhất là các giá trị động toán học không thể dự đoán trước (ví dụ: tọa độ kéo thả chuột hoặc góc xoay dynamic).

```tsx
// ❌ SAI:
<div style={{ backgroundColor: '#f8fafc', padding: '16px' }}>

// ✅ ĐÚNG:
<div className="bg-muted/50 p-4">
```

---

### Rule 5: `shadcn/no-unknown-classes` — Không dùng Class không tồn tại
Chỉ sử dụng các utility class hợp lệ của Tailwind CSS v4. Không viết các class lỗi thời hoặc không sinh ra CSS (ví dụ: tránh dùng `space-x-*`, `space-y-*`; hãy dùng `flex flex-col gap-*`).

---

### Rule 6: Phối hợp class có điều kiện bằng `cn()`
Luôn sử dụng helper `cn()` từ `@/lib/utils` khi ghép class hoặc class có điều kiện (conditional classes). Không nối chuỗi template string thủ công.

```tsx
// ❌ SAI:
<div className={`p-4 rounded-xl ${isActive ? 'bg-primary text-white' : 'bg-muted'}`}>

// ✅ ĐÚNG:
<div className={cn(
  "p-4 rounded-xl",
  isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
)}>
```

---

## 3. Bảng tra cứu Semantic Tokens chuẩn (Design System Cheat Sheet)

| Token Type | Tên Class Tailwind | Ý nghĩa / Ngữ cảnh sử dụng |
|:---|:---|:---|
| **Page Background** | `bg-background` | Nền tổng thể toàn bộ trang |
| **Card / Surface** | `bg-card text-card-foreground` | Nền của các thẻ Card, Modal, Dropdown |
| **Primary** | `bg-primary text-primary-foreground` | Nút chính, trạng thái active nổi bật |
| **Secondary** | `bg-secondary text-secondary-foreground` | Nút phụ, badge thứ cấp |
| **Muted** | `bg-muted text-muted-foreground` | Nền khối xám nhẹ, nhãn chú thích mờ |
| **Accent** | `bg-accent text-accent-foreground` | Hiệu ứng hover trên menu / item |
| **Destructive** | `bg-destructive text-destructive-foreground` | Hành động nguy hiểm (Xóa, Từ chối nợ) |
| **Border / Ring** | `border-border`, `ring-ring` | Đường viền các thẻ, viền focus input |

---

## 4. Quy trình tự kiểm tra bắt buộc (Mandatory Verification Loop)

Sau khi tạo mới hoặc chỉnh sửa bất kỳ file mã nguồn UI/React/Tailwind nào, **Agent BẮT BUỘC phải thực hiện quy trình sau**:

1. Chạy linter kiểm tra dự án Frontend:
   ```bash
   cd Frontend && npm run lint
   ```
2. Đọc kỹ báo cáo kết quả từ `@shadcn/lint` / `oxlint`:
   * Nếu có lỗi `shadcn/no-raw-colors`: Thay ngay bằng token ngữ nghĩa tương ứng (`bg-primary`, `text-muted-foreground`, v.v.).
   * Nếu có lỗi `shadcn/no-arbitrary-values`: Chuyển sang giá trị tỷ lệ chuẩn của Tailwind (`w-80`, `p-4`, v.v.).
   * Nếu có lỗi `shadcn/no-restyle`: Kiểm tra lại prop `variant` hoặc `size` của component.
3. Chỉ bàn giao cho người dùng khi lệnh `npm run lint` chạy thành công không có lỗi (0 errors).
