import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu gieo mầm dữ liệu mẫu (Seeding)...');

  // 1. Clean existing test data
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
    },
  });

  const userAn = await prisma.user.create({
    data: {
      email: 'an@example.com',
      password: passwordHash,
      name: 'Nguyễn Văn An',
      avatar: 'VA',
      role: 'USER',
    },
  });

  const userBinh = await prisma.user.create({
    data: {
      email: 'binh@example.com',
      password: passwordHash,
      name: 'Trần Thị Bình',
      avatar: 'TB',
      role: 'USER',
    },
  });

  console.log('✅ Đã tạo 3 người dùng mẫu: chien@example.com, an@example.com, binh@example.com (Mật khẩu: password123)');

  // 3. Create Project
  const project = await prisma.project.create({
    data: {
      name: 'Hệ thống Quản lý Phần mềm Scrum FTodo',
      description: 'Nền tảng quản lý dự án Agile/Scrum toàn diện với Next.js và NestJS',
      ownerId: userChien.id,
    },
  });

  // 4. Create Role Groups
  const roleAdmin = await prisma.roleGroup.create({
    data: {
      name: 'Admin',
      permissions: ['overview', 'board', 'backlog', 'members', 'chat', 'cost', 'settings'],
      isDefault: false,
      projectId: project.id,
    },
  });

  const roleDev = await prisma.roleGroup.create({
    data: {
      name: 'DEV',
      permissions: ['overview', 'board', 'backlog', 'chat'],
      isDefault: true,
      projectId: project.id,
    },
  });

  const roleQA = await prisma.roleGroup.create({
    data: {
      name: 'QA',
      permissions: ['overview', 'board', 'chat'],
      isDefault: false,
      projectId: project.id,
    },
  });

  // 5. Add Members with Group Roles and Individual Overrides
  await prisma.projectMember.create({
    data: {
      userId: userChien.id,
      projectId: project.id,
      roleGroupId: roleAdmin.id,
      extraPermissions: [],
    },
  });

  // User An is DEV, but granted extra "cost" permission
  await prisma.projectMember.create({
    data: {
      userId: userAn.id,
      projectId: project.id,
      roleGroupId: roleDev.id,
      extraPermissions: ['cost'],
    },
  });

  // User Binh is QA
  await prisma.projectMember.create({
    data: {
      userId: userBinh.id,
      projectId: project.id,
      roleGroupId: roleQA.id,
      extraPermissions: [],
    },
  });

  // 6. Create Channels and Messages
  const chGeneral = await prisma.channel.create({
    data: {
      name: 'chung',
      description: 'Kênh trao đổi chung của toàn đội ngũ',
      projectId: project.id,
    },
  });

  const chDev = await prisma.channel.create({
    data: {
      name: 'phat-trien',
      description: 'Kênh thảo luận kỹ thuật, PR và kiến trúc backend/frontend',
      projectId: project.id,
    },
  });

  await prisma.message.create({
    data: {
      content: 'Chào mừng cả team đến với dự án FTodo Scrum! Sprint 1 đã chính thức khởi động.',
      channelId: chGeneral.id,
      userId: userChien.id,
    },
  });

  await prisma.message.create({
    data: {
      content: 'API specs và Prisma models đã được cập nhật đầy đủ trên repository.',
      channelId: chDev.id,
      userId: userAn.id,
    },
  });

  // 7. Create Sprints
  const sprint1 = await prisma.sprint.create({
    data: {
      name: 'Sprint 1 - Foundation & Core Architecture',
      goal: 'Hoàn thành kiến trúc xác thực, phân quyền nhóm và giao diện quản lý Scrum cơ bản.',
      startDate: new Date('2026-10-01'),
      endDate: new Date('2026-10-15'),
      status: 'ACTIVE',
      projectId: project.id,
    },
  });

  // 8. Create Tasks
  await prisma.task.createMany({
    data: [
      {
        code: 'FT-101',
        title: 'Thiết kế cơ sở dữ liệu PostgreSQL và Prisma schema',
        description: 'Mô hình hóa User, Project, RoleGroup, Sprint, Task, Cost, Message',
        status: 'DONE',
        priority: 'HIGH',
        points: 5,
        projectId: project.id,
        sprintId: sprint1.id,
        assigneeId: userBinh.id,
      },
      {
        code: 'FT-102',
        title: 'Xây dựng hệ thống Xác thực JWT và Phân quyền theo nhóm',
        description: 'Bảo mật endpoint và hỗ trợ quyền hạn linh hoạt theo Group kèm Individual Overrides',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        points: 8,
        projectId: project.id,
        sprintId: sprint1.id,
        assigneeId: userAn.id,
      },
      {
        code: 'FT-103',
        title: 'Giao diện Bảng Scrum Kanban kéo thả và Backlog',
        description: 'Hiển thị cột To Do, In Progress, Review, Done với thống kê điểm Story Points',
        status: 'TODO',
        priority: 'MEDIUM',
        points: 5,
        projectId: project.id,
        sprintId: sprint1.id,
        assigneeId: userChien.id,
      },
      {
        code: 'FT-104',
        title: 'Trang quản trị Chi phí và biểu đồ Burn-rate',
        description: 'Theo dõi tổng ngân sách, phân bổ danh mục và đề xuất khoản chi',
        status: 'REVIEW',
        priority: 'MEDIUM',
        points: 3,
        projectId: project.id,
        sprintId: sprint1.id,
        assigneeId: userChien.id,
      },
    ],
  });

  // 9. Create Costs
  await prisma.cost.createMany({
    data: [
      {
        title: 'AWS RDS PostgreSQL & Cloud Hosting (Tháng 10)',
        category: 'infrastructure',
        amount: 14500000,
        status: 'PAID',
        projectId: project.id,
        sprintId: sprint1.id,
        requesterId: userAn.id,
      },
      {
        title: 'Lương Sprint 1 - Core Dev & QA Team',
        category: 'personnel',
        amount: 140000000,
        status: 'PAID',
        projectId: project.id,
        sprintId: sprint1.id,
        requesterId: userChien.id,
      },
      {
        title: 'Bản quyền GitHub Enterprise & JetBrains',
        category: 'licenses',
        amount: 32000000,
        status: 'PAID',
        projectId: project.id,
        requesterId: userBinh.id,
      },
    ],
  });

  console.log('🎉 Gieo mầm dữ liệu mẫu hoàn tất!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
