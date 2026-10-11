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

export const INITIAL_INVITATIONS: ProjectInvitation[] = [];

export const INITIAL_ACTIVITY_LOGS: ProjectActivityLog[] = [];

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
