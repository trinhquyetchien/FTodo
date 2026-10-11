"use client";

import { useProject } from "./project-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertCircle, Users, Activity, Crown, UserCheck, DollarSign, Layers } from "lucide-react";

export default function ProjectOverview() {
  const { project, isOwner, effectivePermissions } = useProject();

  if (isOwner) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold tracking-tight">Dashboard Quản trị Dự án</h3>
            <p className="text-xs text-muted-foreground">Chế độ xem dành riêng cho Chủ dự án (Owner)</p>
          </div>
          <Badge className="bg-amber-600 hover:bg-amber-700 text-xs">
            <Crown className="h-3 w-3 mr-1" /> Chế độ Chủ sở hữu
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tiến độ Sprint 1</CardTitle>
              <Activity className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">65%</div>
              <Progress value={65} className="h-2 mt-3" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Task trễ hạn</CardTitle>
              <AlertCircle className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-500">1</div>
              <p className="text-xs text-muted-foreground mt-1">Cần điều phối trong Daily Scrum</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Thành viên tham gia</CardTitle>
              <Users className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{project?.members || 3}</div>
              <p className="text-xs text-muted-foreground mt-1">Gồm 3 nhóm phân quyền (Admin, DEV, QA)</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chi phí đã duyệt</CardTitle>
              <DollarSign className="h-4 w-4 text-violet-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">186.5 tr ₫</div>
              <p className="text-xs text-muted-foreground mt-1">37.3% trên tổng ngân sách 500 tr ₫</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Trạng thái phân bổ công việc Sprint 1</CardTitle>
              <CardDescription>Tiến độ thực hiện theo từng thành viên trong team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-sm">Nguyễn Văn An (DEV)</span>
                    <p className="text-xs text-muted-foreground">FT-102: Xác thực JWT & phân quyền nhóm</p>
                  </div>
                  <Badge variant="outline" className="text-blue-600 border-blue-200 text-xs">In Progress</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-sm">Trần Thị Bình (QA)</span>
                    <p className="text-xs text-muted-foreground">FT-101: Cơ sở dữ liệu PostgreSQL & Prisma</p>
                  </div>
                  <Badge variant="outline" className="text-emerald-600 border-emerald-200 text-xs">Done</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-sm">Trịnh Quyết Chiến (PO / Owner)</span>
                    <p className="text-xs text-muted-foreground">FT-104: Quản lý chi phí & ngân sách</p>
                  </div>
                  <Badge variant="outline" className="text-violet-600 border-violet-200 text-xs">Review</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mục tiêu Sprint (Sprint Goal)</CardTitle>
              <CardDescription>Thời hạn Sprint: 01/10/2026 – 15/10/2026</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border">
                  <p className="font-medium text-foreground">
                    "Hoàn thành toàn diện kiến trúc xác thực JWT, phân quyền nhóm linh hoạt cho thành viên và bảng Scrum kéo thả."
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                  <span>Velocity dự kiến: <strong>21 Points</strong></span>
                  <span>Đã xong: <strong>5 Points</strong></span>
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

