# PKS Course & Enrollment Portal - PKSEducation

Dự án Mini Web-App phục vụ tra cứu, quản lý và ghi danh các khóa học công nghệ dành cho Bài Test Kỹ Năng Vòng 2 - Thực Tập Sinh Fullstack Developer tại **Công ty TNHH Công Nghệ & Giáo Dục PKS**.

---

## 📁 Cấu trúc Thư mục Dự án

```text
PKSEducation/
├── docs/                      # Tài liệu phân tích yêu cầu, ERD, Postman Collection
│   └── REQUIREMENTS_ANALYSIS.md
├── frontend/                  # Giao diện người dùng (React.js + Vite + TypeScript)
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
└── backend/                   # RESTful API Service (NestJS + PostgreSQL + Prisma)
    ├── src/
    ├── test/
    └── package.json
```

---

## 🛠️ Công nghệ Sử dụng

- **Frontend**: React.js (Vite + TypeScript), React Router v6+, TailwindCSS / Vanilla CSS, Axios, Lucide Icons, Toast Notifications.
- **Backend**: NestJS (TypeScript), Prisma ORM, Passport JWT, Bcrypt.
- **Database**: PostgreSQL.
- **Bảo mật & Chuẩn hóa**: JWT Authentication, Role-based Access Control (Student / Admin), Database Transaction (Row Locking chống Race Condition), Standardized Exception Handling.

---

## 🚀 Hướng dẫn Cài đặt & Khởi chạy

### 1. Khởi chạy Backend (NestJS)
```bash
cd backend
npm install
npm run start:dev
```

### 2. Khởi chạy Frontend (React)
```bash
cd frontend
npm install
npm run dev
```

---

## 📜 Phân tích Yêu cầu Chi tiết
Xem báo cáo phân tích chi tiết tại: [docs/REQUIREMENTS_ANALYSIS.md](./docs/REQUIREMENTS_ANALYSIS.md)
