export interface MockUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  jobTitle: string;
}

export const MOCK_USERS: Record<string, MockUser> = {
  owner: {
    id: "u-chien",
    name: "Trịnh Quyết Chiến",
    email: "chien@example.com",
    avatar: "QC",
    role: "ADMIN",
    jobTitle: "Product Owner / Chủ dự án",
  },
  dev: {
    id: "u-an",
    name: "Nguyễn Văn An",
    email: "an@example.com",
    avatar: "VA",
    role: "USER",
    jobTitle: "Senior DEV (Được cấp quyền Chi phí)",
  },
  qa: {
    id: "u-binh",
    name: "Trần Thị Bình",
    email: "binh@example.com",
    avatar: "TB",
    role: "USER",
    jobTitle: "QA Tester (Quyền nhân viên cơ bản)",
  },
};

export interface MockProject {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  progress: number;
  tasks: number;
  completedTasks: number;
  members: number;
  createdAt: string;
}

export const INITIAL_MOCK_PROJECTS_LIST: MockProject[] = [
  {
    id: "ftodo-core",
    name: "Hệ thống Quản lý Phần mềm Scrum FTodo",
    description: "Nền tảng quản lý dự án Agile/Scrum toàn diện với Next.js và NestJS",
    ownerId: "u-chien",
    progress: 65,
    tasks: 16,
    completedTasks: 10,
    members: 5,
    createdAt: "10/10/2026",
  },
  {
    id: "ecommerce-app",
    name: "Ứng dụng Thương mại Điện tử E-Commerce",
    description: "Hệ thống bán hàng đa kênh kết hợp mobile app và cổng thanh toán",
    ownerId: "u-chien",
    progress: 40,
    tasks: 24,
    completedTasks: 9,
    members: 4,
    createdAt: "01/10/2026",
  },
  {
    id: "crm-enterprise",
    name: "Hệ thống CRM Quản lý Khách hàng Doanh nghiệp",
    description: "Dự án CRM cho khối bán hàng B2B, quản lý lead và pipeline bán hàng",
    ownerId: "u-an",
    progress: 25,
    tasks: 18,
    completedTasks: 4,
    members: 6,
    createdAt: "28/09/2026",
  },
];

export const INITIAL_MOCK_PROJECTS: { owned: MockProject[]; memberOf: MockProject[] } = {
  owned: INITIAL_MOCK_PROJECTS_LIST.filter((p) => p.ownerId === "u-chien"),
  memberOf: INITIAL_MOCK_PROJECTS_LIST.filter((p) => p.ownerId !== "u-chien"),
};

// Available Jira-style Agile tab definitions
export const PROJECT_TABS = [
  { id: "overview", name: "Tổng quan", path: "", icon: "LayoutDashboard", description: "Thống kê tiến độ & công việc Sprint" },
  { id: "board", name: "Bảng Scrum", path: "/board", icon: "Kanban", description: "Kanban board kéo thả theo Sprint" },
  { id: "backlog", name: "Backlog", path: "/backlog", icon: "ListTodo", description: "Kế hoạch Sprint & User Stories" },
  { id: "timeline", name: "Lộ trình (Roadmap)", path: "/timeline", icon: "CalendarRange", description: "Sơ đồ Gantt tiến độ tính năng & Milestone" },
  { id: "issues", name: "Tất cả tác vụ", path: "/issues", icon: "CheckSquare", description: "Toàn bộ Bugs, Tasks, Stories theo bộ lọc" },
  { id: "reports", name: "Báo cáo & Burndown", path: "/reports", icon: "BarChart3", description: "Biểu đồ Burndown, Velocity & CFD" },
  { id: "releases", name: "Phiên bản phát hành", path: "/releases", icon: "Rocket", description: "Quản lý phiên bản phát hành v1.0, v1.1" },
  { id: "components", name: "Hợp phần kiến trúc", path: "/components", icon: "Boxes", description: "Phân rã module (Frontend, Backend, DB)" },
  { id: "cost", name: "Tiền & Chi phí", path: "/cost", icon: "DollarSign", description: "Ngân sách, burn-rate & chi tiêu" },
  { id: "members", name: "Nhân sự & Phân quyền", path: "/members", icon: "Users", description: "Quản lý nhóm quyền & thành viên" },
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

export const DEFAULT_INITIAL_ROLES: MockRole[] = [
  {
    id: "r1",
    name: "Chủ dự án (Admin)",
    desc: "Toàn quyền quản trị và truy cập tất cả các tính năng",
    permissions: [
      "overview",
      "board",
      "backlog",
      "timeline",
      "issues",
      "reports",
      "releases",
      "components",
      "members",
      "chat",
      "cost",
      "settings",
    ],
  },
  {
    id: "r2",
    name: "Lập trình viên (DEV)",
    desc: "Thực hiện và cập nhật các tính năng, xem mã nguồn và báo cáo",
    permissions: [
      "overview",
      "board",
      "backlog",
      "timeline",
      "issues",
      "reports",
      "releases",
      "components",
      "chat",
    ],
  },
  {
    id: "r3",
    name: "Kiểm thử (QA/Tester)",
    desc: "Kiểm thử chức năng, theo dõi bugs và kiểm tra chất lượng",
    permissions: [
      "overview",
      "board",
      "backlog",
      "timeline",
      "issues",
      "reports",
      "chat",
    ],
  },
];

export const DEFAULT_INITIAL_MEMBERS: MockMember[] = [
  { id: "u-chien", name: "Trịnh Quyết Chiến", email: "chien@example.com", roleId: "r1", extraPermissions: [] },
  { id: "u-an", name: "Nguyễn Văn An", email: "an@example.com", roleId: "r2", extraPermissions: ["cost"] },
  { id: "u-binh", name: "Trần Thị Bình", email: "binh@example.com", roleId: "r3", extraPermissions: [] },
];
