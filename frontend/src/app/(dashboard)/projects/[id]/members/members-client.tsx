"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Settings2,
  Trash2,
  Edit2,
  ShieldAlert,
  Users,
  Check,
  Sparkles,
  ShieldCheck,
  Layers,
  LayoutDashboard,
  Kanban,
  ListTodo,
  CalendarRange,
  CheckSquare,
  BarChart3,
  Rocket,
  Boxes,
  MessageSquare,
  DollarSign,
  FolderPlus,
  UserPlus,
  Search,
  Lock,
  ChevronRight,
  Info,
  Shield,
  Mail,
  Send,
  History,
  Clock,
  RotateCcw,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DEFAULT_INITIAL_ROLES, DEFAULT_INITIAL_MEMBERS } from "@/lib/mock-data";
import { useProject } from "../project-context";
import { useAuth } from "@/lib/auth-context";
import {
  getStoredInvitations,
  saveStoredInvitations,
  addStoredActivityLog,
  ProjectInvitation
} from "@/lib/activity-invitation-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Categorized tab definitions for clean UI layout
export const TAB_CATEGORIES = [
  {
    category: "Scrum & Lập kế hoạch",
    items: [
      { id: "overview", label: "Tổng quan", desc: "Thống kê tiến độ & công việc Sprint", icon: LayoutDashboard },
      { id: "board", label: "Bảng Scrum", desc: "Kanban board kéo thả theo Sprint", icon: Kanban },
      { id: "backlog", label: "Backlog", desc: "Kế hoạch Sprint & User Stories", icon: ListTodo },
      { id: "timeline", label: "Lộ trình", desc: "Sơ đồ Gantt tiến độ & Milestone", icon: CalendarRange },
    ],
  },
  {
    category: "Theo dõi & Báo cáo",
    items: [
      { id: "issues", label: "Tất cả tác vụ", desc: "Toàn bộ Bugs, Tasks, Stories", icon: CheckSquare },
      { id: "reports", label: "Báo cáo & Burndown", desc: "Biểu đồ Burndown, Velocity", icon: BarChart3 },
      { id: "releases", label: "Phiên bản phát hành", desc: "Quản lý phiên bản v1.0, v1.1", icon: Rocket },
      { id: "components", label: "Hợp phần kiến trúc", desc: "Phân rã module kỹ thuật", icon: Boxes },
    ],
  },
  {
    category: "Mở rộng & Quản trị",
    items: [
      { id: "chat", label: "Kênh chat dự án", desc: "Trao đổi nhóm thời gian thực", icon: MessageSquare },
      { id: "cost", label: "Tiền & Chi phí", desc: "Ngân sách, burn-rate & đề xuất chi phí", icon: DollarSign, isSensitive: true },
      { id: "members", label: "Nhân sự & Nhóm quyền", desc: "Quản lý nhóm quyền & phân bổ thành viên", icon: Users, isSensitive: true },
      { id: "activity", label: "Lịch sử hoạt động", desc: "Nhật ký kiểm toán công việc, xóa task & duyệt chi", icon: History },
    ],
  },
];

export const ALL_AVAILABLE_PERMS = TAB_CATEGORIES.flatMap((c) => c.items);

// Role templates for quick creation
const ROLE_PRESETS = [
  {
    name: "Product Designer",
    desc: "Thiết kế UI/UX và theo dõi User Stories",
    perms: ["overview", "board", "backlog", "timeline", "issues", "chat"],
  },
  {
    name: "DevOps Engineer",
    desc: "Vận hành hạ tầng, CI/CD và phiên bản phát hành",
    perms: ["overview", "issues", "releases", "components", "chat"],
  },
  {
    name: "Business Analyst",
    desc: "Phân tích yêu cầu, quản lý backlog và báo cáo",
    perms: ["overview", "backlog", "timeline", "issues", "reports", "chat"],
  },
  {
    name: "Kế toán / Tài chính",
    desc: "Kiểm soát ngân sách, chi phí và thanh toán hóa đơn",
    perms: ["overview", "cost", "reports"],
  },
];

export function MembersClient() {
  const { user } = useAuth();
  const { project, isOwner, hasPermission } = useProject();
  const projectId = project?.id || "ftodo-core";

  // Persistent Roles
  const [roles, setRoles] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`ftodo_roles_${projectId}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return DEFAULT_INITIAL_ROLES;
  });

  // Persistent Members
  const [members, setMembers] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`ftodo_members_${projectId}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return DEFAULT_INITIAL_MEMBERS;
  });

  // Modals state
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isEditMemberOpen, setIsEditMemberOpen] = useState(false);

  // New Role Form State (UX Redesigned)
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [newRolePerms, setNewRolePerms] = useState<string[]>([
    "overview",
    "board",
    "backlog",
    "timeline",
    "issues",
    "chat",
  ]);

  // Edit Member State
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editMemberRoleId, setEditMemberRoleId] = useState<string>("");
  const [editMemberExtraPerms, setEditMemberExtraPerms] = useState<string[]>([]);

  // Add Member State
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRoleId, setNewMemberRoleId] = useState("r2");

  const [memberSearch, setMemberSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [selectedRoleDetail, setSelectedRoleDetail] = useState<string | null>(null);

  // Invitations state
  const [invitations, setInvitations] = useState<ProjectInvitation[]>([]);

  useEffect(() => {
    const loadInv = () => {
      setInvitations(getStoredInvitations());
    };
    loadInv();
    window.addEventListener("ftodo_invitations_updated", loadInv);
    window.addEventListener("storage", loadInv);
    return () => {
      window.removeEventListener("ftodo_invitations_updated", loadInv);
      window.removeEventListener("storage", loadInv);
    };
  }, []);

  const sentInvitations = invitations.filter((i) => i.projectId === projectId);

  if (!isOwner && !hasPermission("members")) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/30 dark:bg-amber-950/20">
          <CardHeader className="space-y-2">
            <div className="mx-auto h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300 flex items-center justify-center">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-bold text-amber-700 dark:text-amber-400">
              Chưa được cấp quyền Quản lý Nhân sự
            </CardTitle>
            <CardDescription className="text-sm text-amber-600/80 dark:text-amber-400/80">
              Bạn hiện đang tham gia dự án với tư cách <strong>Thành viên</strong> và chưa được cấp quyền quản trị <strong>Nhân sự & Nhóm quyền</strong>.
              <br />
              Chỉ Chủ dự án hoặc thành viên được cấp quyền mới có thể truy cập trang này.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // --- Group / Role Actions ---

  const handleApplyPreset = (preset: typeof ROLE_PRESETS[0]) => {
    setNewRoleName(preset.name);
    setNewRoleDesc(preset.desc);
    setNewRolePerms(preset.perms);
  };

  const handleToggleNewPerm = (permId: string) => {
    setNewRolePerms((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const handleSelectAllPerms = () => {
    setNewRolePerms(ALL_AVAILABLE_PERMS.map((p) => p.id));
  };

  const handleDeselectAllPerms = () => {
    setNewRolePerms(["overview"]);
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    const newRole = {
      id: "r-" + Date.now(),
      name: newRoleName.trim(),
      desc: newRoleDesc.trim() || "Nhóm quyền tùy chỉnh",
      permissions: newRolePerms,
    };

    const updatedRoles = [...roles, newRole];
    setRoles(updatedRoles);
    if (typeof window !== "undefined") {
      localStorage.setItem(`ftodo_roles_${projectId}`, JSON.stringify(updatedRoles));
      window.dispatchEvent(new Event("ftodo_permissions_updated"));
    }

    setNewRoleName("");
    setNewRoleDesc("");
    setNewRolePerms(["overview", "board", "backlog", "timeline", "issues", "chat"]);
    setIsAddRoleOpen(false);
  };

  const handleDeleteRole = (roleId: string) => {
    if (roleId === "r1") return; // Cannot delete Admin
    const updatedRoles = roles.filter((r: any) => r.id !== roleId);
    setRoles(updatedRoles);
    if (typeof window !== "undefined") {
      localStorage.setItem(`ftodo_roles_${projectId}`, JSON.stringify(updatedRoles));
      window.dispatchEvent(new Event("ftodo_permissions_updated"));
    }
  };

  const handleRolePermToggle = (roleId: string, tabId: string) => {
    const updatedRoles = roles.map((r: any) => {
      if (r.id === roleId) {
        const perms = r.permissions.includes(tabId)
          ? r.permissions.filter((p: string) => p !== tabId)
          : [...r.permissions, tabId];
        return { ...r, permissions: perms };
      }
      return r;
    });
    setRoles(updatedRoles);
    if (typeof window !== "undefined") {
      localStorage.setItem(`ftodo_roles_${projectId}`, JSON.stringify(updatedRoles));
      window.dispatchEvent(new Event("ftodo_permissions_updated"));
    }
  };

  // --- Member Actions ---

  const handleOpenEditMember = (member: any) => {
    setEditingMemberId(member.id);
    setEditMemberRoleId(member.roleId);
    setEditMemberExtraPerms(member.extraPermissions || []);
    setIsEditMemberOpen(true);
  };

  const handleSaveMember = () => {
    if (!editingMemberId) return;
    const updated = members.map((m: any) => {
      if (m.id === editingMemberId) {
        return { ...m, roleId: editMemberRoleId, extraPermissions: editMemberExtraPerms };
      }
      return m;
    });
    setMembers(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(`ftodo_members_${projectId}`, JSON.stringify(updated));
      window.dispatchEvent(new Event("ftodo_permissions_updated"));
    }
    setIsEditMemberOpen(false);
  };

  const handleRemoveMember = (id: string) => {
    const updated = members.filter((m: any) => m.id !== id);
    setMembers(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(`ftodo_members_${projectId}`, JSON.stringify(updated));
      window.dispatchEvent(new Event("ftodo_permissions_updated"));
    }
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail || !newMemberName || !newMemberRoleId) return;
    const newMember = {
      id: "u-" + Date.now(),
      name: newMemberName.trim(),
      email: newMemberEmail.trim(),
      roleId: newMemberRoleId,
      extraPermissions: [],
    };
    const updated = [...members, newMember];
    setMembers(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(`ftodo_members_${projectId}`, JSON.stringify(updated));
      window.dispatchEvent(new Event("ftodo_permissions_updated"));
    }

    // Also record sent invitation
    const roleObj = roles.find((r: any) => r.id === newMemberRoleId);
    const newInvitation: ProjectInvitation = {
      id: "inv-" + Date.now(),
      projectId,
      projectName: project?.name || "Dự án Scrum",
      projectDescription: project?.description || "Không gian làm việc Scrum FTodo",
      inviterName: user?.name || "Trịnh Quyết Chiến (Chủ dự án)",
      inviterEmail: user?.email || "chien@example.com",
      roleGroupId: newMemberRoleId,
      roleGroupName: roleObj?.name || "Lập trình viên (DEV)",
      recipientEmail: newMemberEmail.trim(),
      recipientName: newMemberName.trim(),
      createdAt: new Date().toLocaleDateString("vi-VN") + " lúc " + new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      status: "pending",
    };
    const currentInvs = getStoredInvitations();
    saveStoredInvitations([newInvitation, ...currentInvs]);

    addStoredActivityLog(projectId, {
      userName: user?.name || "Chủ dự án",
      userAvatar: user?.avatar || "QC",
      userRole: "Chủ dự án (Owner)",
      category: "member",
      action: "đã gửi lời mời tham gia dự án",
      detail: `Gửi lời mời đến ${newMemberName.trim()} (${newMemberEmail.trim()}) với nhóm vai trò '${roleObj?.name}'`,
      timestamp: new Date().toLocaleDateString("vi-VN") + " lúc " + new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      timeAgo: "Vừa xong",
    });

    setIsAddMemberOpen(false);
    setNewMemberEmail("");
    setNewMemberName("");
    setNewMemberRoleId("r2");
  };

  const handleResendInvitation = (invId: string) => {
    const current = getStoredInvitations();
    const updated = current.map((i) =>
      i.id === invId
        ? {
            ...i,
            status: "pending" as const,
            createdAt: "Vừa gửi lại (" + new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) + ")",
          }
        : i
    );
    saveStoredInvitations(updated);
    addStoredActivityLog(projectId, {
      userName: user?.name || "Chủ dự án",
      userAvatar: user?.avatar || "QC",
      userRole: "Chủ dự án (Owner)",
      category: "member",
      action: "đã gửi lại lời mời tham gia dự án",
      detail: `Gửi lại lời mời tham gia cho thành viên`,
      timestamp: new Date().toLocaleDateString("vi-VN") + " lúc " + new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      timeAgo: "Vừa xong",
    });
  };

  const handleCancelInvitation = (invId: string) => {
    const current = getStoredInvitations();
    const updated = current.filter((i) => i.id !== invId);
    saveStoredInvitations(updated);
    addStoredActivityLog(projectId, {
      userName: user?.name || "Chủ dự án",
      userAvatar: user?.avatar || "QC",
      userRole: "Chủ dự án (Owner)",
      category: "member",
      action: "đã thu hồi lời mời tham gia dự án",
      detail: `Thu hồi lời mời của thành viên`,
      timestamp: new Date().toLocaleDateString("vi-VN") + " lúc " + new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      timeAgo: "Vừa xong",
    });
  };

  const editingMember = members.find((m: any) => m.id === editingMemberId);
  const editingMemberRole = roles.find((r: any) => r.id === editMemberRoleId);

  // Filtered members
  const filteredMembers = members.filter((m: any) => {
    const matchesSearch =
      m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.email.toLowerCase().includes(memberSearch.toLowerCase());
    const matchesRole = filterRole === "all" || m.roleId === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Quản lý Nhân sự & Nhóm quyền
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Thiết lập các nhóm vai trò, cấp quyền truy cập các tab dự án và quản lý thành viên đội ngũ.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Button: Add New Group */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddRoleOpen(true)}
            className="text-xs gap-1.5 border-dashed border-primary/50 text-primary hover:bg-primary/5"
          >
            <FolderPlus className="h-4 w-4" /> Thêm nhóm quyền mới
          </Button>

          {/* Button: Add Member */}
          <Button
            size="sm"
            onClick={() => setIsAddMemberOpen(true)}
            className="text-xs gap-1.5 shadow-xs"
          >
            <UserPlus className="h-4 w-4" /> Thêm thành viên
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Tổng nhân sự dự án</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{members.length} Thành viên</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              1 Chủ sở hữu • {members.length - 1} Thành viên đội ngũ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Nhóm vai trò (Role Groups)</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-primary">{roles.length} Nhóm quyền</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Hiển thị chi tiết và phân quyền trực tiếp bên dưới
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Cấp quyền riêng lẻ</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
              {members.filter((m: any) => m.extraPermissions?.length > 0).length} Thành viên
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Được cấp thêm quyền ngoài nhóm (VD: Tiền & Chi phí)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: NHÓM VAI TRÒ & PHÂN QUYỀN (HIỂN THỊ TRỰC TIẾP) */}
      {/* ======================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Các nhóm quyền dự án (Role Groups)
            </h3>
            <p className="text-xs text-muted-foreground">
              Các nhóm vai trò đã được tạo. Bạn có thể bật/tắt quyền trực tiếp của từng nhóm hoặc bấm Thêm nhóm quyền mới.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddRoleOpen(true)}
            className="text-xs gap-1 border-primary/40 text-primary hover:bg-primary/5"
          >
            <Plus className="h-3.5 w-3.5" /> Tạo nhóm mới
          </Button>
        </div>

        {/* Roles Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role: any) => {
            const assignedMembers = members.filter((m: any) => m.roleId === role.id);
            const isAdmin = role.id === "r1";
            const isCustom = !["r1", "r2", "r3"].includes(role.id);

            return (
              <Card
                key={role.id}
                className={`relative flex flex-col justify-between transition-all border ${
                  isAdmin
                    ? "border-amber-300 dark:border-amber-900/60 bg-amber-50/15 dark:bg-amber-950/10"
                    : "hover:border-primary/50 shadow-2xs"
                }`}
              >
                <CardHeader className="p-4 pb-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm text-foreground">{role.name}</span>
                        {isAdmin ? (
                          <Badge className="bg-amber-600 hover:bg-amber-700 text-[10px] py-0">
                            Mặc định
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] py-0">
                            {isCustom ? "Tùy chỉnh" : "Hệ thống"}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {role.desc || "Quyền hạn của nhóm"}
                      </p>
                    </div>

                    {isCustom && isOwner && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteRole(role.id)}
                        className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-50 shrink-0"
                        title="Xóa nhóm quyền này"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>

                  {/* Members in this role */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t text-muted-foreground">
                    <span className="text-[11px] font-medium text-foreground">
                      {assignedMembers.length} thành viên:
                    </span>
                    <div className="flex items-center -space-x-1.5 overflow-hidden">
                      {assignedMembers.length === 0 ? (
                        <span className="text-[10px] text-muted-foreground italic">Chưa có ai</span>
                      ) : (
                        assignedMembers.map((m: any) => (
                          <Avatar key={m.id} className="h-5 w-5 ring-1 ring-background">
                            <AvatarFallback className="text-[9px] bg-primary/20 text-primary font-semibold">
                              {m.name.substring(0, 1)}
                            </AvatarFallback>
                          </Avatar>
                        ))
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 pt-0 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
                    <span>Trang được cấp ({role.permissions.length}/{ALL_AVAILABLE_PERMS.length}):</span>
                    {isAdmin && <span className="text-amber-600 font-semibold text-[10px]">Toàn quyền</span>}
                  </div>

                  {/* Badges of granted tabs */}
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                    {role.permissions.map((pId: string) => {
                      const tab = ALL_AVAILABLE_PERMS.find((t) => t.id === pId);
                      const Icon = tab?.icon || LayoutDashboard;

                      return (
                        <Badge
                          key={pId}
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0.5 gap-1 font-normal bg-muted/60"
                        >
                          <Icon className="h-2.5 w-2.5 text-primary shrink-0" />
                          <span>{tab?.label || pId}</span>
                        </Badge>
                      );
                    })}
                  </div>

                  {/* Interactive toggle matrix trigger */}
                  {!isAdmin && isOwner && (
                    <div className="pt-2 border-t flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedRoleDetail(selectedRoleDetail === role.id ? null : role.id)}
                        className="text-xs h-7 text-primary hover:text-primary px-2"
                      >
                        {selectedRoleDetail === role.id ? "Thu gọn ma trận" : "Điều chỉnh quyền nhóm →"}
                      </Button>
                    </div>
                  )}

                  {/* Expanded Permission Toggles for this Role */}
                  {selectedRoleDetail === role.id && !isAdmin && (
                    <div className="space-y-2 pt-2 border-t bg-muted/20 p-2.5 rounded-lg">
                      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Tick chọn để bật/tắt trang cho {role.name}:
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
                        {ALL_AVAILABLE_PERMS.map((tab) => {
                          const isChecked = role.permissions.includes(tab.id);
                          const Icon = tab.icon;

                          return (
                            <div
                              key={tab.id}
                              onClick={() => handleRolePermToggle(role.id, tab.id)}
                              className={`flex items-center gap-1.5 p-1.5 rounded border text-xs cursor-pointer select-none transition-colors ${
                                isChecked
                                  ? "bg-primary/10 border-primary/40 font-medium text-foreground"
                                  : "bg-background border-border/60 text-muted-foreground opacity-70"
                              }`}
                            >
                              <Checkbox
                                id={`perm-check-${role.id}-${tab.id}`}
                                checked={isChecked}
                                onCheckedChange={() => handleRolePermToggle(role.id, tab.id)}
                                className="h-3 w-3"
                              />
                              <Icon className="h-3 w-3 shrink-0" />
                              <span className="text-[10px] truncate">{tab.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {/* Quick Add Role Card */}
          <div
            onClick={() => setIsAddRoleOpen(true)}
            className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-primary/60 bg-muted/10 hover:bg-primary/5 cursor-pointer transition-all group min-h-[180px]"
          >
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <FolderPlus className="h-5 w-5" />
            </div>
            <div className="font-semibold text-xs mt-2.5 text-foreground">
              + Tạo nhóm quyền mới
            </div>
            <p className="text-[11px] text-muted-foreground text-center mt-1 max-w-[200px]">
              Tạo vai trò theo chuyên môn (Designer, Kế toán, DevOps...)
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 2: DANH SÁCH THÀNH VIÊN DỰ ÁN                    */}
      {/* ======================================================== */}
      <Card>
        <CardHeader className="border-b pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold">Danh sách thành viên dự án</CardTitle>
                <Badge variant="outline" className="text-xs font-mono">
                  {members.length} người
                </Badge>
              </div>
              <CardDescription className="text-xs mt-1">
                Xem nhóm vai trò và quyền hạn trang công cụ thực tế của từng nhân sự.
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-56">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Tìm thành viên, email..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="pl-8 text-xs h-8"
                />
              </div>

              <Select value={filterRole} onValueChange={(val) => setFilterRole(val || "all")}>
                <SelectTrigger className="w-[150px] h-8 text-xs">
                  <SelectValue placeholder="Nhóm quyền" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả nhóm</SelectItem>
                  {roles.map((r: any) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-64">Thành viên</TableHead>
                <TableHead className="w-44">Nhóm quyền</TableHead>
                <TableHead>Quyền hạn thực tế (Trang được phép xem)</TableHead>
                <TableHead className="w-24 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground text-xs">
                    Không tìm thấy thành viên nào phù hợp.
                  </TableCell>
                </TableRow>
              ) : (
                filteredMembers.map((member: any) => {
                  const role = roles.find((r: any) => r.id === member.roleId);
                  const effectivePerms = Array.from(
                    new Set([...(role?.permissions || []), ...(member.extraPermissions || [])])
                  );

                  return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 ring-1 ring-border">
                            <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                              {member.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-xs text-foreground">{member.name}</div>
                            <div className="text-[11px] text-muted-foreground">{member.email}</div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="secondary" className="text-[11px] font-medium">
                          {role?.name || "Thành viên"}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          {effectivePerms.map((permId) => {
                            const tabInfo = ALL_AVAILABLE_PERMS.find((t) => t.id === permId);
                            const isExtra = !role?.permissions.includes(permId);

                            return (
                              <Badge
                                key={permId}
                                variant={isExtra ? "default" : "outline"}
                                className={`text-[10px] ${
                                  isExtra
                                    ? "bg-violet-600 hover:bg-violet-700 text-white"
                                    : "text-slate-600 dark:text-slate-300"
                                }`}
                              >
                                {tabInfo?.label || permId}
                                {isExtra && " (Cấp riêng)"}
                              </Badge>
                            );
                          })}
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => handleOpenEditMember(member)}
                            title="Chỉnh sửa quyền"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          {member.roleId !== "r1" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                              onClick={() => handleRemoveMember(member.id)}
                              title="Xóa thành viên"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ======================================================== */}
      {/* SECTION 3: LỜI MỜI ĐÃ GỬI & TRẠNG THÁI PHẢN HỒI (CHO SẾP)*/}
      {/* ======================================================== */}
      <Card className="border-primary/20 shadow-xs overflow-hidden">
        <CardHeader className="border-b pb-3 bg-muted/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                <CardTitle className="text-base font-semibold">
                  Lời mời tham gia dự án đã gửi
                </CardTitle>
                <Badge variant="outline" className="text-xs font-mono">
                  {sentInvitations.length} lời mời
                </Badge>
              </div>
              <CardDescription className="text-xs mt-1">
                Theo dõi tình trạng phản hồi (Đang chờ, Đã chấp nhận hoặc Đã từ chối) của nhân sự được mời vào dự án này.
              </CardDescription>
            </div>

            <Button
              size="sm"
              onClick={() => setIsAddMemberOpen(true)}
              className="text-xs gap-1.5 shadow-xs"
            >
              <Send className="h-3.5 w-3.5" /> Gửi lời mời mới
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-xs font-semibold">Người nhận</TableHead>
                <TableHead className="text-xs font-semibold">Email</TableHead>
                <TableHead className="text-xs font-semibold">Nhóm quyền chỉ định</TableHead>
                <TableHead className="text-xs font-semibold">Thời gian gửi</TableHead>
                <TableHead className="text-xs font-semibold">Trạng thái phản hồi</TableHead>
                <TableHead className="text-right text-xs font-semibold">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sentInvitations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-xs text-muted-foreground">
                    Chưa có lời mời nào được gửi cho dự án này. Nhấn "Gửi lời mời mới" để mời cộng tác viên.
                  </TableCell>
                </TableRow>
              ) : (
                sentInvitations.map((inv) => (
                  <TableRow key={inv.id} className="hover:bg-muted/10 transition-colors">
                    <TableCell className="font-medium text-xs text-foreground">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                            {inv.recipientName.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{inv.recipientName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {inv.recipientEmail}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs bg-muted/40 font-medium">
                        {inv.roleGroupName}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {inv.createdAt}
                    </TableCell>
                    <TableCell>
                      {inv.status === "pending" ? (
                        <Badge variant="outline" className="text-xs border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/30 gap-1 font-medium">
                          <Clock className="h-3 w-3 animate-pulse" /> Đang chờ phản hồi
                        </Badge>
                      ) : inv.status === "accepted" ? (
                        <Badge className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1 font-medium">
                          <Check className="h-3 w-3" /> Đã chấp nhận tham gia
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs border-rose-400 text-rose-600 bg-rose-50 dark:bg-rose-950/20 gap-1 font-medium">
                          <X className="h-3 w-3" /> Đã từ chối lời mời
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {inv.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResendInvitation(inv.id)}
                            className="h-7 text-xs px-2 gap-1"
                            title="Gửi lại lời mời"
                          >
                            <RotateCcw className="h-3 w-3" /> Gửi lại
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCancelInvitation(inv.id)}
                          className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          title="Hủy lời mời"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ======================================================== */}
      {/* 3. REDESIGNED ADD ROLE MODAL (SPACIOUS, COMFORTABLE UX)   */}
      {/* ======================================================== */}
      <Dialog open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-6 sm:p-8">
          <DialogHeader className="border-b pb-5">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <FolderPlus className="h-7 w-7" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">
                  Khởi tạo nhóm quyền mới (Add Role Group)
                </DialogTitle>
                <DialogDescription className="text-sm mt-1">
                  Thiết lập vai trò tùy chỉnh và phân quyền các trang Scrum thành viên nhóm này được phép truy cập.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreateRole} className="space-y-6 pt-2">
            {/* 1. BASIC INFO FORM (Spacious, prominent inputs) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="add-role-name" className="text-sm font-semibold text-foreground flex items-center justify-between">
                  <span>Tên nhóm vai trò <span className="text-rose-500">*</span></span>
                  <span className="text-xs font-normal text-muted-foreground">Bắt buộc</span>
                </Label>
                <Input
                  id="add-role-name"
                  placeholder="VD: Tech Lead, Product Designer, DevOps Engineer..."
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="h-12 text-sm px-4 rounded-xl border-input bg-background shadow-xs focus-visible:ring-2"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-role-desc" className="text-sm font-semibold text-foreground">
                  Mô tả chức năng & nhiệm vụ
                </Label>
                <Input
                  id="add-role-desc"
                  placeholder="VD: Thiết kế giao diện UI/UX và quản trị Design System..."
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  className="h-12 text-sm px-4 rounded-xl border-input bg-background shadow-xs focus-visible:ring-2"
                />
              </div>
            </div>

            {/* 2. PRESET TEMPLATES (Spacious, easy click pills) */}
            <div className="p-4 rounded-2xl border bg-slate-50/70 dark:bg-slate-900/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>Áp dụng nhanh theo mẫu vai trò phổ biến:</span>
                </div>
                <span className="text-xs text-muted-foreground">Nhấn để tự động điền thông tin</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {ROLE_PRESETS.map((preset) => (
                  <div
                    key={preset.name}
                    onClick={() => handleApplyPreset(preset)}
                    className="p-3 rounded-xl border bg-background hover:bg-primary/5 hover:border-primary/50 cursor-pointer transition-all space-y-1 shadow-2xs group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                        {preset.name}
                      </span>
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-mono">
                        {preset.perms.length} quyền
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">
                      {preset.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. PERMISSIONS CHECKLIST (Spacious cards with clean grid) */}
            <div className="space-y-4 pt-2 border-t">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
                <div>
                  <div className="text-sm font-bold text-foreground flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <span>Cấp quyền truy cập các trang công cụ</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Thành viên nhóm này sẽ có quyền truy cập và ghim các trang được tích chọn lên thanh ngang.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs font-semibold px-2.5 py-1">
                    Đã chọn: <strong className="text-primary ml-1">{newRolePerms.length}</strong> / {ALL_AVAILABLE_PERMS.length}
                  </Badge>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAllPerms}
                    className="text-xs h-8 px-3"
                  >
                    Chọn tất cả
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleDeselectAllPerms}
                    className="text-xs h-8 px-3 text-muted-foreground"
                  >
                    Bỏ chọn
                  </Button>
                </div>
              </div>

              {/* Categorized Permissions Grid */}
              <div className="space-y-5">
                {TAB_CATEGORIES.map((cat) => (
                  <div key={cat.category} className="space-y-2.5">
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-lg">
                      {cat.category}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {cat.items.map((item) => {
                        const Icon = item.icon;
                        const isChecked = newRolePerms.includes(item.id);

                        return (
                          <div
                            key={item.id}
                            onClick={() => handleToggleNewPerm(item.id)}
                            className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer select-none transition-all ${
                              isChecked
                                ? "bg-primary/5 border-primary/50 shadow-2xs"
                                : "bg-card hover:bg-slate-50 dark:hover:bg-slate-900 border-border"
                            }`}
                          >
                            <Checkbox
                              id={`role-create-${item.id}`}
                              checked={isChecked}
                              onCheckedChange={() => handleToggleNewPerm(item.id)}
                              className="h-5 w-5 rounded-md mt-0.5 shrink-0"
                            />
                            <div className="p-2 rounded-lg bg-muted/60 shrink-0 mt-0.5">
                              <Icon className={`h-4 w-4 ${isChecked ? "text-primary" : "text-muted-foreground"}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-semibold text-sm text-foreground">
                                  {item.label}
                                </span>
                                {item.isSensitive && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] shrink-0 border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-950/40"
                                  >
                                    Quản trị
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                                {item.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-4 border-t flex items-center justify-between">
              <Button type="button" variant="outline" size="lg" onClick={() => setIsAddRoleOpen(false)} className="h-11 px-5 text-sm">
                Hủy
              </Button>
              <Button type="submit" size="lg" disabled={!newRoleName.trim()} className="h-11 px-6 text-sm font-semibold shadow-xs">
                <FolderPlus className="h-4 w-4 mr-2" />
                Khởi tạo nhóm quyền
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* 4. ADD MEMBER MODAL                                      */}
      {/* ======================================================== */}
      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-lg font-bold">Thêm thành viên mới</DialogTitle>
            <DialogDescription className="text-xs">
              Mời thành viên mới tham gia vào dự án và gán vào nhóm vai trò tương ứng.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddMember} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="m-name" className="text-sm font-semibold">Họ và tên</Label>
              <Input
                id="m-name"
                placeholder="VD: Lê Hoàng Dũng"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                className="h-11 text-sm px-3.5 rounded-xl"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="m-email" className="text-sm font-semibold">Email công việc</Label>
              <Input
                id="m-email"
                type="email"
                placeholder="VD: dung@example.com"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className="h-11 text-sm px-3.5 rounded-xl"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Nhóm vai trò</Label>
              <Select value={newMemberRoleId} onValueChange={(val) => setNewMemberRoleId(val || "r2")}>
                <SelectTrigger className="h-11 text-sm px-3.5 rounded-xl">
                  <SelectValue placeholder="Chọn nhóm quyền" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r: any) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => setIsAddMemberOpen(false)} className="h-10 text-sm">
                Hủy
              </Button>
              <Button type="submit" disabled={!newMemberName.trim() || !newMemberEmail.trim()} className="h-10 text-sm">
                Thêm thành viên
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* 5. EDIT MEMBER PERMISSIONS MODAL                         */}
      {/* ======================================================== */}
      <Dialog open={isEditMemberOpen} onOpenChange={setIsEditMemberOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa quyền thành viên: {editingMember?.name}</DialogTitle>
            <DialogDescription className="text-xs">
              Thay đổi nhóm vai trò hoặc cấp thêm quyền riêng lẻ ngoài nhóm.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Nhóm vai trò</Label>
              <Select value={editMemberRoleId} onValueChange={(val) => setEditMemberRoleId(val || "")}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r: any) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Individual Extra Permissions */}
            <div className="space-y-2 pt-3 border-t">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" />
                <Label className="text-xs font-semibold">Quyền hạn cấp riêng lẻ (Extra Permissions)</Label>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Các quyền này được cấp bổ sung riêng cho {editingMember?.name} bên cạnh các quyền mặc định của nhóm {editingMemberRole?.name}.
              </p>

              <div className="grid grid-cols-2 gap-2 mt-2">
                {ALL_AVAILABLE_PERMS.map((tab) => {
                  const isGrantedByRole = editingMemberRole?.permissions.includes(tab.id);
                  const hasExtra = editMemberExtraPerms.includes(tab.id);

                  return (
                    <div
                      key={tab.id}
                      onClick={() => {
                        if (!isGrantedByRole) {
                          if (hasExtra) {
                            setEditMemberExtraPerms(editMemberExtraPerms.filter((p) => p !== tab.id));
                          } else {
                            setEditMemberExtraPerms([...editMemberExtraPerms, tab.id]);
                          }
                        }
                      }}
                      className={`flex items-center gap-2 p-2 rounded-md border text-xs cursor-pointer select-none ${
                        isGrantedByRole
                          ? "bg-slate-100 dark:bg-slate-800 text-muted-foreground opacity-60 cursor-default"
                          : hasExtra
                          ? "bg-violet-50 dark:bg-violet-950/40 border-violet-400 text-violet-700 dark:text-violet-300 font-semibold"
                          : "hover:bg-slate-50 dark:hover:bg-slate-900"
                      }`}
                    >
                      <Checkbox
                        id={`edit-perm-${tab.id}`}
                        checked={isGrantedByRole || hasExtra}
                        disabled={isGrantedByRole}
                        onCheckedChange={(checked) => {
                          if (!isGrantedByRole) {
                            if (checked) {
                              setEditMemberExtraPerms([...editMemberExtraPerms, tab.id]);
                            } else {
                              setEditMemberExtraPerms(editMemberExtraPerms.filter((p) => p !== tab.id));
                            }
                          }
                        }}
                      />
                      <span className="truncate text-[11px]">
                        {tab.label} {isGrantedByRole && "(Theo nhóm)"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2 border-t">
            <Button variant="outline" onClick={() => setIsEditMemberOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveMember}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
