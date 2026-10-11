"use client";

import React, { useState, useEffect } from "react";
import {
  MoreHorizontal,
  Plus,
  GripVertical,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Filter,
  User,
  ArrowUpDown,
  Bookmark,
  CheckSquare,
  Bug,
  Calendar,
  Layers,
  Flame,
  Check,
  ChevronDown,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProject } from "../project-context";
import { useAuth } from "@/lib/auth-context";
import { addStoredActivityLog } from "@/lib/activity-invitation-store";

export interface BoardTask {
  id: string;
  title: string;
  type: "STORY" | "TASK" | "BUG";
  epic?: string;
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
  priority: "Cao" | "Trung bình" | "Thấp";
  points: number;
  assignee: string; // Avatar initial: "QC", "VA", "TB"
  assigneeName: string;
}

const COLUMNS = [
  { id: "TODO", title: "Cần làm (To Do)", color: "border-slate-300 dark:border-slate-700", badgeColor: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  { id: "IN_PROGRESS", title: "Đang làm (In Progress)", color: "border-blue-400 dark:border-blue-700", badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
  { id: "REVIEW", title: "Đang duyệt (Review)", color: "border-amber-400 dark:border-amber-700", badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" },
  { id: "DONE", title: "Hoàn thành (Done)", color: "border-emerald-400 dark:border-emerald-700", badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" },
];

const INITIAL_TASKS: BoardTask[] = [
  {
    id: "FT-101",
    title: "Thiết kế Database Schema PostgreSQL với Prisma ORM",
    type: "TASK",
    epic: "Kiến trúc Backend",
    status: "TODO",
    priority: "Cao",
    points: 5,
    assignee: "QC",
    assigneeName: "Trịnh Quyết Chiến",
  },
  {
    id: "FT-102",
    title: "Xây dựng luồng Đăng nhập, JWT Refresh Token & Cookie",
    type: "STORY",
    epic: "Xác thực & Bảo mật",
    status: "TODO",
    priority: "Cao",
    points: 8,
    assignee: "VA",
    assigneeName: "Nguyễn Văn An",
  },
  {
    id: "FT-103",
    title: "Khởi tạo Next.js App Router và tích hợp Shadcn/ui Tailwind",
    type: "TASK",
    epic: "Giao diện Cốt lõi",
    status: "IN_PROGRESS",
    priority: "Cao",
    points: 3,
    assignee: "VA",
    assigneeName: "Nguyễn Văn An",
  },
  {
    id: "FT-104",
    title: "Lỗi vỡ layout khi đổi màn hình di động trên bảng Scrum",
    type: "BUG",
    epic: "Giao diện Cốt lõi",
    status: "IN_PROGRESS",
    priority: "Cao",
    points: 2,
    assignee: "TB",
    assigneeName: "Trần Thị Bình",
  },
  {
    id: "FT-105",
    title: "Tài liệu Swagger OpenAPI và hướng dẫn API Endpoints",
    type: "TASK",
    epic: "Kiến trúc Backend",
    status: "REVIEW",
    priority: "Thấp",
    points: 2,
    assignee: "TB",
    assigneeName: "Trần Thị Bình",
  },
  {
    id: "FT-106",
    title: "Thiết lập Docker Compose Multi-container (NestJS + Postgres)",
    type: "TASK",
    epic: "DevOps & CI/CD",
    status: "DONE",
    priority: "Cao",
    points: 5,
    assignee: "QC",
    assigneeName: "Trịnh Quyết Chiến",
  },
  {
    id: "FT-107",
    title: "Cấu hình RBAC Matrix phân quyền động theo nhóm vai trò",
    type: "STORY",
    epic: "Xác thực & Bảo mật",
    status: "DONE",
    priority: "Cao",
    points: 8,
    assignee: "QC",
    assigneeName: "Trịnh Quyết Chiến",
  },
];

export default function BoardPage() {
  const { project } = useProject();
  const { user } = useAuth();
  const projectId = project?.id || "ftodo-core";

  const [tasks, setTasks] = useState<BoardTask[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`ftodo_board_tasks_${projectId}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return INITIAL_TASKS;
  });

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("ALL");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterAssignee, setFilterAssignee] = useState<string>("ALL");
  const [onlyMyTasks, setOnlyMyTasks] = useState<boolean>(false);

  // New task dialog
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskType, setNewTaskType] = useState<BoardTask["type"]>("STORY");
  const [newTaskEpic, setNewTaskEpic] = useState("Xác thực & Bảo mật");
  const [newTaskStatus, setNewTaskStatus] = useState<BoardTask["status"]>("TODO");
  const [newTaskPriority, setNewTaskPriority] = useState<BoardTask["priority"]>("Trung bình");
  const [newTaskPoints, setNewTaskPoints] = useState<number>(3);
  const [newTaskAssignee, setNewTaskAssignee] = useState<string>("VA");

  const saveTasks = (newTasks: BoardTask[]) => {
    setTasks(newTasks);
    if (typeof window !== "undefined") {
      localStorage.setItem(`ftodo_board_tasks_${projectId}`, JSON.stringify(newTasks));
    }
  };

  const moveTask = (taskId: string, targetStatus: string) => {
    const targetCol = COLUMNS.find((c) => c.id === targetStatus);
    const existingTask = tasks.find((t) => t.id === taskId);
    if (!existingTask || existingTask.status === targetStatus) return;

    const updated = tasks.map((t) =>
      t.id === taskId ? { ...t, status: targetStatus as any } : t
    );
    saveTasks(updated);

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    addStoredActivityLog(projectId, {
      userName: user?.name || "Người dùng",
      userAvatar: user?.avatar || "US",
      userRole: user?.role === "owner" ? "Chủ dự án" : "Thành viên",
      category: "task",
      action: `đã chuyển công việc ${existingTask.id} sang "${targetCol?.title.split(" (")[0] || targetStatus}"`,
      detail: `Cập nhật trạng thái của "${existingTask.title}" lúc ${timeStr}.`,
      timestamp: `${timeStr} - Hôm nay`,
      timeAgo: "Vừa xong",
    });
  };

  const handleDeleteTask = (taskToDelete: BoardTask) => {
    if (!confirm(`Bạn có chắc muốn xóa công việc "${taskToDelete.id} - ${taskToDelete.title}"?`)) {
      return;
    }
    const updated = tasks.filter((t) => t.id !== taskToDelete.id);
    saveTasks(updated);

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    addStoredActivityLog(projectId, {
      userName: user?.name || "Người dùng",
      userAvatar: user?.avatar || "US",
      userRole: user?.role === "owner" ? "Chủ dự án" : "Thành viên",
      category: "task",
      action: `đã xóa công việc ${taskToDelete.id} (${taskToDelete.title})`,
      detail: `Đã loại bỏ Story Points: ${taskToDelete.points} SP khỏi Sprint lúc ${timeStr}.`,
      timestamp: `${timeStr} - Hôm nay`,
      timeAgo: "Vừa xong",
    });
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverColumn !== colId) {
      setDragOverColumn(colId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain") || draggedTaskId;
    setDragOverColumn(null);
    setDraggedTaskId(null);
    if (!taskId) return;
    moveTask(taskId, targetStatus);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const assigneeNames: Record<string, string> = {
      QC: "Trịnh Quyết Chiến",
      VA: "Nguyễn Văn An",
      TB: "Trần Thị Bình",
    };

    const newTask: BoardTask = {
      id: `FT-${tasks.length + 108}`,
      title: newTaskTitle.trim(),
      type: newTaskType,
      epic: newTaskEpic,
      status: newTaskStatus,
      priority: newTaskPriority,
      points: Number(newTaskPoints) || 1,
      assignee: newTaskAssignee,
      assigneeName: assigneeNames[newTaskAssignee] || "Thành viên",
    };

    saveTasks([...tasks, newTask]);

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    addStoredActivityLog(projectId, {
      userName: user?.name || "Người dùng",
      userAvatar: user?.avatar || "US",
      userRole: user?.role === "owner" ? "Chủ dự án" : "Thành viên",
      category: "task",
      action: `đã tạo công việc mới ${newTask.id} (${newTask.title})`,
      detail: `Loại: ${newTask.type}, Ước tính: ${newTask.points} SP, Người nhận: ${newTask.assigneeName} lúc ${timeStr}.`,
      timestamp: `${timeStr} - Hôm nay`,
      timeAgo: "Vừa xong",
    });

    setNewTaskTitle("");
    setIsAddTaskOpen(false);
  };

  // User initials for "Only My Tasks"
  const currentUserInitial = user?.avatar || (user?.name?.includes("Chiến") ? "QC" : user?.name?.includes("An") ? "VA" : "TB");

  // Filtering
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.epic && t.epic.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPriority = filterPriority === "ALL" || t.priority === filterPriority;
    const matchesType = filterType === "ALL" || t.type === filterType;
    const matchesAssignee = filterAssignee === "ALL" || t.assignee === filterAssignee;
    const matchesMyTasks = !onlyMyTasks || t.assignee === currentUserInitial;

    return matchesSearch && matchesPriority && matchesType && matchesAssignee && matchesMyTasks;
  });

  const totalPoints = tasks.reduce((acc, t) => acc + (t.points || 0), 0);
  const donePoints = tasks
    .filter((t) => t.status === "DONE")
    .reduce((acc, t) => acc + (t.points || 0), 0);
  const completionRate = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;

  return (
    <div className="space-y-4 pb-8 flex flex-col min-h-[calc(100vh-13rem)] select-none">
      {/* 1. SPRINT GOAL & PROGRESS HEADER */}
      <Card className="border bg-gradient-to-r from-slate-50 to-indigo-50/20 dark:from-slate-900/50 dark:to-indigo-950/20 shadow-2xs">
        <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-foreground tracking-tight flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-orange-500 shrink-0" />
                Sprint 1: Xây dựng Nền tảng & Xác thực người dùng
              </span>
              <Badge className="bg-emerald-600 hover:bg-emerald-700 text-[10px]">
                Active Sprint
              </Badge>
              <Badge variant="outline" className="text-[10px] text-muted-foreground font-mono">
                01/10 - 15/10/2026 (Còn 4 ngày)
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              <strong>Mục tiêu Sprint (Sprint Goal):</strong> Hoàn thành module xác thực JWT, RBAC phân quyền và bảng Scrum kéo thả tương tác thời gian thực.
            </p>
          </div>

          {/* Velocity & Story Points Progress */}
          <div className="flex items-center gap-4 shrink-0 bg-background/80 p-2.5 rounded-xl border">
            <div className="text-right">
              <div className="text-xs font-semibold text-foreground">
                Tiến độ: <span className="text-primary font-bold">{donePoints}</span> / {totalPoints} Story Points
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                Đạt {completionRate}% khối lượng Sprint
              </div>
            </div>
            <div className="w-24">
              <Progress value={completionRate} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. TOOLBAR & AGILE QUICK FILTERS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        {/* Quick Filter Pill: "Only My Tasks" & Assignee */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 1-Click: "My Tasks" Button */}
          <Button
            size="sm"
            variant={onlyMyTasks ? "default" : "outline"}
            onClick={() => setOnlyMyTasks(!onlyMyTasks)}
            className={`text-xs h-8 gap-1.5 rounded-lg ${
              onlyMyTasks
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="h-3.5 w-3.5" />
            Việc của tôi {onlyMyTasks && <Check className="h-3 w-3 ml-0.5" />}
          </Button>

          {/* Filter Assignee */}
          <Select value={filterAssignee} onValueChange={(val) => setFilterAssignee(val || "ALL")}>
            <SelectTrigger className="text-xs h-8 w-36">
              <SelectValue placeholder="Người làm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả thành viên</SelectItem>
              <SelectItem value="QC">Trịnh Quyết Chiến (QC)</SelectItem>
              <SelectItem value="VA">Nguyễn Văn An (VA)</SelectItem>
              <SelectItem value="TB">Trần Thị Bình (TB)</SelectItem>
            </SelectContent>
          </Select>

          {/* Filter Task Type (Story, Task, Bug) */}
          <Select value={filterType} onValueChange={(val) => setFilterType(val || "ALL")}>
            <SelectTrigger className="text-xs h-8 w-32">
              <SelectValue placeholder="Loại công việc" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả loại việc</SelectItem>
              <SelectItem value="STORY">📘 User Story</SelectItem>
              <SelectItem value="TASK">📋 Task kỹ thuật</SelectItem>
              <SelectItem value="BUG">🐞 Bug lỗi</SelectItem>
            </SelectContent>
          </Select>

          {/* Filter Priority */}
          <Select value={filterPriority} onValueChange={(val) => setFilterPriority(val || "ALL")}>
            <SelectTrigger className="text-xs h-8 w-32">
              <SelectValue placeholder="Độ ưu tiên" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả ưu tiên</SelectItem>
              <SelectItem value="Cao">Ưu tiên Cao</SelectItem>
              <SelectItem value="Trung bình">Trung bình</SelectItem>
              <SelectItem value="Thấp">Ưu tiên Thấp</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search & Add task button */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-44">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              placeholder="Tìm việc, mã, epic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs h-8 pl-8"
            />
          </div>

          <Button
            size="sm"
            onClick={() => {
              setNewTaskStatus("TODO");
              setIsAddTaskOpen(true);
            }}
            className="text-xs h-8 gap-1.5 shadow-xs shrink-0"
          >
            <Plus className="h-3.5 w-3.5" /> Tạo công việc
          </Button>
        </div>
      </div>

      {/* 3. KANBAN BOARD COLUMNS CONTAINER */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);
          const colPoints = colTasks.reduce((sum, t) => sum + (t.points || 0), 0);
          const isOver = dragOverColumn === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`flex flex-col rounded-xl border bg-slate-50/70 dark:bg-slate-900/40 p-3 transition-all ${
                isOver
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-md"
                  : "border-border shadow-2xs"
              }`}
            >
              {/* Column Header: Shows task count AND Story Points */}
              <div className="flex items-center justify-between pb-3 mb-2 border-b">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-foreground tracking-tight">
                    {col.title}
                  </span>
                  <Badge variant="secondary" className={`text-[10px] font-mono px-1.5 py-0 h-4 ${col.badgeColor}`}>
                    {colTasks.length} việc • {colPoints} SP
                  </Badge>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setNewTaskStatus(col.id as any);
                    setIsAddTaskOpen(true);
                  }}
                  title="Thêm công việc vào cột này"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Tasks List / Drop Zone */}
              <div className="flex-1 space-y-2.5 min-h-[320px]">
                {colTasks.map((task) => {
                  const isBeingDragged = draggedTaskId === task.id;

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      className={`p-3 rounded-xl border bg-card shadow-2xs cursor-grab active:cursor-grabbing transition-all hover:border-primary/50 hover:shadow-xs space-y-2.5 ${
                        isBeingDragged ? "opacity-40 scale-95 border-dashed border-primary" : ""
                      }`}
                    >
                      {/* Top: Type Icon, Task ID & Priority */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                          {task.type === "STORY" && (
                            <span title="User Story" className="text-blue-500">
                              <Bookmark className="h-3.5 w-3.5 fill-blue-500/20" />
                            </span>
                          )}
                          {task.type === "TASK" && (
                            <span title="Technical Task" className="text-emerald-500">
                              <CheckSquare className="h-3.5 w-3.5" />
                            </span>
                          )}
                          {task.type === "BUG" && (
                            <span title="Defect / Bug" className="text-rose-500">
                              <Bug className="h-3.5 w-3.5" />
                            </span>
                          )}
                          <span className="text-[10px] font-mono font-bold text-muted-foreground">
                            {task.id}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Badge
                            variant={
                              task.priority === "Cao"
                                ? "destructive"
                                : task.priority === "Trung bình"
                                ? "default"
                                : "secondary"
                            }
                            className="text-[9px] px-1 py-0 font-normal"
                          >
                            {task.priority}
                          </Badge>
                          <button
                            type="button"
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded text-muted-foreground/60 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTask(task);
                            }}
                            title="Xóa công việc khỏi Sprint"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Epic Badge */}
                      {task.epic && (
                        <div>
                          <Badge variant="outline" className="text-[9px] font-medium px-1.5 py-0 bg-muted/40 text-muted-foreground border-border">
                            {task.epic}
                          </Badge>
                        </div>
                      )}

                      {/* Task Title */}
                      <p className="text-xs font-semibold text-foreground leading-snug line-clamp-3">
                        {task.title}
                      </p>

                      {/* Card Footer: Story Points (Estimation) & Assignee */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/60">
                        {/* Story Points estimation */}
                        <div className="flex items-center gap-1" title="Khối lượng ước lượng (Story Points)">
                          <span className="h-5 px-1.5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                            {task.points} SP
                          </span>
                        </div>

                        {/* Assignee Avatar */}
                        <div className="flex items-center gap-1.5" title={task.assigneeName}>
                          <span className="text-[10px] text-muted-foreground hidden sm:inline truncate max-w-[80px]">
                            {task.assigneeName.split(" ").slice(-1)[0]}
                          </span>
                          <Avatar className="h-6 w-6 ring-1 ring-border">
                            <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                              {task.assignee}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {colTasks.length === 0 && (
                  <div className="h-32 border-2 border-dashed rounded-lg border-muted-foreground/20 flex flex-col items-center justify-center text-center p-3 text-muted-foreground text-[11px]">
                    <span>Kéo thả công việc vào đây</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. CREATE TASK MODAL */}
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo công việc Scrum mới</DialogTitle>
            <DialogDescription className="text-xs">
              Thêm User Story hoặc Task vào Sprint hiện tại của dự án.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTask} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="t-title" className="text-xs font-semibold">
                Tiêu đề công việc <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="t-title"
                placeholder="VD: Viết Unit Test cho Module Auth..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="text-xs h-9"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Loại công việc</Label>
                <Select
                  value={newTaskType}
                  onValueChange={(val: any) => setNewTaskType(val)}
                >
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STORY">📘 User Story</SelectItem>
                    <SelectItem value="TASK">📋 Task kỹ thuật</SelectItem>
                    <SelectItem value="BUG">🐞 Bug lỗi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Thuộc Epic / Module</Label>
                <Select
                  value={newTaskEpic}
                  onValueChange={(val) => setNewTaskEpic(val || "Xác thực & Bảo mật")}
                >
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Xác thực & Bảo mật">Xác thực & Bảo mật</SelectItem>
                    <SelectItem value="Giao diện Cốt lõi">Giao diện Cốt lõi</SelectItem>
                    <SelectItem value="Kiến trúc Backend">Kiến trúc Backend</SelectItem>
                    <SelectItem value="DevOps & CI/CD">DevOps & CI/CD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Trạng thái</Label>
                <Select
                  value={newTaskStatus}
                  onValueChange={(val: any) => setNewTaskStatus(val)}
                >
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODO">To Do</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="REVIEW">Review</SelectItem>
                    <SelectItem value="DONE">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Ưu tiên</Label>
                <Select
                  value={newTaskPriority}
                  onValueChange={(val: any) => setNewTaskPriority(val)}
                >
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cao">Cao</SelectItem>
                    <SelectItem value="Trung bình">Trung bình</SelectItem>
                    <SelectItem value="Thấp">Thấp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Story Points</Label>
                <Select
                  value={String(newTaskPoints)}
                  onValueChange={(val) => setNewTaskPoints(Number(val) || 3)}
                >
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 SP (Rất dễ)</SelectItem>
                    <SelectItem value="2">2 SP (Dễ)</SelectItem>
                    <SelectItem value="3">3 SP (Vừa)</SelectItem>
                    <SelectItem value="5">5 SP (Phức tạp)</SelectItem>
                    <SelectItem value="8">8 SP (Khó)</SelectItem>
                    <SelectItem value="13">13 SP (Cần chia nhỏ)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Người phụ trách</Label>
              <Select
                value={newTaskAssignee}
                onValueChange={(val) => setNewTaskAssignee(val || "VA")}
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="QC">Trịnh Quyết Chiến (Chủ dự án)</SelectItem>
                  <SelectItem value="VA">Nguyễn Văn An (Senior DEV)</SelectItem>
                  <SelectItem value="TB">Trần Thị Bình (QA Lead)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2 border-t">
              <Button type="button" variant="outline" onClick={() => setIsAddTaskOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={!newTaskTitle.trim()}>
                Tạo công việc
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
