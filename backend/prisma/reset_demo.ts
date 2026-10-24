import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function reset() {
  const projectId = '1610cc64-6a57-4dd1-94ba-6cb423e22b99';

  console.log('🔄 Đang dọn dẹp dữ liệu cũ của dự án FTodo...');

  // 1. Delete existing tasks and sprints of this project
  await prisma.task.deleteMany({ where: { projectId } });
  await prisma.sprint.deleteMany({ where: { projectId } });
  await prisma.activityLog.deleteMany({ where: { projectId } });

  // 2. Fetch users
  const userChien = await prisma.user.findFirst({ where: { email: 'chien@example.com' } });
  const userAn = await prisma.user.findFirst({ where: { email: 'an@example.com' } });
  const userBinh = await prisma.user.findFirst({ where: { email: 'binh@example.com' } });
  const userDung = await prisma.user.findFirst({ where: { email: 'dung@example.com' } });

  const chienId = userChien?.id || null;
  const anId = userAn?.id || null;
  const binhId = userBinh?.id || null;
  const dungId = userDung?.id || null;

  const now = new Date();
  const twoWeeksLater = new Date(now.getTime() + 14 * 86400000);
  const fourWeeksLater = new Date(now.getTime() + 28 * 86400000);

  // 3. Create Sprint 1 (ACTIVE)
  const sprint1 = await prisma.sprint.create({
    data: {
      name: 'Sprint 1',
      goal: 'Hoàn thiện kiến trúc xác thực JWT, bảo mật hệ thống và bảng Kanban Scrum mượt mà.',
      budget: 35000000,
      startDate: now,
      endDate: twoWeeksLater,
      status: 'ACTIVE',
      projectId,
    },
  });

  // 4. Create Sprint 2 (PLANNED)
  const sprint2 = await prisma.sprint.create({
    data: {
      name: 'Sprint 2',
      goal: 'Tích hợp kênh Chat thời gian thực, quản lý Chi phí & Ngân sách, tối ưu hóa giao diện di động.',
      budget: 45000000,
      startDate: twoWeeksLater,
      endDate: fourWeeksLater,
      status: 'PLANNED',
      projectId,
    },
  });

  // 5. Create Fresh Standard Tasks
  await prisma.task.createMany({
    data: [
      // Sprint 1 Tasks
      {
        code: 'FT-101',
        title: 'Thiết kế cơ sở dữ liệu PostgreSQL và Prisma schema',
        description: 'Tạo các bảng User, Project, Sprint, Task, Cost, Channel, RoleGroup',
        type: 'TASK',
        epic: 'Kiến trúc Cốt lõi',
        status: 'DONE',
        priority: 'HIGH',
        points: 5,
        projectId,
        sprintId: sprint1.id,
        assigneeId: binhId,
      },
      {
        code: 'FT-102',
        title: 'Xây dựng hệ thống Xác thực JWT và Phân quyền theo nhóm',
        description: 'Đăng nhập, đăng ký, access/refresh token rotation, guard phân quyền RBAC',
        type: 'STORY',
        epic: 'Xác thực & Bảo mật',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        points: 8,
        projectId,
        sprintId: sprint1.id,
        assigneeId: anId,
      },
      {
        code: 'FT-103',
        title: 'Bảng Kanban Scrum kéo thả tương tác mượt mà',
        description: 'Tích hợp Drag and Drop cho các cột To Do, In Progress, Review, Done',
        type: 'STORY',
        epic: 'Kiến trúc Cốt lõi',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        points: 5,
        projectId,
        sprintId: sprint1.id,
        assigneeId: anId,
      },
      {
        code: 'FT-104',
        title: 'Kênh Trao đổi Chat dự án theo thời gian thực',
        description: 'Phân chia kênh chat (#chung, #phat-trien) kèm phản hồi cảm xúc',
        type: 'STORY',
        epic: 'Giao tiếp Đội ngũ',
        status: 'TODO',
        priority: 'MEDIUM',
        points: 5,
        projectId,
        sprintId: sprint1.id,
        assigneeId: dungId,
      },
      {
        code: 'FT-105',
        title: 'Lỗi rò rỉ token khi chuyển đổi qua lại giữa các tab trình duyệt',
        description: 'Phát hiện sự kiện lưu trữ không đồng bộ phiên đăng nhập giữa các tab',
        type: 'BUG',
        epic: 'Xác thực & Bảo mật',
        status: 'TODO',
        priority: 'HIGH',
        points: 3,
        projectId,
        sprintId: sprint1.id,
        assigneeId: binhId,
      },

      // Backlog Tasks (sprintId: null)
      {
        code: 'FT-106',
        title: 'Quản lý Chi phí & Ngân sách dự án',
        description: 'Theo dõi tổng chi tiêu, phân loại hạ tầng/nhân sự/bản quyền và phê duyệt',
        type: 'TASK',
        epic: 'Quản lý Tài chính',
        status: 'TODO',
        priority: 'MEDIUM',
        points: 5,
        projectId,
        sprintId: null,
        assigneeId: chienId,
      },
      {
        code: 'FT-107',
        title: 'Tối ưu hóa giao diện di động Responsive',
        description: 'Vuốt ngang cột bảng Kanban, Drawer menu gọn gàng trên smartphone',
        type: 'TASK',
        epic: 'Kiến trúc Cốt lõi',
        status: 'TODO',
        priority: 'LOW',
        points: 3,
        projectId,
        sprintId: null,
        assigneeId: anId,
      },
      {
        code: 'FT-108',
        title: 'Xuất Báo cáo tiến độ Sprint sang file PDF',
        description: 'Tạo tài liệu chính thức gửi cấp quản lý phê duyệt',
        type: 'TASK',
        epic: 'Kiến trúc Cốt lõi',
        status: 'TODO',
        priority: 'LOW',
        points: 2,
        projectId,
        sprintId: null,
        assigneeId: binhId,
      },
      {
        code: 'FT-109',
        title: 'Nghiên cứu cơ chế WebSocket hai chiều cho bảng Kanban',
        description: 'Đồng bộ tức thì mọi thao tác kéo thả giữa nhiều người dùng',
        type: 'TASK',
        epic: 'Kiến trúc Cốt lõi',
        status: 'TODO',
        priority: 'HIGH',
        points: 5,
        projectId,
        sprintId: null,
        assigneeId: dungId,
      },
    ],
  });

  // 6. Create Initial Activity Log
  await prisma.activityLog.create({
    data: {
      projectId,
      userId: chienId || undefined,
      userName: userChien?.name || 'Trịnh Quyết Chiến',
      category: 'sprint',
      action: 'đã khởi tạo Sprint 1 và phân bổ công việc chuẩn Agile Scrum',
      detail: 'Sprint 1 đang hoạt động với 26 Story Points cam kết.',
    },
  });

  console.log('✅ Đã làm mới thành công dữ liệu dự án FTodo!');
}

reset()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
