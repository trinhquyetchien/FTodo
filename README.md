# 🚀 FTodo — Hệ thống Quản trị Dự án Agile/Scrum & Tài chính Doanh nghiệp

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
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

## 🎬 Video Demo Trực quan

> 💡 **Khám phá toàn bộ luồng hoạt động của FTodo qua video trải nghiệm trực tiếp:**

<div align="center">

<!-- ======================================================== -->
<!-- CHỖ DÀNH CHO VIDEO DEMO DỰ ÁN                            -->
<!-- Cách 1: Chèn ảnh thumbnail dẫn tới link YouTube / Loom   -->
<!-- Cách 2: Kéo thả file video .mp4 trực tiếp vào ô soạn thảo -->
<!-- ======================================================== -->

<a href="https://www.youtube.com/watch?v=YOUR_VIDEO_ID" target="_blank" title="Bấm để xem Video Demo FTodo">
  <img src="assets/screenshots/demo-video-thumbnail.png" alt="FTodo Demo Video Preview" width="850" style="max-width: 100%; border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.12);" onerror="this.src='https://placehold.co/1280x720/1e293b/ffffff?text=%E2%96%B6+B%E1%BA%A5m+%C4%91%E1%BB%83+xem+Video+Demo+FTodo+(YouTube+/+Loom)';" />
</a>

<p align="center">
  <i>(Bấm vào hình trên để xem toàn màn hình video trình diễn các tính năng Scrum & Quản trị tài chính)</i>
</p>

</div>

---

## 📸 Hình ảnh Giao diện & Tính năng (Screenshots)

### 1. 📊 Bảng điều khiển Tổng quan & Chỉ số Năng lực (Dashboard & Analytics)
> Tổng hợp danh mục dự án, tiến độ hoàn thành, đo lường Velocity qua các Sprint và cơ cấu phân bổ công việc (Stories vs Bugs).

<div align="center">
  <img src="assets/screenshots/01-dashboard.png" alt="Tổng quan hệ thống & Chỉ số vận hành" width="900" style="border-radius: 10px; border: 1px solid #e2e8f0;" onerror="this.src='https://placehold.co/1200x675/f8fafc/334155?text=%F0%9F%93%8A+H%C3%ACnh+%E1%BA%A3nh:+T%E1%BB%95ng+quan+H%E1%BB%87+th%E1%BB%91ng+(Dashboard+%26+Velocity)';" />
</div>

<br/>

### 2. 🎯 Bảng Scrum Kéo thả Tương tác (Interactive Kanban Board)
> Kéo thả mượt mà qua các cột *To Do, In Progress, Review, Done*, bộ lọc 1-chạm *"Việc của tôi"*, điểm Story Points Fibonacci và hiển thị mục tiêu Sprint.

<div align="center">
  <img src="assets/screenshots/02-scrum-board.png" alt="Bảng Scrum kéo thả" width="900" style="border-radius: 10px; border: 1px solid #e2e8f0;" onerror="this.src='https://placehold.co/1200x675/f8fafc/334155?text=%F0%9F%8E%AF+H%C3%ACnh+%E1%BA%A3nh:+B%E1%BA%A3ng+Scrum+Kanban+K%C3%A9o+Th%E1%BA%A3';" />
</div>

<br/>

### 3. 🌳 Cấu trúc Phân rã WBS & Product Backlog (Sprint Planning)
> Quản lý User Stories theo Epics, phân bổ công việc linh hoạt giữa *Active Sprint* và *Backlog*, điều chỉnh Story Points trực tiếp.

<div align="center">
  <img src="assets/screenshots/03-backlog.png" alt="Product Backlog & Kế hoạch Sprint" width="900" style="border-radius: 10px; border: 1px solid #e2e8f0;" onerror="this.src='https://placehold.co/1200x675/f8fafc/334155?text=%F0%9F%8C%B3+H%C3%ACnh+%E1%BA%A3nh:+WBS+Ph%C3%A2n+r%C3%A3+C%C3%B4ng+vi%E1%BB%87c+%26+Product+Backlog';" />
</div>

<br/>

### 4. 📅 Lộ trình Dự án Gantt Chart (Roadmap & Timeline)
> Biểu đồ Gantt trực quan theo ngày/tuần/tháng, vạch mốc thời gian thực *"Hôm nay"*, đo lường tiến độ bàn giao các tính năng quan trọng.

<div align="center">
  <img src="assets/screenshots/04-roadmap.png" alt="Lộ trình dự án Gantt Chart" width="900" style="border-radius: 10px; border: 1px solid #e2e8f0;" onerror="this.src='https://placehold.co/1200x675/f8fafc/334155?text=%F0%9F%93%85+H%C3%ACnh+%E1%BA%A3nh:+L%E1%BB%99+tr%C3%ACnh+D%E1%BB%B1+%C3%A1n+Gantt+Chart';" />
</div>

<br/>

### 5. 💵 Quản trị Tài chính Chiến lược & Chỉ số ROI / EVM
> Kiểm soát chi phí thực tế (Hạ tầng, Nhân sự, Bản quyền), luồng đề xuất kèm lý do bắt buộc, hộp thư phê duyệt của Sếp và thanh trượt mô phỏng ROI.

<div align="center">
  <img src="assets/screenshots/05-cost-governance.png" alt="Quản trị Tài chính & Duyệt chi" width="900" style="border-radius: 10px; border: 1px solid #e2e8f0;" onerror="this.src='https://placehold.co/1200x675/f8fafc/334155?text=%F0%9F%92%B5+H%C3%ACnh+%E1%BA%A3nh:+Qu%E1%BA%A3n+tr%E1%BB%8B+T%C3%A0i+ch%C3%ADnh%2C+ROI+%26+Duy%E1%BB%87t+Chi';" />
</div>

<br/>

### 6. 👥 Quản lý Nhân sự & Khởi tạo Nhóm quyền (Dynamic RBAC)
> Thẻ nhóm quyền trực tiếp (*Admin, DEV, QA*), form tạo nhóm quyền rộng rãi hỗ trợ preset vai trò (*Designer, DevOps, BA, Kế toán*) và ma trận cấp phép logic.

<div align="center">
  <img src="assets/screenshots/06-role-groups.png" alt="Quản lý Nhân sự & Phân quyền nhóm" width="900" style="border-radius: 10px; border: 1px solid #e2e8f0;" onerror="this.src='https://placehold.co/1200x675/f8fafc/334155?text=%F0%9F%91%A5+H%C3%ACnh+%E1%BA%A3nh:+Qu%E1%BA%A3n+l%C3%BD+Nh%C3%A2n+s%E1%BB%B1+%26+Kh%E1%BB%9Fi+t%E1%BA%A1o+Nh%C3%B3m+quy%E1%BB%81n';" />
</div>

<br/>

### 7. 📑 Báo cáo Tiến độ & Trình đọc Văn bản PDF (Document Viewer)
> Báo cáo định kỳ Sprint & sự cố kỹ thuật, tích hợp trình hiển thị văn bản chuẩn định dạng PDF có quốc hiệu, chữ ký số và nút ký duyệt.

<div align="center">
  <img src="assets/screenshots/07-reports-pdf.png" alt="Báo cáo tiến độ & Đọc văn bản PDF" width="900" style="border-radius: 10px; border: 1px solid #e2e8f0;" onerror="this.src='https://placehold.co/1200x675/f8fafc/334155?text=%F0%9F%93%91+H%C3%ACnh+%E1%BA%A3nh:+B%C3%A1o+c%C3%A1o+Ti%E1%BA%BFn+%C4%91%E1%BB%99+%26+Tr%C3%ACnh+%C4%91%E1%BB%8Dc+PDF';" />
</div>

<br/>

### 8. 💬 Kênh Trao đổi Chat Nhóm & Cá nhân Thời gian thực
> Phân chia kênh trao đổi (#chung, #phat-trien) kèm phản hồi emoji và trao đổi trực tiếp giữa các thành viên dự án.

<div align="center">
  <img src="assets/screenshots/08-chat.png" alt="Kênh trao đổi Chat realtime" width="900" style="border-radius: 10px; border: 1px solid #e2e8f0;" onerror="this.src='https://placehold.co/1200x675/f8fafc/334155?text=%F0%9F%92%AC+H%C3%ACnh+%E1%BA%A3nh:+K%C3%AAnh+trao+%C4%91%E1%BB%95i+Chat+Realtime';" />
</div>

---

## 📖 Giới thiệu Dự án

**FTodo** là giải pháp quản trị toàn diện vòng đời phát triển phần mềm (Software Development Life Cycle - SDLC). Ứng dụng giải quyết triệt để bài toán kết nối giữa **Đội ngũ kỹ thuật thực thi (Dev, QA)** và **Cấp quản lý ra quyết định (Product Owner, Sếp, CFO)** thông qua:

1. **Agile Execution:** Bảng Scrum kéo thả, phân rã công việc WBS, lập kế hoạch Backlog, ước lượng Story Points, biểu đồ Burndown và lộ trình Gantt.
2. **Financial Governance:** Kiểm soát chi phí thực tế, luồng đề xuất giải ngân có lý do bắt buộc, hộp thư phê duyệt của Sếp, và phân tích các chỉ số tài chính nâng cao (ROI, CPI, SPI, Runway).
3. **Dynamic RBAC & Workspace:** Hệ thống phân quyền động theo nhóm vai trò, thanh công cụ tùy biến trang con, và menu bên trái linh hoạt.

---

## ✨ Tính năng Nổi bật Chi tiết

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
* **Modal Khởi tạo nhóm quyền chuẩn UX/UI:** Thiết kế rộng rãi (`max-w-5xl`), hỗ trợ mẫu vai trò gợi ý (*Product Designer*, *DevOps*, *BA*, *Kế toán*) và ma trận cấp quyền logic.
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
├── assets/                       # Thư mục lưu trữ hình ảnh & video demo
│   └── screenshots/              # Ảnh chụp màn hình các trang tính năng
├── frontend/                     # Next.js 16 Client Application (App Router, Turbopack)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/login/     # Giao diện Đăng nhập
│   │   │   ├── (dashboard)/      # Trang Tổng quan dự án bắt đầu
│   │   │   │   └── projects/[id]/# Workspace Dự án & các trang con:
│   │   │   │       ├── board/    # Bảng Scrum kéo thả
│   │   │   │       ├── backlog/  # WBS & Kế hoạch Sprint
│   │   │   │       ├── timeline/ # Lộ trình Gantt Chart
│   │   │   │       ├── cost/     # Ngân sách, ROI & Duyệt chi phí
│   │   │   │       ├── reports/  # Báo cáo Burndown & Đọc báo cáo PDF
│   │   │   │       ├── members/  # Quản lý Nhân sự & Nhóm quyền
│   │   │   │       ├── issues/   # Tất cả tác vụ
│   │   │   │       ├── settings/ # Cài đặt dự án
│   │   │   │       └── chat/     # Kênh chat realtime
│   │   │   └── layout.tsx
│   │   ├── components/ui/        # Thư viện UI chuẩn Base UI & Shadcn
│   │   └── lib/                  # Auth Context, Activity Store, API Utilities
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
│       └── seed.ts               # Khởi tạo dữ liệu mẫu hoàn chỉnh
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

# Khởi tạo dữ liệu mẫu phong phú vào PostgreSQL
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

## 🔑 Tài khoản Mẫu có sẵn (Pre-seeded Accounts)

Hệ thống đã có sẵn 4 tài khoản mẫu được khởi tạo trong PostgreSQL (mật khẩu chung: `password123`). Bạn có thể đăng nhập hoặc dùng nút **"Chuyển vai trò Demo"** trên thanh tiêu đề:

| Vai trò | Họ và tên | Email | Mật khẩu | Đặc quyền chính |
| :--- | :--- | :--- | :--- | :--- |
| **Chủ dự án (Owner)** | Trịnh Quyết Chiến | `chien@example.com` | `password123` | Toàn quyền cài đặt dự án, duyệt/từ chối chi phí, phân tích ROI/EVM, đọc và ký duyệt PDF báo cáo. |
| **Senior DEV** | Nguyễn Văn An | `an@example.com` | `password123` | Thực thi task trên bảng Scrum, **được cấp thêm quyền** xem tab Chi phí và gửi đề xuất giải ngân. |
| **QA Lead** | Trần Thị Bình | `binh@example.com` | `password123` | Kiểm thử tính năng, gửi báo cáo kiểm định chất lượng lên cho Sếp (không có quyền xem Chi phí). |
| **Frontend Dev** | Lê Hoàng Dũng | `dung@example.com` | `password123` | Thành viên nhóm phát triển, tham gia chat và cập nhật tiến độ công việc. |

---

## 📜 Giấy phép & Tác giả

* **Dự án:** FTodo Software Management Platform
* **Tác giả:** Trịnh Quyết Chiến
* **Giấy phép:** MIT License
