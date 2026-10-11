"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Briefcase 
} from "lucide-react";

export default function Register() {
  const router = useRouter();
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("developer");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      login(email || "chien@example.com");
      router.push("/");
    }, 400);
  };

  return (
    <Card className="border shadow-lg rounded-2xl bg-card">
      <CardHeader className="space-y-1.5 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1 rounded-md bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            Bắt đầu với FTodo
          </span>
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Tạo tài khoản mới</CardTitle>
        <CardDescription className="text-xs">
          Trải nghiệm hệ thống quản trị dự án Agile/Scrum & Tài chính chiến lược
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-medium">Họ và tên</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="Nguyễn Văn A"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-9 text-sm h-10 rounded-xl bg-slate-50/50 dark:bg-slate-900/50"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium">Email công việc</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="ten.ban@congty.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 text-sm h-10 rounded-xl bg-slate-50/50 dark:bg-slate-900/50"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role" className="text-xs font-medium">Vai trò chuyên môn chính</Label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full pl-9 pr-3 text-sm h-10 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-input focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              >
                <option value="owner">Chủ dự án (Product Owner / PM)</option>
                <option value="scrum_master">Scrum Master / Agile Coach</option>
                <option value="developer">Lập trình viên (Developer)</option>
                <option value="qa">Kiểm thử viên (QA / Tester)</option>
                <option value="executive">Ban Giám đốc / Giám đốc Tài chính</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-medium">Mật khẩu</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Tối thiểu 8 ký tự..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 pr-10 text-sm h-10 rounded-xl bg-slate-50/50 dark:bg-slate-900/50"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="pt-1">
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary h-3.5 w-3.5"
                required
              />
              <span>Tôi đồng ý với Điều khoản dịch vụ và Chính sách bảo mật</span>
            </label>
          </div>

          <Button 
            type="submit" 
            className="w-full h-10 rounded-xl font-semibold gap-2 shadow-sm text-sm"
            disabled={isLoading || !agreeTerms}
          >
            {isLoading ? (
              <span>Đang tạo tài khoản...</span>
            ) : (
              <>
                <span>Đăng ký tài khoản miễn phí</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col space-y-2 border-t pt-4">
        <div className="text-center text-xs text-muted-foreground">
          Đã có tài khoản FTodo?{" "}
          <Link href="/login" className="text-primary hover:underline font-semibold">
            Đăng nhập ngay
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
