"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Layers,
  Calendar,
  ChevronRight,
  ChevronDown,
  Bookmark,
  CheckSquare,
  Bug,
  MoreHorizontal,
  Sparkles,
  ArrowUpRight,
  MoveDown,
  MoveUp,
  Play,
  CheckCircle2,
  Clock,
  Flame,
  Filter,
  Check,
  User,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Label } from "@/components/ui/label";
import { useProject } from "../project-context";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

export interface BacklogItem {
  id: string;
  backendId?: string;
  title: string;
  type: "STORY" | "TASK" | "BUG";
  epicId: string;
  epicName: string;
  sprint: "SPRINT_1" | "BACKLOG";
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
  priority: "Cao" | "Trung bình" | "Thấp";
  points: number;
  assigneeId?: string;
  assignee: string;
  assigneeName: string;
}

export interface WbsEpic {
  id: string;
  name: string;
  color: string;
  description: string;
}

const DEFAULT_EPICS: WbsEpic[] = [];

export default function BacklogPage() {
  const { project, isOwner } = useProject();
  const { user } = useAuth();
  const projectId = project?.id || "";

  const [items, setItems] = useState<BacklogItem[]>([]);
  const [members, setMembers] = useState<Array<{ id: string; name: string; email: string; avatar?: string }>>([]);
  const [activeSprint, setActiveSprint] = useState<any>(null);
  const [activeSprintId, setActiveSprintId] = useState<string | null>(null);

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<BacklogItem["type"]>("STORY");
  const [newEpicId, setNewEpicId] = useState("epic-auth");
  const [newSprint, setNewSprint] = useState<BacklogItem["sprint"]>("SPRINT_1");
  const [newPoints, setNewPoints] = useState<number>(3);
  const [newPriority, setNewPriority] = useState<BacklogItem["priority"]>("Trung bình");
  const [newAssignee, setNewAssignee] = useState<string>("");

  const availableEpics: WbsEpic[] = useMemo(() => {
    const list: WbsEpic[] = [];
    items.forEach((item) => {
      if (item.epicName && item.epicName !== "Chung" && !list.some((e) => e.name === item.epicName)) {
        list.push({
          id: item.epicId || item.epicName,
          name: item.epicName,
          color: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300",
          description: "",
        });
      }
    });
    return list;
  }, [items]);

  // Sync live tasks, sprints, and members from PostgreSQL backend
  useEffect(() => {
    let isMounted = true;
    const loadBacklogData = async () => {
      if (!project?.id) return;
      try {
        const [tasksRes, sprintsRes, membersRes] = await Promise.allSettled([
          api.tasks.getTasks(project.id),
          api.sprints.getSprints(project.id),
          api.members.getMembers(project.id),
        ]);

        if (isMounted && membersRes.status === "fulfilled" && Array.isArray(membersRes.value)) {
          const mList: Array<{ id: string; name: string; email: string; avatar?: string }> = membersRes.value.map((m: any) => ({
            id: m.userId || m.id,
            name: m.name || m.user?.name || "Thành viên",
            email: m.email || m.user?.email || "",
            avatar: m.avatar || m.user?.avatar,
          }));
          const owner = project?.owner;
          if (owner && !mList.some((item) => item.id === owner.id)) {
            mList.unshift({
              id: owner.id,
              name: owner.name,
              email: owner.email,
              avatar: owner.avatar,
            });
          }
          setMembers(mList);
          if (mList.length > 0 && !newAssignee) {
            setNewAssignee(user?.id || mList[0].id);
          }
        }

        let sprintId: string | null = null;
        if (sprintsRes.status === "fulfilled" && Array.isArray(sprintsRes.value) && sprintsRes.value.length > 0) {
          const act = sprintsRes.value.find((s: any) => s.status === "ACTIVE") || sprintsRes.value[0];
          sprintId = act.id;
          if (isMounted) {
            setActiveSprint(act);
            setActiveSprintId(sprintId);
          }
        }

        if (isMounted && tasksRes.status === "fulfilled" && Array.isArray(tasksRes.value)) {
          const mapped: BacklogItem[] = tasksRes.value.map((t: any) => {
            const prio = t.priority === "HIGH" ? "Cao" : t.priority === "LOW" ? "Thấp" : "Trung bình";
            const titleLower = (t.title || "").toLowerCase();
            let type: BacklogItem["type"] = (t.type ? t.type.toUpperCase() : "TASK") as BacklogItem["type"];
            if (!t.type) {
              if (titleLower.includes("lỗi") || titleLower.includes("bug")) {
                type = "BUG";
              } else if (titleLower.includes("xác thực") || titleLower.includes("jwt") || titleLower.includes("hệ thống") || t.points >= 8) {
                type = "STORY";
              }
            }

            const epicName = t.epic || (titleLower.includes("lỗi") || titleLower.includes("bug") ? "Lỗi & Sự cố" : "Chung");
            const epicId = t.epic ? t.epic.toLowerCase().replace(/\s+/g, "-") : (titleLower.includes("lỗi") || titleLower.includes("bug") ? "epic-bug" : "epic-general");

            const initials = t.assignee?.name
              ? t.assignee.name.split(" ").filter(Boolean).map((n: string) => n[0]).join("").slice(-2).toUpperCase()
              : "US";

            return {
              id: t.code || `FT-${t.id.slice(0, 4).toUpperCase()}`,
              backendId: t.id,
              title: t.title,
              type,
              epicId,
              epicName,
              sprint: t.sprintId ? "SPRINT_1" : "BACKLOG",
              status: (t.status || "TODO") as BacklogItem["status"],
              priority: prio as BacklogItem["priority"],
              points: t.points || 1,
              assigneeId: t.assigneeId || t.assignee?.id,
              assignee: t.assignee?.avatar || initials,
              assigneeName: t.assignee?.name || "Chưa phân công",
            };
          });

          setItems(mapped);
        }
      } catch {
        // Backend error handled cleanly
      }
    };

    loadBacklogData();
    return () => {
      isMounted = false;
    };
  }, [project?.id, projectId, project?.owner, user?.id]);

  const [selectedEpicFilter, setSelectedEpicFilter] = useState<string>("ALL");
  const [quickTitleSprint1, setQuickTitleSprint1] = useState("");
  const [quickTitleBacklog, setQuickTitleBacklog] = useState("");

  const saveItems = (updated: BacklogItem[]) => {
    setItems(updated);
  };

  const moveToSprint = async (id: string, targetSprint: BacklogItem["sprint"]) => {
    const targetItem = items.find((i) => i.id === id);
    const updated = items.map((item) =>
      item.id === id ? { ...item, sprint: targetSprint } : item
    );
    saveItems(updated);

    if (project?.id && targetItem?.backendId) {
      try {
        await api.tasks.updateTask(project.id, targetItem.backendId, {
          sprintId: targetSprint === "SPRINT_1" ? activeSprintId || undefined : undefined,
        });
      } catch (err) {
        console.warn("Lỗi khi chuyển sprint trên server:", err);
      }
    }
  };

  const updatePoints = async (id: string, points: number) => {
    const targetItem = items.find((i) => i.id === id);
    const updated = items.map((item) =>
      item.id === id ? { ...item, points } : item
    );
    saveItems(updated);

    if (project?.id && targetItem?.backendId) {
      try {
        await api.tasks.updateTask(project.id, targetItem.backendId, { points });
      } catch (err) {
        console.warn("Lỗi khi cập nhật points trên server:", err);
      }
    }
  };

  const deleteItem = async (id: string) => {
    const targetItem = items.find((i) => i.id === id);
    const updated = items.filter((item) => item.id !== id);
    saveItems(updated);

    if (project?.id && targetItem?.backendId) {
      try {
        await api.tasks.deleteTask(project.id, targetItem.backendId);
      } catch (err) {
        console.warn("Lỗi khi xóa task trên server:", err);
      }
    }
  };

  const handleQuickAdd = async (sprint: BacklogItem["sprint"], title: string, setTitle: (s: string) => void) => {
    if (!title.trim()) return;

    const epic = { id: "epic-general", name: "Chung" };
    let createdBackendId: string | undefined;
    let createdCode = `FT-${items.length + 109}`;
    const defaultAssigneeId = user?.id || (members.length > 0 ? members[0].id : undefined);
    const targetMember = members.find((m) => m.id === defaultAssigneeId);

    if (project?.id) {
      try {
        const res = await api.tasks.createTask(project.id, {
          title: title.trim(),
          type: "STORY",
          epic: epic.name,
          points: 3,
          assigneeId: defaultAssigneeId,
          sprintId: sprint === "SPRINT_1" ? activeSprintId || undefined : undefined,
        });
        if (res?.id) {
          createdBackendId = res.id;
          if (res.code) createdCode = res.code;
        }
        api.activities.create(project.id, {
          category: "task",
          action: `đã tạo nhanh công việc ${createdCode}`,
          detail: `Tiêu đề: ${title.trim()} (3 SP).`,
        }).catch(() => {});
      } catch (err) {
        console.warn("Lỗi khi tạo nhanh task lên server:", err);
      }
    }

    const initials = targetMember?.name
      ? targetMember.name.split(" ").filter(Boolean).map((n: string) => n[0]).join("").slice(-2).toUpperCase()
      : (user?.avatar || "US");

    const newItem: BacklogItem = {
      id: createdCode,
      backendId: createdBackendId,
      title: title.trim(),
      type: "STORY",
      epicId: epic.id,
      epicName: epic.name,
      sprint,
      status: "TODO",
      priority: "Trung bình",
      points: 3,
      assigneeId: defaultAssigneeId,
      assignee: targetMember?.avatar || initials,
      assigneeName: targetMember?.name || user?.name || "Chưa phân công",
    };

    saveItems([...items, newItem]);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("ftodo_activity_updated"));
    }
    setTitle("");
  };

  const handleCreateDetailed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const epic = availableEpics.find((e) => e.id === newEpicId) || { id: "epic-general", name: "Chung" };
    const targetMember = members.find((m) => m.id === newAssignee);
    const backendPrio = newPriority === "Cao" ? "HIGH" : newPriority === "Thấp" ? "LOW" : "MEDIUM";
    let createdBackendId: string | undefined;
    let createdCode = `FT-${items.length + 109}`;

    if (project?.id) {
      try {
        const res = await api.tasks.createTask(project.id, {
          title: newTitle.trim(),
          type: newType,
          epic: epic.name,
          points: Number(newPoints) || 1,
          priority: backendPrio,
          assigneeId: newAssignee || undefined,
          sprintId: newSprint === "SPRINT_1" ? activeSprintId || undefined : undefined,
        });
        if (res?.id) {
          createdBackendId = res.id;
          if (res.code) createdCode = res.code;
        }
        api.activities.create(project.id, {
          category: "task",
          action: `đã tạo công việc mới ${createdCode}`,
          detail: `Loại: ${newType}, Epic: ${epic.name}, Tiêu đề: ${newTitle.trim()} (${newPoints} SP).`,
        }).catch(() => {});
      } catch (err) {
        console.warn("Lỗi khi tạo task chi tiết lên server:", err);
      }
    }

    const initials = targetMember?.name
      ? targetMember.name.split(" ").filter(Boolean).map((n: string) => n[0]).join("").slice(-2).toUpperCase()
      : (user?.avatar || "US");

    const newItem: BacklogItem = {
      id: createdCode,
      backendId: createdBackendId,
      title: newTitle.trim(),
      type: newType,
      epicId: epic.id,
      epicName: epic.name,
      sprint: newSprint,
      status: "TODO",
      priority: newPriority,
      points: Number(newPoints) || 1,
      assigneeId: newAssignee || undefined,
      assignee: targetMember?.avatar || initials,
      assigneeName: targetMember?.name || "Chưa phân công",
    };

    saveItems([...items, newItem]);
    setIsCreateOpen(false);
    setNewTitle("");
  };

  // Filtered lists
  const filteredItems = items.filter((item) => {
    if (selectedEpicFilter === "ALL") return true;
    return item.epicId === selectedEpicFilter;
  });

  const sprint1Items = filteredItems.filter((i) => i.sprint === "SPRINT_1");
  const backlogItems = filteredItems.filter((i) => i.sprint === "BACKLOG");

  const sprint1Points = sprint1Items.reduce((sum, i) => sum + (i.points || 0), 0);
  const sprint1DonePoints = sprint1Items
    .filter((i) => i.status === "DONE")
    .reduce((sum, i) => sum + (i.points || 0), 0);
  const backlogPoints = backlogItems.reduce((sum, i) => sum + (i.points || 0), 0);
  const totalAllPoints = items.reduce((sum, i) => sum + (i.points || 0), 0);

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* 1. TOP HEADER & METRICS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Product Backlog & Kế hoạch Sprint
            </h1>
            <Badge variant="outline" className="text-xs font-mono">
              Tổng {totalAllPoints} Story Points
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/projects/${projectId}/board`}>
            <Button variant="outline" size="sm" className="text-xs h-9 gap-1.5">
              Xem Bảng Scrum <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <Button onClick={() => setIsCreateOpen(true)} size="sm" className="text-xs h-9 gap-1.5 shadow-xs">
            <Plus className="h-4 w-4" /> Tạo User Story / Task
          </Button>
        </div>
      </div>

      {/* 2. WBS & EPIC FILTER CHIPS (CẤU TRÚC PHÂN RÃ CÔNG VIỆC) */}
      <div className="p-3.5 rounded-xl border bg-slate-50/70 dark:bg-slate-900/40 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-primary" />
            <span>Phân rã WBS theo Epic:</span>
          </div>
          <span className="text-[11px] font-normal">Bấm để lọc User Stories theo module</span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            variant={selectedEpicFilter === "ALL" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedEpicFilter("ALL")}
            className="text-xs h-7 px-3 rounded-lg"
          >
            Tất cả ({items.length})
          </Button>

          {availableEpics.map((epic) => {
            const count = items.filter((i) => i.epicId === epic.id).length;
            const pts = items.filter((i) => i.epicId === epic.id).reduce((s, i) => s + (i.points || 0), 0);
            const isSelected = selectedEpicFilter === epic.id;

            return (
              <Button
                key={epic.id}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedEpicFilter(isSelected ? "ALL" : epic.id)}
                className={`text-xs h-7 px-3 rounded-lg gap-1.5 ${
                  !isSelected ? "bg-background" : ""
                }`}
              >
                <span>{epic.name}</span>
                <span className="opacity-75 text-[10px] font-mono">({pts} SP)</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. ACTIVE SPRINT CONTAINER                                */}
      {/* ======================================================== */}
      <div className="border rounded-2xl bg-card shadow-2xs overflow-hidden">
        {/* Sprint Header */}
        <div className="p-4 bg-muted/30 border-b flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              <h3 className="font-bold text-sm text-foreground">
                {activeSprint ? activeSprint.name : "Chưa có Sprint kích hoạt"}
              </h3>
              {activeSprint && (
                <Badge className="bg-emerald-600 hover:bg-emerald-700 text-[10px] py-0">
                  {activeSprint.status === "ACTIVE" ? "Active Sprint" : activeSprint.status}
                </Badge>
              )}
              {activeSprint?.startDate && activeSprint?.endDate && (
                <span className="text-xs text-muted-foreground font-mono">
                  • {new Date(activeSprint.startDate).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })} - {new Date(activeSprint.endDate).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}
                </span>
              )}
            </div>
            {activeSprint?.goal ? (
              <p className="text-xs text-muted-foreground">
                Mục tiêu: {activeSprint.goal}
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="text-xs font-semibold text-foreground">
                {sprint1DonePoints} / {sprint1Points} SP
              </span>
              <span className="text-[10px] text-muted-foreground ml-1 font-mono">
                ({sprint1Items.length} việc)
              </span>
            </div>
            <Link href={`/projects/${projectId}/board`}>
              <Button size="sm" variant="outline" className="text-xs h-8 gap-1 bg-background">
                Xem Bảng <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Sprint 1 Tasks List */}
        <div className="divide-y">
          {sprint1Items.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              {activeSprint
                ? "Không có công việc nào trong Sprint này phù hợp với bộ lọc."
                : "Dự án chưa có Sprint nào đang hoạt động. Các công việc nằm trong Backlog bên dưới."}
            </div>
          ) : (
            sprint1Items.map((item) => (
              <div
                key={item.id}
                className="p-3 hover:bg-slate-50/80 dark:hover:bg-slate-900/60 flex items-center justify-between gap-3 transition-colors"
              >
                {/* Left: Type, ID, Title, Epic */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {item.type === "STORY" && (
                    <span title="User Story" className="text-blue-500 shrink-0">
                      <Bookmark className="h-4 w-4 fill-blue-500/20" />
                    </span>
                  )}
                  {item.type === "TASK" && (
                    <span title="Technical Task" className="text-emerald-500 shrink-0">
                      <CheckSquare className="h-4 w-4" />
                    </span>
                  )}
                  {item.type === "BUG" && (
                    <span title="Defect / Bug" className="text-rose-500 shrink-0">
                      <Bug className="h-4 w-4" />
                    </span>
                  )}

                  <span className="text-xs font-mono font-bold text-muted-foreground shrink-0">
                    {item.id}
                  </span>

                  <span className="text-xs font-semibold text-foreground truncate max-w-md">
                    {item.title}
                  </span>

                  <Badge variant="outline" className="text-[10px] py-0 shrink-0 hidden sm:inline-flex bg-muted/40">
                    {item.epicName}
                  </Badge>
                </div>

                {/* Right: Status, Priority, Points, Assignee, Actions */}
                <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                  <Badge
                    variant={
                      item.status === "DONE"
                        ? "default"
                        : item.status === "IN_PROGRESS"
                        ? "secondary"
                        : "outline"
                    }
                    className={`text-[10px] py-0 hidden sm:inline-flex ${
                      item.status === "DONE" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
                    }`}
                  >
                    {item.status === "TODO" && "To Do"}
                    {item.status === "IN_PROGRESS" && "In Progress"}
                    {item.status === "REVIEW" && "Review"}
                    {item.status === "DONE" && "Done"}
                  </Badge>

                  {/* Story Points Selector */}
                  <Select
                    value={String(item.points)}
                    onValueChange={(val) => updatePoints(item.id, Number(val) || 1)}
                  >
                    <SelectTrigger className="h-7 w-16 text-xs font-bold font-mono">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 SP</SelectItem>
                      <SelectItem value="2">2 SP</SelectItem>
                      <SelectItem value="3">3 SP</SelectItem>
                      <SelectItem value="5">5 SP</SelectItem>
                      <SelectItem value="8">8 SP</SelectItem>
                      <SelectItem value="13">13 SP</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Assignee Avatar */}
                  <Avatar className="h-6 w-6 ring-1 ring-border" title={item.assigneeName}>
                    <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                      {item.assignee}
                    </AvatarFallback>
                  </Avatar>

                  {/* Action Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger className="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center outline-none">
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 text-xs">
                      <DropdownMenuLabel>Tùy chọn công việc</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => moveToSprint(item.id, "BACKLOG")} className="cursor-pointer">
                        <MoveDown className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                        Chuyển xuống Backlog
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => deleteItem(item.id)} className="text-rose-600 cursor-pointer">
                        Xóa công việc
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Add inside Sprint 1 */}
        <div className="p-2.5 bg-muted/10 border-t flex items-center gap-2">
          <Plus className="h-4 w-4 text-muted-foreground ml-1" />
          <Input
            placeholder="+ Tạo User Story mới cho Sprint 1 (Nhập tiêu đề và nhấn Enter)..."
            value={quickTitleSprint1}
            onChange={(e) => setQuickTitleSprint1(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleQuickAdd("SPRINT_1", quickTitleSprint1, setQuickTitleSprint1);
              }
            }}
            className="border-0 bg-transparent focus-visible:ring-0 shadow-none text-xs h-8"
          />
          {quickTitleSprint1.trim() && (
            <Button
              size="sm"
              onClick={() => handleQuickAdd("SPRINT_1", quickTitleSprint1, setQuickTitleSprint1)}
              className="text-xs h-7 px-3"
            >
              Thêm
            </Button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. PRODUCT BACKLOG CONTAINER (FUTURE SPRINTS)            */}
      {/* ======================================================== */}
      <div className="border rounded-2xl bg-card shadow-2xs overflow-hidden">
        {/* Backlog Header */}
        <div className="p-4 bg-muted/20 border-b flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-bold text-sm text-foreground">
                Product Backlog
              </h3>
              <Badge variant="secondary" className="text-[10px] py-0 font-mono">
                {backlogItems.length} công việc • {backlogPoints} SP
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Move all backlog items to Sprint 1
                const updated = items.map((i) => ({ ...i, sprint: "SPRINT_1" as const }));
                saveItems(updated);
              }}
              className="text-xs h-8 gap-1.5"
            >
              <MoveUp className="h-3.5 w-3.5 text-primary" /> Đưa tất cả vào Sprint 1
            </Button>
          </div>
        </div>

        {/* Backlog Tasks List */}
        <div className="divide-y">
          {backlogItems.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              Hiện tại không có công việc nào trong Backlog chờ lên lịch.
            </div>
          ) : (
            backlogItems.map((item) => (
              <div
                key={item.id}
                className="p-3 hover:bg-slate-50/80 dark:hover:bg-slate-900/60 flex items-center justify-between gap-3 transition-colors"
              >
                {/* Left */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {item.type === "STORY" && (
                    <span title="User Story" className="text-blue-500 shrink-0">
                      <Bookmark className="h-4 w-4 fill-blue-500/20" />
                    </span>
                  )}
                  {item.type === "TASK" && (
                    <span title="Technical Task" className="text-emerald-500 shrink-0">
                      <CheckSquare className="h-4 w-4" />
                    </span>
                  )}
                  {item.type === "BUG" && (
                    <span title="Defect / Bug" className="text-rose-500 shrink-0">
                      <Bug className="h-4 w-4" />
                    </span>
                  )}

                  <span className="text-xs font-mono font-bold text-muted-foreground shrink-0">
                    {item.id}
                  </span>

                  <span className="text-xs font-semibold text-foreground truncate max-w-md">
                    {item.title}
                  </span>

                  <Badge variant="outline" className="text-[10px] py-0 shrink-0 hidden sm:inline-flex bg-muted/40">
                    {item.epicName}
                  </Badge>
                </div>

                {/* Right */}
                <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                  {/* Quick button: Move up to Sprint 1 */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => moveToSprint(item.id, "SPRINT_1")}
                    className="h-7 text-[11px] px-2 gap-1 text-primary border-primary/30 hover:bg-primary/5"
                    title="Đưa công việc này vào Sprint 1"
                  >
                    <MoveUp className="h-3 w-3" /> <span className="hidden xs:inline sm:inline">Vào Sprint 1</span><span className="xs:hidden sm:hidden">Lên</span>
                  </Button>

                  {/* Story Points */}
                  <Select
                    value={String(item.points)}
                    onValueChange={(val) => updatePoints(item.id, Number(val) || 1)}
                  >
                    <SelectTrigger className="h-7 w-16 text-xs font-bold font-mono">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 SP</SelectItem>
                      <SelectItem value="2">2 SP</SelectItem>
                      <SelectItem value="3">3 SP</SelectItem>
                      <SelectItem value="5">5 SP</SelectItem>
                      <SelectItem value="8">8 SP</SelectItem>
                      <SelectItem value="13">13 SP</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Assignee */}
                  <Avatar className="h-6 w-6 ring-1 ring-border" title={item.assigneeName}>
                    <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                      {item.assignee}
                    </AvatarFallback>
                  </Avatar>

                  {/* Action Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger className="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center outline-none">
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44 text-xs">
                      <DropdownMenuItem onClick={() => deleteItem(item.id)} className="text-rose-600 cursor-pointer">
                        Xóa công việc
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Add inside Backlog */}
        <div className="p-2.5 bg-muted/10 border-t flex items-center gap-2">
          <Plus className="h-4 w-4 text-muted-foreground ml-1" />
          <Input
            placeholder="+ Tạo công việc mới đưa vào Backlog (Nhập tiêu đề và nhấn Enter)..."
            value={quickTitleBacklog}
            onChange={(e) => setQuickTitleBacklog(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleQuickAdd("BACKLOG", quickTitleBacklog, setQuickTitleBacklog);
              }
            }}
            className="border-0 bg-transparent focus-visible:ring-0 shadow-none text-xs h-8"
          />
          {quickTitleBacklog.trim() && (
            <Button
              size="sm"
              onClick={() => handleQuickAdd("BACKLOG", quickTitleBacklog, setQuickTitleBacklog)}
              className="text-xs h-7 px-3"
            >
              Thêm
            </Button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. CREATE DETAILED USER STORY / TASK DIALOG              */}
      {/* ======================================================== */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo User Story / Task chi tiết</DialogTitle>
            <DialogDescription className="text-xs">
              Thêm yêu cầu công việc mới vào Backlog hoặc gán trực tiếp vào Sprint hiện tại.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateDetailed} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="bs-title" className="text-xs font-semibold">
                Tiêu đề công việc <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="bs-title"
                placeholder="VD: Viết kịch bản kiểm thử API thanh toán..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="text-xs h-9"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Thuộc Epic (WBS)</Label>
                <Select value={newEpicId} onValueChange={(val) => setNewEpicId(val || "epic-general")}>
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="epic-general">Chung (Mặc định)</SelectItem>
                    {availableEpics.map((ep) => (
                      <SelectItem key={ep.id} value={ep.id}>
                        {ep.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Kế hoạch đưa vào</Label>
                <Select value={newSprint} onValueChange={(val) => setNewSprint((val as any) || "SPRINT_1")}>
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SPRINT_1">Sprint 1 (Active)</SelectItem>
                    <SelectItem value="BACKLOG">Product Backlog</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Loại việc</Label>
                <Select value={newType} onValueChange={(val) => setNewType((val as any) || "STORY")}>
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
                <Label className="text-xs font-semibold">Story Points</Label>
                <Select value={String(newPoints)} onValueChange={(val) => setNewPoints(Number(val) || 3)}>
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 SP</SelectItem>
                    <SelectItem value="2">2 SP</SelectItem>
                    <SelectItem value="3">3 SP</SelectItem>
                    <SelectItem value="5">5 SP</SelectItem>
                    <SelectItem value="8">8 SP</SelectItem>
                    <SelectItem value="13">13 SP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Ưu tiên</Label>
                <Select value={newPriority} onValueChange={(val) => setNewPriority((val as any) || "Trung bình")}>
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
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Người phụ trách</Label>
              <Select value={newAssignee} onValueChange={(val) => setNewAssignee(val || "")}>
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
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={!newTitle.trim()}>
                Tạo công việc
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
