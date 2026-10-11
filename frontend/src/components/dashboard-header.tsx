"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  LogOut,
  FolderKanban,
  Check,
  X,
  Mail,
  ArrowRight,
  Sparkles,
  Menu
} from "lucide-react";
import { INITIAL_MOCK_PROJECTS } from "@/lib/mock-data";
import { Logo } from "@/components/logo";
import {
  getStoredInvitations,
  respondToInvitation,
  getStoredActivityLogs,
  ProjectInvitation,
  ProjectActivityLog
} from "@/lib/activity-invitation-store";

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const params = useParams();

  const projectId =
    (params?.id as string) ||
    (pathname?.startsWith("/projects/") ? pathname.split("/")[2] : undefined);
  const isInsideWorkspace = Boolean(projectId && pathname?.startsWith("/projects/"));

  const [currentProject, setCurrentProject] = useState<any>(null);
  const [invitations, setInvitations] = useState<ProjectInvitation[]>([]);
  const [recentActivities, setRecentActivities] = useState<ProjectActivityLog[]>([]);

  useEffect(() => {
    const updateInvAndAct = () => {
      setInvitations(getStoredInvitations());
      setRecentActivities(getStoredActivityLogs().slice(0, 4));
    };
    updateInvAndAct();
    window.addEventListener("ftodo_invitations_updated", updateInvAndAct);
    window.addEventListener("ftodo_activity_updated", updateInvAndAct);
    window.addEventListener("storage", updateInvAndAct);
    return () => {
      window.removeEventListener("ftodo_invitations_updated", updateInvAndAct);
      window.removeEventListener("ftodo_activity_updated", updateInvAndAct);
      window.removeEventListener("storage", updateInvAndAct);
    };
  }, []);

  const pendingInvitations = invitations.filter(
    (i) => i.status === "pending" && (i.recipientEmail === user?.email || i.recipientName === user?.name || i.id === "inv-1" || i.id === "inv-2")
  );

  useEffect(() => {
    if (!isInsideWorkspace || !projectId) {
      setCurrentProject(null);
      return;
    }

    const loadProject = () => {
      let found: any = null;
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("ftodo_mock_projects");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            const list = Array.isArray(parsed)
              ? parsed
              : [...(parsed.owned || []), ...(parsed.memberOf || [])];
            found = list.find((p: any) => p.id === projectId);
          } catch {}
        }
      }
      if (!found) {
        const defaultList = [...INITIAL_MOCK_PROJECTS.owned, ...INITIAL_MOCK_PROJECTS.memberOf];
        found = defaultList.find((p) => p.id === projectId) || defaultList[0];
      }
      setCurrentProject(found);
    };

    loadProject();

    const handleUpdate = () => loadProject();
    window.addEventListener("ftodo_permissions_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("ftodo_permissions_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [isInsideWorkspace, projectId]);

  return (
    <header className="h-16 bg-card border-b flex items-center justify-between px-3 sm:px-6 shrink-0 z-30">
      {/* Left Area: FTodo Brand Logo on Dashboard vs Project Name inside Workspace */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {!isInsideWorkspace ? (
          /* Default Logo & Title when on main Dashboard / Home */
          <Link href="/" className="flex items-center">
            <Logo size="sm" subtitleText="Bảng điều khiển tổng quan dự án" />
          </Link>
        ) : (
          /* When inside Workspace: Mobile hamburger + Project Name only */
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.dispatchEvent(new Event("ftodo_toggle_mobile_sidebar"))}
              className="h-8 w-8 text-muted-foreground hover:text-foreground md:hidden shrink-0 rounded-lg -ml-1"
              title="Menu dự án"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <div className="p-1.5 sm:p-2 rounded-xl bg-primary/10 text-primary shrink-0">
              <FolderKanban className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <h2
              className="text-sm sm:text-base md:text-lg font-bold text-foreground tracking-tight truncate max-w-[170px] sm:max-w-md md:max-w-lg"
              title={currentProject?.name}
            >
              {currentProject?.name || "Dự án Scrum"}
            </h2>
          </div>
        )}
      </div>

      {/* Right Area: Notifications Popover & User Avatar */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Interactive Notification Bell with unread badge & dropdown popover */}
        <DropdownMenu>
          <DropdownMenuTrigger className="relative inline-flex items-center justify-center h-9 w-9 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer outline-none">
            <Bell className="h-4 w-4" />
            {pendingInvitations.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs animate-pulse">
                {pendingInvitations.length}
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0 shadow-2xl rounded-xl">
            <div className="p-3 border-b flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-foreground">Thông báo & Lời mời dự án</span>
              </div>
              {pendingInvitations.length > 0 && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">
                  {pendingInvitations.length} lời mời mới
                </Badge>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y">
              {/* Pending Invitations list */}
              {pendingInvitations.length > 0 ? (
                pendingInvitations.map((inv) => (
                  <div key={inv.id} className="p-3 hover:bg-muted/20 transition-colors space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[10px] font-semibold text-primary uppercase flex items-center gap-1">
                          <Mail className="h-3 w-3" /> Lời mời tham gia dự án
                        </div>
                        <div className="text-xs font-bold text-foreground mt-0.5 truncate">
                          {inv.projectName}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                          Từ <strong>{inv.inviterName}</strong> • Vai trò: <strong>{inv.roleGroupName}</strong>
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {inv.createdAt}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <Button
                        size="sm"
                        onClick={() => respondToInvitation(inv.id, "accepted")}
                        className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1 flex-1 shadow-xs"
                      >
                        <Check className="h-3 w-3" /> Chấp nhận
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => respondToInvitation(inv.id, "declined")}
                        className="h-7 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 gap-1 flex-1"
                      >
                        <X className="h-3 w-3" /> Từ chối
                      </Button>
                    </div>
                  </div>
                ))
              ) : null}

              {/* Recent System Activity Logs */}
              {recentActivities.map((act) => (
                <div key={act.id} className="p-3 text-xs space-y-1 hover:bg-muted/20 transition-colors">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="font-semibold text-foreground flex items-center gap-1">
                      <span className="h-4 w-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px] font-bold">
                        {act.userAvatar}
                      </span>
                      {act.userName}
                    </span>
                    <span>{act.timeAgo}</span>
                  </div>
                  <p className="text-xs text-foreground leading-snug">
                    <span className="text-muted-foreground">{act.action}:</span> {act.detail}
                  </p>
                </div>
              ))}

              {pendingInvitations.length === 0 && recentActivities.length === 0 && (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  Không có thông báo mới nào.
                </div>
              )}
            </div>

            <div className="p-2 border-t text-center bg-muted/10">
              <Link
                href="/"
                className="text-[11px] font-medium text-primary hover:underline inline-flex items-center gap-1"
              >
                Xem chi tiết trên Trang chủ <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile & Logout Dropdown or Login / Register buttons */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 outline-none cursor-pointer">
              <Avatar className="h-8 w-8 ring-1 ring-border">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                  {user.avatar || (user.name ? user.name.slice(0, 2).toUpperCase() : "US")}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden md:block">
                <div className="text-xs font-semibold leading-none">{user.name}</div>
                <div className="text-[10px] text-muted-foreground leading-none mt-1">{user.email}</div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="text-xs font-semibold">{user.name}</div>
                <div className="text-[11px] text-muted-foreground font-normal">{user.email}</div>
                <div className="text-[10px] text-primary mt-0.5 font-medium">{user.jobTitle}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-rose-600 focus:text-rose-600 cursor-pointer text-xs">
                <LogOut className="h-3.5 w-3.5 mr-2" /> Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-xs font-semibold h-8">
                Đăng nhập
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="text-xs font-semibold h-8 rounded-lg">
                Đăng ký
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
