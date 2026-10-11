"use client";

import { useEffect, useState } from "react";
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
  History
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
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useAuth } from "@/lib/auth-context";
import { INITIAL_MOCK_PROJECTS_LIST, MockProject } from "@/lib/mock-data";
import {
  getStoredInvitations,
  respondToInvitation,
  getStoredActivityLogs,
  ProjectInvitation,
  ProjectActivityLog
} from "@/lib/activity-invitation-store";

const dataCharts = [
  { name: "T2", tasks: 4 },
  { name: "T3", tasks: 7 },
  { name: "T4", tasks: 2 },
  { name: "T5", tasks: 5 },
  { name: "T6", tasks: 8 },
  { name: "T7", tasks: 3 },
  { name: "CN", tasks: 1 },
];

export default function GlobalDashboard() {
  const { user } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [allProjects, setAllProjects] = useState<MockProject[]>(INITIAL_MOCK_PROJECTS_LIST);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "owned" | "member">("all");
  const [invitations, setInvitations] = useState<ProjectInvitation[]>([]);
  const [recentActivities, setRecentActivities] = useState<ProjectActivityLog[]>([]);

  // Load from localStorage or initialize
  useEffect(() => {
    const loadData = () => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("ftodo_mock_projects");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            const list = Array.isArray(parsed)
              ? parsed
              : [...(parsed.owned || []), ...(parsed.memberOf || [])];
            setAllProjects(list);
          } catch {
            setAllProjects(INITIAL_MOCK_PROJECTS_LIST);
          }
        } else {
          localStorage.setItem("ftodo_mock_projects", JSON.stringify(INITIAL_MOCK_PROJECTS_LIST));
        }
      }
      setInvitations(getStoredInvitations());
      setRecentActivities(getStoredActivityLogs().slice(0, 5));
    };

    loadData();
    window.addEventListener("ftodo_invitations_updated", loadData);
    window.addEventListener("ftodo_activity_updated", loadData);
    window.addEventListener("storage", loadData);
    return () => {
      window.removeEventListener("ftodo_invitations_updated", loadData);
      window.removeEventListener("ftodo_activity_updated", loadData);
      window.removeEventListener("storage", loadData);
    };
  }, []);

  const handleInvitationAction = (invId: string, action: "accepted" | "declined") => {
    respondToInvitation(invId, action);
    // Reload projects list if accepted
    if (action === "accepted" && typeof window !== "undefined") {
      const saved = localStorage.getItem("ftodo_mock_projects");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const list = Array.isArray(parsed)
            ? parsed
            : [...(parsed.owned || []), ...(parsed.memberOf || [])];
          setAllProjects(list);
        } catch {}
      }
    }
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProject: MockProject = {
      id: "proj-" + Date.now(),
      name: name.trim(),
      description: description.trim() || "Dự án mới tạo",
      ownerId: user.id,
      progress: 0,
      tasks: 0,
      completedTasks: 0,
      members: 1,
      createdAt: new Date().toLocaleDateString("vi-VN"),
    };

    const updated = [newProject, ...allProjects];
    setAllProjects(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("ftodo_mock_projects", JSON.stringify(updated));
    }

    setName("");
    setDescription("");
    setIsCreateOpen(false);
  };

  const ownedProjects = allProjects.filter((p) => p.ownerId === user.id);
  const memberProjects = allProjects.filter((p) => p.ownerId !== user.id);
  const totalProjects = allProjects.length;
  const totalTasks = allProjects.reduce((sum, p) => sum + (p.tasks || 0), 0);
  const completedTasks = allProjects.reduce((sum, p) => sum + (p.completedTasks || 0), 0);

  // Invitations addressed to the current user
  const myInvitations = invitations.filter(
    (i) => i.recipientEmail === user?.email || i.recipientName === user?.name || i.id === "inv-1" || i.id === "inv-2"
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

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto p-6 md:p-8 w-full">
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

          {/* 2.2 Analytics Chart */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Tần suất hoàn thành công việc theo tuần</CardTitle>
              <CardDescription className="text-xs">Biểu đồ số lượng tác vụ bạn đã hoàn thành mỗi ngày trong chu kỳ làm việc</CardDescription>
            </CardHeader>
            <CardContent className="pl-0 h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataCharts} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                  <YAxis axisLine={false} tickLine={false} fontSize={12} />
                  <Tooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} />
                  <Bar dataKey="tasks" fill="#0f172a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
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

              <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto pb-1 sm:pb-0">
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

                {filteredOwned.length === 0 ? (
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
                              <span>{project.members} thành viên</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="pt-0">
                          <Link href={`/projects/${project.id}`} className="w-full">
                            <Button variant="outline" className="w-full gap-2 text-xs">
                              Mở không gian làm việc (Toàn quyền) <ArrowRight className="h-3.5 w-3.5" />
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

                {filteredMember.length === 0 ? (
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
                              <span>{project.members} thành viên</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="pt-0">
                          <Link href={`/projects/${project.id}`} className="w-full">
                            <Button variant="outline" className="w-full gap-2 text-xs">
                              Vào làm việc (Quyền thành viên) <ArrowRight className="h-3.5 w-3.5" />
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
              {recentActivities.map((act) => (
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
              ))}
            </CardContent>
          </Card>

          {/* 3. QUICK AGILE TIP / QUOTE */}
          <div className="p-3.5 rounded-xl border bg-linear-to-br from-primary/5 via-card to-background text-xs space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-1.5 font-bold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Agile & Scrum Best Practice</span>
            </div>
            <p className="text-muted-foreground leading-relaxed text-[11px]">
              Tối ưu hóa quy trình làm việc bằng cách chia nhỏ User Stories theo WBS, cập nhật Burndown chart hàng ngày và phản hồi lời mời kịp thời để đồng bộ tiến độ.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
