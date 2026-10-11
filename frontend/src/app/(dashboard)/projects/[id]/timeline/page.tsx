"use client";

import React, { useState } from "react";
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

// Timeline period: 01/10/2026 -> 15/11/2026 (46 days)
const TIMELINE_START = new Date("2026-10-01");
const TOTAL_DAYS = 46;

const calcGanttPos = (startStr: string, endStr: string) => {
  const start = new Date(startStr);
  const end = new Date(endStr);
  const diffStartDays = Math.max(0, (start.getTime() - TIMELINE_START.getTime()) / (1000 * 3600 * 24));
  const duration = Math.max(1, (end.getTime() - start.getTime()) / (1000 * 3600 * 24) + 1);

  const startPercent = (diffStartDays / TOTAL_DAYS) * 100;
  const widthPercent = (duration / TOTAL_DAYS) * 100;

  return {
    startOffsetPercent: Math.min(Math.max(startPercent, 0), 95),
    widthPercent: Math.min(Math.max(widthPercent, 5), 100 - startPercent),
    durationDays: Math.round(duration),
  };
};

const INITIAL_EPICS: Epic[] = [
  {
    id: "ep-1",
    key: "EPIC-01",
    title: "Kiến trúc Xác thực JWT & Phân quyền Chủ/Thành viên",
    status: "done",
    startDate: "2026-10-01",
    endDate: "2026-10-08",
    startDisplay: "01/10/2026",
    endDisplay: "08/10/2026",
    ...calcGanttPos("2026-10-01", "2026-10-08"),
    progress: 100,
    points: 13,
    assignee: "Trịnh Quyết Chiến",
    color: "bg-emerald-500",
  },
  {
    id: "ep-2",
    key: "EPIC-02",
    title: "Bảng Scrum Kéo Thả (Kanban DnD) & Sprint 1",
    status: "in_progress",
    startDate: "2026-10-05",
    endDate: "2026-10-18",
    startDisplay: "05/10/2026",
    endDisplay: "18/10/2026",
    ...calcGanttPos("2026-10-05", "2026-10-18"),
    progress: 85,
    points: 21,
    assignee: "Nguyễn Văn An",
    color: "bg-blue-500",
  },
  {
    id: "ep-3",
    key: "EPIC-03",
    title: "Quản lý Chi phí: Đề xuất chi tiêu & Sếp phê duyệt",
    status: "in_progress",
    startDate: "2026-10-10",
    endDate: "2026-10-25",
    startDisplay: "10/10/2026",
    endDisplay: "25/10/2026",
    ...calcGanttPos("2026-10-10", "2026-10-25"),
    progress: 55,
    points: 16,
    assignee: "Nguyễn Văn An",
    color: "bg-violet-500",
  },
  {
    id: "ep-4",
    key: "EPIC-04",
    title: "Kênh Chat Realtime & Xuất báo cáo PDF cho Sếp",
    status: "in_progress",
    startDate: "2026-10-12",
    endDate: "2026-10-28",
    startDisplay: "12/10/2026",
    endDisplay: "28/10/2026",
    ...calcGanttPos("2026-10-12", "2026-10-28"),
    progress: 40,
    points: 18,
    assignee: "Trần Thị Bình",
    color: "bg-amber-500",
  },
  {
    id: "ep-5",
    key: "EPIC-05",
    title: "Triển khai Cloud Server, Tự động hóa CI/CD & Production",
    status: "planned",
    startDate: "2026-10-26",
    endDate: "2026-11-12",
    startDisplay: "26/10/2026",
    endDisplay: "12/11/2026",
    ...calcGanttPos("2026-10-26", "2026-11-12"),
    progress: 0,
    points: 15,
    assignee: "Trịnh Quyết Chiến",
    color: "bg-slate-400 dark:bg-slate-600",
  },
];

// Today line calculation: 11/10/2026
const TODAY = new Date("2026-10-11");
const TODAY_OFFSET_PERCENT =
  ((TODAY.getTime() - TIMELINE_START.getTime()) / (1000 * 3600 * 24) / TOTAL_DAYS) * 100;

export default function TimelinePage() {
  const { project, isOwner } = useProject();
  const [epics, setEpics] = useState<Epic[]>(INITIAL_EPICS);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Add Epic modal
  const [isAddEpicOpen, setIsAddEpicOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newStart, setNewStart] = useState("2026-10-15");
  const [newEnd, setNewEnd] = useState("2026-10-30");
  const [newAssignee, setNewAssignee] = useState("Nguyễn Văn An");
  const [newPoints, setNewPoints] = useState(10);

  const handleCreateEpic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const gantt = calcGanttPos(newStart, newEnd);
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

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarRange className="h-6 w-6 text-primary" /> Lộ trình & Lịch tiến độ (Gantt Timeline)
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Hiển thị chi tiết ngày bắt đầu, ngày kết thúc và thời lượng thực tế của từng Epic từ{" "}
            <strong>01/10/2026 đến 15/11/2026</strong>.
          </p>
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
              Thời gian lộ trình: 46 ngày công tác
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
            <CardTitle className="text-xs text-muted-foreground font-medium">Cột mốc bàn giao gần nhất</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
              <Milestone className="h-4 w-4" /> Bản Release v1.0
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Hạn chót: <strong>18/10/2026</strong> (Còn 7 ngày)
            </p>
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
                Mốc ngày đỏ: <strong>Hôm nay (11/10/2026)</strong> • Chiều dài thanh phản ánh đúng số ngày thực tế
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs border-rose-400 text-rose-600 bg-rose-50 dark:bg-rose-950/30 gap-1 font-mono">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                Hôm nay: 11/10/2026
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
                <div className="p-2">
                  <div className="font-bold text-foreground">Tuần 1</div>
                  <div className="text-[10px] text-muted-foreground">01/10 - 07/10</div>
                </div>
                <div className="p-2 bg-rose-50/30 dark:bg-rose-950/20">
                  <div className="font-bold text-rose-600 dark:text-rose-400">Tuần 2 (Hiện tại)</div>
                  <div className="text-[10px] text-rose-500">08/10 - 14/10</div>
                </div>
                <div className="p-2">
                  <div className="font-bold text-foreground">Tuần 3</div>
                  <div className="text-[10px] text-muted-foreground">15/10 - 21/10</div>
                </div>
                <div className="p-2">
                  <div className="font-bold text-foreground">Tuần 4</div>
                  <div className="text-[10px] text-muted-foreground">22/10 - 28/10</div>
                </div>
                <div className="p-2">
                  <div className="font-bold text-foreground">Tuần 5</div>
                  <div className="text-[10px] text-muted-foreground">29/10 - 04/11</div>
                </div>
                <div className="p-2">
                  <div className="font-bold text-foreground">Tuần 6</div>
                  <div className="text-[10px] text-muted-foreground">05/11 - 15/11</div>
                </div>
              </div>
            </div>

            {/* Gantt Rows */}
            <div className="divide-y relative">
              {/* Vertical Today Line */}
              <div
                className="absolute top-0 bottom-0 z-10 pointer-events-none"
                style={{
                  left: `calc(33.333% + (66.666% * ${TODAY_OFFSET_PERCENT / 100}))`,
                }}
              >
                <div className="h-full w-0.5 bg-rose-500 shadow-sm relative">
                  <div className="absolute -top-2 -translate-x-1/2 bg-rose-500 text-white text-[9px] font-bold px-1 py-0.2 rounded shadow-xs whitespace-nowrap">
                    11/10 (Hôm nay)
                  </div>
                </div>
              </div>

              {filteredEpics.map((epic) => (
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
              ))}
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
                <Select value={newAssignee} onValueChange={(val) => setNewAssignee(val || "Trịnh Quyết Chiến")}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Trịnh Quyết Chiến">Trịnh Quyết Chiến (Chủ dự án)</SelectItem>
                    <SelectItem value="Nguyễn Văn An">Nguyễn Văn An (DEV Lead)</SelectItem>
                    <SelectItem value="Trần Thị Bình">Trần Thị Bình (QA Lead)</SelectItem>
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
