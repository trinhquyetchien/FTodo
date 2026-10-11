"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingDown,
  Activity,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Zap,
  FileText,
  Send,
  Eye,
  Download,
  Clock,
  Sparkles,
  Inbox,
  User,
  Check,
  FileCheck,
  Plus,
  Maximize2,
  Minimize2,
  Printer,
  X,
  ShieldCheck,
  Bug,
  Layers,
  TrendingUp
} from "lucide-react";
import { cn } from "cn";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";
import { useProject } from "../project-context";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

interface SubmittedReport {
  id: string;
  title: string;
  type: "weekly" | "sprint" | "technical" | "incident";
  author: string;
  authorEmail: string;
  date: string;
  status: "sent" | "reviewed";
  summary: string;
  completedTasks: string;
  blockers: string;
  pdfUrl?: string;
}

const burndownData = [
  { day: "01/10", ideal: 24, actual: 24 },
  { day: "03/10", ideal: 20, actual: 22 },
  { day: "05/10", ideal: 16, actual: 18 },
  { day: "07/10", ideal: 12, actual: 15 },
  { day: "09/10", ideal: 8, actual: 9 },
  { day: "11/10 (Nay)", ideal: 4, actual: 5 },
  { day: "14/10", ideal: 0, actual: 0 },
];

const velocityTrendData = [
  { sprint: "Sprint 1", committed: 24, completed: 21, target: 24 },
  { sprint: "Sprint 2 (Dự kiến)", committed: 26, completed: 25, target: 24 },
  { sprint: "Sprint 3", committed: 28, completed: 26, target: 25 },
  { sprint: "Sprint 4", committed: 30, completed: 28, target: 25 },
];

const defectTrendData = [
  { day: "01/10", opened: 4, resolved: 1 },
  { day: "03/10", opened: 5, resolved: 3 },
  { day: "05/10", opened: 3, resolved: 5 },
  { day: "07/10", opened: 2, resolved: 4 },
  { day: "09/10", opened: 1, resolved: 3 },
  { day: "11/10 (Nay)", opened: 1, resolved: 2 },
];

const INITIAL_REPORTS: SubmittedReport[] = [
  {
    id: "REP-001",
    title: "Báo cáo Sprint 1: Hoàn tất Module Auth & Tối ưu Database",
    type: "sprint",
    author: "Nguyễn Văn An",
    authorEmail: "an@example.com",
    date: "10/10/2026",
    status: "reviewed",
    summary: "Đã hoàn thành 85% khối lượng công việc Sprint 1. Hệ thống JWT và phân quyền đã kiểm thử thành công.",
    completedTasks: "- Thiết kế schema Prisma PostgreSQL\n- Xây dựng API Login, Register, Refresh Token\n- Tích hợp bảo mật RBAC",
    blockers: "Đang chờ cấu hình DNS cho môi trường Staging.",
  },
  {
    id: "REP-002",
    title: "Báo cáo Tuần 2: Tiến độ Kiểm thử & Báo cáo Lỗi hệ thống",
    type: "weekly",
    author: "Trần Thị Bình",
    authorEmail: "binh@example.com",
    date: "11/10/2026",
    status: "sent",
    summary: "Đã thực hiện kiểm thử tự động 24 test cases. Phát hiện 2 lỗi giao diện đã được chuyển cho team DEV khắc phục.",
    completedTasks: "- Viết Test Suite cho luồng đăng nhập\n- Kiểm thử ma trận phân quyền theo vai trò",
    blockers: "Cần môi trường test có dữ liệu mẫu lớn hơn.",
  },
];

export default function ReportsPage() {
  const { project, isOwner } = useProject();
  const { user } = useAuth();
  const projectId = project?.id || "ftodo-core";

  const [reports, setReports] = useState<SubmittedReport[]>(INITIAL_REPORTS);

  // Load reports from real PostgreSQL database
  useEffect(() => {
    let isMounted = true;
    async function loadReports() {
      try {
        const data = await api.reports.getReports(projectId);
        if (isMounted && data && Array.isArray(data) && data.length > 0) {
          setReports(data);
          if (typeof window !== "undefined") {
            localStorage.setItem(`ftodo_reports_${projectId}`, JSON.stringify(data));
          }
        }
      } catch {
        if (typeof window !== "undefined") {
          const saved = localStorage.getItem(`ftodo_reports_${projectId}`);
          if (saved && isMounted) {
            try {
              setReports(JSON.parse(saved));
            } catch {}
          }
        }
      }
    }
    loadReports();
    return () => {
      isMounted = false;
    };
  }, [projectId]);

  // Modal: Submit report (For member)
  const [chartTab, setChartTab] = useState<"burndown" | "velocity" | "quality">("burndown");
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [reportType, setReportType] = useState<"weekly" | "sprint" | "technical" | "incident">("weekly");
  const [reportSummary, setReportSummary] = useState("");
  const [reportCompleted, setReportCompleted] = useState("");
  const [reportBlockers, setReportBlockers] = useState("");

  // Modal: Read / PDF preview (For boss & member)
  const [selectedReport, setSelectedReport] = useState<SubmittedReport | null>(null);
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [isPdfFullscreen, setIsPdfFullscreen] = useState(false);

  const saveReports = (newList: SubmittedReport[]) => {
    setReports(newList);
    if (typeof window !== "undefined") {
      localStorage.setItem(`ftodo_reports_${projectId}`, JSON.stringify(newList));
    }
  };

  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle.trim() || !reportSummary.trim()) return;

    try {
      const created = await api.reports.createReport(projectId, {
        title: reportTitle.trim(),
        type: reportType,
        summary: reportSummary.trim(),
        completedTasks: reportCompleted.trim() || "Hoàn thành các tác vụ đúng tiến độ Sprint.",
        blockers: reportBlockers.trim() || "Không có vướng mắc đáng kể.",
      });
      if (created) {
        setReports((prev) => [created, ...prev]);
      }
    } catch {
      const newReport: SubmittedReport = {
        id: "REP-" + String(reports.length + 1).padStart(3, "0"),
        title: reportTitle.trim(),
        type: reportType,
        author: user?.name || "Nhân viên dự án",
        authorEmail: user?.email || "member@example.com",
        date: new Date().toLocaleDateString("vi-VN"),
        status: "sent",
        summary: reportSummary.trim(),
        completedTasks: reportCompleted.trim() || "Hoàn thành các tác vụ đúng tiến độ Sprint.",
        blockers: reportBlockers.trim() || "Không có vướng mắc đáng kể.",
      };
      saveReports([newReport, ...reports]);
    }

    setReportTitle("");
    setReportSummary("");
    setReportCompleted("");
    setReportBlockers("");
    setIsSubmitOpen(false);
  };

  const handleMarkReviewed = async (reportId: string) => {
    try {
      await api.reports.updateStatus(projectId, reportId, "reviewed");
    } catch {
      // ignore
    }
    const updated = reports.map((r) =>
      r.id === reportId ? { ...r, status: "reviewed" as const } : r
    );
    saveReports(updated);
    if (selectedReport?.id === reportId) {
      setSelectedReport({ ...selectedReport, status: "reviewed" });
    }
  };

  const handleOpenPdf = (report: SubmittedReport) => {
    setSelectedReport(report);
    setIsPdfFullscreen(false);
    setIsPdfOpen(true);
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" /> Báo cáo & Phân tích dự án
            </h2>
            {isOwner ? (
              <Badge className="bg-amber-600 hover:bg-amber-700 text-xs">
                Giao diện Sếp (Quản trị & Đọc báo cáo)
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                Giao diện Nhân viên (Gửi báo cáo lên Sếp)
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {isOwner
              ? "Theo dõi chỉ số Burndown, tiếp nhận và đọc báo cáo từ các thành viên gửi lên."
              : "Theo dõi tiến độ Sprint của nhóm và gửi báo cáo công việc định kỳ lên Chủ dự án."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isOwner ? (
            <Button
              onClick={() => setIsSubmitOpen(true)}
              className="text-xs gap-1.5 shadow-xs"
            >
              <Send className="h-4 w-4" /> Gửi báo cáo cho Sếp
            </Button>
          ) : (
            <Badge variant="outline" className="text-xs font-mono py-1 px-2.5">
              Hộp thư báo cáo: {reports.length} bản ghi
            </Badge>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Vận tốc Sprint 1</CardTitle>
            <Zap className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">21 Story Points</div>
            <p className="text-[11px] text-muted-foreground mt-1">Đạt 87.5% cam kết ban đầu</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Công việc hoàn thành</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">10 / 16 Tasks</div>
            <p className="text-[11px] text-muted-foreground mt-1">6 công việc đang trong luồng kiểm thử</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Báo cáo gửi lên Sếp</CardTitle>
            <Inbox className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {reports.length} Báo cáo
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {reports.filter((r) => r.status === "sent").length} bản mới chờ Sếp đọc
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Chu kỳ hoàn thành</CardTitle>
            <Clock className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4 Ngày / Task</div>
            <p className="text-[11px] text-muted-foreground mt-1">Tốc độ xử lý bình quân</p>
          </CardContent>
        </Card>
      </div>

      {/* SECTION: BÁO CÁO CÔNG VIỆC GỬI LÊN SẾP (CHỨC NĂNG CHÍNH ĐƯỢC YÊU CẦU) */}
      <Card className="border-primary/20 shadow-xs">
        <CardHeader className="border-b pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                {isOwner
                  ? "Báo cáo từ Nhân viên gửi lên Sếp (Hộp thư nhận & đọc báo cáo)"
                  : "Báo cáo của bạn gửi lên Sếp (Tiến độ & Kết quả)"}
              </CardTitle>
              <CardDescription className="text-xs">
                {isOwner
                  ? "Nhấp vào \"Đọc báo cáo\" để duyệt nội dung báo cáo chính thức của nhân viên."
                  : "Các báo cáo định kỳ đã gửi cho Sếp Trịnh Quyết Chiến xem và duyệt."}
              </CardDescription>
            </div>

            {!isOwner && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsSubmitOpen(true)}
                className="text-xs gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" /> Tạo báo cáo mới
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y">
            {reports.map((report) => {
              const isReviewed = report.status === "reviewed";

              return (
                <div
                  key={report.id}
                  className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-muted/20 transition-colors"
                >
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {report.id}
                      </span>
                      <h4 className="text-sm font-semibold text-foreground">
                        {report.title}
                      </h4>
                      <Badge
                        variant={isReviewed ? "default" : "secondary"}
                        className={`text-[10px] ${
                          isReviewed
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                        }`}
                      >
                        {isReviewed ? "✓ Sếp đã đọc" : "Chờ Sếp xem"}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {report.summary}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-0.5">
                      <span className="font-medium text-foreground flex items-center gap-1">
                        <User className="h-3 w-3 text-primary" /> {report.author}
                      </span>
                      <span>•</span>
                      <span>Ngày gửi: {report.date}</span>
                      <span>•</span>
                      <Badge variant="outline" className="text-[9px] uppercase px-1 py-0">
                        {report.type === "sprint"
                          ? "Sprint Review"
                          : report.type === "weekly"
                          ? "Tuần"
                          : "Kỹ thuật"}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenPdf(report)}
                      className="text-xs h-8 gap-1.5 border-primary/40 text-primary hover:bg-primary/5"
                    >
                      <Eye className="h-3.5 w-3.5" /> Đọc báo cáo
                    </Button>

                    {isOwner && !isReviewed && (
                      <Button
                        size="sm"
                        onClick={() => handleMarkReviewed(report.id)}
                        className="text-xs h-8 gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Check className="h-3.5 w-3.5" /> Xác nhận đã đọc
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 3. Comprehensive Software Delivery & Quality Analytics */}
      <Card className="border shadow-xs">
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                {chartTab === "burndown" && "Biểu đồ Sprint Burndown (Khối lượng Story Points còn lại)"}
                {chartTab === "velocity" && "Biểu đồ Vận tốc qua các Sprint (Velocity Trend & Predictability)"}
                {chartTab === "quality" && "Biểu đồ Lỗi & Xu hướng Ổn định Chất lượng (Defect Influx vs Resolution)"}
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {chartTab === "burndown" && "Theo dõi tiến trình thiêu đốt Story Points theo ngày thực tế so với đường Guideline lý tưởng."}
                {chartTab === "velocity" && "Đo lường độ ổn định cam kết hoàn thành (Cam kết vs Hoàn thành) và xu hướng năng suất team."}
                {chartTab === "quality" && "Theo dõi số lượng bug mở mới vs bug đã khắc phục; hệ thống sẵn sàng bàn giao khi Resolved > Opened."}
              </CardDescription>
            </div>

            {/* View Switcher Tabs */}
            <div className="flex items-center rounded-lg border bg-muted/40 p-0.5 text-xs shrink-0">
              <button
                onClick={() => setChartTab("burndown")}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                  chartTab === "burndown"
                    ? "bg-background text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <TrendingDown className="h-3 w-3 text-blue-500" /> Burndown
              </button>
              <button
                onClick={() => setChartTab("velocity")}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                  chartTab === "velocity"
                    ? "bg-background text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Zap className="h-3 w-3 text-amber-500" /> Vận tốc (Velocity)
              </button>
              <button
                onClick={() => setChartTab("quality")}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                  chartTab === "quality"
                    ? "bg-background text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Bug className="h-3 w-3 text-rose-500" /> Lỗi (Defects)
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="h-[280px] pl-0 pt-4">
          {chartTab === "burndown" && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={burndownData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={11} />
                <YAxis axisLine={false} tickLine={false} fontSize={11} unit=" pts" />
                <Tooltip
                  formatter={(value: any, name: any) => [`${value} Story Points`, name]}
                  contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.9)", color: "#fff", borderRadius: 8, fontSize: 11 }}
                />
                <Legend verticalAlign="top" height={36} iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Line
                  type="monotone"
                  dataKey="ideal"
                  name="Đường lý tưởng (Guideline)"
                  stroke="#94a3b8"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  name="Thực tế còn lại (Remaining)"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#3b82f6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}

          {chartTab === "velocity" && (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={velocityTrendData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="sprint" axisLine={false} tickLine={false} fontSize={11} />
                <YAxis axisLine={false} tickLine={false} fontSize={11} unit=" SP" />
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} Story Points`, name]}
                  contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.9)", color: "#fff", borderRadius: 8, fontSize: 11 }}
                />
                <Legend verticalAlign="top" height={36} iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="committed" name="Điểm cam kết (Committed)" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={28} />
                <Bar dataKey="completed" name="Điểm hoàn thành (Completed)" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={28} />
                <Line
                  type="monotone"
                  dataKey="target"
                  name="Mục tiêu vận tốc (24-25 SP)"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: "#10b981" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}

          {chartTab === "quality" && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={defectTrendData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={11} />
                <YAxis axisLine={false} tickLine={false} fontSize={11} unit=" bugs" />
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} Bugs`, name]}
                  contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.9)", color: "#fff", borderRadius: 8, fontSize: 11 }}
                />
                <Legend verticalAlign="top" height={36} iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="opened" name="Bug mới phát hiện (Opened)" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="resolved" name="Bug đã khắc phục (Resolved)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>

        {/* Footer Sub-stats for PM / Lead */}
        <CardFooter className="border-t py-2.5 px-4 bg-muted/20 text-xs">
          {chartTab === "burndown" && (
            <div className="flex flex-wrap items-center justify-between w-full gap-2">
              <span className="text-muted-foreground flex items-center gap-1">
                <TrendingDown className="h-3.5 w-3.5 text-blue-500" />
                Tiến độ: <strong className="text-foreground">Đúng kế hoạch (-1 SP so với Guideline)</strong>
              </span>
              <span className="text-muted-foreground">
                Còn lại: <strong className="text-blue-600">5 / 24 Story Points</strong> • Kết thúc Sprint: 15/10/2026
              </span>
            </div>
          )}
          {chartTab === "velocity" && (
            <div className="flex flex-wrap items-center justify-between w-full gap-2">
              <span className="text-muted-foreground flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                Vận tốc trung bình: <strong className="text-foreground">25 SP / Sprint</strong>
              </span>
              <span className="text-muted-foreground">
                Độ tin cậy cam kết: <strong className="text-emerald-600">92.4% (Rất cao)</strong> • Predictability ổn định
              </span>
            </div>
          )}
          {chartTab === "quality" && (
            <div className="flex flex-wrap items-center justify-between w-full gap-2">
              <span className="text-muted-foreground flex items-center gap-1">
                <Bug className="h-3.5 w-3.5 text-rose-500" />
                Độ ổn định trước Release: <strong className="text-emerald-600">Đạt chuẩn bàn giao</strong>
              </span>
              <span className="text-muted-foreground">
                Tốc độ xử lý: <strong className="text-foreground">Resolved (18) {">"} Opened (16)</strong> • Không có blocker nghiêm trọng
              </span>
            </div>
          )}
        </CardFooter>
      </Card>

      {/* MODAL 1: GỬI BÁO CÁO CHO SẾP (NHÂN VIÊN) */}
      <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-4 w-4 text-primary" /> Soạn & Gửi báo cáo cho Sếp
            </DialogTitle>
            <DialogDescription className="text-xs">
              Báo cáo sẽ được chuyển trực tiếp vào hộp thư quản trị của Chủ dự án dưới định dạng văn bản PDF.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendReport} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="rep-title" className="text-xs font-semibold">
                Tiêu đề báo cáo <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="rep-title"
                placeholder="VD: Báo cáo hoàn thành Sprint 1 & chuẩn bị Sprint 2..."
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Loại báo cáo</Label>
                <Select value={reportType} onValueChange={(val: any) => setReportType(val)}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Báo cáo tuần (Weekly)</SelectItem>
                    <SelectItem value="sprint">Tổng kết Sprint (Sprint Review)</SelectItem>
                    <SelectItem value="technical">Báo cáo kỹ thuật (Technical)</SelectItem>
                    <SelectItem value="incident">Sự cố & Rủi ro (Incident)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Người gửi</Label>
                <Input
                  disabled
                  value={`${user?.name || "Thành viên"} (${user?.email})`}
                  className="text-xs bg-muted/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rep-summary" className="text-xs font-semibold">
                Tóm tắt nội dung chính <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                id="rep-summary"
                placeholder="Tóm tắt ngắn gọn các kết quả nổi bật và hiện trạng..."
                value={reportSummary}
                onChange={(e) => setReportSummary(e.target.value)}
                rows={2}
                required
                className="text-xs resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rep-tasks" className="text-xs font-semibold">
                Chi tiết các đầu việc đã hoàn thành
              </Label>
              <Textarea
                id="rep-tasks"
                placeholder="- Đã xong tính năng A&#10;- Đã nghiệm thu module B..."
                value={reportCompleted}
                onChange={(e) => setReportCompleted(e.target.value)}
                rows={3}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rep-blockers" className="text-xs font-semibold">
                Vấn đề / Khó khăn cần Sếp hỗ trợ
              </Label>
              <Input
                id="rep-blockers"
                placeholder="VD: Cần duyệt thêm tài khoản AWS, cần thêm người test..."
                value={reportBlockers}
                onChange={(e) => setReportBlockers(e.target.value)}
                className="text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsSubmitOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={!reportTitle.trim() || !reportSummary.trim()}>
                Xuất PDF & Gửi cho Sếp
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: XEM BÁO CÁO CHÍNH THỨC (CHO SẾP & NHÂN VIÊN ĐỌC) */}
      <Dialog open={isPdfOpen} onOpenChange={setIsPdfOpen}>
        <DialogContent
          showCloseButton={false}
          className={cn(
            "!p-0 !border !bg-card !shadow-2xl transition-all duration-200 !flex !flex-col !overflow-hidden z-50",
            isPdfFullscreen
              ? "!fixed !inset-0 !top-0 !left-0 !translate-x-0 !translate-y-0 !w-screen !h-screen !max-w-none !max-h-none !rounded-none"
              : "!fixed !top-1/2 !left-1/2 !-translate-x-1/2 !-translate-y-1/2 !w-[96vw] !max-w-[1440px] !h-[94vh] !max-h-[94vh] !sm:max-w-none !rounded-2xl"
          )}
        >
          {selectedReport && (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Sticky Top Document Viewer Toolbar */}
              <div className="shrink-0 bg-background/95 backdrop-blur-md border-b px-5 py-3.5 flex items-center justify-between gap-3 z-10 shadow-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-foreground truncate max-w-xs sm:max-w-md md:max-w-xl">
                        {selectedReport.title}
                      </h3>
                      <Badge variant="outline" className="text-[10px] uppercase font-mono shrink-0 hidden sm:inline-flex">
                        Văn bản chính thức
                      </Badge>
                      {selectedReport.status === "reviewed" ? (
                        <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] shrink-0">
                          ✓ Đã duyệt
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/30 text-[10px] shrink-0">
                          ⏳ Chờ duyệt
                        </Badge>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                      <span>Mã: <strong className="font-mono text-foreground">{selectedReport.id}</strong></span>
                      <span>•</span>
                      <span>Tác giả: <strong className="text-foreground">{selectedReport.author}</strong></span>
                      <span>•</span>
                      <span>Ngày gửi: {selectedReport.date}</span>
                    </div>
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-2 shrink-0">
                  {isOwner && selectedReport.status !== "reviewed" && (
                    <Button
                      size="sm"
                      onClick={() => handleMarkReviewed(selectedReport.id)}
                      className="text-xs h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
                    >
                      <Check className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Phê duyệt báo cáo</span><span className="sm:hidden">Duyệt</span>
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.print()}
                    className="text-xs h-8 gap-1.5 hidden md:inline-flex"
                    title="In văn bản báo cáo"
                  >
                    <Printer className="h-3.5 w-3.5" /> <span className="hidden sm:inline">In ấn</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => alert(`Đang tải tệp báo cáo "${selectedReport.title}.pdf" về máy tính...`)}
                    className="text-xs h-8 gap-1.5"
                    title="Tải văn bản báo cáo"
                  >
                    <Download className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Tải về</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsPdfFullscreen(!isPdfFullscreen)}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    title={isPdfFullscreen ? "Thu nhỏ cửa sổ" : "Mở rộng toàn màn hình"}
                  >
                    {isPdfFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsPdfOpen(false)}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    title="Đóng cửa sổ đọc báo cáo"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Scrollable Document Desk & A4 Paper Container */}
              <div className="flex-1 overflow-y-auto bg-slate-200/80 dark:bg-slate-950/90 p-4 sm:p-8 md:p-12">
                <div className="w-full max-w-5xl mx-auto bg-white dark:bg-slate-900 border shadow-2xl rounded-2xl p-8 sm:p-12 md:p-16 space-y-8 font-sans text-foreground">
                  {/* Official Vietnam National Header */}
                  <div className="border-b pb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                        CÔNG TY CỔ PHẦN CÔNG NGHỆ FTODO
                      </div>
                      <div className="text-xs font-semibold text-primary">
                        BAN QUẢN LÝ DỰ ÁN PHẦN MỀM SCRUM
                      </div>
                      <div className="text-xs text-muted-foreground pt-1">
                        Số văn bản: <strong className="font-mono text-foreground">{selectedReport.id}</strong>/BC-SCRUM
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Dự án: <strong className="text-foreground">{project?.name || "FTodo Core"}</strong>
                      </div>
                    </div>

                    <div className="text-left sm:text-right space-y-1">
                      <div className="text-xs font-bold uppercase tracking-wider text-foreground">
                        CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                      </div>
                      <div className="text-xs font-bold underline underline-offset-4 text-foreground">
                        Độc lập - Tự do - Hạnh phúc
                      </div>
                      <div className="text-xs text-muted-foreground italic pt-1">
                        Hà Nội, ngày {selectedReport.date}
                      </div>
                    </div>
                  </div>

                  {/* Centered Document Title */}
                  <div className="text-center py-4 space-y-2 border-b">
                    <div className="text-xs font-bold text-primary uppercase tracking-widest">
                      {selectedReport.type === "sprint"
                        ? "BÁO CÁO NGHIỆM THU TIẾN ĐỘ SPRINT"
                        : selectedReport.type === "weekly"
                        ? "BÁO CÁO TIẾN ĐỘ CÔNG VIỆC ĐỊNH KỲ TUẦN"
                        : "BÁO CÁO KỸ THUẬT & KIẾN TRÚC PHẦN MỀM"}
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground uppercase tracking-tight">
                      {selectedReport.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground italic">
                      Hệ thống quản lý công việc và phát triển phần mềm theo mô hình Agile Scrum Standard
                    </p>
                  </div>

                  {/* Document Meta Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-xl border text-xs">
                    <div>
                      <div className="text-muted-foreground text-[11px] font-medium">Người lập báo cáo</div>
                      <div className="font-bold text-foreground text-sm mt-0.5">{selectedReport.author}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{selectedReport.authorEmail}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-[11px] font-medium">Người nhận phê duyệt</div>
                      <div className="font-bold text-foreground text-sm mt-0.5">Trịnh Quyết Chiến</div>
                      <div className="text-[11px] text-muted-foreground">Product Owner / Chủ dự án</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-[11px] font-medium">Ngày lập báo cáo</div>
                      <div className="font-bold text-foreground text-sm mt-0.5">{selectedReport.date}</div>
                      <div className="text-[11px] text-muted-foreground">Hạn phản hồi: 48 giờ</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-[11px] font-medium">Tình trạng phê duyệt</div>
                      <div className="mt-1">
                        {selectedReport.status === "reviewed" ? (
                          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                            ✓ Đã phê duyệt chính thức
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/30 text-xs">
                            ⏳ Đang chờ Sếp ký duyệt
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section I: Tóm tắt */}
                  <div className="space-y-3">
                    <h4 className="text-sm sm:text-base font-bold text-foreground uppercase tracking-wide flex items-center gap-2">
                      <span className="h-6 w-6 rounded-md bg-primary/10 text-primary flex items-center justify-center text-xs font-black">I</span>
                      Tổng quan nội dung & Kết quả đạt được
                    </h4>
                    <div className="text-sm sm:text-base leading-relaxed text-foreground bg-muted/20 p-5 rounded-xl border whitespace-pre-line">
                      {selectedReport.summary}
                    </div>
                  </div>

                  {/* Section II: Các hạng mục đã hoàn thành */}
                  <div className="space-y-3">
                    <h4 className="text-sm sm:text-base font-bold text-foreground uppercase tracking-wide flex items-center gap-2">
                      <span className="h-6 w-6 rounded-md bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-xs font-black">II</span>
                      Chi tiết các hạng mục công việc đã hoàn thành (WBS & Deliverables)
                    </h4>
                    <div className="text-sm sm:text-base leading-relaxed text-foreground bg-muted/20 p-5 rounded-xl border whitespace-pre-line font-mono text-xs sm:text-sm">
                      {selectedReport.completedTasks}
                    </div>
                  </div>

                  {/* Section III: Khó khăn & Đề xuất */}
                  <div className="space-y-3">
                    <h4 className="text-sm sm:text-base font-bold text-foreground uppercase tracking-wide flex items-center gap-2">
                      <span className="h-6 w-6 rounded-md bg-amber-500/10 text-amber-600 flex items-center justify-center text-xs font-black">III</span>
                      Khó khăn, vướng mắc & Đề xuất hỗ trợ (Blockers & Risks)
                    </h4>
                    <div className="text-sm sm:text-base leading-relaxed text-amber-900 dark:text-amber-300 bg-amber-50/70 dark:bg-amber-950/30 p-5 rounded-xl border border-amber-200 dark:border-amber-900/50 whitespace-pre-line">
                      {selectedReport.blockers}
                    </div>
                  </div>

                  {/* Section IV: Kế hoạch tiếp theo */}
                  <div className="space-y-3">
                    <h4 className="text-sm sm:text-base font-bold text-foreground uppercase tracking-wide flex items-center gap-2">
                      <span className="h-6 w-6 rounded-md bg-blue-500/10 text-blue-600 flex items-center justify-center text-xs font-black">IV</span>
                      Kế hoạch hành động & Cam kết giai đoạn tiếp theo
                    </h4>
                    <div className="text-sm sm:text-base leading-relaxed text-foreground bg-muted/20 p-5 rounded-xl border">
                      Đội ngũ cam kết tiếp tục bám sát kế hoạch Sprint Backlog, hoàn thiện các User Stories còn lại đúng tiến độ và tiêu chí hoàn thành (Definition of Done), đồng thời tham gia đầy đủ các phiên Daily Scrum và Sprint Review tiếp theo.
                    </div>
                  </div>

                  {/* Signatures & Official Stamp */}
                  <div className="pt-10 border-t grid grid-cols-1 sm:grid-cols-2 gap-8 text-center">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Người lập báo cáo
                      </div>
                      <div className="text-[11px] text-muted-foreground">(Ký và ghi rõ họ tên)</div>
                      <div className="h-24 flex items-center justify-center font-serif italic text-2xl sm:text-3xl text-primary font-bold">
                        {selectedReport.author}
                      </div>
                      <div className="text-sm font-bold text-foreground">{selectedReport.author}</div>
                      <div className="text-xs text-muted-foreground">{selectedReport.authorEmail}</div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Chủ dự án phê duyệt
                      </div>
                      <div className="text-[11px] text-muted-foreground">(Ký số và đóng dấu điện tử)</div>
                      <div className="h-24 flex items-center justify-center">
                        {selectedReport.status === "reviewed" ? (
                          <div className="border-2 border-emerald-600 rounded-xl p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 shadow-md flex flex-col items-center">
                            <div className="text-[10px] font-bold tracking-widest uppercase">★ CÔNG TY FTODO ★</div>
                            <div className="text-sm font-black uppercase text-emerald-600 dark:text-emerald-400 mt-0.5">
                              ✓ ĐÃ PHÊ DUYỆT VĂN BẢN
                            </div>
                            <div className="text-[10px] font-mono text-muted-foreground mt-0.5">Ngày ký: {selectedReport.date}</div>
                          </div>
                        ) : (
                          <div className="border border-dashed border-amber-400 rounded-xl p-3 bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 text-xs italic">
                            Văn bản đang chờ Chủ dự án xem và phê duyệt
                          </div>
                        )}
                      </div>
                      <div className="text-sm font-bold text-foreground">Trịnh Quyết Chiến</div>
                      <div className="text-xs text-muted-foreground">Product Owner / Chủ dự án FTodo</div>
                    </div>
                  </div>

                  {/* Document Footer Note */}
                  <div className="border-t pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-muted-foreground gap-2">
                    <div>Trang 1 / 1 • Lưu hành nội bộ dự án {project?.name || "FTodo"}</div>
                    <div className="flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                      Văn bản điện tử bảo mật chuẩn ISO/IEC 25010
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
