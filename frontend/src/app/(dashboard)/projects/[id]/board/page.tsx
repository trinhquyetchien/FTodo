"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
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
import { api } from "@/lib/api";

export interface BoardTask {
  id: string;
  backendId?: string;
  title: string;
  type: "STORY" | "TASK" | "BUG";
  epic?: string;
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
  priority: "Cao" | "Trung bình" | "Thấp";
  points: number;
  assigneeId?: string;
  assignee: string; // Avatar initial: e.g. "QC", "VA", "US"
  assigneeName: string;
  sprintId?: string | null;
}

const COLUMNS = [
  { id: "TODO", title: "Cần làm", color: "border-slate-300 dark:border-slate-700", badgeColor: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  { id: "IN_PROGRESS", title: "Đang làm", color: "border-blue-400 dark:border-blue-700", badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
  { id: "REVIEW", title: "Đang duyệt", color: "border-amber-400 dark:border-amber-700", badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" },
  { id: "DONE", title: "Hoàn thành", color: "border-emerald-400 dark:border-emerald-700", badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" },
];

export default function BoardPage() {
  const { project } = useProject();
  const { user } = useAuth();
  const projectId = project?.id || "";

  const [tasks, setTasks] = useState<BoardTask[]>([]);
  const [members, setMembers] = useState<Array<{ id: string; name: string; email: string; avatar?: string }>>([]);
  const [activeSprint, setActiveSprint] = useState<any>(null);
  const [allSprints, setAllSprints] = useState<any[]>([]);
  const [selectedSprintId, setSelectedSprintId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // New task dialog
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskType, setNewTaskType] = useState<BoardTask["type"]>("STORY");
  const [newTaskEpic, setNewTaskEpic] = useState("Xác thực & Bảo mật");
  const [newTaskStatus, setNewTaskStatus] = useState<BoardTask["status"]>("TODO");
  const [newTaskPriority, setNewTaskPriority] = useState<BoardTask["priority"]>("Trung bình");
  const [newTaskPoints, setNewTaskPoints] = useState<number>(3);
  const [newTaskAssignee, setNewTaskAssignee] = useState<string>("");

  // Load project members and sprints from PostgreSQL
  useEffect(() => {
    let isMounted = true;
    if (!projectId) return;

    const loadMeta = async () => {
      try {
        const [membersRes, sprintsRes] = await Promise.allSettled([
          api.members.getMembers(projectId),
          api.sprints.getSprints(projectId),
        ]);

        if (isMounted && membersRes.status === "fulfilled" && Array.isArray(membersRes.value)) {
          const list: Array<{ id: string; name: string; email: string; avatar?: string }> = membersRes.value.map((m: any) => ({
            id: m.userId || m.id,
            name: m.name || m.user?.name || "Thành viên",
            email: m.email || m.user?.email || "",
            avatar: m.avatar || m.user?.avatar,
          }));

          // Include owner if not in list
          const owner = project?.owner;
          if (owner && !list.some((item) => item.id === owner.id)) {
            list.unshift({
              id: owner.id,
              name: owner.name,
              email: owner.email,
              avatar: owner.avatar,
            });
          }
          setMembers(list);
          if (list.length > 0 && !newTaskAssignee) {
            setNewTaskAssignee(user?.id || list[0].id);
          }
        }

        if (isMounted && sprintsRes.status === "fulfilled" && Array.isArray(sprintsRes.value) && sprintsRes.value.length > 0) {
          setAllSprints(sprintsRes.value);
          const active = sprintsRes.value.find((s: any) => s.status === "ACTIVE") || sprintsRes.value[0];
          setActiveSprint(active);

          const urlSprintId = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("sprintId") : null;
          if (urlSprintId && sprintsRes.value.some((s: any) => s.id === urlSprintId)) {
            setSelectedSprintId(urlSprintId);
          } else {
            setSelectedSprintId(active.id);
          }
        }
      } catch (err) {
        console.warn("Lỗi tải thông tin sprint/thành viên:", err);
      }
    };

    loadMeta();
    return () => {
      isMounted = false;
    };
  }, [projectId, project?.owner, user?.id]);

  const formatBackendTask = (t: any): BoardTask => {
    const prio = t.priority === "HIGH" ? "Cao" : t.priority === "LOW" ? "Thấp" : "Trung bình";
    const titleLower = (t.title || "").toLowerCase();
    let type: BoardTask["type"] = (t.type ? t.type.toUpperCase() : "TASK") as BoardTask["type"];
    if (!t.type) {
      if (titleLower.includes("lỗi") || titleLower.includes("bug")) {
        type = "BUG";
      } else if (titleLower.includes("xác thực") || titleLower.includes("jwt") || titleLower.includes("hệ thống") || (t.points && t.points >= 8)) {
        type = "STORY";
      }
    }

    let epic = t.epic || "Kiến trúc Cốt lõi";
    if (!t.epic) {
      if (titleLower.includes("jwt") || titleLower.includes("xác thực") || titleLower.includes("bảo mật") || titleLower.includes("rbac")) {
        epic = "Xác thực & Bảo mật";
      } else if (titleLower.includes("schema") || titleLower.includes("postgresql") || titleLower.includes("database") || titleLower.includes("docker") || titleLower.includes("backend")) {
        epic = "Kiến trúc Backend";
      } else if (titleLower.includes("chi phí") || titleLower.includes("ngân sách")) {
        epic = "Quản lý Tài chính";
      } else if (titleLower.includes("chat") || titleLower.includes("thời gian thực")) {
        epic = "Giao tiếp Đội ngũ";
      }
    }

    const assigneeName = t.assignee?.name || "Chưa phân công";
    const initials = t.assignee?.name
      ? t.assignee.name.split(" ").filter(Boolean).map((n: string) => n[0]).join("").slice(-2).toUpperCase()
      : "US";

    return {
      id: t.code || `FT-${t.id.slice(0, 4).toUpperCase()}`,
      backendId: t.id,
      title: t.title,
      type,
      epic,
      status: (t.status || "TODO") as BoardTask["status"],
      priority: prio as BoardTask["priority"],
      points: t.points || 1,
      assigneeId: t.assigneeId || t.assignee?.id,
      assignee: t.assignee?.avatar || initials,
      assigneeName,
      sprintId: t.sprintId || null,
    };
  };

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("ALL");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterAssignee, setFilterAssignee] = useState<string>("ALL");
  const [onlyMyTasks, setOnlyMyTasks] = useState<boolean>(false);

  // Optimistic protection against polling rollback & sync jitter
  const pendingStatusUpdatesRef = useRef<Map<string, { status: string; expiry: number }>>(new Map());
  const isDraggingRef = useRef(false);
  const isAddTaskOpenRef = useRef(false);
  const pausePollingUntilRef = useRef<number>(0);

  useEffect(() => {
    isAddTaskOpenRef.current = isAddTaskOpen;
  }, [isAddTaskOpen]);

  // Synchronize live tasks from PostgreSQL backend with Realtime Polling
  useEffect(() => {
    let isMounted = true;
    if (!project?.id) return;

    const loadBackendTasks = async (showLoading = false) => {
      // Do not sync while user is actively dragging or in the middle of a drop mutation
      if (isDraggingRef.current || isAddTaskOpenRef.current) return;
      if (Date.now() < pausePollingUntilRef.current) return;

      try {
        if (showLoading) setIsLoading(true);
        const data = await api.tasks.getTasks(project.id);
        if (isMounted && Array.isArray(data)) {
          const now = Date.now();
          const mapped: BoardTask[] = data.map((t: any) => {
            const formatted = formatBackendTask(t);
            // Apply optimistic protection if task was recently moved by user
            if (formatted.backendId) {
              const pending = pendingStatusUpdatesRef.current.get(formatted.backendId);
              if (pending) {
                if (now < pending.expiry && formatted.status !== pending.status) {
                  // Retain optimistic status until server catches up
                  formatted.status = pending.status as any;
                } else {
                  pendingStatusUpdatesRef.current.delete(formatted.backendId);
                }
              }
            }
            return formatted;
          });

          setTasks((prev) => {
            const prevSignature = prev.map((p) => `${p.backendId}:${p.status}:${p.title}`).join("|");
            const nextSignature = mapped.map((m) => `${m.backendId}:${m.status}:${m.title}`).join("|");
            if (prevSignature !== nextSignature || prev.length !== mapped.length) {
              return mapped;
            }
            return prev;
          });
        }
      } catch (err) {
        console.error("Lỗi khi tải task từ PostgreSQL:", err);
      } finally {
        if (isMounted && showLoading) setIsLoading(false);
      }
    };

    loadBackendTasks(true);

    // Live sync polling every 4s (smooth, low overhead, protected by optimistic reconciliation)
    const pollInterval = setInterval(() => {
      loadBackendTasks(false);
    }, 4000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [project?.id]);

  const saveTasks = (newTasks: BoardTask[]) => {
    setTasks(newTasks);
    if (typeof window !== "undefined") {
      localStorage.setItem(`ftodo_board_tasks_${projectId}`, JSON.stringify(newTasks));
    }
  };

  const moveTask = async (taskId: string, targetStatus: string) => {
    if (isViewingCompletedSprint) {
      alert("Sprint này đã hoàn thành và lưu trữ, không thể chỉnh sửa trạng thái công việc.");
      return;
    }
    const targetCol = COLUMNS.find((c) => c.id === targetStatus);
    const existingTask = tasks.find((t) => t.id === taskId);
    if (!existingTask || existingTask.status === targetStatus) return;

    const targetBackendId = existingTask.backendId || (existingTask.id.includes("-") ? undefined : existingTask.id);

    // 1. Immediately protect this task from server polling rollback for 6 seconds
    if (targetBackendId) {
      pendingStatusUpdatesRef.current.set(targetBackendId, {
        status: targetStatus,
        expiry: Date.now() + 6000,
      });
    }

    // 2. Pause background polling for 2.5s so PostgreSQL has time to commit
    pausePollingUntilRef.current = Date.now() + 2500;

    // 3. Instant local optimistic update
    const updated = tasks.map((t) =>
      t.id === taskId ? { ...t, status: targetStatus as any } : t
    );
    saveTasks(updated);

    // 4. Call backend API to persist status change
    if (targetBackendId && project?.id) {
      try {
        await api.tasks.updateTaskStatus(project.id, targetBackendId, targetStatus);
      } catch (err) {
        console.warn("Lỗi khi lưu trạng thái task lên server:", err);
      }
    }

    if (existingTask && projectId) {
      api.activities.create(projectId, {
        category: "task",
        action: `đã chuyển công việc ${existingTask.id} sang "${targetCol?.title.split(" (")[0] || targetStatus}"`,
        detail: `Cập nhật trạng thái của "${existingTask.title}".`,
      }).catch(() => {});
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("ftodo_activity_updated"));
      }
    }
  };

  const handleDeleteTask = async (taskToDelete: BoardTask) => {
    if (!confirm(`Bạn có chắc muốn xóa công việc "${taskToDelete.id} - ${taskToDelete.title}"?`)) {
      return;
    }
    const updated = tasks.filter((t) => t.id !== taskToDelete.id);
    saveTasks(updated);

    const targetBackendId = taskToDelete.backendId;
    if (targetBackendId && project?.id) {
      try {
        await api.tasks.deleteTask(project.id, targetBackendId);
      } catch (err) {
        console.warn("Lỗi khi xóa task từ backend:", err);
      }
    }

    if (projectId) {
      api.activities.create(projectId, {
        category: "task",
        action: `đã xóa công việc ${taskToDelete.id} (${taskToDelete.title})`,
        detail: `Đã loại bỏ Story Points: ${taskToDelete.points} SP khỏi Sprint.`,
      }).catch(() => {});
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("ftodo_activity_updated"));
      }
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    isDraggingRef.current = true;
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
    isDraggingRef.current = false;
    setDragOverColumn(null);
    setDraggedTaskId(null);
    if (!taskId) return;
    moveTask(taskId, targetStatus);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const targetMember = members.find((m) => m.id === newTaskAssignee);
    const backendPrio = newTaskPriority === "Cao" ? "HIGH" : newTaskPriority === "Thấp" ? "LOW" : "MEDIUM";
    let createdBackendId: string | undefined;
    let createdCode = `FT-${tasks.length + 108}`;

    if (project?.id) {
      try {
        const res = await api.tasks.createTask(project.id, {
          title: newTaskTitle.trim(),
          type: newTaskType,
          epic: newTaskEpic,
          status: newTaskStatus,
          priority: backendPrio,
          points: Number(newTaskPoints) || 1,
          assigneeId: newTaskAssignee || undefined,
          sprintId: (currentSprint?.status === "ACTIVE" ? currentSprint?.id : activeSprint?.id) || undefined,
        });
        if (res?.id) {
          createdBackendId = res.id;
          if (res.code) createdCode = res.code;
        }
      } catch (err) {
        console.warn("Lỗi khi tạo task lên backend, lưu cục bộ:", err);
      }
    }

    const assigneeInitial = targetMember?.name
      ? targetMember.name.split(" ").filter(Boolean).map((n: string) => n[0]).join("").slice(-2).toUpperCase()
      : (user?.avatar || "US");

    const newTask: BoardTask = {
      id: createdCode,
      backendId: createdBackendId,
      title: newTaskTitle.trim(),
      type: newTaskType,
      epic: newTaskEpic,
      status: newTaskStatus,
      priority: newTaskPriority,
      points: Number(newTaskPoints) || 1,
      assigneeId: newTaskAssignee || undefined,
      assignee: targetMember?.avatar || assigneeInitial,
      assigneeName: targetMember?.name || user?.name || "Thành viên",
    };

    saveTasks([...tasks, newTask]);

    if (projectId) {
      api.activities.create(projectId, {
        category: "task",
        action: `đã tạo công việc mới ${newTask.id} (${newTask.title})`,
        detail: `Loại: ${newTask.type}, Ước tính: ${newTask.points} SP, Người nhận: ${newTask.assigneeName}.`,
      }).catch(() => {});
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("ftodo_activity_updated"));
      }
    }

    setNewTaskTitle("");
    setIsAddTaskOpen(false);
  };

  const currentSprint = useMemo(() => {
    return allSprints.find((s) => s.id === selectedSprintId) || activeSprint;
  }, [allSprints, selectedSprintId, activeSprint]);

  const isViewingCompletedSprint = currentSprint?.status === "COMPLETED";

  // Filtering: Only show tasks of the selected sprint on the Scrum Board
  const filteredTasks = tasks.filter((t) => {
    // If a sprint is selected, only show its tasks; exclude backlog & other sprints
    if (currentSprint?.id) {
      if (t.sprintId !== currentSprint.id) return false;
    } else {
      // If no sprint exists, exclude backlog items
      if (!t.sprintId) return false;
    }

    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.epic && t.epic.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPriority = filterPriority === "ALL" || t.priority === filterPriority;
    const matchesType = filterType === "ALL" || t.type === filterType;
    const matchesAssignee = filterAssignee === "ALL" || t.assigneeId === filterAssignee;
    const matchesMyTasks = !onlyMyTasks || (user?.id && t.assigneeId === user.id);

    return matchesSearch && matchesPriority && matchesType && matchesAssignee && matchesMyTasks;
  });

  const sprintTasks = useMemo(() => {
    if (!currentSprint?.id) return [];
    return tasks.filter((t) => t.sprintId === currentSprint.id);
  }, [tasks, currentSprint?.id]);

  const totalPoints = sprintTasks.reduce((acc, t) => acc + (t.points || 0), 0);
  const donePoints = sprintTasks
    .filter((t) => t.status === "DONE")
    .reduce((acc, t) => acc + (t.points || 0), 0);
  const completionRate = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;

  // Real sprint date calculation
  const sprintStartDate = currentSprint?.startDate ? new Date(currentSprint.startDate).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }) : null;
  const sprintEndDate = currentSprint?.endDate ? new Date(currentSprint.endDate).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }) : null;
  const sprintDaysLeft = useMemo(() => {
    if (!currentSprint?.endDate || currentSprint?.status === "COMPLETED") return null;
    return Math.max(0, Math.ceil((new Date(currentSprint.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  }, [currentSprint?.endDate, currentSprint?.status]);

  return (
    <div className="space-y-4 pb-8 flex flex-col min-h-[calc(100vh-13rem)] select-none">
      {/* 1. SPRINT GOAL & PROGRESS HEADER */}
      <Card className="border bg-gradient-to-r from-slate-50 to-indigo-50/20 dark:from-slate-900/50 dark:to-indigo-950/20 shadow-2xs">
        <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              {allSprints.length > 1 ? (
                <div className="flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-orange-500 shrink-0" />
                  <Select value={selectedSprintId || currentSprint?.id} onValueChange={(val) => setSelectedSprintId(val)}>
                    <SelectTrigger className="h-8 text-xs font-bold bg-background w-auto min-w-[160px]">
                      <SelectValue placeholder="Chọn Sprint" />
                    </SelectTrigger>
                    <SelectContent>
                      {allSprints.map((s) => (
                        <SelectItem key={s.id} value={s.id} className="text-xs">
                          {s.name} {s.status === "ACTIVE" ? "⚡ (Đang chạy)" : s.status === "COMPLETED" ? "✓ (Đã hoàn thành)" : "⏳ (Kế hoạch)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <span className="font-extrabold text-base text-foreground tracking-tight flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-orange-500 shrink-0" />
                  {currentSprint ? currentSprint.name : "Chưa có Sprint kích hoạt"}
                </span>
              )}

              {currentSprint && (
                <Badge
                  className={`text-[10px] ${
                    currentSprint.status === "ACTIVE"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : currentSprint.status === "COMPLETED"
                      ? "bg-slate-600 hover:bg-slate-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {currentSprint.status === "ACTIVE"
                    ? "Active Sprint"
                    : currentSprint.status === "COMPLETED"
                    ? "Đã hoàn thành"
                    : "Lên kế hoạch"}
                </Badge>
              )}
              {currentSprint?.status === "ACTIVE" && (
                <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center gap-1 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Realtime Live Sync
                </Badge>
              )}
              {sprintStartDate && sprintEndDate && (
                <Badge variant="outline" className="text-[10px] text-muted-foreground font-mono">
                  {sprintStartDate} - {sprintEndDate} {sprintDaysLeft !== null ? `• Còn ${sprintDaysLeft} ngày` : ""}
                </Badge>
              )}
            </div>
            {currentSprint?.goal ? (
              <p className="text-xs text-muted-foreground">
                <strong>Mục tiêu Sprint:</strong> {currentSprint.goal}
              </p>
            ) : !currentSprint ? (
              <p className="text-xs text-muted-foreground">
                Hãy tạo hoặc kích hoạt Sprint trong Backlog để theo dõi các đầu việc trên bảng Scrum.
              </p>
            ) : null}
          </div>

          {/* Velocity & Story Points Progress & Sprint Action */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <div className="flex items-center gap-4 bg-background/80 p-2.5 rounded-xl border">
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
          </div>
        </CardContent>
      </Card>

      {/* ARCHIVE NOTICE BANNER IF VIEWING COMPLETED SPRINT */}
      {isViewingCompletedSprint && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              Bạn đang xem lại dữ liệu lưu trữ của <strong>{currentSprint.name}</strong> (Sprint đã hoàn thành). Dữ liệu được bảo toàn để tra cứu lịch sử.
            </span>
          </div>
          {activeSprint && activeSprint.id !== currentSprint.id && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedSprintId(activeSprint.id)}
              className="h-7 text-xs bg-background shrink-0 font-medium"
            >
              Quay lại {activeSprint.name} (Đang chạy)
            </Button>
          )}
        </div>
      )}

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
            <SelectTrigger className="text-xs h-8 w-44">
              <SelectValue placeholder="Người làm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả thành viên</SelectItem>
              {members.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
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

      {/* 3. KANBAN BOARD COLUMNS CONTAINER (Swipeable on mobile/tablet, 4-col grid on desktop) */}
      <div className="flex overflow-x-auto pb-4 gap-4 snap-x snap-mandatory lg:grid lg:grid-cols-4 lg:overflow-x-visible flex-1 -mx-1 px-1">
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
              className={`flex flex-col rounded-xl border bg-slate-50/70 dark:bg-slate-900/40 p-3 transition-all w-[85vw] sm:w-[320px] lg:w-auto shrink-0 snap-start ${
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
                      onDragEnd={() => {
                        isDraggingRef.current = false;
                        setDraggedTaskId(null);
                        setDragOverColumn(null);
                      }}
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
                onValueChange={(val) => setNewTaskAssignee(val || "")}
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue placeholder="Chọn thành viên phụ trách" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name} ({m.email})
                    </SelectItem>
                  ))}
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
