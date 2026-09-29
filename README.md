# PKS Course & Enrollment Portal — PKSEducation

Dự án Mini Web-App phục vụ tra cứu, quản lý và ghi danh các khóa học công nghệ, xây dựng cho **Bài Test Kỹ Năng Vòng 2 — Thực Tập Sinh Fullstack Developer** tại **Công ty TNHH Công Nghệ & Giáo Dục PKS**.

---

## Mục lục

- [Cấu trúc Thư mục](#cấu-trúc-thư-mục)
- [Công nghệ Sử dụng](#công-nghệ-sử-dụng)
- [Tính năng Frontend](#tính-năng-frontend)
- [Tính năng Backend (API)](#tính-năng-backend-api)
- [Kết nối Database](#kết-nối-database)
- [Tài khoản Mặc định](#tài-khoản-mặc-định)
- [Hướng dẫn Cài đặt & Khởi chạy](#hướng-dẫn-cài-đặt--khởi-chạy)
- [Chạy Unit Test](#chạy-unit-test)
- [Postman Collection](#postman-collection)

---

## Cấu trúc Thư mục

```text
PKSEducation/
├── docs/
│   ├── REQUIREMENTS_ANALYSIS.md         # Tài liệu phân tích yêu cầu
│   └── PKS_Portal.postman_collection.json  # Postman Collection (import ngay)
├── frontend/                            # React + Vite + TypeScript
│   └── src/
│       ├── api/          # axiosClient, courseApi
│       ├── components/   # Navbar, CourseCard, ProtectedRoutes
│       ├── context/      # AuthContext (JWT state management)
│       ├── pages/        # HomePage, LoginPage, RegisterPage, CourseDetailPage, MyCoursesPage
│       └── types/        # TypeScript interfaces (Course, Enrollment)
└── backend/                             # NestJS + Prisma + PostgreSQL
    ├── prisma/
    │   ├── schema.prisma  # Database schema (User, Course, Enrollment)
    │   └── seed.ts        # Seed dữ liệu ban đầu (Admin + Student + Courses)
    └── src/
        ├── auth/          # Đăng ký, Đăng nhập, JWT Strategy
        ├── courses/       # CRUD khóa học (có phân quyền)
        ├── enrollments/   # Ghi danh chống Race Condition
        └── common/        # Guards, Decorators, Exception Filter
```

---

## Công nghệ Sử dụng

| Lớp | Công nghệ |
|---|---|
| **Frontend** | React 19, Vite, TypeScript, React Router v6, Axios, react-hot-toast |
| **Backend** | NestJS, TypeScript, Passport JWT, Bcrypt |
| **ORM** | Prisma ORM v6 |
| **Database** | PostgreSQL 18 |
| **Testing** | Jest, @nestjs/testing |
| **Công cụ** | Postman, Git |

---

## Tính năng Frontend

Frontend chạy tại `http://localhost:5173`

### Trang công khai (không cần đăng nhập)

| Trang | Đường dẫn | Mô tả |
|---|---|---|
| Danh sách khóa học | `/` | Tìm kiếm theo tên/giảng viên/mô tả, lọc theo danh mục, dropdown `select` |
| Chi tiết khóa học | `/course/:id` | Thông tin đầy đủ: mô tả, học phí, sĩ số, giảng viên |
| Đăng nhập | `/login` | Form đăng nhập JWT, lưu token vào `localStorage` |
| Đăng ký | `/register` | Tạo tài khoản sinh viên mới |

### Trang yêu cầu đăng nhập (Protected Routes)

| Trang | Đường dẫn | Mô tả |
|---|---|---|
| Khóa học của tôi | `/my-courses` | Danh sách khóa học đã ghi danh, trạng thái CONFIRMED/CANCELLED |

### Tính năng chung

- **Bộ lọc tìm kiếm**: Tìm kiếm full-text (tên, giảng viên, mô tả) với debounce 300ms, kết hợp lọc theo danh mục.
- **Skeleton Loading**: Hiệu ứng loading giả lập khi đang tải dữ liệu.
- **Toast Notification**: Phản hồi thành công/thất bại mọi hành động (ghi danh, đăng nhập…).
- **Auto Logout**: Khi token hết hạn (HTTP 401), tự động xóa session và điều hướng về `/login`.
- **Responsive**: Giao diện tương thích mobile và desktop.
- **Navbar động**: Hiển thị tên người dùng, nút đăng xuất khi đã đăng nhập.

---

## Tính năng Backend (API)

Backend chạy tại `http://localhost:3000`

### Auth — `/auth`

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Đăng ký tài khoản (role mặc định: `STUDENT`) |
| `POST` | `/auth/login` | Public | Đăng nhập, trả về JWT `accessToken` |
| `GET` | `/auth/profile` | JWT Required | Xem thông tin cá nhân |

### Courses — `/courses`

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| `GET` | `/courses` | Public | Lấy danh sách khóa học (hỗ trợ `?search=&category=`) |
| `GET` | `/courses/:id` | Public | Lấy chi tiết một khóa học |
| `POST` | `/courses` | Admin / Staff | Tạo khóa học mới |
| `PATCH` | `/courses/:id` | Admin / Staff | Cập nhật khóa học |
| `DELETE` | `/courses/:id` | Admin / Staff | Xóa khóa học |

### Enrollments — `/enrollments`

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| `POST` | `/enrollments` | JWT Required | Ghi danh vào khóa học (chống race condition) |
| `GET` | `/enrollments/my-courses` | JWT Required | Danh sách khóa học đã ghi danh của sinh viên |
| `GET` | `/enrollments/course/:courseId` | Admin / Staff | Danh sách sinh viên đã ghi danh trong một khóa học |

### Cơ chế chống Race Condition

Khi nhiều sinh viên đồng thời bấm ghi danh vào cùng một khóa học sắp đầy, hệ thống dùng **Prisma Transaction + Atomic `updateMany` với điều kiện `enrolledCount < maxCapacity`**. Nếu `count = 0` (không có bản ghi nào được cập nhật), nghĩa là khóa học đã đầy → ném `BadRequestException("Course is already full!")`.

---

## Kết nối Database

Cấu hình kết nối PostgreSQL trong file `backend/.env`:

```env
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pks_education?schema=public"
JWT_SECRET="PKS_EDUCATION_SUPER_SECRET_KEY_2026"
JWT_EXPIRES_IN="1d"
```

| Tham số | Giá trị mặc định | Mô tả |
|---|---|---|
| `DB_HOST` | `localhost` | Host PostgreSQL |
| `DB_PORT` | `5432` | Port mặc định PostgreSQL |
| `DB_NAME` | `pks_education` | Tên database |
| `DB_USER` | `postgres` | Username |
| `DB_PASSWORD` | `postgres` | Password |

> **Lưu ý:** Đảm bảo dịch vụ PostgreSQL đang chạy trước khi khởi động backend.  
> Kiểm tra trên Windows: `Get-Service -Name *postgres*` → Start nếu đang `Stopped`.

### Khởi tạo Database

```bash
cd backend

# Đồng bộ schema vào database
npx prisma db push

# Tạo dữ liệu mẫu (Admin, Student, Courses)
npx prisma db seed
```

---

## Tài khoản Mặc định

Sau khi chạy lệnh `npx prisma db seed`, các tài khoản sau sẽ được tạo sẵn:

| Loại | Email | Mật khẩu | Quyền |
|---|---|---|---|
| **Admin** | `admin@pks.edu.vn` | `Admin@123` | `ADMIN` — Toàn quyền CRUD khóa học, xem danh sách sinh viên |
| **Student** | `student@pks.edu.vn` | `Student@123` | `STUDENT` — Ghi danh, xem khóa học của mình |

> Tài khoản Admin có thể tạo/sửa/xóa khóa học và xem danh sách sinh viên đã ghi danh qua API.

---

## Hướng dẫn Cài đặt & Khởi chạy

### Yêu cầu hệ thống

- Node.js >= 20
- PostgreSQL >= 14 (đang chạy tại `localhost:5432`)
- npm >= 10

### Bước 1 — Khởi chạy Backend

```bash
cd backend

# Cài dependencies
npm install

# Tạo database schema
npx prisma db push

# Seed dữ liệu mẫu
npx prisma db seed

# Chạy server (watch mode)
npm run start:dev
```

Backend khởi động tại: **`http://localhost:3000`**

### Bước 2 — Khởi chạy Frontend

```bash
cd frontend

# Cài dependencies
npm install

# Chạy dev server
npm run dev
```

Frontend khởi động tại: **`http://localhost:5173`**

---

## Chạy Unit Test

```bash
cd backend

# Chạy toàn bộ test
npm run test

# Chạy chỉ test enrollment service (kèm chi tiết)
npm run test -- --testPathPatterns=enrollments.service.spec --verbose
```

Các test case được viết cho `EnrollmentService`:

| Test Case | Mô tả |
|---|---|
| TC1 | ✅ Ghi danh thành công khi còn chỗ |
| TC2 | ✅ Ném `ConflictException` khi ghi danh trùng lặp |
| TC3 | ✅ Ném `BadRequestException` khi khóa học đã đầy (race condition guard) |
| TC4 | ✅ Ném `NotFoundException` khi khóa học không tồn tại |
| TC5 | ✅ Ném `BadRequestException` khi khóa học bị ẩn (`isHidden = true`) |

---

## Postman Collection

File collection nằm tại [`docs/PKS_Portal.postman_collection.json`](./docs/PKS_Portal.postman_collection.json).

**Cách import:**
1. Mở Postman → **Import** → chọn file `PKS_Portal.postman_collection.json`.
2. Chạy **Login Admin** hoặc **Login Student** trước — token sẽ tự động được lưu vào Collection Variables.
3. Các request tiếp theo sẽ dùng `{{adminToken}}` / `{{studentToken}}` tự động.

**Nội dung collection:**

| Folder | Số request |
|---|---|
| 🔐 Auth | 4 (Register, Login Admin, Login Student, Get Profile) |
| 📚 Courses | 5 (Get All, Get Detail, Create, Update, Delete) |
| 🎓 Enrollments | 3 (Enroll, My Courses, Course Enrollments) |

---

## Phân tích Yêu cầu Chi tiết

Xem báo cáo phân tích đầy đủ tại: [docs/REQUIREMENTS_ANALYSIS.md](./docs/REQUIREMENTS_ANALYSIS.md)
