# FinFlow Development Guidelines & Agent Rules

## 1. Code Intervention Invariant (Strict)
- DO NOT directly modify or write to workspace code files (never call `edit_file` or `write_file` on application source code).
- Always provide exact file links (`file:///...`), precise line numbers, and copy-pasteable snippets for the user to review and apply themselves.

## 2. Dashboard Layout & Table Scrolling Architecture
- Admin/Dashboard containers must use `h-screen overflow-hidden` to prevent whole-page/window scrolling.
- The Sidebar and Topbar/Header are strictly fixed (`shrink-0`).
- For data list/table views:
  - Page title and filter bar must remain pinned at the top (`shrink-0`).
  - Table column headers (`TableHeader`) must be sticky (`sticky top-0 bg-card z-10`).
  - Table card pagination footer must remain pinned at the bottom (`shrink-0`).
  - ONLY the table rows viewport (`<div className="flex-1 min-h-0 overflow-y-auto">`) is permitted to scroll.

## 3. Spring Boot JPA / HQL Query Standards
- In JPQL/HQL `@Query`, use single `=` for equality (`c.isActive = true`), never double `==`.
- Always enclose composite boolean conditions in parentheses: `AND (c.isActive IS NULL OR c.isActive = true)` to avoid operator precedence bugs.
- Always filter out soft-deleted records (`isDeleted = false` or `isDeleted IS NULL OR isDeleted = false`).

## 4. Frontend Design System & Pagination Strategy
- Follow `@shadcn/lint`: 100% semantic color tokens (`bg-background`, `bg-card`, `bg-muted`, `bg-primary`, `border-border`, etc.). Never use raw tailwind colors or arbitrary values.
- Transactional entities (`Transaction`, `User`): Use Server-side Pagination with `Pageable`.
- Master/Reference entities (`Category`): Use Client-side Pagination with instant search for zero-latency UX.

## 5. Agent Workflow & Communication Protocol
- **Explain Action Plan First (Bắt buộc giải thích các bước chuẩn bị làm)**:
  - Trước khi cung cấp code, đề xuất chỉnh sửa hoặc thực hiện giải pháp, AI bắt buộc phải giải thích rõ ràng lộ trình các bước chuẩn bị làm (Mục tiêu -> Nguyên nhân -> Tuần tự từng bước 1, 2, 3...).
  - Chỉ khi đã làm rõ các bước chuẩn bị làm thì mới đi vào chi tiết từng file, số dòng và code mẫu copy-pasteable.
  - Tuyệt đối không bỏ qua bước giải thích kế hoạch hành động.

