// Shared TypeScript types and tab metadata for FTodo Scrum Platform
// All mock fixtures removed - Application strictly loads from PostgreSQL DB

export interface MockUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  jobTitle: string;
}

export const MOCK_USERS: Record<string, MockUser> = {};

export interface MockProject {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  owner?: { id: string; name: string; email: string; avatar?: string };
  progress: number;
  tasks: number;
  completedTasks: number;
  members: number;
  membersList?: any[];
  role?: string;
  createdAt: string;
}

export const INITIAL_MOCK_PROJECTS_LIST: MockProject[] = [];

export const INITIAL_MOCK_PROJECTS: { owned: MockProject[]; memberOf: MockProject[] } = {
  owned: [],
  memberOf: [],
};

// Available Jira-style Agile tab definitions
export const PROJECT_TABS = [
  { id: "overview", name: "Tổng quan", path: "", icon: "LayoutDashboard", description: "Thống kê tiến độ & công việc Sprint" },
  { id: "board", name: "Bảng Scrum", path: "/board", icon: "Kanban", description: "Kanban board kéo thả theo Sprint" },
  { id: "backlog", name: "Backlog", path: "/backlog", icon: "ListTodo", description: "Kế hoạch Sprint & User Stories" },
  { id: "timeline", name: "Lộ trình (Roadmap)", path: "/timeline", icon: "CalendarRange", description: "Sơ đồ Gantt tiến độ tính năng & Milestone" },
  { id: "issues", name: "Tất cả tác vụ", path: "/issues", icon: "CheckSquare", description: "Toàn bộ Bugs, Tasks, Stories theo bộ lọc" },
  { id: "reports", name: "Báo cáo & Burndown", path: "/reports", icon: "BarChart3", description: "Biểu đồ Burndown, Velocity & CFD" },
  { id: "cost", name: "Tiền & Chi phí", path: "/cost", icon: "DollarSign", description: "Ngân sách, burn-rate & chi tiêu" },
  { id: "members", name: "Nhân sự & Phân quyền", path: "/members", icon: "Users", description: "Quản lý nhóm quyền & thành viên" },
  { id: "activity", name: "Lịch sử hoạt động", path: "/activity", icon: "History", description: "Audit trail ghi nhận lịch sử thao tác dự án" },
  { id: "settings", name: "Cài đặt dự án", path: "/settings", icon: "Settings", description: "Đổi tên, cấu hình & xóa dự án" },
];

export interface MockRole {
  id: string;
  name: string;
  desc: string;
  permissions: string[];
}

export interface MockMember {
  id: string;
  name: string;
  email: string;
  roleId: string;
  extraPermissions: string[];
}

export const DEFAULT_INITIAL_ROLES: MockRole[] = [];

export const DEFAULT_INITIAL_MEMBERS: MockMember[] = [];
