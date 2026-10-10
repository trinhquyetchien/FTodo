"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, AlertCircle, Users, Activity } from "lucide-react";

export default function ProjectOverview() {
  const searchParams = useSearchParams();
  const role = searchParams?.get("role") || "owner";
  
  if (role === "owner") {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tiến độ Sprint hiện tại</CardTitle>
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
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">3</div>
              <p className="text-xs text-muted-foreground mt-1">Cần xem xét ngay</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Số lượng thành viên</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ngân sách (Chi phí)</CardTitle>
              <Activity className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45%</div>
              <Progress value={45} className="h-2 mt-3" />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Hiệu suất thành viên</CardTitle>
              <CardDescription>Số lượng task hoàn thành trong tuần</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">N</div>
                  <span className="font-medium">Nguyễn Văn A</span>
                </div>
                <span className="text-sm font-bold">12 tasks</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">T</div>
                  <span className="font-medium">Trần Thị B</span>
                </div>
                <span className="text-sm font-bold">8 tasks</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Member View
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Task được giao</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Task trễ hạn</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">1</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Task đã xong</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Công việc của tôi trong Sprint này</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
              <div>
                <p className="font-medium">Thiết kế API Đăng nhập</p>
                <p className="text-sm text-muted-foreground">Hạn chót: Hôm nay</p>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-100 text-blue-700">In Progress</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg border-red-200 bg-red-50">
              <div>
                <p className="font-medium text-red-800">Sửa lỗi giao diện Mobile</p>
                <p className="text-sm text-red-600">Hạn chót: Hôm qua</p>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded bg-red-100 text-red-700">Trễ hạn</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
