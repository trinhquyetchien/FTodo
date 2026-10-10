"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, FolderKanban, LayoutGrid, Clock, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

// Mock Data
const dataCharts = [
  { name: "T2", tasks: 4 },
  { name: "T3", tasks: 7 },
  { name: "T4", tasks: 2 },
  { name: "T5", tasks: 5 },
  { name: "T6", tasks: 8 },
  { name: "T7", tasks: 3 },
  { name: "CN", tasks: 1 },
];

const ownedProjects = [
  { id: "owner-1", name: "E-Commerce App", progress: 65, tasks: 12, members: 4 },
  { id: "owner-2", name: "Marketing Website", progress: 90, tasks: 2, members: 3 },
];

const memberProjects = [
  { id: "member-1", name: "CRM System", progress: 32, tasks: 5, members: 8 },
  { id: "member-2", name: "Mobile App Redesign", progress: 15, tasks: 18, members: 5 },
];

export default function GlobalDashboard() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="space-y-8 pb-8">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tổng quan hệ thống</h1>
          <p className="text-muted-foreground">Theo dõi tiến độ các dự án và công việc của bạn.</p>
        </div>
        
        <div>
          <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4" /> Tạo dự án mới
          </Button>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo dự án mới</DialogTitle>
              <DialogDescription>
                Bắt đầu một dự án mới. Bạn có thể mời thành viên sau khi tạo.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên dự án</Label>
                <Input id="name" placeholder="VD: Website bán hàng" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Mô tả (tùy chọn)</Label>
                <Input id="desc" placeholder="Mô tả ngắn gọn về dự án..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Hủy</Button>
              <Button onClick={() => setIsCreateOpen(false)}>Tạo dự án</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Chart Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Công việc hoàn thành trong tuần</CardTitle>
            <CardDescription>Biểu đồ số lượng task bạn đã hoàn thành mỗi ngày</CardDescription>
          </CardHeader>
          <CardContent className="pl-0 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataCharts} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} />
                <Bar dataKey="tasks" fill="#0f172a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tóm tắt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Tổng dự án</span>
              </div>
              <span className="text-2xl font-bold">4</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                <span className="font-medium">Task đang làm</span>
              </div>
              <span className="text-2xl font-bold">19</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                <span className="font-medium">Đồng nghiệp</span>
              </div>
              <span className="text-2xl font-bold">12</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Owned Projects List */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Badge variant="default">Chủ dự án</Badge> Dự án do bạn quản lý
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ownedProjects.map((project) => (
            <Link href={`/projects/${project.id}?role=owner`} key={project.id}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col border-primary/20">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Tiến độ</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <LayoutGrid className="h-4 w-4" /> {project.tasks} task
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" /> {project.members} thành viên
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Member Projects List */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Badge variant="secondary" className="bg-slate-200 text-slate-700 hover:bg-slate-300">Thành viên</Badge> Dự án tham gia
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {memberProjects.map((project) => (
            <Link href={`/projects/${project.id}?role=member`} key={project.id}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col border-slate-200">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Tiến độ</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <LayoutGrid className="h-4 w-4" /> {project.tasks} task
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" /> {project.members} thành viên
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
