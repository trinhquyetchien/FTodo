"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { 
  Plus, 
  FolderKanban, 
  Users, 
  ArrowRight, 
  Crown, 
  UserCheck, 
  CheckCircle2, 
  Layers,
  Search,
  X,
  Bell,
  Mail,
  Check,
  Clock,
  Sparkles,
  History,
  TrendingUp,
  Zap,
  BarChart2,
  Bug,
  Bookmark,
  CheckSquare,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Cell,
  Line,
  ComposedChart
} from "recharts";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { MockProject } from "@/lib/mock-data";
import {
  getStoredInvitations,
  respondToInvitation,
  getStoredActivityLogs,
  ProjectInvitation,
  ProjectActivityLog
} from "@/lib/activity-invitation-store";

export default function GlobalDashboard() {
  const { user } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [chartView, setChartView] = useState<"velocity" | "workmix" | "delivery">("velocity");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [allProjects, setAllProjects] = useState<MockProject[]>([]);
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [allSprints, setAllSprints] = useState<any[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "owned" | "member">("all");
  const [invitations, setInvitations] = useState<ProjectInvitation[]>([]);
  const [recentActivities, setRecentActivities] = useState<ProjectActivityLog[]>([]);

  // Load projects, tasks, and sprints from PostgreSQL database
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        setIsLoadingProjects(true);
        const res = await api.projects.getAll();
        if (isMounted && res) {
          const list = [...(res.owned || []), ...(res.memberOf || [])];
          setAllProjects(list);

          // Fetch tasks and sprints from primary projects to calculate real metrics
          if (list.length > 0) {
            const topProjects = list.slice(0, 3);
            const taskPromises = topProjects.map((p) => api.tasks.getTasks(p.id).catch(() => []));
            const sprintPromises = topProjects.map((p) => api.sprints.getSprints(p.id).catch(() => []));
            const [tasksResults, sprintsResults] = await Promise.all([
              Promise.all(taskPromises),
              Promise.all(sprintPromises),
            ]);
            if (isMounted) {
              setAllTasks(tasksResults.flat());
              setAllSprints(sprintsResults.flat());
            }
          }
        }
      } catch (err) {
        console.error("Lỗi khi tải dự án từ PostgreSQL:", err);
      } finally {
        if (isMounted) setIsLoadingProjects(false);
      }
      if (isMounted) {
        setInvitations(getStoredInvitations());
        setRecentActivities(getStoredActivityLogs().slice(0, 5));
      }
    };

    loadData();
    window.addEventListener("ftodo_invitations_updated", loadData);
    window.addEventListener("ftodo_activity_updated", loadData);
    window.addEventListener("storage", loadData);
    return () => {
      isMounted = false;
      window.removeEventListener("ftodo_invitations_updated", loadData);
      window.removeEventListener("ftodo_activity_updated", loadData);
      window.removeEventListener("storage", loadData);
    };
  }, [user]);

  const handleInvitationAction = (invId: string, action: "accepted" | "declined") => {
    respondToInvitation(invId, action);
    api.projects.getAll().then((res) => {
      if (res) {
        setAllProjects([...(res.owned || []), ...(res.memberOf || [])]);
      }
    }).catch(() => {});
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await api.projects.create({
        name: name.trim(),
        description: description.trim(),
      });
      const res = await api.projects.getAll();
      if (res) {
        setAllProjects([...(res.owned || []), ...(res.memberOf || [])]);
      }
      setName("");
      setDescription("");
      setIsCreateOpen(false);
    } catch (err: any) {
      alert(err.message || "Lỗi khi tạo dự án. Vui lòng thử lại.");
    }
  };

  const ownedProjects = allProjects.filter((p) => p.ownerId === user?.id || p.role === "owner");
  const memberProjects = allProjects.filter((p) => p.ownerId !== user?.id && p.role !== "owner");
  const totalProjects = allProjects.length;
  const totalTasks = allProjects.reduce((sum, p) => sum + (p.tasks || 0), 0);
  const completedTasks = allProjects.reduce((sum, p) => sum + (p.completedTasks || 0), 0);

  // Invitations addressed to the current user
  const myInvitations = invitations.filter(
    (i) => i.recipientEmail && user?.email && i.recipientEmail.toLowerCase() === user.email.toLowerCase()
  );
  const pendingInvitations = myInvitations.filter((i) => i.status === "pending");

  const filteredOwned = ownedProjects.filter((p) => {
    if (filterTab === "member") return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
  });

  const filteredMember = memberProjects.filter((p) => {
    if (filterTab === "owned") return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
  });

  const dynamicProjectDeliveryData = useMemo(() => {
    if (allProjects.length === 0) return [];
    const hasAnyTasks = allProjects.some((p) => (p.tasks || 0) > 0);
    if (!hasAnyTasks) return [];
    const colors = ["#6366f1", "#f59e0b", "#10b981", "#ec4899", "#8b5cf6", "#06b6d4"];
    return allProjects.slice(0, 6).map((p, idx) => {
      const done = p.completedTasks || 0;
      const total = p.tasks || 0;
      const remaining = Math.max(0, total - done);
      return {
        name: p.name.length > 18 ? p.name.slice(0, 16) + "..." : p.name,
        done,
        remaining,
        total,
        pct: p.progress || 0,
        color: colors[idx % colors.length],
      };
    });
  }, [allProjects]);

  const dynamicWorkMixData = useMemo(() => {
    if (allTasks.length === 0) {
      return [];
    }
    let storyCount = 0, storyPoints = 0;
    let taskCount = 0, taskPoints = 0;
    let bugCount = 0, bugPoints = 0;

    allTasks.forEach((t) => {
      const titleLower = (t.title || "").toLowerCase();
      const pts = t.points || 1;
      if (titleLower.includes("lỗi") || titleLower.includes("bug")) {
        bugCount++;
        bugPoints += pts;
      } else if (titleLower.includes("xác thực") || titleLower.includes("jwt") || titleLower.includes("hệ thống") || (t.points && t.points >= 8)) {
        storyCount++;
        storyPoints += pts;
      } else {
        taskCount++;
        taskPoints += pts;
      }
    });

    const totalPts = storyPoints + taskPoints + bugPoints || 1;
    return [
      { name: "User Stories (Tính năng)", count: storyCount, points: storyPoints, color: "#3b82f6", pct: Math.round((storyPoints / totalPts) * 100) },
      { name: "Technical Tasks (Hạ tầng/DevOps)", count: taskCount, points: taskPoints, color: "#10b981", pct: Math.round((taskPoints / totalPts) * 100) },
      { name: "Bug Fixes (Lỗi & Nợ kỹ thuật)", count: bugCount, points: bugPoints, color: "#f43f5e", pct: Math.round((bugPoints / totalPts) * 100) },
    ];
  }, [allTasks]);

  const dynamicSprintVelocityData = useMemo(() => {
    if (allSprints.length === 0) {
      return [];
    }
    return allSprints.slice(0, 4).reverse().map((s) => {
      const totalPts = Array.isArray(s.tasks) ? s.tasks.reduce((sum: number, t: any) => sum + (t.points || 0), 0) : 0;
      const donePts = Array.isArray(s.tasks) ? s.tasks.filter((t: any) => t.status === "DONE").reduce((sum: number, t: any) => sum + (t.points || 0), 0) : (s.status === "COMPLETED" ? totalPts : 0);
      return {
        sprint: s.name,
        committed: totalPts || 0,
        completed: donePts,
        velocityAvg: Math.round((totalPts + donePts) / 2),
      };
    });
  }, [allSprints]);

  const avgVelocity = useMemo(() => {
    if (dynamicSprintVelocityData.length === 0) return 0;
    const sum = dynamicSprintVelocityData.reduce((acc, s) => acc + s.completed, 0);
    return Number((sum / dynamicSprintVelocityData.length).toFixed(1));
  }, [dynamicSprintVelocityData]);

  const predictability = useMemo(() => {
    if (dynamicSprintVelocityData.length === 0) return 0;
    const committed = dynamicSprintVelocityData.reduce((acc, s) => acc + s.committed, 0);
    const completed = dynamicSprintVelocityData.reduce((acc, s) => acc + s.completed, 0);
    return committed > 0 ? Math.min(100, Math.round((completed / committed) * 100)) : 0;
  }, [dynamicSprintVelocityData]);

  const bugRatio = useMemo(() => {
    const bugEntry = dynamicWorkMixData.find((w) => w.name.includes("Bug"));
    return bugEntry ? bugEntry.pct : 0;
  }, [dynamicWorkMixData]);

  const isCurrentChartEmpty = useMemo(() => {
    if (chartView === "velocity") return dynamicSprintVelocityData.length === 0;
    if (chartView === "workmix") return dynamicWorkMixData.length === 0;
    if (chartView === "delivery") return dynamicProjectDeliveryData.length === 0;
    return false;
  }, [chartView, dynamicSprintVelocityData, dynamicWorkMixData, dynamicProjectDeliveryData]);

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 max-w-7xl mx-auto p-3 sm:p-6 md:p-8 w-full">
      {/* 1. Top Banner & Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Tổng quan hệ thống</h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Chào mừng trở lại, <strong className="text-foreground">{user?.name}</strong>! Theo dõi tất cả dự án bạn đang tham gia hoặc làm chủ.
          </p>
        </div>

        <div>
          <Button className="gap-2 shadow-sm" onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4" /> Tạo dự án mới
          </Button>
        </div>

        {/* Create Project Modal */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo dự án phần mềm mới</DialogTitle>
              <DialogDescription>
                Bắt đầu một dự án Scrum mới. Hệ thống sẽ tự động khởi tạo nhóm quyền và kênh trao đổi mặc định.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateProject} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="p-name">Tên dự án</Label>
                <Input
                  id="p-name"
                  placeholder="VD: Ứng dụng Quản lý Bán hàng"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-desc">Mô tả dự án (tùy chọn)</Label>
                <Input
                  id="p-desc"
                  placeholder="Mô tả mục tiêu và phạm vi của dự án..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={!name.trim()}>
                  Khởi tạo dự án
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* ======================================================== */}
      {/* 2. MAIN LAYOUT: 2 COLUMNS (CONTENT + RIGHT SIDEBAR)      */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ==================== LEFT / MAIN COLUMN ==================== */}
        <div className="lg:col-span-8 space-y-8 min-w-0">
          {/* 2.1 Key Metrics Summary Cards */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng số dự án</CardTitle>
                <FolderKanban className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProjects}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {ownedProjects.length} làm chủ • {memberProjects.length} tham gia
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dự án làm chủ (Owner)</CardTitle>
                <Crown className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {ownedProjects.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Toàn quyền quản trị & cài đặt</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dự án tham gia (Member)</CardTitle>
                <UserCheck className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {memberProjects.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Quyền hạn theo nhóm và cấp phép</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Công việc hoàn thành</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {completedTasks} / {totalTasks}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}% trên tổng khối lượng
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 2.2 Software Project Analytics & Velocity Health */}
          <Card className="border shadow-xs">
            <CardHeader className="pb-3 border-b">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <BarChart2 className="h-4 w-4 text-primary" />
                    Chỉ số Vận hành & Năng lực Đội ngũ (Software Delivery Metrics)
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    {chartView === "velocity" && "Đo lường độ ổn định cam kết Story Points hoàn thành qua các Sprint (Velocity)."}
                    {chartView === "workmix" && "Tỷ trọng đầu tư vào Tính năng mới (Stories) vs Hạ tầng (Tasks) vs Nợ kỹ thuật (Bugs)."}
                    {chartView === "delivery" && "So sánh tiến độ Story Points đã hoàn thành vs còn lại trên toàn bộ các dự án."}
                  </CardDescription>
                </div>

                {/* View Switcher Tabs */}
                <div className="flex items-center rounded-lg border bg-muted/40 p-0.5 text-xs shrink-0">
                  <button
                    onClick={() => setChartView("velocity")}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                      chartView === "velocity"
                        ? "bg-background text-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Zap className="h-3 w-3 text-amber-500" /> Vận tốc (Velocity)
                  </button>
                  <button
                    onClick={() => setChartView("workmix")}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                      chartView === "workmix"
                        ? "bg-background text-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Bug className="h-3 w-3 text-rose-500" /> Cơ cấu & Bug
                  </button>
                  <button
                    onClick={() => setChartView("delivery")}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                      chartView === "delivery"
                        ? "bg-background text-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Layers className="h-3 w-3 text-blue-500" /> Dự án
                  </button>
                </div>
              </div>

              {/* Sub-header KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-xs">
                <div className="p-2 rounded-lg bg-muted/30 border">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Vận tốc TB (Velocity)</span>
                  <div className="font-bold text-foreground text-sm flex items-center gap-1">
                    {avgVelocity} SP <span className="text-[10px] text-emerald-600 font-normal">/ Sprint</span>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-muted/30 border">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Độ tin cậy cam kết</span>
                  <div className="font-bold text-foreground text-sm flex items-center gap-1">
                    {predictability}% <span className="text-[10px] text-emerald-600 font-normal">Predictability</span>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-muted/30 border">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Tỷ lệ Bug nợ kỹ thuật</span>
                  <div className="font-bold text-foreground text-sm flex items-center gap-1">
                    {bugRatio}% <span className="text-[10px] text-emerald-600 font-normal">(Mức an toàn &lt; 20%)</span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-4 h-[250px] pl-0">
              {isCurrentChartEmpty ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground border-2 border-dashed rounded-lg mx-4">
                  <BarChart2 className="h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm font-medium">Chưa có dữ liệu biểu đồ</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Dữ liệu sẽ tự động hiển thị khi bạn tạo dự án, sprint và các thẻ công việc.
                  </p>
                </div>
              ) : (
                <>
                  {chartView === "velocity" && (
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={dynamicSprintVelocityData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis dataKey="sprint" axisLine={false} tickLine={false} fontSize={11} />
                        <YAxis axisLine={false} tickLine={false} fontSize={11} unit=" pts" />
                        <Tooltip formatter={(value: any) => [`${value} Story Points`, ""]} />
                        <Legend verticalAlign="top" height={32} iconSize={10} wrapperStyle={{ fontSize: "11px" }} />
                        <Bar dataKey="committed" name="Điểm Cam kết (Committed)" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="completed" name="Điểm Hoàn thành (Completed)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Line type="monotone" dataKey="velocityAvg" name="Mức TB (Velocity Target)" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  )}

                  {chartView === "workmix" && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dynamicWorkMixData} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                        <XAxis type="number" axisLine={false} tickLine={false} fontSize={11} unit="%" />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} fontSize={11} width={180} />
                        <Tooltip formatter={(val: any, name: any, item: any) => [`${item.payload.pct}% (${item.payload.points} SP - ${item.payload.count} tác vụ)`, "Tỷ trọng"]} />
                        <Bar dataKey="pct" radius={[0, 6, 6, 0]}>
                          {dynamicWorkMixData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}

                  {chartView === "delivery" && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dynamicProjectDeliveryData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={11} />
                        <YAxis axisLine={false} tickLine={false} fontSize={11} unit=" pts" />
                        <Tooltip formatter={(val: any, name: any) => [`${val} Story Points`, name === "done" ? "Đã xong" : "Còn lại"]} />
                        <Legend verticalAlign="top" height={32} iconSize={10} wrapperStyle={{ fontSize: "11px" }} />
                        <Bar dataKey="done" name="Đã bàn giao (Done SP)" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="remaining" name="Còn lại (Remaining SP)" stackId="a" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* 2.3 Projects Section & Search Bar */}
          <div className="space-y-6">
            {/* Search & Filter Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border bg-card shadow-xs">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm dự án theo tên hoặc mô tả..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-8 text-sm h-10 bg-background"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full"
                    title="Xóa tìm kiếm"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 shrink-0">
                <Button
                  variant={filterTab === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterTab("all")}
                  className="text-xs h-9"
                >
                  Tất cả ({totalProjects})
                </Button>
                <Button
                  variant={filterTab === "owned" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterTab("owned")}
                  className="text-xs h-9 gap-1.5"
                >
                  <Crown className="h-3.5 w-3.5 text-amber-500" /> Làm chủ ({ownedProjects.length})
                </Button>
                <Button
                  variant={filterTab === "member" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterTab("member")}
                  className="text-xs h-9 gap-1.5"
                >
                  <UserCheck className="h-3.5 w-3.5 text-blue-500" /> Tham gia ({memberProjects.length})
                </Button>
              </div>
            </div>

            {/* Empty state when search has no results */}
            {searchQuery.trim() && filteredOwned.length === 0 && filteredMember.length === 0 && (
              <div className="p-10 border border-dashed rounded-xl text-center bg-card space-y-2">
                <p className="text-sm font-medium">Không tìm thấy dự án nào khớp với từ khóa "{searchQuery}"</p>
                <p className="text-xs text-muted-foreground">Thử tìm kiếm với tên hoặc từ khóa khác, hoặc xóa ô tìm kiếm.</p>
                <Button variant="outline" size="sm" onClick={() => setSearchQuery("")} className="mt-2 text-xs">
                  Xóa bộ lọc tìm kiếm
                </Button>
              </div>
            )}

            {/* Section: Projects You Own */}
            {(filterTab === "all" || filterTab === "owned") && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <Crown className="h-5 w-5 text-amber-500" />
                  <h2 className="text-lg font-bold tracking-tight">Dự án của bạn (Làm chủ)</h2>
                  <Badge variant="secondary" className="ml-2 font-mono">
                    {filteredOwned.length}
                  </Badge>
                </div>

                {isLoadingProjects ? (
                  <div className="p-8 border border-dashed rounded-xl text-center text-muted-foreground text-sm bg-card animate-pulse">
                    Đang tải danh sách dự án từ cơ sở dữ liệu...
                  </div>
                ) : filteredOwned.length === 0 ? (
                  <div className="p-8 border border-dashed rounded-xl text-center text-muted-foreground text-sm bg-card">
                    {searchQuery
                      ? "Không có dự án làm chủ nào khớp với tìm kiếm."
                      : "Bạn chưa làm chủ dự án nào. Hãy nhấn \"Tạo dự án mới\" ở trên để bắt đầu!"}
                  </div>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2">
                    {filteredOwned.map((project) => (
                      <Card key={project.id} className="hover:shadow-md transition-shadow flex flex-col justify-between">
                        <CardHeader>
                          <div className="flex justify-between items-start gap-2">
                            <CardTitle className="text-base font-semibold leading-tight">{project.name}</CardTitle>
                            <Badge variant="default" className="text-[10px] bg-amber-600 hover:bg-amber-700 shrink-0">
                              👑 Chủ sở hữu
                            </Badge>
                          </div>
                          <CardDescription className="line-clamp-2 text-xs mt-1">
                            {project.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Tiến độ hoàn thành</span>
                              <span className="font-semibold text-foreground">{project.progress}%</span>
                            </div>
                            <Progress value={project.progress} className="h-1.5" />
                          </div>

                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
                            <div className="flex items-center gap-1.5">
                              <Layers className="h-3.5 w-3.5" />
                              <span>{project.tasks} công việc</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Users className="h-3.5 w-3.5" />
                              <span>{Array.isArray(project.members) ? project.members.length : (typeof project.members === "number" ? project.members : 1)} thành viên</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="pt-0">
                          <Link href={`/projects/${project.id}`} className="w-full">
                            <Button 
                              className="w-full gap-2 text-xs font-semibold h-9.5 rounded-xl shadow-xs transition-all bg-primary hover:bg-primary/90 text-primary-foreground hover:shadow-md hover:shadow-primary/25 hover:scale-[1.01] active:scale-[0.99] group cursor-pointer flex items-center justify-center"
                            >
                              <FolderKanban className="h-4 w-4 shrink-0" />
                              <span className="font-bold">Mở không gian làm việc</span>
                              <ArrowRight className="h-3.5 w-3.5 ml-auto transition-transform group-hover:translate-x-1 text-primary-foreground/90" />
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Section: Projects You Are Member Of */}
            {(filterTab === "all" || filterTab === "member") && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <UserCheck className="h-5 w-5 text-blue-500" />
                  <h2 className="text-lg font-bold tracking-tight">Dự án bạn tham gia (Thành viên)</h2>
                  <Badge variant="secondary" className="ml-2 font-mono">
                    {filteredMember.length}
                  </Badge>
                </div>

                {isLoadingProjects ? (
                  <div className="p-8 border border-dashed rounded-xl text-center text-muted-foreground text-sm bg-card animate-pulse">
                    Đang tải danh sách dự án từ cơ sở dữ liệu...
                  </div>
                ) : filteredMember.length === 0 ? (
                  <div className="p-8 border border-dashed rounded-xl text-center text-muted-foreground text-sm bg-card">
                    {searchQuery
                      ? "Không có dự án tham gia nào khớp với tìm kiếm."
                      : "Bạn chưa được mời vào dự án nào khác."}
                  </div>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2">
                    {filteredMember.map((project) => (
                      <Card key={project.id} className="hover:shadow-md transition-shadow flex flex-col justify-between">
                        <CardHeader>
                          <div className="flex justify-between items-start gap-2">
                            <CardTitle className="text-base font-semibold leading-tight">{project.name}</CardTitle>
                            <Badge variant="secondary" className="text-[10px] shrink-0">
                              Thành viên
                            </Badge>
                          </div>
                          <CardDescription className="line-clamp-2 text-xs mt-1">
                            {project.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Tiến độ hoàn thành</span>
                              <span className="font-semibold text-foreground">{project.progress}%</span>
                            </div>
                            <Progress value={project.progress} className="h-1.5" />
                          </div>

                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
                            <div className="flex items-center gap-1.5">
                              <Layers className="h-3.5 w-3.5" />
                              <span>{project.tasks} công việc</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Users className="h-3.5 w-3.5" />
                              <span>{Array.isArray(project.members) ? project.members.length : (typeof project.members === "number" ? project.members : 1)} thành viên</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="pt-0">
                          <Link href={`/projects/${project.id}`} className="w-full">
                            <Button 
                              className="w-full gap-2 text-xs font-semibold h-9.5 rounded-xl shadow-xs transition-all bg-primary hover:bg-primary/90 text-primary-foreground hover:shadow-md hover:shadow-primary/25 hover:scale-[1.01] active:scale-[0.99] group cursor-pointer flex items-center justify-center"
                            >
                              <FolderKanban className="h-4 w-4 shrink-0" />
                              <span className="font-bold">Mở không gian làm việc</span>
                              <ArrowRight className="h-3.5 w-3.5 ml-auto transition-transform group-hover:translate-x-1 text-primary-foreground/90" />
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ==================== RIGHT SIDEBAR ==================== */}
        <div className="lg:col-span-4 space-y-6">
          {/* 1. COMPACT PROJECT INVITATIONS CARD (Hiển thị nhỏ gọn bên thanh phải) */}
          <Card className="border shadow-xs overflow-hidden">
            <CardHeader className="p-4 pb-3 border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Mail className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold">Lời mời dự án</CardTitle>
                    <CardDescription className="text-[11px] leading-none mt-0.5">
                      {pendingInvitations.length > 0
                        ? `${pendingInvitations.length} lời mời đang chờ xử lý`
                        : "Hộp thư lời mời tham gia"}
                    </CardDescription>
                  </div>
                </div>
                {pendingInvitations.length > 0 ? (
                  <Badge variant="destructive" className="text-[10px] h-4.5 px-1.5 py-0 font-semibold animate-pulse">
                    {pendingInvitations.length} mới
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-[10px] h-4.5 px-1.5 py-0 text-muted-foreground">
                    0 mới
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-3 space-y-2.5">
              {myInvitations.length > 0 ? (
                myInvitations.map((inv) => {
                  const isPending = inv.status === "pending";
                  const isAccepted = inv.status === "accepted";

                  return (
                    <div
                      key={inv.id}
                      className={`p-3 rounded-xl border transition-all text-xs space-y-2 ${
                        isPending
                          ? "bg-card border-primary/30 shadow-2xs ring-1 ring-primary/10"
                          : isAccepted
                          ? "bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-800/40"
                          : "bg-muted/30 border-muted opacity-70"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-foreground text-xs leading-tight truncate">
                            {inv.projectName}
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                            Từ: <strong className="text-foreground">{inv.inviterName}</strong> • Vai trò: <strong className="text-foreground">{inv.roleGroupName}</strong>
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {inv.createdAt}
                          </div>
                        </div>
                      </div>

                      {/* Compact Actions */}
                      {isPending ? (
                        <div className="flex items-center gap-1.5 pt-1">
                          <Button
                            size="sm"
                            onClick={() => handleInvitationAction(inv.id, "accepted")}
                            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium gap-1 flex-1 shadow-2xs"
                          >
                            <Check className="h-3 w-3" /> Chấp nhận
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleInvitationAction(inv.id, "declined")}
                            className="h-7 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 gap-1 flex-1"
                          >
                            <X className="h-3 w-3" /> Từ chối
                          </Button>
                        </div>
                      ) : isAccepted ? (
                        <div className="flex items-center justify-between pt-1 text-[11px]">
                          <Badge variant="outline" className="text-[10px] bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border-emerald-200 gap-1">
                            <Check className="h-2.5 w-2.5" /> Đã tham gia
                          </Badge>
                          <Link href={`/projects/${inv.projectId}`}>
                            <Button size="sm" variant="ghost" className="h-6 text-[11px] text-primary gap-1 px-1.5">
                              Vào dự án <ArrowRight className="h-3 w-3" />
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between pt-1 text-[11px]">
                          <Badge variant="outline" className="text-[10px] text-rose-600 border-rose-200 bg-rose-50/50 gap-1">
                            <X className="h-2.5 w-2.5" /> Đã từ chối
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleInvitationAction(inv.id, "accepted")}
                            className="h-6 text-[10px] text-muted-foreground hover:text-foreground px-1.5"
                          >
                            Đổi ý: Chấp nhận
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  <Mail className="h-6 w-6 mx-auto text-muted-foreground/40 mb-1.5" />
                  Bạn chưa có lời mời tham gia dự án nào.
                </div>
              )}
            </CardContent>
          </Card>

          {/* 2. RECENT ACTIVITY LOGS (Lịch sử hoạt động gần đây) */}
          <Card className="border shadow-xs overflow-hidden">
            <CardHeader className="p-4 pb-3 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                  <History className="h-3.5 w-3.5" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold">Lịch sử hoạt động</CardTitle>
                  <CardDescription className="text-[11px] leading-none mt-0.5">
                    Nhật ký thao tác hệ thống gần đây
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 space-y-2.5">
              {recentActivities.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-xs">
                  Chưa có hoạt động nào được ghi nhận.
                </div>
              ) : (
                recentActivities.map((act) => (
                  <div key={act.id} className="text-xs space-y-1 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <span className="h-4.5 w-4.5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px] font-bold">
                          {act.userAvatar}
                        </span>
                        {act.userName}
                      </span>
                      <span className="text-[10px]">{act.timeAgo}</span>
                    </div>
                    <p className="text-xs text-foreground/90 pl-6 leading-relaxed">
                      <span className="text-muted-foreground font-medium">{act.action}:</span> {act.detail}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
