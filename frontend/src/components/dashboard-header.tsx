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
  RefreshCw,
  Crown,
  Code2,
  CheckCircle,
  UserCheck,
  FolderKanban
} from "lucide-react";
import { INITIAL_MOCK_PROJECTS } from "@/lib/mock-data";

export function DashboardHeader() {
  const { user, logout, quickSwitch } = useAuth();
  const pathname = usePathname();
  const params = useParams();

  const projectId =
    (params?.id as string) ||
    (pathname?.startsWith("/projects/") ? pathname.split("/")[2] : undefined);
  const isInsideWorkspace = Boolean(projectId && pathname?.startsWith("/projects/"));

  const [currentProject, setCurrentProject] = useState<any>(null);

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

  const isProjectOwner = Boolean(
    user && (user.id === currentProject?.ownerId || (user.role === "ADMIN" && currentProject?.ownerId === "u-chien"))
  );

  return (
    <header className="h-16 bg-card border-b flex items-center justify-between px-6 shrink-0 z-30">
      {/* Left Area: FTodo Brand Logo on Dashboard vs Project Name inside Workspace */}
      <div className="flex items-center gap-3 min-w-0">
        {!isInsideWorkspace ? (
          /* Default Logo & Title when on main Dashboard / Home */
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground font-black flex items-center justify-center text-sm shadow-sm shadow-primary/25 shrink-0">
              F
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold text-foreground tracking-tight leading-tight">
                Hệ thống Quản lý Phần mềm Scrum FTodo
              </span>
              <span className="text-[10px] text-muted-foreground leading-none">
                Bảng điều khiển tổng quan dự án
              </span>
            </div>
          </Link>
        ) : (
          /* When inside Workspace: Logo is removed, replaced with Project Name! */
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                <FolderKanban className="h-5 w-5" />
              </div>
              <h2
                className="text-base sm:text-lg font-bold text-foreground tracking-tight truncate max-w-[200px] sm:max-w-md md:max-w-lg"
                title={currentProject?.name}
              >
                {currentProject?.name || "Dự án Scrum"}
              </h2>
            </div>

            {isProjectOwner ? (
              <Badge className="text-xs bg-amber-600 hover:bg-amber-700 shrink-0">
                <Crown className="h-3 w-3 mr-1" /> Chủ dự án (Owner)
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs shrink-0">
                <UserCheck className="h-3 w-3 mr-1" /> Thành viên ({user?.name?.includes("An") ? "DEV" : "QA"})
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Right Area: Demo switcher, Notifications, User Avatar */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Quick Demo Switcher Button */}
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-md border bg-slate-50 dark:bg-slate-900 transition-colors cursor-pointer">
            <RefreshCw className="h-3.5 w-3.5 text-primary" />
            <span className="hidden sm:inline font-medium">Chuyển vai trò Demo</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel className="text-xs">Chuyển nhanh tài khoản thử nghiệm</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => quickSwitch("owner")}
              className="text-xs cursor-pointer py-2"
            >
              <Crown className="h-4 w-4 mr-2 text-amber-500" />
              <div>
                <div className="font-semibold">Trịnh Quyết Chiến (Chủ dự án)</div>
                <div className="text-[10px] text-muted-foreground">Toàn quyền cấu hình & Cài đặt dự án</div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => quickSwitch("dev")}
              className="text-xs cursor-pointer py-2"
            >
              <Code2 className="h-4 w-4 mr-2 text-blue-500" />
              <div>
                <div className="font-semibold">Nguyễn Văn An (Thành viên DEV)</div>
                <div className="text-[10px] text-muted-foreground">Được cấp thêm quyền xem tab Chi phí</div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => quickSwitch("qa")}
              className="text-xs cursor-pointer py-2"
            >
              <CheckCircle className="h-4 w-4 mr-2 text-emerald-500" />
              <div>
                <div className="font-semibold">Trần Thị Bình (Thành viên QA)</div>
                <div className="text-[10px] text-muted-foreground">Quyền cơ bản (Không có quyền Chi phí)</div>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" className="text-muted-foreground h-9 w-9">
          <Bell className="h-4 w-4" />
        </Button>

        {/* User Profile & Logout Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 outline-none cursor-pointer">
            <Avatar className="h-8 w-8 ring-1 ring-border">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                {user?.avatar || "QC"}
              </AvatarFallback>
            </Avatar>
            <div className="text-left hidden md:block">
              <div className="text-xs font-semibold leading-none">{user?.name}</div>
              <div className="text-[10px] text-muted-foreground leading-none mt-1">{user?.email}</div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              <div className="text-xs font-semibold">{user?.name}</div>
              <div className="text-[11px] text-muted-foreground font-normal">{user?.email}</div>
              <div className="text-[10px] text-primary mt-0.5 font-medium">{user?.jobTitle}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-rose-600 focus:text-rose-600 cursor-pointer text-xs">
              <LogOut className="h-3.5 w-3.5 mr-2" /> Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
