"use client";

import { useState } from "react";
import { Plus, MoreHorizontal, Calendar } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mockBacklog = [
  { id: "TASK-1", title: "Thiết kế Database Schema", priority: "Cao", status: "Chưa làm", points: 5 },
  { id: "TASK-2", title: "Khởi tạo repo và cài đặt Next.js", priority: "Trung bình", status: "Đang làm", points: 3 },
  { id: "TASK-3", title: "Thiết kế giao diện Đăng nhập", priority: "Cao", status: "Chưa làm", points: 2 },
  { id: "TASK-4", title: "Tích hợp API Đăng nhập với Backend", priority: "Cao", status: "Chưa làm", points: 5 },
  { id: "TASK-5", title: "Viết Unit test cho Auth", priority: "Thấp", status: "Chưa làm", points: 3 },
];

export default function BacklogPage() {
  const [newTaskTitle, setNewTaskTitle] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Product Backlog</h2>
          <p className="text-sm text-muted-foreground">Lên kế hoạch và ưu tiên các công việc cần làm.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" /> Tạo Sprint mới
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Bắt đầu Sprint
          </Button>
        </div>
      </div>

      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Tên công việc</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Độ ưu tiên</TableHead>
              <TableHead className="text-right">Story Points</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockBacklog.map((task) => (
              <TableRow key={task.id} className="cursor-pointer hover:bg-slate-50">
                <TableCell className="font-medium text-slate-500">{task.id}</TableCell>
                <TableCell className="font-medium">{task.title}</TableCell>
                <TableCell>
                  <Badge variant={task.status === "Đang làm" ? "default" : "secondary"}>
                    {task.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={
                    task.priority === "Cao" ? "destructive" : 
                    task.priority === "Trung bình" ? "default" : "outline"
                  }>
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-100 text-xs font-semibold">
                    {task.points}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", className: "h-8 w-8 p-0" })}>
                      <span className="sr-only">Mở menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                      <DropdownMenuItem>Sửa công việc</DropdownMenuItem>
                      <DropdownMenuItem>Gán vào Sprint hiện tại</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">Xóa công việc</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Create quick task */}
        <div className="p-3 border-t bg-slate-50 flex items-center gap-2">
          <Plus className="h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Tạo task mới (nhấn Enter để lưu)..." 
            className="border-0 bg-transparent focus-visible:ring-0 shadow-none px-0"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
          />
          {newTaskTitle && (
            <Button size="sm">Lưu</Button>
          )}
        </div>
      </div>
    </div>
  );
}
