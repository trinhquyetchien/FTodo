export interface ProjectInvitation {
  id: string;
  projectId: string;
  projectName: string;
  projectDescription: string;
  inviterName: string;
  inviterEmail: string;
  roleGroupId: string;
  roleGroupName: string;
  recipientEmail: string;
  recipientName: string;
  createdAt: string;
  status: "pending" | "accepted" | "declined";
}

export interface ProjectActivityLog {
  id: string;
  projectId: string;
  userName: string;
  userAvatar: string;
  userRole: string;
  category: "task" | "cost" | "member" | "report" | "settings";
  action: string;
  detail: string;
  timestamp: string;
  timeAgo: string;
}

export const INITIAL_INVITATIONS: ProjectInvitation[] = [
  {
    id: "inv-1",
    projectId: "fintech-pay",
    projectName: "Hệ thống Cổng Thanh toán FinTech Pay",
    projectDescription: "Nền tảng thanh toán đa kênh liên kết ngân hàng và ví điện tử chuẩn quốc tế PCI-DSS",
    inviterName: "Trần Minh Quân (CTO)",
    inviterEmail: "quan@fintech.vn",
    roleGroupId: "r2",
    roleGroupName: "Lập trình viên (DEV)",
    recipientEmail: "chien@example.com",
    recipientName: "Trịnh Quyết Chiến",
    createdAt: "Hôm nay, 08:30",
    status: "pending",
  },
  {
    id: "inv-2",
    projectId: "smart-logistics",
    projectName: "Ứng dụng Điều phối Vận tải Smart Logistics",
    projectDescription: "Hệ thống giám sát hành trình xe vận chuyển và tối ưu hóa tuyến đường thông minh thời gian thực",
    inviterName: "Lê Hoàng Yến (PM)",
    inviterEmail: "yen@logistics.vn",
    roleGroupId: "r3",
    roleGroupName: "Kiểm thử (QA/Tester)",
    recipientEmail: "chien@example.com",
    recipientName: "Trịnh Quyết Chiến",
    createdAt: "Hôm qua, 15:45",
    status: "pending",
  },
  {
    id: "inv-3",
    projectId: "ftodo-core",
    projectName: "Hệ thống Quản lý Phần mềm Scrum FTodo",
    projectDescription: "Nền tảng quản lý dự án Agile/Scrum toàn diện",
    inviterName: "Trịnh Quyết Chiến (Chủ dự án)",
    inviterEmail: "chien@example.com",
    roleGroupId: "r2",
    roleGroupName: "Lập trình viên (DEV)",
    recipientEmail: "hoangdung@company.vn",
    recipientName: "Lê Hoàng Dũng",
    createdAt: "11/10/2026, 08:45",
    status: "pending",
  },
  {
    id: "inv-4",
    projectId: "ftodo-core",
    projectName: "Hệ thống Quản lý Phần mềm Scrum FTodo",
    projectDescription: "Nền tảng quản lý dự án Agile/Scrum toàn diện",
    inviterName: "Trịnh Quyết Chiến (Chủ dự án)",
    inviterEmail: "chien@example.com",
    roleGroupId: "r2",
    roleGroupName: "Lập trình viên (DEV)",
    recipientEmail: "an@example.com",
    recipientName: "Nguyễn Văn An",
    createdAt: "09/10/2026, 10:15",
    status: "accepted",
  },
  {
    id: "inv-5",
    projectId: "ftodo-core",
    projectName: "Hệ thống Quản lý Phần mềm Scrum FTodo",
    projectDescription: "Nền tảng quản lý dự án Agile/Scrum toàn diện",
    inviterName: "Trịnh Quyết Chiến (Chủ dự án)",
    inviterEmail: "chien@example.com",
    roleGroupId: "r3",
    roleGroupName: "Kiểm thử (QA/Tester)",
    recipientEmail: "thuha@partner.vn",
    recipientName: "Phạm Thu Hà",
    createdAt: "08/10/2026, 16:30",
    status: "declined",
  },
];

export const INITIAL_ACTIVITY_LOGS: ProjectActivityLog[] = [
  {
    id: "act-1",
    projectId: "ftodo-core",
    userName: "Nguyễn Văn An",
    userAvatar: "VA",
    userRole: "Senior DEV",
    category: "task",
    action: "đã xóa task khỏi Sprint Backlog",
    detail: "TASK-109: Khắc phục lỗi caching Redis định kỳ (Lý do: Đã gộp vào pipeline CI/CD mới)",
    timestamp: "11/10/2026 lúc 09:15",
    timeAgo: "25 phút trước",
  },
  {
    id: "act-2",
    projectId: "ftodo-core",
    userName: "Trịnh Quyết Chiến",
    userAvatar: "QC",
    userRole: "Chủ dự án (Owner)",
    category: "cost",
    action: "đã phê duyệt đề xuất chi phí",
    detail: "Khoản chi: Bản quyền Figma Organization 2026 (Số tiền: 3.500.000 đ - Đề xuất bởi Nguyễn Văn An)",
    timestamp: "11/10/2026 lúc 10:30",
    timeAgo: "1 giờ trước",
  },
  {
    id: "act-3",
    projectId: "ftodo-core",
    userName: "Trần Thị Bình",
    userAvatar: "TB",
    userRole: "QA Tester",
    category: "task",
    action: "đã chuyển trạng thái task sang Đã hoàn thành (DONE)",
    detail: "BUG-042: Lỗi tràn layout bảng Kanban trên Safari iOS (Đã xác minh và đạt tiêu chuẩn DoD)",
    timestamp: "11/10/2026 lúc 08:45",
    timeAgo: "2 giờ trước",
  },
  {
    id: "act-4",
    projectId: "ftodo-core",
    userName: "Trịnh Quyết Chiến",
    userAvatar: "QC",
    userRole: "Chủ dự án (Owner)",
    category: "member",
    action: "đã gửi lời mời tham gia dự án",
    detail: "Gửi lời mời đến Lê Hoàng Dũng (hoangdung@company.vn) với nhóm vai trò 'Lập trình viên (DEV)'",
    timestamp: "11/10/2026 lúc 08:45",
    timeAgo: "2 giờ trước",
  },
  {
    id: "act-5",
    projectId: "ftodo-core",
    userName: "Nguyễn Văn An",
    userAvatar: "VA",
    userRole: "Senior DEV",
    category: "cost",
    action: "đã tạo đề xuất chi phí phát sinh mới",
    detail: "Đề xuất thuê Cloud Staging Server DigitalOcean 16GB RAM (Chi phí: 2.100.000 đ/tháng)",
    timestamp: "10/10/2026 lúc 14:15",
    timeAgo: "Hôm qua",
  },
  {
    id: "act-6",
    projectId: "ftodo-core",
    userName: "Trịnh Quyết Chiến",
    userAvatar: "QC",
    userRole: "Chủ dự án (Owner)",
    category: "report",
    action: "đã xác nhận đọc & ký số phê duyệt báo cáo PDF",
    detail: "Văn bản REP-001: Báo cáo nghiệm thu tiến độ Sprint 1 (Tác giả: Nguyễn Văn An)",
    timestamp: "10/10/2026 lúc 16:30",
    timeAgo: "Hôm qua",
  },
  {
    id: "act-7",
    projectId: "ftodo-core",
    userName: "Trịnh Quyết Chiến",
    userAvatar: "QC",
    userRole: "Chủ dự án (Owner)",
    category: "member",
    action: "đã cập nhật ma trận phân quyền nhóm vai trò",
    detail: "Bật quyền truy cập tab 'Tiền & Chi phí' cho nhóm 'Lập trình viên (DEV)'",
    timestamp: "09/10/2026 lúc 15:00",
    timeAgo: "2 ngày trước",
  },
  {
    id: "act-8",
    projectId: "ftodo-core",
    userName: "Trần Thị Bình",
    userAvatar: "TB",
    userRole: "QA Tester",
    category: "task",
    action: "đã tạo mới User Story kiểm thử trong Backlog",
    detail: "TEST-012: Kiểm thử tải cao kịch bản 5,000 người dùng đồng thời (Ước lượng: 3 Story Points)",
    timestamp: "09/10/2026 lúc 09:30",
    timeAgo: "2 ngày trước",
  },
];

// Helper: Invitations
export function getStoredInvitations(): ProjectInvitation[] {
  if (typeof window === "undefined") return INITIAL_INVITATIONS;
  const raw = localStorage.getItem("ftodo_project_invitations");
  if (!raw) {
    localStorage.setItem("ftodo_project_invitations", JSON.stringify(INITIAL_INVITATIONS));
    return INITIAL_INVITATIONS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_INVITATIONS;
  }
}

export function saveStoredInvitations(list: ProjectInvitation[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("ftodo_project_invitations", JSON.stringify(list));
  window.dispatchEvent(new Event("ftodo_invitations_updated"));
  window.dispatchEvent(new Event("storage"));
}

export function respondToInvitation(
  invitationId: string,
  response: "accepted" | "declined"
): { success: boolean; invitation?: ProjectInvitation } {
  const current = getStoredInvitations();
  const target = current.find((i) => i.id === invitationId);
  if (!target) return { success: false };

  target.status = response;
  const updated = current.map((i) => (i.id === invitationId ? target : i));
  saveStoredInvitations(updated);

  // If accepted, add the project to the user's project list if not already present
  if (response === "accepted" && typeof window !== "undefined") {
    try {
      const rawProjects = localStorage.getItem("ftodo_mock_projects");
      let projectsList: any[] = [];
      if (rawProjects) {
        const parsed = JSON.parse(rawProjects);
        projectsList = Array.isArray(parsed)
          ? parsed
          : [...(parsed.owned || []), ...(parsed.memberOf || [])];
      }
      if (!projectsList.some((p) => p.id === target.projectId)) {
        projectsList.push({
          id: target.projectId,
          name: target.projectName,
          description: target.projectDescription,
          ownerId: target.inviterEmail === "chien@example.com" ? "u-chien" : "u-other",
          progress: 15,
          tasks: 12,
          completedTasks: 3,
          members: 4,
          createdAt: new Date().toLocaleDateString("vi-VN"),
        });
        localStorage.setItem("ftodo_mock_projects", JSON.stringify(projectsList));
        window.dispatchEvent(new Event("storage"));
      }
    } catch {}

    // Add activity log
    addStoredActivityLog(target.projectId, {
      userName: target.recipientName,
      userAvatar: target.recipientName.slice(0, 2).toUpperCase(),
      userRole: target.roleGroupName,
      category: "member",
      action: "đã chấp nhận lời mời tham gia dự án",
      detail: `Tham gia với tư cách thành viên nhóm '${target.roleGroupName}'`,
      timestamp: new Date().toLocaleDateString("vi-VN") + " lúc " + new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      timeAgo: "Vừa xong",
    });
  } else if (response === "declined") {
    addStoredActivityLog(target.projectId, {
      userName: target.recipientName,
      userAvatar: target.recipientName.slice(0, 2).toUpperCase(),
      userRole: target.roleGroupName,
      category: "member",
      action: "đã từ chối lời mời tham gia dự án",
      detail: `Từ chối lời mời từ ${target.inviterName}`,
      timestamp: new Date().toLocaleDateString("vi-VN") + " lúc " + new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      timeAgo: "Vừa xong",
    });
  }

  return { success: true, invitation: target };
}

// Helper: Activity Logs
export function getStoredActivityLogs(projectId?: string): ProjectActivityLog[] {
  if (typeof window === "undefined") {
    return projectId ? INITIAL_ACTIVITY_LOGS.filter((l) => l.projectId === projectId) : INITIAL_ACTIVITY_LOGS;
  }
  const raw = localStorage.getItem("ftodo_activity_logs");
  let logs: ProjectActivityLog[] = INITIAL_ACTIVITY_LOGS;
  if (raw) {
    try {
      logs = JSON.parse(raw);
    } catch {
      logs = INITIAL_ACTIVITY_LOGS;
    }
  } else {
    localStorage.setItem("ftodo_activity_logs", JSON.stringify(INITIAL_ACTIVITY_LOGS));
  }

  if (projectId) {
    return logs.filter((l) => l.projectId === projectId);
  }
  return logs;
}

export function addStoredActivityLog(
  projectId: string,
  log: Omit<ProjectActivityLog, "id" | "projectId">
): void {
  if (typeof window === "undefined") return;
  const current = getStoredActivityLogs();
  const newEntry: ProjectActivityLog = {
    id: "act-" + Date.now(),
    projectId,
    ...log,
  };
  const updated = [newEntry, ...current];
  localStorage.setItem("ftodo_activity_logs", JSON.stringify(updated));
  window.dispatchEvent(new Event("ftodo_activity_updated"));
  window.dispatchEvent(new Event("storage"));
}
