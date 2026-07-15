# Travel AI Planner — Database Schema (ERD)

> File này dùng làm context cho AI Agent khi sinh code Entity JPA / Repository.
> Database: MySQL 8. Quy ước: id dùng UUID (String), mọi bảng đều có create_at, update_at.

```
title Entity Relationship Diagram
notation crows-foot
colorMode bold
typeface clean

users [icon: user, color: pink] {
  id string pk
  username string
  email string
  password string
  phone int
  dob date
  full_name string
  create_at date
  update_at date
}

refreshToken [icon: json-web-tokens, color: pink] {
  id string pk
  user_id FK
  token string
  create_at date
  update_at date
}

profileUser [icon: azure-cdn-profiles, color: pink] {
  id string pk
  user_id FK
  avatar_url string
  bio string
  create_at date
  update_at date
}

roles [color: orange] {
  id string pk
  name string
  description string
  create_at date
  update_at date
}

permissions [color: orange] {
  id string pk
  name string
  description string
  create_at date
  update_at date
}

role_permissions [color: orange] {
  id string pk
  role_id FK
  permission_id FK
  create_at date
  update_at date
}

user_roles [color: orange] {
  id string pk
  user_id FK
  role_id FK
  create_at date
  update_at date
}

place_categories [color: purple] {
  id string pk
  name string
  parent_id FK
  create_at date
  update_at date
}

places [color: purple] {
  id string pk
  name string
  type enum
  google_place_id string
  photos string
  opening_hours string
  price_range string
  max_slots int
  is_visible boolean
  address string
  lat float
  lng float
  description string
  avg_rating float
  category_id FK
  create_at date
  update_at date
}

reviews [color: purple] {
  id string pk
  user_id FK
  place_id FK
  rating int
  content string
  photos string
  create_at date
  update_at date
}

place_likes [color: purple] {
  id string pk
  user_id FK
  place_id FK
  create_at date
  update_at date
}

bookings [color: red] {
  id string pk
  user_id FK
  place_id FK
  check_in date
  check_out date
  status enum
  total_price float
  note string
  create_at date
  update_at date
}

payments [color: red] {
  id string pk
  booking_id FK
  amount float
  method string
  status enum
  transaction_id string
  create_at date
  update_at date
}

transports [color: red] {
  id string pk
  user_id FK
  trip_id FK
  type enum
  pickup_location string
  dropoff_location string
  departure_time date
  price float
  status enum
  create_at date
  update_at date
}

notifications [color: red] {
  id string pk
  user_id FK
  title string
  body string
  type enum
  is_read boolean
  ref_id string
  create_at date
  update_at date
}

trips [color: white] {
  id string pk
  user_id FK
  title string
  start_date date
  end_date date
  is_favorite boolean
  status string
  create_at date
  update_at date
}

trip_itinerary [color: white] {
  id string pk
  trip_id FK
  place_id FK
  day_number int
  order_index int
  start_time string
  note string
  create_at date
  update_at date
}

ai_suggestions [color: white] {
  id string pk
  trip_id FK
  prompt string
  response string
  create_at date
  update_at date
}

users.id - refreshToken.user_id
users.id - profileUser.user_id

users.id < reviews.user_id
places.id < reviews.place_id

users.id < bookings.user_id
places.id < bookings.place_id

users.id < trips.user_id

users.id < place_likes.user_id
places.id < place_likes.place_id

bookings.id < payments.booking_id

users.id < transports.user_id
trips.id < transports.trip_id

users.id < notifications.user_id

trips.id < trip_itinerary.trip_id
places.id < trip_itinerary.place_id

trips.id < ai_suggestions.trip_id

roles.id < role_permissions.role_id
permissions.id < role_permissions.permission_id
users.id < user_roles.user_id
roles.id < user_roles.role_id

place_categories.id < places.category_id
place_categories.id < place_categories.parent_id
```

---

## Ghi chú về kiểu dữ liệu khi map sang JPA Entity

| Kiểu trong ERD | Map sang Java | Ghi chú |
|---|---|---|
| `string pk` | `String id` | Dùng UUID, generate thủ công bằng `@PrePersist` |
| `string FK` | Quan hệ `@ManyToOne` / `@OneToOne` | Map field tương ứng tên bảng cha (ví dụ `user_id` → field `User user`) |
| `date` (create_at/update_at) | `LocalDateTime` | Dùng `@CreationTimestamp` / `@UpdateTimestamp` |
| `date` (khác) | `LocalDate` hoặc `LocalDateTime` tùy field (check_in/check_out dùng LocalDate, departure_time dùng LocalDateTime) |
| `enum` | Java `enum` riêng từng loại | Lưu dạng `@Enumerated(EnumType.STRING)` (MySQL không hỗ trợ enum linh hoạt như Postgres) |
| `boolean` | `Boolean` (wrapper, không dùng primitive để tránh lỗi null) |
| `float` | `Double` hoặc `BigDecimal` cho `price`, `amount`, `total_price` (khuyến nghị `BigDecimal` để tránh sai số tiền tệ) |
| `int` | `Integer` |
| `string` (text dài như `description`, `content`, `photos`) | `@Column(columnDefinition = "TEXT")` |

## Danh sách giá trị Enum cụ thể (đối chiếu để Agent code đúng)

```
PlaceType: RESTAURANT, HOTEL, ATTRACTION
BookingStatus: PENDING, CONFIRMED, CANCELLED
PaymentStatus: PENDING, PAID, REFUNDED
PaymentMethod: MOMO, VNPAY, CARD
TransportType: CAR, BUS, MOTORBIKE
TransportStatus: PENDING, CONFIRMED, CANCELLED, COMPLETED
NotificationType: BOOKING, PAYMENT, SYSTEM
TripStatus: PLANNING, ONGOING, COMPLETED
```

## Danh sách 18 bảng theo nhóm (dùng để chia nhỏ prompt cho Agent)

1. **Auth & User**: `users`, `refreshToken`, `profileUser`
2. **RBAC**: `roles`, `permissions`, `role_permissions`, `user_roles`
3. **Places**: `place_categories`, `places`
4. **Engagement**: `reviews`, `place_likes`
5. **Booking & Payment**: `bookings`, `payments`
6. **Transport & Notification**: `transports`, `notifications`
7. **Trips**: `trips`, `trip_itinerary`, `ai_suggestions`
