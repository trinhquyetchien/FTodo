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
    projectId: "ftodo-core",
    projectName: "FTodo - Nền tảng Quản trị Agile Scrum",
    projectDescription: "Hệ thống Quản lý Dự án Agile Scrum & Quản trị Tài chính Dự án toàn diện.",
    inviterName: "Trịnh Quyết Chiến",
    inviterEmail: "chien@example.com",
    roleGroupId: "r2",
    roleGroupName: "DEV",
    recipientEmail: "binh@example.com",
    recipientName: "Trần Thị Bình",
    createdAt: "12/10/2026 lúc 09:30",
    status: "pending",
  },
  {
    id: "inv-2",
    projectId: "ftodo-core",
    projectName: "FTodo - Nền tảng Quản trị Agile Scrum",
    projectDescription: "Hệ thống Quản lý Dự án Agile Scrum & Quản trị Tài chính Dự án toàn diện.",
    inviterName: "Trịnh Quyết Chiến",
    inviterEmail: "chien@example.com",
    roleGroupId: "r3",
    roleGroupName: "QA",
    recipientEmail: "dung@example.com",
    recipientName: "Lê Hoàng Dũng",
    createdAt: "12/10/2026 lúc 08:15",
    status: "accepted",
  },
];

export const INITIAL_ACTIVITY_LOGS: ProjectActivityLog[] = [
  {
    id: "act-1",
    projectId: "ftodo-core",
    userName: "Trịnh Quyết Chiến",
    userAvatar: "QC",
    userRole: "Chủ sở hữu",
    category: "task",
    action: "đã cập nhật trạng thái công việc",
    detail: "Chuyển 'Bảng Kanban Scrum kéo thả tương tác mượt mà' (FT-103) sang Hoàn thành",
    timestamp: "12/10/2026 lúc 15:20",
    timeAgo: "25 phút trước",
  },
  {
    id: "act-2",
    projectId: "ftodo-core",
    userName: "Trần Thị Bình",
    userAvatar: "TB",
    userRole: "QA",
    category: "task",
    action: "đã tạo công việc mới",
    detail: "Tạo task 'Kiểm thử ma trận phân quyền và xác thực JWT' (FT-108) • 5 SP",
    timestamp: "12/10/2026 lúc 14:05",
    timeAgo: "1 giờ trước",
  },
  {
    id: "act-3",
    projectId: "ftodo-core",
    userName: "Nguyễn Văn An",
    userAvatar: "VA",
    userRole: "DEV",
    category: "cost",
    action: "đã đề xuất chi phí mới",
    detail: "Đề xuất duyệt khoản chi 'Hạ tầng AWS RDS & Elastic Load Balancer' (14.500.000 đ)",
    timestamp: "12/10/2026 lúc 11:30",
    timeAgo: "4 giờ trước",
  },
  {
    id: "act-4",
    projectId: "ftodo-core",
    userName: "Trịnh Quyết Chiến",
    userAvatar: "QC",
    userRole: "Chủ sở hữu",
    category: "report",
    action: "đã phê duyệt báo cáo Sprint",
    detail: "Duyệt báo cáo 'Báo cáo Sprint 1: Hoàn tất Module Auth & Tối ưu Database'",
    timestamp: "12/10/2026 lúc 10:15",
    timeAgo: "5 giờ trước",
  },
  {
    id: "act-5",
    projectId: "ftodo-core",
    userName: "Lê Hoàng Dũng",
    userAvatar: "HD",
    userRole: "DEV",
    category: "member",
    action: "đã tham gia dự án",
    detail: "Gia nhập nhóm phát triển 'DEV' qua lời mời từ Chủ dự án",
    timestamp: "12/10/2026 lúc 08:30",
    timeAgo: "7 giờ trước",
  },
];

const STORE_VERSION_KEY = "ftodo_seed_v7";

function checkAndClearLegacyStorage() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem("ftodo_store_v") !== STORE_VERSION_KEY) {
    localStorage.setItem("ftodo_project_invitations", JSON.stringify(INITIAL_INVITATIONS));
    localStorage.setItem("ftodo_activity_logs", JSON.stringify(INITIAL_ACTIVITY_LOGS));
    localStorage.setItem("ftodo_store_v", STORE_VERSION_KEY);
  }
}

// Helper: Invitations
export function getStoredInvitations(): ProjectInvitation[] {
  if (typeof window === "undefined") return INITIAL_INVITATIONS;
  checkAndClearLegacyStorage();
  const raw = localStorage.getItem("ftodo_project_invitations");
  if (!raw) return INITIAL_INVITATIONS;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_INVITATIONS;
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

  // If accepted, record event and trigger update
  if (response === "accepted" && typeof window !== "undefined") {
    window.dispatchEvent(new Event("ftodo_permissions_updated"));
    window.dispatchEvent(new Event("storage"));

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

export function getStoredActivityLogs(projectId?: string): ProjectActivityLog[] {
  if (typeof window === "undefined") return INITIAL_ACTIVITY_LOGS;
  checkAndClearLegacyStorage();
  const raw = localStorage.getItem("ftodo_activity_logs");
  if (!raw) return INITIAL_ACTIVITY_LOGS;
  try {
    const logs: ProjectActivityLog[] = JSON.parse(raw);
    const result = Array.isArray(logs) && logs.length > 0 ? logs : INITIAL_ACTIVITY_LOGS;
    if (projectId) {
      return result.filter((l) => l.projectId === projectId || l.projectId === "ftodo-core");
    }
    return result;
  } catch {
    return INITIAL_ACTIVITY_LOGS;
  }
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

export function clearAllStoredActivitiesAndInvitations(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("ftodo_project_invitations");
  localStorage.removeItem("ftodo_activity_logs");
  localStorage.setItem("ftodo_store_v", STORE_VERSION_KEY);
  window.dispatchEvent(new Event("ftodo_invitations_updated"));
  window.dispatchEvent(new Event("ftodo_activity_updated"));
  window.dispatchEvent(new Event("storage"));
}
