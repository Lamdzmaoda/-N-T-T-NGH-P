# 🤖 Lộ trình dùng AI Agent để code Travel AI Planner (Backend Spring Boot)

> Thời gian: nay → 16/7. Áp dụng cho người phụ trách Backend.
> Nguyên tắc: làm theo từng giai đoạn nhỏ, mỗi giai đoạn agent code xong → bạn đọc lại, chạy thử, commit → mới sang giai đoạn sau.
> KHÔNG yêu cầu agent code hết 18 bảng + 59 endpoint trong 1 prompt — sẽ sai sót khó kiểm soát.

---

## Giai đoạn 0 — Setup nền tảng (Ngày 1)

### Bước 1: Tạo project (đã làm — IntelliJ Spring Initializr)

### Bước 2: Prompt cho agent — cấu hình project

```
Tôi có project Spring Boot 4.1.0 với các dependency: Spring Security, Lombok,
Spring Web, Validation, Spring Data JPA, Spring Data Redis, MySQL Driver,
Spring Boot DevTools, Docker Compose Support.

Hãy giúp tôi:
1. Tạo file application.yml cấu hình MySQL (database: travel_db),
   dùng biến môi trường cho username/password (đọc qua ${DB_USERNAME}, ${DB_PASSWORD})
2. Tạo docker-compose.yml chạy MySQL 8 + Redis ở local, map port 3306 và 6379
3. Tạo cấu trúc package chuẩn theo layered architecture:
   com.travelplanner
   ├── config/
   ├── domain/ (entity)
   ├── repository/
   ├── service/
   ├── controller/
   ├── dto/
   ├── exception/
   ├── security/
   └── util/
4. Thêm các dependency còn thiếu vào pom.xml: jjwt (0.12.6), mapstruct (1.6.3),
   springdoc-openapi-starter-webmvc-ui (2.6.0)
5. Tạo file .env.example và .gitignore chuẩn cho Spring Boot
```

✅ Checklist sau bước này: chạy `docker compose up -d`, app start không lỗi, kết nối MySQL thành công.

---

## Giai đoạn 1 — Database & Entity (Ngày 2–4)

> Đưa nguyên file ERD (.eraser hoặc paste text) cho agent đọc trước khi code.

### Prompt mẫu (chia nhỏ theo nhóm bảng, KHÔNG làm 1 lần 18 bảng):

```
Đây là ERD hệ thống của tôi (dán nguyên đoạn code Eraser ERD vào đây).

Hãy tạo Entity JPA cho NHÓM bảng sau: users, refreshToken, profileUser
- Dùng Lombok (@Getter, @Setter, @Builder, @NoArgsConstructor, @AllArgsConstructor)
- id dùng UUID (String), tự generate bằng @PrePersist
- create_at, update_at tự động set bằng @CreationTimestamp, @UpdateTimestamp
- Map đúng quan hệ @OneToOne giữa users và profileUser, refreshToken
- password KHÔNG bao giờ trả ra trong toString() hoặc JSON (dùng @JsonIgnore)
- Tạo kèm Repository interface (extends JpaRepository) cho từng entity
```

Lặp lại prompt này cho từng nhóm, theo đúng thứ tự ưu tiên:

| Thứ tự | Nhóm bảng | Ngày |
|---|---|---|
| 1 | `users`, `refreshToken`, `profileUser` | Ngày 2 |
| 2 | `roles`, `permissions`, `role_permissions`, `user_roles` | Ngày 2 |
| 3 | `places`, `place_categories` | Ngày 3 |
| 4 | `reviews`, `place_likes` | Ngày 3 |
| 5 | `bookings`, `payments` | Ngày 3 |
| 6 | `transports`, `notifications` | Ngày 4 |
| 7 | `trips`, `trip_itinerary`, `ai_suggestions` | Ngày 4 |

✅ Checklist: chạy app, kiểm tra Hibernate tự tạo đúng 18 bảng trong MySQL (`ddl-auto: update`), đúng FK như ERD.

---

## Giai đoạn 2 — Authentication & Security (Ngày 5–7)

### Prompt 1 — JWT utility:
```
Tạo class JwtUtil trong package security/:
- Generate access token (hết hạn 15 phút) và refresh token (hết hạn 7 ngày)
- Verify token, extract userId từ token
- Dùng thư viện jjwt 0.12.6, secret key đọc từ application.yml (biến JWT_SECRET)
```

### Prompt 2 — Security config:
```
Tạo SecurityConfig:
- Disable CSRF (dùng JWT, stateless)
- Public endpoints: /api/auth/**, /api/places/** (GET), /api/weather/**, /api/traffic/**
- User endpoints: cần ROLE_USER
- Admin endpoints (/api/admin/**): cần ROLE_ADMIN
- Tạo JwtAuthenticationFilter để verify token mỗi request
- Password encoder dùng BCrypt
```

### Prompt 3 — Auth APIs (đối chiếu file Excel endpoint của bạn):
```
Dựa theo bảng endpoint sau (copy đúng từ sheet 🔐 Auth trong file Excel),
implement đầy đủ AuthController + AuthService:

POST /api/auth/register — body: username, email, password, full_name, phone, dob
  - Check username/email trùng → trả lỗi 409
  - Mã hóa password bằng BCrypt
  - Trả về user + accessToken

POST /api/auth/login — body: email/username, password
  - Trả 401 nếu sai thông tin
  - Trả accessToken + refreshToken (lưu refreshToken vào bảng refreshToken)

POST /api/auth/logout — thu hồi refresh token

POST /api/auth/refresh — cấp accessToken mới từ refreshToken

GET /api/auth/me — trả thông tin user đang đăng nhập (cần token)

Dùng format response thống nhất: { "success": true, "data": {...} }
Lỗi: { "success": false, "error": { "code": 400, "message": "..." } }
Tạo GlobalExceptionHandler (@ControllerAdvice) xử lý tất cả exception
```

✅ Checklist: test bằng Postman/Swagger — đăng ký, đăng nhập, gọi /me với token, refresh token đều chạy đúng.

---

## Giai đoạn 3 — Module Places & Reviews (Ngày 8–9)

```
Dựa theo sheet 📍 Places trong file Excel endpoint, implement:
- PlaceController, PlaceService (CRUD + filter theo type/category/search, phân trang)
- Admin endpoints thêm/sửa/ẩn/xóa place (chỉ ROLE_ADMIN)
- ReviewController (đăng/sửa/xóa review, validate rating 1-5, chỉ chủ review mới sửa/xóa được)
- PlaceLikeController (like/unlike, trả 409 nếu đã like rồi)
- Dùng DTO request/response riêng (không trả thẳng Entity), map bằng MapStruct
```

✅ Checklist: test toàn bộ flow CRUD place qua Swagger, kiểm tra phân quyền Admin đúng.

---

## Giai đoạn 4 — Module Trips & AI (Ngày 10–12) ⭐ Quan trọng nhất

```
Implement module Trip theo sheet 🗺️ Trips:
1. Tạo GeminiService gọi Gemini API (dùng WebClient), nhận input:
   destination, days, budget, preferences[]
   → build prompt yêu cầu Gemini trả về JSON có cấu trúc:
   { "itinerary": [ { "day": 1, "places": [...], "notes": "..." } ] }
2. TripController: POST /api/trips/generate
   - Gọi GeminiService, parse JSON response
   - Lưu vào bảng trips + trip_itinerary + ai_suggestions
   - Nếu Gemini lỗi/timeout → trả 502, không để app crash
3. CRUD trip còn lại: GET list, GET detail, PUT update, DELETE, PATCH favorite
4. Itinerary: thêm/sửa/xóa địa điểm trong lịch trình

Lưu ý: bọc gọi Gemini trong try-catch riêng, retry tối đa 2 lần nếu timeout.
```

✅ Checklist: tạo thử 1 lịch trình thật, kiểm tra dữ liệu lưu đúng vào 3 bảng liên quan.

---

## Giai đoạn 5 — Booking, Payment, Transport (Ngày 13–14)

```
Implement theo sheet 🏨 Bookings:
- BookingController: tạo/xem/hủy booking, check max_slots trước khi cho đặt (trả 409 nếu hết chỗ)
- PaymentController: thanh toán giả lập — tạo payment với status "paid" ngay
  (KHÔNG cần tích hợp VNPay/Momo thật, chỉ giả lập transaction_id ngẫu nhiên)
- TransportController: đặt xe giả lập, estimate giá theo khoảng cách (dùng Google Maps
  Distance Matrix API thật nếu kịp, không thì giả lập công thức tính giá theo km)
- Mỗi khi thanh toán thành công → tự tạo 1 notification cho user
```

✅ Checklist: full flow đặt chỗ → thanh toán → nhận thông báo chạy đúng.

---

## Giai đoạn 6 — Weather, Traffic, Notification, Admin Stats (Ngày 15)

```
1. WeatherController: gọi OpenWeatherMap API, cache kết quả 30 phút bằng Redis
   (@Cacheable) để tránh gọi API quá nhiều lần
2. TrafficController: gọi Google Maps Distance Matrix API
3. NotificationController: CRUD đầy đủ theo sheet 🔔 Notif & Weather
4. AdminController: thống kê tổng quan — dùng JPQL query COUNT, SUM
   cho total_users, total_trips, total_bookings, revenue theo tháng
```

✅ Checklist: tất cả external API có xử lý lỗi 502 khi service ngoài bị down.

---

## Giai đoạn 7 — Test, Swagger, Polish (Ngày 16)

```
1. Generate Swagger documentation đầy đủ (@Operation, @ApiResponse annotation)
   cho toàn bộ 59 endpoint, group theo tag tương ứng 7 module
2. Viết unit test cho AuthService và BookingService (2 module quan trọng nhất)
3. Review lại toàn bộ GlobalExceptionHandler — đảm bảo không có lỗi nào trả về
   500 mà thực chất là lỗi nghiệp vụ (400/404/409)
4. Kiểm tra lại response format thống nhất ở MỌI endpoint
```

---

## Giai đoạn 8 — Buffer & Tích hợp Frontend (Ngày 17 - 16/7)

- Dành nguyên ngày cuối để fix bug phát sinh khi Frontend gọi thật vào API
- KHÔNG code tính năng mới ở ngày này
- Deploy thử lên Railway/Render (free tier) để Frontend test từ xa nếu cần

---

## 📌 Quy tắc khi làm việc với AI Agent

1. **Luôn đưa context trước khi yêu cầu code** — paste lại đoạn ERD hoặc bảng endpoint liên quan, đừng để agent tự đoán cấu trúc.
2. **Chia nhỏ theo từng entity/module**, không yêu cầu "code hết backend" trong 1 prompt — sẽ tạo ra code không nhất quán.
3. **Sau mỗi giai đoạn**: đọc lại code, chạy thử, **commit git** trước khi sang bước tiếp theo. Nếu agent code sai, dễ revert.
4. **Hỏi agent giải thích đoạn code khó hiểu** (ví dụ JWT filter, MapStruct mapping) — đừng copy-paste mà không hiểu, vì khi bug bạn sẽ không tự sửa được.
5. **Review kỹ phần Security và Payment** — đây là 2 chỗ AI dễ code sai logic phân quyền nhất, luôn tự test bằng Postman với 2 role User/Admin để chắc chắn.
