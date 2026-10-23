"use client";

import React, { useState, useEffect } from "react";
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
  Calendar as CalendarIcon
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

interface Epic {
  id: string;
  key: string;
  title: string;
  status: "done" | "in_progress" | "planned";
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
  color: string;
}

// Today line calculation
const TODAY = new Date();
const TODAY_FORMATTED = TODAY.toLocaleDateString("vi-VN");
const TODAY_SHORT = `${TODAY.getDate()}/${TODAY.getMonth() + 1}`;

const calcGanttPos = (
  startStr: string,
  endStr: string,
  timelineStart: Date = new Date("2026-10-01"),
  totalDays: number = 46
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
  const [epics, setEpics] = useState<Epic[]>([]);
  const [members, setMembers] = useState<Array<{ id: string; name: string }>>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Add Epic modal
  const [isAddEpicOpen, setIsAddEpicOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newStart, setNewStart] = useState("2026-10-15");
  const [newEnd, setNewEnd] = useState("2026-10-30");
  const [newAssignee, setNewAssignee] = useState(user?.name || "Chủ dự án");
  const [newPoints, setNewPoints] = useState(10);

  // Sync timeline epics & sprints live from PostgreSQL
  useEffect(() => {
    let isMounted = true;
    const loadTimelineData = async () => {
      if (!project?.id) return;
      try {
        const [sprintsRes, membersRes] = await Promise.allSettled([
          api.sprints.getSprints(project.id),
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

        if (isMounted && sprintsRes.status === "fulfilled" && Array.isArray(sprintsRes.value)) {
          const sprints = sprintsRes.value;
          let calculatedStart = new Date("2026-10-01");
          let calculatedDays = 46;

          if (sprints.length > 0) {
            let minTime = Infinity;
            let maxTime = -Infinity;
            sprints.forEach((s: any) => {
              if (s.startDate) minTime = Math.min(minTime, new Date(s.startDate).getTime());
              if (s.endDate) maxTime = Math.max(maxTime, new Date(s.endDate).getTime());
            });
            if (minTime !== Infinity && maxTime !== -Infinity) {
              calculatedStart = new Date(minTime);
              calculatedDays = Math.max(30, Math.ceil((maxTime + 14 * 86400000 - minTime) / 86400000));
              setTimelineStart(calculatedStart);
              setTotalDays(calculatedDays);
            }
          }

          const mapped: Epic[] = sprints.map((s: any, idx: number) => {
            const startStr = s.startDate ? new Date(s.startDate).toISOString().slice(0, 10) : "2026-10-01";
            const endStr = s.endDate ? new Date(s.endDate).toISOString().slice(0, 10) : "2026-10-25";

            const sTotalPts = Array.isArray(s.tasks) ? s.tasks.reduce((sum: number, t: any) => sum + (t.points || 0), 0) : 0;
            const sDonePts = Array.isArray(s.tasks) ? s.tasks.filter((t: any) => t.status === "DONE").reduce((sum: number, t: any) => sum + (t.points || 0), 0) : 0;
            const sProgress = sTotalPts > 0 ? Math.round((sDonePts / sTotalPts) * 100) : (s.status === "COMPLETED" ? 100 : 0);

            return {
              id: s.id,
              key: `SPRINT-0${idx + 1}`,
              title: s.name + (s.goal ? `: ${s.goal}` : ""),
              status: s.status === "ACTIVE" ? "in_progress" : s.status === "COMPLETED" ? "done" : "planned",
              startDate: startStr,
              endDate: endStr,
              startDisplay: new Date(startStr).toLocaleDateString("vi-VN"),
              endDisplay: new Date(endStr).toLocaleDateString("vi-VN"),
              ...calcGanttPos(startStr, endStr, calculatedStart, calculatedDays),
              progress: sProgress,
              points: sTotalPts,
              assignee: "Toàn đội",
              color: s.status === "COMPLETED" ? "bg-emerald-500" : s.status === "ACTIVE" ? "bg-blue-500" : "bg-slate-400",
            };
          });
          setEpics(mapped);
        }
      } catch (err) {
        // Backend error handled cleanly
      }
    };
    loadTimelineData();
    return () => {
      isMounted = false;
    };
  }, [project?.id, project?.owner, user?.name]);

  const handleCreateEpic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const gantt = calcGanttPos(newStart, newEnd, timelineStart, totalDays);
    const startParts = newStart.split("-");
    const endParts = newEnd.split("-");

    const newEpic: Epic = {
      id: "ep-" + Date.now(),
      key: `EPIC-0${epics.length + 1}`,
      title: newTitle.trim(),
      status: "in_progress",
      startDate: newStart,
      endDate: newEnd,
      startDisplay: `${startParts[2]}/${startParts[1]}/${startParts[0]}`,
      endDisplay: `${endParts[2]}/${endParts[1]}/${endParts[0]}`,
      ...gantt,
      progress: 10,
      points: Number(newPoints) || 5,
      assignee: newAssignee,
      color: "bg-indigo-500",
    };

    setEpics([...epics, newEpic]);
    setNewTitle("");
    setIsAddEpicOpen(false);
  };

  const filteredEpics = epics.filter(
    (e) => filterStatus === "all" || e.status === filterStatus
  );

  const totalPoints = epics.reduce((sum, e) => sum + e.points, 0);
  const completedPoints = epics
    .filter((e) => e.status === "done")
    .reduce((sum, e) => sum + e.points, 0);

  const weekColumns = React.useMemo(() => {
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarRange className="h-6 w-6 text-primary" /> Lộ trình & Lịch tiến độ
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 border rounded-lg p-0.5 bg-muted/30">
            <Button
              variant={filterStatus === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilterStatus("all")}
              className="text-xs h-7 px-2.5"
            >
              Tất cả ({epics.length})
            </Button>
            <Button
              variant={filterStatus === "in_progress" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilterStatus("in_progress")}
              className="text-xs h-7 px-2.5"
            >
              Đang làm
            </Button>
            <Button
              variant={filterStatus === "done" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilterStatus("done")}
              className="text-xs h-7 px-2.5"
            >
              Hoàn thành
            </Button>
          </div>

          <Button
            size="sm"
            onClick={() => setIsAddEpicOpen(true)}
            className="text-xs h-8 gap-1.5 shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" /> Thêm Epic
          </Button>
        </div>
      </div>

      {/* Overview Metric Banner */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs text-muted-foreground font-medium">Khối lượng & Điểm ước lượng</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold">{epics.length} Epics • {totalPoints} Points</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {epics.length > 0 ? `${epics.length} hạng mục trong lộ trình` : "Chưa có hạng mục lộ trình"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs text-muted-foreground font-medium">Tiến độ hoàn thành lộ trình</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {Math.round((completedPoints / (totalPoints || 1)) * 100)}% hoàn thành
            </div>
            <Progress value={(completedPoints / (totalPoints || 1)) * 100} className="h-1.5 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs text-muted-foreground font-medium">Sprint kế tiếp</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {epics.length > 0 ? (
              <>
                <div className="text-xl font-bold flex items-center gap-1.5 text-blue-600 dark:text-blue-400 truncate">
                  <Milestone className="h-4 w-4 shrink-0" /> {epics[0].title}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Thời hạn: <strong>{epics[0].endDisplay}</strong>
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

      {/* Detailed Gantt Chart View */}
      <Card>
        <CardHeader className="border-b pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <CardTitle className="text-base font-semibold">Trục thời gian chi tiết theo ngày & tuần</CardTitle>
              <CardDescription className="text-xs">
                Mốc ngày đỏ: <strong>Hôm nay ({TODAY_FORMATTED})</strong> • Chiều dài thanh phản ánh đúng số ngày thực tế
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
          <div className="min-w-[950px]">
            {/* Header Timeline Columns with exact dates */}
            <div className="grid grid-cols-12 border-b bg-slate-50 dark:bg-slate-900/60 text-[11px] font-semibold text-muted-foreground divide-x divide-border">
              <div className="col-span-4 p-3 text-left font-bold text-foreground">
                Hạng mục Epic / Công việc
              </div>
              <div className="col-span-8 grid grid-cols-6 divide-x divide-border text-center">
                {weekColumns.map((col) => (
                  <div
                    key={col.weekNum}
                    className={`p-2 ${col.isCurrent ? "bg-rose-50/30 dark:bg-rose-950/20" : ""}`}
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
                  left: `calc(33.333% + (66.666% * ${todayOffsetPercent / 100}))`,
                }}
              >
                <div className="h-full w-0.5 bg-rose-500 shadow-sm relative">
                  <div className="absolute -top-2 -translate-x-1/2 bg-rose-500 text-white text-[9px] font-bold px-1 py-0.2 rounded shadow-xs whitespace-nowrap">
                    {TODAY_SHORT} (Hôm nay)
                  </div>
                </div>
              </div>

              {filteredEpics.length === 0 ? (
                <div className="p-12 text-center text-xs text-muted-foreground">
                  Chưa có Epic hoặc Sprint nào trên lộ trình. Bấm &quot;Thêm Epic&quot; để thiết lập mục tiêu tiến độ!
                </div>
              ) : (
                filteredEpics.map((epic) => (
                  <div
                    key={epic.id}
                    className="grid grid-cols-12 items-center hover:bg-muted/30 transition-colors py-3.5 px-3"
                  >
                    {/* Left Column: Epic Details & Exact Dates */}
                    <div className="col-span-4 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {epic.key}
                        </span>
                        <span className="text-xs font-semibold text-foreground truncate" title={epic.title}>
                          {epic.title}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground mt-1.5 font-medium">
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-slate-300 dark:border-slate-700 font-mono">
                          {epic.startDisplay} → {epic.endDisplay}
                        </Badge>
                        <span>({epic.durationDays} ngày)</span>
                        <span>•</span>
                        <span>{epic.points} pts</span>
                        <span>•</span>
                        <span className="text-foreground">{epic.assignee}</span>
                      </div>
                    </div>

                    {/* Right Column: Exact Gantt Bar */}
                    <div className="col-span-8 relative h-8 bg-slate-100/70 dark:bg-slate-800/40 rounded-lg overflow-hidden flex items-center p-1 border border-border/50">
                      <div
                        className={`h-full rounded-md ${epic.color} text-white flex items-center justify-between px-2.5 text-[10px] font-semibold transition-all shadow-xs`}
                        style={{
                          marginLeft: `${epic.startOffsetPercent}%`,
                          width: `${epic.widthPercent}%`,
                          minWidth: "60px",
                        }}
                        title={`${epic.title}: ${epic.startDisplay} đến ${epic.endDisplay} (${epic.progress}%)`}
                      >
                        <span className="truncate">{epic.progress}%</span>
                        {epic.status === "done" ? (
                          <CheckCircle2 className="h-3 w-3 shrink-0 ml-1" />
                        ) : (
                          <span className="text-[9px] opacity-80 shrink-0 ml-1">{epic.durationDays}d</span>
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

      {/* Add Epic Dialog */}
      <Dialog open={isAddEpicOpen} onOpenChange={setIsAddEpicOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm Epic / Lộ trình mới</DialogTitle>
            <DialogDescription className="text-xs">
              Định nghĩa mục tiêu tính năng lớn cùng ngày bắt đầu và kết thúc cụ thể.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateEpic} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="epic-title" className="text-xs font-semibold">
                Tên Epic / Tính năng <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="epic-title"
                placeholder="VD: Cổng thanh toán VNPay & Momo..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="epic-start" className="text-xs font-semibold">
                  Ngày bắt đầu
                </Label>
                <Input
                  id="epic-start"
                  type="date"
                  value={newStart}
                  onChange={(e) => setNewStart(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="epic-end" className="text-xs font-semibold">
                  Ngày kết thúc
                </Label>
                <Input
                  id="epic-end"
                  type="date"
                  value={newEnd}
                  onChange={(e) => setNewEnd(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="epic-pts" className="text-xs">Story Points</Label>
                <Input
                  id="epic-pts"
                  type="number"
                  min={1}
                  max={50}
                  value={newPoints}
                  onChange={(e) => setNewPoints(Number(e.target.value))}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Người phụ trách</Label>
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

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddEpicOpen(false)}>
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
