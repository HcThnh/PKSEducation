# TRÌNH TỰ THỰC HIỆN CHI TIẾT BACKEND (NESTJS + POSTGRESQL + PRISMA)
> **Mục tiêu**: Hoàn thành 100% yêu cầu đề bài PDF và đạt điểm tối đa (10/10) theo Khung đánh giá năng lực của PKS Education.

---

## 📋 TỔNG QUAN CÁC BƯỚC THỰC HIỆN

```mermaid
flowchart TD
    G1[Giai đoạn 1: Khởi tạo DB & Prisma ORM] --> G2[Giai đoạn 2: Cấu hình Validation, Security & Response]
    G2 --> G3[Giai đoạn 3: Phân hệ Auth & Users]
    G3 --> G4[Giai đoạn 4: Phân hệ Courses Management]
    G4 --> G5[Giai đoạn 5: Phân hệ Enrollments & Race Condition]
    G5 --> G6[Giai đoạn 6: Testing & Postman Collection]
```

---

## 🛠️ GIAI ĐOẠN 1: CẤU HÌNH MÔI TRƯỜNG & DATABASE (POSTGRESQL + PRISMA)

### Bước 1.1: Cài đặt Prisma ORM
Thực hiện tại thư mục `backend`:
```bash
cd backend
npm install @prisma/client
npm install -D prisma
npx prisma init
```

### Bước 1.2: Cấu hình Biến môi trường (`.env` & `.env.example`)
Tạo/chỉnh sửa file `.env` và `.env.example` trong thư mục `backend`:
```env
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pks_education?schema=public"
JWT_SECRET="PKS_EDUCATION_SUPER_SECRET_KEY_2026"
JWT_EXPIRES_IN="1d"
```

### Bước 1.3: Định nghĩa Sơ đồ Thực thể ERD trong `prisma/schema.prisma`
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  STUDENT
  ADMIN
  STAFF
}

enum EnrollmentStatus {
  CONFIRMED
  CANCELLED
}

model User {
  id           String       @id @default(uuid())
  fullName     String       @map("full_name")
  email        String       @unique
  passwordHash String       @map("password_hash")
  role         Role         @default(STUDENT)
  createdAt    DateTime     @default(now()) @map("created_at")
  updatedAt    DateTime     @updatedAt @map("updated_at")
  enrollments  Enrollment[]

  @@map("users")
}

model Course {
  id               String       @id @default(uuid())
  title            String
  category         String
  instructor       String
  shortDescription String       @map("short_description")
  fullDescription  String?      @map("full_description")
  fee              Float        @default(0)
  maxCapacity      Int          @map("max_capacity")
  enrolledCount    Int          @default(0) @map("enrolled_count")
  isHidden         Boolean      @default(false) @map("is_hidden")
  createdAt        DateTime     @default(now()) @map("created_at")
  updatedAt        DateTime     @updatedAt @map("updated_at")
  enrollments      Enrollment[]

  @@map("courses")
}

model Enrollment {
  id         String           @id @default(uuid())
  userId     String           @map("user_id")
  courseId   String           @map("course_id")
  enrolledAt DateTime         @default(now()) @map("enrolled_at")
  status     EnrollmentStatus @default(CONFIRMED)

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  course Course @relation(fields: [courseId], references: [id], onDelete: Cascade)

  @@unique([userId, courseId], name: "user_course_unique")
  @@map("enrollments")
}
```

### Bước 1.4: Khởi tạo Migration & Seed Data
1. Thực hiện migration:
   ```bash
   npx prisma migrate dev --name init
   ```
2. Tạo file `prisma/seed.ts` để tự động tạo tài khoản Admin mặc định (`admin@pks.edu.vn` / `Admin@123`) và 3-5 khóa học mẫu.
3. Thêm cấu hình seed vào `package.json`:
   ```json
   "prisma": {
     "seed": "ts-node prisma/seed.ts"
   }
   ```
4. Chạy seed: `npx prisma db seed`.

---

## 🔒 GIAI ĐOẠN 2: SECUTITY, VALIDATION & STANDARD RESPONSE

### Bước 2.1: Cài đặt Packages cần thiết
```bash
npm install bcrypt class-validator class-transformer @nestjs/jwt @nestjs/passport passport passport-jwt
npm install -D @types/bcrypt @types/passport-jwt @types/express
```

### Bước 2.2: Chuẩn hóa Global JSON Exception Filter
Tạo `src/common/filters/http-exception.filter.ts`:
- Chuẩn hóa định dạng lỗi trả về thống nhất:
  ```json
  {
    "statusCode": 400,
    "error": "Bad Request",
    "message": "Email đã tồn tại trong hệ thống",
    "timestamp": "2026-09-28T20:00:00.000Z",
    "path": "/api/v1/auth/register"
  }
  ```

### Bước 2.3: Phân quyền Role-based Access Control (RBAC)
1. Tạo Decorator `@Roles('ADMIN', 'STAFF')` tại `src/common/decorators/roles.decorator.ts`.
2. Tạo `RolesGuard` tại `src/common/guards/roles.guard.ts` để kiểm tra `req.user.role`.

---

## 🔐 GIAI ĐOẠN 3: PHÂN HỆ AUTHENTICATION & USERS (`AuthModule`)

### Bước 3.1: API Đăng ký (`POST /api/v1/auth/register`)
- **Input DTO**: `fullName`, `email`, `password`.
- **Validation**:
  - Email đúng định dạng `@IsEmail()`.
  - Password từ 6 ký tự trở lên.
  - Kiểm tra email trong DB: Nếu đã tồn tại -> Ném lỗi `ConflictException('Email đã được đăng ký')`.
- **Logic**: Mã hóa password bằng `bcrypt.hash(password, 10)`. Tạo User với role mặc định là `STUDENT`.

### Bước 3.2: API Đăng nhập (`POST /api/v1/auth/login`)
- **Input DTO**: `email`, `password`.
- **Logic**:
  - Tìm User theo email. Nếu không thấy -> `UnauthorizedException('Email hoặc mật khẩu không đúng')`.
  - So sánh password với `bcrypt.compare()`. Nếu sai -> Ném lỗi tương tự.
  - Tạo và trả về JWT Token chứa `sub` (userId), `email`, `role`.

### Bước 3.3: API Lấy thông tin cá nhân (`GET /api/v1/auth/profile`)
- Proteceted Route với `JwtAuthGuard`. Trả về thông tin User (ẩn `passwordHash`).

---

## 📚 GIAI ĐOẠN 4: PHÂN HỆ QUẢN LÝ KHÓA HỌC (`CoursesModule`)

### Bước 4.1: API Danh sách Khóa học (`GET /api/v1/courses`) - Public
- **Query Params**: `search` (tìm kiếm tên khóa học), `category` (lọc theo danh mục).
- **Phân quyền**:
  - Khi không có token hoặc role là `STUDENT`: Chỉ trả về danh sách khóa học có `isHidden: false`.
  - Khi là `ADMIN`/`STAFF`: Trả về cả các khóa học ẩn.
- **Tính toán trường**: Thêm field động `isFull` (`enrolledCount >= maxCapacity`).

### Bước 4.2: API Chi tiết Khóa học (`GET /api/v1/courses/:id`) - Public
- Trả về thông tin đầy đủ của khóa học.

### Bước 4.3: API Thêm Khóa học mới (`POST /api/v1/courses`) - Admin Only
- Guard: `JwtAuthGuard` + `RolesGuard(['ADMIN', 'STAFF'])`.
- **Input DTO**: `title`, `category`, `instructor`, `shortDescription`, `fullDescription`, `fee`, `maxCapacity`.
- Validate `maxCapacity > 0`.

### Bước 4.4: API Chỉnh sửa Khóa học (`PATCH /api/v1/courses/:id`) - Admin Only
- **Nghiệp vụ cốt lõi từ Đề bài**: Kiểm tra nếu `maxCapacity` mới được thiết lập < `enrolledCount` hiện tại -> Ném lỗi `BadRequestException('Capacity không được nhỏ hơn số học viên đã ghi danh')`.

### Bước 4.5: API Xóa / Ẩn Khóa học (`DELETE /api/v1/courses/:id`) - Admin Only
- Cho phép xóa hoặc cập nhật `isHidden: true`.

---

## 📝 GIAI ĐOẠN 5: PHÂN HỆ GHI DANH & XỬ LÝ RACE CONDITION (`EnrollmentsModule`)

### Bước 5.1: API Ghi danh Khóa học (`POST /api/v1/enrollments`) - Student Only
- Guard: `JwtAuthGuard` (Yêu cầu phải đăng nhập).
- **Input DTO**: `courseId`.
- **Nghiệp vụ cốt lõi & Xử lý Race Condition**:
  Sử dụng **Prisma Transaction** để khóa hàng hoặc Atomic Update nguyên tử:
  ```typescript
  return await this.prisma.$transaction(async (tx) => {
    // 1. Kiểm tra học viên đã ghi danh khóa học này chưa
    const existing = await tx.enrollment.findUnique({
      where: {
        user_course_unique: { userId, courseId }
      }
    });
    if (existing) {
      throw new ConflictException('Bạn đã ghi danh khóa học này rồi');
    }

    // 2. Atomic update: Tăng enrolledCount chỉ khi enrolledCount < maxCapacity
    const updatedCourse = await tx.course.updateMany({
      where: {
        id: courseId,
        isHidden: false,
        enrolledCount: { lt: tx.course.fields.maxCapacity }
      },
      data: {
        enrolledCount: { increment: 1 }
      }
    });

    // Nếu không có hàng nào được cập nhật -> Khóa học đã hết chỗ!
    if (updatedCourse.count === 0) {
      throw new BadRequestException('Khóa học đã hết chỗ (Đã đạt sĩ số tối đa)');
    }

    // 3. Tạo bản ghi Enrollment
    return await tx.enrollment.create({
      data: { userId, courseId }
    });
  });
  ```

### Bước 5.2: API Khóa học của tôi (`GET /api/v1/enrollments/my-courses`) - Student Only
- Trả về danh sách các khóa học mà `req.user.id` đã ghi danh.
- Định dạng ngày `enrolledAt` theo giờ `Asia/Ho_Chi_Minh` (`YYYY-MM-DD`).

### Bước 5.3: API Danh sách Học viên ghi danh theo Khóa học (`GET /api/v1/enrollments/course/:courseId`) - Admin Only
- Guard: `JwtAuthGuard` + `RolesGuard(['ADMIN', 'STAFF'])`.
- Trả về danh sách học viên (Họ tên, Email, Thời gian ghi danh, Trạng thái) của `courseId`.

---

## 🧪 GIAI ĐOẠN 6: TESTING, DOCUMENTATION & POSTMAN COLLECTION

### Bước 6.1: Viết Unit Test cho Nghiệp vụ Chống Race Condition / Sĩ số
Tạo test file `src/enrollments/enrollments.service.spec.ts`:
- Test case 1: Ghi danh thành công khi còn chỗ.
- Test case 2: Ném lỗi `ConflictException` khi ghi danh trùng lặp.
- Test case 3: Ném lỗi `BadRequestException` khi khóa học đã đạt sĩ số tối đa.
Chạy test: `npm run test`.

### Bước 6.2: Export Postman Collection
Tạo và lưu file `PKS_Portal.postman_collection.json` vào thư mục `docs/`:
- Folder Auth: Register, Login Admin, Login Student.
- Folder Courses: Get All, Get Detail, Create (Admin), Update (Admin), Delete (Admin).
- Folder Enrollments: Enroll Course (Student), Get My Courses (Student), Get Course Enrollments (Admin).
- Bao gồm các trường hợp thành công (200/201) và thất bại (400/401/403/409).

---

## 💯 BẢNG ĐỐI CHIẾU TIÊU CHÍ CHẤM ĐIỂM (CHECKLIST 10/10)

- [x] **Backend & CSDL (3.0đ)**: ERD 3 entities, REST API đầy đủ, kiểm tra trùng lặp & capacity, Transaction chống Race Condition.
- [x] **Frontend & UI/UX (2.5đ)**: Kết nối API, Loading/Empty/Error state, Protected Routes.
- [x] **Phân quyền & Bảo mật (1.5đ)**: Guard RBAC Admin/Student, JWT, Bcrypt salt >= 10, `.env.example`.
- [x] **Kiểm thử & Postman (1.5đ)**: Collection đầy đủ trong `/docs`, Unit test cho EnrollmentsService (+0.5đ bonus).
- [x] **Git & Clean Code (1.5đ)**: Cấu trúc NestJS chuẩn, commit rõ ràng theo Conventional Commits, README chuyên nghiệp.
