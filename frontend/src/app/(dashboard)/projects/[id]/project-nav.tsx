"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import {
  Kanban,
  ListTodo,
  Users,
  MessageSquare,
  DollarSign,
  LayoutDashboard,
  Settings,
  Plus,
  Check,
  Lock,
  Crown,
  UserCheck,
  CalendarRange,
  CheckSquare,
  BarChart3,
  Rocket,
  Boxes,
  History
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProject } from "./project-context";

export function ProjectNav() {
  const pathname = usePathname();
  const params = useParams();
  const id = params?.id as string || "1";

  const { project, isOwner, activeTabs, toggleTab, hasPermission } = useProject();

  const allAvailableTabs = [
    {
      id: "overview",
      name: "Tổng quan",
      href: `/projects/${id}`,
      icon: LayoutDashboard,
      description: "Thống kê tiến độ & công việc Sprint",
    },
    {
      id: "board",
      name: "Bảng Scrum",
      href: `/projects/${id}/board`,
      icon: Kanban,
      description: "Kanban board kéo thả theo Sprint",
    },
    {
      id: "backlog",
      name: "Backlog",
      href: `/projects/${id}/backlog`,
      icon: ListTodo,
      description: "Kế hoạch Sprint & User Stories",
    },
    {
      id: "timeline",
      name: "Lộ trình",
      href: `/projects/${id}/timeline`,
      icon: CalendarRange,
      description: "Sơ đồ Gantt tiến độ tính năng & Milestone",
    },
    {
      id: "issues",
      name: "Tác vụ",
      href: `/projects/${id}/issues`,
      icon: CheckSquare,
      description: "Toàn bộ Bugs, Tasks, Stories theo bộ lọc",
    },
    {
      id: "reports",
      name: "Báo cáo",
      href: `/projects/${id}/reports`,
      icon: BarChart3,
      description: "Biểu đồ Burndown, Velocity & CFD",
    },
    {
      id: "releases",
      name: "Phiên bản",
      href: `/projects/${id}/releases`,
      icon: Rocket,
      description: "Quản lý phiên bản phát hành v1.0, v1.1",
    },
    {
      id: "components",
      name: "Hợp phần",
      href: `/projects/${id}/components`,
      icon: Boxes,
      description: "Phân rã module kiến trúc phần mềm",
    },
    {
      id: "cost",
      name: "Tiền & Chi phí",
      href: `/projects/${id}/cost`,
      icon: DollarSign,
      description: "Ngân sách, burn-rate & chi tiêu",
    },
    {
      id: "members",
      name: "Nhân sự",
      href: `/projects/${id}/members`,
      icon: Users,
      description: "Quản lý nhóm quyền & thành viên",
    },
    {
      id: "activity",
      name: "Lịch sử hoạt động",
      href: `/projects/${id}/activity`,
      icon: History,
      description: "Nhật ký kiểm toán công việc, xóa task & duyệt chi",
    },
    {
      id: "settings",
      name: "Cài đặt dự án",
      href: `/projects/${id}/settings`,
      icon: Settings,
      description: "Đổi tên, cấu hình & xóa dự án",
    },
  ];

  // Filter which tabs to show on the horizontal bar
  const visibleTabs = allAvailableTabs.filter((tab) => {
    // If settings: only owner can see it
    if (tab.id === "settings") return isOwner && activeTabs.includes("settings");

    if (isOwner) {
      return activeTabs.includes(tab.id);
    } else {
      // Member can only see active tabs that they are actually permitted to access
      return activeTabs.includes(tab.id) && hasPermission(tab.id);
    }
  });

  // Dropdown list for adding tabs:
  // Owner can see all tabs.
  // Member sees tabs excluding settings. For members, if they don't have permission, it's locked.
  const addableTabs = isOwner
    ? allAvailableTabs
    : allAvailableTabs.filter((t) => t.id !== "settings");

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 scrollbar-none">
      {visibleTabs.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shadow-xs ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{item.name}</span>
            </Link>
          );
        })}

        {/* Add / Pin Page Button */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "gap-1.5 text-xs text-slate-600 dark:text-slate-300 ml-1 border-dashed",
            })}
          >
            <Plus className="h-3.5 w-3.5" /> Thêm trang
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72 max-h-[420px] overflow-y-auto">
            <DropdownMenuLabel className="text-xs flex items-center justify-between">
              <span>{isOwner ? "Toàn quyền thêm trang (Owner)" : "Thêm trang được cấp quyền"}</span>
              {isOwner ? (
                <Badge variant="default" className="text-[10px] bg-amber-600 px-1 py-0">
                  <Crown className="h-2.5 w-2.5 mr-0.5" /> Chủ dự án
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-[10px] px-1 py-0">
                  <UserCheck className="h-2.5 w-2.5 mr-0.5" /> Thành viên
                </Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {addableTabs.map((item) => {
              const Icon = item.icon;
              const isPinned = activeTabs.includes(item.id);
              const allowed = isOwner || hasPermission(item.id);

              return (
                <DropdownMenuItem
                  key={item.id}
                  disabled={!allowed}
                  closeOnClick={false}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (allowed) toggleTab(item.id);
                  }}
                  className={`flex items-center justify-between py-2 text-xs cursor-pointer ${
                    !allowed ? "opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-900" : ""
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${allowed ? "text-primary" : "text-muted-foreground"}`} />
                    <div>
                      <div className="font-medium leading-none">{item.name}</div>
                      {!allowed && (
                        <div className="text-[10px] text-rose-500 flex items-center gap-1 mt-0.5">
                          <Lock className="h-2.5 w-2.5" /> Chưa được chủ dự án cấp quyền
                        </div>
                      )}
                    </div>
                  </div>

                  {allowed && isPinned && (
                    <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
    </div>
  );
}
