"use client";

import { useState, useEffect, useMemo } from "react";
import { useProject } from "./project-context";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  Activity,
  Crown,
  UserCheck,
  DollarSign,
  Layers,
  Zap,
  BarChart2,
  CheckCheck,
  ShieldCheck,
  ArrowUpRight,
  Sparkles
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  Legend
} from "recharts";

export default function ProjectOverview() {
  const { project, isOwner, effectivePermissions } = useProject();
  const { user } = useAuth();
  const projectId = project?.id || "";

  const [tasks, setTasks] = useState<any[]>([]);
  const [sprints, setSprints] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [costsSummary, setCostsSummary] = useState<{ totalBudget: number; approvedTotal: number }>({
    totalBudget: 0,
    approvedTotal: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load real data from PostgreSQL backend
  useEffect(() => {
    let isMounted = true;
    if (!projectId) return;

    const loadRealData = async () => {
      try {
        setIsLoading(true);
        const [tasksRes, sprintsRes, membersRes, costsRes] = await Promise.allSettled([
          api.tasks.getTasks(projectId),
          api.sprints.getSprints(projectId),
          api.members.getMembers(projectId),
          api.costs.getCosts(projectId),
        ]);

        if (isMounted) {
          if (tasksRes.status === "fulfilled" && Array.isArray(tasksRes.value)) {
            setTasks(tasksRes.value);
          }
          if (sprintsRes.status === "fulfilled" && Array.isArray(sprintsRes.value)) {
            setSprints(sprintsRes.value);
          }
          if (membersRes.status === "fulfilled" && Array.isArray(membersRes.value)) {
            setMembers(membersRes.value);
          }
          if (costsRes.status === "fulfilled" && costsRes.value) {
            const cList = costsRes.value.costs || [];
            const approved = cList
              .filter((c: any) => c.status === "PAID" || c.status === "APPROVED")
              .reduce((sum: number, c: any) => sum + (c.amount || 0), 0);
            setCostsSummary({
              totalBudget: costsRes.value.summary?.totalBudget || (project as any)?.budget || 0,
              approvedTotal: approved,
            });
          }
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu tổng quan dự án:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadRealData();
  }, [projectId]);

  // Calculations from real PostgreSQL database
  const activeSprint = useMemo(() => {
    return sprints.find((s) => s.status === "ACTIVE") || sprints[0] || null;
  }, [sprints]);

  const sprintTasks = useMemo(() => {
    if (activeSprint) {
      const filtered = tasks.filter((t) => t.sprintId === activeSprint.id);
      return filtered.length > 0 ? filtered : tasks;
    }
    return tasks;
  }, [tasks, activeSprint]);

  const totalPoints = useMemo(() => {
    return sprintTasks.reduce((acc, t) => acc + (t.points || 0), 0);
  }, [sprintTasks]);

  const completedPoints = useMemo(() => {
    return sprintTasks
      .filter((t) => t.status === "DONE")
      .reduce((acc, t) => acc + (t.points || 0), 0);
  }, [sprintTasks]);

  const inProgressPoints = useMemo(() => {
    return sprintTasks
      .filter((t) => t.status === "IN_PROGRESS" || t.status === "REVIEW")
      .reduce((acc, t) => acc + (t.points || 0), 0);
  }, [sprintTasks]);

  const sprintProgress = useMemo(() => {
    if (totalPoints > 0) {
      return Math.round((completedPoints / totalPoints) * 100);
    }
    if (sprintTasks.length > 0) {
      const doneCount = sprintTasks.filter((t) => t.status === "DONE").length;
      return Math.round((doneCount / sprintTasks.length) * 100);
    }
    return 0;
  }, [totalPoints, completedPoints, sprintTasks]);

  // Real Status Distribution Chart Data
  const sprintStatusData = useMemo(() => {
    const todoTasks = sprintTasks.filter((t) => t.status === "TODO");
    const inProgTasks = sprintTasks.filter((t) => t.status === "IN_PROGRESS");
    const reviewTasks = sprintTasks.filter((t) => t.status === "REVIEW");
    const doneTasks = sprintTasks.filter((t) => t.status === "DONE");

    return [
      {
        name: "To Do (Cần làm)",
        points: todoTasks.reduce((acc, t) => acc + (t.points || 0), 0),
        tasks: todoTasks.length,
        fill: "#94a3b8",
      },
      {
        name: "In Progress (Đang làm)",
        points: inProgTasks.reduce((acc, t) => acc + (t.points || 0), 0),
        tasks: inProgTasks.length,
        fill: "#3b82f6",
      },
      {
        name: "In Review (Kiểm thử)",
        points: reviewTasks.reduce((acc, t) => acc + (t.points || 0), 0),
        tasks: reviewTasks.length,
        fill: "#8b5cf6",
      },
      {
        name: "Done (Hoàn tất)",
        points: doneTasks.reduce((acc, t) => acc + (t.points || 0), 0),
        tasks: doneTasks.length,
        fill: "#10b981",
      },
    ];
  }, [sprintTasks]);

  // Real Team Workload Data
  const teamWorkloadData = useMemo(() => {
    const list = [...members];
    // Ensure owner is included if not in members list
    if (project?.ownerId && !list.some((m) => m.userId === project.ownerId)) {
      list.unshift({
        userId: project.ownerId,
        name: "Chủ dự án (Owner)",
        roleGroup: { name: "Project Owner" },
      });
    }

    if (list.length === 0) {
      if (sprintTasks.length === 0) return [];
      // Fallback to active tasks assignees
      const map: Record<string, number> = {};
      sprintTasks.forEach((t) => {
        const aName = t.assignee?.name || "Chưa phân công";
        map[aName] = (map[aName] || 0) + (t.points || 1);
      });
      return Object.entries(map).map(([mName, pts]) => ({
        member: mName,
        role: "Thành viên",
        assigned: pts,
        capacity: 8,
      }));
    }

    return list.map((m) => {
      const mId = m.userId || m.id;
      const mEmail = m.email || m.user?.email;
      const assignedPoints = sprintTasks
        .filter((t) => t.assigneeId === mId || t.assignee?.id === mId || (mEmail && t.assignee?.email === mEmail))
        .reduce((sum, t) => sum + (t.points || 1), 0);

      return {
        member: m.name || m.user?.name || "Thành viên",
        role: m.roleGroup?.name || "Thành viên",
        assigned: assignedPoints,
        capacity: 8,
      };
    });
  }, [members, project?.ownerId, sprintTasks]);

  // High priority / blocker tasks
  const blockerTasks = useMemo(() => {
    return sprintTasks.filter((t) => t.priority === "HIGH" && t.status !== "DONE");
  }, [sprintTasks]);

  // Tasks assigned to current logged-in user
  const myTasks = useMemo(() => {
    if (!user) return [];
    return tasks.filter(
      (t) =>
        t.assigneeId === user.id ||
        t.assignee?.id === user.id ||
        (user.email && t.assignee?.email === user.email)
    );
  }, [tasks, user]);

  const myInProgress = useMemo(() => {
    return myTasks.filter((t) => t.status === "IN_PROGRESS").length;
  }, [myTasks]);

  const myDone = useMemo(() => {
    return myTasks.filter((t) => t.status === "DONE").length;
  }, [myTasks]);

  if (isOwner) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-lg font-bold tracking-tight">Dashboard Quản trị Dự án</h3>
            <p className="text-xs text-muted-foreground">Chế độ xem dữ liệu thời gian thực từ cơ sở dữ liệu PostgreSQL</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-600 hover:bg-amber-700 text-xs">
              <Crown className="h-3 w-3 mr-1" /> Chế độ Chủ sở hữu
            </Badge>
            <Badge variant="outline" className="text-xs font-mono">
              {activeSprint ? activeSprint.name : "Toàn bộ công việc"}
            </Badge>
          </div>
        </div>

        {/* 1. Core Engineering Health KPIs */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Tiến độ Sprint</CardTitle>
              <Activity className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sprintProgress}%</div>
              <Progress value={sprintProgress} className="h-2 mt-2" />
              <p className="text-[11px] text-muted-foreground mt-2">
                {completedPoints} / {totalPoints > 0 ? totalPoints : sprintTasks.length} Story Points hoàn thành
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Điểm nghẽn & Ưu tiên cao</CardTitle>
              <AlertCircle className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-500">{blockerTasks.length} Task</div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {blockerTasks.length > 0 ? `${blockerTasks[0].code || "Task"}: ${blockerTasks[0].title}` : "Không có điểm nghẽn nghiêm trọng"}
              </p>
              <div className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
                <CheckCheck className="h-3 w-3" />
                Đang kiểm thử: {sprintTasks.filter((t) => t.status === "REVIEW").length} task
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Năng lực Đội ngũ</CardTitle>
              <Users className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {members.length > 0 ? members.length : (project?.ownerId ? 1 : 0)} Thành viên
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Tổng điểm giao: {totalPoints} Story Points
              </p>
              <div className="text-[10px] font-medium text-blue-600 dark:text-blue-400 mt-2">
                Tổng công việc: {tasks.length} task
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Chi phí đã duyệt</CardTitle>
              <DollarSign className="h-4 w-4 text-violet-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(costsSummary.approvedTotal / 1000000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} tr ₫
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {costsSummary.totalBudget > 0
                  ? `${Math.round((costsSummary.approvedTotal / costsSummary.totalBudget) * 100)}% trên ngân sách ${(costsSummary.totalBudget / 1000000).toLocaleString("vi-VN")} tr ₫`
                  : "Chưa ghi nhận chi phí"}
              </p>
              <div className="text-[10px] font-medium text-muted-foreground mt-2">
                Số dư: {((costsSummary.totalBudget - costsSummary.approvedTotal) / 1000000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} tr ₫
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 2. Visual Scrum Charts: Status / WIP Distribution & Team Workload */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          {/* Chart 1: Status Distribution */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                    <BarChart2 className="h-4 w-4 text-primary" />
                    Phân bổ Trạng thái Công việc ({activeSprint?.name || "Sprint"})
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Kiểm soát lượng công việc theo trạng thái thực tế từ cơ sở dữ liệu.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300">
                  {sprintTasks.length} Tasks
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {sprintTasks.length === 0 ? (
                <div className="h-[220px] flex flex-col items-center justify-center text-muted-foreground">
                  <BarChart2 className="h-8 w-8 text-muted-foreground/30 mb-2" />
                  <p className="text-xs">Chưa có công việc nào trong Sprint</p>
                </div>
              ) : (
                <>
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sprintStatusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} />
                        <YAxis axisLine={false} tickLine={false} fontSize={10} unit=" SP" />
                        <Tooltip
                          formatter={(val: any) => [`${val} Story Points`, "Điểm công việc"]}
                          contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.9)", color: "#fff", borderRadius: 8, fontSize: 11 }}
                        />
                        <Bar dataKey="points" radius={[4, 4, 0, 0]} name="Story Points">
                          {sprintStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-4 gap-2 pt-3 border-t text-center text-xs">
                    {sprintStatusData.map((item) => (
                      <div key={item.name}>
                        <p className="text-[11px] text-muted-foreground truncate">{item.name.split(" ")[0]}</p>
                        <p className="font-semibold text-foreground">
                          {item.points} SP ({item.tasks} tasks)
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Chart 2: Team Workload Allocation */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-emerald-500" />
                    Phân bổ Điểm Công việc theo Thành viên
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    So sánh Story Points đã giao cho từng thành viên trong dự án.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px] text-blue-600 border-blue-300">
                  {members.length} Nhân sự
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {teamWorkloadData.length === 0 ? (
                <div className="h-[220px] flex flex-col items-center justify-center text-muted-foreground">
                  <Users className="h-8 w-8 text-muted-foreground/30 mb-2" />
                  <p className="text-xs">Chưa có phân bổ công việc theo thành viên</p>
                </div>
              ) : (
                <>
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={teamWorkloadData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis dataKey="member" axisLine={false} tickLine={false} fontSize={10} />
                        <YAxis axisLine={false} tickLine={false} fontSize={10} unit=" SP" />
                        <Tooltip
                          formatter={(val: any, name: any) => [
                            `${val} SP`,
                            name === "assigned" ? "Story Points đã nhận" : "Hạn mức tối đa"
                          ]}
                          contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.9)", color: "#fff", borderRadius: 8, fontSize: 11 }}
                        />
                        <Legend verticalAlign="top" height={24} iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                        <Bar dataKey="assigned" name="Đã giao (SP)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="capacity" name="Năng lực trần (SP)" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t text-center text-xs">
                    {teamWorkloadData.slice(0, 4).map((t) => {
                      const pct = Math.round((t.assigned / t.capacity) * 100);
                      const isFull = pct >= 100;
                      return (
                        <div key={t.member}>
                          <p className="text-[10px] text-muted-foreground truncate">{t.member}</p>
                          <p className={`font-semibold text-[11px] ${isFull ? "text-amber-600" : "text-emerald-600"}`}>
                            {t.assigned}/{t.capacity} SP ({pct}%)
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 3. Sprint Goal & Assigned Tasks breakdown */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Công việc gần đây trong dự án</CardTitle>
              <CardDescription className="text-xs">Tiến độ chi tiết các đầu việc từ cơ sở dữ liệu</CardDescription>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  Chưa có công việc nào trong dự án. Hãy vào Bảng Scrum hoặc Backlog để tạo task mới!
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.slice(0, 4).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-2.5 rounded-lg border bg-card hover:bg-muted/40 transition-colors"
                    >
                      <div className="space-y-0.5 max-w-[70%]">
                        <span className="font-medium text-xs sm:text-sm text-foreground line-clamp-1">
                          {task.code || "FT"}: {task.title}
                        </span>
                        <p className="text-[11px] text-muted-foreground">
                          {task.assignee?.name || "Chưa phân công"} • {task.points || 1} SP
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          task.status === "DONE"
                            ? "text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20"
                            : task.status === "IN_PROGRESS"
                            ? "text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-950/20"
                            : task.status === "REVIEW"
                            ? "text-violet-600 border-violet-200 bg-violet-50 dark:bg-violet-950/20"
                            : "text-slate-600 border-slate-200"
                        }`}
                      >
                        {task.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Mục tiêu Sprint ({activeSprint?.name || "Sprint"})
              </CardTitle>
              <CardDescription className="text-xs">
                {activeSprint?.startDate && activeSprint?.endDate
                  ? `Thời hạn: ${new Date(activeSprint.startDate).toLocaleDateString("vi-VN")} – ${new Date(activeSprint.endDate).toLocaleDateString("vi-VN")}`
                  : "Chưa thiết lập ngày kết thúc Sprint"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 border text-xs sm:text-sm leading-relaxed">
                  <p className="font-medium text-foreground">
                    &ldquo;{activeSprint?.goal || "Hoàn thành toàn diện các công việc được cam kết trong Sprint Backlog đúng tiến độ."}&rdquo;
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
                  <div className="p-2 border rounded-md">
                    <p className="text-muted-foreground text-[10px]">Mục tiêu Cam kết</p>
                    <p className="font-bold text-foreground">{totalPoints} SP</p>
                  </div>
                  <div className="p-2 border rounded-md">
                    <p className="text-emerald-600 text-[10px]">Đã Hoàn tất</p>
                    <p className="font-bold text-emerald-600">{completedPoints} SP</p>
                  </div>
                  <div className="p-2 border rounded-md">
                    <p className="text-blue-600 text-[10px]">Đang Thực hiện</p>
                    <p className="font-bold text-blue-600">{inProgressPoints} SP</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Member View (Real data for current logged-in member)
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold tracking-tight">Không gian làm việc thành viên</h3>
          <p className="text-xs text-muted-foreground">Tập trung vào các nhiệm vụ được giao cho bạn trong dự án</p>
        </div>
        <Badge variant="secondary" className="text-xs">
          <UserCheck className="h-3 w-3 mr-1" /> Chế độ Thành viên
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Task đang thực hiện</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myInProgress}</div>
            <p className="text-xs text-muted-foreground mt-1">Được giao cho {user?.name}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Task đã hoàn thành</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myDone}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {myTasks.length > 0 ? `${Math.round((myDone / myTasks.length) * 100)}% công việc cá nhân` : "0%"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quyền hạn của bạn</CardTitle>
            <Layers className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-semibold">
              {effectivePermissions?.length || 0} trang được phép
            </div>
            <p className="text-xs text-muted-foreground mt-1">Dùng nút &ldquo;+ Thêm trang&rdquo; để ghim lên thanh ngang</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Công việc của tôi trong dự án này</CardTitle>
          <CardDescription>Danh sách task được giao cho bạn thực hiện từ PostgreSQL</CardDescription>
        </CardHeader>
        <CardContent>
          {myTasks.length === 0 ? (
            <div className="p-8 border border-dashed rounded-xl text-center text-muted-foreground text-sm">
              Bạn chưa có công việc nào được giao trong dự án này.
            </div>
          ) : (
            <div className="space-y-3">
              {myTasks.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                  <div>
                    <p className="font-medium text-sm">
                      {t.code || "FT"}: {t.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t.points || 1} Story Points • Ưu tiên: {t.priority || "Trung bình"}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      t.status === "DONE"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : t.status === "IN_PROGRESS"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-slate-50 text-slate-700"
                    }`}
                  >
                    {t.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
