"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  CalendarRange,
  Layers,
  Clock,
  CheckCircle2,
  Plus,
  Sparkles,
  Milestone,
  CalendarDays,
  Flag,
  UserCheck,
  Calendar as CalendarIcon,
  Bookmark,
  CheckSquare,
  Bug,
  Flame,
  Filter,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProject } from "../project-context";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

export interface TimelineItem {
  id: string;
  itemType: "SPRINT" | "TASK";
  key: string;
  title: string;
  taskType?: "STORY" | "TASK" | "BUG";
  status: "done" | "in_progress" | "review" | "todo" | "planned";
  statusLabel: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  startDisplay: string; // DD/MM/YYYY
  endDisplay: string;
  durationDays: number;
  startOffsetPercent: number; // 0 - 100%
  widthPercent: number;       // 0 - 100%
  progress: number;
  points: number;
  assignee: string;
  assigneeAvatar?: string;
  sprintName?: string;
  color: string;
}

// Today line calculation
const TODAY = new Date();
const TODAY_FORMATTED = TODAY.toLocaleDateString("vi-VN");
const TODAY_SHORT = `${TODAY.getDate()}/${TODAY.getMonth() + 1}`;

const calcGanttPos = (
  startStr: string,
  endStr: string,
  timelineStart: Date,
  totalDays: number
) => {
  const start = new Date(startStr);
  const end = new Date(endStr);
  const diffStartDays = Math.max(0, (start.getTime() - timelineStart.getTime()) / (1000 * 3600 * 24));
  const duration = Math.max(1, (end.getTime() - start.getTime()) / (1000 * 3600 * 24) + 1);

  const startPercent = (diffStartDays / totalDays) * 100;
  const widthPercent = (duration / totalDays) * 100;

  return {
    startOffsetPercent: Math.min(Math.max(startPercent, 0), 95),
    widthPercent: Math.min(Math.max(widthPercent, 5), 100 - startPercent),
    durationDays: Math.round(duration),
  };
};

export default function TimelinePage() {
  const { project, isOwner } = useProject();
  const { user } = useAuth();
  const [timelineStart, setTimelineStart] = useState<Date>(new Date("2026-10-01"));
  const [totalDays, setTotalDays] = useState<number>(46);
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [rawSprints, setRawSprints] = useState<any[]>([]);
  const [members, setMembers] = useState<Array<{ id: string; name: string }>>([]);

  const [viewMode, setViewMode] = useState<"all" | "sprints" | "tasks">("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createKind, setCreateKind] = useState<"TASK" | "SPRINT">("TASK");
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<"STORY" | "TASK" | "BUG">("TASK");
  const [newStart, setNewStart] = useState<string>(new Date().toISOString().slice(0, 10));
  const [newEnd, setNewEnd] = useState<string>(new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10));
  const [newPoints, setNewPoints] = useState<number>(3);
  const [newAssignee, setNewAssignee] = useState<string>("");
  const [newSprintId, setNewSprintId] = useState<string>("none");

  // Sync timeline from backend: both Sprints and Tasks
  useEffect(() => {
    let isMounted = true;
    const loadTimelineData = async () => {
      if (!project?.id) return;
      try {
        const [sprintsRes, tasksRes, membersRes] = await Promise.allSettled([
          api.sprints.getSprints(project.id),
          api.tasks.getTasks(project.id),
          api.members.getMembers(project.id),
        ]);

        if (isMounted && membersRes.status === "fulfilled" && Array.isArray(membersRes.value)) {
          const mList = membersRes.value.map((m: any) => ({
            id: m.userId || m.id,
            name: m.name || m.user?.name || "Thành viên",
          }));
          const owner = project?.owner;
          if (owner && !mList.some((item: any) => item.id === owner.id)) {
            mList.unshift({ id: owner.id, name: owner.name });
          }
          setMembers(mList);
          if (mList.length > 0 && !newAssignee) {
            setNewAssignee(user?.name || mList[0].name);
          }
        }

        const sprints = sprintsRes.status === "fulfilled" && Array.isArray(sprintsRes.value) ? sprintsRes.value : [];
        const tasks = tasksRes.status === "fulfilled" && Array.isArray(tasksRes.value) ? tasksRes.value : [];

        if (isMounted) {
          setRawSprints(sprints);
        }

        // Calculate timeline date boundary across all Sprints and Tasks
        let minTime = Infinity;
        let maxTime = -Infinity;

        sprints.forEach((s: any) => {
          if (s.startDate) minTime = Math.min(minTime, new Date(s.startDate).getTime());
          if (s.endDate) maxTime = Math.max(maxTime, new Date(s.endDate).getTime());
        });

        tasks.forEach((t: any) => {
          if (t.startDate) minTime = Math.min(minTime, new Date(t.startDate).getTime());
          if (t.endDate) maxTime = Math.max(maxTime, new Date(t.endDate).getTime());
        });

        if (minTime === Infinity || maxTime === -Infinity) {
          minTime = new Date("2026-10-01").getTime();
          maxTime = new Date("2026-11-15").getTime();
        }

        const calculatedStart = new Date(minTime - 2 * 86400000); // 2 days buffer
        const calculatedDays = Math.max(25, Math.ceil((maxTime + 10 * 86400000 - calculatedStart.getTime()) / 86400000));

        if (isMounted) {
          setTimelineStart(calculatedStart);
          setTotalDays(calculatedDays);
        }

        // Map Sprints to Timeline Items
        const sprintItems: TimelineItem[] = sprints.map((s: any, idx: number) => {
          const startStr = s.startDate ? new Date(s.startDate).toISOString().slice(0, 10) : "2026-10-01";
          const endStr = s.endDate ? new Date(s.endDate).toISOString().slice(0, 10) : "2026-10-25";

          const sTotalPts = Array.isArray(s.tasks) ? s.tasks.reduce((sum: number, t: any) => sum + (t.points || 0), 0) : 0;
          const sDonePts = Array.isArray(s.tasks) ? s.tasks.filter((t: any) => t.status === "DONE").reduce((sum: number, t: any) => sum + (t.points || 0), 0) : 0;
          const sProgress = sTotalPts > 0 ? Math.round((sDonePts / sTotalPts) * 100) : (s.status === "COMPLETED" ? 100 : 0);

          return {
            id: s.id,
            itemType: "SPRINT",
            key: s.name,
            title: s.name + (s.goal ? `: ${s.goal}` : ""),
            status: s.status === "ACTIVE" ? "in_progress" : s.status === "COMPLETED" ? "done" : "planned",
            statusLabel: s.status === "ACTIVE" ? "Đang chạy" : s.status === "COMPLETED" ? "Hoàn thành" : "Kế hoạch",
            startDate: startStr,
            endDate: endStr,
            startDisplay: new Date(startStr).toLocaleDateString("vi-VN"),
            endDisplay: new Date(endStr).toLocaleDateString("vi-VN"),
            ...calcGanttPos(startStr, endStr, calculatedStart, calculatedDays),
            progress: sProgress,
            points: sTotalPts,
            assignee: "Toàn đội",
            color: s.status === "COMPLETED" ? "bg-emerald-500" : s.status === "ACTIVE" ? "bg-blue-600" : "bg-slate-400",
          };
        });

        // Map Tasks to Timeline Items
        const taskItems: TimelineItem[] = tasks.map((t: any) => {
          const fallbackStart = t.sprint?.startDate ? new Date(t.sprint.startDate).toISOString().slice(0, 10) : "2026-10-01";
          const fallbackEnd = t.sprint?.endDate ? new Date(t.sprint.endDate).toISOString().slice(0, 10) : "2026-10-15";

          const startStr = t.startDate ? new Date(t.startDate).toISOString().slice(0, 10) : fallbackStart;
          const endStr = t.endDate ? new Date(t.endDate).toISOString().slice(0, 10) : fallbackEnd;

          let status: TimelineItem["status"] = "todo";
          let statusLabel = "Cần làm";
          let progress = 10;
          let color = "bg-slate-400 dark:bg-slate-500";

          if (t.status === "DONE") {
            status = "done";
            statusLabel = "Hoàn thành";
            progress = 100;
            color = "bg-emerald-500 hover:bg-emerald-600";
          } else if (t.status === "IN_PROGRESS") {
            status = "in_progress";
            statusLabel = "Đang làm";
            progress = 50;
            color = "bg-blue-500 hover:bg-blue-600";
          } else if (t.status === "REVIEW") {
            status = "review";
            statusLabel = "Review";
            progress = 80;
            color = "bg-amber-500 hover:bg-amber-600";
          }

          let taskType: "STORY" | "TASK" | "BUG" = "TASK";
          const titleLower = (t.title || "").toLowerCase();
          if (t.type) {
            taskType = t.type.toUpperCase() as any;
          } else if (titleLower.includes("lỗi") || titleLower.includes("bug")) {
            taskType = "BUG";
          } else if (t.points >= 5) {
            taskType = "STORY";
          }

          return {
            id: t.id,
            itemType: "TASK",
            key: t.code || `FT-${t.id.slice(0, 4).toUpperCase()}`,
            title: t.title,
            taskType,
            status,
            statusLabel,
            startDate: startStr,
            endDate: endStr,
            startDisplay: new Date(startStr).toLocaleDateString("vi-VN"),
            endDisplay: new Date(endStr).toLocaleDateString("vi-VN"),
            ...calcGanttPos(startStr, endStr, calculatedStart, calculatedDays),
            progress,
            points: t.points || 0,
            assignee: t.assignee?.name || "Chưa giao",
            assigneeAvatar: t.assignee?.avatar,
            sprintName: t.sprint?.name || "Backlog",
            color,
          };
        });

        if (isMounted) {
          // Combined items: Sprints first, then Tasks
          setItems([...sprintItems, ...taskItems]);
        }
      } catch (err) {
        console.warn("Lỗi tải dữ liệu lộ trình:", err);
      }
    };

    loadTimelineData();
    return () => {
      isMounted = false;
    };
  }, [project?.id, project?.owner, user?.name]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !project?.id) return;

    if (createKind === "SPRINT") {
      try {
        await api.sprints.createSprint(project.id, {
          name: newTitle.trim(),
          goal: `Mục tiêu tiến độ ${newTitle.trim()}`,
          startDate: new Date(newStart).toISOString(),
          endDate: new Date(newEnd).toISOString(),
        });
        api.activities.create(project.id, {
          category: "sprint",
          action: `đã tạo Sprint mới trên lộ trình: ${newTitle.trim()}`,
        }).catch(() => {});
        window.location.reload();
      } catch (err) {
        console.warn("Lỗi tạo sprint:", err);
      }
    } else {
      try {
        const assignedMember = members.find((m) => m.name === newAssignee);
        const sprintToSet = newSprintId === "none" ? undefined : newSprintId;

        await api.tasks.createTask(project.id, {
          title: newTitle.trim(),
          type: newType,
          points: Number(newPoints) || 1,
          startDate: new Date(newStart).toISOString(),
          endDate: new Date(newEnd).toISOString(),
          sprintId: sprintToSet,
          assigneeId: assignedMember?.id,
        });
        api.activities.create(project.id, {
          category: "task",
          action: `đã tạo công việc mới trên lộ trình: ${newTitle.trim()}`,
        }).catch(() => {});
        window.location.reload();
      } catch (err) {
        console.warn("Lỗi tạo task:", err);
      }
    }

    setIsCreateOpen(false);
    setNewTitle("");
  };

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. View mode filter
      if (viewMode === "sprints" && item.itemType !== "SPRINT") return false;
      if (viewMode === "tasks" && item.itemType !== "TASK") return false;

      // 2. Status filter
      if (filterStatus === "all") return true;
      if (filterStatus === "in_progress") {
        return item.status === "in_progress" || item.status === "review";
      }
      if (filterStatus === "done") {
        return item.status === "done";
      }
      if (filterStatus === "todo") {
        return item.status === "todo" || item.status === "planned";
      }
      return true;
    });
  }, [items, viewMode, filterStatus]);

  const taskCount = items.filter((i) => i.itemType === "TASK").length;
  const sprintCount = items.filter((i) => i.itemType === "SPRINT").length;

  const totalPoints = items
    .filter((i) => i.itemType === "TASK")
    .reduce((sum, e) => sum + e.points, 0);

  const completedPoints = items
    .filter((i) => i.itemType === "TASK" && i.status === "done")
    .reduce((sum, e) => sum + e.points, 0);

  const activeSprint = rawSprints.find((s) => s.status === "ACTIVE") || rawSprints[0];

  const weekColumns = useMemo(() => {
    const cols = [];
    const weekDays = Math.max(5, Math.ceil(totalDays / 6));
    const formatShort = (d: Date) => `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    for (let i = 0; i < 6; i++) {
      const wStart = new Date(timelineStart.getTime() + i * weekDays * 86400000);
      const wEnd = new Date(timelineStart.getTime() + ((i + 1) * weekDays - 1) * 86400000);
      const isCurrent = TODAY >= wStart && TODAY <= wEnd;
      cols.push({
        weekNum: i + 1,
        label: `Tuần ${i + 1}${isCurrent ? " • Hiện tại" : ""}`,
        dateRange: `${formatShort(wStart)} - ${formatShort(wEnd)}`,
        isCurrent,
      });
    }
    return cols;
  }, [timelineStart, totalDays]);

  const todayOffsetPercent = Math.min(
    100,
    Math.max(0, ((TODAY.getTime() - timelineStart.getTime()) / (1000 * 3600 * 24) / totalDays) * 100)
  );

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-foreground">
              <CalendarRange className="h-6 w-6 text-primary" /> Lộ trình & Lịch tiến độ
            </h1>
            <Badge variant="outline" className="text-xs font-mono">
              {taskCount} Tasks • {sprintCount} Sprints
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View mode switcher */}
          <div className="flex items-center gap-1 border rounded-lg p-0.5 bg-muted/40">
            <Button
              variant={viewMode === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("all")}
              className="text-xs h-7 px-2.5"
            >
              Tất cả
            </Button>
            <Button
              variant={viewMode === "sprints" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("sprints")}
              className="text-xs h-7 px-2.5 gap-1"
            >
              <Flame className="h-3 w-3 text-orange-500" /> Sprints ({sprintCount})
            </Button>
            <Button
              variant={viewMode === "tasks" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("tasks")}
              className="text-xs h-7 px-2.5 gap-1"
            >
              <CheckSquare className="h-3 w-3 text-primary" /> Tasks ({taskCount})
            </Button>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1 border rounded-lg p-0.5 bg-muted/40">
            <Button
              variant={filterStatus === "all" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilterStatus("all")}
              className="text-xs h-7 px-2"
            >
              Tất cả
            </Button>
            <Button
              variant={filterStatus === "in_progress" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilterStatus("in_progress")}
              className="text-xs h-7 px-2"
            >
              Đang làm
            </Button>
            <Button
              variant={filterStatus === "done" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilterStatus("done")}
              className="text-xs h-7 px-2"
            >
              Hoàn thành
            </Button>
          </div>

          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="text-xs h-8 gap-1.5 shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" /> Thêm vào lộ trình
          </Button>
        </div>
      </div>

      {/* 2. Overview Metric Banner */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="shadow-2xs">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs text-muted-foreground font-medium">Khối lượng công việc</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold">{taskCount} Công việc • {totalPoints} Points</div>
            <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
              Phân bổ qua {sprintCount} chu kỳ Sprint
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs text-muted-foreground font-medium">Tiến độ hoàn thành lộ trình</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {Math.round((completedPoints / (totalPoints || 1)) * 100)}% hoàn thành
            </div>
            <Progress value={(completedPoints / (totalPoints || 1)) * 100} className="h-1.5 mt-2" />
            <p className="text-[11px] text-muted-foreground mt-1 font-mono">
              Đạt {completedPoints} / {totalPoints} Story Points
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs text-muted-foreground font-medium">Sprint đang thực hiện</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {activeSprint ? (
              <>
                <div className="text-xl font-bold flex items-center gap-1.5 text-blue-600 dark:text-blue-400 truncate">
                  <Flame className="h-4 w-4 shrink-0 text-orange-500" /> {activeSprint.name}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                  Thời hạn: <strong>{activeSprint.endDate ? new Date(activeSprint.endDate).toLocaleDateString("vi-VN") : "Đang cập nhật"}</strong>
                </p>
              </>
            ) : (
              <div className="text-xs text-muted-foreground py-2">
                Chưa có Sprint kích hoạt
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 3. Detailed Gantt Chart View */}
      <Card className="shadow-2xs overflow-hidden">
        <CardHeader className="border-b pb-3 bg-muted/10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <CardTitle className="text-base font-semibold">Trục thời gian chi tiết theo ngày & tuần</CardTitle>
              <CardDescription className="text-xs">
                Mốc ngày đỏ: <strong>Hôm nay ({TODAY_FORMATTED})</strong> • Chiều dài thanh phản ánh đúng thời lượng công việc
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs border-rose-400 text-rose-600 bg-rose-50 dark:bg-rose-950/30 gap-1 font-mono">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                Hôm nay: {TODAY_FORMATTED}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <div className="min-w-[1000px]">
            {/* Header Timeline Columns with exact dates */}
            <div className="grid grid-cols-12 border-b bg-slate-50 dark:bg-slate-900/60 text-[11px] font-semibold text-muted-foreground divide-x divide-border">
              <div className="col-span-5 p-3 text-left font-bold text-foreground">
                Hạng mục Lộ trình / Công việc
              </div>
              <div className="col-span-7 grid grid-cols-6 divide-x divide-border text-center">
                {weekColumns.map((col) => (
                  <div
                    key={col.weekNum}
                    className={`p-2 ${col.isCurrent ? "bg-rose-50/40 dark:bg-rose-950/20" : ""}`}
                  >
                    <div
                      className={`font-bold ${
                        col.isCurrent
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-foreground"
                      }`}
                    >
                      {col.label}
                    </div>
                    <div
                      className={`text-[10px] ${
                        col.isCurrent ? "text-rose-500" : "text-muted-foreground"
                      }`}
                    >
                      {col.dateRange}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gantt Rows */}
            <div className="divide-y relative">
              {/* Vertical Today Line */}
              <div
                className="absolute top-0 bottom-0 z-10 pointer-events-none"
                style={{
                  left: `calc(41.666% + (58.333% * ${todayOffsetPercent / 100}))`,
                }}
              >
                <div className="h-full w-0.5 bg-rose-500 shadow-sm relative">
                  <div className="absolute -top-2 -translate-x-1/2 bg-rose-500 text-white text-[9px] font-bold px-1 py-0.2 rounded shadow-xs whitespace-nowrap">
                    {TODAY_SHORT} (Hôm nay)
                  </div>
                </div>
              </div>

              {filteredItems.length === 0 ? (
                <div className="p-12 text-center text-xs text-muted-foreground">
                  Chưa có mục nào trên lộ trình phù hợp với bộ lọc hiện tại. Bấm &quot;Thêm vào lộ trình&quot; để thiết lập mục tiêu!
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div
                    key={`${item.itemType}-${item.id}`}
                    className={`grid grid-cols-12 items-center hover:bg-muted/30 transition-colors py-3 px-3 ${
                      item.itemType === "SPRINT" ? "bg-muted/15 font-medium" : ""
                    }`}
                  >
                    {/* Left Column: Item Details */}
                    <div className="col-span-5 pr-4 min-w-0">
                      <div className="flex items-center gap-2">
                        {item.itemType === "SPRINT" ? (
                          <span className="p-1 rounded bg-orange-100 dark:bg-orange-950/50 text-orange-600 shrink-0">
                            <Flame className="h-3.5 w-3.5" />
                          </span>
                        ) : (
                          <>
                            {item.taskType === "STORY" && (
                              <span title="User Story" className="text-blue-500 shrink-0">
                                <Bookmark className="h-3.5 w-3.5 fill-blue-500/20" />
                              </span>
                            )}
                            {item.taskType === "TASK" && (
                              <span title="Technical Task" className="text-emerald-500 shrink-0">
                                <CheckSquare className="h-3.5 w-3.5" />
                              </span>
                            )}
                            {item.taskType === "BUG" && (
                              <span title="Bug" className="text-rose-500 shrink-0">
                                <Bug className="h-3.5 w-3.5" />
                              </span>
                            )}
                          </>
                        )}

                        <span className="text-[10px] font-mono font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                          {item.key}
                        </span>

                        <span className="text-xs font-semibold text-foreground truncate" title={item.title}>
                          {item.title}
                        </span>

                        {item.itemType === "TASK" && item.sprintName && (
                          <Badge variant="outline" className="text-[9px] py-0 px-1.5 shrink-0 hidden sm:inline-flex bg-muted/40 font-mono">
                            {item.sprintName}
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground mt-1.5 font-medium">
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-slate-300 dark:border-slate-700 font-mono">
                          {item.startDisplay} → {item.endDisplay}
                        </Badge>
                        <span>({item.durationDays} ngày)</span>
                        <span>•</span>
                        <span>{item.points} SP</span>
                        <span>•</span>
                        <span className="text-foreground">{item.assignee}</span>
                        <span>•</span>
                        <span className={`font-semibold ${item.status === "done" ? "text-emerald-600" : item.status === "in_progress" ? "text-blue-600" : "text-muted-foreground"}`}>
                          {item.statusLabel}
                        </span>
                      </div>
                    </div>

                    {/* Right Column: Exact Gantt Bar */}
                    <div className="col-span-7 relative h-7 bg-slate-100/70 dark:bg-slate-800/40 rounded-lg overflow-hidden flex items-center p-1 border border-border/50">
                      <div
                        className={`h-full rounded-md ${item.color} text-white flex items-center justify-between px-2 text-[10px] font-semibold transition-all shadow-xs`}
                        style={{
                          marginLeft: `${item.startOffsetPercent}%`,
                          width: `${item.widthPercent}%`,
                          minWidth: "50px",
                        }}
                        title={`${item.title}: ${item.startDisplay} đến ${item.endDisplay} (${item.progress}%)`}
                      >
                        <span className="truncate">{item.progress}%</span>
                        {item.status === "done" ? (
                          <CheckCircle2 className="h-3 w-3 shrink-0 ml-1" />
                        ) : (
                          <span className="text-[9px] opacity-80 shrink-0 ml-1">{item.durationDays}d</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Add to Timeline Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm vào Lộ trình & Kế hoạch</DialogTitle>
            <DialogDescription className="text-xs">
              Thiết lập kế hoạch thời gian thực tế cho công việc hoặc tạo chu kỳ Sprint mới.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Hình thức thêm</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={createKind === "TASK" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCreateKind("TASK")}
                  className="text-xs h-8"
                >
                  Công việc (Task / Story)
                </Button>
                <Button
                  type="button"
                  variant={createKind === "SPRINT" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCreateKind("SPRINT")}
                  className="text-xs h-8"
                >
                  Sprint mới
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="item-title" className="text-xs font-semibold">
                {createKind === "SPRINT" ? "Tên Sprint" : "Tiêu đề công việc"} <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="item-title"
                placeholder={createKind === "SPRINT" ? "VD: Sprint 2: Hoàn thiện cổng thanh toán..." : "VD: Phát triển giao diện Lộ trình..."}
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            {createKind === "TASK" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Loại việc</Label>
                  <Select value={newType} onValueChange={(val) => setNewType((val as any) || "TASK")}>
                    <SelectTrigger className="text-xs h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TASK">📋 Task kỹ thuật</SelectItem>
                      <SelectItem value="STORY">📘 User Story</SelectItem>
                      <SelectItem value="BUG">🐞 Defect / Bug</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Thuộc Sprint</Label>
                  <Select value={newSprintId} onValueChange={(val) => setNewSprintId(val || "none")}>
                    <SelectTrigger className="text-xs h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Product Backlog</SelectItem>
                      {rawSprints.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="item-start" className="text-xs font-semibold">
                  Ngày bắt đầu
                </Label>
                <Input
                  id="item-start"
                  type="date"
                  value={newStart}
                  onChange={(e) => setNewStart(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="item-end" className="text-xs font-semibold">
                  Ngày kết thúc
                </Label>
                <Input
                  id="item-end"
                  type="date"
                  value={newEnd}
                  onChange={(e) => setNewEnd(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>
            </div>

            {createKind === "TASK" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="item-pts" className="text-xs font-semibold">Story Points</Label>
                  <Input
                    id="item-pts"
                    type="number"
                    min={1}
                    max={50}
                    value={newPoints}
                    onChange={(e) => setNewPoints(Number(e.target.value))}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Người phụ trách</Label>
                  <Select value={newAssignee} onValueChange={(val) => setNewAssignee(val || "")}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Chọn người phụ trách" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((m) => (
                        <SelectItem key={m.id} value={m.name}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={!newTitle.trim()}>
                Lưu vào lộ trình
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
