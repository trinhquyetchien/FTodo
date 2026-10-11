# 🚀 FTodo — Hệ thống Quản trị Dự án Agile/Scrum & Tài chính Doanh nghiệp

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=for-the-badge&logo=nestjs)
![Swagger](https://img.shields.io/badge/Swagger-OpenAPI_3.0-85EA2D?style=for-the-badge&logo=swagger)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker)
[![CI](https://github.com/trinhquyetchien/FTodo/actions/workflows/ci.yml/badge.svg)](https://github.com/trinhquyetchien/FTodo/actions/workflows/ci.yml)

<p align="center">
  <b>Nền tảng quản lý dự án công nghệ hiện đại, kết hợp tinh hoa giữa Agile/Scrum (Jira & Linear style) và Quản trị Tài chính Dự án Chiến lược (EVM, ROI, CPI, Runway).</b>
</p>

</div>

---

## 📖 Giới thiệu

**FTodo** là một giải pháp quản trị toàn diện vòng đời phát triển phần mềm (Software Development Life Cycle - SDLC). Ứng dụng giải quyết triệt để bài toán kết nối giữa **Đội ngũ kỹ thuật thực thi (Dev, QA)** và **Cấp quản lý ra quyết định (Product Owner, Sếp, CFO)** thông qua:

1. **Agile Execution:** Bảng Scrum kéo thả, phân rã công việc WBS, lập kế hoạch Backlog, ước lượng Story Points, biểu đồ Burndown và lộ trình Gantt.
2. **Financial Governance:** Kiểm soát chi phí thực tế, luồng đề xuất giải ngân có lý do rõ ràng, hộp thư phê duyệt của Sếp, và phân tích các chỉ số tài chính nâng cao (ROI, CPI, SPI, Runway).
3. **Dynamic RBAC & Workspace:** Hệ thống phân quyền động theo nhóm vai trò, thanh công cụ tùy biến trang con, và menu bên trái linh hoạt.

---

## ✨ Tính năng nổi bật

### 1. 🎯 Bảng Scrum tương tác (Interactive Scrum Board)
* **Kéo thả mượt mà (HTML5 Drag & Drop):** Chuyển đổi trạng thái công việc qua 4 cột: `To Do` ➔ `In Progress` ➔ `Review` ➔ `Done`.
* **Bộ lọc 1-chạm "Việc của tôi" (Only My Tasks):** Lọc tức thời các task do tài khoản đang đăng nhập phụ trách.
* **Sprint Goal & Velocity Tracker:** Thanh tiến độ hiển thị mục tiêu Sprint và tỷ lệ hoàn thành theo Story Points (`donePoints / totalPoints`).
* **Ước lượng Story Points & Phân loại:** Hỗ trợ điểm Fibonacci (`1, 2, 3, 5, 8, 13 SP`), gắn nhãn Epic cha và icon phân loại (📘 User Story, 📋 Task kỹ thuật, 🐞 Bug lỗi).

### 2. 🌳 Cấu trúc Phân rã Công việc WBS & Product Backlog
* **WBS Hierarchy theo Epics:** Phân rã cấu trúc từ Cấp 1 (Epic lớn) ➔ Cấp 2 (User Stories) ➔ Cấp 3 (Tasks thực thi). Bộ lọc Epic trực quan với thống kê tổng điểm Story Points.
* **Sprint Planning Container:** Tách bạch giữa **Active Sprint 1** (đang diễn ra) và **Product Backlog** (công việc tương lai).
* **Điều chuyển công việc nhanh:** Nút **"Vào Sprint 1 ↑"** hoặc chuyển xuống Backlog chỉ bằng một cú nhấp chuột.
* **Interactive Story Points Poker:** Điều chỉnh điểm ước lượng trực tiếp trên từng dòng task.

### 3. 📅 Lộ trình Dự án (Roadmap / Gantt Chart)
* **Trục thời gian cụ thể:** Thể hiện chi tiết theo từng ngày, từng tuần và từng tháng (từ tháng 10 đến tháng 11/2026).
* **Cột mốc thời gian thực:** Đánh dấu mốc đỏ *"Hôm nay"* trực quan.
* **Thanh Gantt tỷ lệ thực:** Tính toán độ dài thanh tiến độ Epic theo tỷ lệ ngày bắt đầu và kết thúc thực tế.

### 4. 💵 Quản trị Tài chính Chiến lược & Chỉ số ROI / EVM
* **Quy trình Đề xuất & Duyệt chi phí 2 chiều:**
  * **Nhân viên (Member):** Gửi đề xuất chi phí phát sinh kèm **Lý do đề xuất chi tiết (bắt buộc)** và theo dõi trạng thái (*Chờ duyệt*, *Đã duyệt*, *Bị từ chối*).
  * **Chủ dự án (Sếp / Owner):** Hộp thư tiếp nhận đề xuất, xem lý do của nhân viên, thực hiện **Duyệt chi** hoặc **Từ chối** (kèm lý do phản hồi) và ghi nhận **Đã chi**.
* **Chỉ số Tài chính Nâng cao (Dành cho Sếp):**
  * **ROI (Return on Investment):** Ước tính tỷ suất hoàn vốn (`+140%`), thời gian hoàn vốn và điểm hòa vốn.
  * **CPI (Cost Performance Index):** Quản trị giá trị thu được (EVM), kiểm soát tình trạng tiết kiệm hoặc bội chi so với định mức ngân sách.
  * **SPI (Schedule Performance Index):** Đo lường mức độ bám sát tiến độ kế hoạch.
  * **Burn Rate & Runway:** Tốc độ tiêu tiền trung bình mỗi Sprint và số Sprint còn lại mà ngân sách có thể duy trì.
  * **Interactive ROI Simulator:** Thanh trượt mô phỏng doanh thu kỳ vọng để tính tức thời ROI dự kiến.

### 5. 📑 Báo cáo Tiến độ & Phê duyệt Văn bản PDF
* **Nhân viên:** Soạn và gửi báo cáo định kỳ (báo cáo Sprint, báo cáo tuần, sự cố kỹ thuật).
* **Chủ dự án:** Hộp thư duyệt báo cáo, tích hợp **Trình đọc văn bản tài liệu chuẩn PDF** (đầy đủ quốc hiệu, tiêu đề, con dấu điện tử, chữ ký) và nút xác nhận phê duyệt.

### 6. 👥 Quản lý Nhân sự & Ma trận Phân quyền (RBAC)
* **Hiển thị trực tiếp Role Groups:** Thẻ thông tin các nhóm quyền (*Admin*, *DEV*, *QA*, *Custom roles*) hiển thị trực quan ngay trên trang Nhân sự.
* **Modal Khởi tạo nhóm quyền chuẩn UX/UI:** Thiết kế rộng rãi (`max-w-4xl`), hỗ trợ mẫu vai trò gợi ý (*Product Designer*, *DevOps*, *BA*, *Kế toán*) và ma trận cấp quyền 3 phân nhóm logic.
* **Cấp quyền riêng lẻ (Extra Permissions):** Cấp thêm quyền truy cập trang đặc thù (VD: quyền xem Chi phí) cho cá nhân thành viên mà không cần đổi nhóm quyền.

### 7. 💻 Trải nghiệm Workspace & Chuyển đổi Vai trò Demo
* **Header thông minh:** Ẩn logo FTodo khi vào trong Workspace và thay thế bằng **Tên dự án thực tế** kèm Badge vai trò.
* **Sidebar thu gọn/mở rộng:** Nút bấm toggle linh hoạt thu gọn menu sang dạng icon mini (`w-16`) giúp mở rộng tối đa không gian làm việc.
* **Quick Demo Role Switcher:** Nút chuyển đổi nhanh tức thời trên Header giữa:
  * 👑 **Trịnh Quyết Chiến (Chủ dự án / Owner):** Toàn quyền cấu hình, duyệt chi phí, đọc PDF báo cáo.
  * 💻 **Nguyễn Văn An (Senior DEV):** Được cấp quyền xem và đề xuất Chi phí.
  * 🔍 **Trần Thị Bình (QA Tester):** Quyền cơ bản, gửi báo cáo kiểm thử.

---

## 🛠️ Kiến trúc Công nghệ

```
FTodo/
├── frontend/                     # Next.js 15 Client Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/login/     # Giao diện Đăng nhập
│   │   │   ├── (dashboard)/      # Trang Tổng quan dự án bắt đầu
│   │   │   │   └── projects/[id]/# Workspace Dự án & các trang con:
│   │   │   │       ├── board/    # Bảng Scrum kéo thả
│   │   │   │       ├── backlog/  # WBS & Kế hoạch Sprint
│   │   │   │       ├── timeline/ # Lộ trình Gantt Chart
│   │   │   │       ├── cost/     # Ngân sách, ROI & Duyệt chi phí
│   │   │   │       ├── reports/  # Báo cáo Burndown & Đọc báo cáo
│   │   │   │       ├── members/  # Quản lý Nhân sự & Nhóm quyền
│   │   │   │       ├── issues/   # Tất cả tác vụ
│   │   │   │       ├── releases/ # Phiên bản phát hành
│   │   │   │       ├── components/# Hợp phần kiến trúc
│   │   │   │       └── chat/     # Kênh chat realtime
│   │   │   └── layout.tsx
│   │   ├── components/ui/        # Thư viện UI chuẩn Shadcn Base UI
│   │   └── lib/                  # Auth Context, Mock Data, API Utilities
├── backend/                      # NestJS 11 Backend API Server
│   ├── src/
│   │   ├── auth/                 # Module Xác thực JWT & Passport
│   │   ├── projects/             # Module Quản lý Dự án
│   │   ├── tasks/                # Module Quản lý Tác vụ
│   │   ├── members/              # Module Quản lý Thành viên & Phân quyền
│   │   ├── costs/                # Module Quản trị Chi phí
│   │   ├── chat/                 # Module Kênh chat
│   │   └── prisma/               # Dịch vụ Prisma Client
│   └── prisma/
│       ├── schema.prisma         # Định nghĩa PostgreSQL Schema
│       └── seed.ts               # Khởi tạo dữ liệu mẫu
└── docker-compose.yml            # Docker cấu hình PostgreSQL Database
```

---

## 🚀 Hướng dẫn Cài đặt & Khởi chạy

### 1. Yêu cầu hệ thống
* **Node.js:** phiên bản `18.x` hoặc `20.x` trở lên
* **npm:** phiên bản `9.x` trở lên
* **Docker & Docker Compose** (tùy chọn để chạy PostgreSQL)

---

### 2. Khởi chạy Database với Docker
```bash
# Khởi động PostgreSQL container
docker compose up -d
```

---

### 3. Cài đặt & Khởi chạy Backend (NestJS)
```bash
cd backend

# Cài đặt dependencies
npm install

# Đồng bộ Prisma Schema với PostgreSQL
npx prisma db push

# Chạy seed dữ liệu mẫu
npm run prisma:seed

# Khởi chạy server API (cổng 4000)
npm run start:dev
```

* **Swagger OpenAPI Documentation:** Truy cập giao diện tương tác API tại **[http://localhost:4000/api/docs](http://localhost:4000/api/docs)** để kiểm thử trực tiếp các endpoint với Bearer Token.

---

### 4. Cài đặt & Khởi chạy Frontend (Next.js)
```bash
cd frontend

# Cài đặt dependencies
npm install

# Khởi chạy Next.js Turbopack dev server (cổng 3000)
npm run dev
```

Truy cập ứng dụng tại: **[http://localhost:3000](http://localhost:3000)**

---

### 5. Tự động hóa CI/CD (GitHub Actions)
Dự án đã được tích hợp quy trình **Continuous Integration (CI)** tự động tại `.github/workflows/ci.yml`:
* **Backend CI:** Tự động cài đặt dependencies, sinh Prisma Client, kiểm tra biên dịch NestJS (`npm run build`) và chạy Jest Unit Test trên môi trường Node.js 20.
* **Frontend CI:** Tự động kiểm tra tính đúng đắn kiểu dữ liệu TypeScript (`npx tsc --noEmit`) và tối ưu hóa bản dựng Next.js Turbopack (`npm run build`).

---

## 🔑 Tài khoản Thử nghiệm (Demo Accounts)

Hệ thống tích hợp sẵn nút **"Chuyển vai trò Demo"** trên thanh tiêu đề góc phải màn hình để bạn chuyển đổi tài khoản ngay lập tức mà không cần đăng xuất:

| Vai trò | Họ và tên | Email | Đặc quyền chính |
| :--- | :--- | :--- | :--- |
| **Chủ dự án (Owner)** | Trịnh Quyết Chiến | `chien@example.com` | Toàn quyền cài đặt dự án, duyệt/từ chối chi phí, phân tích ROI/EVM, đọc và ký duyệt PDF báo cáo. |
| **Senior DEV** | Nguyễn Văn An | `an@example.com` | Thực thi task trên bảng Scrum, **được cấp thêm quyền** xem tab Chi phí và gửi đề xuất giải ngân. |
| **QA Lead** | Trần Thị Bình | `binh@example.com` | Kiểm thử tính năng, gửi báo cáo kiểm định chất lượng lên cho Sếp (không có quyền xem Chi phí). |

---

## 📜 Giấy phép & Tác giả

* **Dự án:** FTodo Software Management Platform
* **Tác giả:** Trịnh Quyết Chiến
* **Giấy phép:** MIT License
