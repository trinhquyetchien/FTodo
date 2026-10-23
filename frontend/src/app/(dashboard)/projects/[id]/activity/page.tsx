"use client";

import React, { useState, useEffect } from "react";
import {
  History,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  DollarSign,
  Users,
  FileText,
  Settings,
  Clock,
  Sparkles,
  Calendar,
  RotateCcw,
  CheckSquare,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProject } from "../project-context";
import { api } from "@/lib/api";

export default function ProjectActivityPage() {
  const { project, isOwner } = useProject();
  const projectId = project?.id || "";

  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterMember, setFilterMember] = useState<string>("all");

  const loadLogs = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const data = await api.activities.getAll(projectId);
      setLogs(data);
    } catch (err) {
      console.error("Lỗi khi tải nhật ký hoạt động:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
    window.addEventListener("ftodo_activity_updated", loadLogs);
    return () => {
      window.removeEventListener("ftodo_activity_updated", loadLogs);
    };
  }, [projectId]);

  // Unique members for filter
  const uniqueMembers = Array.from(new Set(logs.map((l) => l.userName)));

  // Filtered logs
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      search.trim() === "" ||
      log.userName.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.detail.toLowerCase().includes(search.toLowerCase()) ||
      log.timestamp.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = filterCategory === "all" || log.category === filterCategory;
    const matchesMember = filterMember === "all" || log.userName === filterMember;

    return matchesSearch && matchesCategory && matchesMember;
  });

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "task":
        return (
          <Badge variant="outline" className="text-[10px] border-blue-400 text-blue-600 bg-blue-50 dark:bg-blue-950/20 gap-1 font-medium">
            <CheckSquare className="h-3 w-3" /> Tác vụ & Story
          </Badge>
        );
      case "cost":
        return (
          <Badge variant="outline" className="text-[10px] border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 gap-1 font-medium">
            <DollarSign className="h-3 w-3" /> Chi phí & Duyệt chi
          </Badge>
        );
      case "member":
        return (
          <Badge variant="outline" className="text-[10px] border-violet-400 text-violet-600 bg-violet-50 dark:bg-violet-950/20 gap-1 font-medium">
            <Users className="h-3 w-3" /> Nhân sự & Lời mời
          </Badge>
        );
      case "report":
        return (
          <Badge variant="outline" className="text-[10px] border-amber-400 text-amber-600 bg-amber-50 dark:bg-amber-950/20 gap-1 font-medium">
            <FileText className="h-3 w-3" /> Báo cáo Sprint
          </Badge>
        );
      case "settings":
        return (
          <Badge variant="outline" className="text-[10px] border-slate-400 text-slate-600 bg-slate-50 dark:bg-slate-950/20 gap-1 font-medium">
            <Settings className="h-3 w-3" /> Cấu hình dự án
          </Badge>
        );
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes("xóa") || action.includes("thu hồi") || action.includes("từ chối")) {
      return "text-rose-600 dark:text-rose-400 font-semibold";
    }
    if (action.includes("phê duyệt") || action.includes("hoàn thành") || action.includes("chấp nhận")) {
      return "text-emerald-600 dark:text-emerald-400 font-semibold";
    }
    if (action.includes("gửi") || action.includes("đề xuất") || action.includes("tạo mới")) {
      return "text-blue-600 dark:text-blue-400 font-semibold";
    }
    return "text-foreground font-medium";
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <History className="h-6 w-6 text-primary" /> Nhật ký & Lịch sử hoạt động
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadLogs}
            className="text-xs gap-1.5 h-8"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Làm mới dữ liệu
          </Button>

          <Badge variant="outline" className="text-xs font-mono h-8 px-2.5">
            Tổng cộng: {logs.length} bản ghi
          </Badge>
        </div>
      </div>

      {/* 2. Quick Highlight Metrics */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-muted-foreground font-medium">Hành động ghi nhận</div>
              <div className="text-xl font-bold text-foreground mt-0.5">{logs.length} thao tác</div>
            </div>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <History className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-muted-foreground font-medium">Thao tác Task & Story</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                {logs.filter((l) => l.category === "task").length} lần
              </div>
            </div>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <CheckSquare className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-muted-foreground font-medium">Duyệt & Đề xuất chi phí</div>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {logs.filter((l) => l.category === "cost").length} lần
              </div>
            </div>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-muted-foreground font-medium">Nhân sự & Lời mời</div>
              <div className="text-xl font-bold text-violet-600 dark:text-violet-400 mt-0.5">
                {logs.filter((l) => l.category === "member").length} sự kiện
              </div>
            </div>
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-500">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Filters & Search Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo người thực hiện, tên task bị xóa, nội dung duyệt chi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Select value={filterCategory} onValueChange={(val) => setFilterCategory(val || "all")}>
                <SelectTrigger className="w-[160px] h-9 text-xs">
                  <SelectValue placeholder="Phân loại hoạt động" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả phân loại</SelectItem>
                  <SelectItem value="task">Tác vụ & Story</SelectItem>
                  <SelectItem value="cost">Chi phí & Ngân sách</SelectItem>
                  <SelectItem value="member">Nhân sự & Lời mời</SelectItem>
                  <SelectItem value="report">Báo cáo tiến độ</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterMember} onValueChange={(val) => setFilterMember(val || "all")}>
                <SelectTrigger className="w-[160px] h-9 text-xs">
                  <SelectValue placeholder="Thành viên thực hiện" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả thành viên</SelectItem>
                  {uniqueMembers.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(search || filterCategory !== "all" || filterMember !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setFilterCategory("all");
                    setFilterMember("all");
                  }}
                  className="text-xs h-9 text-rose-600 hover:text-rose-700"
                >
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Timeline Feed */}
      <Card>
        <CardHeader className="border-b pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">
              Dòng thời gian hoạt động ({filteredLogs.length} kết quả)
            </CardTitle>
            <span className="text-xs text-muted-foreground">Sắp xếp theo thứ tự mới nhất</span>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              {logs.length === 0
                ? "Chưa có nhật ký hoạt động nào được ghi nhận cho dự án này."
                : "Không tìm thấy nhật ký hoạt động nào phù hợp với bộ lọc tìm kiếm."}
            </div>
          ) : (
            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2 sm:before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-border">
              {filteredLogs.map((log) => {
                const isDelete = log.action.includes("xóa") || log.action.includes("thu hồi");
                const isApprove = log.action.includes("phê duyệt") || log.action.includes("chấp nhận");

                return (
                  <div key={log.id} className="relative group">
                    {/* Circle Pin Marker */}
                    <div
                      className={`absolute -left-[27px] sm:-left-[35px] top-1 h-5 w-5 rounded-full border-2 bg-background flex items-center justify-center ${
                        isDelete
                          ? "border-rose-500 text-rose-500"
                          : isApprove
                          ? "border-emerald-500 text-emerald-500"
                          : "border-primary text-primary"
                      }`}
                    >
                      <div
                        className={`h-2 w-2 rounded-full ${
                          isDelete ? "bg-rose-500" : isApprove ? "bg-emerald-500" : "bg-primary"
                        }`}
                      />
                    </div>

                    {/* Activity Card Box */}
                    <div className="bg-card border rounded-xl p-4 shadow-2xs hover:shadow-sm transition-all space-y-2.5">
                      {/* Top Line: User, Action, Category Badge & Time */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                              {log.userAvatar}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex items-baseline gap-1.5 flex-wrap text-xs">
                            <strong className="text-foreground">{log.userName}</strong>
                            <span className="text-[10px] text-muted-foreground">({log.userRole})</span>
                            <span className={getActionColor(log.action)}>{log.action}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                          {getCategoryBadge(log.category)}
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                            <Clock className="h-3 w-3" /> {log.timestamp} ({log.timeAgo})
                          </span>
                        </div>
                      </div>

                      {/* Detail Box: Emphasized with specific colors */}
                      <div
                        className={`p-3 rounded-lg border text-xs leading-relaxed ${
                          isDelete
                            ? "bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 text-rose-950 dark:text-rose-200"
                            : isApprove
                            ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-950 dark:text-emerald-200"
                            : "bg-muted/30 border-muted text-foreground"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {isDelete ? (
                            <Trash2 className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                          ) : isApprove ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          ) : (
                            <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 font-sans">
                            {log.detail}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
