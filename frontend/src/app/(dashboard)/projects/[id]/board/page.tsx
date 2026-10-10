"use client";

import { MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

// Mock Data
const columns = [
  { id: "TODO", title: "Cần làm (To Do)", count: 2 },
  { id: "IN_PROGRESS", title: "Đang làm (In Progress)", count: 1 },
  { id: "REVIEW", title: "Đang duyệt (Review)", count: 1 },
  { id: "DONE", title: "Hoàn thành (Done)", count: 1 },
];

const mockTasks = [
  { id: "TASK-1", title: "Thiết kế Database Schema", status: "TODO", priority: "Cao", points: 5, assignee: "N" },
  { id: "TASK-3", title: "Thiết kế giao diện Đăng nhập", status: "TODO", priority: "Trung bình", points: 2, assignee: "T" },
  { id: "TASK-2", title: "Khởi tạo repo và cài đặt Next.js", status: "IN_PROGRESS", priority: "Cao", points: 3, assignee: "N" },
  { id: "TASK-4", title: "Viết tài liệu API", status: "REVIEW", priority: "Thấp", points: 1, assignee: "T" },
  { id: "TASK-5", title: "Tạo dự án trên Vercel", status: "DONE", priority: "Cao", points: 1, assignee: "N" },
];

export default function BoardPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Sprint 1: Cấu trúc cơ bản</h2>
          <p className="text-sm text-muted-foreground">10 Th10 - 24 Th10 (Còn 14 ngày)</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2 mr-4">
            <Avatar className="h-8 w-8 border-2 border-white">
              <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">N</AvatarFallback>
            </Avatar>
            <Avatar className="h-8 w-8 border-2 border-white">
              <AvatarFallback className="bg-green-100 text-green-700 text-xs">T</AvatarFallback>
            </Avatar>
            <div className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-500">
              +2
            </div>
          </div>
          <Button variant="outline">Hoàn thành Sprint</Button>
        </div>
      </div>

      <ScrollArea className="flex-1 w-full pb-4">
        <div className="flex gap-4 h-full min-h-[500px]">
          {columns.map((col) => (
            <div key={col.id} className="flex-shrink-0 w-[300px] flex flex-col bg-slate-50/50 rounded-lg">
              <div className="p-3 flex items-center justify-between border-b border-slate-200/60">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-700">{col.title}</h3>
                  <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                    {col.count}
                  </span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-3 flex-1 flex flex-col gap-3">
                {mockTasks
                  .filter((task) => task.status === col.id)
                  .map((task) => (
                    <div 
                      key={task.id} 
                      className="bg-white p-3 rounded-md shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing hover:border-blue-300 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="text-xs font-normal text-slate-500 rounded-sm px-1.5 py-0">
                          {task.id}
                        </Badge>
                        <button className="text-slate-400 hover:text-slate-600">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <p className="font-medium text-sm text-slate-800 leading-snug mb-3">
                        {task.title}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <Badge variant={
                              task.priority === "Cao" ? "destructive" : 
                              task.priority === "Trung bình" ? "default" : "secondary"
                            } className="text-[10px] px-1.5 py-0">
                              {task.priority}
                            </Badge>
                           <div className="flex items-center justify-center h-5 w-5 rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600">
                            {task.points}
                          </div>
                        </div>
                        
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-medium">
                            {task.assignee}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
