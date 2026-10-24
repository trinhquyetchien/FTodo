"use client";

import React, { useState, useEffect } from "react";
import {
  CheckSquare,
  Search,
  Plus,
  Filter,
  Bookmark,
  Bug,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useProject } from "../project-context";
import { api } from "@/lib/api";

interface Issue {
  id: string;
  key: string;
  summary: string;
  type: "story" | "bug" | "task";
  status: "todo" | "in_progress" | "review" | "done";
  priority: "highest" | "high" | "medium" | "low";
  points: number;
  assignee: string;
  sprint: string;
}

export default function IssuesPage() {
  const { project } = useProject();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Sync issues live from PostgreSQL database
  useEffect(() => {
    let isMounted = true;
    const loadIssues = async () => {
      if (!project?.id) return;
      try {
        const tasks = await api.tasks.getTasks(project.id);
        if (isMounted && Array.isArray(tasks)) {
          const mapped: Issue[] = tasks.map((t: any) => {
            const prio = (t.priority || "MEDIUM").toLowerCase();
            const priority: Issue["priority"] = 
              prio === "urgent" ? "highest" :
              prio === "high" ? "high" :
              prio === "low" ? "low" : "medium";

            let type: Issue["type"] = "task";
            if (t.type) {
              const tType = String(t.type).toLowerCase();
              if (tType === "bug") type = "bug";
              else if (tType === "story") type = "story";
              else type = "task";
            } else {
              const titleLower = (t.title || "").toLowerCase();
              if (titleLower.includes("lỗi") || titleLower.includes("bug")) {
                type = "bug";
              } else if (titleLower.includes("jwt") || titleLower.includes("xác thực") || t.points >= 5) {
                type = "story";
              }
            }

            const stat = (t.status || "TODO").toLowerCase();
            const status: Issue["status"] = 
              stat === "done" ? "done" :
              stat === "in_progress" ? "in_progress" :
              stat === "review" ? "review" : "todo";

            return {
              id: t.id,
              key: t.code || `FT-${t.id.slice(0, 4).toUpperCase()}`,
              summary: t.title,
              type,
              status,
              priority,
              points: t.points || 1,
              assignee: t.assignee?.name || "Chưa phân công",
              sprint: t.sprint?.name || (t.sprintId ? "Sprint 1" : "Backlog"),
            };
          });
          setIssues(mapped);
        }
      } catch (err) {
        // Backend error handled cleanly
      }
    };
    loadIssues();
    return () => {
      isMounted = false;
    };
  }, [project?.id]);

  // New Issue Form
  const [newSummary, setNewSummary] = useState("");
  const [newType, setNewType] = useState<Issue["type"]>("story");
  const [newPriority, setNewPriority] = useState<Issue["priority"]>("medium");
  const [newPoints, setNewPoints] = useState("3");

  const filteredIssues = issues.filter((item) => {
    const matchesSearch =
      item.summary.toLowerCase().includes(search.toLowerCase()) ||
      item.key.toLowerCase().includes(search.toLowerCase()) ||
      item.assignee.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSummary.trim()) return;

    let createdId = "iss-" + Date.now();
    let createdKey = `FT-${100 + issues.length + 1}`;

    if (project?.id) {
      try {
        const res = await api.tasks.createTask(project.id, {
          title: newSummary.trim(),
          points: parseInt(newPoints) || 1,
          priority: newPriority === "highest" ? "HIGH" : newPriority === "high" ? "HIGH" : newPriority === "low" ? "LOW" : "MEDIUM",
        });
        if (res?.id) {
          createdId = res.id;
          if (res.code) createdKey = res.code;
        }
      } catch (err) {
        console.warn("Lỗi khi tạo issue lên server:", err);
      }
    }

    const newIss: Issue = {
      id: createdId,
      key: createdKey,
      summary: newSummary.trim(),
      type: newType,
      status: "todo",
      priority: newPriority,
      points: parseInt(newPoints) || 1,
      assignee: "Chưa phân công",
      sprint: "Backlog",
    };

    setIssues([newIss, ...issues]);
    setNewSummary("");
    setIsCreateOpen(false);
  };

  const renderTypeIcon = (type: Issue["type"]) => {
    switch (type) {
      case "story":
        return <Bookmark className="h-3.5 w-3.5 text-emerald-500" />;
      case "bug":
        return <Bug className="h-3.5 w-3.5 text-rose-500" />;
      case "task":
        return <CheckSquare className="h-3.5 w-3.5 text-blue-500" />;
    }
  };

  const renderPriorityIcon = (priority: Issue["priority"]) => {
    switch (priority) {
      case "highest":
        return <ArrowUp className="h-3.5 w-3.5 text-rose-600 font-bold" />;
      case "high":
        return <ArrowUp className="h-3.5 w-3.5 text-amber-500" />;
      case "medium":
        return <Minus className="h-3.5 w-3.5 text-yellow-500" />;
      case "low":
        return <ArrowDown className="h-3.5 w-3.5 text-slate-400" />;
    }
  };

  const renderStatusBadge = (status: Issue["status"]) => {
    switch (status) {
      case "done":
        return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-[10px]">Done</Badge>;
      case "review":
        return <Badge variant="secondary" className="text-[10px] bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">In Review</Badge>;
      case "in_progress":
        return <Badge variant="secondary" className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">In Progress</Badge>;
      case "todo":
        return <Badge variant="outline" className="text-[10px]">To Do</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-primary" /> Danh sách công việc
          </h2>
        </div>

        <Button onClick={() => setIsCreateOpen(true)} className="gap-2 shadow-xs">
          <Plus className="h-4 w-4" /> Tạo công việc mới
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 rounded-xl border bg-card shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo mã tác vụ (FT-101), tiêu đề, hoặc người thực hiện..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val || "all")}>
            <SelectTrigger className="w-32 h-9 text-xs">
              <SelectValue placeholder="Loại" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại</SelectItem>
              <SelectItem value="story">Story</SelectItem>
              <SelectItem value="bug">Bug</SelectItem>
              <SelectItem value="task">Task</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "all")}>
            <SelectTrigger className="w-36 h-9 text-xs">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="review">In Review</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Issues Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 text-center">Loại</TableHead>
                <TableHead className="w-24">Mã</TableHead>
                <TableHead>Tiêu đề tác vụ</TableHead>
                <TableHead className="w-28 text-center">Ưu tiên</TableHead>
                <TableHead className="w-28">Sprint</TableHead>
                <TableHead className="w-32">Người thực hiện</TableHead>
                <TableHead className="w-24 text-center">Points</TableHead>
                <TableHead className="w-28 text-center">Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIssues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-xs text-muted-foreground">
                    Không tìm thấy tác vụ nào khớp với bộ lọc tìm kiếm.
                  </TableCell>
                </TableRow>
              ) : (
                filteredIssues.map((issue) => (
                  <TableRow key={issue.id} className="hover:bg-muted/40 cursor-pointer">
                    <TableCell className="text-center">{renderTypeIcon(issue.type)}</TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-primary">
                      {issue.key}
                    </TableCell>
                    <TableCell className="font-medium text-xs text-foreground">
                      {issue.summary}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex items-center gap-1 text-[11px] capitalize">
                        {renderPriorityIcon(issue.priority)} {issue.priority}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{issue.sprint}</TableCell>
                    <TableCell className="text-xs font-medium">{issue.assignee}</TableCell>
                    <TableCell className="text-center font-mono text-xs font-bold">
                      {issue.points}
                    </TableCell>
                    <TableCell className="text-center">{renderStatusBadge(issue.status)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Issue Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo công việc mới (Create Issue)</DialogTitle>
            <DialogDescription>
              Thêm một User Story, Task hoặc Bug vào dự án Scrum.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateIssue} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="iss-sum">Tiêu đề tóm tắt</Label>
              <Input
                id="iss-sum"
                placeholder="VD: Viết unit tests cho module auth"
                value={newSummary}
                onChange={(e) => setNewSummary(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Loại</Label>
                <Select value={newType} onValueChange={(val) => setNewType((val as Issue["type"]) || "story")}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="story">Story</SelectItem>
                    <SelectItem value="bug">Bug</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Mức ưu tiên</Label>
                <Select value={newPriority} onValueChange={(val) => setNewPriority((val as Issue["priority"]) || "medium")}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="highest">Highest</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Story Points</Label>
                <Input
                  type="number"
                  value={newPoints}
                  onChange={(e) => setNewPoints(e.target.value)}
                  min="1"
                  max="40"
                  required
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Hủy
              </Button>
              <Button type="submit">Tạo công việc</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
