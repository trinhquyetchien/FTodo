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
  Mail, 
  Lock, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Sparkles, 
  CheckCircle2 
} from "lucide-react";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
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
            Chào mừng trở lại
          </span>
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Đăng nhập tài khoản</CardTitle>
        <CardDescription className="text-xs">
          Nhập thông tin xác thực để bắt đầu quản lý dự án Scrum & Tài chính FTodo
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium">Email công việc</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="chien@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 text-sm h-10 rounded-xl bg-slate-50/50 dark:bg-slate-900/50"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-medium">Mật khẩu</Label>
              <a href="#" className="text-xs text-primary hover:underline">
                Quên mật khẩu?
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
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

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary h-3.5 w-3.5"
              />
              <span>Ghi nhớ phiên đăng nhập (30 ngày)</span>
            </label>
          </div>

          <Button 
            type="submit" 
            className="w-full h-10 rounded-xl font-semibold gap-2 shadow-sm text-sm"
            disabled={isLoading}
          >
            {isLoading ? (
              <span>Đang xác thực...</span>
            ) : (
              <>
                <span>Đăng nhập vào FTodo</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {/* Subtle hint for demo */}
        <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50 text-[11px] text-muted-foreground flex items-center gap-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          <span>Tài khoản kiểm thử: <strong className="text-foreground">chien@example.com</strong> • Mật khẩu bất kỳ</span>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col space-y-2 border-t pt-4">
        <div className="text-center text-xs text-muted-foreground">
          Chưa có tài khoản FTodo?{" "}
          <Link href="/register" className="text-primary hover:underline font-semibold">
            Đăng ký tài khoản mới ngay
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
