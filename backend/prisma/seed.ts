import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu gieo mầm dữ liệu mẫu hoàn chỉnh (Seeding database)...');

  // 1. Clean existing test data in reverse dependency order
  await prisma.report.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.channel.deleteMany();
  await prisma.cost.deleteMany();
  await prisma.task.deleteMany();
  await prisma.sprint.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.roleGroup.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  const userChien = await prisma.user.create({
    data: {
      email: 'chien@example.com',
      password: passwordHash,
      name: 'Trịnh Quyết Chiến',
      avatar: 'QC',
      role: 'ADMIN',
      isActive: true,
    },
  });

  const userAn = await prisma.user.create({
    data: {
      email: 'an@example.com',
      password: passwordHash,
      name: 'Nguyễn Văn An',
      avatar: 'VA',
      role: 'USER',
      isActive: true,
    },
  });

  const userBinh = await prisma.user.create({
    data: {
      email: 'binh@example.com',
      password: passwordHash,
      name: 'Trần Thị Bình',
      avatar: 'TB',
      role: 'USER',
      isActive: true,
    },
  });

  const userDung = await prisma.user.create({
    data: {
      email: 'dung@example.com',
      password: passwordHash,
      name: 'Lê Hoàng Dũng',
      avatar: 'HD',
      role: 'USER',
      isActive: true,
    },
  });

  // 3. Project 1: FTodo Core
  const projectFTodo = await prisma.project.create({
    data: {
      name: 'FTodo - Nền tảng Quản trị Agile Scrum',
      description: 'Hệ thống Quản lý Dự án Agile Scrum & Quản trị Tài chính Dự án toàn diện.',
      ownerId: userChien.id,
    },
  });

  // Role Groups for FTodo
  const roleAdmin = await prisma.roleGroup.create({
    data: {
      name: 'Admin',
      permissions: ['overview', 'board', 'backlog', 'members', 'chat', 'cost', 'settings', 'reports', 'timeline', 'releases'],
      isDefault: false,
      projectId: projectFTodo.id,
    },
  });

  const roleDev = await prisma.roleGroup.create({
    data: {
      name: 'DEV',
      permissions: ['overview', 'board', 'backlog', 'chat', 'reports'],
      isDefault: true,
      projectId: projectFTodo.id,
    },
  });

  const roleQA = await prisma.roleGroup.create({
    data: {
      name: 'QA',
      permissions: ['overview', 'board', 'chat', 'reports'],
      isDefault: false,
      projectId: projectFTodo.id,
    },
  });

  // Memberships for FTodo
  await prisma.projectMember.createMany({
    data: [
      {
        userId: userChien.id,
        projectId: projectFTodo.id,
        roleGroupId: roleAdmin.id,
        extraPermissions: [],
      },
      {
        userId: userAn.id,
        projectId: projectFTodo.id,
        roleGroupId: roleDev.id,
        extraPermissions: [],
      },
      {
        userId: userBinh.id,
        projectId: projectFTodo.id,
        roleGroupId: roleQA.id,
        extraPermissions: [],
      },
      {
        userId: userDung.id,
        projectId: projectFTodo.id,
        roleGroupId: roleDev.id,
        extraPermissions: [],
      },
    ],
  });

  // Sprints for FTodo
  const sprint1 = await prisma.sprint.create({
    data: {
      name: 'Sprint 1',
      goal: 'Hoàn thành toàn diện kiến trúc xác thực JWT, phân quyền nhóm linh hoạt cho thành viên và bảng Scrum kéo thả.',
      startDate: new Date('2026-10-01'),
      endDate: new Date('2026-10-15'),
      status: 'ACTIVE',
      projectId: projectFTodo.id,
    },
  });

  const sprint2 = await prisma.sprint.create({
    data: {
      name: 'Sprint 2',
      goal: 'Tích hợp kênh Chat thời gian thực, quản lý Chi phí & Ngân sách, tối ưu hóa giao diện thiết bị di động.',
      startDate: new Date('2026-10-16'),
      endDate: new Date('2026-10-31'),
      status: 'PLANNED',
      projectId: projectFTodo.id,
    },
  });

  // Tasks for FTodo
  await prisma.task.createMany({
    data: [
      {
        code: 'FT-101',
        title: 'Thiết kế cơ sở dữ liệu PostgreSQL và Prisma schema',
        description: 'Tạo các bảng User, Project, Sprint, Task, Cost, Channel, RoleGroup',
        status: 'DONE',
        priority: 'HIGH',
        points: 5,
        projectId: projectFTodo.id,
        sprintId: sprint1.id,
        assigneeId: userBinh.id,
      },
      {
        code: 'FT-102',
        title: 'Xây dựng hệ thống Xác thực JWT và Phân quyền theo nhóm',
        description: 'Đăng nhập, đăng ký, access/refresh token rotation, guard phân quyền RBAC',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        points: 8,
        projectId: projectFTodo.id,
        sprintId: sprint1.id,
        assigneeId: userAn.id,
      },
      {
        code: 'FT-103',
        title: 'Bảng Kanban Scrum kéo thả tương tác mượt mà',
        description: 'Tích hợp Drag and Drop cho các cột To Do, In Progress, Review, Done',
        status: 'DONE',
        priority: 'MEDIUM',
        points: 3,
        projectId: projectFTodo.id,
        sprintId: sprint1.id,
        assigneeId: userAn.id,
      },
      {
        code: 'FT-104',
        title: 'Quản lý Chi phí & Ngân sách dự án',
        description: 'Theo dõi tổng chi tiêu, phân loại hạ tầng/nhân sự/bản quyền và phê duyệt',
        status: 'REVIEW',
        priority: 'MEDIUM',
        points: 5,
        projectId: projectFTodo.id,
        sprintId: sprint1.id,
        assigneeId: userChien.id,
      },
      {
        code: 'FT-105',
        title: 'Kênh Trao đổi Chat dự án theo thời gian thực',
        description: 'Phân chia kênh chat (#chung, #phat-trien) kèm phản hồi cảm xúc',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        points: 6,
        projectId: projectFTodo.id,
        sprintId: sprint1.id,
        assigneeId: userDung.id,
      },
      {
        code: 'FT-106',
        title: 'Tối ưu hóa giao diện di động Responsive',
        description: 'Vuốt ngang cột bảng Kanban, Drawer menu gọn gàng trên smartphone',
        status: 'TODO',
        priority: 'LOW',
        points: 3,
        projectId: projectFTodo.id,
        sprintId: sprint1.id,
        assigneeId: userAn.id,
      },
      {
        code: 'FT-107',
        title: 'Xuất Báo cáo tiến độ Sprint sang file PDF',
        description: 'Tạo tài liệu chính thức gửi cấp quản lý phê duyệt',
        status: 'TODO',
        priority: 'LOW',
        points: 2,
        projectId: projectFTodo.id,
        sprintId: sprint2.id,
        assigneeId: userBinh.id,
      },
    ],
  });

  // Costs for FTodo
  await prisma.cost.createMany({
    data: [
      {
        title: 'AWS RDS PostgreSQL & Cloud Hosting (Tháng 10)',
        category: 'infrastructure',
        amount: 14500000,
        status: 'PAID',
        projectId: projectFTodo.id,
        sprintId: sprint1.id,
        requesterId: userAn.id,
      },
      {
        title: 'Lương Sprint 1 - Core Dev & QA Team',
        category: 'personnel',
        amount: 140000000,
        status: 'PAID',
        projectId: projectFTodo.id,
        sprintId: sprint1.id,
        requesterId: userChien.id,
      },
      {
        title: 'Bản quyền GitHub Enterprise & JetBrains',
        category: 'licenses',
        amount: 32000000,
        status: 'APPROVED',
        projectId: projectFTodo.id,
        requesterId: userBinh.id,
      },
    ],
  });

  // Channels & Messages for FTodo
  const channelChung = await prisma.channel.create({
    data: {
      name: 'chung',
      description: 'Kênh trao đổi chung cho toàn thể thành viên dự án',
      projectId: projectFTodo.id,
    },
  });

  const channelDev = await prisma.channel.create({
    data: {
      name: 'phat-trien',
      description: 'Thảo luận kỹ thuật kiến trúc, API và mã nguồn',
      projectId: projectFTodo.id,
    },
  });

  await prisma.message.createMany({
    data: [
      {
        content: 'Chào mừng cả đội ngũ tham gia dự án FTodo Core! Chúng ta bắt đầu Sprint 1 từ hôm nay.',
        channelId: channelChung.id,
        userId: userChien.id,
      },
      {
        content: 'Tôi đã hoàn thành thiết kế Schema PostgreSQL trên Prisma (FT-101), các bạn có thể kiểm tra.',
        channelId: channelDev.id,
        userId: userBinh.id,
      },
      {
        content: 'Tuyệt vời Bình! An và Dũng tiếp tục đẩy mạnh module Auth JWT và Realtime Chat nhé.',
        channelId: channelDev.id,
        userId: userChien.id,
      },
    ],
  });

  // Reports for FTodo
  await prisma.report.createMany({
    data: [
      {
        title: 'Báo cáo Sprint 1: Hoàn tất Module Auth & Tối ưu Database',
        type: 'sprint',
        authorId: userAn.id,
        projectId: projectFTodo.id,
        status: 'reviewed',
        summary: 'Đã hoàn thành 85% khối lượng công việc Sprint 1. Hệ thống JWT và phân quyền đã kiểm thử thành công.',
        completedTasks: '- Thiết kế schema Prisma PostgreSQL\n- Xây dựng API Login, Register, Refresh Token\n- Tích hợp bảo mật RBAC',
        blockers: 'Đang chờ cấu hình DNS cho môi trường Staging.',
      },
      {
        title: 'Báo cáo Tuần 2: Tiến độ Kiểm thử & Báo cáo Lỗi hệ thống',
        type: 'weekly',
        authorId: userBinh.id,
        projectId: projectFTodo.id,
        status: 'sent',
        summary: 'Đã thực hiện kiểm thử tự động 24 test cases. Phát hiện 2 lỗi giao diện đã được chuyển cho team DEV khắc phục.',
        completedTasks: '- Viết Test Suite cho luồng đăng nhập\n- Kiểm thử ma trận phân quyền theo vai trò',
        blockers: 'Cần môi trường test có dữ liệu mẫu lớn hơn.',
      },
    ],
  });

  // 4. Project 2: E-Commerce
  const projectEcommerce = await prisma.project.create({
    data: {
      name: 'Hệ thống Thương mại Điện tử E-Commerce',
      description: 'Cổng mua sắm trực tuyến đa kênh, tích hợp thanh toán VnPay & Momo.',
      ownerId: userChien.id,
    },
  });

  await prisma.projectMember.create({
    data: {
      userId: userChien.id,
      projectId: projectEcommerce.id,
    },
  });

  const ecSprint = await prisma.sprint.create({
    data: {
      name: 'Sprint 2 (Giao vận)',
      goal: 'Tích hợp đơn vị vận chuyển Giao Hàng Tiết Kiệm và Viettel Post',
      startDate: new Date('2026-10-05'),
      endDate: new Date('2026-10-20'),
      status: 'ACTIVE',
      projectId: projectEcommerce.id,
    },
  });

  await prisma.task.createMany({
    data: [
      {
        code: 'EC-101',
        title: 'Tích hợp Webhook đồng bộ trạng thái đơn hàng',
        status: 'DONE',
        points: 8,
        projectId: projectEcommerce.id,
        sprintId: ecSprint.id,
        assigneeId: userChien.id,
      },
      {
        code: 'EC-102',
        title: 'Giao diện tính phí ship tự động theo địa chỉ',
        status: 'IN_PROGRESS',
        points: 5,
        projectId: projectEcommerce.id,
        sprintId: ecSprint.id,
        assigneeId: userChien.id,
      },
    ],
  });

  // 5. Project 3: CRM Enterprise
  const projectCRM = await prisma.project.create({
    data: {
      name: 'Nền tảng CRM Doanh nghiệp',
      description: 'Quản trị quan hệ khách hàng B2B, theo dõi Pipeline bán hàng và hợp đồng.',
      ownerId: userChien.id,
    },
  });

  await prisma.projectMember.create({
    data: {
      userId: userChien.id,
      projectId: projectCRM.id,
    },
  });

  await prisma.task.createMany({
    data: [
      {
        code: 'CRM-101',
        title: 'Xây dựng Phễu bán hàng Kanban cho khách hàng tiềm năng',
        status: 'DONE',
        points: 5,
        projectId: projectCRM.id,
        assigneeId: userChien.id,
      },
      {
        code: 'CRM-102',
        title: 'Gửi Email thông báo tự động khi ký kết hợp đồng',
        status: 'TODO',
        points: 5,
        projectId: projectCRM.id,
        assigneeId: userChien.id,
      },
    ],
  });

  // 6. Project 4: AI Assistant (Owned by An, Chien is member)
  const projectAI = await prisma.project.create({
    data: {
      name: 'Trợ lý AI Tự động hóa Quy trình',
      description: 'Tích hợp LLM tự động tóm tắt cuộc họp và phân công nhiệm vụ tự động.',
      ownerId: userAn.id,
    },
  });

  await prisma.projectMember.createMany({
    data: [
      {
        userId: userAn.id,
        projectId: projectAI.id,
      },
      {
        userId: userChien.id,
        projectId: projectAI.id,
      },
    ],
  });

  await prisma.task.createMany({
    data: [
      {
        code: 'AI-101',
        title: 'Tích hợp Gemini Flash cho luồng tóm tắt văn bản',
        status: 'DONE',
        points: 8,
        projectId: projectAI.id,
        assigneeId: userAn.id,
      },
      {
        code: 'AI-102',
        title: 'Đánh giá độ chính xác trích xuất hành động từ biên bản họp',
        status: 'IN_PROGRESS',
        points: 5,
        projectId: projectAI.id,
        assigneeId: userChien.id,
      },
    ],
  });

  console.log('🎉 Gieo mầm dữ liệu mẫu thành công hoàn toàn vào PostgreSQL!');
}

main()
  .catch((e) => {
    console.error('Lỗi khi seed dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
