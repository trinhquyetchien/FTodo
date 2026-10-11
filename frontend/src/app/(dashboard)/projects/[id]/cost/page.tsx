"use client";

import React, { useState, useEffect } from "react";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  PieChart as PieIcon, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ArrowUpRight,
  ShieldAlert,
  XCircle,
  Check,
  X,
  Send,
  User,
  Sparkles,
  Inbox,
  AlertTriangle,
  Receipt,
  FileCheck
} from "lucide-react";
import { useProject } from "../project-context";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";

export interface Expense {
  id: string;
  title: string;
  category: "personnel" | "infrastructure" | "licenses" | "hardware" | "other";
  amount: number;
  date: string;
  requester: string;
  requesterRole: string;
  requesterEmail: string;
  status: "paid" | "approved" | "pending" | "rejected";
  sprint?: string;
  reason: string; // Lý do đề xuất cụ thể (Bắt buộc)
  reviewedBy?: string;
  reviewNote?: string;
  reviewedAt?: string;
}

const initialExpenses: Expense[] = [
  {
    id: "EXP-001",
    title: "AWS Cloud Hosting & RDS PostgreSQL (Tháng 10)",
    category: "infrastructure",
    amount: 14500000,
    date: "05/10/2026",
    requester: "Nguyễn Văn An",
    requesterRole: "DEV",
    requesterEmail: "an@example.com",
    status: "paid",
    sprint: "Sprint 1",
    reason: "Gia hạn máy chủ EC2 c5.xlarge và database RDS PostgreSQL Multi-AZ để phục vụ môi trường chạy thử nghiệm và staging cho Sprint 1.",
    reviewedBy: "Trịnh Quyết Chiến",
    reviewedAt: "05/10/2026",
    reviewNote: "Đã duyệt và thanh toán thẻ tín dụng công ty.",
  },
  {
    id: "EXP-002",
    title: "Lương Sprint 1 - Core Dev & QA Team",
    category: "personnel",
    amount: 140000000,
    date: "01/10/2026",
    requester: "Trịnh Quyết Chiến",
    requesterRole: "Chủ dự án",
    requesterEmail: "chien@example.com",
    status: "paid",
    sprint: "Sprint 1",
    reason: "Chi trả lương đợt 1 cho 5 nhân sự full-time theo hợp đồng phát triển dự án FTodo giai đoạn Alpha.",
  },
  {
    id: "EXP-003",
    title: "GitHub Enterprise & JetBrains Licenses (1 năm)",
    category: "licenses",
    amount: 32000000,
    date: "28/09/2026",
    requester: "Trần Thị Bình",
    requesterRole: "QA",
    requesterEmail: "binh@example.com",
    status: "paid",
    reason: "Mua gói GitHub Team Enterprise tích hợp CI/CD Actions và bản quyền IDE WebStorm/CLion cho các lập trình viên nòng cốt.",
    reviewedBy: "Trịnh Quyết Chiến",
    reviewedAt: "29/09/2026",
  },
  {
    id: "EXP-004",
    title: "Figma Team Subscription & Miro Board",
    category: "licenses",
    amount: 9000000,
    date: "02/10/2026",
    requester: "Lê Hoàng Dũng",
    requesterRole: "UI/UX Designer",
    requesterEmail: "dung@example.com",
    status: "approved",
    sprint: "Sprint 1",
    reason: "Gia hạn tài khoản Figma Professional cho 3 designer để hoàn thiện hệ thống Design System và Prototype giao diện.",
    reviewedBy: "Trịnh Quyết Chiến",
    reviewedAt: "03/10/2026",
    reviewNote: "Đã duyệt, phòng tài chính sẽ giải ngân vào thứ hai tới.",
  },
  {
    id: "EXP-005",
    title: "Kiểm thử bảo mật Pentest bên thứ ba (Đợt 1)",
    category: "other",
    amount: 40000000,
    date: "08/10/2026",
    requester: "Nguyễn Văn An",
    requesterRole: "DEV",
    requesterEmail: "an@example.com",
    status: "pending",
    sprint: "Sprint 2",
    reason: "Cần thuê đơn vị an ninh mạng độc lập kiểm thử thâm nhập (Black-box pentest) các API xác thực JWT và cơ chế mã hóa mật khẩu trước khi release bản Beta.",
  },
  {
    id: "EXP-006",
    title: "Đăng ký dịch vụ SMS OTP và SendGrid Email Marketing",
    category: "infrastructure",
    amount: 6500000,
    date: "10/10/2026",
    requester: "Trần Thị Bình",
    requesterRole: "QA",
    requesterEmail: "binh@example.com",
    status: "pending",
    sprint: "Sprint 2",
    reason: "Cần tích hợp dịch vụ SMS Brandname gửi mã xác thực 2FA cho người dùng đăng ký và gửi thông báo task tự động qua email.",
  },
];

const sprintBurnData = [
  { name: "Sprint 1", budget: 180, actual: 163.5 },
  { name: "Sprint 2", budget: 170, actual: 72.0 },
  { name: "Sprint 3 (Dự kiến)", budget: 160, actual: 0 },
  { name: "Sprint 4 (Dự kiến)", budget: 150, actual: 0 },
];

const categoryColors: Record<string, string> = {
  personnel: "#3b82f6",     // Blue
  infrastructure: "#10b981",// Emerald
  licenses: "#8b5cf6",      // Violet
  hardware: "#f59e0b",      // Amber
  other: "#ec4899",         // Pink
};

const categoryLabels: Record<string, string> = {
  personnel: "Nhân sự & Lương",
  infrastructure: "Hạ tầng Cloud",
  licenses: "Bản quyền phần mềm",
  hardware: "Thiết bị phần cứng",
  other: "Khác & Dịch vụ ngoài",
};

export default function ProjectCostPage() {
  const { isOwner, hasPermission, project } = useProject();
  const { user } = useAuth();
  const projectId = project?.id || "ftodo-core";

  // Persistent expenses state
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`ftodo_expenses_${projectId}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return initialExpenses;
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "my">("all");

  // Add / Propose Expense Dialog
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<Expense["category"]>("infrastructure");
  const [newAmount, setNewAmount] = useState("");
  const [newSprint, setNewSprint] = useState("Sprint 2");
  const [newReason, setNewReason] = useState("");

  // Review / Decision Dialog (For Boss/Owner)
  const [reviewingExpense, setReviewingExpense] = useState<Expense | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectExpenseTarget, setRejectExpenseTarget] = useState<Expense | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Save to localStorage whenever expenses change
  const saveExpenses = (updatedList: Expense[]) => {
    setExpenses(updatedList);
    if (typeof window !== "undefined") {
      localStorage.setItem(`ftodo_expenses_${projectId}`, JSON.stringify(updatedList));
      window.dispatchEvent(new Event("ftodo_permissions_updated"));
    }
  };

  if (!isOwner && !hasPermission("cost")) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/30 dark:bg-amber-950/20">
          <CardHeader className="space-y-2">
            <div className="mx-auto h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300 flex items-center justify-center">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-bold text-amber-700 dark:text-amber-400">
              Chưa được cấp quyền xem Chi phí & Ngân sách
            </CardTitle>
            <CardDescription className="text-sm text-amber-600/80 dark:text-amber-400/80">
              Bạn hiện đang tham gia dự án với tư cách <strong>Thành viên</strong> và chưa được cấp quyền truy cập tab <strong>Tiền & Chi phí</strong>.
              <br />
              Chỉ khi Chủ dự án cấp quyền cho Nhóm của bạn hoặc cấp quyền riêng lẻ thì bạn mới có thể xem và đề xuất chi phí.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const totalBudget = 500000000; // 500 million VND
  const totalSpent = expenses
    .filter((e) => e.status === "paid" || e.status === "approved")
    .reduce((sum, item) => sum + item.amount, 0);
  const pendingTotal = expenses
    .filter((e) => e.status === "pending")
    .reduce((sum, item) => sum + item.amount, 0);
  const remainingBudget = totalBudget - totalSpent;
  const spentPercentage = Math.round((totalSpent / totalBudget) * 100);

  const pendingList = expenses.filter((e) => e.status === "pending");
  const myExpenses = expenses.filter(
    (e) => e.requesterEmail === user?.email || e.requester === user?.name
  );

  // Dynamic Pie Data based on actual expenses
  const categoryTotals = expenses
    .filter((e) => e.status === "paid" || e.status === "approved")
    .reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.entries(categoryTotals).map(([cat, val]) => ({
    name: categoryLabels[cat] || cat,
    value: val,
    color: categoryColors[cat] || "#94a3b8",
  }));

  // Handle Propose / Add Expense
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAmount || !newReason.trim()) return;

    const newExp: Expense = {
      id: `EXP-00${expenses.length + 1}`,
      title: newTitle.trim(),
      category: newCategory,
      amount: parseFloat(newAmount),
      date: new Date().toLocaleDateString("vi-VN"),
      requester: user?.name || "Thành viên dự án",
      requesterRole: isOwner ? "Chủ dự án" : (user?.role === "admin" ? "Admin" : "DEV"),
      requesterEmail: user?.email || "member@example.com",
      status: isOwner ? "approved" : "pending", // Owner auto-approves their own, member is pending
      sprint: newSprint,
      reason: newReason.trim(),
      reviewedBy: isOwner ? user?.name : undefined,
      reviewedAt: isOwner ? new Date().toLocaleDateString("vi-VN") : undefined,
      reviewNote: isOwner ? "Khoản chi do Chủ dự án trực tiếp tạo" : undefined,
    };

    saveExpenses([newExp, ...expenses]);
    setIsAddExpenseOpen(false);
    setNewTitle("");
    setNewAmount("");
    setNewReason("");
  };

  // Boss Approves Expense
  const handleApproveExpense = (expenseId: string, note?: string) => {
    const updated = expenses.map((item) => {
      if (item.id === expenseId) {
        return {
          ...item,
          status: "approved" as const,
          reviewedBy: user?.name || "Chủ dự án",
          reviewedAt: new Date().toLocaleDateString("vi-VN"),
          reviewNote: note || "Đã phê duyệt chi trả theo đề xuất.",
        };
      }
      return item;
    });
    saveExpenses(updated);
    setReviewingExpense(null);
  };

  // Boss Rejects Expense
  const handleConfirmReject = () => {
    if (!rejectExpenseTarget) return;
    const updated = expenses.map((item) => {
      if (item.id === rejectExpenseTarget.id) {
        return {
          ...item,
          status: "rejected" as const,
          reviewedBy: user?.name || "Chủ dự án",
          reviewedAt: new Date().toLocaleDateString("vi-VN"),
          reviewNote: rejectReason.trim() || "Chưa phù hợp với kế hoạch ngân sách hiện tại.",
        };
      }
      return item;
    });
    saveExpenses(updated);
    setIsRejectOpen(false);
    setRejectExpenseTarget(null);
    setRejectReason("");
    setReviewingExpense(null);
  };

  // Boss Marks as Paid
  const handleMarkAsPaid = (expenseId: string) => {
    const updated = expenses.map((item) => {
      if (item.id === expenseId) {
        return {
          ...item,
          status: "paid" as const,
        };
      }
      return item;
    });
    saveExpenses(updated);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  // Filter Table
  const filteredExpenses = expenses.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || item.status === selectedStatus;
    
    if (activeTab === "pending") {
      return matchesSearch && matchesCategory && item.status === "pending";
    }
    if (activeTab === "my") {
      const isMine = item.requesterEmail === user?.email || item.requester === user?.name;
      return matchesSearch && matchesCategory && matchesStatus && isMine;
    }
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {isOwner ? "Quản trị Ngân sách & Phê duyệt Chi phí" : "Quản lý Chi phí & Đề xuất Ngân sách"}
            </h1>
            <Badge variant={isOwner ? "default" : "secondary"} className="text-xs">
              {isOwner ? "Giao diện Chủ dự án (Sếp)" : "Giao diện Nhân viên"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {isOwner
              ? "Toàn quyền theo dõi ngân sách, phê duyệt hoặc từ chối các yêu cầu chi tiêu từ đội ngũ."
              : "Theo dõi tình hình ngân sách và gửi các đề xuất chi phí phát sinh kèm lý do cho Chủ dự án duyệt."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => setIsAddExpenseOpen(true)} className="gap-1.5 shadow-xs">
            <Plus className="h-4 w-4" />
            {isOwner ? "Thêm khoản chi" : "Đề xuất chi phí"}
          </Button>
        </div>
      </div>

      {/* Role Notice Banner */}
      {!isOwner && (
        <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-950 dark:text-blue-100">
                  Quy trình đề xuất chi phí dành cho Nhân viên
                </p>
                <p className="text-[11px] text-blue-700 dark:text-blue-300">
                  Hãy nhập rõ <strong>lý do đề xuất</strong> và mục đích sử dụng. Chủ dự án (Sếp) sẽ nhận được thông báo để xem xét và <strong>phê duyệt</strong> hoặc <strong>từ chối</strong>.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActiveTab("my")}
              className="text-xs bg-background shrink-0"
            >
              Xem đề xuất của tôi ({myExpenses.length})
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 1. Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Tổng ngân sách cấp</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Cố định theo hợp đồng dự án</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Đã giải ngân / chi tiêu</CardTitle>
            <TrendingUp className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {formatCurrency(totalSpent)}
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>Tiến độ ngân sách</span>
                <span className="font-semibold text-foreground">{spentPercentage}%</span>
              </div>
              <Progress value={spentPercentage} className="h-1.5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {isOwner ? "Chờ Sếp duyệt" : "Đề xuất đang chờ duyệt"}
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {formatCurrency(pendingTotal)}
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-[11px] text-muted-foreground">
                {pendingList.length} đề xuất đang chờ
              </p>
              {isOwner && pendingList.length > 0 && (
                <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-300">
                  Cần xử lý
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Ngân sách còn lại</CardTitle>
            <CreditCard className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(remainingBudget)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Đủ chi trả cho khoảng 2 - 3 Sprints tiếp theo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 2. BOSS SPECIAL SECTION: PENDING EXPENSES FOR APPROVAL */}
      {isOwner && pendingList.length > 0 && (
        <Card className="border-amber-300 dark:border-amber-800 bg-amber-50/20 dark:bg-amber-950/10 shadow-xs">
          <CardHeader className="pb-3 border-b border-amber-200/50 dark:border-amber-900/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
                  <Inbox className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base text-amber-950 dark:text-amber-200 flex items-center gap-2">
                    Yêu cầu chi phí chờ Sếp phê duyệt
                    <Badge className="bg-amber-600 hover:bg-amber-700 text-xs">
                      {pendingList.length} yêu cầu
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-xs text-amber-800/80 dark:text-amber-400/80">
                    Xem lý do đề xuất của nhân viên và quyết định Duyệt chi hoặc Từ chối.
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              {pendingList.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-background space-y-3 shadow-2xs hover:border-amber-400 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className="text-[10px]"
                          style={{
                            borderColor: categoryColors[item.category],
                            color: categoryColors[item.category],
                          }}
                        >
                          {categoryLabels[item.category]}
                        </Badge>
                        <span className="text-[11px] font-mono text-muted-foreground">{item.id}</span>
                        {item.sprint && (
                          <Badge variant="secondary" className="text-[10px]">
                            {item.sprint}
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-semibold text-sm mt-1.5 text-foreground leading-snug">
                        {item.title}
                      </h4>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-bold text-base text-primary">
                        {formatCurrency(item.amount)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">{item.date}</div>
                    </div>
                  </div>

                  {/* Requester info */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 border-t">
                    <User className="h-3.5 w-3.5 text-primary" />
                    <span className="font-medium text-foreground">{item.requester}</span>
                    <Badge variant="outline" className="text-[10px] py-0">
                      {item.requesterRole}
                    </Badge>
                    <span>• {item.requesterEmail}</span>
                  </div>

                  {/* PROPOSAL REASON (Crucial User Requirement) */}
                  <div className="p-2.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 text-xs">
                    <div className="font-semibold text-amber-900 dark:text-amber-300 text-[11px] mb-1 flex items-center gap-1">
                      <FileText className="h-3 w-3 text-amber-600" /> Lý do đề xuất của nhân viên:
                    </div>
                    <p className="text-amber-950/90 dark:text-amber-200/90 italic leading-relaxed text-[11px]">
                      "{item.reason}"
                    </p>
                  </div>

                  {/* Action Buttons for Boss */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setRejectExpenseTarget(item);
                        setIsRejectOpen(true);
                      }}
                      className="text-xs h-8 text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/30"
                    >
                      <X className="h-3.5 w-3.5 mr-1" /> Từ chối
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApproveExpense(item.id)}
                      className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Check className="h-3.5 w-3.5 mr-1" /> Duyệt chi
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 3. Charts Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Sprint Burn Bar Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Chi tiêu thực tế vs Ngân sách theo Sprint</CardTitle>
            <CardDescription className="text-xs">Đơn vị: Triệu VNĐ (Dự toán kế hoạch so với thực chi)</CardDescription>
          </CardHeader>
          <CardContent className="h-[260px] pl-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sprintBurnData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={11} />
                <YAxis axisLine={false} tickLine={false} fontSize={11} />
                <Tooltip
                  formatter={(val: any) => [`${val} Triệu ₫`, ""]}
                  cursor={{ fill: "rgba(0,0,0,0.04)" }}
                />
                <Legend verticalAlign="top" height={32} />
                <Bar name="Ngân sách kế hoạch" dataKey="budget" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar name="Chi phí thực tế" dataKey="actual" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown Donut / Pie Chart */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Cơ cấu danh mục chi phí</CardTitle>
            <CardDescription className="text-xs">Tỷ lệ phân bổ chi phí toàn dự án</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[170px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData.length > 0 ? pieData : [{ name: "Khác", value: 1, color: "#94a3b8" }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [formatCurrency(Number(value)), ""]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 text-[11px]">
              {pieData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="truncate text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Expenses Table with Tabs & Filters */}
      <Card>
        <CardHeader className="border-b pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold">Lịch sử các khoản chi & đề xuất</CardTitle>
                <div className="flex items-center rounded-lg border bg-muted/40 p-0.5 text-xs">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      activeTab === "all"
                        ? "bg-background text-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Tất cả ({expenses.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("pending")}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
                      activeTab === "pending"
                        ? "bg-background text-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Chờ duyệt
                    {pendingList.length > 0 && (
                      <Badge variant="outline" className="text-[10px] px-1 py-0 bg-amber-500/10 text-amber-600 border-amber-300">
                        {pendingList.length}
                      </Badge>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("my")}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      activeTab === "my"
                        ? "bg-background text-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Đề xuất của tôi ({myExpenses.length})
                  </button>
                </div>
              </div>
              <CardDescription className="text-xs mt-1">
                Chi tiết tất cả hóa đơn, dịch vụ và đề xuất chi tiêu phát sinh.
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-56">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Tìm khoản chi, lý do..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 text-xs h-8"
                />
              </div>

              <Select value={selectedCategory} onValueChange={(val) => setSelectedCategory(val || "all")}>
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue placeholder="Danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  <SelectItem value="personnel">Nhân sự & Lương</SelectItem>
                  <SelectItem value="infrastructure">Hạ tầng Cloud</SelectItem>
                  <SelectItem value="licenses">Bản quyền phần mềm</SelectItem>
                  <SelectItem value="hardware">Thiết bị phần cứng</SelectItem>
                  <SelectItem value="other">Khác & Dịch vụ</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={(val) => setSelectedStatus(val || "all")}>
                <SelectTrigger className="w-[130px] h-8 text-xs">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="paid">Đã thanh toán</SelectItem>
                  <SelectItem value="approved">Đã duyệt</SelectItem>
                  <SelectItem value="pending">Chờ duyệt</SelectItem>
                  <SelectItem value="rejected">Bị từ chối</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-64">Khoản chi & Lý do</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Người đề xuất</TableHead>
                <TableHead>Ngày gửi</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
                <TableHead className="text-center">Trạng thái</TableHead>
                <TableHead className="text-right w-28">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-xs">
                    Không tìm thấy khoản chi nào phù hợp với bộ lọc.
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-semibold text-xs text-foreground">{item.title}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">{item.id} • {item.sprint || "N/A"}</div>
                        {/* Reason quote */}
                        <p className="text-[11px] text-muted-foreground/90 line-clamp-1 italic mt-0.5">
                          Lý do: "{item.reason}"
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-[11px]"
                        style={{
                          borderColor: categoryColors[item.category],
                          color: categoryColors[item.category],
                        }}
                      >
                        {categoryLabels[item.category]}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div>
                        <div className="text-xs font-medium">{item.requester}</div>
                        <div className="text-[10px] text-muted-foreground">{item.requesterRole}</div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs text-muted-foreground">{item.date}</span>
                    </TableCell>

                    <TableCell className="text-right font-semibold text-xs">
                      {formatCurrency(item.amount)}
                    </TableCell>

                    <TableCell className="text-center">
                      {item.status === "paid" && (
                        <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-[10px]">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Đã chi
                        </Badge>
                      )}
                      {item.status === "approved" && (
                        <Badge variant="secondary" className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                          <Check className="h-3 w-3 mr-1" /> Đã duyệt
                        </Badge>
                      )}
                      {item.status === "pending" && (
                        <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30 text-[10px]">
                          <Clock className="h-3 w-3 mr-1" /> Chờ Sếp duyệt
                        </Badge>
                      )}
                      {item.status === "rejected" && (
                        <Badge variant="outline" className="text-rose-600 border-rose-300 bg-rose-50 dark:bg-rose-950/30 text-[10px]">
                          <XCircle className="h-3 w-3 mr-1" /> Bị từ chối
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setReviewingExpense(item)}
                          className="h-7 text-xs px-2"
                        >
                          Chi tiết
                        </Button>
                        {isOwner && item.status === "approved" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsPaid(item.id)}
                            className="h-7 text-[10px] px-1.5 text-emerald-600 hover:text-emerald-700"
                            title="Xác nhận đã chuyển khoản/thanh toán"
                          >
                            Đã chi
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* 5. ADD / PROPOSE EXPENSE MODAL                            */}
      {/* ========================================================= */}
      <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">
                  {isOwner ? "Thêm khoản chi mới" : "Gửi đề xuất chi phí cho Sếp"}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  {isOwner
                    ? "Nhập chi tiết khoản chi phí cần giải ngân của dự án."
                    : "Mô tả khoản chi và nêu rõ lý do tại sao dự án cần khoản chi này."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleAddExpense} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs font-semibold">
                Tên khoản chi / Mục đích <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="VD: Thuê máy chủ GPU huấn luyện mô hình AI..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="text-xs h-9"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Danh mục chi phí</Label>
                <Select
                  value={newCategory}
                  onValueChange={(val) => setNewCategory((val as Expense["category"]) || "infrastructure")}
                >
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="infrastructure">Hạ tầng Cloud</SelectItem>
                    <SelectItem value="personnel">Nhân sự & Lương</SelectItem>
                    <SelectItem value="licenses">Bản quyền phần mềm</SelectItem>
                    <SelectItem value="hardware">Thiết bị phần cứng</SelectItem>
                    <SelectItem value="other">Khác & Dịch vụ ngoài</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Sprint áp dụng</Label>
                <Select value={newSprint} onValueChange={(val) => setNewSprint(val || "Sprint 2")}>
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sprint 1">Sprint 1</SelectItem>
                    <SelectItem value="Sprint 2">Sprint 2</SelectItem>
                    <SelectItem value="Sprint 3">Sprint 3</SelectItem>
                    <SelectItem value="General">Toàn dự án</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="amount" className="text-xs font-semibold">
                Số tiền dự kiến (VNĐ) <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="VD: 15000000"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                className="text-xs h-9"
                required
              />
            </div>

            {/* MANDATORY PROPOSAL REASON */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="reason" className="text-xs font-semibold">
                  Lý do đề xuất chi tiết <span className="text-rose-500">*</span>
                </Label>
                <span className="text-[10px] text-muted-foreground">Bắt buộc để Sếp xem xét</span>
              </div>
              <Textarea
                id="reason"
                placeholder="VD: Do lưu lượng tải người dùng tăng 300% trong Sprint này, hệ thống RDS PostgreSQL hiện tại bắt đầu chạm trần CPU (85%). Cần nâng cấp instance và thêm cụm Redis cache để tránh sập hệ thống vào giờ cao điểm..."
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                rows={4}
                className="text-xs leading-relaxed"
                required
              />
            </div>

            <DialogFooter className="pt-2 border-t">
              <Button type="button" variant="outline" onClick={() => setIsAddExpenseOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={!newTitle.trim() || !newAmount || !newReason.trim()}>
                <Send className="h-3.5 w-3.5 mr-1" />
                {isOwner ? "Lưu khoản chi" : "Gửi đề xuất cho Sếp"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* 6. EXPENSE DETAIL & DECISION MODAL (VIEW / APPROVE)       */}
      {/* ========================================================= */}
      <Dialog open={!!reviewingExpense} onOpenChange={(open) => !open && setReviewingExpense(null)}>
        {reviewingExpense && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-base font-bold">Chi tiết khoản chi & Đề xuất</DialogTitle>
                <Badge
                  variant="outline"
                  className="text-xs"
                  style={{
                    borderColor: categoryColors[reviewingExpense.category],
                    color: categoryColors[reviewingExpense.category],
                  }}
                >
                  {categoryLabels[reviewingExpense.category]}
                </Badge>
              </div>
              <DialogDescription className="text-xs">
                Mã định danh: {reviewingExpense.id} • Ngày tạo: {reviewingExpense.date}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              <div>
                <Label className="text-xs text-muted-foreground">Tên khoản chi</Label>
                <div className="text-sm font-semibold mt-0.5 text-foreground">{reviewingExpense.title}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border">
                <div>
                  <Label className="text-[11px] text-muted-foreground">Số tiền yêu cầu</Label>
                  <div className="text-base font-bold text-primary mt-0.5">
                    {formatCurrency(reviewingExpense.amount)}
                  </div>
                </div>
                <div>
                  <Label className="text-[11px] text-muted-foreground">Sprint liên quan</Label>
                  <div className="font-semibold mt-0.5">{reviewingExpense.sprint || "Toàn dự án"}</div>
                </div>
                <div>
                  <Label className="text-[11px] text-muted-foreground">Người đề xuất</Label>
                  <div className="font-semibold mt-0.5">
                    {reviewingExpense.requester} ({reviewingExpense.requesterRole})
                  </div>
                  <div className="text-[10px] text-muted-foreground">{reviewingExpense.requesterEmail}</div>
                </div>
                <div>
                  <Label className="text-[11px] text-muted-foreground">Trạng thái hiện tại</Label>
                  <div className="mt-1">
                    {reviewingExpense.status === "paid" && (
                      <Badge className="bg-emerald-600 text-xs">Đã giải ngân</Badge>
                    )}
                    {reviewingExpense.status === "approved" && (
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">Đã phê duyệt</Badge>
                    )}
                    {reviewingExpense.status === "pending" && (
                      <Badge variant="outline" className="text-xs text-amber-600 border-amber-300 bg-amber-50">Chờ Sếp duyệt</Badge>
                    )}
                    {reviewingExpense.status === "rejected" && (
                      <Badge variant="outline" className="text-xs text-rose-600 border-rose-300 bg-rose-50">Bị từ chối</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-1.5 p-3 rounded-lg border bg-amber-50/40 dark:bg-amber-950/20">
                <Label className="text-xs font-semibold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-amber-600" />
                  Lý do đề xuất của nhân viên:
                </Label>
                <p className="text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap">
                  {reviewingExpense.reason}
                </p>
              </div>

              {/* Review History / Note */}
              {reviewingExpense.reviewedBy && (
                <div className="space-y-1 p-3 rounded-lg border bg-muted/40">
                  <Label className="text-[11px] font-semibold text-muted-foreground">Phản hồi của Sếp:</Label>
                  <p className="text-xs text-foreground font-medium">{reviewingExpense.reviewNote}</p>
                  <p className="text-[10px] text-muted-foreground">
                    Người duyệt: {reviewingExpense.reviewedBy} • Thời gian: {reviewingExpense.reviewedAt}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="border-t pt-3 flex items-center justify-between">
              <Button variant="outline" onClick={() => setReviewingExpense(null)}>
                Đóng
              </Button>

              {/* Boss approval buttons inside detail dialog if pending */}
              {isOwner && reviewingExpense.status === "pending" && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="text-rose-600 border-rose-200 hover:bg-rose-50"
                    onClick={() => {
                      setRejectExpenseTarget(reviewingExpense);
                      setIsRejectOpen(true);
                    }}
                  >
                    <X className="h-3.5 w-3.5 mr-1" /> Từ chối
                  </Button>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => handleApproveExpense(reviewingExpense.id)}
                  >
                    <Check className="h-3.5 w-3.5 mr-1" /> Phê duyệt đề xuất
                  </Button>
                </div>
              )}
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* ========================================================= */}
      {/* 7. REJECT REASON MODAL FOR BOSS                           */}
      {/* ========================================================= */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-300">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-rose-600">
                  Từ chối đề xuất chi phí
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Khoản chi: {rejectExpenseTarget?.title}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="reject-note" className="text-xs font-semibold">
                Lý do từ chối (Nhân viên sẽ nhìn thấy phản hồi này)
              </Label>
              <Textarea
                id="reject-note"
                placeholder="VD: Ngân sách Sprint này đã phân bổ hết cho hạ tầng AWS. Hãy dời kế hoạch sang Sprint sau hoặc tìm gói miễn phí thử nghiệm..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="pt-2 border-t">
            <Button variant="outline" onClick={() => setIsRejectOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleConfirmReject}>
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
