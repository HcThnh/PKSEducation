# BÁO CÁO PHÂN TÍCH YÊU CẦU DỰ ÁN "PKS COURSE & ENROLLMENT PORTAL"

**Nguồn:** File PDF `ND_PV_FULLSTACK.pdf`  
**Vị trí tuyển dụng:** Thực tập sinh Fullstack Developer (Node.js + React.js) - Công ty TNHH Công nghệ & Giáo dục PKS  
**Thời gian thực hiện quy định:** 36 giờ  

---

## 1. TỔNG QUAN DỰ ÁN & MỤC TIÊU
Thương hiệu PKS Education cần phát triển ứng dụng **"PKS Course & Enrollment Portal"** để hỗ trợ học viên tra cứu, tìm kiếm và đăng ký các khóa học công nghệ/tin học. Đồng thời hỗ trợ Quản trị viên (Admin/Staff) quản lý danh mục khóa học và danh sách học viên ghi danh.

### Vai trò người dùng (User Roles):
1. **Student (Học viên)**: Đăng ký/Đăng nhập, tìm kiếm khóa học, xem chi tiết và thực hiện ghi danh khóa học.
2. **Admin / Staff (Quản trị viên)**: Đăng nhập quản trị, CRUD khóa học, cấu hình sĩ số tối đa, ẩn/hiện khóa học, xem danh sách học viên ghi danh.

---

## 2. YÊU CẦU CHỨC NĂNG CHI TIẾT

### 2.1. Phân hệ Student (Học viên)
- **Đăng ký tài khoản (Register)**:
  - Thông tin nhập vào: Họ tên, Email, Mật khẩu.
  - Backend validation: Kiểm tra email trùng lặp trước khi khởi tạo tài khoản.
  - Bảo mật: Mật khẩu bắt buộc mã hóa bằng `bcrypt` (salt factor >= 10) trước khi lưu DB.
- **Đăng nhập & Đăng xuất (Login / Logout)**:
  - Đăng nhập với Email và Mật khẩu.
  - Cấp JWT Token có thời hạn (Expiration Time).
  - Frontend duy trì trạng thái đăng nhập (Token storage / AuthContext / Redux / Zustand), hỗ trợ Đăng xuất.
- **Trang danh sách khóa học (Course List)**:
  - Hiển thị danh sách khóa học dưới dạng **Card UI**.
  - Các thông tin hiển thị: Tên khóa học, Danh mục (Category), Giảng viên (Instructor), Mô tả ngắn, Học phí (Fee), Sĩ số tối đa (Max Capacity), Số lượng đã đăng ký (Enrolled Count), Trạng thái (`Còn chỗ` / `Hết chỗ`).
  - Tính năng tìm kiếm theo tên khóa học và lọc theo Danh mục.
- **Trang chi tiết khóa học & Ghi danh (Course Detail & Enrollment)**:
  - Xem thông tin đầy đủ khóa học.
  - Nút **Ghi danh**: Nếu chưa đăng nhập, tự động chuyển hướng đến trang `/login`.
  - Backend Validation: 
    - Kiểm tra học viên đã đăng ký khóa học này chưa (chặn 1 student đăng ký 1 khóa nhiều lần).
    - Kiểm tra sĩ số `enrolled_count < max_capacity`. Nếu đã đầy (`enrolled_count >= max_capacity`), từ chối ghi danh.
  - **Xử lý Race Condition**: Áp dụng **Database Transaction**, Row Locking (`FOR UPDATE`) hoặc Atomic Update để đảm bảo khi nhiều người cùng bấm đăng ký suất cuối cùng, dữ liệu Enrollment và `enrolled_count` vẫn chính xác tuyệt đối.
- **Khóa học của tôi (My Courses)**:
  - Học viên xem danh sách các khóa học mình đã ghi danh, ngày ghi danh (`enrolled_at`), trạng thái đăng ký. Chỉ hiển thị dữ liệu thuộc tài khoản cá nhân.

### 2.2. Phân hệ Admin / Staff (Quản trị viên)
- **Bảo mật & Phân quyền (RBAC & Protected Routes)**:
  - Đăng nhập bằng tài khoản Admin/Staff.
  - API & Client Routes dành cho Admin phải có Middleware kiểm tra JWT + Role (`Admin`/`Staff`). Học viên (role `Student`) không được phép truy cập.
- **Quản lý khóa học (Course Management)**:
  - Thêm mới, Chỉnh sửa, Xóa, Ẩn/Hiện khóa học.
  - Cấu hình sĩ số tối đa (`max_capacity`).
  - Backend Validation: Không cho phép hạ `max_capacity` thấp hơn số lượng học viên đã đăng ký thực tế (`enrolled_count`).
- **Quản lý danh sách ghi danh (Enrollment List)**:
  - Xem danh sách học viên theo từng khóa học.
  - Các thông tin: Họ tên, Email, Tên khóa học, Thời gian đăng ký (định dạng `YYYY-MM-DD` theo giờ Asia/Ho_Chi_Minh), Trạng thái.

---

## 3. YÊU CẦU KỸ THUẬT & KIẾN TRÚC HE THONG

| Thành phần | Công nghệ chọn lựa | Chi tiết yêu cầu |
|---|---|---|
| **Thư mục gốc** | `PKSEducation` | Chứa `frontend`, `backend`, `docs` |
| **Frontend** | React (Vite + TS) | React Router v6+, Protected Routes, Responsive UI, Toast Notifications, UX States (Loading, Empty, Error, Disabled) |
| **Backend** | NestJS | RESTful API, Modular Architecture, DTO Validation, Global Exception Filter |
| **Database** | PostgreSQL + Prisma ORM | Transaction support (Row Lock / Atomic Update), ERD Schema |
| **Múi giờ & Date** | Asia/Ho_Chi_Minh | Định dạng ngày `YYYY-MM-DD` |
| **Auth & Security** | Bcrypt + JWT | Salt factor >= 10, JWT Guards, Role-based Access Control (RBAC), `.env.example` |
| **Tài liệu & Test** | Postman & ERD | Postman Collection chứa trong `/docs`, ERD Diagram, Hình ảnh kết quả test |

---

## 4. SƠ ĐỒ THỰC THỂ CƠ SỞ DỮ LIỆU (ERD SCHEMA)

Tối thiểu 3 thực thể chính:

### 1. `Users`
- `id`: String (UUID / CUID) [PK]
- `full_name`: String
- `email`: String [Unique]
- `password_hash`: String
- `role`: Enum (`STUDENT`, `ADMIN`, `STAFF`) [Default: `STUDENT`]
- `created_at`: DateTime
- `updated_at`: DateTime

### 2. `Courses`
- `id`: String (UUID / CUID) [PK]
- `title`: String
- `category`: String
- `instructor`: String
- `short_description`: Text
- `full_description`: Text
- `fee`: Decimal / Int
- `max_capacity`: Int
- `enrolled_count`: Int [Default: 0]
- `is_hidden`: Boolean [Default: false]
- `created_at`: DateTime
- `updated_at`: DateTime

### 3. `Enrollments`
- `id`: String (UUID / CUID) [PK]
- `user_id`: String [FK -> Users.id]
- `course_id`: String [FK -> Courses.id]
- `enrolled_at`: DateTime
- `status`: Enum (`CONFIRMED`, `CANCELLED`) [Default: `CONFIRMED`]
- *Constraints*: Unique Composite Index `(user_id, course_id)` để chống trùng lặp.

---

## 5. KẾ HOẠCH BÀI NỘP (DELIVERABLES)
1. Thư mục `PKSEducation/frontend` (React + Vite + TypeScript)
2. Thư mục `PKSEducation/backend` (NestJS + PostgreSQL + Prisma)
3. Thư mục `PKSEducation/docs` (ERD, Postman Collection JSON, Test Screenshots)
4. File `.env.example` ở cả frontend và backend
5. File `README.md` hướng dẫn chi tiết cài đặt và khởi chạy.
