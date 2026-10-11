"use client";

import React, { useState } from "react";
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
  Plus
} from "lucide-react";
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
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";
import { useProject } from "../project-context";
import { useAuth } from "@/lib/auth-context";

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

  const [reports, setReports] = useState<SubmittedReport[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`ftodo_reports_${projectId}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return INITIAL_REPORTS;
  });

  // Modal: Submit report (For member)
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [reportType, setReportType] = useState<"weekly" | "sprint" | "technical" | "incident">("weekly");
  const [reportSummary, setReportSummary] = useState("");
  const [reportCompleted, setReportCompleted] = useState("");
  const [reportBlockers, setReportBlockers] = useState("");

  // Modal: Read / PDF preview (For boss & member)
  const [selectedReport, setSelectedReport] = useState<SubmittedReport | null>(null);
  const [isPdfOpen, setIsPdfOpen] = useState(false);

  const saveReports = (newList: SubmittedReport[]) => {
    setReports(newList);
    if (typeof window !== "undefined") {
      localStorage.setItem(`ftodo_reports_${projectId}`, JSON.stringify(newList));
    }
  };

  const handleSendReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle.trim() || !reportSummary.trim()) return;

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
    setReportTitle("");
    setReportSummary("");
    setReportCompleted("");
    setReportBlockers("");
    setIsSubmitOpen(false);
  };

  const handleMarkReviewed = (reportId: string) => {
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
                Giao diện Sếp (Quản trị & Xem báo cáo PDF)
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                Giao diện Nhân viên (Gửi báo cáo lên Sếp)
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {isOwner
              ? "Theo dõi chỉ số Burndown, tiếp nhận và đọc báo cáo tài liệu PDF từ các thành viên gửi lên."
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
                  ? "Báo cáo từ Nhân viên gửi lên Sếp (Hộp thư nhận & đọc PDF)"
                  : "Báo cáo của bạn gửi lên Sếp (Tiến độ & Kết quả)"}
              </CardTitle>
              <CardDescription className="text-xs">
                {isOwner
                  ? "Nhấp vào \"Đọc báo cáo / Xem PDF\" để duyệt nội dung định dạng văn bản chính thức của nhân viên."
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
                      <Eye className="h-3.5 w-3.5" /> Đọc báo cáo (Xem PDF)
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

      {/* Burndown Chart Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-semibold">Biểu đồ Sprint Burndown (Khối lượng còn lại)</CardTitle>
              <CardDescription className="text-xs">
                Theo dõi tiến trình thiêu đốt Story Points theo ngày thực tế trong Sprint 1.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs font-mono">
              Sprint 1 • 01/10 - 15/10/2026
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="h-[280px] pl-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={burndownData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={11} />
              <YAxis axisLine={false} tickLine={false} fontSize={11} unit=" pts" />
              <Tooltip formatter={(value: any) => [`${value} Story Points`, ""]} />
              <Legend verticalAlign="top" height={36} />
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
        </CardContent>
      </Card>

      {/* MODAL 1: GỬI BÁO CÁO CHO SẾP (NHÂN VIÊN) */}
      <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
        <DialogContent className="max-w-lg">
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

      {/* MODAL 2: XEM BÁO CÁO ĐỊNH DẠNG PDF CHÍNH THỨC (CHO SẾP & NHÂN VIÊN ĐỌC) */}
      <Dialog open={isPdfOpen} onOpenChange={setIsPdfOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-0 bg-transparent shadow-2xl">
          {selectedReport && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border p-8 space-y-6 text-foreground font-sans">
              {/* PDF Document Header */}
              <div className="border-b pb-4 flex justify-between items-start">
                <div>
                  <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                    CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM • FTODO AGILE MANAGEMENT
                  </div>
                  <h3 className="text-lg font-bold text-foreground mt-1">
                    BÁO CÁO TIẾN ĐỘ DỰ ÁN SCRUM
                  </h3>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Mã văn bản: <strong className="font-mono text-foreground">{selectedReport.id}</strong> • Dự án: {project?.name}
                  </div>
                </div>

                <div className="text-right">
                  <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950/30 text-[10px] font-mono">
                    PDF DOCUMENT
                  </Badge>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    Ngày lập: {selectedReport.date}
                  </div>
                </div>
              </div>

              {/* Title & Author Meta */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg border space-y-2">
                <div className="text-xs font-bold text-primary uppercase">
                  {selectedReport.type === "sprint"
                    ? "Báo cáo nghiệm thu Sprint"
                    : selectedReport.type === "weekly"
                    ? "Báo cáo công tác tuần"
                    : "Báo cáo kỹ thuật"}
                </div>
                <h4 className="text-base font-bold text-foreground leading-snug">
                  {selectedReport.title}
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-1 border-t">
                  <div>
                    Người thực hiện: <strong className="text-foreground">{selectedReport.author}</strong>
                  </div>
                  <div>
                    Người nhận phê duyệt: <strong className="text-foreground">Trịnh Quyết Chiến (Chủ dự án)</strong>
                  </div>
                </div>
              </div>

              {/* Body Section 1: Summary */}
              <div className="space-y-1.5">
                <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  I. Tóm tắt nội dung báo cáo
                </h5>
                <p className="text-xs leading-relaxed text-foreground bg-muted/20 p-3 rounded-lg border">
                  {selectedReport.summary}
                </p>
              </div>

              {/* Body Section 2: Completed Tasks */}
              <div className="space-y-1.5">
                <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  II. Chi tiết các hạng mục đã hoàn thành
                </h5>
                <div className="text-xs leading-relaxed whitespace-pre-line text-foreground bg-muted/20 p-3 rounded-lg border">
                  {selectedReport.completedTasks}
                </div>
              </div>

              {/* Body Section 3: Blockers */}
              <div className="space-y-1.5">
                <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  III. Đề xuất hỗ trợ & Vướng mắc
                </h5>
                <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200 dark:border-amber-900">
                  {selectedReport.blockers}
                </p>
              </div>

              {/* Signatures Footer */}
              <div className="border-t pt-4 grid grid-cols-2 gap-4 text-center text-xs">
                <div>
                  <div className="font-semibold text-muted-foreground">Người lập báo cáo</div>
                  <div className="h-12 flex items-center justify-center font-serif italic text-primary">
                    {selectedReport.author}
                  </div>
                  <div className="text-[11px] font-medium text-foreground">{selectedReport.author}</div>
                </div>

                <div>
                  <div className="font-semibold text-muted-foreground">Chủ dự án xác nhận</div>
                  <div className="h-12 flex items-center justify-center">
                    {selectedReport.status === "reviewed" ? (
                      <span className="text-[11px] font-bold text-emerald-600 border border-emerald-500 rounded px-2 py-0.5 uppercase">
                        ✓ ĐÃ DUYỆT BÁO CÁO
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground italic">
                        Chờ xác nhận
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-medium text-foreground">Trịnh Quyết Chiến</div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="border-t pt-4 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPdfOpen(false)}
                  className="text-xs"
                >
                  Đóng văn bản
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => alert("Đang tải tệp PDF văn bản về máy...")}
                    className="text-xs gap-1.5"
                  >
                    <Download className="h-3.5 w-3.5" /> Tải tệp PDF
                  </Button>

                  {isOwner && selectedReport.status !== "reviewed" && (
                    <Button
                      size="sm"
                      onClick={() => handleMarkReviewed(selectedReport.id)}
                      className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Check className="h-3.5 w-3.5" /> Xác nhận đã đọc & Phê duyệt
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
