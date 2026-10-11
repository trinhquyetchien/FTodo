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
  ArrowUpDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface BoardTask {
  id: string;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
  priority: "Cao" | "Trung bình" | "Thấp";
  points: number;
  assignee: string;
  assigneeName: string;
}

const COLUMNS = [
  { id: "TODO", title: "Cần làm (To Do)", color: "border-slate-300 dark:border-slate-700" },
  { id: "IN_PROGRESS", title: "Đang làm (In Progress)", color: "border-blue-400 dark:border-blue-700" },
  { id: "REVIEW", title: "Đang duyệt (Review)", color: "border-amber-400 dark:border-amber-700" },
  { id: "DONE", title: "Hoàn thành (Done)", color: "border-emerald-400 dark:border-emerald-700" },
];

const INITIAL_TASKS: BoardTask[] = [
  {
    id: "TASK-1",
    title: "Thiết kế Database Schema PostgreSQL với Prisma",
    status: "TODO",
    priority: "Cao",
    points: 5,
    assignee: "QC",
    assigneeName: "Trịnh Quyết Chiến",
  },
  {
    id: "TASK-3",
    title: "Thiết kế giao diện Đăng nhập & Xác thực JWT",
    status: "TODO",
    priority: "Trung bình",
    points: 2,
    assignee: "VA",
    assigneeName: "Nguyễn Văn An",
  },
  {
    id: "TASK-2",
    title: "Khởi tạo Next.js Turbopack và cấu hình Tailwind",
    status: "IN_PROGRESS",
    priority: "Cao",
    points: 3,
    assignee: "VA",
    assigneeName: "Nguyễn Văn An",
  },
  {
    id: "TASK-4",
    title: "Viết tài liệu Swagger API & Sprint Backlog",
    status: "REVIEW",
    priority: "Thấp",
    points: 1,
    assignee: "TB",
    assigneeName: "Trần Thị Bình",
  },
  {
    id: "TASK-5",
    title: "Triển khai Container Docker & CI/CD pipeline",
    status: "DONE",
    priority: "Cao",
    points: 2,
    assignee: "QC",
    assigneeName: "Trịnh Quyết Chiến",
  },
  {
    id: "TASK-6",
    title: "Kiểm thử API Chi phí và bảo mật quyền hạn",
    status: "TODO",
    priority: "Trung bình",
    points: 3,
    assignee: "TB",
    assigneeName: "Trần Thị Bình",
  },
];

export default function BoardPage() {
  const { project, isOwner } = useProject();
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
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("ALL");

  // New task dialog
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskStatus, setNewTaskStatus] = useState<"TODO" | "IN_PROGRESS" | "REVIEW" | "DONE">("TODO");
  const [newTaskPriority, setNewTaskPriority] = useState<"Cao" | "Trung bình" | "Thấp">("Trung bình");
  const [newTaskPoints, setNewTaskPoints] = useState<number>(3);
  const [newTaskAssignee, setNewTaskAssignee] = useState<string>("VA");

  const saveTasks = (newTasks: BoardTask[]) => {
    setTasks(newTasks);
    if (typeof window !== "undefined") {
      localStorage.setItem(`ftodo_board_tasks_${projectId}`, JSON.stringify(newTasks));
    }
  };

  const moveTask = (taskId: string, targetStatus: string) => {
    const updated = tasks.map((t) =>
      t.id === taskId ? { ...t, status: targetStatus as any } : t
    );
    saveTasks(updated);
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
    // Only reset if leaving the column boundary
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
      id: `TASK-${tasks.length + 10}`,
      title: newTaskTitle.trim(),
      status: newTaskStatus,
      priority: newTaskPriority,
      points: Number(newTaskPoints) || 1,
      assignee: newTaskAssignee,
      assigneeName: assigneeNames[newTaskAssignee] || "Thành viên",
    };

    saveTasks([...tasks, newTask]);
    setNewTaskTitle("");
    setIsAddTaskOpen(false);
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === "ALL" || t.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const totalPoints = tasks.reduce((acc, t) => acc + (t.points || 0), 0);
  const donePoints = tasks
    .filter((t) => t.status === "DONE")
    .reduce((acc, t) => acc + (t.points || 0), 0);

  return (
    <div className="space-y-4 pb-8 flex flex-col min-h-[calc(100vh-13rem)] select-none">
      {/* Top Sprint Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Bảng Scrum Sprint 1: Khởi động dự án
            </h2>
            <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/30">
              Đang diễn ra (Active)
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Kéo thả các thẻ công việc giữa các cột để cập nhật tiến độ Sprint •{" "}
            <span className="font-semibold text-foreground">{donePoints} / {totalPoints} Story Points hoàn thành</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Search task */}
          <div className="relative flex-1 sm:w-48">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              placeholder="Tìm công việc..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs h-8 pl-8"
            />
          </div>

          {/* Filter Priority */}
          <Select value={filterPriority} onValueChange={(val) => setFilterPriority(val || "ALL")}>
            <SelectTrigger className="text-xs h-8 w-28">
              <SelectValue placeholder="Độ ưu tiên" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả ưu tiên</SelectItem>
              <SelectItem value="Cao">Ưu tiên Cao</SelectItem>
              <SelectItem value="Trung bình">Trung bình</SelectItem>
              <SelectItem value="Thấp">Ưu tiên Thấp</SelectItem>
            </SelectContent>
          </Select>

          {/* Add task button */}
          <Button
            size="sm"
            onClick={() => {
              setNewTaskStatus("TODO");
              setIsAddTaskOpen(true);
            }}
            className="text-xs h-8 gap-1.5 shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" /> Tạo công việc
          </Button>
        </div>
      </div>

      {/* Kanban Board Columns Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);
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
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-2 border-b">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-foreground tracking-tight">
                    {col.title}
                  </span>
                  <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0 h-4">
                    {colTasks.length}
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
                      className={`p-3 rounded-lg border bg-card shadow-2xs cursor-grab active:cursor-grabbing transition-all hover:border-primary/50 hover:shadow-xs ${
                        isBeingDragged ? "opacity-40 scale-95 border-dashed border-primary" : ""
                      }`}
                    >
                      {/* Task ID & Grip */}
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                          <Badge variant="outline" className="text-[10px] font-mono px-1 py-0">
                            {task.id}
                          </Badge>
                        </div>
                        <Badge
                          variant={
                            task.priority === "Cao"
                              ? "destructive"
                              : task.priority === "Trung bình"
                              ? "default"
                              : "secondary"
                          }
                          className="text-[9px] px-1 py-0"
                        >
                          {task.priority}
                        </Badge>
                      </div>

                      {/* Task Title */}
                      <p className="text-xs font-semibold text-foreground leading-snug line-clamp-3 mb-3">
                        {task.title}
                      </p>

                      {/* Card Footer: Points & Assignee */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/60">
                        <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                          <span className="h-4 w-4 rounded-full bg-muted flex items-center justify-center font-bold text-foreground">
                            {task.points}
                          </span>
                          <span>pts</span>
                        </div>

                        <div className="flex items-center gap-1.5" title={task.assigneeName}>
                          <span className="text-[10px] text-muted-foreground hidden sm:inline truncate max-w-[80px]">
                            {task.assigneeName.split(" ").slice(-1)[0]}
                          </span>
                          <Avatar className="h-5 w-5 ring-1 ring-border">
                            <AvatarFallback className="text-[9px] font-bold bg-primary/10 text-primary">
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

      {/* Create Task Modal */}
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
                className="text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Cột trạng thái</Label>
                <Select
                  value={newTaskStatus}
                  onValueChange={(val: any) => setNewTaskStatus(val)}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODO">Cần làm (To Do)</SelectItem>
                    <SelectItem value="IN_PROGRESS">Đang làm (In Progress)</SelectItem>
                    <SelectItem value="REVIEW">Đang duyệt (Review)</SelectItem>
                    <SelectItem value="DONE">Hoàn thành (Done)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Độ ưu tiên</Label>
                <Select
                  value={newTaskPriority}
                  onValueChange={(val: any) => setNewTaskPriority(val)}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cao">Cao</SelectItem>
                    <SelectItem value="Trung bình">Trung bình</SelectItem>
                    <SelectItem value="Thấp">Thấp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="t-pts" className="text-xs">Story Points</Label>
                <Input
                  id="t-pts"
                  type="number"
                  min={1}
                  max={21}
                  value={newTaskPoints}
                  onChange={(e) => setNewTaskPoints(Number(e.target.value))}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Người phụ trách</Label>
                <Select
                  value={newTaskAssignee}
                  onValueChange={(val) => setNewTaskAssignee(val || "VA")}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="QC">Trịnh Quyết Chiến (Chủ dự án)</SelectItem>
                    <SelectItem value="VA">Nguyễn Văn An (DEV)</SelectItem>
                    <SelectItem value="TB">Trần Thị Bình (QA)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddTaskOpen(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={!newTaskTitle.trim()}>
                Lưu công việc
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
