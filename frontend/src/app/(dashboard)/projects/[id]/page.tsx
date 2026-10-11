"use client";

import { useState } from "react";
import { useProject } from "./project-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  Activity,
  Crown,
  UserCheck,
  DollarSign,
  Layers,
  Zap,
  BarChart2,
  CheckCheck,
  ShieldCheck,
  ArrowUpRight
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  Legend
} from "recharts";

const SPRINT_STATUS_DATA = [
  { name: "To Do (Cần làm)", points: 3, tasks: 2, fill: "#94a3b8" },
  { name: "In Progress (Đang làm)", points: 8, tasks: 3, fill: "#3b82f6" },
  { name: "In Review (Kiểm thử)", points: 5, tasks: 2, fill: "#8b5cf6" },
  { name: "Done (Hoàn tất)", points: 8, tasks: 3, fill: "#10b981" },
];

const TEAM_WORKLOAD_DATA = [
  { member: "Nguyễn Văn An", role: "Frontend Dev", assigned: 8, capacity: 8 },
  { member: "Trần Thị Bình", role: "QA Engineer", assigned: 5, capacity: 8 },
  { member: "Trịnh Q. Chiến", role: "Tech Lead / PO", assigned: 5, capacity: 8 },
  { member: "Lê Hoàng Dũng", role: "Backend Dev", assigned: 6, capacity: 8 },
];

export default function ProjectOverview() {
  const { project, isOwner, effectivePermissions } = useProject();

  if (isOwner) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-lg font-bold tracking-tight">Dashboard Quản trị Dự án</h3>
            <p className="text-xs text-muted-foreground">Chế độ xem dành riêng cho Quản trị viên / Tech Lead / Scrum Master</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-600 hover:bg-amber-700 text-xs">
              <Crown className="h-3 w-3 mr-1" /> Chế độ Chủ sở hữu
            </Badge>
            <Badge variant="outline" className="text-xs font-mono">
              Sprint 1 • Ngày 11/14
            </Badge>
          </div>
        </div>

        {/* 1. Core Engineering Health KPIs */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Tiến độ Sprint 1</CardTitle>
              <Activity className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">66.7%</div>
              <Progress value={66.7} className="h-2 mt-2" />
              <p className="text-[11px] text-muted-foreground mt-2">16 / 24 Story Points hoàn thành</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Điểm nghẽn & Task Trễ</CardTitle>
              <AlertCircle className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-500">1 Task</div>
              <p className="text-[11px] text-muted-foreground mt-1">FT-103 vượt hạn 1 ngày • Cần hỗ trợ</p>
              <div className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
                <CheckCheck className="h-3 w-3" /> WIP Review: 2 task (Bình thường)
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Năng lực Đội ngũ</CardTitle>
              <Users className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{project?.members || 4} Thành viên</div>
              <p className="text-[11px] text-muted-foreground mt-1">Tải phân bổ: 24 / 32 SP (75% Capacity)</p>
              <div className="text-[10px] font-medium text-blue-600 dark:text-blue-400 mt-2">
                Dư địa tiếp nhận: 8 Story Points
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Chi phí đã duyệt</CardTitle>
              <DollarSign className="h-4 w-4 text-violet-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">186.5 tr ₫</div>
              <p className="text-[11px] text-muted-foreground mt-1">37.3% trên ngân sách 500 tr ₫</p>
              <div className="text-[10px] font-medium text-muted-foreground mt-2">
                Burn Rate: ~18.6 tr/tuần
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 2. Visual Scrum Charts: Status / WIP Distribution & Team Workload */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          {/* Chart 1: Status Distribution & WIP Limits */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                    <BarChart2 className="h-4 w-4 text-primary" />
                    Phân bổ Trạng thái & Kiểm soát WIP Sprint 1
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Kiểm soát lượng công việc dở dang (WIP) để tránh ùn ứ tại khâu Review / Testing.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300">
                  WIP An toàn
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={SPRINT_STATUS_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} />
                    <YAxis axisLine={false} tickLine={false} fontSize={10} unit=" SP" />
                    <Tooltip
                      formatter={(val: any, name: any) => [`${val} Story Points`, "Điểm công việc"]}
                      contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.9)", color: "#fff", borderRadius: 8, fontSize: 11 }}
                    />
                    <Bar dataKey="points" radius={[4, 4, 0, 0]} name="Story Points">
                      {SPRINT_STATUS_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-4 gap-2 pt-3 border-t text-center text-xs">
                <div>
                  <p className="text-[11px] text-muted-foreground">To Do</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">3 SP (2 tasks)</p>
                </div>
                <div>
                  <p className="text-[11px] text-blue-500 font-medium">In Progress</p>
                  <p className="font-semibold text-blue-600">8 SP (3 tasks)</p>
                </div>
                <div>
                  <p className="text-[11px] text-violet-500 font-medium">In Review</p>
                  <p className="font-semibold text-violet-600">5 SP (2 tasks)</p>
                </div>
                <div>
                  <p className="text-[11px] text-emerald-500 font-medium">Done</p>
                  <p className="font-semibold text-emerald-600">8 SP (3 tasks)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chart 2: Team Workload Allocation & Capacity */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-emerald-500" />
                    Cân đối Năng lực & Tải Thành viên (Workload)
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    So sánh Story Points đã giao với trần năng lực (8 SP/sprint) nhằm tránh quá tải.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px] text-blue-600 border-blue-300">
                  Capacity: 8 SP/người
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={TEAM_WORKLOAD_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis dataKey="member" axisLine={false} tickLine={false} fontSize={10} />
                    <YAxis axisLine={false} tickLine={false} fontSize={10} unit=" SP" />
                    <Tooltip
                      formatter={(val: any, name: any) => [
                        `${val} SP`,
                        name === "assigned" ? "Story Points đã nhận" : "Hạn mức tối đa"
                      ]}
                      contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.9)", color: "#fff", borderRadius: 8, fontSize: 11 }}
                    />
                    <Legend verticalAlign="top" height={24} iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="assigned" name="Đã giao (SP)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="capacity" name="Năng lực trần (SP)" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-4 gap-2 pt-3 border-t text-center text-xs">
                {TEAM_WORKLOAD_DATA.map((t) => {
                  const pct = Math.round((t.assigned / t.capacity) * 100);
                  const isFull = pct >= 100;
                  return (
                    <div key={t.member}>
                      <p className="text-[10px] text-muted-foreground truncate">{t.role}</p>
                      <p className={`font-semibold text-[11px] ${isFull ? "text-amber-600" : "text-emerald-600"}`}>
                        {t.assigned}/{t.capacity} SP ({pct}%)
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 3. Sprint Goal & Assigned Tasks breakdown */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Trạng thái công việc các thành viên</CardTitle>
              <CardDescription className="text-xs">Tiến độ chi tiết các đầu việc quan trọng đang được thực thi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3.5">
                <div className="flex items-center justify-between p-2.5 rounded-lg border bg-card hover:bg-muted/40 transition-colors">
                  <div>
                    <span className="font-medium text-sm">Nguyễn Văn An (Frontend DEV)</span>
                    <p className="text-xs text-muted-foreground">FT-102: Xác thực JWT & phân quyền nhóm</p>
                  </div>
                  <Badge variant="outline" className="text-blue-600 border-blue-200 text-xs">In Progress</Badge>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg border bg-card hover:bg-muted/40 transition-colors">
                  <div>
                    <span className="font-medium text-sm">Trần Thị Bình (QA Engineer)</span>
                    <p className="text-xs text-muted-foreground">FT-101: Cơ sở dữ liệu PostgreSQL & Prisma</p>
                  </div>
                  <Badge variant="outline" className="text-emerald-600 border-emerald-200 text-xs">Done</Badge>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg border bg-card hover:bg-muted/40 transition-colors">
                  <div>
                    <span className="font-medium text-sm">Trịnh Quyết Chiến (Tech Lead / PO)</span>
                    <p className="text-xs text-muted-foreground">FT-104: Quản lý chi phí & ngân sách dự án</p>
                  </div>
                  <Badge variant="outline" className="text-violet-600 border-violet-200 text-xs">Review</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Mục tiêu Sprint (Sprint Goal)</CardTitle>
              <CardDescription className="text-xs">Thời hạn Sprint 1: 01/10/2026 – 15/10/2026 (Còn 4 ngày)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 border text-xs sm:text-sm leading-relaxed">
                  <p className="font-medium text-foreground">
                    "Hoàn thành toàn diện kiến trúc xác thực JWT, phân quyền nhóm linh hoạt cho thành viên và bảng Scrum kéo thả tương tác mượt mà."
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
                  <div className="p-2 border rounded-md">
                    <p className="text-muted-foreground text-[10px]">Mục tiêu Cam kết</p>
                    <p className="font-bold text-foreground">24 SP</p>
                  </div>
                  <div className="p-2 border rounded-md">
                    <p className="text-emerald-600 text-[10px]">Đã Hoàn tất</p>
                    <p className="font-bold text-emerald-600">16 SP</p>
                  </div>
                  <div className="p-2 border rounded-md">
                    <p className="text-blue-600 text-[10px]">Đang Thực hiện</p>
                    <p className="font-bold text-blue-600">8 SP</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Member View (Limited to assigned tasks and personal progress)
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold tracking-tight">Không gian làm việc thành viên</h3>
          <p className="text-xs text-muted-foreground">Tập trung vào các nhiệm vụ được giao và tiến độ cá nhân</p>
        </div>
        <Badge variant="secondary" className="text-xs">
          <UserCheck className="h-3 w-3 mr-1" /> Chế độ Thành viên
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Task đang thực hiện</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground mt-1">Được giao trong Sprint 1</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Task đã hoàn thành</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground mt-1">Đã được nghiệm thu</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quyền hạn của bạn</CardTitle>
            <Layers className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-semibold">
              {effectivePermissions?.length || 0} trang được phép
            </div>
            <p className="text-xs text-muted-foreground mt-1">Dùng nút "+ Thêm trang" để ghim lên thanh ngang</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Công việc của tôi trong Sprint này</CardTitle>
          <CardDescription>Danh sách task được giao cho bạn thực hiện</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
              <div>
                <p className="font-medium text-sm">FT-102: Xây dựng hệ thống Xác thực JWT và Phân quyền theo nhóm</p>
                <p className="text-xs text-muted-foreground">Sprint 1 • 8 Story Points</p>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                In Progress
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
              <div>
                <p className="font-medium text-sm">FT-101: Thiết kế cơ sở dữ liệu PostgreSQL và Prisma schema</p>
                <p className="text-xs text-muted-foreground">Sprint 1 • 5 Story Points</p>
              </div>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                Done
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

